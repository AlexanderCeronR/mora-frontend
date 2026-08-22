import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { showToast } from '../components/UI/Toast';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import PageTransition from '../components/UI/PageTransition';

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
            const { token, nombre, rol } = response.data;
            login({ nombre, email, rol }, token);
            showToast(`Bienvenido, ${nombre}`, 'success');
            if (rol === 'ADMIN') navigate('/dashboard');
            else if (rol === 'MESERO') navigate('/pedidos');
            else if (rol === 'CAJERO') navigate('/caja');
        } catch {
            showToast('Email o contraseña incorrectos', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
    <PageTransition>
        <div style={styles.container}>
            <div style={styles.wrapper}>

            {/* Panel izquierdo — decorativo */}
            <div style={styles.leftPanel}>
                <div style={styles.leftContent}>
                    <div style={styles.logoWrap}>
                        <div style={styles.logoIcon}>M</div>
                        <span style={styles.logoText}>MORA</span>
                    </div>
                    <h1 style={styles.leftTitle}>
                        Gestiona tu restaurante con inteligencia
                    </h1>
                    <p style={styles.leftSub}>
                        Mesas, pedidos, caja y análisis en una sola plataforma moderna.
                    </p>

                    {/* Features */}
                    <div style={styles.features}>
                        {[
                            '🍽️  Gestión de mesas en tiempo real',
                            '📋  Pedidos con seguimiento de estados',
                            '💳  Caja y pagos integrados',
                            '📊  Dashboard con análisis inteligente',
                            '🤖  Asistente IA para tus ventas',
                        ].map((f, i) => (
                            <div key={i} style={styles.featureItem}>
                                <div style={styles.featureDot} />
                                <span style={styles.featureText}>{f}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Decoración de fondo */}
                <div style={styles.decorCircle1} />
                <div style={styles.decorCircle2} />
                <div style={styles.decorCircle3} />
            </div>

            {/* Panel derecho — formulario */}
            <div style={styles.rightPanel}>
                <div style={styles.formWrap}>
                    <div style={styles.formHeader}>
                        <h2 style={styles.formTitle}>Iniciar sesión</h2>
                        <p style={styles.formSub}>
                            Accede a tu panel de administración
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={styles.form}>
                        {/* Email */}
                        <div style={styles.field}>
                            <label style={styles.label}>
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@mora.com"
                                style={styles.input}
                                onFocus={e => {
                                    e.target.style.borderColor =
                                        'var(--color-primary)';
                                    e.target.style.boxShadow =
                                        '0 0 0 3px rgba(68,49,153,0.15)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor =
                                        'var(--border-default)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        {/* Password */}
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
                                    onFocus={e => {
                                        e.target.style.borderColor =
                                            'var(--color-primary)';
                                        e.target.style.boxShadow =
                                            '0 0 0 3px rgba(68,49,153,0.15)';
                                    }}
                                    onBlur={e => {
                                        e.target.style.borderColor =
                                            'var(--border-default)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)}
                                    style={styles.eyeBtn}>
                                    {showPassword
                                        ? <EyeOff size={16} />
                                        : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...styles.submitBtn,
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer',
                            }}>
                            {loading ? (
                                <div style={styles.submitSpinner} />
                            ) : (
                                <LogIn size={16} />
                            )}
                            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                        </button>
                    </form>

                    {/* Volver */}
                    <button
                        onClick={() => navigate('/')}
                        style={styles.backBtn}>
                        ← Volver al inicio
                    </button>
                </div>
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