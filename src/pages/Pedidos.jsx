import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

export default function Pedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalCrear, setModalCrear] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [nuevoPedido, setNuevoPedido] = useState({
        mesaId: '', meseroId: '', detalles: []
    });
    const [detalleTemp, setDetalleTemp] = useState({
        productoId: '', cantidad: 1, notas: ''
    });

    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    const estados = ['TODOS', 'PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'PAGADO'];

    const colorEstado = {
        PENDIENTE: { bg: '#7c2d12', color: '#fdba74' },
        EN_PREPARACION: { bg: '#1e3a5f', color: '#93c5fd' },
        LISTO: { bg: '#14532d', color: '#86efac' },
        ENTREGADO: { bg: '#1e293b', color: '#94a3b8' },
        PAGADO: { bg: '#166534', color: '#4ade80' },
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [pedidosRes, mesasRes, productosRes] = await Promise.all([
                axiosClient.get('/pedidos'),
                axiosClient.get('/mesas'),
                axiosClient.get('/productos/disponibles')
            ]);
            setPedidos(pedidosRes.data);
            setMesas(mesasRes.data);
            setProductos(productosRes.data);
        } catch (err) {
            setError('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const cambiarEstado = async (id, estado) => {
        try {
            await axiosClient.patch(`/pedidos/${id}/estado?estado=${estado}`);
            cargarDatos();
        } catch (err) {
            setError('Error al cambiar estado');
        }
    };

    const cancelarPedido = async (id) => {
        if (!confirm('¿Seguro que quieres cancelar este pedido?')) return;
        try {
            await axiosClient.delete(`/pedidos/${id}`);
            cargarDatos();
        } catch (err) {
            setError('No se puede cancelar un pedido pagado');
        }
    };

    const agregarDetalle = () => {
        if (!detalleTemp.productoId) return;
        const producto = productos.find(
            p => p.id === parseInt(detalleTemp.productoId)
        );
        setNuevoPedido({
            ...nuevoPedido,
            detalles: [...nuevoPedido.detalles, {
                productoId: parseInt(detalleTemp.productoId),
                cantidad: parseInt(detalleTemp.cantidad),
                notas: detalleTemp.notas,
                nombreProducto: producto?.nombre,
                precio: producto?.precio
            }]
        });
        setDetalleTemp({ productoId: '', cantidad: 1, notas: '' });
    };

    const quitarDetalle = (index) => {
        setNuevoPedido({
            ...nuevoPedido,
            detalles: nuevoPedido.detalles.filter((_, i) => i !== index)
        });
    };

    const crearPedido = async () => {
        if (!nuevoPedido.mesaId || nuevoPedido.detalles.length === 0) {
            setError('Selecciona una mesa y agrega al menos un producto');
            return;
        }
        try {
            await axiosClient.post('/pedidos', {
                mesaId: parseInt(nuevoPedido.mesaId),
                meseroId: usuario.id || 1,
                detalles: nuevoPedido.detalles.map(d => ({
                    productoId: d.productoId,
                    cantidad: d.cantidad,
                    notas: d.notas
                }))
            });
            setModalCrear(false);
            setNuevoPedido({ mesaId: '', meseroId: '', detalles: [] });
            cargarDatos();
        } catch (err) {
            setError('Error al crear el pedido — verifica que la mesa esté libre');
        }
    };

    const siguienteEstado = {
        PENDIENTE: 'EN_PREPARACION',
        EN_PREPARACION: 'LISTO',
        LISTO: 'ENTREGADO',
    };

    const pedidosFiltrados = filtroEstado === 'TODOS'
        ? pedidos
        : pedidos.filter(p => p.estado === filtroEstado);

    const totalPedido = (detalles) =>
        detalles?.reduce((sum, d) => sum + d.subtotal, 0) || 0;

    if (loading) return (
        <div style={styles.loading}>Cargando pedidos...</div>
    );

    return (
        <div style={styles.container}>

            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>MORA</h1>
                    <p style={styles.subtitle}>Gestión de Pedidos</p>
                </div>
                <div style={styles.headerRight}>
                    <span style={styles.usuario}>
                        {usuario?.nombre} · {usuario?.rol}
                    </span>
                    <div style={styles.nav}>
                        <button onClick={() => navigate('/mesas')}
                            style={styles.navBtn}>Mesas</button>
                        <button onClick={() => navigate('/menu')}
                            style={styles.navBtn}>Menú</button>
                        {(usuario?.rol === 'CAJERO' || usuario?.rol === 'ADMIN') &&
                        <button onClick={() => navigate('/caja')}
                            style={styles.navBtn}>Caja</button>}
                        <button onClick={() => navigate('/dashboard')}
                            style={styles.navBtn}>Dashboard</button>
                            {usuario?.rol === 'ADMIN' && (
    <button
        onClick={() => navigate('/usuarios')}
        style={styles.navBtn}
    >
        Usuarios
    </button>
)}
                        <button onClick={logout}
                            style={styles.logoutBtn}>Salir</button>
                    </div>
                </div>
            </div>

            {error && (
                <div style={styles.error}>
                    {error}
                    <button onClick={() => setError('')}
                        style={styles.closeError}>✕</button>
                </div>
            )}

            {/* Filtros */}
            <div style={styles.filtros}>
                {estados.map(estado => (
                    <button
                        key={estado}
                        onClick={() => setFiltroEstado(estado)}
                        style={{
                            ...styles.filtroBtn,
                            backgroundColor: filtroEstado === estado
                                ? '#f97316' : '#1e293b',
                            color: filtroEstado === estado
                                ? 'white' : '#94a3b8',
                        }}>
                        {estado}
                        {estado !== 'TODOS' && (
                            <span style={styles.count}>
                                {pedidos.filter(p => p.estado === estado).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Botón crear */}
            {(usuario?.rol === 'ADMIN' || usuario?.rol === 'MESERO') && (
                <button onClick={() => setModalCrear(true)}
                    style={styles.btnCrear}>
                    + Nuevo Pedido
                </button>
            )}

            {/* Lista de pedidos */}
            <div style={styles.grid}>
                {pedidosFiltrados.map(pedido => (
                    <div key={pedido.id} style={styles.card}>

                        {/* Header del pedido */}
                        <div style={styles.cardHeader}>
                            <div>
                                <span style={styles.pedidoId}>
                                    Pedido #{pedido.id}
                                </span>
                                <span style={styles.mesa}>
                                    · Mesa {pedido.mesaNumero}
                                </span>
                            </div>
                            <span style={{
                                ...styles.badge,
                                backgroundColor: colorEstado[pedido.estado]?.bg,
                                color: colorEstado[pedido.estado]?.color,
                            }}>
                                {pedido.estado.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Mesero y fecha */}
                        <p style={styles.info}>
                            👤 {pedido.meseroNombre} ·{' '}
                            {new Date(pedido.fechaCreacion)
                                .toLocaleTimeString('es-CO', {
                                    hour: '2-digit', minute: '2-digit'
                                })}
                        </p>

                        {/* Detalles */}
                        <div style={styles.detalles}>
                            {pedido.detalles?.map(d => (
                                <div key={d.id} style={styles.detalle}>
                                    <span style={styles.detalleNombre}>
                                        {d.cantidad}x {d.productoNombre}
                                    </span>
                                    <span style={styles.detalleSubtotal}>
                                        ${d.subtotal?.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div style={styles.total}>
                            <span style={styles.totalLabel}>Total</span>
                            <span style={styles.totalValor}>
                                ${pedido.total?.toLocaleString()}
                            </span>
                        </div>

                        {/* Acciones */}
                        <div style={styles.acciones}>
                            {siguienteEstado[pedido.estado] && (
                                <button
                                    onClick={() => cambiarEstado(
                                        pedido.id,
                                        siguienteEstado[pedido.estado]
                                    )}
                                    style={styles.btnAvanzar}>
                                    → {siguienteEstado[pedido.estado]
                                        .replace('_', ' ')}
                                </button>
                            )}
                            {pedido.estado === 'ENTREGADO' && (
                                <button
                                    onClick={() => navigate('/caja')}
                                    style={styles.btnCobrar}>
                                    Cobrar
                                </button>
                            )}
                            {pedido.estado !== 'PAGADO' && (
                                <button
                                    onClick={() => cancelarPedido(pedido.id)}
                                    style={styles.btnCancelar}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {pedidosFiltrados.length === 0 && (
                    <p style={styles.vacio}>
                        No hay pedidos {filtroEstado !== 'TODOS'
                            ? `en estado ${filtroEstado}` : ''}
                    </p>
                )}
            </div>

            {/* Modal crear pedido */}
            {modalCrear && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>Nuevo Pedido</h2>

                        {/* Selección de mesa */}
                        <div style={styles.field}>
                            <label style={styles.label}>Mesa</label>
                            <select
                                value={nuevoPedido.mesaId}
                                onChange={e => setNuevoPedido({
                                    ...nuevoPedido, mesaId: e.target.value
                                })}
                                style={styles.input}>
                                <option value="">Selecciona una mesa</option>
                                {mesas.filter(m => m.estado === 'LIBRE')
                                    .map(m => (
                                        <option key={m.id} value={m.id}>
                                            Mesa {m.numero} — {m.capacidad} personas
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Agregar productos */}
                        <div style={styles.field}>
                            <label style={styles.label}>Agregar producto</label>
                            <select
                                value={detalleTemp.productoId}
                                onChange={e => setDetalleTemp({
                                    ...detalleTemp, productoId: e.target.value
                                })}
                                style={styles.input}>
                                <option value="">Selecciona un producto</option>
                                {productos.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.nombre} — ${p.precio?.toLocaleString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ ...styles.field, flex: 1 }}>
                                <label style={styles.label}>Cantidad</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={detalleTemp.cantidad}
                                    onChange={e => setDetalleTemp({
                                        ...detalleTemp, cantidad: e.target.value
                                    })}
                                    style={styles.input}
                                />
                            </div>
                            <div style={{ ...styles.field, flex: 2 }}>
                                <label style={styles.label}>Notas</label>
                                <input
                                    type="text"
                                    placeholder="sin cebolla..."
                                    value={detalleTemp.notas}
                                    onChange={e => setDetalleTemp({
                                        ...detalleTemp, notas: e.target.value
                                    })}
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        <button onClick={agregarDetalle}
                            style={styles.btnAgregar}>
                            + Agregar al pedido
                        </button>

                        {/* Lista de detalles agregados */}
                        {nuevoPedido.detalles.length > 0 && (
                            <div style={styles.detallesList}>
                                {nuevoPedido.detalles.map((d, i) => (
                                    <div key={i} style={styles.detalleItem}>
                                        <span style={{ color: '#cbd5e1' }}>
                                            {d.cantidad}x {d.nombreProducto}
                                            {d.notas && ` (${d.notas})`}
                                        </span>
                                        <button
                                            onClick={() => quitarDetalle(i)}
                                            style={styles.btnQuitar}>✕</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={styles.modalBtns}>
                            <button
                                onClick={() => {
                                    setModalCrear(false);
                                    setNuevoPedido({
                                        mesaId: '', meseroId: '', detalles: []
                                    });
                                }}
                                style={styles.btnCancelarModal}>
                                Cancelar
                            </button>
                            <button onClick={crearPedido}
                                style={styles.btnGuardar}>
                                Crear Pedido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        padding: '24px',
        fontFamily: 'sans-serif',
    },
    loading: {
        color: 'white',
        textAlign: 'center',
        padding: '40px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
    },
    title: {
        color: '#f97316',
        fontSize: '32px',
        fontWeight: 'bold',
        margin: 0,
        letterSpacing: '3px',
    },
    subtitle: {
        color: '#94a3b8',
        margin: '4px 0 0 0',
        fontSize: '14px',
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
    },
    usuario: {
        color: '#94a3b8',
        fontSize: '14px',
    },
    nav: { display: 'flex', gap: '8px' },
    navBtn: {
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid #334155',
        backgroundColor: 'transparent',
        color: '#cbd5e1',
        cursor: 'pointer',
        fontSize: '14px',
    },
    logoutBtn: {
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#ef4444',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px',
    },
    error: {
        backgroundColor: '#7f1d1d',
        color: '#fca5a5',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    closeError: {
        background: 'none',
        border: 'none',
        color: '#fca5a5',
        cursor: 'pointer',
        fontSize: '16px',
    },
    filtros: {
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap',
    },
    filtroBtn: {
        padding: '8px 14px',
        borderRadius: '20px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    count: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: '10px',
        padding: '1px 6px',
        fontSize: '11px',
    },
    btnCrear: {
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#f97316',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginBottom: '24px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
    },
    card: {
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pedidoId: {
        color: '#f1f5f9',
        fontWeight: 'bold',
        fontSize: '16px',
    },
    mesa: {
        color: '#94a3b8',
        fontSize: '14px',
    },
    badge: {
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 'bold',
    },
    info: {
        color: '#64748b',
        fontSize: '13px',
        margin: 0,
    },
    detalles: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        borderTop: '1px solid #334155',
        paddingTop: '8px',
    },
    detalle: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detalleNombre: {
        color: '#cbd5e1',
        fontSize: '13px',
    },
    detalleSubtotal: {
        color: '#94a3b8',
        fontSize: '13px',
    },
    total: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #334155',
        paddingTop: '8px',
    },
    totalLabel: {
        color: '#94a3b8',
        fontSize: '14px',
    },
    totalValor: {
        color: '#f97316',
        fontWeight: 'bold',
        fontSize: '18px',
    },
    acciones: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
    },
    btnAvanzar: {
        flex: 1,
        padding: '8px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: '#1e3a5f',
        color: '#93c5fd',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold',
    },
    btnCobrar: {
        flex: 1,
        padding: '8px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: '#166534',
        color: '#4ade80',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold',
    },
    btnCancelar: {
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid #334155',
        backgroundColor: 'transparent',
        color: '#64748b',
        cursor: 'pointer',
        fontSize: '12px',
    },
    vacio: {
        color: '#64748b',
        textAlign: 'center',
        padding: '40px',
        gridColumn: '1 / -1',
    },
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        padding: '32px',
        width: '100%',
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        maxHeight: '90vh',
        overflowY: 'auto',
    },
    modalTitle: {
        color: '#f1f5f9',
        margin: 0,
        fontSize: '20px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        color: '#cbd5e1',
        fontSize: '14px',
    },
    input: {
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #334155',
        backgroundColor: '#0f172a',
        color: '#f1f5f9',
        fontSize: '14px',
        outline: 'none',
    },
    btnAgregar: {
        padding: '10px',
        borderRadius: '8px',
        border: '1px dashed #334155',
        backgroundColor: 'transparent',
        color: '#94a3b8',
        cursor: 'pointer',
        fontSize: '14px',
    },
    detallesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        backgroundColor: '#0f172a',
        borderRadius: '8px',
        padding: '12px',
    },
    detalleItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '13px',
    },
    btnQuitar: {
        background: 'none',
        border: 'none',
        color: '#64748b',
        cursor: 'pointer',
        fontSize: '14px',
    },
    modalBtns: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        marginTop: '8px',
    },
    btnCancelarModal: {
        padding: '10px 20px',
        borderRadius: '8px',
        border: '1px solid #334155',
        backgroundColor: 'transparent',
        color: '#94a3b8',
        cursor: 'pointer',
    },
    btnGuardar: {
        padding: '10px 20px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#f97316',
        color: 'white',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
};