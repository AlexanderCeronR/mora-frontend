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
    Plus, Users, Search, Crown, UtensilsCrossed,
    Calculator, Shield, ChefHat
} from 'lucide-react';
import Confirm from '../components/ui/Confirm';
import useConfirm from '../hooks/useConfirm';
import PageTransition from '../components/ui/PageTransition';

const rolConfig = {
    ADMIN:      { badge: 'warning', icon: Crown,           color: 'var(--color-warning)',      label: 'Administrador' },
    SUPERVISOR: { badge: 'accent',  icon: Shield,          color: 'var(--color-accent-light)', label: 'Supervisor' },
    MESERO:     { badge: 'primary', icon: UtensilsCrossed, color: 'var(--color-primary-light)', label: 'Mesero' },
    CAJERO:     { badge: 'success', icon: Calculator,      color: 'var(--color-success)',      label: 'Cajero' },
    COCINA:     { badge: 'info',    icon: ChefHat,         color: 'var(--color-info)',         label: 'Cocina' },
};

const tenue = (color, pct = 15) =>
    `color-mix(in srgb, ${color} ${pct}%, transparent)`;

const rolesOptions = [
    { value: 'MESERO', label: 'Mesero' },
    { value: 'CAJERO', label: 'Cajero' },
    { value: 'COCINA', label: 'Cocina' },
    { value: 'SUPERVISOR', label: 'Supervisor' },
    { value: 'ADMIN', label: 'Administrador' },
];

