import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

export default function Menu() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalCrear, setModalCrear] = useState(false);
    const [filtroCategoria, setFiltroCategoria] = useState('TODOS');
    const [nuevoProducto, setNuevoProducto] = useState({
        nombre: '', descripcion: '', precio: '', categoria: 'PLATO FUERTE', disponible: true
    });

    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    const categorias = ['TODOS', 'PLATO FUERTE', 'ENTRADA', 'BEBIDA', 'POSTRE'];

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        try {
            const response = await axiosClient.get('/productos');
            setProductos(response.data);
        } catch (err) {
            setError('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    const crearProducto = async () => {
        try {
            await axiosClient.post('/productos', {
                ...nuevoProducto,
                precio: parseFloat(nuevoProducto.precio)
            });
            setModalCrear(false);
            setNuevoProducto({
                nombre: '', descripcion: '', precio: '',
                categoria: 'PLATO FUERTE', disponible: true
            });
            cargarProductos();
        } catch (err) {
            setError('Error al crear producto');
        }
    };

    const cambiarDisponibilidad = async (id, disponible) => {
        try {
            await axiosClient.patch(
                `/productos/${id}/disponibilidad?disponible=${!disponible}`
            );
            cargarProductos();
        } catch (err) {
            setError('Error al cambiar disponibilidad');
        }
    };

    const eliminarProducto = async (id) => {
        if (!confirm('¿Seguro que quieres eliminar este producto?')) return;
        try {
            await axiosClient.delete(`/productos/${id}`);
            cargarProductos();
        } catch (err) {
            setError('Error al eliminar producto');
        }
    };

    const productosFiltrados = filtroCategoria === 'TODOS'
        ? productos
        : productos.filter(p => p.categoria === filtroCategoria);

    if (loading) return (
        <div style={styles.loading}>Cargando productos...</div>
    );

    return (
        <div style={styles.container}>

            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>MORA</h1>
                    <p style={styles.subtitle}>Gestión de Menú</p>
                </div>
                <div style={styles.headerRight}>
                    <span style={styles.usuario}>
                        {usuario?.nombre} · {usuario?.rol}
                    </span>
                    <div style={styles.nav}>
                        <button onClick={() => navigate('/mesas')}
                            style={styles.navBtn}>Mesas</button>
                        <button onClick={() => navigate('/pedidos')}
                            style={styles.navBtn}>Pedidos</button>
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

            {/* Filtros por categoría */}
            <div style={styles.filtros}>
                {categorias.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFiltroCategoria(cat)}
                        style={{
                            ...styles.filtroBth,
                            backgroundColor: filtroCategoria === cat
                                ? '#f97316' : '#1e293b',
                            color: filtroCategoria === cat
                                ? 'white' : '#94a3b8',
                        }}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Botón crear — solo ADMIN */}
            {usuario?.rol === 'ADMIN' && (
                <button onClick={() => setModalCrear(true)}
                    style={styles.btnCrear}>
                    + Nuevo Producto
                </button>
            )}

            {/* Grid de productos */}
            <div style={styles.grid}>
                {productosFiltrados.map(producto => (
                    <div key={producto.id} style={{
                        ...styles.card,
                        opacity: producto.disponible ? 1 : 0.5
                    }}>
                        <div style={styles.cardHeader}>
                            <span style={styles.categoria}>
                                {producto.categoria}
                            </span>
                            <span style={{
                                ...styles.badge,
                                backgroundColor: producto.disponible
                                    ? '#166534' : '#7f1d1d',
                                color: producto.disponible
                                    ? '#86efac' : '#fca5a5',
                            }}>
                                {producto.disponible
                                    ? 'Disponible' : 'No disponible'}
                            </span>
                        </div>

                        <h3 style={styles.nombre}>{producto.nombre}</h3>
                        <p style={styles.descripcion}>{producto.descripcion}</p>
                        <p style={styles.precio}>
                            ${producto.precio.toLocaleString()}
                        </p>

                        {usuario?.rol === 'ADMIN' && (
                            <div style={styles.btnGroup}>
                                <button
                                    onClick={() => cambiarDisponibilidad(
                                        producto.id, producto.disponible
                                    )}
                                    style={styles.btnDisponibilidad}>
                                    {producto.disponible
                                        ? 'Desactivar' : 'Activar'}
                                </button>
                                <button
                                    onClick={() => eliminarProducto(producto.id)}
                                    style={styles.btnEliminar}>
                                    Eliminar
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal crear producto */}
            {modalCrear && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>Nuevo Producto</h2>

                        {['nombre', 'descripcion', 'precio'].map(campo => (
                            <div key={campo} style={styles.field}>
                                <label style={styles.label}>
                                    {campo.charAt(0).toUpperCase() + campo.slice(1)}
                                </label>
                                <input
                                    type={campo === 'precio' ? 'number' : 'text'}
                                    value={nuevoProducto[campo]}
                                    onChange={e => setNuevoProducto({
                                        ...nuevoProducto,
                                        [campo]: e.target.value
                                    })}
                                    style={styles.input}
                                />
                            </div>
                        ))}

                        <div style={styles.field}>
                            <label style={styles.label}>Categoría</label>
                            <select
                                value={nuevoProducto.categoria}
                                onChange={e => setNuevoProducto({
                                    ...nuevoProducto,
                                    categoria: e.target.value
                                })}
                                style={styles.input}>
                                {categorias.filter(c => c !== 'TODOS')
                                    .map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                            </select>
                        </div>

                        <div style={styles.modalBtns}>
                            <button onClick={() => setModalCrear(false)}
                                style={styles.btnCancelar}>
                                Cancelar
                            </button>
                            <button onClick={crearProducto}
                                style={styles.btnGuardar}>
                                Crear Producto
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
    nav: {
        display: 'flex',
        gap: '8px',
    },
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
    filtroBth: {
        padding: '8px 16px',
        borderRadius: '20px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px',
    },
    card: {
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoria: {
        color: '#64748b',
        fontSize: '11px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    badge: {
        padding: '3px 8px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 'bold',
    },
    nombre: {
        color: '#f1f5f9',
        margin: 0,
        fontSize: '16px',
    },
    descripcion: {
        color: '#94a3b8',
        margin: 0,
        fontSize: '13px',
        lineHeight: '1.4',
    },
    precio: {
        color: '#f97316',
        fontWeight: 'bold',
        fontSize: '20px',
        margin: 0,
    },
    btnGroup: {
        display: 'flex',
        gap: '8px',
        marginTop: '4px',
    },
    btnDisponibilidad: {
        flex: 1,
        padding: '8px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        cursor: 'pointer',
        fontSize: '12px',
    },
    btnEliminar: {
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid #334155',
        backgroundColor: 'transparent',
        color: '#64748b',
        cursor: 'pointer',
        fontSize: '12px',
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
        maxWidth: '440px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
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
    modalBtns: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        marginTop: '8px',
    },
    btnCancelar: {
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