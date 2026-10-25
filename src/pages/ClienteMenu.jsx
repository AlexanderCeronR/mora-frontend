import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { showToast } from '../components/ui/Toast';
import { ShoppingBag, Plus, Minus, CheckCircle, Clock } from 'lucide-react';

const categorias = ['TODOS', 'PLATO FUERTE', 'ENTRADA', 'BEBIDA', 'POSTRE'];

const categoriaEmoji = {
    'PLATO FUERTE': '🍽️',
    'ENTRADA': '🥗',
    'BEBIDA': '🥤',
    'POSTRE': '🍰',
};

const estadoConfig = {
    PENDIENTE:      { label: 'Pendiente',       color: '#f59e0b', emoji: '⏳' },
    EN_PREPARACION: { label: 'En preparación',  color: '#3b82f6', emoji: '👨‍🍳' },
    LISTO:          { label: 'Listo',           color: '#22c55e', emoji: '✅' },
    ENTREGADO:      { label: 'Entregado',       color: '#94a3b8', emoji: '🍽️' },
    PAGADO:         { label: 'Pagado',          color: '#443199', emoji: '💳' },
};

export default function ClienteMenu() {
    const { mesaId } = useParams();
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState({});
    const [filtro, setFiltro] = useState('TODOS');
    const [vista, setVista] = useState('MENU');
    // MENU = ver productos
    // CONFIRMACION = resumen antes de enviar
    // ESTADO = ver estado del pedido
    const [pedidoInfo, setPedidoInfo] = useState(null);
    const [estadoPedido, setEstadoPedido] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        cargarMenu();
        // Si hay token guardado ver estado del pedido
        const token = localStorage.getItem(`mora_token_mesa_${mesaId}`);
        if (token) {
            setVista('ESTADO');
            cargarEstado(token);
        }
    }, [mesaId]);

    // Polling del estado cada 20 segundos
    useEffect(() => {
        if (vista !== 'ESTADO' || !pedidoInfo?.tokenCliente) return;
        const interval = setInterval(() => {
            cargarEstado(pedidoInfo.tokenCliente);
        }, 20000);
        return () => clearInterval(interval);
    }, [vista, pedidoInfo]);

    const cargarMenu = async () => {
        try {
            const res = await axiosClient.get('/publico/menu');
            setProductos(res.data);
        } catch {
            showToast('Error al cargar el menú', 'error');
        } finally {
            setLoading(false);
        }
    };

    const cargarEstado = useCallback(async (token) => {
        try {
            const res = await axiosClient.get(
                `/publico/pedido/${token}/estado`
            );
            setEstadoPedido(res.data);
        } catch {
            showToast('Error al cargar el estado', 'error');
        }
    }, []);

    const agregarAlCarrito = (producto) => {
        setCarrito(prev => ({
            ...prev,
            [producto.id]: {
                ...producto,
                cantidad: (prev[producto.id]?.cantidad || 0) + 1,
            }
        }));
    };

    const quitarDelCarrito = (productoId) => {
        setCarrito(prev => {
            const nuevo = { ...prev };
            if (nuevo[productoId]?.cantidad > 1) {
                nuevo[productoId] = {
                    ...nuevo[productoId],
                    cantidad: nuevo[productoId].cantidad - 1,
                };
            } else {
                delete nuevo[productoId];
            }
            return nuevo;
        });
    };

    const totalCarrito = Object.values(carrito)
        .reduce((sum, p) => sum + (p.precio * p.cantidad), 0);

    const itemsCarrito = Object.values(carrito)
        .reduce((sum, p) => sum + p.cantidad, 0);

    const enviarPedido = async () => {
        setEnviando(true);
        try {
            const detalles = Object.values(carrito).map(p => ({
                productoId: p.id,
                cantidad: p.cantidad,
                notas: '',
            }));

            const res = await axiosClient.post(
                `/publico/mesa/${mesaId}/pedido`,
                detalles
            );

            // Guarda el token en localStorage
            localStorage.setItem(
                `mora_token_mesa_${mesaId}`,
                res.data.tokenCliente
            );

            setPedidoInfo(res.data);
            setCarrito({});
            setVista('ESTADO');
            cargarEstado(res.data.tokenCliente);
            showToast('¡Pedido enviado!', 'success');
        } catch {
            showToast('Error al enviar el pedido', 'error');
        } finally {
            setEnviando(false);
        }
    };

    const productosFiltrados = productos.filter(p =>
        filtro === 'TODOS' || p.categoria === filtro
    );

    if (loading) return (
        <div style={styles.loading}>
            <div style={styles.spinner} />
            <p style={{ color: '#94a3b8', marginTop: '16px' }}>
                Cargando menú...
            </p>
        </div>
    );

    return (
        <div style={styles.page}>

            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLogo}>
                    <div style={styles.logoIcon}>M</div>
                    <div>
                        <p style={styles.logoText}>MORA</p>
                        <p style={styles.mesaText}>Mesa {mesaId}</p>
                    </div>
                </div>
                {vista === 'MENU' && itemsCarrito > 0 && (
                    <button
                        onClick={() => setVista('CONFIRMACION')}
                        style={styles.carritoBtn}>
                        <ShoppingBag size={16} />
                        Ver pedido
                        <span style={styles.carritoBadge}>
                            {itemsCarrito}
                        </span>
                    </button>
                )}
                {vista === 'ESTADO' && (
                    <button
                        onClick={() => {
                            setVista('MENU');
                            setCarrito({});
                        }}
                        style={styles.nuevoBtn}>
                        Nuevo pedido
                    </button>
                )}
            </div>

            {/* Vista MENU */}
            {vista === 'MENU' && (
                <div style={styles.content}>
                    {/* Tabs categorías */}
                    <div style={styles.tabs}>
                        {categorias.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFiltro(cat)}
                                style={{
                                    ...styles.tab,
                                    ...(filtro === cat ? styles.tabActive : {})
                                }}>
                                {cat === 'TODOS' ? 'Todo' : (
                                    `${categoriaEmoji[cat]} ${cat.charAt(0) + cat.slice(1).toLowerCase()}`
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Grid productos */}
                    <div style={styles.grid}>
                        {productosFiltrados.map(producto => {
                            const enCarrito = carrito[producto.id];
                            return (
                                <div key={producto.id} style={styles.productoCard}>
                                    <div style={styles.productoEmoji}>
    {producto.imagenUrl ? (
        <img
            src={producto.imagenUrl}
            alt={producto.nombre}
            style={styles.productoImagen}
        />
    ) : (
        categoriaEmoji[producto.categoria] || '🍴'
    )}
</div>
                                    <div style={styles.productoInfo}>
                                        <p style={styles.productoNombre}>
                                            {producto.nombre}
                                        </p>
                                        {producto.descripcion && (
                                            <p style={styles.productoDesc}>
                                                {producto.descripcion}
                                            </p>
                                        )}
                                        <p style={styles.productoPrecio}>
                                            ${producto.precio?.toLocaleString()}
                                        </p>
                                    </div>
                                    <div style={styles.productoAccion}>
                                        {enCarrito ? (
                                            <div style={styles.cantidadControl}>
                                                <button
                                                    onClick={() => quitarDelCarrito(producto.id)}
                                                    style={styles.cantidadBtn}>
                                                    <Minus size={14} />
                                                </button>
                                                <span style={styles.cantidadNum}>
                                                    {enCarrito.cantidad}
                                                </span>
                                                <button
                                                    onClick={() => agregarAlCarrito(producto)}
                                                    style={styles.cantidadBtn}>
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => agregarAlCarrito(producto)}
                                                style={styles.agregarBtn}>
                                                <Plus size={14} />
                                                Agregar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Barra del carrito */}
                    {itemsCarrito > 0 && (
                        <div style={styles.carritoBar}>
                            <div>
                                <p style={styles.carritoItems}>
                                    {itemsCarrito} producto{itemsCarrito > 1 ? 's' : ''}
                                </p>
                                <p style={styles.carritoTotal}>
                                    ${totalCarrito.toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={() => setVista('CONFIRMACION')}
                                style={styles.carritoConfirmarBtn}>
                                Ver pedido →
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Vista CONFIRMACION */}
            {vista === 'CONFIRMACION' && (
                <div style={styles.content}>
                    <h2 style={styles.seccionTitulo}>Tu pedido</h2>

                    <div style={styles.resumenList}>
                        {Object.values(carrito).map(p => (
                            <div key={p.id} style={styles.resumenItem}>
                                <div style={styles.resumenLeft}>
                                    <span style={styles.resumenEmoji}>
                                        {categoriaEmoji[p.categoria] || '🍴'}
                                    </span>
                                    <div>
                                        <p style={styles.resumenNombre}>
                                            {p.nombre}
                                        </p>
                                        <p style={styles.resumenPrecio}>
                                            ${p.precio?.toLocaleString()} c/u
                                        </p>
                                    </div>
                                </div>
                                <div style={styles.resumenRight}>
                                    <div style={styles.cantidadControl}>
                                        <button
                                            onClick={() => quitarDelCarrito(p.id)}
                                            style={styles.cantidadBtn}>
                                            <Minus size={14} />
                                        </button>
                                        <span style={styles.cantidadNum}>
                                            {p.cantidad}
                                        </span>
                                        <button
                                            onClick={() => agregarAlCarrito(p)}
                                            style={styles.cantidadBtn}>
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <p style={styles.resumenSubtotal}>
                                        ${(p.precio * p.cantidad).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={styles.totalWrap}>
                        <span style={styles.totalLabel}>Total</span>
                        <span style={styles.totalValor}>
                            ${totalCarrito.toLocaleString()}
                        </span>
                    </div>

                    <div style={styles.confirmBtns}>
                        <button
                            onClick={() => setVista('MENU')}
                            style={styles.volverBtn}>
                            ← Seguir eligiendo
                        </button>
                        <button
                            onClick={enviarPedido}
                            disabled={enviando}
                            style={{
                                ...styles.enviarBtn,
                                opacity: enviando ? 0.7 : 1,
                            }}>
                            {enviando ? 'Enviando...' : '✓ Confirmar pedido'}
                        </button>
                    </div>
                </div>
            )}

            {/* Vista ESTADO */}
            {vista === 'ESTADO' && (
                <div style={styles.content}>
                    <div style={styles.estadoWrap}>
                        <div style={styles.estadoEmoji}>
                            {estadoConfig[estadoPedido?.estado]?.emoji || '⏳'}
                        </div>
                        <h2 style={styles.estadoTitulo}>
                            {estadoConfig[estadoPedido?.estado]?.label || 'Cargando...'}
                        </h2>
                        <p style={styles.estadoDesc}>
                            {estadoPedido?.estado === 'PENDIENTE' &&
                                'Tu pedido fue recibido. Un mesero será asignado pronto.'}
                            {estadoPedido?.estado === 'EN_PREPARACION' &&
                                'Tu pedido está siendo preparado en cocina.'}
                            {estadoPedido?.estado === 'LISTO' &&
                                '¡Tu pedido está listo! El mesero lo llevará a tu mesa.'}
                            {estadoPedido?.estado === 'ENTREGADO' &&
                                'Tu pedido fue entregado. ¡Buen provecho!'}
                            {estadoPedido?.estado === 'PAGADO' &&
                                'Tu pedido fue pagado. ¡Gracias por visitarnos!'}
                        </p>

                        {/* Mesero asignado */}
                        {estadoPedido?.mesero && (
                            <div style={styles.meseroAsignado}>
                                <p style={styles.meseroLabel}>Tu mesero</p>
                                <p style={styles.meseroNombre}>
                                    {estadoPedido.mesero}
                                </p>
                            </div>
                        )}

                        {/* Barra de progreso */}
                        <div style={styles.progreso}>
                            {['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO'].map((e, i) => {
                                const estados = ['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'PAGADO'];
                                const indiceActual = estados.indexOf(estadoPedido?.estado);
                                const activo = i <= indiceActual;
                                return (
                                    <div key={e} style={styles.progresoItem}>
                                        <div style={{
                                            ...styles.progresoDot,
                                            backgroundColor: activo
                                                ? 'var(--color-primary)'
                                                : 'var(--bg-overlay)',
                                            border: activo
                                                ? 'none'
                                                : '2px solid var(--border-default)',
                                        }}>
                                            {activo && <CheckCircle size={14} color="white" />}
                                        </div>
                                        <p style={{
                                            ...styles.progresoLabel,
                                            color: activo
                                                ? 'var(--text-primary)'
                                                : 'var(--text-muted)',
                                        }}>
                                            {estadoConfig[e]?.label}
                                        </p>
                                        {i < 3 && (
                                            <div style={{
                                                ...styles.progresoLinea,
                                                backgroundColor: i < indiceActual
                                                    ? 'var(--color-primary)'
                                                    : 'var(--border-default)',
                                            }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Detalles del pedido */}
                        <div style={styles.pedidoResumen}>
                            <p style={styles.pedidoResumenTitulo}>
                                Tu pedido
                            </p>
                            {estadoPedido?.detalles?.map((d, i) => (
                                <div key={i} style={styles.pedidoResumenItem}>
                                    <span style={styles.pedidoResumenNombre}>
                                        {d.cantidad}× {d.producto}
                                    </span>
                                    <span style={styles.pedidoResumenSubtotal}>
                                        ${d.subtotal?.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                            <div style={styles.pedidoResumenTotal}>
                                <span>Total</span>
                                <span style={{ color: '#C13383', fontWeight: 'bold' }}>
                                    ${estadoPedido?.total?.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div style={styles.pollingInfo}>
                            <Clock size={12} color="#64748b" />
                            <span style={styles.pollingTxt}>
                                Actualiza automáticamente cada 20 segundos
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#09090f',
        fontFamily: "'Inter', sans-serif",
        color: '#f0f0ff',
    },
    loading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#09090f',
    },
    spinner: {
        width: '36px',
        height: '36px',
        border: '3px solid #1a1a26',
        borderTop: '3px solid #443199',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        backgroundColor: '#111118',
        borderBottom: '1px solid #1e1e2e',
        position: 'sticky',
        top: 0,
        zIndex: 10,
    },
    headerLogo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    logoIcon: {
        width: '34px',
        height: '34px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #443199, #792CA2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '16px',
    },
    logoText: {
        color: '#f0f0ff',
        fontWeight: 'bold',
        fontSize: '16px',
        letterSpacing: '2px',
        margin: 0,
        lineHeight: 1.2,
    },
    mesaText: {
        color: '#606080',
        fontSize: '12px',
        margin: 0,
    },
    carritoBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        background: 'linear-gradient(135deg, #443199, #792CA2)',
        color: 'white',
        fontSize: '13px',
        fontWeight: '600',
        fontFamily: 'Inter, sans-serif',
        cursor: 'pointer',
        position: 'relative',
    },
    carritoBadge: {
        backgroundColor: '#C13383',
        borderRadius: '50%',
        width: '18px',
        height: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontWeight: 'bold',
    },
    nuevoBtn: {
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid #2a2a3d',
        backgroundColor: 'transparent',
        color: '#a0a0c0',
        fontSize: '13px',
        fontFamily: 'Inter, sans-serif',
        cursor: 'pointer',
    },
    content: {
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto',
        paddingBottom: '100px',
    },
    tabs: {
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '16px',
        scrollbarWidth: 'none',
    },
    tab: {
        padding: '7px 14px',
        borderRadius: '20px',
        border: '1px solid #2a2a3d',
        backgroundColor: 'transparent',
        color: '#a0a0c0',
        fontSize: '13px',
        fontFamily: 'Inter, sans-serif',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
    },
    tabActive: {
        background: 'linear-gradient(135deg, #443199, #792CA2)',
        color: 'white',
        border: 'none',
    },
    grid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    productoCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px',
        backgroundColor: '#111118',
        borderRadius: '12px',
        border: '1px solid #1e1e2e',
    },
    productoEmoji: {
        fontSize: '28px',
        flexShrink: 0,
    },
    productoInfo: {
        flex: 1,
    },
    productoNombre: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#f0f0ff',
        margin: '0 0 2px 0',
    },
    productoDesc: {
        fontSize: '12px',
        color: '#606080',
        margin: '0 0 4px 0',
        lineHeight: 1.4,
    },
    productoPrecio: {
        fontSize: '15px',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #792CA2, #C13383)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        margin: 0,
    },
    productoAccion: {
        flexShrink: 0,
    },
    agregarBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '7px 12px',
        borderRadius: '8px',
        border: 'none',
        background: 'linear-gradient(135deg, #443199, #792CA2)',
        color: 'white',
        fontSize: '13px',
        fontWeight: '600',
        fontFamily: 'Inter, sans-serif',
        cursor: 'pointer',
    },
    cantidadControl: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#1a1a26',
        borderRadius: '8px',
        padding: '4px',
    },
    cantidadBtn: {
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        border: 'none',
        background: 'linear-gradient(135deg, #443199, #792CA2)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    cantidadNum: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#f0f0ff',
        minWidth: '20px',
        textAlign: 'center',
    },
    carritoBar: {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 40px)',
        maxWidth: '560px',
        backgroundColor: '#1a1a26',
        border: '1px solid #2a2a3d',
        borderRadius: '14px',
        padding: '14px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        zIndex: 50,
    },
    carritoItems: {
        fontSize: '13px',
        color: '#a0a0c0',
        margin: 0,
    },
    carritoTotal: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#f0f0ff',
        margin: 0,
    },
    carritoConfirmarBtn: {
        padding: '10px 20px',
        borderRadius: '10px',
        border: 'none',
        background: 'linear-gradient(135deg, #443199, #792CA2)',
        color: 'white',
        fontSize: '14px',
        fontWeight: '600',
        fontFamily: 'Inter, sans-serif',
        cursor: 'pointer',
    },
    seccionTitulo: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#f0f0ff',
        margin: '0 0 20px 0',
    },
    resumenList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '20px',
    },
    resumenItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px',
        backgroundColor: '#111118',
        borderRadius: '12px',
        border: '1px solid #1e1e2e',
        gap: '12px',
    },
    resumenLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flex: 1,
    },
    resumenEmoji: {
        fontSize: '24px',
        flexShrink: 0,
    },
    resumenNombre: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#f0f0ff',
        margin: 0,
    },
    resumenPrecio: {
        fontSize: '12px',
        color: '#606080',
        margin: '2px 0 0 0',
    },
    resumenRight: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '6px',
    },
    resumenSubtotal: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#C13383',
        margin: 0,
    },
    totalWrap: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: '#111118',
        borderRadius: '12px',
        border: '1px solid #2a2a3d',
        marginBottom: '20px',
    },
    totalLabel: {
        fontSize: '16px',
        color: '#a0a0c0',
    },
    totalValor: {
        fontSize: '24px',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #792CA2, #C13383)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    confirmBtns: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    volverBtn: {
        padding: '12px',
        borderRadius: '10px',
        border: '1px solid #2a2a3d',
        backgroundColor: 'transparent',
        color: '#a0a0c0',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        cursor: 'pointer',
    },
    enviarBtn: {
        padding: '14px',
        borderRadius: '10px',
        border: 'none',
        background: 'linear-gradient(135deg, #443199, #792CA2, #C13383)',
        color: 'white',
        fontSize: '15px',
        fontWeight: '700',
        fontFamily: 'Inter, sans-serif',
        cursor: 'pointer',
    },
    estadoWrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        paddingTop: '20px',
        textAlign: 'center',
    },
    estadoEmoji: {
        fontSize: '64px',
    },
    estadoTitulo: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#f0f0ff',
        margin: 0,
    },
    estadoDesc: {
        fontSize: '14px',
        color: '#a0a0c0',
        lineHeight: 1.6,
        maxWidth: '280px',
        margin: 0,
    },
    meseroAsignado: {
        padding: '12px 24px',
        backgroundColor: '#1a1a26',
        borderRadius: '12px',
        border: '1px solid #2a2a3d',
        textAlign: 'center',
    },
    meseroLabel: {
        fontSize: '11px',
        color: '#606080',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        margin: '0 0 4px 0',
    },
    meseroNombre: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#f0f0ff',
        margin: 0,
    },
    progreso: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0',
        width: '100%',
        justifyContent: 'center',
    },
    progresoItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        position: 'relative',
        flex: 1,
    },
    progresoDot: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    progresoLinea: {
        position: 'absolute',
        top: '14px',
        left: '50%',
        width: '100%',
        height: '2px',
        zIndex: 0,
    },
    progresoLabel: {
        fontSize: '10px',
        textAlign: 'center',
        lineHeight: 1.3,
    },
    pedidoResumen: {
        width: '100%',
        backgroundColor: '#111118',
        borderRadius: '12px',
        border: '1px solid #1e1e2e',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    pedidoResumenTitulo: {
        fontSize: '13px',
        color: '#606080',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        margin: '0 0 4px 0',
    },
    pedidoResumenItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pedidoResumenNombre: {
        fontSize: '13px',
        color: '#a0a0c0',
    },
    pedidoResumenSubtotal: {
        fontSize: '13px',
        color: '#606080',
    },
    pedidoResumenTotal: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #1e1e2e',
        paddingTop: '8px',
        marginTop: '4px',
        fontSize: '15px',
        fontWeight: '600',
        color: '#a0a0c0',
    },
    pollingInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    pollingTxt: {
        fontSize: '11px',
        color: '#404060',
    },
    productoImagen: {
    width: '64px',
    height: '64px',
    borderRadius: '10px',
    objectFit: 'cover',
},
};