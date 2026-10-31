export default function Modal({ title, children, onClose, footer }) {
    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 'var(--z-modal)',
                padding: 'var(--space-3)',
            }}>
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'clamp(16px, 5vw, 32px)',
                    width: '100%',
                    maxWidth: '460px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-5)',
                    boxShadow: 'var(--shadow-xl)',
                    boxSizing: 'border-box',
                }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                }}>
                    <h2 style={{
                        fontSize: 'var(--text-xl)',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--text-primary)',
                        margin: 0,
                    }}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Cerrar"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '20px',
                            padding: '4px',
                            lineHeight: 1,
                        }}>
                        ✕
                    </button>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-4)',
                }}>
                    {children}
                </div>

                {footer && (
                    <div style={{
                        display: 'flex',
                        gap: 'var(--space-3)',
                        justifyContent: 'flex-end',
                        flexWrap: 'wrap',
                        paddingTop: 'var(--space-2)',
                        borderTop: '1px solid var(--border-subtle)',
                    }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}