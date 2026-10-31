import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { showToast } from '../components/ui/Toast';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import ThemeSwitch from '../components/ui/ThemeSwitch';

const RUTA_POR_ROL = {
    ADMIN: '/dashboard',
    SUPERVISOR: '/supervisor',
    MESERO: '/pedidos',
    CAJERO: '/caja',
    COCINA: '/cocina',
};

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            showToast('Completa todos los campos', 'warning');
            return;
        }
        setLoading(true);
        try {
            const response = await axiosClient.post('/auth/login', {
                email, password
            });
            const { token, nombre, rol, id } = response.data;
            login({ id, nombre, email, rol }, token);
            showToast(`Bienvenido, ${nombre}`, 'success');
            navigate(RUTA_POR_ROL[rol] || '/mesas');
        } catch {
            showToast('Email o contraseña incorrectos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const focoOn = e => {
        e.target.style.borderColor = 'var(--color-primary)';
        e.target.style.boxShadow = '0 0 0 3px rgba(128,128,128,0.2)';
    };
    const focoOff = e => {
        e.target.style.borderColor = 'var(--border-default)';
        e.target.style.boxShadow = 'none';
    };

    return (
        <PageTransition>
            <div style={styles.wrapper}>

                {/* Panel izquierdo — decorativo */}
                <div className="login-left" style={styles.leftPanel}>
                    <div style={styles.leftContent}>
                        <div style={styles.logoWrap}>
                            <div style={styles.logoIcon}>M</div>
                            <span style={styles.logoText}>MORA</span>
                        </div>
                        <h1 style={styles.leftTitle}>
                            Gestiona tu restaurante con inteligencia
                        </h1>
                        <p style={styles.leftSub}>
                            Mesas, pedidos, caja y análisis en una sola
                            plataforma moderna.
                        </p>

                        <div style={styles.features}>
                            {[
                                'Gestión de mesas en tiempo real',
                                'Pedidos con seguimiento de estados',
                                'Caja y pagos integrados',
                                'Dashboard con análisis inteligente',
                                'Pedidos por QR para tus clientes',
                            ].map((f, i) => (
                                <div key={i} style={styles.featureItem}>
                                    <div style={styles.featureDot} />
                                    <span style={styles.featureText}>{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={styles.decorCircle1} />
                    <div style={styles.decorCircle2} />
                    <div style={styles.decorCircle3} />
                </div>

                {/* Panel derecho — formulario */}
                <div className="login-right" style={styles.rightPanel}>
                    <div style={styles.themeCorner}>
                        <ThemeSwitch />
                    </div>

                    <div style={styles.formWrap}>
                        <div style={styles.formHeader}>
                            <h2 style={styles.formTitle}>Iniciar sesión</h2>
                            <p style={styles.formSub}>
                                Accede a tu panel de administración
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.field}>
                                <label style={styles.label}>
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="correo@ejemplo.com"
                                    style={styles.input}
                                    onFocus={focoOn}
                                    onBlur={focoOff}
                                />
                            </div>

                            <div style={styles.field}>
                                <label style={styles.label}>Contraseña</label>
                                <div style={styles.passwordWrap}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        style={{
                                            ...styles.input,
                                            paddingRight: '44px'
                                        }}
                                        onFocus={focoOn}
                                        onBlur={focoOff}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)}
                                        aria-label={showPassword
                                            ? 'Ocultar contraseña'
                                            : 'Mostrar contraseña'}
                                        style={styles.eyeBtn}>
                                        {showPassword
                                            ? <EyeOff size={16} />
                                            : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    ...styles.submitBtn,
                                    opacity: loading ? 0.7 : 1,
                                    cursor: loading
                                        ? 'not-allowed' : 'pointer',
                                }}>
                                {loading
                                    ? <div style={styles.submitSpinner} />
                                    : <LogIn size={16} />}
                                {loading
                                    ? 'Iniciando sesión...'
                                    : 'Iniciar sesión'}
                            </button>
                        </form>

                        <button
                            onClick={() => navigate('/')}
                            style={styles.backBtn}>
                            ← Volver al inicio
                        </button>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

const styles = {
    wrapper: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
    },
    leftPanel: {
        flex: 1,
        background: 'var(--gradient-full)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        position: 'relative',
        overflow: 'hidden',
    },
    leftContent: {
        position: 'relative',
        zIndex: 2,
        maxWidth: '420px',
    },
    logoWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '40px',
    },
    logoIcon: {
        width: '44px',
        height: '44px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'var(--font-bold)',
        fontSize: '22px',
        border: '1px solid rgba(255,255,255,0.3)',
    },
    logoText: {
        color: 'white',
        fontSize: 'var(--text-2xl)',
        fontWeight: 'var(--font-bold)',
        letterSpacing: '3px',
    },
    leftTitle: {
        color: 'white',
        fontSize: 'var(--text-3xl)',
        fontWeight: 'var(--font-bold)',
        lineHeight: 1.2,
        marginBottom: '16px',
    },
    leftSub: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 'var(--text-base)',
        lineHeight: 1.6,
        marginBottom: '40px',
    },
    features: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    featureItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    featureDot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.6)',
        flexShrink: 0,
    },
    featureText: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 'var(--text-sm)',
    },
    decorCircle1: {
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        top: '-80px',
        right: '-80px',
    },
    decorCircle2: {
        position: 'absolute',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        bottom: '60px',
        left: '-60px',
    },
    decorCircle3: {
        position: 'absolute',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.08)',
        bottom: '200px',
        right: '40px',
    },
    rightPanel: {
        width: '480px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
        backgroundColor: 'var(--bg-surface)',
        position: 'relative',
        flexShrink: 0,
    },
    themeCorner: {
        position: 'absolute',
        top: '20px',
        right: '20px',
    },
    formWrap: {
        width: '100%',
        maxWidth: '360px',
    },
    formHeader: {
        marginBottom: '32px',
    },
    formTitle: {
        fontSize: 'var(--text-2xl)',
        fontWeight: 'var(--font-bold)',
        color: 'var(--text-primary)',
        margin: '0 0 8px 0',
    },
    formSub: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-muted)',
        margin: 0,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-medium)',
        color: 'var(--text-secondary)',
    },
    input: {
        padding: '11px 14px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
        fontSize: 'var(--text-base)',
        fontFamily: 'var(--font-sans)',
        outline: 'none',
        width: '100%',
        transition: 'all var(--transition-fast)',
    },
    passwordWrap: {
        position: 'relative',
    },
    eyeBtn: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
    },
    submitBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        background: 'var(--gradient-primary)',
        color: 'white',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-semibold)',
        fontFamily: 'var(--font-sans)',
        width: '100%',
        marginTop: '8px',
        boxShadow: 'var(--shadow-glow)',
        transition: 'all var(--transition-fast)',
    },
    submitSpinner: {
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTop: '2px solid white',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    backBtn: {
        display: 'block',
        marginTop: '24px',
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        fontSize: 'var(--text-sm)',
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        padding: 0,
        transition: 'color var(--transition-fast)',
    },
};