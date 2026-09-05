import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import PageTransition from '../components/ui/PageTransition';
import { showToast } from '../components/ui/Toast';
import {
    ClipboardList, Users, ShoppingBag,
    CheckCircle, AlertCircle, RefreshCw
} from 'lucide-react';

export default function Supervisor() {
    const [dashboard, setDashboard] = useState(null);
    const [pedidosNuevos, setPedidosNuevos] = useState([]);
    const [meserosDisponibles, setMeserosDisponibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [asignando, setAsignando] = useState(null);
    const [meseroSeleccionado, setMeseroSeleccionado] = useState({});

    const cargarDatos = useCallback(async () => {
        try {
            const [dashRes, nuevosRes, meserosRes] = await Promise.all([
                axiosClient.get('/supervisor/dashboard'),
                axiosClient.get('/supervisor/pedidos/nuevos'),
                axiosClient.get('/supervisor/meseros/disponibles'),
            ]);
            setDashboard(dashRes.data);
            setPedidosNuevos(nuevosRes.data);
            setMeserosDisponibles(meserosRes.data);
        } catch {
            showToast('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarDatos();
        // Polling cada 15 segundos
        const interval = setInterval(cargarDatos, 15000);
        return () => clearInterval(interval);
    }, [cargarDatos]);

    const asignarMesero = async (pedidoId) => {
        const meseroId = meseroSeleccionado[pedidoId];
        if (!meseroId) {
            showToast('Selecciona un mesero', 'warning');
            return;
        }
        setAsignando(pedidoId);
        try {
            const res = await axiosClient.patch(
                `/supervisor/pedidos/${pedidoId}/asignar/${meseroId}`
            );
            showToast(res.data.mensaje, 'success');
            setMeseroSeleccionado(prev => {
                const nuevo = { ...prev };
                delete nuevo[pedidoId];
                return nuevo;
            });
            cargarDatos();
        } catch {
            showToast('Error al asignar mesero', 'error');
        } finally {
            setAsignando(null);
        }
    };

    const cambiarDisponibilidad = async (meseroId, disponible) => {
        try {
            await axiosClient.patch(
                `/supervisor/meseros/${meseroId}/disponibilidad?disponible=${!disponible}`
            );
            showToast(
                !disponible ? 'Mesero marcado disponible' : 'Mesero marcado no disponible',
                'success'
            );
            cargarDatos();
        } catch {
            showToast('Error al cambiar disponibilidad', 'error');
        }
    };

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
                            <ShoppingBag size={18} color="white" />
                        </div>
                        <div>
                            <p style={{
                                ...styles.kpiValor,
                                color: dashboard?.pedidosSinAsignar > 0
                                    ? 'var(--color-danger)'
                                    : 'var(--color-success)'
                            }}>
                                {dashboard?.pedidosSinAsignar || 0}
                            </p>
                            <p style={styles.kpiLabel}>Sin asignar</p>
                        </div>
                    </Card>
                    <Card style={styles.kpiCard}>
                        <div style={{
                            ...styles.kpiIcon,
                            background: 'var(--gradient-accent)'
                        }}>
                            <Users size={18} color="white" />
                        </div>
                        <div>
                            <p style={{
                                ...styles.kpiValor,
                                color: 'var(--color-success)'
                            }}>
                                {dashboard?.meserosDisponibles || 0}
                            </p>
                            <p style={styles.kpiLabel}>Meseros disponibles</p>
                        </div>
                    </Card>
                    <Card style={styles.kpiCard}>
                        <div style={{
                            ...styles.kpiIcon,
                            background: 'linear-gradient(135deg, #C13383, #E05454)'
                        }}>
                            <ClipboardList size={18} color="white" />
                        </div>
                        <div>
                            <p style={{
                                ...styles.kpiValor,
                                color: 'var(--color-primary-light)'
                            }}>
                                {dashboard?.totalMeseros || 0}
                            </p>
                            <p style={styles.kpiLabel}>Total meseros</p>
                        </div>
                    </Card>
                    <Card style={styles.kpiCard}>
                        <div style={styles.refreshBtn}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={cargarDatos}>
                                <RefreshCw size={14} />
                                Actualizar
                            </Button>
                            <p style={styles.pollingTxt}>
                                Auto cada 15s
                            </p>
                        </div>
                    </Card>
                </div>

                <div style={styles.mainGrid}>

                    {/* Pedidos sin asignar */}
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>
                            <AlertCircle
                                size={16}
                                color="var(--color-danger)" />
                            Pedidos sin asignar
                            {pedidosNuevos.length > 0 && (
                                <span style={styles.badge}>
                                    {pedidosNuevos.length}
                                </span>
                            )}
                        </h2>

                        {pedidosNuevos.length === 0 ? (
                            <Card style={styles.vacioCaard}>
                                <CheckCircle
                                    size={32}
                                    color="var(--color-success)" />
                                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                                    Todos los pedidos están asignados
                                </p>
                            </Card>
                        ) : (
                            <div style={styles.pedidosList}>
                                {pedidosNuevos.map(pedido => (
                                    <Card key={pedido.id} style={styles.pedidoCard}>
                                        <div style={styles.pedidoHeader}>
                                            <span style={styles.pedidoId}>
                                                Pedido #{pedido.id}
                                            </span>
                                            <Badge variant="danger">
                                                Mesa {pedido.mesa}
                                            </Badge>
                                        </div>

                                        <div style={styles.pedidoDetalles}>
                                            {pedido.detalles?.map((d, i) => (
                                                <span key={i}
                                                    style={styles.detalleChip}>
                                                    {d.cantidad}× {d.producto}
                                                </span>
                                            ))}
                                        </div>

                                        <p style={styles.pedidoTotal}>
                                            ${pedido.total?.toLocaleString()}
                                        </p>

                                        {/* Asignar mesero */}
                                        <div style={styles.asignarRow}>
                                            <select
                                                value={meseroSeleccionado[pedido.id] || ''}
                                                onChange={e => setMeseroSeleccionado(prev => ({
                                                    ...prev,
                                                    [pedido.id]: e.target.value
                                                }))}
                                                style={styles.select}>
                                                <option value="">
                                                    Selecciona mesero...
                                                </option>
                                                {meserosDisponibles.map(m => (
                                                    <option key={m.id} value={m.id}>
                                                        {m.nombre} ({m.pedidosActivos} activos)
                                                    </option>
                                                ))}
                                            </select>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                disabled={asignando === pedido.id}
                                                onClick={() => asignarMesero(pedido.id)}>
                                                {asignando === pedido.id
                                                    ? 'Asignando...'
                                                    : 'Asignar'}
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actividad de meseros */}
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>
                            <Users size={16}
                                color="var(--color-primary-light)" />
                            Actividad de meseros
                        </h2>

                        <div style={styles.meserosList}>
                            {dashboard?.actividadMeseros?.map(mesero => (
                                <Card key={mesero.id} style={styles.meseroCard}>
                                    <div style={styles.meseroHeader}>
                                        <div style={styles.meseroAvatar}>
                                            {mesero.nombre.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={styles.meseroInfo}>
                                            <p style={styles.meseroNombre}>
                                                {mesero.nombre}
                                            </p>
                                            <p style={styles.mesesroPedidos}>
                                                {mesero.pedidosActivos} pedidos activos
                                            </p>
                                        </div>
                                        <Badge variant={mesero.disponible
                                            ? 'success' : 'danger'}>
                                            {mesero.disponible
                                                ? 'Disponible'
                                                : 'No disponible'}
                                        </Badge>
                                    </div>

                                    {/* Pedidos del mesero */}
                                    {mesero.pedidos?.length > 0 && (
                                        <div style={styles.mesesroPedidosList}>
                                            {mesero.pedidos.map(p => (
                                                <div key={p.id}
                                                    style={styles.meserosPedidoItem}>
                                                    <span style={styles.meserosPedidoMesa}>
                                                        Mesa {p.mesa}
                                                    </span>
                                                    <Badge variant={
                                                        p.estado === 'PENDIENTE' ? 'warning' :
                                                        p.estado === 'EN_PREPARACION' ? 'info' :
                                                        p.estado === 'LISTO' ? 'primary' :
                                                        'success'
                                                    }>
                                                        {p.estado.replace('_', ' ')}
                                                    </Badge>
                                                    <span style={styles.meserosPedidoTotal}>
                                                        ${p.total?.toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {mesero.pedidos?.length === 0 && (
                                        <p style={styles.sinPedidos}>
                                            Sin pedidos activos
                                        </p>
                                    )}

                                    {/* Toggle disponibilidad */}
                                    <button
                                        onClick={() => cambiarDisponibilidad(
                                            mesero.id, mesero.disponible
                                        )}
                                        style={{
                                            ...styles.toggleBtn,
                                            color: mesero.disponible
                                                ? 'var(--color-danger)'
                                                : 'var(--color-success)',
                                            borderColor: mesero.disponible
                                                ? 'var(--color-danger)30'
                                                : 'var(--color-success)30',
                                        }}>
                                        {mesero.disponible
                                            ? 'Marcar no disponible'
                                            : 'Marcar disponible'}
                                    </button>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
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
    refreshBtn: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        width: '100%',
    },
    pollingTxt: {
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        margin: 0,
    },
    mainGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-6)',
        alignItems: 'start',
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
    },
    sectionTitle: {
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--text-primary)',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
    },
    badge: {
        backgroundColor: 'var(--color-danger)',
        color: 'white',
        borderRadius: 'var(--radius-full)',
        padding: '1px 8px',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-bold)',
    },
    vacioCaard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'var(--space-8)',
        textAlign: 'center',
    },
    pedidosList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
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
    pedidoDetalles: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
    },
    detalleChip: {
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-secondary)',
    },
    pedidoTotal: {
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--font-bold)',
        background: 'var(--gradient-accent)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        margin: 0,
    },
    asignarRow: {
        display: 'flex',
        gap: 'var(--space-2)',
        alignItems: 'center',
    },
    select: {
        flex: 1,
        padding: '9px 12px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
        fontSize: 'var(--text-sm)',
        fontFamily: 'var(--font-sans)',
        outline: 'none',
        cursor: 'pointer',
    },
    meserosList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
    },
    meseroCard: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
    },
    meseroHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
    },
    meseroAvatar: {
        width: '38px',
        height: '38px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--gradient-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'var(--font-bold)',
        fontSize: 'var(--text-base)',
        flexShrink: 0,
    },
    meseroInfo: {
        flex: 1,
    },
    meseroNombre: {
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--text-primary)',
        margin: 0,
    },
    mesesroPedidos: {
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        margin: '2px 0 0 0',
    },
    mesesroPedidosList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: 'var(--space-3)',
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-md)',
    },
    meserosPedidoItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        justifyContent: 'space-between',
    },
    meserosPedidoMesa: {
        fontSize: 'var(--text-xs)',
        color: 'var(--text-secondary)',
        minWidth: '50px',
    },
    meserosPedidoTotal: {
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
    },
    sinPedidos: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-muted)',
        textAlign: 'center',
        padding: 'var(--space-3)',
        margin: 0,
    },
    toggleBtn: {
        padding: '6px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid',
        backgroundColor: 'transparent',
        fontSize: 'var(--text-xs)',
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        width: '100%',
        transition: 'all var(--transition-fast)',
    },
};