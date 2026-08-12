import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

export default function Caja() {
    const [pedidos, setPedidos] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalPago, setModalPago] = useState(null);
    const [metodoPago, setMetodoPago] = useState('EFECTIVO');
    const [vista, setVista] = useState('COBRAR');
    // COBRAR = pedidos entregados listos para cobrar
    // HISTORIAL = pagos registrados

    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [pedidosRes, pagosRes] = await Promise.all([
                axiosClient.get('/pedidos/estado/ENTREGADO'),
                axiosClient.get('/pagos')
            ]);
            setPedidos(pedidosRes.data);
            setPagos(pagosRes.data);
        } catch (err) {
            setError('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const registrarPago = async () => {
        try {
            await axiosClient.post('/pagos', {
                pedidoId: modalPago.id,
                metodoPago
            });
            setModalPago(null);
            setMetodoPago('EFECTIVO');
            cargarDatos();
        } catch (err) {
            setError('Error al registrar el pago');
        }
    };

    // Calcula el total vendido hoy
    const totalHoy = pagos
        .filter(p => {
            const fecha = new Date(p.fechaPago);
            const hoy = new Date();
            return fecha.toDateString() === hoy.toDateString();
        })
        .reduce((sum, p) => sum + p.total, 0);

    const totalGeneral = pagos.reduce((sum, p) => sum + p.total, 0);

    const iconoMetodo = {
        EFECTIVO: '💵',
        TARJETA: '💳',
        TRANSFERENCIA: '📱'
    };

    if (loading) return (
        <div style={styles.loading}>Cargando caja...</div>
    );

    return (
        <div style={styles.container}>

            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>MORA</h1>
                    <p style={styles.subtitle}>Caja</p>
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
                        <button onClick={() => navigate('/pedidos')}
                            style={styles.navBtn}>Pedidos</button>
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

            {/* Resumen de ventas */}
            <div style={styles.resumen}>
                <div style={styles.statCard}>
                    <span style={styles.statValor}>
                        ${totalHoy.toLocaleString()}
                    </span>
                    <span style={styles.statLabel}>Ventas hoy</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statValor}>
                        ${totalGeneral.toLocaleString()}
                    </span>
                    <span style={styles.statLabel}>Total general</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statValor}>
                        {pagos.length}
                    </span>
                    <span style={styles.statLabel}>Pagos registrados</span>
                </div>
                <div style={styles.statCard}>
                    <span style={{
                        ...styles.statValor, color: '#f97316'
                    }}>
                        {pedidos.length}
                    </span>
                    <span style={styles.statLabel}>Por cobrar</span>
                </div>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
                <button
                    onClick={() => setVista('COBRAR')}
                    style={{
                        ...styles.tab,
                        borderBottom: vista === 'COBRAR'
                            ? '2px solid #f97316' : '2px solid transparent',
                        color: vista === 'COBRAR' ? '#f97316' : '#94a3b8'
                    }}>
                    Por Cobrar ({pedidos.length})
                </button>
                <button
                    onClick={() => setVista('HISTORIAL')}
                    style={{
                        ...styles.tab,
                        borderBottom: vista === 'HISTORIAL'
                            ? '2px solid #f97316' : '2px solid transparent',
                        color: vista === 'HISTORIAL' ? '#f97316' : '#94a3b8'
                    }}>
                    Historial de Pagos ({pagos.length})
                </button>
            </div>

            {/* Vista Por Cobrar */}
            {vista === 'COBRAR' && (
                <div style={styles.grid}>
                    {pedidos.length === 0 ? (
                        <p style={styles.vacio}>
                            No hay pedidos pendientes de cobro
                        </p>
                    ) : (
                        pedidos.map(pedido => (
                            <div key={pedido.id} style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <span style={styles.pedidoId}>
                                        Pedido #{pedido.id}
                                    </span>
                                    <span style={styles.mesa}>
                                        Mesa {pedido.mesaNumero}
                                    </span>
                                </div>

                                <p style={styles.info}>
                                    👤 {pedido.meseroNombre}
                                </p>

                                {/* Detalles del pedido */}
                                <div style={styles.detalles}>
                                    {pedido.detalles?.map(d => (
                                        <div key={d.id} style={styles.detalle}>
                                            <span style={styles.detalleNombre}>
                                                {d.cantidad}x {d.productoNombre}
                                            </span>
                                            <span style={styles.detalleValor}>
                                                ${d.subtotal?.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Total */}
                                <div style={styles.totalRow}>
                                    <span style={styles.totalLabel}>Total</span>
                                    <span style={styles.totalValor}>
                                        ${pedido.total?.toLocaleString()}
                                    </span>
                                </div>

                                <button
                                    onClick={() => setModalPago(pedido)}
                                    style={styles.btnCobrar}>
                                    💳 Cobrar
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Vista Historial */}
            {vista === 'HISTORIAL' && (
                <div style={styles.historial}>
                    {pagos.length === 0 ? (
                        <p style={styles.vacio}>No hay pagos registrados</p>
                    ) : (
                        [...pagos].reverse().map(pago => (
                            <div key={pago.id} style={styles.pagoItem}>
                                <div style={styles.pagoLeft}>
                                    <span style={styles.pagoIcono}>
                                        {iconoMetodo[pago.metodoPago]}
                                    </span>
                                    <div>
                                        <p style={styles.pagoId}>
                                            Pago #{pago.id} — Pedido #{pago.pedidoId}
                                        </p>
                                        <p style={styles.pagoFecha}>
                                            Mesa {pago.mesaNumero} ·{' '}
                                            {new Date(pago.fechaPago)
                                                .toLocaleString('es-CO', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                        </p>
                                    </div>
                                </div>
                                <div style={styles.pagoRight}>
                                    <span style={styles.pagoMetodo}>
                                        {pago.metodoPago}
                                    </span>
                                    <span style={styles.pagoTotal}>
                                        ${pago.total?.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal de pago */}
            {modalPago && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>
                            Cobrar Pedido #{modalPago.id}
                        </h2>

                        <div style={styles.modalResumen}>
                            <p style={styles.modalMesa}>
                                Mesa {modalPago.mesaNumero}
                            </p>
                            <p style={styles.modalTotal}>
                                ${modalPago.total?.toLocaleString()}
                            </p>
                        </div>

                        {/* Método de pago */}
                        <div style={styles.field}>
                            <label style={styles.label}>
                                Método de pago
                            </label>
                            <div style={styles.metodos}>
                                {['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setMetodoPago(m)}
                                        style={{
                                            ...styles.metodoBtn,
                                            backgroundColor: metodoPago === m
                                                ? '#f97316' : '#0f172a',
                                            color: metodoPago === m
                                                ? 'white' : '#94a3b8',
                                            border: metodoPago === m
                                                ? 'none'
                                                : '1px solid #334155',
                                        }}>
                                        {iconoMetodo[m]} {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={styles.modalBtns}>
                            <button
                                onClick={() => {
                                    setModalPago(null);
                                    setMetodoPago('EFECTIVO');
                                }}
                                style={styles.btnCancelar}>
                                Cancelar
                            </button>
                            <button
                                onClick={registrarPago}
                                style={styles.btnConfirmar}>
                                ✓ Confirmar Pago
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
    resumen: {
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
    },
    statCard: {
        backgroundColor: '#1e293b',
        padding: '20px 28px',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: '140px',
    },
    statValor: {
        color: '#22c55e',
        fontSize: '24px',
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#64748b',
        fontSize: '12px',
    },
    tabs: {
        display: 'flex',
        gap: '24px',
        marginBottom: '24px',
        borderBottom: '1px solid #1e293b',
    },
    tab: {
        padding: '12px 4px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
        color: '#f97316',
        fontWeight: 'bold',
        fontSize: '14px',
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
    },
    detalleNombre: {
        color: '#cbd5e1',
        fontSize: '13px',
    },
    detalleValor: {
        color: '#94a3b8',
        fontSize: '13px',
    },
    totalRow: {
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
        fontSize: '22px',
    },
    btnCobrar: {
        padding: '12px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#166534',
        color: '#4ade80',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
    },
    historial: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    pagoItem: {
        backgroundColor: '#1e293b',
        borderRadius: '10px',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pagoLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    pagoIcono: {
        fontSize: '24px',
    },
    pagoId: {
        color: '#f1f5f9',
        fontSize: '14px',
        margin: 0,
        fontWeight: '500',
    },
    pagoFecha: {
        color: '#64748b',
        fontSize: '12px',
        margin: '2px 0 0 0',
    },
    pagoRight: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '4px',
    },
    pagoMetodo: {
        color: '#94a3b8',
        fontSize: '11px',
        backgroundColor: '#0f172a',
        padding: '2px 8px',
        borderRadius: '10px',
    },
    pagoTotal: {
        color: '#22c55e',
        fontWeight: 'bold',
        fontSize: '16px',
    },
    vacio: {
        color: '#64748b',
        textAlign: 'center',
        padding: '40px',
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
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    modalTitle: {
        color: '#f1f5f9',
        margin: 0,
        fontSize: '20px',
    },
    modalResumen: {
        backgroundColor: '#0f172a',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalMesa: {
        color: '#94a3b8',
        margin: 0,
        fontSize: '14px',
    },
    modalTotal: {
        color: '#f97316',
        fontWeight: 'bold',
        fontSize: '28px',
        margin: 0,
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    label: {
        color: '#cbd5e1',
        fontSize: '14px',
    },
    metodos: {
        display: 'flex',
        gap: '8px',
    },
    metodoBtn: {
        flex: 1,
        padding: '12px 8px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
    },
    modalBtns: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
    },
    btnCancelar: {
        padding: '10px 20px',
        borderRadius: '8px',
        border: '1px solid #334155',
        backgroundColor: 'transparent',
        color: '#94a3b8',
        cursor: 'pointer',
    },
    btnConfirmar: {
        padding: '10px 24px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#166534',
        color: '#4ade80',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
    },
};