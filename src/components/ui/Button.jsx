export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    onClick,
    type = 'button',
    fullWidth = false,
    style: extraStyle = {}
}) {
    const base = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontFamily: 'var(--font-sans)',
        fontWeight: 'var(--font-semibold)',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all var(--transition-fast)',
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.5 : 1,
        outline: 'none',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
    };

    const sizes = {
        sm: { padding: '6px 14px', fontSize: 'var(--text-sm)' },
        md: { padding: '10px 20px', fontSize: 'var(--text-base)' },
        lg: { padding: '14px 28px', fontSize: 'var(--text-lg)' },
    };

    const variants = {
        primary: {
            background: 'var(--gradient-primary)',
            color: 'white',
            boxShadow: 'var(--shadow-glow)',
        },
        accent: {
            background: 'var(--gradient-accent)',
            color: 'white',
            boxShadow: 'var(--shadow-glow-accent)',
        },
        danger: {
            background: 'var(--gradient-danger)',
            color: 'white',
        },
        ghost: {
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-default)',
        },
        subtle: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
        },
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={{
                ...base,
                ...sizes[size],
                ...variants[variant],
                ...extraStyle
            }}>
            {children}
        </button>
    );
}