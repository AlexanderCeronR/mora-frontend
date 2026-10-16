export default function Card({
    children,
    style: extraStyle = {},
    onClick,
    hoverable = false
}) {
    return (
        <div
            onClick={onClick}
            style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                transition: 'all var(--transition-fast)',
                cursor: onClick || hoverable ? 'pointer' : 'default',
                ...extraStyle
            }}
            onMouseEnter={e => {
                if (hoverable || onClick) {
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }
            }}
            onMouseLeave={e => {
                if (hoverable || onClick) {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }
            }}>
            {children}
        </div>
    );
}