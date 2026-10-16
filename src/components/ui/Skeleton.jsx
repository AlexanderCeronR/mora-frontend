export default function Skeleton({ width = '100%', height = '16px', borderRadius = 'var(--radius-md)', style: extra = {} }) {
    return (
        <div style={{
            width,
            height,
            borderRadius,
            backgroundColor: 'var(--bg-elevated)',
            backgroundImage: 'linear-gradient(90deg, var(--bg-elevated) 0%, var(--bg-overlay) 50%, var(--bg-elevated) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            ...extra
        }} />
    );
}

export function SkeletonCard({ lines = 3 }) {
    return (
        <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Skeleton width="40%" height="18px" />
                <Skeleton width="20%" height="18px" borderRadius="var(--radius-full)" />
            </div>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    width={i === lines - 1 ? '60%' : '100%'}
                    height="14px" />
            ))}
        </div>
    );
}
