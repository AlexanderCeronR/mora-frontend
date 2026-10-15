import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { showToast } from '../components/ui/Toast';
import {
    CreditCard, Banknote, Smartphone,
    TrendingUp, Receipt, CheckCircle, Download
} from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';

const metodoConfig = {
    EFECTIVO:      { icon: Banknote,    label: 'Efectivo',      color: 'var(--color-success)' },
    TARJETA:       { icon: CreditCard,  label: 'Tarjeta',       color: 'var(--color-primary-light)' },
    TRANSFERENCIA: { icon: Smartphone,  label: 'Transferencia', color: 'var(--color-accent-light)' },
};

export default function Caja() {
    const [pedidos, setPedidos] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vista, setVista] = useState('COBRAR');
    const [modalPago, setModalPago] = useState(null);
    const [metodoPago, setMetodoPago] = useState('EFECTIVO');
    const [pagandoId, setPagandoId] = useState(null);

    useEffect(() => { cargarDatos(); }, []);

    const cargarDatos = async () => {
        try {
            const [pedidosRes, pagosRes] = await Promise.all([
                axiosClient.get('/pedidos/estado/ENTREGADO'),
                axiosClient.get('/pagos'),
            ]);
            setPedidos(pedidosRes.data);
            setPagos(pagosRes.data);
        } catch {
            showToast('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const registrarPago = async () => {
        if (!modalPago) return;
        setPagandoId(modalPago.id);
        try {
            await axiosClient.post('/pagos', {
                pedidoId: modalPago.id,
                metodoPago,
            });
            showToast('Pago registrado correctamente', 'success');
            setModalPago(null);
            setMetodoPago('EFECTIVO');
            cargarDatos();
        } catch {
            showToast('Error al registrar el pago', 'error');
        } finally {
            setPagandoId(null);
        }
    };

    const descargarFactura = async (pagoId, numeroFactura) => {
        try {
            const response = await axiosClient.get(
                `/facturas/${pagoId}/pdf`,
                { responseType: 'blob' }
            );
            const url = window.URL.createObjectURL(
                new Blob([response.data], { type: 'application/pdf' })
            );
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download',
                `${numeroFactura || 'factura'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            showToast('Factura descargada', 'success');
        } catch {
            showToast('Error al descargar la factura', 'error');
        }
    };

    const totalHoy = pagos
        .filter(p => {
            const fecha = new Date(p.fechaPago);
            const hoy = new Date();
            return fecha.toDateString() === hoy.toDateString();
        })
        .reduce((sum, p) => sum + p.total, 0);

    const totalGeneral = pagos.reduce((sum, p) => sum + p.total, 0);

    const pagosPorMetodo = Object.entries(
        pagos.reduce((acc, p) => {
            acc[p.metodoPago] = (acc[p.metodoPago] || 0) + p.total;
            return acc;
        }, {})
    );

    if (loading) return (
        <div style={styles.loading}>
            <div style={styles.spinner} />
        </div>
    );

    return (
        <PageTransition>
            <div style={styles.container}>

                {/* KPIs */}
                <div style={styles.kpiGrid}>
                    <Card style={styles.kpiCard}>
                        <div style={{
                            ...styles.kpiIcon,
                            background: 'var(--gradient-primary)'
                        }}>
                            <TrendingUp size={18} color="white" />
                        </div>
                        <div>
                            <p style={styles.kpiValor}>
                                ${totalHoy.toLocaleString()}
                            </p>
                            <p style={styles.kpiLabel}>Ventas hoy</p>
                        </div>
                    </Card>
                    <Card style={styles.kpiCard}>
                        <div style={{
                            ...styles.kpiIcon,
                            background: 'var(--gradient-accent)'
                        }}>
                            <Receipt size={18} color="white" />
                        </div>
                        <div>
                            <p style={styles.kpiValor}>
                                ${totalGeneral.toLocaleString()}
                            </p>
                            <p style={styles.kpiLabel}>Total general</p>
                        </div>
                    </Card>
                    <Card style={styles.kpiCard}>
                        <div style={{
                            ...styles.kpiIcon,
                            background: 'linear-gradient(135deg, #C13383, #E05454)'
                        }}>
                            <CheckCircle size={18} color="white" />
                        </div>
                        <div>
                            <p style={styles.kpiValor}>{pagos.length}</p>
                            <p style={styles.kpiLabel}>Pagos registrados</p>
                        </div>
                    </Card>
                    <Card style={styles.kpiCard}>
                        <div style={{
                            ...styles.kpiIcon,
                            background: 'linear-gradient(135deg, #E05454, #f59e0b)'
                        }}>
                            <CreditCard size={18} color="white" />
                        </div>
                        <div>
                            <p style={{
                                ...styles.kpiValor,
                                color: pedidos.length > 0
                                    ? 'var(--color-danger)'
                                    : 'var(--color-success)'
                            }}>
                                {pedidos.length}
                            </p>
                            <p style={styles.kpiLabel}>Por cobrar</p>
                        </div>
                    </Card>
                </div>

                {/* Ventas por método */}
                {pagosPorMetodo.length > 0 && (
                    <div style={styles.metodosRow}>
                        {pagosPorMetodo.map(([metodo, total]) => {
                            const cfg = metodoConfig[metodo] || {};
                            const Icon = cfg.icon || CreditCard;
                            return (
                                <Card key={metodo} style={styles.metodoCard}>
                                    <Icon size={16} color={cfg.color} />
                                    <div>
                                        <p style={{
                                            ...styles.metodoTotal,
                                            color: cfg.color
                                        }}>
                                            ${total.toLocaleString()}
                                        </p>
                                        <p style={styles.metodoLabel}>
                                            {cfg.label || metodo}
                                        </p>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Tabs */}
                <div style={styles.tabs}>
                    {['COBRAR', 'HISTORIAL'].map(t => (
                        <button
                            key={t}
                            onClick={() => setVista(t)}
                            style={{
                                ...styles.tab,
                                ...(vista === t ? styles.tabActive : {})
                            }}>
                            {t === 'COBRAR'
                                ? `Por Cobrar (${pedidos.length})`
                                : `Historial (${pagos.length})`}
                        </button>
                    ))}
                </div>

                {/* Vista Por Cobrar */}
                {vista === 'COBRAR' && (
                    <div style={styles.grid}>
                        {pedidos.length === 0 ? (
                            <div style={styles.vacio}>
                                <CheckCircle
                                    size={40}
                                    color="var(--color-success)" />
                                <p style={{
                                    color: 'var(--text-muted)',
                                    marginTop: '12px'
                                }}>
                                    No hay pedidos pendientes de cobro
                                </p>
                            </div>
                        ) : (
                            pedidos.map(pedido => (
                                <Card key={pedido.id}
                                    style={styles.pedidoCard}>
                                    <div style={styles.pedidoHeader}>
                                        <span style={styles.pedidoId}>
                                            Pedido #{pedido.id}
                                        </span>
                                        <Badge variant="accent">
                                            Mesa {pedido.mesaNumero}
                                        </Badge>
                                    </div>

                                    <p style={styles.meseroNombre}>
                                        👤 {pedido.meseroNombre}
                                    </p>

                                    <div style={styles.detalles}>
                                        {pedido.detalles?.map(d => (
                                            <div key={d.id}
                                                style={styles.detalleRow}>
                                                <span style={styles.detalleNombre}>
                                                    {d.cantidad}× {d.productoNombre}
                                                </span>
                                                <span style={styles.detalleValor}>
                                                    ${d.subtotal?.toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={styles.totalRow}>
                                        <span style={styles.totalLabel}>
                                            Total
                                        </span>
                                        <span style={styles.totalValor}>
                                            ${pedido.total?.toLocaleString()}
                                        </span>
                                    </div>

                                    <Button
                                        variant="accent"
                                        fullWidth
                                        onClick={() => setModalPago(pedido)}>
                                        <CreditCard size={15} />
                                        Cobrar
                                    </Button>
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {/* Vista Historial */}
                {vista === 'HISTORIAL' && (
                    <div style={styles.historial}>
                        {pagos.length === 0 ? (
                            <div style={styles.vacio}>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    No hay pagos registrados
                                </p>
                            </div>
                        ) : (
                            [...pagos].reverse().map(pago => {
                                const cfg = metodoConfig[pago.metodoPago] || {};
                                const Icon = cfg.icon || CreditCard;
                                return (
                                    <Card key={pago.id}
                                        style={styles.pagoItem}>
                                        <div style={styles.pagoLeft}>
                                            <div style={{
                                                ...styles.pagoIconWrap,
                                                backgroundColor:
                                                    (cfg.color || '#888') + '15',
                                            }}>
                                                <Icon
                                                    size={16}
                                                    color={cfg.color || '#888'} />
                                            </div>
                                            <div>
                                                <p style={styles.pagoId}>
                                                    Pago #{pago.id} —
                                                    Pedido #{pago.pedidoId}
                                                </p>
                                                <p style={styles.pagoMeta}>
                                                    Mesa {pago.mesaNumero} ·{' '}
                                                    {new Date(pago.fechaPago)
                                                        .toLocaleString('es-CO', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                </p>
                                                {pago.numeroFactura && (
                                                    <p style={styles.pagoFactura}>
                                                        {pago.numeroFactura}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div style={styles.pagoRight}>
                                            <Badge variant="default">
                                                {cfg.label || pago.metodoPago}
                                            </Badge>
                                            <span style={{
                                                ...styles.pagoTotal,
                                                color: cfg.color ||
                                                    'var(--color-success)'
                                            }}>
                                                ${pago.total?.toLocaleString()}
                                            </span>
                                            <button
                                                onClick={() => descargarFactura(
                                                    pago.id,
                                                    pago.numeroFactura
                                                )}
                                                style={styles.downloadBtn}>
                                                <Download size={12} />
                                                Factura
                                            </button>
                                        </div>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Modal pago */}
                {modalPago && (
                    <Modal
                        title={`Cobrar Pedido #${modalPago.id}`}
                        onClose={() => {
                            setModalPago(null);
                            setMetodoPago('EFECTIVO');
                        }}
                        footer={
                            <>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setModalPago(null);
                                        setMetodoPago('EFECTIVO');
                                    }}>
                                    Cancelar
                                </Button>
                                <Button
                                    variant="accent"
                                    onClick={registrarPago}
                                    disabled={pagandoId === modalPago.id}>
                                    <CheckCircle size={15} />
                                    {pagandoId === modalPago.id
                                        ? 'Procesando...'
                                        : 'Confirmar Pago'}
                                </Button>
                            </>
                        }>

                        <div style={styles.pagoResumen}>
                            <div>
                                <p style={styles.pagoResumenLabel}>
                                    Mesa {modalPago.mesaNumero}
                                </p>
                                <p style={styles.pagoResumenSub}>
                                    Pedido #{modalPago.id}
                                </p>
                            </div>
                            <p style={styles.pagoResumenTotal}>
                                ${modalPago.total?.toLocaleString()}
                            </p>
                        </div>

                        <div>
                            <p style={styles.metodoSelectLabel}>
                                Método de pago
                            </p>
                            <div style={styles.metodosGrid}>
                                {Object.entries(metodoConfig).map(([key, cfg]) => {
                                    const Icon = cfg.icon;
                                    const activo = metodoPago === key;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setMetodoPago(key)}
                                            style={{
                                                ...styles.metodoBtn,
                                                borderColor: activo
                                                    ? cfg.color
                                                    : 'var(--border-default)',
                                                backgroundColor: activo
                                                    ? cfg.color + '15'
                                                    : 'var(--bg-elevated)',
                                                color: activo
                                                    ? cfg.color
                                                    : 'var(--text-secondary)',
                                            }}>
                                            <Icon size={20} />
                                            <span style={{
                                                fontSize: 'var(--text-sm)',
                                                fontWeight: activo
                                                    ? 'var(--font-semibold)'
                                                    : 'var(--font-regular)'
                                            }}>
                                                {cfg.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
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
    kpiGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 'var(--space-4)',
    },
    kpiCard: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
    },
    kpiIcon: {
        width: '44px',
        height: '44px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    kpiValor: {
        fontSize: 'var(--text-2xl)',
        fontWeight: 'var(--font-bold)',
        color: 'var(--color-success)',
        margin: 0,
        lineHeight: 1.1,
    },
    kpiLabel: {
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        margin: '2px 0 0 0',
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
    },
    metodosRow: {
        display: 'flex',
        gap: 'var(--space-4)',
        flexWrap: 'wrap',
    },
    metodoCard: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        flex: 1,
        minWidth: '140px',
    },
    metodoTotal: {
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--font-bold)',
        margin: 0,
        lineHeight: 1,
    },
    metodoLabel: {
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        margin: '2px 0 0 0',
    },
    tabs: {
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
    },
    tab: {
    padding: '10px 20px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-medium)',
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
    marginBottom: '-1px',
    transition: 'all var(--transition-fast)',
},
tabActive: {
    color: 'var(--color-primary-light)',
    borderBottomColor: 'var(--color-primary)',
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
    pedidoId: {
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--text-primary)',
    },
    meseroNombre: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-muted)',
        margin: 0,
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
    },
    detalleNombre: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
    },
    detalleValor: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-muted)',
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
        fontSize: 'var(--text-2xl)',
        fontWeight: 'var(--font-bold)',
        background: 'var(--gradient-accent)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    historial: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
    },
    pagoItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-4)',
    },
    pagoLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
    },
    pagoIconWrap: {
        width: '36px',
        height: '36px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    pagoId: {
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-medium)',
        color: 'var(--text-primary)',
        margin: 0,
    },
    pagoMeta: {
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        margin: '2px 0 0 0',
    },
    pagoFactura: {
        fontSize: 'var(--text-xs)',
        color: 'var(--color-primary-light)',
        margin: '2px 0 0 0',
        fontWeight: 'var(--font-medium)',
    },
    pagoRight: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '4px',
    },
    pagoTotal: {
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--font-bold)',
    },
    vacio: {
        gridColumn: '1 / -1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'var(--space-12)',
    },
    pagoResumen: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
    },
    pagoResumenLabel: {
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--text-primary)',
        margin: 0,
    },
    pagoResumenSub: {
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        margin: '2px 0 0 0',
    },
    pagoResumenTotal: {
        fontSize: 'var(--text-3xl)',
        fontWeight: 'var(--font-bold)',
        background: 'var(--gradient-accent)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        margin: 0,
    },
    metodoSelectLabel: {
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-medium)',
        color: 'var(--text-secondary)',
        marginBottom: 'var(--space-3)',
    },
    metodosGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--space-3)',
    },
    metodoBtn: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        transition: 'all var(--transition-fast)',
    },
    downloadBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-primary)30',
        backgroundColor: 'transparent',
        color: 'var(--color-primary-light)',
        fontSize: 'var(--text-xs)',
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
    },
};