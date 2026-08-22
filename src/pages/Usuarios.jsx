import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import { showToast } from '../components/UI/Toast';
import { Plus, Users, Search, Crown, UtensilsCrossed, Calculator } from 'lucide-react';
import Confirm from '../components/UI/Confirm';
import useConfirm from '../hooks/useConfirm';
import PageTransition from '../components/UI/PageTransition';

const rolConfig = {
    ADMIN:  { badge: 'warning', icon: Crown,           color: '#f59e0b', label: 'Administrador' },
    MESERO: { badge: 'primary', icon: UtensilsCrossed, color: 'var(--color-primary-light)', label: 'Mesero' },
    CAJERO: { badge: 'success', icon: Calculator,      color: 'var(--color-success)', label: 'Cajero' },
};

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

    const crearUsuario = async () => {
        if (!nuevoUsuario.nombre || !nuevoUsuario.email || !nuevoUsuario.password) {
            showToast('Todos los campos son obligatorios', 'warning');
            return;
        }
        try {
            await axiosClient.post('/auth/register', nuevoUsuario);
            showToast('Usuario creado correctamente', 'success');
            setModalCrear(false);
            setNuevoUsuario({ nombre: '', email: '', password: '', rol: 'MESERO' });
            cargarUsuarios();
        } catch {
            showToast('Error — el email puede estar en uso', 'error');
        }
    };

    const abrirEditar = (u) => {
        setEditando({ nombre: u.nombre, email: u.email, password: '', rol: u.rol });
        setModalEditar(u);
    };

    const guardarEdicion = async () => {
        try {
            await axiosClient.put(`/usuarios/${modalEditar.id}`, editando);
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
        showToast('Error al eliminar usuario', 'error');
    }
};

    const usuariosFiltrados = usuarios
        .filter(u => filtroRol === 'TODOS' || u.rol === filtroRol)
        .filter(u => u.nombre.toLowerCase()
            .includes((busqueda || '').toLowerCase()) ||
            u.email.toLowerCase()
            .includes((busqueda || '').toLowerCase()));

    const conteoRol = (rol) => usuarios.filter(u => u.rol === rol).length;

    const rolesOptions = [
        { value: 'MESERO', label: 'Mesero' },
        { value: 'CAJERO', label: 'Cajero' },
        { value: 'ADMIN', label: 'Administrador' },
    ];

    if (loading) return (
        <div style={styles.loading}>
            <div style={styles.spinner} />
        </div>
    );

    return (
    <PageTransition>
        <div style={styles.container}>
            {/* Stats */}
            <div style={styles.statsRow}>
                {[
                    { label: 'Total', count: usuarios.length, color: 'var(--color-primary-light)' },
                    { label: 'Admins', count: conteoRol('ADMIN'), color: '#f59e0b' },
                    { label: 'Meseros', count: conteoRol('MESERO'), color: 'var(--color-primary-light)' },
                    { label: 'Cajeros', count: conteoRol('CAJERO'), color: 'var(--color-success)' },
                ].map(s => (
                    <Card key={s.label} style={styles.statCard}>
                        <p style={{ ...styles.statNum, color: s.color }}>
                            {s.count}
                        </p>
                        <p style={styles.statLabel}>{s.label}</p>
                    </Card>
                ))}
            </div>

            {/* Top bar */}
            <div style={styles.topBar}>
                <div style={styles.leftBar}>
                    {/* Buscador */}
                    <div style={styles.searchWrap}>
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

                    {/* Filtro por rol */}
                    <div style={styles.filtros}>
                        {['TODOS', 'ADMIN', 'MESERO', 'CAJERO'].map(r => (
                            <button
                                key={r}
                                onClick={() => setFiltroRol(r)}
                                style={{
                                    ...styles.filtroBtn,
                                    ...(filtroRol === r
                                        ? styles.filtroBtnActive : {})
                                }}>
                                {r === 'TODOS' ? 'Todos' : r.charAt(0) +
                                    r.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <Button
                    onClick={() => setModalCrear(true)}
                    variant="primary"
                    size="sm">
                    <Plus size={15} />
                    Nuevo Usuario
                </Button>
            </div>

            {/* Grid de usuarios */}
            <div style={styles.grid}>
                {usuariosFiltrados.map(u => {
                    const cfg = rolConfig[u.rol] || {};
                    const Icon = cfg.icon || Users;
                    return (
                        <Card key={u.id} style={styles.userCard}>
                            {/* Avatar */}
                            <div style={styles.userHeader}>
                                <div style={{
                                    ...styles.avatar,
                                    background: cfg.color
                                        ? `${cfg.color}20`
                                        : 'var(--bg-overlay)',
                                    border: `1px solid ${cfg.color || 'var(--border-default)'}30`,
                                }}>
                                    <span style={{
                                        fontSize: 'var(--text-xl)',
                                        fontWeight: 'var(--font-bold)',
                                        color: cfg.color ||
                                            'var(--text-primary)',
                                    }}>
                                        {u.nombre.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <Badge variant={cfg.badge || 'default'}>
                                    <Icon size={10} style={{ marginRight: '4px' }} />
                                    {cfg.label || u.rol}
                                </Badge>
                            </div>

                            {/* Info */}
                            <div style={styles.userInfo}>
                                <p style={styles.userName}>{u.nombre}</p>
                                <p style={styles.userEmail}>{u.email}</p>
                            </div>

                            {/* Acciones */}
                            <div style={styles.userAcciones}>
                                <button
                                    onClick={() => abrirEditar(u)}
                                    style={styles.editBtn}>
                                    Editar
                                </button>
                                <button
                                    onClick={() =>
                                        eliminarUsuario(u.id, u.nombre)}
                                    style={styles.deleteBtn}>
                                    Eliminar
                                </button>
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
                    title="Nuevo Usuario"
                    onClose={() => {
                        setModalCrear(false);
                        setNuevoUsuario({
                            nombre: '', email: '',
                            password: '', rol: 'MESERO'
                        });
                    }}
                    footer={
                        <>
                            <Button
                                variant="ghost"
                                onClick={() => setModalCrear(false)}>
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                onClick={crearUsuario}>
                                Crear Usuario
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
                                Guardar Cambios
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
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--space-4)',
    },
    statCard: {
        textAlign: 'center',
        padding: 'var(--space-4)',
    },
    statNum: {
        fontSize: 'var(--text-3xl)',
        fontWeight: 'var(--font-bold)',
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
        border: 'none',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
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
        border: '1px solid var(--color-danger)30',
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