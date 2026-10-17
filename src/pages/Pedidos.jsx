import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import { showToast } from '../components/ui/Toast';
import { Plus, ShoppingBag, Clock, ChevronRight } from 'lucide-react';
import Confirm from '../components/ui/Confirm';
import useConfirm from '../hooks/useConfirm';
import PageTransition from '../components/ui/PageTransition';

const estadoConfig = {
    PENDIENTE:      { badge: 'warning', label: 'Pendiente',      siguiente: 'EN_PREPARACION' },
    EN_PREPARACION: { badge: 'info',    label: 'En preparación', siguiente: 'LISTO' },
    LISTO:          { badge: 'primary', label: 'Listo',          siguiente: 'ENTREGADO' },
    ENTREGADO:      { badge: 'success', label: 'Entregado',      siguiente: null },
    PAGADO:         { badge: 'default', label: 'Pagado',         siguiente: null },
};

export default function Pedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('TODOS');
    const [modalCrear, setModalCrear] = useState(false);
    const { confirm, config } = useConfirm();
    const [nuevoPedido, setNuevoPedido] = useState({
        mesaId: '', detalles: []
    });
    const [detalleTemp, setDetalleTemp] = useState({
        productoId: '', cantidad: 1, notas: ''
    });

    const navigate = useNavigate();
    const [usuario] = useState(() =>
        JSON.parse(localStorage.getItem('usuario') || '{}'));

    const estados = ['TODOS', 'PENDIENTE', 'EN_PREPARACION',
        'LISTO', 'ENTREGADO', 'PAGADO'];

    useEffect(() => { cargarDatos(); }, []);
    // Polling para notificar al mesero cuando un pedido esté LISTO
    useEffect(() => {
    const interval = setInterval(async () => {
        try {
            const res = await axiosClient.get('/cocina/pedidos/listos');
            const listos = res.data;
            listos.forEach(p => {
                const key = `notif_${p.id}`;
                if (!localStorage.getItem(key)) {
                    showToast(
                        `🔔 Pedido #${p.id} (Mesa ${p.mesa}) está LISTO`,
                        'success'
                    );
                    localStorage.setItem(key, 'true');
                }
            });
        } catch {
            // silencioso
        }
    }, 15000);
    return () => clearInterval(interval);
}, []);

    const cargarDatos = async () => {
        try {
            const [pedidosRes, mesasRes, productosRes] = await Promise.all([
                axiosClient.get('/pedidos'),
                axiosClient.get('/mesas'),
                axiosClient.get('/productos/disponibles'),
            ]);
            setPedidos(pedidosRes.data);
            setMesas(mesasRes.data);
            setProductos(productosRes.data);
        } catch {
            showToast('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const cambiarEstado = async (id, estado) => {
        try {
            await axiosClient.patch(`/pedidos/${id}/estado?estado=${estado}`);
            showToast(`Pedido actualizado a ${estado.replace('_', ' ')}`, 'success');
            cargarDatos();
        } catch {
            showToast('Error al cambiar estado', 'error');
        }
    };

   const cancelarPedido = async (id) => {
    const ok = await confirm({
        titulo: '¿Cancelar pedido?',
        mensaje: 'El pedido se eliminará y la mesa quedará libre.',
        variante: 'danger'
    });
    if (!ok) return;
    try {
        await axiosClient.delete(`/pedidos/${id}`);
        showToast('Pedido cancelado', 'warning');
        cargarDatos();
    } catch {
        showToast('No se puede cancelar un pedido pagado', 'error');
    }
};

    const agregarDetalle = () => {
        if (!detalleTemp.productoId) {
            showToast('Selecciona un producto', 'warning');
            return;
        }
        const producto = productos.find(
            p => p.id === parseInt(detalleTemp.productoId));
        setNuevoPedido({
            ...nuevoPedido,
            detalles: [...nuevoPedido.detalles, {
                productoId: parseInt(detalleTemp.productoId),
                cantidad: parseInt(detalleTemp.cantidad),
                notas: detalleTemp.notas,
                nombreProducto: producto?.nombre,
                precio: producto?.precio,
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
            showToast('Selecciona una mesa y agrega productos', 'warning');
            return;
        }
        try {
            await axiosClient.post('/pedidos', {
                mesaId: parseInt(nuevoPedido.mesaId),
                meseroId: usuario.id,
                detalles: nuevoPedido.detalles.map(d => ({
                    productoId: d.productoId,
                    cantidad: d.cantidad,
                    notas: d.notas,
                }))
            });
            showToast('Pedido creado correctamente', 'success');
            setModalCrear(false);
            setNuevoPedido({ mesaId: '', detalles: [] });
            cargarDatos();
        } catch {
            showToast('Error — verifica que la mesa esté libre', 'error');
        }
    };

    const pedidosFiltrados = filtro === 'TODOS'
        ? pedidos
        : pedidos.filter(p => p.estado === filtro);

    const conteo = (estado) =>
        pedidos.filter(p => p.estado === estado).length;

    const totalDetalle = (detalles) =>
        detalles?.reduce((s, d) => s + (d.subtotal || 0), 0) || 0;

    const tiempoRelativo = (fecha) => {
        const diff = Date.now() - new Date(fecha).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Ahora';
        if (mins < 60) return `Hace ${mins}m`;
        return `Hace ${Math.floor(mins / 60)}h`;
    };

    if (loading) return (
        <div style={styles.loading}>
            <div style={styles.spinner} />
        </div>
    );


    return (
    <PageTransition>
        <div style={styles.container}>
             {/* Top bar */}
            <div style={styles.topBar}>
                <div style={styles.filtros}>
                    {estados.map(e => (
                        <button
                            key={e}
                            onClick={() => setFiltro(e)}
                            style={{
                                ...styles.filtroBtn,
                                ...(filtro === e ? styles.filtroBtnActive : {})
                            }}>
                            {e === 'TODOS' ? 'Todos' : e.replace('_', ' ')}
                            {e !== 'TODOS' && (
                                <span style={{
                                    ...styles.filtroBadge,
                                    backgroundColor: filtro === e
                                        ? 'rgba(255,255,255,0.2)'
                                        : 'var(--bg-overlay)'
                                }}>
                                    {conteo(e)}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {(usuario?.rol === 'ADMIN' || usuario?.rol === 'MESERO') && (
                    <Button
                        onClick={() => setModalCrear(true)}
                        variant="primary"
                        size="sm">
                        <Plus size={15} />
                        Nuevo Pedido
                    </Button>
                )}
            </div>

            {/* Grid de pedidos */}
            <div style={styles.grid}>
                {pedidosFiltrados.map(pedido => {
                    const cfg = estadoConfig[pedido.estado];
                    return (
                        <Card key={pedido.id} style={styles.pedidoCard}>

                            {/* Header */}
                            <div style={styles.pedidoHeader}>
                                <div style={styles.pedidoIdWrap}>
                                    <ShoppingBag
                                        size={14}
                                        color="var(--color-primary-light)" />
                                    <span style={styles.pedidoId}>
                                        Pedido #{pedido.id}
                                    </span>
                                    <span style={styles.mesaTag}>
                                        Mesa {pedido.mesaNumero}
                                    </span>
                                </div>
                                <Badge variant={cfg.badge}>
                                    {cfg.label}
                                </Badge>
                            </div>

                            {/* Meta */}
                            <div style={styles.pedidoMeta}>
                                <span style={styles.meseroNombre}>
                                    {pedido.meseroNombre}
                                </span>
                                <div style={styles.tiempoWrap}>
                                    <Clock size={12}
                                        color="var(--text-muted)" />
                                    <span style={styles.tiempo}>
                                        {tiempoRelativo(pedido.fechaCreacion)}
                                    </span>
                                </div>
                            </div>

                            {/* Detalles */}
                            <div style={styles.detalles}>
                                {pedido.detalles?.slice(0, 3).map(d => (
                                    <div key={d.id} style={styles.detalleRow}>
                                        <span style={styles.detalleNombre}>
                                            {d.cantidad}× {d.productoNombre}
                                        </span>
                                        <span style={styles.detalleValor}>
                                            ${d.subtotal?.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                                {pedido.detalles?.length > 3 && (
                                    <span style={styles.masItems}>
                                        +{pedido.detalles.length - 3} más
                                    </span>
                                )}
                            </div>

                            {/* Total */}
                            <div style={styles.totalRow}>
                                <span style={styles.totalLabel}>Total</span>
                                <span style={styles.totalValor}>
                                    ${pedido.total?.toLocaleString()}
                                </span>
                            </div>

                            {/* Acciones */}
                            <div style={styles.acciones}>
                                {cfg.siguiente && (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        fullWidth
                                        onClick={() => cambiarEstado(
                                            pedido.id, cfg.siguiente
                                        )}>
                                        {cfg.siguiente.replace('_', ' ')}
                                        <ChevronRight size={14} />
                                    </Button>
                                )}
                                {pedido.estado === 'ENTREGADO' && (
                                    <Button
                                        variant="accent"
                                        size="sm"
                                        fullWidth
                                        onClick={() => navigate('/caja')}>
                                        Ir a Caja
                                    </Button>
                                )}
                                {pedido.estado !== 'PAGADO' && (
                                    <button
                                        onClick={() => cancelarPedido(pedido.id)}
                                        style={styles.cancelarBtn}>
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </Card>
                    );
                })}

                {pedidosFiltrados.length === 0 && (
                    <div style={styles.vacio}>
                        <ShoppingBag size={40}
                            color="var(--text-disabled)" />
                        <p style={{
                            color: 'var(--text-muted)',
                            marginTop: '12px'
                        }}>
                            No hay pedidos
                            {filtro !== 'TODOS'
                                ? ` en estado ${filtro.replace('_', ' ')}`
                                : ''}
                        </p>
                    </div>
                )}
            </div>

            {/* Modal crear pedido */}
            {modalCrear && (
                <Modal
                    title="Nuevo Pedido"
                    onClose={() => {
                        setModalCrear(false);
                        setNuevoPedido({ mesaId: '', detalles: [] });
                    }}
                    footer={
                        <>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setModalCrear(false);
                                    setNuevoPedido({ mesaId: '', detalles: [] });
                                }}>
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                onClick={crearPedido}>
                                Crear Pedido
                            </Button>
                        </>
                    }>

                    {/* Mesa */}
                    <Select
                        label="Mesa"
                        value={nuevoPedido.mesaId}
                        onChange={e => setNuevoPedido({
                            ...nuevoPedido, mesaId: e.target.value
                        })}
                        options={mesas
                            .filter(m => m.estado === 'LIBRE')
                            .map(m => ({
                                value: m.id,
                                label: `Mesa ${m.numero} — ${m.capacidad} personas`
                            }))}
                        placeholder="Selecciona una mesa libre"
                    />

                    {/* Agregar producto */}
                    <div style={styles.agregarWrap}>
                        <Select
                            label="Producto"
                            value={detalleTemp.productoId}
                            onChange={e => setDetalleTemp({
                                ...detalleTemp, productoId: e.target.value
                            })}
                            options={productos.map(p => ({
                                value: p.id,
                                label: `${p.nombre} — $${p.precio?.toLocaleString()}`
                            }))}
                            placeholder="Selecciona un producto"
                        />
                        <div style={styles.cantidadNotas}>
                            <div style={{ flex: '0 0 80px' }}>
                                <label style={styles.miniLabel}>
                                    Cantidad
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={detalleTemp.cantidad}
                                    onChange={e => setDetalleTemp({
                                        ...detalleTemp,
                                        cantidad: e.target.value
                                    })}
                                    style={styles.miniInput}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.miniLabel}>
                                    Notas
                                </label>
                                <input
                                    type="text"
                                    value={detalleTemp.notas}
                                    onChange={e => setDetalleTemp({
                                        ...detalleTemp, notas: e.target.value
                                    })}
                                    placeholder="sin cebolla..."
                                    style={styles.miniInput}
                                />
                            </div>
                        </div>
                        <button
                            onClick={agregarDetalle}
                            style={styles.agregarBtn}>
                            + Agregar al pedido
                        </button>
                    </div>

                    {/* Lista de detalles */}
                    {nuevoPedido.detalles.length > 0 && (
                        <div style={styles.detallesList}>
                            <p style={styles.detallesListTitle}>
                                Productos agregados
                            </p>
                            {nuevoPedido.detalles.map((d, i) => (
                                <div key={i} style={styles.detallesListItem}>
                                    <span style={{
                                        color: 'var(--text-secondary)',
                                        fontSize: 'var(--text-sm)'
                                    }}>
                                        {d.cantidad}× {d.nombreProducto}
                                        {d.notas && (
                                            <span style={{
                                                color: 'var(--text-muted)',
                                                fontSize: 'var(--text-xs)'
                                            }}>
                                                {' '}({d.notas})
                                            </span>
                                        )}
                                    </span>
                                    <button
                                        onClick={() => quitarDetalle(i)}
                                        style={styles.quitarBtn}>
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal>
            )}
        </div>
        {config && <Confirm {...config} />}
    </PageTransition>
);
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '300px',
    },
    spinner: {
        width: '32px',
        height: '32px',
        border: '3px solid var(--border-default)',
        borderTop: '3px solid var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    topBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
    },
    filtros: {
        display: 'flex',
        gap: 'var(--space-2)',
        flexWrap: 'wrap',
    },
    filtroBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '7px 14px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border-default)',
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)',
        fontSize: 'var(--text-sm)',
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
    },
    filtroBtnActive: {
        background: 'var(--gradient-primary)',
        color: 'white',
        border: 'none',
    },
    filtroBadge: {
        padding: '1px 7px',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-semibold)',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'var(--space-4)',
    },
    pedidoCard: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
    },
    pedidoHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pedidoIdWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    pedidoId: {
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--text-primary)',
    },
    mesaTag: {
        fontSize: 'var(--text-xs)',
        color: 'var(--color-primary-light)',
        backgroundColor: 'var(--color-primary-10)',
        padding: '2px 8px',
        borderRadius: 'var(--radius-full)',
    },
    pedidoMeta: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    meseroNombre: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-muted)',
    },
    tiempoWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    tiempo: {
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
    },
    detalles: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: 'var(--space-3)',
    },
    detalleRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detalleNombre: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
    },
    detalleValor: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-muted)',
    },
    masItems: {
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        fontStyle: 'italic',
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: 'var(--space-3)',
    },
    totalLabel: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-muted)',
    },
    totalValor: {
        fontSize: 'var(--text-xl)',
        fontWeight: 'var(--font-bold)',
        background: 'var(--gradient-accent)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    acciones: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
    },
    cancelarBtn: {
        padding: '7px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        backgroundColor: 'transparent',
        color: 'var(--text-muted)',
        fontSize: 'var(--text-sm)',
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        width: '100%',
    },
    vacio: {
        gridColumn: '1 / -1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'var(--space-12)',
    },
    agregarWrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
    },
    cantidadNotas: {
        display: 'flex',
        gap: 'var(--space-3)',
    },
    miniLabel: {
        display: 'block',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-medium)',
        color: 'var(--text-secondary)',
        marginBottom: '6px',
    },
    miniInput: {
        width: '100%',
        padding: '9px 12px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-surface)',
        color: 'var(--text-primary)',
        fontSize: 'var(--text-sm)',
        fontFamily: 'var(--font-sans)',
        outline: 'none',
    },
    agregarBtn: {
        padding: '9px',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--border-strong)',
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)',
        fontSize: 'var(--text-sm)',
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
    },
    detallesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        padding: 'var(--space-3)',
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-md)',
    },
    detallesListTitle: {
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        margin: 0,
        marginBottom: 'var(--space-1)',
    },
    detallesListItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quitarBtn: {
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        fontSize: '14px',
        padding: '2px 6px',
    },
};