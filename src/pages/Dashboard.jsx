import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts';

const COLORES = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ef4444'];

export default function Dashboard() {
    const [datos, setDatos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [preguntaIA, setPreguntaIA] = useState('');
    const [respuestaIA, setRespuestaIA] = useState('');
    const [loadingIA, setLoadingIA] = useState(false);

    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const res = await axiosClient.get('/reportes/resumen');
            setDatos(res.data);
        } catch (err) {
            setError('Error al cargar el dashboard');
        } finally {
            setLoading(false);
        }
    };

    // Prepara datos para gráficas
    const datosProductos = datos
        ? Object.entries(datos.productosMasVendidos || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        : [];

    const datosCategorias = datos
        ? Object.entries(datos.porCategoria || {})
            .map(([categoria, total]) => ({
                categoria,
                total: parseFloat(total)
            }))
        : [];

    const datosMetodos = datos
        ? Object.entries(datos.porMetodoPago || {})
            .map(([metodo, cantidad]) => ({ metodo, cantidad }))
        : [];

    // Pregunta a la IA
    const preguntarIA = async () => {
    if (!preguntaIA.trim() || !datos) return;
    setLoadingIA(true);
    setRespuestaIA('');

    try {
        const contexto = `
            Eres el asistente de análisis del restaurante MORA.
            Datos actuales:
            - Total ventas: $${datos.totalVentas?.toLocaleString()}
            - Total pedidos: ${datos.totalPedidos}
            - Total pagos: ${datos.totalPagos}
            - Ventas por método de pago: ${JSON.stringify(datos.porMetodoPago)}
            - Productos más vendidos: ${JSON.stringify(datos.productosMasVendidos)}
            - Ventas por categoría: ${JSON.stringify(datos.porCategoria)}
            Responde en español, conciso, máximo 3 oraciones.
        `;

        const response = await axiosClient.post('/ia/preguntar', {
            pregunta: preguntaIA,
            contexto
        });

        const contenido = response.data?.content;
        const texto = contenido?.[0]?.text || 'Sin respuesta';
        setRespuestaIA(texto);

    } catch (err) {
        setRespuestaIA('Error al conectar con la IA');
    } finally {
        setLoadingIA(false);
    }
};

    if (loading) return (
        <div style={styles.loading}>Cargando dashboard...</div>
    );

    return (
        <div style={styles.container}>

            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>MORA</h1>
                    <p style={styles.subtitle}>Dashboard & Analytics</p>
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
                        <button onClick={() => navigate('/caja')}
                            style={styles.navBtn}>Caja</button>
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
                <div style={styles.error}>{error}</div>
            )}

            {/* KPIs */}
            <div style={styles.kpis}>
                <div style={styles.kpi}>
                    <span style={styles.kpiValor}>
                        ${datos?.totalVentas?.toLocaleString() || 0}
                    </span>
                    <span style={styles.kpiLabel}>Total Ventas</span>
                </div>
                <div style={styles.kpi}>
                    <span style={{
                        ...styles.kpiValor, color: '#3b82f6'
                    }}>
                        {datos?.totalPedidos || 0}
                    </span>
                    <span style={styles.kpiLabel}>Total Pedidos</span>
                </div>
                <div style={styles.kpi}>
                    <span style={{
                        ...styles.kpiValor, color: '#a855f7'
                    }}>
                        {datos?.totalPagos || 0}
                    </span>
                    <span style={styles.kpiLabel}>Pagos Registrados</span>
                </div>
                <div style={styles.kpi}>
                    <span style={{
                        ...styles.kpiValor, color: '#22c55e'
                    }}>
                        ${datos?.totalPedidos > 0
                            ? Math.round(datos?.totalVentas / datos?.totalPedidos)
                                .toLocaleString()
                            : 0}
                    </span>
                    <span style={styles.kpiLabel}>Ticket Promedio</span>
                </div>
            </div>

            {/* Gráficas */}
            <div style={styles.graficas}>

                {/* Productos más vendidos */}
                <div style={styles.graficaCard}>
                    <h3 style={styles.graficaTitulo}>
                        🏆 Productos más vendidos
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={datosProductos}>
                            <CartesianGrid strokeDasharray="3 3"
                                stroke="#334155" />
                            <XAxis dataKey="nombre"
                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                interval={0}
                                angle={-20}
                                textAnchor="end" />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    color: '#f1f5f9'
                                }} />
                            <Bar dataKey="cantidad" fill="#f97316"
                                radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Ventas por categoría */}
                <div style={styles.graficaCard}>
                    <h3 style={styles.graficaTitulo}>
                        📊 Ventas por categoría
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={datosCategorias}
                                dataKey="total"
                                nameKey="categoria"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ categoria, percent }) =>
                                    `${categoria} ${(percent * 100).toFixed(0)}%`
                                }
                                labelLine={{ stroke: '#94a3b8' }}>
                                {datosCategorias.map((_, i) => (
                                    <Cell key={i}
                                        fill={COLORES[i % COLORES.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) =>
                                    `$${value.toLocaleString()}`}
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    color: '#f1f5f9'
                                }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Métodos de pago */}
                <div style={styles.graficaCard}>
                    <h3 style={styles.graficaTitulo}>
                        💳 Métodos de pago
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={datosMetodos}
                                dataKey="cantidad"
                                nameKey="metodo"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}>
                                {datosMetodos.map((_, i) => (
                                    <Cell key={i}
                                        fill={COLORES[i % COLORES.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    color: '#f1f5f9'
                                }} />
                            <Legend
                                formatter={(value) => (
                                    <span style={{ color: '#94a3b8' }}>
                                        {value}
                                    </span>
                                )} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Panel de IA */}
            <div style={styles.iaPanel}>
                <h3 style={styles.iaTitulo}>
                    🤖 Asistente IA — Análisis de MORA
                </h3>
                <p style={styles.iaSubtitulo}>
                    Pregúntale al asistente sobre las ventas y el rendimiento
                    del restaurante
                </p>

                {/* Sugerencias rápidas */}
                <div style={styles.sugerencias}>
                    {[
                        '¿Cuál es el producto más vendido?',
                        '¿Qué categoría genera más ingresos?',
                        '¿Cómo van las ventas?',
                        '¿Qué método de pago prefieren los clientes?'
                    ].map(s => (
                        <button
                            key={s}
                            onClick={() => setPreguntaIA(s)}
                            style={styles.sugerenciaBtn}>
                            {s}
                        </button>
                    ))}
                </div>

                <div style={styles.iaInput}>
                    <input
                        type="text"
                        value={preguntaIA}
                        onChange={e => setPreguntaIA(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && preguntarIA()}
                        placeholder="Escribe tu pregunta sobre las ventas..."
                        style={styles.input}
                    />
                    <button
                        onClick={preguntarIA}
                        disabled={loadingIA}
                        style={styles.btnPreguntar}>
                        {loadingIA ? '...' : 'Preguntar'}
                    </button>
                </div>

                {respuestaIA && (
                    <div style={styles.respuesta}>
                        <span style={styles.respuestaIcono}>🤖</span>
                        <p style={styles.respuestaTexto}>{respuestaIA}</p>
                    </div>
                )}
            </div>
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
    },
    kpis: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
    },
    kpi: {
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    kpiValor: {
        color: '#22c55e',
        fontSize: '26px',
        fontWeight: 'bold',
    },
    kpiLabel: {
        color: '#64748b',
        fontSize: '12px',
    },
    graficas: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
    },
    graficaCard: {
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '20px',
    },
    graficaTitulo: {
        color: '#f1f5f9',
        fontSize: '15px',
        margin: '0 0 16px 0',
    },
    iaPanel: {
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    iaTitulo: {
        color: '#f1f5f9',
        fontSize: '18px',
        margin: 0,
    },
    iaSubtitulo: {
        color: '#64748b',
        fontSize: '13px',
        margin: 0,
    },
    sugerencias: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
    },
    sugerenciaBtn: {
        padding: '8px 14px',
        borderRadius: '20px',
        border: '1px solid #334155',
        backgroundColor: 'transparent',
        color: '#94a3b8',
        cursor: 'pointer',
        fontSize: '12px',
    },
    iaInput: {
        display: 'flex',
        gap: '8px',
    },
    input: {
        flex: 1,
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #334155',
        backgroundColor: '#0f172a',
        color: '#f1f5f9',
        fontSize: '14px',
        outline: 'none',
    },
    btnPreguntar: {
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#f97316',
        color: 'white',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
    },
    respuesta: {
        backgroundColor: '#0f172a',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
    },
    respuestaIcono: {
        fontSize: '24px',
    },
    respuestaTexto: {
        color: '#cbd5e1',
        fontSize: '14px',
        lineHeight: '1.6',
        margin: 0,
    },
};