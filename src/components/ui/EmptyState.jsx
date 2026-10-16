export default function EmptyState({ icon: Icon, titulo, descripcion, accion, onAccion }) {
    return (
        <div style={styles.wrap}>
            <div style={styles.iconWrap}>
                {Icon && <Icon size={32} color="var(--text-disabled)" />}
            </div>
            <h3 style={styles.titulo}>{titulo}</h3>
            {descripcion && (
                <p style={styles.desc}>{descripcion}</p>
            )}
            {accion && onAccion && (
                <button onClick={onAccion} style={styles.btn}>
                    {accion}
                </button>
            )}
        </div>
    );
}

const styles = {
    wrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-16)',
        gridColumn: '1 / -1',
        textAlign: 'center',
    },
    iconWrap: {
        width: '64px',
        height: '64px',
        borderRadius: 'var(--radius-xl)',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 'var(--space-4)',
    },
    titulo: {
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--text-secondary)',
        margin: '0 0 8px 0',
    },
    desc: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-muted)',
        margin: '0 0 20px 0',
        maxWidth: '280px',
        lineHeight: 1.6,
    },
    btn: {
        padding: '9px 20px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)',
        fontSize: 'var(--text-sm)',
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
    },
};