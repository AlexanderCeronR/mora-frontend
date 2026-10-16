export default function Badge({ children, variant = 'default' }) {
    const variants = {
        default:  { bg: 'var(--bg-overlay)', color: 'var(--text-secondary)' },
        primary:  { bg: 'var(--color-primary-10)', color: 'var(--color-primary-light)' },
        accent:   { bg: 'var(--color-accent-10)', color: 'var(--color-accent-light)' },
        success:  { bg: 'rgba(34,197,94,0.1)', color: 'var(--color-success)' },
        danger:   { bg: 'var(--color-danger-10)', color: 'var(--color-danger)' },
        warning:  { bg: 'rgba(245,158,11,0.1)', color: 'var(--color-warning)' },
        info:     { bg: 'rgba(59,130,246,0.1)', color: 'var(--color-info)' },
    };

    const v = variants[variant] || variants.default;

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-semibold)',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            backgroundColor: v.bg,
            color: v.color,
            border: `1px solid ${v.color}30`,
        }}>
            {children}
        </span>
    );
}