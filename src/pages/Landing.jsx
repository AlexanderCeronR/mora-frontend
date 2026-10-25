import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table2, ShoppingBag, CreditCard,
    BarChart2, Shield, Sparkles,
    ArrowRight, Check
} from 'lucide-react';
import ThemeSwitch from '../components/ui/ThemeSwitch';

export default function Landing() {
    const navigate = useNavigate();
    const [contador, setContador] = useState({
        mesas: 0, pedidos: 0, usuarios: 0
    });

    useEffect(() => {
        const metas = { mesas: 20, pedidos: 500, usuarios: 50 };
        const pasos = 60;
        let paso = 0;
        const timer = setInterval(() => {
            paso++;
            const p = paso / pasos;
            setContador({
                mesas: Math.round(metas.mesas * p),
                pedidos: Math.round(metas.pedidos * p),
                usuarios: Math.round(metas.usuarios * p),
            });
            if (paso >= pasos) clearInterval(timer);
        }, 2000 / pasos);
        return () => clearInterval(timer);
    }, []);

    const features = [
        {
            icon: Table2,
            titulo: 'Gestión de Mesas',
            desc: 'Control en tiempo real del estado de cada mesa — libre, ocupada o reservada.',
            color: '#443199',
        },
        {
            icon: ShoppingBag,
            titulo: 'Pedidos Inteligentes',
            desc: 'Crea y gestiona pedidos con seguimiento de estados desde cocina hasta entrega.',
            color: '#792CA2',
        },
        {
            icon: CreditCard,
            titulo: 'Caja y Pagos',
            desc: 'Registra pagos en efectivo, tarjeta o transferencia con historial completo.',
            color: '#C13383',
        },
        {
            icon: BarChart2,
            titulo: 'Dashboard & Analytics',
            desc: 'Analiza ventas con gráficas en tiempo real y métricas clave del negocio.',
            color: '#E05454',
        },
        {
            icon: Sparkles,
            titulo: 'Asistente con IA',
            desc: 'Pregúntale a la IA sobre el rendimiento de tu restaurante y obtén insights.',
            color: '#792CA2',
        },
        {
            icon: Shield,
            titulo: 'Roles y Seguridad',
            desc: 'Control de acceso por roles: Admin, Mesero y Cajero con JWT.',
            color: '#443199',
        },
    ];

    const roles = [
        {
            rol: 'ADMIN',
            color: '#f59e0b',
            gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            permisos: [
                'Gestión completa del sistema',
                'Crear y administrar usuarios',
                'Acceso al dashboard y analytics',
                'Configurar mesas y menú',
            ]
        },
        {
            rol: 'MESERO',
            color: '#443199',
            gradient: 'var(--gradient-primary)',
            permisos: [
                'Ver mesas disponibles',
                'Crear y gestionar pedidos',
                'Avanzar estados de pedidos',
                'Consultar el menú',
            ]
        },
        {
            rol: 'CAJERO',
            color: '#22c55e',
            gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
            permisos: [
                'Ver pedidos entregados',
                'Registrar pagos',
                'Ver historial de caja',
                'Acceso al dashboard',
            ]
        },
    ];

    const flujo = [
        { num: '01', titulo: 'Login', desc: 'Accede con tu rol asignado' },
        { num: '02', titulo: 'Mesa', desc: 'Asigna una mesa disponible' },
        { num: '03', titulo: 'Pedido', desc: 'Crea el pedido con productos' },
        { num: '04', titulo: 'Cocina', desc: 'Sigue el estado en tiempo real' },
        { num: '05', titulo: 'Cobro', desc: 'El cajero registra el pago' },
    ];

    return (
        <div style={styles.page}>

            {/* Navbar */}
            <nav style={styles.nav}>
                <div style={styles.navLogo}>
                    <div style={styles.navLogoIcon}>M</div>
                    <span style={styles.navLogoText}>MORA</span>
                </div>
                <div style={styles.navRight}>
    <span style={styles.navSub}>
        Manager Of Restaurant Administration
    </span>
    <ThemeSwitch />
    <button onClick={() => navigate('/login')} style={styles.navBtn}>
        Iniciar sesión
        <ArrowRight size={14} />
    </button>
</div>
            </nav>

            {/* Hero */}
            <section style={styles.hero}>
                <div style={styles.heroBadge}>
                    <Sparkles size={13} />
                    Sistema de gestión con IA integrada
                </div>

                <h1 style={styles.heroTitle}>
                    Gestiona tu restaurante
                    <span style={styles.heroTitleGradient}>
                        {' '}con inteligencia
                    </span>
                </h1>

                <p style={styles.heroDesc}>
                    MORA centraliza mesas, pedidos, caja y análisis inteligente
                    en una plataforma moderna diseñada para restaurantes modernos.
                </p>

                <div style={styles.heroBtns}>
                    <button
                        onClick={() => navigate('/login')}
                        style={styles.heroBtnPrimary}>
                        Comenzar ahora
                        <ArrowRight size={16} />
                    </button>
                    <button
                        onClick={() => document.getElementById('features')
                            .scrollIntoView({ behavior: 'smooth' })}
                        style={styles.heroBtnGhost}>
                        Ver características
                    </button>
                </div>

                {/* Contadores */}
                <div style={styles.contadores}>
                    {[
                        { num: `${contador.mesas}+`, label: 'Mesas gestionadas' },
                        { num: `${contador.pedidos}+`, label: 'Pedidos procesados' },
                        { num: `${contador.usuarios}+`, label: 'Usuarios activos' },
                    ].map((c, i) => (
                        <div key={i} style={styles.contador}>
                            <span style={styles.contadorNum}>{c.num}</span>
                            <span style={styles.contadorLabel}>{c.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section id="features" style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>
                        Todo lo que necesita tu restaurante
                    </h2>
                    <p style={styles.sectionDesc}>
                        Una plataforma completa para gestionar cada aspecto
                        de la operación diaria.
                    </p>
                </div>

                <div style={styles.featuresGrid}>
                    {features.map((f, i) => {
                        const Icon = f.icon;
                        return (
                            <div key={i} style={styles.featureCard}>
                                <div style={{
                                    ...styles.featureIcon,
                                    backgroundColor: f.color + '15',
                                    border: `1px solid ${f.color}30`,
                                }}>
                                    <Icon size={20} color={f.color} />
                                </div>
                                <h3 style={styles.featureTitulo}>
                                    {f.titulo}
                                </h3>
                                <p style={styles.featureDesc}>{f.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Flujo */}
            <section style={styles.flujoSection}>
                <h2 style={styles.sectionTitle}>¿Cómo funciona MORA?</h2>
                <div style={styles.flujoGrid}>
                    {flujo.map((paso, i) => (
                        <div key={i} style={styles.flujoItem}>
                            <div style={styles.flujoPaso}>
                                <span style={styles.flujoNum}>{paso.num}</span>
                                <h4 style={styles.flujoTitulo}>{paso.titulo}</h4>
                                <p style={styles.flujoDesc}>{paso.desc}</p>
                            </div>
                            {i < flujo.length - 1 && (
                                <ArrowRight
                                    size={20}
                                    color="var(--color-primary)"
                                    style={styles.flujoArrow} />
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Roles */}
            <section style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Roles del sistema</h2>
                    <p style={styles.sectionDesc}>
                        Cada usuario tiene acceso solo a lo que necesita.
                    </p>
                </div>
                <div style={styles.rolesGrid}>
                    {roles.map((r, i) => (
                        <div key={i} style={{
                            ...styles.rolCard,
                            borderTop: `3px solid ${r.color}`,
                        }}>
                            <div style={{
                                ...styles.rolBadge,
                                background: r.gradient,
                            }}>
                                {r.rol}
                            </div>
                            <div style={styles.rolPermisos}>
                                {r.permisos.map((p, j) => (
                                    <div key={j} style={styles.rolPermiso}>
                                        <Check
                                            size={14}
                                            color={r.color} />
                                        <span style={styles.rolPermisoTxt}>
                                            {p}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={styles.cta}>
                <div style={styles.ctaContent}>
                    <h2 style={styles.ctaTitle}>
                        ¿Listo para modernizar tu restaurante?
                    </h2>
                    <p style={styles.ctaDesc}>
                        Empieza hoy y transforma la gestión de tu negocio.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        style={styles.ctaBtn}>
                        Acceder a MORA
                        <ArrowRight size={16} />
                    </button>
                </div>
                <div style={styles.ctaDecor1} />
                <div style={styles.ctaDecor2} />
            </section>

            {/* Footer */}
            <footer style={styles.footer}>
                <div style={styles.footerLogo}>
                    <div style={styles.footerLogoIcon}>M</div>
                    <span style={styles.footerLogoText}>MORA</span>
                </div>
                <p style={styles.footerDesc}>
                    Manager Of Restaurant Administration
                </p>
                <p style={styles.footerCopy}>
                    © 2026 — Desarrollado con Spring Boot + React
                </p>
            </footer>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
    },
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 60px',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--nav-bg)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
    },
    navLogo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    navLogoIcon: {
        width: '32px',
        height: '32px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--gradient-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'var(--font-bold)',
        fontSize: '16px',
    },
    navLogoText: {
        color: 'var(--text-primary)',
        fontWeight: 'var(--font-bold)',
        fontSize: 'var(--text-lg)',
        letterSpacing: '2px',
    },
    navRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    navSub: {
        color: 'var(--text-muted)',
        fontSize: 'var(--text-sm)',
    },
    navBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '9px 20px',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        background: 'var(--gradient-primary)',
        color: 'white',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-semibold)',
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-glow)',
    },
    hero: {
        textAlign: 'center',
        padding: '100px 60px 80px',
        maxWidth: '800px',
        margin: '0 auto',
    },
    heroBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 16px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--color-primary-10)',
        border: '1px solid var(--color-primary-10)',
        color: 'var(--color-primary-light)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-medium)',
        marginBottom: '28px',
    },
    heroTitle: {
        fontSize: '52px',
        fontWeight: 'var(--font-bold)',
        lineHeight: 1.1,
        margin: '0 0 20px 0',
        color: 'var(--text-primary)',
    },
    heroTitleGradient: {
        background: 'var(--gradient-full)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    heroDesc: {
        fontSize: 'var(--text-lg)',
        color: 'var(--text-secondary)',
        lineHeight: 1.7,
        marginBottom: '40px',
    },
    heroBtns: {
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '64px',
    },
    heroBtnPrimary: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 32px',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        background: 'var(--gradient-primary)',
        color: 'white',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-semibold)',
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-glow)',
    },
    heroBtnGhost: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 32px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)',
        fontSize: 'var(--text-base)',
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
    },
    contadores: {
        display: 'flex',
        justifyContent: 'center',
        gap: '60px',
        padding: '32px 48px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
    },
    contador: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
    },
    contadorNum: {
        fontSize: 'var(--text-3xl)',
        fontWeight: 'var(--font-bold)',
        background: 'var(--gradient-accent)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    contadorLabel: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-muted)',
    },
    section: {
        padding: '80px 60px',
        maxWidth: '1100px',
        margin: '0 auto',
    },
    sectionHeader: {
        textAlign: 'center',
        marginBottom: '48px',
    },
    sectionTitle: {
        fontSize: 'var(--text-3xl)',
        fontWeight: 'var(--font-bold)',
        color: 'var(--text-primary)',
        margin: '0 0 12px 0',
    },
    sectionDesc: {
        fontSize: 'var(--text-base)',
        color: 'var(--text-secondary)',
        maxWidth: '520px',
        margin: '0 auto',
        lineHeight: 1.6,
    },
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
    },
    featureCard: {
        padding: '28px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all var(--transition-base)',
    },
    featureIcon: {
        width: '44px',
        height: '44px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureTitulo: {
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--text-primary)',
        margin: 0,
    },
    featureDesc: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
        margin: 0,
    },
    flujoSection: {
        padding: '80px 60px',
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        textAlign: 'center',
    },
    flujoGrid: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '48px',
        maxWidth: '900px',
        margin: '48px auto 0',
    },
    flujoItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    flujoPaso: {
        padding: '20px',
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
        width: '140px',
        textAlign: 'center',
    },
    flujoNum: {
        display: 'block',
        fontSize: 'var(--text-2xl)',
        fontWeight: 'var(--font-bold)',
        background: 'var(--gradient-primary)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '8px',
    },
    flujoTitulo: {
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--text-primary)',
        margin: '0 0 4px 0',
    },
    flujoDesc: {
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        margin: 0,
        lineHeight: 1.4,
    },
    flujoArrow: {
        flexShrink: 0,
        opacity: 0.5,
    },
    rolesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
    },
    rolCard: {
        padding: '28px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    rolBadge: {
        display: 'inline-flex',
        padding: '6px 16px',
        borderRadius: 'var(--radius-full)',
        color: 'white',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-bold)',
        letterSpacing: '1px',
        alignSelf: 'flex-start',
    },
    rolPermisos: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    rolPermiso: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    rolPermisoTxt: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
    },
    cta: {
        position: 'relative',
        textAlign: 'center',
        padding: '80px 60px',
        background: 'var(--gradient-full)',
        overflow: 'hidden',
    },
    ctaContent: {
        position: 'relative',
        zIndex: 2,
    },
    ctaTitle: {
        fontSize: 'var(--text-3xl)',
        fontWeight: 'var(--font-bold)',
        color: 'white',
        margin: '0 0 12px 0',
    },
    ctaDesc: {
        fontSize: 'var(--text-base)',
        color: 'rgba(255,255,255,0.75)',
        marginBottom: '32px',
    },
    ctaBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 32px',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        backgroundColor: 'var(--cta-bg)',
        color: 'var(--cta-text)',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-bold)',
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-lg)',
    },
    ctaDecor1: {
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.06)',
        top: '-80px',
        right: '-60px',
    },
    ctaDecor2: {
        position: 'absolute',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.06)',
        bottom: '-60px',
        left: '-40px',
    },
    footer: {
        padding: '40px 60px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
    },
    footerLogo: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    footerLogoIcon: {
        width: '28px',
        height: '28px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--gradient-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'var(--font-bold)',
        fontSize: '14px',
    },
    footerLogoText: {
        color: 'var(--text-primary)',
        fontWeight: 'var(--font-bold)',
        letterSpacing: '2px',
        fontSize: 'var(--text-base)',
    },
    footerDesc: {
        color: 'var(--text-muted)',
        fontSize: 'var(--text-sm)',
        margin: 0,
    },
    footerCopy: {
        color: 'var(--text-disabled)',
        fontSize: 'var(--text-xs)',
        margin: 0,
    },
};