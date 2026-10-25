import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { showToast } from '../components/ui/Toast';
import {
    Plus, Search, UtensilsCrossed, ImagePlus,
    Salad, GlassWater, CakeSlice, Utensils
} from 'lucide-react';
import Confirm from '../components/ui/Confirm';
import useConfirm from '../hooks/useConfirm';
import PageTransition from '../components/ui/PageTransition';

const categorias = ['PLATO FUERTE', 'ENTRADA', 'BEBIDA', 'POSTRE'];

const categoriaConfig = {
    'PLATO FUERTE': { icon: UtensilsCrossed, badge: 'primary' },
    'ENTRADA':      { icon: Salad,            badge: 'accent' },
    'BEBIDA':       { icon: GlassWater,       badge: 'info' },
    'POSTRE':       { icon: CakeSlice,        badge: 'warning' },
};

export default function Menu() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroCategoria, setFiltroCategoria] = useState('TODOS');
    const [busqueda, setBusqueda] = useState('');
    const [modalCrear, setModalCrear] = useState(false);
    const { confirm, config } = useConfirm();
    const [nuevoProducto, setNuevoProducto] = useState({
        nombre: '', descripcion: '', precio: '',
        categoria: 'PLATO FUERTE', disponible: true
    });
    const [usuario] = useState(() =>
        JSON.parse(localStorage.getItem('usuario') || '{}'));

    useEffect(() => { cargarProductos(); }, []);

    const cargarProductos = async () => {
        try {
            const res = await axiosClient.get('/productos');
            setProductos(res.data);
        } catch {
            showToast('Error al cargar productos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const crearProducto = async () => {
        if (!nuevoProducto.nombre || !nuevoProducto.precio) {
            showToast('Nombre y precio son obligatorios', 'warning');
            return;
        }
        try {
            await axiosClient.post('/productos', {
                ...nuevoProducto,
                precio: parseFloat(nuevoProducto.precio)
            });
            showToast('Producto creado correctamente', 'success');
            setModalCrear(false);
            setNuevoProducto({
                nombre: '', descripcion: '', precio: '',
                categoria: 'PLATO FUERTE', disponible: true
            });
            cargarProductos();
        } catch {
            showToast('Error al crear producto', 'error');
        }
    };

    const subirImagen = async (productoId, file) => {
        const formData = new FormData();
        formData.append('imagen', file);
        try {
            const res = await axiosClient.post(
                `/productos/${productoId}/imagen`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            showToast('Imagen subida correctamente', 'success');
            cargarProductos();
            return res.data.imagenUrl;
        } catch {
            showToast('Error al subir la imagen', 'error');
        }
    };

    const cambiarDisponibilidad = async (id, disponible) => {
        try {
            await axiosClient.patch(
                `/productos/${id}/disponibilidad?disponible=${!disponible}`
            );
            showToast(
                !disponible ? 'Producto activado' : 'Producto desactivado',
                !disponible ? 'success' : 'warning'
            );
            cargarProductos();
        } catch {
            showToast('Error al cambiar disponibilidad', 'error');
        }
    };

    const eliminarProducto = async (id) => {
        const ok = await confirm({
            titulo: '¿Eliminar producto?',
            mensaje: 'Esta acción no se puede deshacer.',
            variante: 'danger'
        });
        if (!ok) return;
        try {
            await axiosClient.delete(`/productos/${id}`);
            showToast('Producto eliminado', 'success');
            cargarProductos();
        } catch {
            showToast('Error al eliminar producto', 'error');
        }
    };

    const productosFiltrados = productos
        .filter(p => filtroCategoria === 'TODOS' ||
            p.categoria === filtroCategoria)
        .filter(p => p.nombre.toLowerCase()
            .includes(busqueda.toLowerCase()));

    const conteoCategoria = (cat) =>
        productos.filter(p => p.categoria === cat).length;

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
                    <div style={styles.searchWrap}>
                        <Search
                            size={16}
                            color="var(--text-muted)"
                            style={styles.searchIcon} />
                        <input
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                            placeholder="Buscar producto..."
                            style={styles.searchInput}
                            onFocus={e => {
                                e.target.style.borderColor = 'var(--color-primary)';
                            }}
                            onBlur={e => {
                                e.target.style.borderColor = 'var(--border-default)';
                            }}
                        />
                    </div>

                    {usuario?.rol === 'ADMIN' && (
                        <Button
                            onClick={() => setModalCrear(true)}
                            variant="primary"
                            size="sm">
                            <Plus size={15} />
                            Nuevo Producto
                        </Button>
                    )}
                </div>

                {/* Tabs de categorías */}
                <div style={styles.tabs}>
                    <button
                        onClick={() => setFiltroCategoria('TODOS')}
                        style={{
                            ...styles.tab,
                            ...(filtroCategoria === 'TODOS'
                                ? styles.tabActive : {})
                        }}>
                        Todos
                        <span style={styles.tabCount}>
                            {productos.length}
                        </span>
                    </button>
                    {categorias.map(cat => {
                        const cfg = categoriaConfig[cat];
                        const Icon = cfg.icon;
                        return (
                            <button
                                key={cat}
                                onClick={() => setFiltroCategoria(cat)}
                                style={{
                                    ...styles.tab,
                                    ...(filtroCategoria === cat
                                        ? styles.tabActive : {})
                                }}>
                                <Icon size={15} />
                                {cat.charAt(0) + cat.slice(1).toLowerCase()}
                                <span style={styles.tabCount}>
                                    {conteoCategoria(cat)}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Grid de productos */}
                <div style={styles.grid}>
                    {productosFiltrados.map(producto => {
                        const cfg = categoriaConfig[producto.categoria] || {};
                        const CatIcon = cfg.icon || Utensils;
                        return (
                            <Card
                                key={producto.id}
                                style={{
                                    ...styles.productoCard,
                                    opacity: producto.disponible ? 1 : 0.55,
                                }}>

                                {/* Imagen o ícono */}
                                <div style={styles.productoEmoji}>
                                    {producto.imagenUrl ? (
                                        <img
                                            src={producto.imagenUrl}
                                            alt={producto.nombre}
                                            style={styles.productoImagen}
                                        />
                                    ) : (
                                        <div style={styles.iconoPlaceholder}>
                                            <CatIcon
                                                size={28}
                                                color="var(--color-primary-light)" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div style={styles.productoInfo}>
                                    <div style={styles.productoHeader}>
                                        <h3 style={styles.productoNombre}>
                                            {producto.nombre}
                                        </h3>
                                        <Badge variant={producto.disponible
                                            ? 'success' : 'danger'}>
                                            {producto.disponible
                                                ? 'Disponible'
                                                : 'No disponible'}
                                        </Badge>
                                    </div>

                                    {producto.descripcion && (
                                        <p style={styles.productoDesc}>
                                            {producto.descripcion}
                                        </p>
                                    )}

                                    <div style={styles.productoFooter}>
                                        <Badge variant={cfg.badge || 'default'}>
                                            {producto.categoria}
                                        </Badge>
                                        <span style={styles.productoPrecio}>
                                            ${producto.precio?.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Acciones admin */}
                                {usuario?.rol === 'ADMIN' && (
                                    <div style={styles.productoAcciones}>
                                        <label
                                            style={styles.imagenBtn}
                                            title="Subir imagen">
                                            <ImagePlus size={14} />
                                            Imagen
                                            <input
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={e => {
                                                    if (e.target.files[0]) {
                                                        subirImagen(
                                                            producto.id,
                                                            e.target.files[0]
                                                        );
                                                    }
                                                }}
                                            />
                                        </label>
                                        <button
                                            onClick={() => cambiarDisponibilidad(
                                                producto.id, producto.disponible
                                            )}
                                            style={{
                                                ...styles.accionBtn,
                                                color: producto.disponible
                                                    ? 'var(--color-warning)'
                                                    : 'var(--color-success)',
                                                borderColor: producto.disponible
                                                    ? 'var(--color-warning)30'
                                                    : 'var(--color-success)30',
                                            }}>
                                            {producto.disponible
                                                ? 'Desactivar' : 'Activar'}
                                        </button>
                                        <button
                                            onClick={() =>
                                                eliminarProducto(producto.id)}
                                            style={{
                                                ...styles.accionBtn,
                                                color: 'var(--text-muted)',
                                                borderColor: 'var(--border-default)',
                                            }}>
                                            Eliminar
                                        </button>
                                    </div>
                                )}
                            </Card>
                        );
                    })}

                    {productosFiltrados.length === 0 && (
                        <div style={styles.vacio}>
                            <UtensilsCrossed
                                size={40}
                                color="var(--text-disabled)" />
                            <p style={{
                                color: 'var(--text-muted)',
                                marginTop: '12px'
                            }}>
                                No hay productos
                                {busqueda ? ` con "${busqueda}"` : ''}
                            </p>
                        </div>
                    )}
                </div>

                {/* Modal crear */}
                {modalCrear && (
                    <Modal
                        title="Nuevo Producto"
                        onClose={() => setModalCrear(false)}
                        footer={
                            <>
                                <Button
                                    variant="ghost"
                                    onClick={() => setModalCrear(false)}>
                                    Cancelar
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={crearProducto}>
                                    Crear Producto
                                </Button>
                            </>
                        }>
                        <Input
                            label="Nombre"
                            value={nuevoProducto.nombre}
                            onChange={e => setNuevoProducto({
                                ...nuevoProducto, nombre: e.target.value
                            })}
                            placeholder="Ej: Hamburguesa Clásica"
                        />
                        <Input
                            label="Descripción"
                            value={nuevoProducto.descripcion}
                            onChange={e => setNuevoProducto({
                                ...nuevoProducto, descripcion: e.target.value
                            })}
                            placeholder="Ingredientes o descripción..."
                        />
                        <Input
                            label="Precio"
                            type="number"
                            value={nuevoProducto.precio}
                            onChange={e => setNuevoProducto({
                                ...nuevoProducto, precio: e.target.value
                            })}
                            placeholder="Ej: 25000"
                        />
                        <Select
                            label="Categoría"
                            value={nuevoProducto.categoria}
                            onChange={e => setNuevoProducto({
                                ...nuevoProducto, categoria: e.target.value
                            })}
                            options={categorias.map(c => ({
                                value: c, label: c
                            }))}
                        />
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
        gap: 'var(--space-3)',
        flexWrap: 'wrap',
    },
    searchWrap: {
        position: 'relative',
        flex: 1,
        maxWidth: '320px',
    },
    searchIcon: {
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
    },
    searchInput: {
        width: '100%',
        padding: '9px 14px 9px 36px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
        fontSize: 'var(--text-sm)',
        fontFamily: 'var(--font-sans)',
        outline: 'none',
        transition: 'border-color var(--transition-fast)',
    },
    tabs: {
        display: 'flex',
        gap: 'var(--space-1)',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '0',
        flexWrap: 'wrap',
    },
    tab: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 16px',
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
    tabCount: {
        backgroundColor: 'var(--bg-overlay)',
        borderRadius: 'var(--radius-full)',
        padding: '1px 7px',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-semibold)',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 'var(--space-4)',
    },
    productoCard: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
    },
    productoEmoji: {
        width: '100%',
    },
    iconoPlaceholder: {
        width: '100%',
        height: '160px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    productoInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        flex: 1,
    },
    productoHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 'var(--space-2)',
    },
    productoNombre: {
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--text-primary)',
        margin: 0,
    },
    productoDesc: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-muted)',
        margin: 0,
        lineHeight: 1.5,
    },
    productoFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'var(--space-1)',
    },
    productoPrecio: {
        fontSize: 'var(--text-xl)',
        fontWeight: 'var(--font-bold)',
        background: 'var(--gradient-accent)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    productoAcciones: {
        display: 'flex',
        gap: 'var(--space-2)',
        paddingTop: 'var(--space-2)',
        borderTop: '1px solid var(--border-subtle)',
    },
    accionBtn: {
        flex: 1,
        padding: '6px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid',
        backgroundColor: 'transparent',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-medium)',
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
    },
    vacio: {
        gridColumn: '1 / -1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'var(--space-12)',
    },
    productoImagen: {
        width: '100%',
        height: '160px',
        borderRadius: 'var(--radius-md)',
        objectFit: 'cover',
    },
    imagenBtn: {
        flex: 1,
        padding: '6px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-primary)30',
        backgroundColor: 'transparent',
        color: 'var(--color-primary-light)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-medium)',
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
    },
};