export default function Input({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    disabled = false,
    style: extraStyle = {}
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {label && (
                <label style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.3px',
                }}>
                    {label}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${error
                        ? 'var(--color-danger)'
                        : 'var(--border-default)'}`,
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--text-base)',
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                    transition: 'border-color var(--transition-fast)',
                    width: '100%',
                    opacity: disabled ? 0.5 : 1,
                    ...extraStyle
                }}
                onFocus={e => {
                    e.target.style.borderColor = 'var(--color-primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(68,49,153,0.15)';
                }}
                onBlur={e => {
                    e.target.style.borderColor = error
                        ? 'var(--color-danger)'
                        : 'var(--border-default)';
                    e.target.style.boxShadow = 'none';
                }}
            />
            {error && (
                <span style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-danger)',
                }}>
                    {error}
                </span>
            )}
        </div>
    );
}