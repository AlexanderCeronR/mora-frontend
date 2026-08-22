import { useLocation } from 'react-router-dom';

const titulos = {
    '/dashboard': { titulo: 'Dashboard', sub: 'Métricas y análisis' },
    '/mesas':     { titulo: 'Mesas', sub: 'Estado del salón' },
    '/menu':      { titulo: 'Menú', sub: 'Productos y categorías' },
    '/pedidos':   { titulo: 'Pedidos', sub: 'Gestión de órdenes' },
    '/caja':      { titulo: 'Caja', sub: 'Pagos y facturación' },
    '/usuarios':  { titulo: 'Usuarios', sub: 'Gestión del equipo' },
};

export default function Header() {
    const location = useLocation();
    const info = titulos[location.pathname] || { titulo: 'MORA', sub: '' };

    return (
        <header style={styles.header}>
            <div>
                <h1 style={styles.titulo}>{info.titulo}</h1>
                {info.sub && (
                    <p style={styles.sub}>{info.sub}</p>
                )}
            </div>
            <div style={styles.right}>
                <div style={styles.pill}>
                    <div style={styles.dot} />
                    Sistema activo
                </div>
            </div>
        </header>
    );
}

const styles = {
    header: {
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-6)',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
    },
    titulo: {
        fontSize: 'var(--text-xl)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--text-primary)',
        margin: 0,
        lineHeight: 1.2,
    },
    sub: {
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        margin: 0,
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
    },
    pill: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'rgba(34,197,94,0.08)',
        border: '1px solid rgba(34,197,94,0.2)',
        color: 'var(--color-success)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-medium)',
    },
    dot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-success)',
        animation: 'pulse 2s infinite',
    },
};