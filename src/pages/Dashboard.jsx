import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PageTransition from '../components/ui/PageTransition';
import { SkeletonCard } from '../components/ui/Skeleton';
import { showToast } from '../components/ui/Toast';
import { useTheme } from '../context/ThemeContext';
import {
    TrendingUp, ShoppingBag, CreditCard, Receipt,
    Send, Sparkles, Trophy, PieChart as PieChartIcon, Wallet
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, PieChart, Pie, Cell,
    ResponsiveContainer, Legend
} from 'recharts';

// Paleta de color (modo oscuro)
const PALETA = [
    { base: '#443199', light: '#8b73f0' },
    { base: '#792CA2', light: '#c067ea' },
    { base: '#C13383', light: '#f777b6' },
    { base: '#E05454', light: '#ff9494' },
    { base: '#f59e0b', light: '#fde047' },
];

// Paleta blanco y negro (modo claro)
const PALETA_BN = [
    { base: '#000000', light: '#4d4d4d' },
    { base: '#404040', light: '#8c8c8c' },
    { base: '#808080', light: '#bfbfbf' },
    { base: '#b3b3b3', light: '#e6e6e6' },
    { base: '#d9d9d9', light: '#ffffff' },
];

const TooltipEstilo = {
    contentStyle: {
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: '10px',
        color: 'var(--text-primary)',
        fontSize: '13px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    },
    itemStyle: { color: 'var(--text-primary)' },
};

// Degradados tipo cilindro para las barras (efecto 3D)
const defsBarras = (paleta) => (
    <defs>
        {paleta.map((c, i) => (
            <linearGradient
                key={i}
                id={`barra-${i}`}
                x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={c.base} />
                <stop offset="35%" stopColor={c.light} />
                <stop offset="100%" stopColor={c.base} />
            </linearGradient>
        ))}
    </defs>
);

// Degradados radiales tipo esfera con brillo para las tortas
const defsTorta = (prefijo, paleta) => (
    <defs>
        {paleta.map((c, i) => (
            <radialGradient
                key={i}
                id={`${prefijo}-${i}`}
                cx="50%" cy="50%" r="75%" fx="30%" fy="25%">
                <stop offset="0%" stopColor={c.light} />
                <stop offset="100%" stopColor={c.base} />
            </radialGradient>
        ))}
    </defs>
);

const sombra = (color) => ({
    filter: `drop-shadow(0 6px 8px ${color}66)`,
});

export default function Dashboard() {
    const { theme } = useTheme();
    const claro = theme === 'light';
    const paleta = claro ? PALETA_BN : PALETA;

    const [datos, setDatos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [preguntaIA, setPreguntaIA] = useState('');
    const [respuestaIA, setRespuestaIA] = useState('');
    const [loadingIA, setLoadingIA] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const res = await axiosClient.get('/reportes/resumen');
            setDatos(res.data);
        } catch {
            showToast('Error al cargar el dashboard', 'error');
        } finally {
            setLoading(false);
        }
    };

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

            const texto = response.data?.content?.[0]?.text || 'Sin respuesta';
            setRespuestaIA(texto);
            showToast('Respuesta generada', 'success');
        } catch {
            setRespuestaIA('Error al conectar con la IA');
            showToast('Error al conectar con la IA', 'error');
        } finally {
            setLoadingIA(false);
        }
    };

    const kpis = [
        {
            label: 'Total Ventas',
            valor: `$${datos?.totalVentas?.toLocaleString() || 0}`,
            icon: TrendingUp,
            color: claro ? '#000000' : '#8b73f0',
            gradient: 'var(--gradient-primary)',
        },
        {
            label: 'Total Pedidos',
            valor: datos?.totalPedidos || 0,
            icon: ShoppingBag,
            color: claro ? '#000000' : '#c067ea',
            gradient: 'var(--gradient-accent)',
        },
        {
            label: 'Pagos Registrados',
            valor: datos?.totalPagos || 0,
            icon: CreditCard,
            color: claro ? '#000000' : '#f777b6',
            gradient: claro
                ? '#000000'
                : 'linear-gradient(135deg, #C13383, #E05454)',
        },
        {
            label: 'Ticket Promedio',
            valor: `$${datos?.totalPedidos > 0
                ? Math.round(datos?.totalVentas / datos?.totalPedidos)
                    .toLocaleString()
                : 0}`,
            icon: Receipt,
            color: claro ? '#000000' : '#ff9494',
            gradient: claro
                ? '#000000'
                : 'linear-gradient(135deg, #E05454, #f59e0b)',
        },
    ];

    const sugerencias = [
        '¿Cuál es el producto más vendido?',
        '¿Qué categoría genera más ingresos?',
        '¿Cómo van las ventas?',
        '¿Qué método de pago prefieren los clientes?',
    ];

    if (loading) return (
        <div style={styles.container}>
            <div style={styles.kpiGrid}>
                {[1, 2, 3, 4].map(i => (
                    <SkeletonCard key={i} lines={1} />
                ))}
            </div>
            <div style={styles.graficasGrid}>
                {[1, 2, 3].map(i => (
                    <SkeletonCard key={i} lines={4} />
                ))}
            </div>
        </div>
    );

    return (
        <PageTransition>
            <div style={styles.container}>

                {/* KPIs */}
                <div style={styles.kpiGrid}>
                    {kpis.map((kpi, i) => {
                        const Icon = kpi.icon;
                        return (
                            <Card key={i} style={styles.kpiCard}>
                                <div style={styles.kpiTop}>
                                    <div style={{
                                        ...styles.kpiIcon,
                                        background: kpi.gradient,
                                    }}>
                                        <Icon size={18} color="white" />
                                    </div>
                                    <span style={styles.kpiLabel}>
                                        {kpi.label}
                                    </span>
                                </div>
                                <p style={{
                                    ...styles.kpiValor,
                                    color: kpi.color,
                                }}>
                                    {kpi.valor}
                                </p>
                            </Card>
                        );
                    })}
                </div>

                {/* Gráficas */}
                <div style={styles.graficasGrid}>

                    {/* Productos más vendidos */}
                    <Card style={styles.graficaCard}>
                        <div style={styles.graficaHeader}>
                            <div style={{
                                ...styles.graficaIcono,
                                background: 'var(--gradient-primary)'
                            }}>
                                <Trophy size={15} color="white" />
                            </div>
                            <h3 style={styles.graficaTitulo}>
                                Productos más vendidos
                            </h3>
                        </div>
                        <ResponsiveContainer width="100%" height={230}>
                            <BarChart
                                data={datosProductos}
                                barCategoryGap="22%"
                                margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                                {defsBarras(paleta)}
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="var(--border-subtle)"
                                    vertical={false} />
                                <XAxis
                                    dataKey="nombre"
                                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                    angle={-25}
                                    textAnchor="end"
                                    axisLine={false}
                                    tickLine={false} />
                                <YAxis
                                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(128,128,128,0.08)' }}
                                    {...TooltipEstilo} />
                                <Bar
                                    dataKey="cantidad"
                                    radius={[8, 8, 0, 0]}>
                                    {datosProductos.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={`url(#barra-${i % paleta.length})`}
                                            style={sombra(paleta[i % paleta.length].base)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Ventas por categoría */}
                    <Card style={styles.graficaCard}>
                        <div style={styles.graficaHeader}>
                            <div style={{
                                ...styles.graficaIcono,
                                background: 'var(--gradient-accent)'
                            }}>
                                <PieChartIcon size={15} color="white" />
                            </div>
                            <h3 style={styles.graficaTitulo}>
                                Ventas por categoría
                            </h3>
                        </div>
                        <ResponsiveContainer width="100%" height={230}>
                            <PieChart>
                                {defsTorta('cat', paleta)}
                                <Pie
                                    data={datosCategorias}
                                    dataKey="total"
                                    nameKey="categoria"
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={48}
                                    outerRadius={82}
                                    paddingAngle={4}
                                    cornerRadius={6}
                                    stroke="none">
                                    {datosCategorias.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={`url(#cat-${i % paleta.length})`}
                                            style={sombra(paleta[i % paleta.length].base)} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={v => `$${v.toLocaleString()}`}
                                    {...TooltipEstilo} />
                                <Legend
                                    iconType="circle"
                                    formatter={v => (
                                        <span style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: 12
                                        }}>
                                            {v}
                                        </span>
                                    )} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Métodos de pago */}
                    <Card style={styles.graficaCard}>
                        <div style={styles.graficaHeader}>
                            <div style={{
                                ...styles.graficaIcono,
                                background: claro
                                    ? '#000000'
                                    : 'linear-gradient(135deg, #C13383, #E05454)'
                            }}>
                                <Wallet size={15} color="white" />
                            </div>
                            <h3 style={styles.graficaTitulo}>
                                Métodos de pago
                            </h3>
                        </div>
                        <ResponsiveContainer width="100%" height={230}>
                            <PieChart>
                                {defsTorta('met', paleta)}
                                <Pie
                                    data={datosMetodos}
                                    dataKey="cantidad"
                                    nameKey="metodo"
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={48}
                                    outerRadius={82}
                                    paddingAngle={4}
                                    cornerRadius={6}
                                    stroke="none">
                                    {datosMetodos.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={`url(#met-${i % paleta.length})`}
                                            style={sombra(paleta[i % paleta.length].base)} />
                                    ))}
                                </Pie>
                                <Tooltip {...TooltipEstilo} />
                                <Legend
                                    iconType="circle"
                                    formatter={v => (
                                        <span style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: 12
                                        }}>
                                            {v}
                                        </span>
                                    )} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                {/* Panel IA */}
                <Card style={styles.iaCard}>
                    <div style={styles.iaHeader}>
                        <div style={styles.iaIconWrap}>
                            <Sparkles size={18} color="white" />
                        </div>
                        <div>
                            <h3 style={styles.iaTitulo}>
                                Asistente IA — Análisis de MORA
                            </h3>
                            <p style={styles.iaSub}>
                                Pregúntale al asistente sobre ventas y rendimiento
                            </p>
                        </div>
                    </div>

                    <div style={styles.sugerencias}>
                        {sugerencias.map(s => (
                            <button
                                key={s}
                                onClick={() => setPreguntaIA(s)}
                                style={styles.sugerenciaBtn}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor =
                                        'var(--color-primary)';
                                    e.currentTarget.style.color =
                                        'var(--text-primary)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor =
                                        'var(--border-default)';
                                    e.currentTarget.style.color =
                                        'var(--text-muted)';
                                }}>
                                {s}
                            </button>
                        ))}
                    </div>

                    <div style={styles.iaInputRow}>
                        <input
                            value={preguntaIA}
                            onChange={e => setPreguntaIA(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && preguntarIA()}
                            placeholder="Escribe tu pregunta sobre las ventas..."
                            style={styles.iaInput}
                            onFocus={e => {
                                e.target.style.borderColor = 'var(--color-primary)';
                                e.target.style.boxShadow =
                                    '0 0 0 3px rgba(128,128,128,0.2)';
                            }}
                            onBlur={e => {
                                e.target.style.borderColor = 'var(--border-default)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                        <Button
                            onClick={preguntarIA}
                            disabled={loadingIA}
                            variant="primary">
                            <Send size={15} />
                            {loadingIA ? 'Analizando...' : 'Preguntar'}
                        </Button>
                    </div>

                    {respuestaIA && (
                        <div style={styles.respuesta}>
                            <div style={styles.respuestaIcon}>
                                <Sparkles size={14} color="white" />
                            </div>
                            <p style={styles.respuestaTexto}>{respuestaIA}</p>
                        </div>
                    )}
                </Card>
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
    kpiGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 'var(--space-4)',
    },
    kpiCard: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
    },
    kpiTop: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
    },
    kpiIcon: {
        width: '36px',
        height: '36px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    kpiLabel: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-muted)',
        fontWeight: 'var(--font-medium)',
    },
    kpiValor: {
        fontSize: 'var(--text-3xl)',
        fontWeight: 'var(--font-bold)',
        margin: 0,
        lineHeight: 1,
    },
    graficasGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 'var(--space-4)',
    },
    graficaCard: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
    },
    graficaHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
    },
    graficaIcono: {
        width: '30px',
        height: '30px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: 'var(--shadow-glow)',
    },
    graficaTitulo: {
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--text-primary)',
        margin: 0,
    },
    iaCard: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
    },
    iaHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
    },
    iaIconWrap: {
        width: '40px',
        height: '40px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--gradient-accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: 'var(--shadow-glow-accent)',
    },
    iaTitulo: {
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--text-primary)',
        margin: 0,
    },
    iaSub: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-muted)',
        margin: 0,
    },
    sugerencias: {
        display: 'flex',
        gap: 'var(--space-2)',
        flexWrap: 'wrap',
    },
    sugerenciaBtn: {
        padding: '6px 14px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border-default)',
        backgroundColor: 'transparent',
        color: 'var(--text-muted)',
        fontSize: 'var(--text-sm)',
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
    },
    iaInputRow: {
        display: 'flex',
        gap: 'var(--space-3)',
    },
    iaInput: {
        flex: 1,
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
        fontSize: 'var(--text-base)',
        fontFamily: 'var(--font-sans)',
        outline: 'none',
        transition: 'all var(--transition-fast)',
    },
    respuesta: {
        display: 'flex',
        gap: 'var(--space-3)',
        alignItems: 'flex-start',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-primary-10)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
    },
    respuestaIcon: {
        width: '28px',
        height: '28px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--gradient-accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    respuestaTexto: {
        color: 'var(--text-primary)',
        fontSize: 'var(--text-sm)',
        lineHeight: '1.6',
        margin: 0,
    },
};