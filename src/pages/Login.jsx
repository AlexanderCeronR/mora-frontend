import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axiosClient.post('/auth/login', {
                email,
                password
            });

            const { token, nombre, rol } = response.data;

            // Guarda el token y datos del usuario
            login({ nombre, email, rol }, token);

            // Redirige según el rol
            if (rol === 'ADMIN') navigate('/mesas');
            else if (rol === 'MESERO') navigate('/pedidos');
            else if (rol === 'CAJERO') navigate('/caja');

        } catch (err) {
            setError('Email o contraseña incorrectos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>MORA</h1>
                <p style={styles.subtitle}>
                    Manager Of Restaurant Administration
                </p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.field}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            placeholder="admin@mora.com"
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <p style={styles.error}>{error}</p>
                    )}

                    <button
                        type="submit"
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
    },
    card: {
        backgroundColor: '#1e293b',
        padding: '40px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    },
    title: {
        color: '#f97316',
        fontSize: '42px',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: '0 0 8px 0',
        letterSpacing: '4px',
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: '13px',
        textAlign: 'center',
        marginBottom: '32px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        color: '#cbd5e1',
        fontSize: '14px',
        fontWeight: '500',
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
    button: {
        padding: '14px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#f97316',
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '8px',
    },
    error: {
        color: '#ef4444',
        fontSize: '14px',
        textAlign: 'center',
    }
};