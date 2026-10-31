import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import useMediaQuery from '../../hooks/useMediaQuery';

export default function AppLayout({ children }) {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [abierto, setAbierto] = useState(false);

    return (
        <div style={{ display: 'flex', minHeight: '100vh',
            backgroundColor: 'var(--bg-base)' }}>
            <Sidebar isMobile={isMobile} abierto={abierto}
                onClose={() => setAbierto(false)} />

            {isMobile && abierto && (
                <div onClick={() => setAbierto(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 150,
                        backgroundColor: 'rgba(0,0,0,0.55)' }} />
            )}

            <div style={{
                marginLeft: isMobile ? 0 : '240px',
                flex: 1, minWidth: 0,
                display: 'flex', flexDirection: 'column',
                minHeight: '100vh',
            }}>
                <Header
                    menuBtn={isMobile && (
                        <button onClick={() => setAbierto(true)}
                            aria-label="Abrir menú"
                            style={{ background: 'none', border: 'none',
                                color: 'var(--text-primary)',
                                cursor: 'pointer', display: 'flex',
                                padding: 4 }}>
                            <Menu size={22} />
                        </button>
                    )} />
                <main style={{ flex: 1,
                    padding: isMobile ? 'var(--space-4)' : 'var(--space-6)' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}