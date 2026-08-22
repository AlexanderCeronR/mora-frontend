import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export default function Confirm({ titulo, mensaje, onConfirmar, onCancelar, variante = 'danger' }) {
    return (
        <div style={styles.overlay}>
            <div style={styles.dialog}>
                <div style={{
                    ...styles.iconWrap,
                    backgroundColor: variante === 'danger'
                        ? 'var(--color-danger-10)'
                        : 'var(--color-warning-10)',
                }}>
                    <AlertTriangle
                        size={22}
                        color={variante === 'danger'
                            ? 'var(--color-danger)'
                            : 'var(--color-warning)'} />
                </div>
                <h3 style={styles.titulo}>{titulo}</h3>
                <p style={styles.mensaje}>{mensaje}</p>
                <div style={styles.btns}>
                    <Button variant="ghost" onClick={onCancelar}>
                        Cancelar
                    </Button>
                    <Button
                        variant={variante === 'danger' ? 'danger' : 'accent'}
                        onClick={onConfirmar}>
                        Confirmar
                    </Button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 'var(--z-modal)',
        padding: 'var(--space-4)',
    },
    dialog: {
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-8)',
        maxWidth: '380px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-4)',
        textAlign: 'center',
        boxShadow: 'var(--shadow-xl)',
        animation: 'fadeInScale 0.2s ease',
    },
    iconWrap: {
        width: '52px',
        height: '52px',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    titulo: {
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--text-primary)',
        margin: 0,
    },
    mensaje: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-muted)',
        lineHeight: 1.6,
        margin: 0,
    },
    btns: {
        display: 'flex',
        gap: 'var(--space-3)',
        width: '100%',
        justifyContent: 'center',
        marginTop: 'var(--space-2)',
    },
};