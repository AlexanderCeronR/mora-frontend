import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Landing() {
    const navigate = useNavigate();
    const [contador, setContador] = useState({ mesas: 0, pedidos: 0, productos: 0 });

    // Animación de contadores
    useEffect(() => {
        const metas = { mesas: 20, pedidos: 500, productos: 50 };
        const duracion = 2000;
        const pasos = 60;
        const intervalo = duracion / pasos;

        let paso = 0;
        const timer = setInterval(() => {
            paso++;
            const progreso = paso / pasos;
            setContador({
                mesas: Math.round(metas.mesas * progreso),
                pedidos: Math.round(metas.pedidos * progreso),
                productos: Math.round(metas.productos * progreso),
            });
            if (paso >= pasos) clearInterval(timer);
        }, intervalo);

        return () => clearInterval(timer);
    }, []);

    const caracteristicas = [
        {
            icono: '🍽️',
            titulo: 'Gestión de Mesas',
            descripcion: 'Control en tiempo real del estado de cada mesa — libre, ocupada o reservada.'
        },
        {
            icono: '📋',
            titulo: 'Pedidos Inteligentes',
            descripcion: 'Crea y gestiona pedidos con seguimiento de estados desde cocina hasta entrega.'
        },
        {
            icono: '💳',
            titulo: 'Caja y Pagos',
            descripcion: 'Registra pagos en efectivo, tarjeta o transferencia con historial completo.'
        },
        {
            icono: '📊',
            titulo: 'Dashboard & IA',
            descripcion: 'Analiza ventas con gráficas y pregúntale a la IA sobre el rendimiento del restaurante.'
        },
        {
            icono: '🔐',
            titulo: 'Roles y Seguridad',
            descripcion: 'Control de acceso por roles: Admin, Mesero y Cajero con JWT.'
        },
        {
            icono: '🍕',
            titulo: 'Gestión de Menú',
            descripcion: 'Administra productos por categorías con disponibilidad en tiempo real.'
        },
    ];

    return (
        <div style={styles.container}>

            {/* Navbar */}
            <nav style={styles.nav}>
                <span style={styles.navLogo}>MORA</span>
                <button
                    onClick={() => navigate('/login')}
                    style={styles.navBtn}>
                    Iniciar Sesión
                </button>
            </nav>

            {/* Hero */}
            <section style={styles.hero}>
                <div style={styles.heroBadge}>
                    🚀 Sistema de Gestión para Restaurantes
                </div>

                <h1 style={styles.heroTitle}>
                    Manager Of<br />
                    <span style={styles.heroTitleOrange}>
                        Restaurant Administration
                    </span>
                </h1>

                <p style={styles.heroSubtitle}>
                    Centraliza la gestión de tu restaurante — mesas, pedidos,
                    cocina, pagos y análisis inteligente con IA en un solo lugar.
                </p>

                <div style={styles.heroBtns}>
                    <button
                        onClick={() => navigate('/login')}
                        style={styles.btnPrimario}>
                        Comenzar ahora →
                    </button>
                    <button
                        onClick={() => document.getElementById('caracteristicas')
                            .scrollIntoView({ behavior: 'smooth' })}
                        style={styles.btnSecundario}>
                        Ver características
                    </button>
                </div>

                {/* Contadores animados */}
                <div style={styles.contadores}>
                    <div style={styles.contador}>
                        <span style={styles.contadorNumero}>
                            {contador.mesas}+
                        </span>
                        <span style={styles.contadorLabel}>Mesas gestionadas</span>
                    </div>
                    <div style={styles.contadorDivider} />
                    <div style={styles.contador}>
                        <span style={styles.contadorNumero}>
                            {contador.pedidos}+
                        </span>
                        <span style={styles.contadorLabel}>Pedidos procesados</span>
                    </div>
                    <div style={styles.contadorDivider} />
                    <div style={styles.contador}>
                        <span style={styles.contadorNumero}>
                            {contador.productos}+
                        </span>
                        <span style={styles.contadorLabel}>Productos en menú</span>
                    </div>
                </div>
            </section>

            {/* Características */}
            <section id="caracteristicas" style={styles.seccion}>
                <h2 style={styles.seccionTitulo}>
                    Todo lo que necesita tu restaurante
                </h2>
                <p style={styles.seccionSubtitulo}>
                    MORA centraliza cada aspecto de la operación diaria
                    en una plataforma moderna e intuitiva.
                </p>

                <div style={styles.grid}>
                    {caracteristicas.map((c, i) => (
                        <div key={i} style={styles.card}>
                            <span style={styles.cardIcono}>{c.icono}</span>
                            <h3 style={styles.cardTitulo}>{c.titulo}</h3>
                            <p style={styles.cardDescripcion}>{c.descripcion}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Flujo del sistema */}
            <section style={styles.flujoSeccion}>
                <h2 style={styles.seccionTitulo}>
                    ¿Cómo funciona MORA?
                </h2>

                <div style={styles.flujo}>
                    {[
                        { num: '01', titulo: 'Inicia sesión', desc: 'Accede con tu rol — Admin, Mesero o Cajero' },
                        { num: '02', titulo: 'Asigna mesa', desc: 'El mesero selecciona la mesa disponible' },
                        { num: '03', titulo: 'Crea pedido', desc: 'Agrega productos del menú al pedido' },
                        { num: '04', titulo: 'Cocina prepara', desc: 'El estado avanza en tiempo real' },
                        { num: '05', titulo: 'Entrega y cobra', desc: 'El cajero registra el pago fácilmente' },
                    ].map((paso, i) => (
                        <div key={i} style={styles.pasoCont}>
                            <div style={styles.paso}>
                                <span style={styles.pasoNum}>{paso.num}</span>
                                <h4 style={styles.pasoTitulo}>{paso.titulo}</h4>
                                <p style={styles.pasoDesc}>{paso.desc}</p>
                            </div>
                            {i < 4 && <span style={styles.pasoFlecha}>→</span>}
                        </div>
                    ))}
                </div>
            </section>

            {/* Roles */}
            <section style={styles.seccion}>
                <h2 style={styles.seccionTitulo}>Roles del sistema</h2>
                <div style={styles.rolesGrid}>
                    {[
                        {
                            rol: 'ADMIN',
                            color: '#f97316',
                            icono: '👑',
                            permisos: ['Gestionar mesas y productos', 'Ver todos los pedidos', 'Acceso al dashboard con IA', 'Gestionar usuarios']
                        },
                        {
                            rol: 'MESERO',
                            color: '#3b82f6',
                            icono: '🍽️',
                            permisos: ['Ver mesas disponibles', 'Crear y gestionar pedidos', 'Cambiar estado de pedidos', 'Ver el menú']
                        },
                        {
                            rol: 'CAJERO',
                            color: '#22c55e',
                            icono: '💳',
                            permisos: ['Ver pedidos entregados', 'Registrar pagos', 'Ver historial de caja', 'Acceso al dashboard']
                        },
                    ].map((r, i) => (
                        <div key={i} style={{
                            ...styles.rolCard,
                            borderTop: `3px solid ${r.color}`
                        }}>
                            <span style={styles.rolIcono}>{r.icono}</span>
                            <h3 style={{ ...styles.rolTitulo, color: r.color }}>
                                {r.rol}
                            </h3>
                            <ul style={styles.permisosList}>
                                {r.permisos.map((p, j) => (
                                    <li key={j} style={styles.permiso}>
                                        <span style={{ color: r.color }}>✓</span> {p}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA final */}
            <section style={styles.cta}>
                <h2 style={styles.ctaTitulo}>
                    ¿Listo para modernizar tu restaurante?
                </h2>
                <p style={styles.ctaSubtitulo}>
                    MORA centraliza tu operación y te da el control total
                    de tu negocio desde cualquier dispositivo.
                </p>
                <button
                    onClick={() => navigate('/login')}
                    style={styles.btnPrimario}>
                    Iniciar sesión →
                </button>
            </section>

            {/* Footer */}
            <footer style={styles.footer}>
                <span style={styles.footerLogo}>MORA</span>
                <span style={styles.footerText}>
                    Manager Of Restaurant Administration
                </span>
                <span style={styles.footerText}>
                    © 2026 — Desarrollado con Spring Boot + React
                </span>
            </footer>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        fontFamily: 'sans-serif',
        color: '#f1f5f9',
    },
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        borderBottom: '1px solid #1e293b',
        position: 'sticky',
        top: 0,
        backgroundColor: '#0f172a',
        zIndex: 100,
    },
    navLogo: {
        color: '#f97316',
        fontSize: '24px',
        fontWeight: 'bold',
        letterSpacing: '4px',
    },
    navBtn: {
        padding: '10px 24px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#f97316',
        color: 'white',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
    },
    hero: {
        textAlign: 'center',
        padding: '80px 40px 60px',
        maxWidth: '800px',
        margin: '0 auto',
    },
    heroBadge: {
        display: 'inline-block',
        padding: '8px 20px',
        borderRadius: '20px',
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        color: '#94a3b8',
        fontSize: '13px',
        marginBottom: '24px',
    },
    heroTitle: {
        fontSize: '56px',
        fontWeight: 'bold',
        lineHeight: '1.1',
        margin: '0 0 24px 0',
        color: '#f1f5f9',
    },
    heroTitleOrange: {
        color: '#f97316',
    },
    heroSubtitle: {
        fontSize: '18px',
        color: '#94a3b8',
        lineHeight: '1.6',
        marginBottom: '40px',
    },
    heroBtns: {
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '60px',
    },
    btnPrimario: {
        padding: '14px 32px',
        borderRadius: '10px',
        border: 'none',
        backgroundColor: '#f97316',
        color: 'white',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '16px',
    },
    btnSecundario: {
        padding: '14px 32px',
        borderRadius: '10px',
        border: '1px solid #334155',
        backgroundColor: 'transparent',
        color: '#cbd5e1',
        cursor: 'pointer',
        fontSize: '16px',
    },
    contadores: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '40px',
        flexWrap: 'wrap',
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        padding: '32px 48px',
        border: '1px solid #334155',
    },
    contador: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
    },
    contadorNumero: {
        color: '#f97316',
        fontSize: '36px',
        fontWeight: 'bold',
    },
    contadorLabel: {
        color: '#64748b',
        fontSize: '13px',
    },
    contadorDivider: {
        width: '1px',
        height: '48px',
        backgroundColor: '#334155',
    },
    seccion: {
        padding: '80px 40px',
        maxWidth: '1100px',
        margin: '0 auto',
    },
    seccionTitulo: {
        fontSize: '36px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '12px',
        color: '#f1f5f9',
    },
    seccionSubtitulo: {
        color: '#94a3b8',
        textAlign: 'center',
        fontSize: '16px',
        marginBottom: '48px',
        maxWidth: '600px',
        margin: '0 auto 48px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
    },
    card: {
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '28px',
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    cardIcono: {
        fontSize: '32px',
    },
    cardTitulo: {
        color: '#f1f5f9',
        fontSize: '18px',
        margin: 0,
    },
    cardDescripcion: {
        color: '#94a3b8',
        fontSize: '14px',
        lineHeight: '1.6',
        margin: 0,
    },
    flujoSeccion: {
        padding: '80px 40px',
        backgroundColor: '#1e293b',
    },
    flujo: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        maxWidth: '1100px',
        margin: '48px auto 0',
    },
    pasoCont: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    paso: {
        backgroundColor: '#0f172a',
        borderRadius: '12px',
        padding: '24px',
        width: '160px',
        textAlign: 'center',
        border: '1px solid #334155',
    },
    pasoNum: {
        color: '#f97316',
        fontSize: '28px',
        fontWeight: 'bold',
        display: 'block',
        marginBottom: '8px',
    },
    pasoTitulo: {
        color: '#f1f5f9',
        fontSize: '14px',
        margin: '0 0 8px 0',
    },
    pasoDesc: {
        color: '#64748b',
        fontSize: '12px',
        margin: 0,
        lineHeight: '1.4',
    },
    pasoFlecha: {
        color: '#f97316',
        fontSize: '24px',
        fontWeight: 'bold',
    },
    rolesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
        marginTop: '48px',
    },
    rolCard: {
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '28px',
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    rolIcono: {
        fontSize: '36px',
    },
    rolTitulo: {
        fontSize: '20px',
        fontWeight: 'bold',
        margin: 0,
        letterSpacing: '2px',
    },
    permisosList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    permiso: {
        color: '#94a3b8',
        fontSize: '14px',
        display: 'flex',
        gap: '8px',
    },
    cta: {
        textAlign: 'center',
        padding: '80px 40px',
        backgroundColor: '#1e293b',
        borderTop: '1px solid #334155',
    },
    ctaTitulo: {
        fontSize: '36px',
        fontWeight: 'bold',
        marginBottom: '16px',
        color: '#f1f5f9',
    },
    ctaSubtitulo: {
        color: '#94a3b8',
        fontSize: '16px',
        marginBottom: '32px',
        maxWidth: '500px',
        margin: '0 auto 32px',
    },
    footer: {
        padding: '32px 40px',
        borderTop: '1px solid #1e293b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
    },
    footerLogo: {
        color: '#f97316',
        fontWeight: 'bold',
        letterSpacing: '3px',
        fontSize: '18px',
    },
    footerText: {
        color: '#475569',
        fontSize: '13px',
    },
};