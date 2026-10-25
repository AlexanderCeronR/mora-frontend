import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

import {
    LayoutDashboard, UtensilsCrossed, Table2,
    ShoppingBag, CreditCard, Users, LogOut,
    ClipboardList, ChefHat // ← nuevo ícono
} from 'lucide-react';

const navItems = [
    {
        path: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        roles: ['ADMIN', 'CAJERO']
    },
    {
        path: '/supervisor',
        label: 'Supervisor',
        icon: ClipboardList,
        roles: ['ADMIN', 'SUPERVISOR']
    },
    {
        path: '/mesas',
        label: 'Mesas',
        icon: Table2,
        roles: ['ADMIN', 'MESERO', 'CAJERO', 'SUPERVISOR']
    },
    {
        path: '/menu',
        label: 'Menú',
        icon: UtensilsCrossed,
        roles: ['ADMIN', 'MESERO', 'CAJERO', 'SUPERVISOR']
    },
    {
        path: '/pedidos',
        label: 'Pedidos',
        icon: ShoppingBag,
        roles: ['ADMIN', 'MESERO', 'SUPERVISOR']
    },
    {
        path: '/caja',
        label: 'Caja',
        icon: CreditCard,
        roles: ['ADMIN', 'CAJERO']
    },
    {
        path: '/usuarios',
        label: 'Usuarios',
        icon: Users,
        roles: ['ADMIN']
    },
    {
        path: '/cocina',
        label: 'Cocina',
        icon: ChefHat,
        roles: ['ADMIN', 'COCINA', 'SUPERVISOR']
    },
    { theme, toggleTheme } = useTheme()
];

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { usuario, logout } = useAuth();

    const itemsFiltrados = navItems.filter(item =>
        item.roles.includes(usuario?.rol)
    );

    return (
        <aside style={styles.sidebar}>
            {/* Logo */}
            <div style={styles.logo} onClick={() => navigate('/')}>
                <div style={styles.logoIcon}>M</div>
                <div>
                    <p style={styles.logoName}>MORA</p>
                    <p style={styles.logoSub}>Restaurant Admin</p>
                </div>
            </div>

            {/* Nav */}
            <nav style={styles.nav}>
                {itemsFiltrados.map(item => {
                    const Icon = item.icon;
                    const active = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={{
                                ...styles.navItem,
                                ...(active ? styles.navItemActive : {})
                            }}
                            onMouseEnter={e => {
                                if (!active) {
                                    e.currentTarget.style.backgroundColor =
                                        'var(--bg-elevated)';
                                    e.currentTarget.style.color =
                                        'var(--text-primary)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!active) {
                                    e.currentTarget.style.backgroundColor =
                                        'transparent';
                                    e.currentTarget.style.color =
                                        'var(--text-secondary)';
                                }
                            }}>
                            <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                            <span>{item.label}</span>
                            {active && <div style={styles.activeDot} />}
                        </button>
                    );
                })}
            </nav>

            {/* Footer del sidebar */}
            <div style={styles.sidebarFooter}>
                {/* Info del usuario */}
                <div style={styles.userInfo}>
                    <div style={styles.userAvatar}>
                        {usuario?.nombre?.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.userDetails}>
                        <p style={styles.userName}>{usuario?.nombre}</p>
                        <p style={styles.userRole}>{usuario?.rol}</p>
                    </div>
                </div>

                <button
    onClick={toggleTheme}
    style={styles.logoutBtn}>
    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
</button>

                {/* Logout */}
                <button
                    onClick={logout}
                    style={styles.logoutBtn}
                    onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor =
                            'var(--color-danger-10)';
                        e.currentTarget.style.color =
                            'var(--color-danger)';
                        e.currentTarget.style.borderColor =
                            'var(--color-danger)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.borderColor =
                            'var(--border-default)';
                    }}>
                    <LogOut size={16} />
                    Cerrar sesión
                </button>
            </div>
        </aside>
    );
}

const styles = {
    sidebar: {
        width: '240px',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 'var(--z-sidebar)',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '24px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        cursor: 'pointer',
    },
    logoIcon: {
        width: '36px',
        height: '36px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--gradient-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'var(--font-bold)',
        fontSize: '18px',
        flexShrink: 0,
        boxShadow: 'var(--shadow-glow)',
    },
    logoName: {
        color: 'var(--text-primary)',
        fontWeight: 'var(--font-bold)',
        fontSize: 'var(--text-lg)',
        letterSpacing: '2px',
        margin: 0,
        lineHeight: 1.2,
    },
    logoSub: {
        color: 'var(--text-muted)',
        fontSize: 'var(--text-xs)',
        margin: 0,
        letterSpacing: '0.3px',
    },
    nav: {
        flex: 1,
        padding: '12px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        overflowY: 'auto',
    },
    navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingRight: '12px',
    paddingLeft: '12px',
    borderRadius: 'var(--radius-md)',
    borderLeft: '2px solid transparent',
    borderTop: 'none',
    borderRight: 'none',
    borderBottom: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-medium)',
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'all var(--transition-fast)',
    position: 'relative',
},
navItemActive: {
    backgroundColor: 'var(--color-primary-10)',
    color: 'var(--color-primary-light)',
    fontWeight: 'var(--font-semibold)',
    borderLeft: '2px solid var(--color-primary)',
    paddingLeft: '10px',
},
    activeDot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: 'var(--gradient-primary)',
        marginLeft: 'auto',
        flexShrink: 0,
    },
    sidebarFooter: {
        padding: '16px 12px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-elevated)',
    },
    userAvatar: {
        width: '32px',
        height: '32px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--gradient-accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'var(--font-bold)',
        fontSize: 'var(--text-sm)',
        flexShrink: 0,
    },
    userDetails: {
        overflow: 'hidden',
    },
    userName: {
        color: 'var(--text-primary)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-medium)',
        margin: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    userRole: {
        color: 'var(--text-muted)',
        fontSize: 'var(--text-xs)',
        margin: 0,
    },
    logoutBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        backgroundColor: 'transparent',
        color: 'var(--text-muted)',
        fontSize: 'var(--text-sm)',
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        width: '100%',
        transition: 'all var(--transition-fast)',
    },
};