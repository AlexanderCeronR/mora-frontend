import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalCrear, setModalCrear] = useState(false);
    const [modalEditar, setModalEditar] = useState(null);
    const [nuevoUsuario, setNuevoUsuario] = useState({
        nombre: '', email: '', password: '', rol: 'MESERO'
    });
    const [editando, setEditando] = useState({
        nombre: '', email: '', password: '', rol: ''
    });

    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    const colorRol = {
        ADMIN: '#f97316',
        MESERO: '#3b82f6',
        CAJERO: '#22c55e'
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            const res = await axiosClient.get('/usuarios');
            setUsuarios(res.data);
        } catch (err) {
            setError('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const crearUsuario = async () => {
        if (!nuevoUsuario.nombre || !nuevoUsuario.email ||
            !nuevoUsuario.password) {
            setError('Todos los campos son obligatorios');
            return;
        }
        try {
            await axiosClient.post('/auth/register', nuevoUsuario);
            setModalCrear(false);
            setNuevoUsuario({ nombre: '', email: '', password: '', rol: 'MESERO' });
            cargarUsuarios();
        } catch (err) {
            setError('Error al crear usuario — el email puede estar en uso');
        }
    };

    const abrirEditar = (u) => {
        setEditando({
            nombre: u.nombre,
            email: u.email,
            password: '',
            rol: u.rol
        });
        setModalEditar(u);
    };

    const guardarEdicion = async () => {
        try {
            await axiosClient.put(`/usuarios/${modalEditar.id}`, editando);
            setModalEditar(null);
            cargarUsuarios();
        } catch (err) {
            setError('Error al actualizar usuario');
        }
    };

    const eliminarUsuario = async (id, nombre) => {
        if (!confirm(`¿Seguro que quieres eliminar a ${nombre}?`)) return;
        try {
            await axiosClient.delete(`/usuarios/${id}`);
            cargarUsuarios();
        } catch (err) {
            setError('Error al eliminar usuario');
        }
    };

    if (loading) return (
        <div style={styles.loading}>Cargando usuarios...</div>
    );

    return (
        <div style={styles.container}>

            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>MORA</h1>
                    <p style={styles.subtitle}>Gestión de Usuarios</p>
                </div>
                <div style={styles.headerRight}>
                    <span style={styles.usuarioInfo}>
                        {usuario?.nombre} · {usuario?.rol}
                    </span>
                    <div style={styles.nav}>
                        <button onClick={() => navigate('/mesas')}
                            style={styles.navBtn}>Mesas</button>
                        <button onClick={() => navigate('/pedidos')}
                            style={styles.navBtn}>Pedidos</button>
                        <button onClick={() => navigate('/caja')}
                            style={styles.navBtn}>Caja</button>
                        <button onClick={() => navigate('/dashboard')}
                            style={styles.navBtn}>Dashboard</button>
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

            {/* Botón crear */}
            <button onClick={() => setModalCrear(true)}
                style={styles.btnCrear}>
                + Nuevo Usuario
            </button>

            {/* Lista de usuarios */}
            <div style={styles.grid}>
                {usuarios.map(u => (
                    <div key={u.id} style={styles.card}>
                        <div style={styles.cardHeader}>
                            <div style={styles.avatar}>
                                {u.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p style={styles.nombre}>{u.nombre}</p>
                                <p style={styles.email}>{u.email}</p>
                            </div>
                        </div>

                        <span style={{
                            ...styles.badge,
                            backgroundColor: colorRol[u.rol] + '22',
                            color: colorRol[u.rol],
                            border: `1px solid ${colorRol[u.rol]}`
                        }}>
                            {u.rol}
                        </span>

                        <div style={styles.acciones}>
                            <button
                                onClick={() => abrirEditar(u)}
                                style={styles.btnEditar}>
                                ✏️ Editar
                            </button>
                            <button
                                onClick={() => eliminarUsuario(u.id, u.nombre)}
                                style={styles.btnEliminar}>
                                🗑️ Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal crear */}
            {modalCrear && (
                <div style={styles.overlay}>
                    <div style={styles.modalBox}>
                        <h2 style={styles.modalTitle}>Nuevo Usuario</h2>

                        {[
                            { field: 'nombre', label: 'Nombre completo', type: 'text' },
                            { field: 'email', label: 'Email', type: 'email' },
                            { field: 'password', label: 'Contraseña', type: 'password' },
                        ].map(({ field, label, type }) => (
                            <div key={field} style={styles.field}>
                                <label style={styles.label}>{label}</label>
                                <input
                                    type={type}
                                    value={nuevoUsuario[field]}
                                    onChange={e => setNuevoUsuario({
                                        ...nuevoUsuario,
                                        [field]: e.target.value
                                    })}
                                    style={styles.input}
                                />
                            </div>
                        ))}

                        <div style={styles.field}>
                            <label style={styles.label}>Rol</label>
                            <select
                                value={nuevoUsuario.rol}
                                onChange={e => setNuevoUsuario({
                                    ...nuevoUsuario, rol: e.target.value
                                })}
                                style={styles.input}>
                                <option value="MESERO">MESERO</option>
                                <option value="CAJERO">CAJERO</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                        </div>

                        <div style={styles.modalBtns}>
                            <button
                                onClick={() => {
                                    setModalCrear(false);
                                    setNuevoUsuario({
                                        nombre: '', email: '',
                                        password: '', rol: 'MESERO'
                                    });
                                }}
                                style={styles.btnCancelar}>
                                Cancelar
                            </button>
                            <button onClick={crearUsuario}
                                style={styles.btnGuardar}>
                                Crear Usuario
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal editar */}
            {modalEditar && (
                <div style={styles.overlay}>
                    <div style={styles.modalBox}>
                        <h2 style={styles.modalTitle}>
                            Editar — {modalEditar.nombre}
                        </h2>

                        {[
                            { field: 'nombre', label: 'Nombre', type: 'text' },
                            { field: 'email', label: 'Email', type: 'email' },
                            { field: 'password', label: 'Nueva contraseña (opcional)', type: 'password' },
                        ].map(({ field, label, type }) => (
                            <div key={field} style={styles.field}>
                                <label style={styles.label}>{label}</label>
                                <input
                                    type={type}
                                    value={editando[field]}
                                    onChange={e => setEditando({
                                        ...editando,
                                        [field]: e.target.value
                                    })}
                                    style={styles.input}
                                    placeholder={field === 'password'
                                        ? 'Dejar vacío para no cambiar'
                                        : ''}
                                />
                            </div>
                        ))}

                        <div style={styles.field}>
                            <label style={styles.label}>Rol</label>
                            <select
                                value={editando.rol}
                                onChange={e => setEditando({
                                    ...editando, rol: e.target.value
                                })}
                                style={styles.input}>
                                <option value="MESERO">MESERO</option>
                                <option value="CAJERO">CAJERO</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                        </div>

                        <div style={styles.modalBtns}>
                            <button
                                onClick={() => setModalEditar(null)}
                                style={styles.btnCancelar}>
                                Cancelar
                            </button>
                            <button onClick={guardarEdicion}
                                style={styles.btnGuardar}>
                                Guardar Cambios
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
    usuarioInfo: {
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
    },
    card: {
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    avatar: {
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        backgroundColor: '#f97316',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        flexShrink: 0,
    },
    nombre: {
        color: '#f1f5f9',
        fontWeight: '500',
        margin: 0,
        fontSize: '15px',
    },
    email: {
        color: '#64748b',
        fontSize: '13px',
        margin: '2px 0 0 0',
    },
    badge: {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        letterSpacing: '1px',
    },
    acciones: {
        display: 'flex',
        gap: '8px',
    },
    btnEditar: {
        flex: 1,
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid #334155',
        backgroundColor: 'transparent',
        color: '#94a3b8',
        cursor: 'pointer',
        fontSize: '13px',
    },
    btnEliminar: {
        flex: 1,
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid #7f1d1d',
        backgroundColor: 'transparent',
        color: '#fca5a5',
        cursor: 'pointer',
        fontSize: '13px',
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
    modalBox: {
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        padding: '32px',
        width: '100%',
        maxWidth: '420px',
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