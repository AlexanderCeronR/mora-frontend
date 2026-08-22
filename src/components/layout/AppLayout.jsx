import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout({ children }) {
    return (
        <div style={styles.wrapper}>
            <Sidebar />
            <div style={styles.main}>
                <Header />
                <main style={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
}

const styles = {
    wrapper: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
    },
    main: {
        marginLeft: '240px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
    },
    content: {
        flex: 1,
        padding: 'var(--space-6)',
        overflowY: 'auto',
    },
};