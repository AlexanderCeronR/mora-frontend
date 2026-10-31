import { useState, useEffect, useCallback, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import PageTransition from '../components/ui/PageTransition';
import { showToast } from '../components/ui/Toast';
import { ChefHat, Clock, CheckCircle, Bell } from 'lucide-react';

const estadoConfig = {
    PENDIENTE:      { badge: 'warning', label: 'Pendiente',      siguiente: 'EN_PREPARACION', accion: 'Iniciar preparación', borde: 'var(--color-warning)' },
    EN_PREPARACION: { badge: 'info',    label: 'En preparación', siguiente: 'LISTO',          accion: 'Marcar listo',        borde: 'var(--color-info)' },
};

export default function Cocina() {
    const [pedidos, setPedidos] = useState([]);
    const [pedidosListos, setPedidosListos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [avanzando, setAvanzando] = useState(null);

    // IDs de pedidos listos ya conocidos (evita avisos repetidos)
    const conocidos = useRef(null);

    const cargarDatos = useCallback(async () => {
        try {
            const [activosRes, listosRes] = await Promise.all([
                axiosClient.get('/cocina/pedidos'),
                axiosClient.get('/cocina/pedidos/listos'),
            ]);

            const idsListos = listosRes.data.map(p => p.id);

            // La primera carga solo registra; no avisa
            if (conocidos.current !== null) {
                listosRes.data
                    .filter(p => !conocidos.current.has(p.id))
                    .forEach(p => {
                        showToast(
                            `Pedido #${p.id} (Mesa ${p.mesa}) listo para ${p.mesero}`,
                            'success'
                        );
                    });
            }
            conocidos.current = new Set(idsListos);

            setPedidos(activosRes.data);
            setPedidosListos(listosRes.data);
        } catch {
            showToast('Error al cargar pedidos', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarDatos();
        const interval = setInterval(cargarDatos, 10000);
        return () => clearInterval(interval);
    }, [cargarDatos]);

    const avanzarEstado = async (pedidoId, nuevoEstado) => {
        setAvanzando(pedidoId);
        try {
            await axiosClient.patch(
                `/cocina/pedidos/${pedidoId}/estado?estado=${nuevoEstado}`
            );
            showToast(
                nuevoEstado === 'LISTO'
                    ? `Pedido #${pedidoId} listo — notificando al mesero`
                    : `Pedido #${pedidoId} en preparación`,
                'success'
            );
            cargarDatos();
        } catch {
            showToast('Error al cambiar estado', 'error');
        } finally {
            setAvanzando(null);
        }
    };

    const tiempoTranscurrido = (fecha) => {
        const diff = Date.now() - new Date(fecha).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Ahora';
        if (mins < 60) return `${mins}m`;
        return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    };

    const pendientes = pedidos.filter(p => p.estado === 'PENDIENTE').length;
    const enPreparacion = pedidos
        .filter(p => p.estado === 'EN_PREPARACION').length;

    const cola = [...pedidos].sort((a, b) =>
        new Date(a.fechaCreacion) - new Date(b.fechaCreacion));

    if (loading) return (
        <div style={styles.loading}>
            <div style={styles.spinner} />
        </div>
    );

    return (
        <PageTransition>
            <div style={styles.container}>

                {/* KPIs */}
                <div className="grid-2" style={styles.kpiGrid}>
                    <Card style={styles.kpiCard}>
                        <div style={{
                            ...styles.kpiIcon,
                            background: 'var(--gradient-primary)'
                        }}>
                            <ChefHat size={18} color="white" />
                        </div>
                        <div>
                            <p style={{
                                ...styles.kpiValor,
                                color: pendientes > 0
                                    ? 'var(--color-danger)'
                                    : 'var(--color-success)'
                            }}>
                                {pendientes}
                            </p>
                            <p style={styles.kpiLabel}>Pendientes</p>
                        </div>
                    </Card>
                    <Card style={styles.kpiCard}>
                        <div style={{
                            ...styles.kpiIcon,
                            background: 'var(--gradient-accent)'
                        }}>
                            <Clock size={18} color="white" />
                        </div>
                        <div>
                            <p style={{
                                ...styles.kpiValor,
                                color: 'var(--color-info)'
                            }}>
                                {enPreparacion}
                            </p>
                            <p style={styles.kpiLabel}>En preparación</p>
                        </div>
                    </Card>
                    <Card style={styles.kpiCard}>
                        <div style={{
                            ...styles.kpiIcon,
                            background: 'var(--gradient-primary)'
                        }}>
                            <CheckCircle size={18} color="white" />
                        </div>
                        <div>
                            <p style={{
                                ...styles.kpiValor,
                                color: 'var(--color-success)'
                            }}>
                                {pedidosListos.length}
                            </p>
                            <p style={styles.kpiLabel}>Listos</p>
                        </div>
                    </Card>
                    <Card style={styles.kpiCard}>
                        <div style={{
                            ...styles.kpiIcon,
                            background: 'var(--gradient-danger)'
                        }}>
                            <Bell size={18} color="white" />
                        </div>
                        <div>
                            <p style={{
                                ...styles.kpiValor,
                                color: 'var(--text-primary)'
                            }}>
                                {pedidos.length + pedidosListos.length}
                            </p>
                            <p style={styles.kpiLabel}>Total activos</p>
                        </div>
                    </Card>
                </div>

                <div className="grid-2" style={styles.mainGrid}>

                    {/* Cola de cocina */}
                    <div style={styles.seccion}>
                        <h2 style={styles.seccionTitulo}>
                            <ChefHat size={16}
                                color="var(--color-primary-light)" />
                            Cola de cocina
                            {cola.length > 0 && (
                                <span style={styles.contadorBadge}>
                                    {cola.length}
                                </span>
                            )}
                        </h2>

                        {cola.length === 0 ? (
                            <Card style={styles.vacio}>
                                <CheckCircle
                                    size={32}
                                    color="var(--color-success)" />
                                <p style={{
                                    color: 'var(--text-muted)',
                                    marginTop: '8px'
                                }}>
                                    No hay pedidos pendientes
                                </p>
                            </Card>
                        ) : (
                            <div style={styles.pedidosList}>
                                {cola.map(pedido => {
                                    const cfg = estadoConfig[pedido.estado]
                                        || estadoConfig.PENDIENTE;
                                    return (
                                        <Card key={pedido.id} style={{
                                            ...styles.pedidoCard,
                                            borderLeftWidth: '3px',
                                            borderLeftStyle: 'solid',
                                            borderLeftColor: cfg.borde,
                                        }}>
                                            <div style={styles.pedidoHeader}>
                                                <div style={styles.pedidoTitulo}>
                                                    <span style={styles.pedidoId}>
                                                        Pedido #{pedido.id}
                                                    </span>
                                                    <span style={styles.mesaTag}>
                                                        Mesa {pedido.mesa}
                                                    </span>
                                                </div>
                                                <div style={styles.pedidoMeta}>
                                                    <Badge variant={cfg.badge}>
                                                        {cfg.label}
                                                    </Badge>
                                                    <span style={styles.tiempo}>
                                                        <Clock size={12} />
                                                        {tiempoTranscurrido(
                                                            pedido.fechaCreacion)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={styles.productos}>
                                                {pedido.detalles?.map((d, i) => (
                                                    <div key={i}
                                                        style={styles.productoItem}>
                                                        <div style={styles.productoFila}>
                                                            <span style={styles.productoCantidad}>
                                                                {d.cantidad}×
                                                            </span>
                                                            <span style={styles.productoNombre}>
                                                                {d.producto}
                                                            </span>
                                                        </div>
                                                        {d.notas && (
                                                            <span style={styles.productoNota}>
                                                                Nota: {d.notas}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <p style={styles.meseroInfo}>
                                                Mesero: {pedido.mesero}
                                            </p>

                                            <Button
                                                variant={pedido.estado === 'PENDIENTE'
                                                    ? 'primary' : 'accent'}
                                                fullWidth
                                                disabled={avanzando === pedido.id}
                                                onClick={() => avanzarEstado(
                                                    pedido.id, cfg.siguiente)}>
                                                {avanzando === pedido.id
                                                    ? 'Actualizando...'
                                                    : cfg.accion}
                                            </Button>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Listos */}
                    <div style={styles.seccion}>
                        <h2 style={styles.seccionTitulo}>
                            <Bell size={16}
                                color="var(--color-success)" />
                            Listos — esperando mesero
                            {pedidosListos.length > 0 && (
                                <span style={{
                                    ...styles.contadorBadge,
                                    backgroundColor: 'var(--color-success)',
                                }}>
                                    {pedidosListos.length}
                                </span>
                            )}
                        </h2>

                        {pedidosListos.length === 0 ? (
                            <Card style={styles.vacio}>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    No hay pedidos esperando
                                </p>
                            </Card>
                        ) : (
                            <div style={styles.pedidosList}>
                                {pedidosListos.map(pedido => (
                                    <Card key={pedido.id} style={{
                                        ...styles.pedidoCard,
                                        borderLeftWidth: '3px',
                                        borderLeftStyle: 'solid',
                                        borderLeftColor: 'var(--color-success)',
                                    }}>
                                        <div style={styles.pedidoHeader}>
                                            <div style={styles.pedidoTitulo}>
                                                <span style={styles.pedidoId}>
                                                    Pedido #{pedido.id}
                                                </span>
                                                <span style={styles.mesaTag}>
                                                    Mesa {pedido.mesa}
                                                </span>
                                            </div>
                                            <Badge variant="success">
                                                Listo
                                            </Badge>
                                        </div>
                                        <p style={{
                                            ...styles.meseroInfo,
                                            color: 'var(--text-primary)',
                                            fontWeight: 'var(--font-semibold)',
                                        }}>
                                            Para: {pedido.mesero}
                                        </p>
                                        <p style={styles.tiempo}>
                                            <Clock size={12} />
                                            {tiempoTranscurrido(
                                                pedido.fechaCreacion)}
                                        </p>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <p style={styles.pollingInfo}>
                    Actualiza automáticamente cada 10 segundos
                </p>
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
        gridTemplateColumns:
            'repeat(auto-fill, minmax(min(100%, 200px), 1fr))',
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
    mainGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-6)',
        alignItems: 'start',
    },
    seccion: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        minWidth: 0,
    },
    seccionTitulo: {
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--text-primary)',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
    },
    contadorBadge: {
        backgroundColor: 'var(--color-danger)',
        color: 'white',
        borderRadius: 'var(--radius-full)',
        padding: '1px 8px',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-bold)',
    },
    vacio: {
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
        alignItems: 'flex-start',
        gap: 'var(--space-2)',
        flexWrap: 'wrap',
    },
    pedidoTitulo: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        flexWrap: 'wrap',
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
        alignItems: 'center',
        gap: 'var(--space-2)',
        flexShrink: 0,
    },
    tiempo: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        margin: 0,
    },
    productos: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: 'var(--space-3)',
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-md)',
    },
    productoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    productoFila: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    productoCantidad: {
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-bold)',
        color: 'var(--color-primary-light)',
        minWidth: '24px',
    },
    productoNombre: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-primary)',
        fontWeight: 'var(--font-medium)',
    },
    productoNota: {
        fontSize: 'var(--text-xs)',
        color: 'var(--color-warning)',
        fontStyle: 'italic',
        paddingLeft: '32px',
    },
    meseroInfo: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-muted)',
        margin: 0,
    },
    pollingInfo: {
        fontSize: 'var(--text-xs)',
        color: 'var(--text-disabled)',
        textAlign: 'center',
        margin: 0,
    },
};