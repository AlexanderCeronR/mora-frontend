export default function Select({
    label,
    value,
    onChange,
    options = [],
    placeholder = 'Selecciona...',
    error
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {label && (
                <label style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--text-secondary)',
                }}>
                    {label}
                </label>
            )}
            <select
                value={value}
                onChange={onChange}
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
                    width: '100%',
                    cursor: 'pointer',
                }}>
                <option value="">{placeholder}</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
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