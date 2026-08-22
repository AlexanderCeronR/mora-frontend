import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import { showToast } from '../components/UI/Toast';
import { Plus, Users, Circle } from 'lucide-react';
import Confirm from '../components/UI/Confirm';
import useConfirm from '../hooks/useConfirm';
import PageTransition from '../components/UI/PageTransition';

const estadoConfig = {
    LIBRE:     { badge: 'success', label: 'Libre',     color: 'var(--color-success)' },
    OCUPADA:   { badge: 'danger',  label: 'Ocupada',   color: 'var(--color-danger)' },
    RESERVADA: { badge: 'warning', label: 'Reservada', color: 'var(--color-warning)' },
};

export default function Mesas() {
    const [mesas, setMesas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('TODOS');
    const [modalCrear, setModalCrear] = useState(false);
    const [nuevaMesa, setNuevaMesa] = useState({ numero: '', capacidad: '' });
    const { confirm, config } = useConfirm();
    const [usuario] = useState(() =>
        JSON.parse(localStorage.getItem('usuario') || '{}'));

    useEffect(() => { cargarMesas(); }, []);

    const cargarMesas = async () => {
        try {
            const res = await axiosClient.get('/mesas');
            setMesas(res.data);
        } catch {
            showToast('Error al cargar mesas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const cambiarEstado = async (id, estado) => {
        try {
            await axiosClient.patch(`/mesas/${id}/estado?estado=${estado}`);
            showToast(`Mesa actualizada a ${estado}`, 'success');
            cargarMesas();
        } catch {
            showToast('Error al cambiar estado', 'error');
        }
    };

    const crearMesa = async () => {
        if (!nuevaMesa.numero || !nuevaMesa.capacidad) {
            showToast('Completa todos los campos', 'warning');
            return;
        }
        try {
            await axiosClient.post('/mesas', {
                numero: parseInt(nuevaMesa.numero),
                capacidad: parseInt(nuevaMesa.capacidad)
            });
            showToast('Mesa creada correctamente', 'success');
            setModalCrear(false);
            setNuevaMesa({ numero: '', capacidad: '' });
            cargarMesas();
        } catch {
            showToast('Error al crear mesa — el número puede estar en uso', 'error');
        }
    };

   const eliminarMesa = async (id) => {
    const ok = await confirm({
        titulo: '¿Eliminar mesa?',
        mensaje: 'Esta acción no se puede deshacer.',
        variante: 'danger'
    });
    if (!ok) return;
    try {
        await axiosClient.delete(`/mesas/${id}`);
        showToast('Mesa eliminada', 'success');
        cargarMesas();
    } catch {
        showToast('No se puede eliminar una mesa ocupada', 'error');
    }
};

    const mesasFiltradas = filtro === 'TODOS'
        ? mesas
        : mesas.filter(m => m.estado === filtro);

    const conteo = {
        TODOS: mesas.length,
        LIBRE: mesas.filter(m => m.estado === 'LIBRE').length,
        OCUPADA: mesas.filter(m => m.estado === 'OCUPADA').length,
        RESERVADA: mesas.filter(m => m.estado === 'RESERVADA').length,
    };

    if (loading) return (
        <div style={styles.loading}>
            <div style={styles.spinner} />
        </div>
    );

return (
    <PageTransition>
        <div style={styles.container}>
            {/* Resumen + Filtros */}
            <div style={styles.topBar}>
                <div style={styles.filtros}>
                    {['TODOS', 'LIBRE', 'OCUPADA', 'RESERVADA'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFiltro(f)}
                            style={{
                                ...styles.filtroBtn,
                                ...(filtro === f ? styles.filtroBtnActive : {})
                            }}>
                            {f === 'TODOS' ? 'Todas' : f.charAt(0) + f.slice(1).toLowerCase()}
                            <span style={{
                                ...styles.filtroBadge,
                                backgroundColor: filtro === f
                                    ? 'rgba(255,255,255,0.2)'
                                    : 'var(--bg-overlay)'
                            }}>
                                {conteo[f]}
                            </span>
                        </button>
                    ))}
                </div>

                {usuario?.rol === 'ADMIN' && (
                    <Button
                        onClick={() => setModalCrear(true)}
                        variant="primary"
                        size="sm">
                        <Plus size={15} />
                        Nueva Mesa
                    </Button>
                )}
            </div>

            {/* Stats rápidas */}
            <div style={styles.statsRow}>
                {[
                    { label: 'Libres', count: conteo.LIBRE, color: 'var(--color-success)' },
                    { label: 'Ocupadas', count: conteo.OCUPADA, color: 'var(--color-danger)' },
                    { label: 'Reservadas', count: conteo.RESERVADA, color: 'var(--color-warning)' },
                    { label: 'Total', count: conteo.TODOS, color: 'var(--color-primary-light)' },
                ].map(s => (
                    <Card key={s.label} style={styles.statCard}>
                        <p style={{ ...styles.statNum, color: s.color }}>
                            {s.count}
                        </p>
                        <p style={styles.statLabel}>{s.label}</p>
                    </Card>
                ))}
            </div>

            {/* Grid de mesas */}
            <div style={styles.grid}>
                {mesasFiltradas.map(mesa => {
                    const cfg = estadoConfig[mesa.estado];
                    return (
                        <Card key={mesa.id} style={{
                            ...styles.mesaCard,
                            borderColor: cfg.color + '40',
                        }}>
                            {/* Header */}
                            <div style={styles.mesaHeader}>
                                <div style={styles.mesaNumWrap}>
                                    <Circle
                                        size={10}
                                        fill={cfg.color}
                                        color={cfg.color} />
                                    <span style={styles.mesaNum}>
                                        Mesa {mesa.numero}
                                    </span>
                                </div>
                                <Badge variant={cfg.badge}>
                                    {cfg.label}
                                </Badge>
                            </div>

                            {/* Capacidad */}
                            <div style={styles.capacidadRow}>
                                <Users size={14}
                                    color="var(--text-muted)" />
                                <span style={styles.capacidadTxt}>
                                    {mesa.capacidad} personas
                                </span>
                            </div>

                            {/* Acciones de estado */}
                            <div style={styles.accionesEstado}>
                                {mesa.estado !== 'LIBRE' && (
                                    <button
                                        onClick={() => cambiarEstado(mesa.id, 'LIBRE')}
                                        style={{
                                            ...styles.estadoBtn,
                                            color: 'var(--color-success)',
                                            borderColor: 'var(--color-success)30',
                                        }}>
                                        Liberar
                                    </button>
                                )}
                                {mesa.estado !== 'OCUPADA' && (
                                    <button
                                        onClick={() => cambiarEstado(mesa.id, 'OCUPADA')}
                                        style={{
                                            ...styles.estadoBtn,
                                            color: 'var(--color-danger)',
                                            borderColor: 'var(--color-danger)30',
                                        }}>
                                        Ocupar
                                    </button>
                                )}
                                {mesa.estado !== 'RESERVADA' && (
                                    <button
                                        onClick={() => cambiarEstado(mesa.id, 'RESERVADA')}
                                        style={{
                                            ...styles.estadoBtn,
                                            color: 'var(--color-warning)',
                                            borderColor: 'var(--color-warning)30',
                                        }}>
                                        Reservar
                                    </button>
                                )}
                            </div>

                            {/* Eliminar */}
                            {usuario?.rol === 'ADMIN' && (
                                <button
                                    onClick={() => eliminarMesa(mesa.id)}
                                    style={styles.eliminarBtn}>
                                    Eliminar mesa
                                </button>
                            )}
                        </Card>
                    );
                })}

                {mesasFiltradas.length === 0 && (
                    <div style={styles.vacio}>
                        <p style={{ color: 'var(--text-muted)' }}>
                            No hay mesas {filtro !== 'TODOS'
                                ? `en estado ${filtro}`
                                : ''}
                        </p>
                    </div>
                )}
            </div>

            {/* Modal crear */}
            {modalCrear && (
                <Modal
                    title="Nueva Mesa"
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
                                onClick={crearMesa}>
                                Crear Mesa
                            </Button>
                        </>
                    }>
                    <Input
                        label="Número de mesa"
                        type="number"
                        value={nuevaMesa.numero}
                        onChange={e => setNuevaMesa({
                            ...nuevaMesa, numero: e.target.value
                        })}
                        placeholder="Ej: 5"
                    />
                    <Input
                        label="Capacidad"
                        type="number"
                        value={nuevaMesa.capacidad}
                        onChange={e => setNuevaMesa({
                            ...nuevaMesa, capacidad: e.target.value
                        })}
                        placeholder="Ej: 4"
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
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
    },
    filtros: {
        display: 'flex',
        gap: 'var(--space-2)',
        flexWrap: 'wrap',
    },
    filtroBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
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
    filtroBadge: {
        padding: '1px 7px',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-semibold)',
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
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 'var(--space-4)',
    },
    mesaCard: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        border: '1px solid',
    },
    mesaHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    mesaNumWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    mesaNum: {
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--text-primary)',
    },
    capacidadRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    capacidadTxt: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-muted)',
    },
    accionesEstado: {
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
    },
    estadoBtn: {
        padding: '5px 10px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid',
        backgroundColor: 'transparent',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-medium)',
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
    },
    eliminarBtn: {
        padding: '5px 10px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-default)',
        backgroundColor: 'transparent',
        color: 'var(--text-disabled)',
        fontSize: 'var(--text-xs)',
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        marginTop: 'var(--space-1)',
    },
    vacio: {
        gridColumn: '1 / -1',
        textAlign: 'center',
        padding: 'var(--space-12)',
    },
};