const filtrosRol = ['TODOS', 'ADMIN', 'SUPERVISOR', 'MESERO', 'CAJERO', 'COCINA'];

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroRol, setFiltroRol] = useState('TODOS');
    const [modalCrear, setModalCrear] = useState(false);
    const [modalEditar, setModalEditar] = useState(null);
    const { confirm, config } = useConfirm();
    const [nuevoUsuario, setNuevoUsuario] = useState({
        nombre: '', email: '', password: '', rol: 'MESERO'
    });
    const [editando, setEditando] = useState({
        nombre: '', email: '', password: '', rol: ''
    });
    const [usuarioActual] = useState(() =>
        JSON.parse(localStorage.getItem('usuario') || '{}'));

    useEffect(() => { cargarUsuarios(); }, []);

    const cargarUsuarios = async () => {
        try {
            const res = await axiosClient.get('/usuarios');
            setUsuarios(res.data);
        } catch {
            showToast('Error al cargar usuarios', 'error');
        } finally {
            setLoading(false);
        }
    };

    const cerrarCrear = () => {
        setModalCrear(false);
        setNuevoUsuario({
            nombre: '', email: '', password: '', rol: 'MESERO'
        });
    };

    const crearUsuario = async () => {
        if (!nuevoUsuario.nombre || !nuevoUsuario.email
            || !nuevoUsuario.password) {
            showToast('Todos los campos son obligatorios', 'warning');
            return;
        }
        try {
            await axiosClient.post('/auth/register', nuevoUsuario);
            showToast('Usuario creado correctamente', 'success');
            cerrarCrear();
            cargarUsuarios();
        } catch {
            showToast('Error — el email puede estar en uso', 'error');
        }
    };

    const abrirEditar = (u) => {
        setEditando({
            nombre: u.nombre, email: u.email, password: '', rol: u.rol
        });
        setModalEditar(u);
    };

    const guardarEdicion = async () => {
        const datos = { ...editando };
        if (!datos.password) delete datos.password;
        try {
            await axiosClient.put(`/usuarios/${modalEditar.id}`, datos);
            showToast('Usuario actualizado correctamente', 'success');
            setModalEditar(null);
            cargarUsuarios();
        } catch {
            showToast('Error al actualizar usuario', 'error');
        }
    };

    const eliminarUsuario = async (id, nombre) => {
        const ok = await confirm({
            titulo: `¿Eliminar a ${nombre}?`,
            mensaje: 'Esta acción no se puede deshacer.',
            variante: 'danger'
        });
        if (!ok) return;
        try {
            await axiosClient.delete(`/usuarios/${id}`);
            showToast('Usuario eliminado', 'success');
            cargarUsuarios();
        } catch {
            showToast(
                'No se puede eliminar: el usuario tiene pedidos asociados',
                'error'
            );
        }
    };

    const q = busqueda.toLowerCase();
    const usuariosFiltrados = usuarios
        .filter(u => filtroRol === 'TODOS' || u.rol === filtroRol)
        .filter(u =>
            (u.nombre || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q));

    const conteoRol = (rol) => usuarios.filter(u => u.rol === rol).length;

    if (loading) return (
        <div style={styles.loading}>
            <div style={styles.spinner} />
        </div>
    );

    return (
        <PageTransition>
            <div style={styles.container}>

                {/* Estadísticas */}
                <div style={styles.statsRow}>
                    {[
                        { label: 'Total', count: usuarios.length },
                        { label: 'Admins', count: conteoRol('ADMIN') },
                        { label: 'Supervisores', count: conteoRol('SUPERVISOR') },
                        { label: 'Meseros', count: conteoRol('MESERO') },
                        { label: 'Cajeros', count: conteoRol('CAJERO') },
                        { label: 'Cocina', count: conteoRol('COCINA') },
                    ].map(s => (
                        <Card key={s.label} style={styles.statCard}>
                            <p style={styles.statNum}>{s.count}</p>
                            <p style={styles.statLabel}>{s.label}</p>
                        </Card>
                    ))}
                </div>

                {/* Barra superior */}
                <div className="stack-mobile" style={styles.topBar}>
                    <div className="stack-mobile" style={styles.leftBar}>
                        <div className="full-mobile" style={styles.searchWrap}>
                            <Search
                                size={15}
                                color="var(--text-muted)"
                                style={styles.searchIcon} />
                            <input
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                placeholder="Buscar por nombre o email..."
                                style={styles.searchInput}
                                onFocus={e => {
                                    e.target.style.borderColor =
                                        'var(--color-primary)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor =
                                        'var(--border-default)';
                                }}
                            />
                        </div>

                        <div style={styles.filtros}>
                            {filtrosRol.map(r => (
                                <button
                                    key={r}
                                    onClick={() => setFiltroRol(r)}
                                    style={{
                                        ...styles.filtroBtn,
                                        ...(filtroRol === r
                                            ? styles.filtroBtnActive : {})
                                    }}>
                                    {r === 'TODOS'
                                        ? 'Todos'
                                        : r.charAt(0) + r.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={() => setModalCrear(true)}
                        variant="primary"
                        size="sm">
                        <Plus size={15} />
                        Nuevo usuario
                    </Button>
                </div>

                {/* Usuarios */}
                <div style={styles.grid}>
                    {usuariosFiltrados.map(u => {
                        const cfg = rolConfig[u.rol] || {};
                        const Icon = cfg.icon || Users;
                        const color = cfg.color || 'var(--text-primary)';
                        const esYo = u.id === usuarioActual?.id;
                        return (
                            <Card key={u.id} style={styles.userCard}>
                                <div style={styles.userHeader}>
                                    <div style={{
                                        ...styles.avatar,
                                        backgroundColor: tenue(color),
                                        border: `1px solid ${tenue(color, 30)}`,
                                    }}>
                                        <span style={{
                                            fontSize: 'var(--text-xl)',
                                            fontWeight: 'var(--font-bold)',
                                            color,
                                        }}>
                                            {(u.nombre || '?')
                                                .charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <Badge variant={cfg.badge || 'default'}>
                                        <Icon size={10}
                                            style={{ marginRight: '4px' }} />
                                        {cfg.label || u.rol}
                                    </Badge>
                                </div>

                                <div style={styles.userInfo}>
                                    <p style={styles.userName}>
                                        {u.nombre}{esYo ? ' (tú)' : ''}
                                    </p>
                                    <p style={styles.userEmail}>{u.email}</p>
                                </div>

                                <div style={styles.userAcciones}>
                                    <button
                                        onClick={() => abrirEditar(u)}
                                        style={styles.editBtn}>
                                        Editar
                                    </button>
                                    {!esYo && (
                                        <button
                                            onClick={() => eliminarUsuario(
                                                u.id, u.nombre)}
                                            style={styles.deleteBtn}>
                                            Eliminar
                                        </button>
                                    )}
                                </div>
                            </Card>
                        );
                    })}

                    {usuariosFiltrados.length === 0 && (
                        <div style={styles.vacio}>
                            <Users size={40} color="var(--text-disabled)" />
                            <p style={{
                                color: 'var(--text-muted)',
                                marginTop: '12px'
                            }}>
                                No hay usuarios
                                {busqueda ? ` con "${busqueda}"` : ''}
                            </p>
                        </div>
                    )}
                </div>

                {/* Modal crear */}
                {modalCrear && (
                    <Modal
                        title="Nuevo usuario"
                        onClose={cerrarCrear}
                        footer={
                            <>
                                <Button variant="ghost" onClick={cerrarCrear}>
                                    Cancelar
                                </Button>
                                <Button variant="primary" onClick={crearUsuario}>
                                    Crear usuario
                                </Button>
                            </>
                        }>
                        <Input
                            label="Nombre completo"
                            value={nuevoUsuario.nombre}
                            onChange={e => setNuevoUsuario({
                                ...nuevoUsuario, nombre: e.target.value
                            })}
                            placeholder="Ej: Carlos Rodríguez"
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={nuevoUsuario.email}
                            onChange={e => setNuevoUsuario({
                                ...nuevoUsuario, email: e.target.value
                            })}
                            placeholder="correo@ejemplo.com"
                        />
                        <Input
                            label="Contraseña"
                            type="password"
                            value={nuevoUsuario.password}
                            onChange={e => setNuevoUsuario({
                                ...nuevoUsuario, password: e.target.value
                            })}
                            placeholder="Mínimo 8 caracteres"
                        />
                        <Select
                            label="Rol"
                            value={nuevoUsuario.rol}
                            onChange={e => setNuevoUsuario({
                                ...nuevoUsuario, rol: e.target.value
                            })}
                            options={rolesOptions}
                        />
                    </Modal>
                )}

                {/* Modal editar */}
                {modalEditar && (
                    <Modal
                        title={`Editar — ${modalEditar.nombre}`}
                        onClose={() => setModalEditar(null)}
                        footer={
                            <>
                                <Button
                                    variant="ghost"
                                    onClick={() => setModalEditar(null)}>
                                    Cancelar
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={guardarEdicion}>
                                    Guardar cambios
                                </Button>
                            </>
                        }>
                        <Input
                            label="Nombre"
                            value={editando.nombre}
                            onChange={e => setEditando({
                                ...editando, nombre: e.target.value
                            })}
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={editando.email}
                            onChange={e => setEditando({
                                ...editando, email: e.target.value
                            })}
                        />
                        <Input
                            label="Nueva contraseña (opcional)"
                            type="password"
                            value={editando.password}
                            onChange={e => setEditando({
                                ...editando, password: e.target.value
                            })}
                            placeholder="Dejar vacío para no cambiar"
                        />
                        <Select
                            label="Rol"
                            value={editando.rol}
                            onChange={e => setEditando({
                                ...editando, rol: e.target.value
                            })}
                            options={rolesOptions}
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
    statsRow: {
        display: 'grid',
        gridTemplateColumns:
            'repeat(auto-fit, minmax(min(100%, 110px), 1fr))',
        gap: 'var(--space-3)',
    },
    statCard: {
        textAlign: 'center',
        padding: 'var(--space-4)',
    },
    statNum: {
        fontSize: 'var(--text-3xl)',
        fontWeight: 'var(--font-bold)',
        color: 'var(--text-primary)',
        margin: 0,
        lineHeight: 1,
    },
    statLabel: {
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        margin: '4px 0 0 0',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    topBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'var(--space-3)',
        flexWrap: 'wrap',
    },
    leftBar: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        flexWrap: 'wrap',
        flex: 1,
    },
    searchWrap: {
        position: 'relative',
        minWidth: '240px',
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
    filtros: {
        display: 'flex',
        gap: 'var(--space-2)',
        flexWrap: 'wrap',
    },
    filtroBtn: {
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
        border: '1px solid transparent',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns:
            'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
        gap: 'var(--space-4)',
    },
    userCard: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
    },
    userHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    avatar: {
        width: '48px',
        height: '48px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flex: 1,
        minWidth: 0,
    },
    userName: {
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--text-primary)',
        margin: 0,
    },
    userEmail: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-muted)',
        margin: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    userAcciones: {
        display: 'flex',
        gap: 'var(--space-2)',
        paddingTop: 'var(--space-3)',
        borderTop: '1px solid var(--border-subtle)',
    },
    editBtn: {
        flex: 1,
        padding: '7px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-default)',
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)',
        fontSize: 'var(--text-sm)',
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
    },
    deleteBtn: {
        flex: 1,
        padding: '7px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid',
        borderColor: 'color-mix(in srgb, var(--color-danger) 30%, transparent)',
        backgroundColor: 'transparent',
        color: 'var(--color-danger)',
        fontSize: 'var(--text-sm)',
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
};