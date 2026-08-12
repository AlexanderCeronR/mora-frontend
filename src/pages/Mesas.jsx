import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

export default function Mesas() {
    const [mesas, setMesas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalCrear, setModalCrear] = useState(false);
    const [nuevaMesa, setNuevaMesa] = useState({ numero: '', capacidad: '' });

    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    // Carga las mesas al entrar a la página
    useEffect(() => {
        cargarMesas();
    }, []);

    const cargarMesas = async () => {
        try {
            const response = await axiosClient.get('/mesas');
            setMesas(response.data);
        } catch (err) {
            setError('Error al cargar las mesas');
        } finally {
            setLoading(false);
        }
    };

    const cambiarEstado = async (id, estado) => {
        try {
            await axiosClient.patch(`/mesas/${id}/estado?estado=${estado}`);
            cargarMesas();
            // Recarga las mesas para ver el cambio
        } catch (err) {
            setError('Error al cambiar el estado');
        }
    };

    const crearMesa = async () => {
        try {
            await axiosClient.post('/mesas', {
                numero: parseInt(nuevaMesa.numero),
                capacidad: parseInt(nuevaMesa.capacidad)
            });
            setModalCrear(false);
            setNuevaMesa({ numero: '', capacidad: '' });
            cargarMesas();
        } catch (err) {
            setError('Error al crear la mesa');
        }
    };

    const eliminarMesa = async (id) => {
        if (!confirm('¿Seguro que quieres eliminar esta mesa?')) return;
        try {
            await axiosClient.delete(`/mesas/${id}`);
            cargarMesas();
        } catch (err) {
            setError('No se puede eliminar una mesa ocupada');
        }
    };

    // Color según estado de la mesa
    const colorEstado = {
        LIBRE: '#22c55e',
        OCUPADA: '#ef4444',
        RESERVADA: '#f97316'
    };

    const textoEstado = {
        LIBRE: 'Libre',
        OCUPADA: 'Ocupada',
        RESERVADA: 'Reservada'
    };

    if (loading) return (
        <div style={styles.loading}>Cargando mesas...</div>
    );

    return (
        <div style={styles.container}>

            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>MORA</h1>
                    <p style={styles.subtitle}>Gestión de Mesas</p>
                </div>
                <div style={styles.headerRight}>
                    <span style={styles.usuario}>
                        {usuario?.nombre} · {usuario?.rol}
                    </span>
                    <div style={styles.nav}>
                        <button onClick={() => navigate('/menu')}
                            style={styles.navBtn}>Menú</button>
                        <button onClick={() => navigate('/pedidos')}
                            style={styles.navBtn}>Pedidos</button>
                        {usuario?.rol === 'CAJERO' || usuario?.rol === 'ADMIN' ?
                            <button onClick={() => navigate('/caja')}
                                style={styles.navBtn}>Caja</button> : null}
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

            {/* Error */}
            {error && (
                <div style={styles.error}>
                    {error}
                    <button onClick={() => setError('')}
                        style={styles.closeError}>✕</button>
                </div>
            )}

            {/* Resumen */}
            <div style={styles.resumen}>
                <div style={styles.stat}>
                    <span style={{ color: '#22c55e', fontSize: '28px', fontWeight: 'bold' }}>
                        {mesas.filter(m => m.estado === 'LIBRE').length}
                    </span>
                    <span style={styles.statLabel}>Libres</span>
                </div>
                <div style={styles.stat}>
                    <span style={{ color: '#ef4444', fontSize: '28px', fontWeight: 'bold' }}>
                        {mesas.filter(m => m.estado === 'OCUPADA').length}
                    </span>
                    <span style={styles.statLabel}>Ocupadas</span>
                </div>
                <div style={styles.stat}>
                    <span style={{ color: '#f97316', fontSize: '28px', fontWeight: 'bold' }}>
                        {mesas.filter(m => m.estado === 'RESERVADA').length}
                    </span>
                    <span style={styles.statLabel}>Reservadas</span>
                </div>
                <div style={styles.stat}>
                    <span style={{ color: '#94a3b8', fontSize: '28px', fontWeight: 'bold' }}>
                        {mesas.length}
                    </span>
                    <span style={styles.statLabel}>Total</span>
                </div>
            </div>

            {/* Botón crear — solo ADMIN */}
            {usuario?.rol === 'ADMIN' && (
                <button onClick={() => setModalCrear(true)}
                    style={styles.btnCrear}>
                    + Nueva Mesa
                </button>
            )}

            {/* Grid de mesas */}
            <div style={styles.grid}>
                {mesas.map(mesa => (
                    <div key={mesa.id} style={{
                        ...styles.card,
                        borderColor: colorEstado[mesa.estado]
                    }}>
                        <div style={styles.cardHeader}>
                            <span style={styles.mesaNumero}>
                                Mesa {mesa.numero}
                            </span>
                            <span style={{
                                ...styles.badge,
                                backgroundColor: colorEstado[mesa.estado]
                            }}>
                                {textoEstado[mesa.estado]}
                            </span>
                        </div>

                        <p style={styles.capacidad}>
                            👥 {mesa.capacidad} personas
                        </p>

                        {/* Botones de estado */}
                        <div style={styles.btnGroup}>
                            {mesa.estado !== 'LIBRE' && (
                                <button
                                    onClick={() => cambiarEstado(mesa.id, 'LIBRE')}
                                    style={styles.btnLibre}>
                                    Liberar
                                </button>
                            )}
                            {mesa.estado !== 'OCUPADA' && (
                                <button
                                    onClick={() => cambiarEstado(mesa.id, 'OCUPADA')}
                                    style={styles.btnOcupar}>
                                    Ocupar
                                </button>
                            )}
                            {mesa.estado !== 'RESERVADA' && (
                                <button
                                    onClick={() => cambiarEstado(mesa.id, 'RESERVADA')}
                                    style={styles.btnReservar}>
                                    Reservar
                                </button>
                            )}
                        </div>

                        {/* Eliminar — solo ADMIN */}
                        {usuario?.rol === 'ADMIN' && (
                            <button
                                onClick={() => eliminarMesa(mesa.id)}
                                style={styles.btnEliminar}>
                                Eliminar
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal crear mesa */}
            {modalCrear && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>Nueva Mesa</h2>

                        <div style={styles.field}>
                            <label style={styles.label}>Número de mesa</label>
                            <input
                                type="number"
                                value={nuevaMesa.numero}
                                onChange={e => setNuevaMesa({
                                    ...nuevaMesa, numero: e.target.value
                                })}
                                style={styles.input}
                                placeholder="Ej: 5"
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Capacidad</label>
                            <input
                                type="number"
                                value={nuevaMesa.capacidad}
                                onChange={e => setNuevaMesa({
                                    ...nuevaMesa, capacidad: e.target.value
                                })}
                                style={styles.input}
                                placeholder="Ej: 4"
                            />
                        </div>

                        <div style={styles.modalBtns}>
                            <button onClick={() => setModalCrear(false)}
                                style={styles.btnCancelar}>
                                Cancelar
                            </button>
                            <button onClick={crearMesa}
                                style={styles.btnGuardar}>
                                Crear Mesa
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
        fontSize: '18px',
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
    resumen: {
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
    },
    stat: {
        backgroundColor: '#1e293b',
        padding: '16px 24px',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        minWidth: '100px',
    },
    statLabel: {
        color: '#94a3b8',
        fontSize: '12px',
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '16px',
    },
    card: {
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '20px',
        border: '2px solid',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    mesaNumero: {
        color: '#f1f5f9',
        fontSize: '18px',
        fontWeight: 'bold',
    },
    badge: {
        padding: '4px 10px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
    },
    capacidad: {
        color: '#94a3b8',
        margin: 0,
        fontSize: '14px',
    },
    btnGroup: {
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
    },
    btnLibre: {
        padding: '6px 10px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: '#166534',
        color: '#86efac',
        cursor: 'pointer',
        fontSize: '12px',
    },
    btnOcupar: {
        padding: '6px 10px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: '#7f1d1d',
        color: '#fca5a5',
        cursor: 'pointer',
        fontSize: '12px',
    },
    btnReservar: {
        padding: '6px 10px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: '#7c2d12',
        color: '#fdba74',
        cursor: 'pointer',
        fontSize: '12px',
    },
    btnEliminar: {
        padding: '6px 10px',
        borderRadius: '6px',
        border: '1px solid #334155',
        backgroundColor: 'transparent',
        color: '#64748b',
        cursor: 'pointer',
        fontSize: '12px',
        marginTop: '4px',
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
        maxWidth: '400px',
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