import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Mesas from './pages/Mesas';
import Menu from './pages/Menu';
import Pedidos from './pages/Pedidos';
import Caja from './pages/Caja';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Supervisor from './pages/Supervisor';
import ClienteMenu from './pages/ClienteMenu';

function AppWithLayout({ children }) {
    return (
        <AppLayout>
            {children}
        </AppLayout>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Públicas sin layout */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />

                    {/* Privadas con layout */}
                    <Route path="/dashboard" element={
                        <PrivateRoute roles={['ADMIN', 'CAJERO']}>
                            <AppWithLayout><Dashboard /></AppWithLayout>
                        </PrivateRoute>
                    } />
                    <Route path="/mesas" element={
                        <PrivateRoute>
                            <AppWithLayout><Mesas /></AppWithLayout>
                        </PrivateRoute>
                    } />
                    <Route path="/menu" element={
                        <PrivateRoute>
                            <AppWithLayout><Menu /></AppWithLayout>
                        </PrivateRoute>
                    } />
                    <Route path="/pedidos" element={
                        <PrivateRoute>
                            <AppWithLayout><Pedidos /></AppWithLayout>
                        </PrivateRoute>
                    } />
                    <Route path="/caja" element={
                        <PrivateRoute roles={['ADMIN', 'CAJERO']}>
                            <AppWithLayout><Caja /></AppWithLayout>
                        </PrivateRoute>
                    } />
                    <Route path="/supervisor" element={
    <PrivateRoute roles={['ADMIN', 'SUPERVISOR']}>
        <AppWithLayout><Supervisor /></AppWithLayout>
    </PrivateRoute>
} />
                    <Route path="/usuarios" element={
                        <PrivateRoute roles={['ADMIN']}>
                            <AppWithLayout><Usuarios /></AppWithLayout>
                        </PrivateRoute>
                    } />
                    {/*Ruta pública — sin PrivateRoute ni AppLayout*/}
                    <Route path="/cliente/mesa/:mesaId" element={<ClienteMenu />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}