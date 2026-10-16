import { useState, useEffect } from 'react';

let toastListeners = [];

export function showToast(message, type = 'success') {
    toastListeners.forEach(fn => fn({ message, type, id: Date.now() }));
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const listener = (toast) => {
            setToasts(prev => [...prev, toast]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== toast.id));
            }, 3500);
        };
        toastListeners.push(listener);
        return () => {
            toastListeners = toastListeners.filter(l => l !== listener);
        };
    }, []);

    const colors = {
        success: { bg: 'rgba(34,197,94,0.1)', border: 'var(--color-success)', icon: '✓' },
        error:   { bg: 'rgba(224,84,84,0.1)', border: 'var(--color-danger)', icon: '✕' },
        info:    { bg: 'rgba(68,49,153,0.1)', border: 'var(--color-primary)', icon: 'ℹ' },
        warning: { bg: 'rgba(245,158,11,0.1)', border: 'var(--color-warning)', icon: '⚠' },
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 'var(--z-toast)',
        }}>
            {toasts.map(toast => {
                const c = colors[toast.type] || colors.success;
                return (
                    <div key={toast.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 16px',
                        backgroundColor: c.bg,
                        border: `1px solid ${c.border}`,
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        backdropFilter: 'blur(8px)',
                        minWidth: '280px',
                        animation: 'slideIn 0.2s ease',
                    }}>
                        <span style={{
                            color: c.border,
                            fontWeight: 'bold',
                            fontSize: '16px'
                        }}>
                            {c.icon}
                        </span>
                        <span style={{
                            color: 'var(--text-primary)',
                            fontSize: 'var(--text-sm)',
                        }}>
                            {toast.message}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}