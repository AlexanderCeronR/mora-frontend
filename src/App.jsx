import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Mesas from './pages/Mesas';
import Menu from './pages/Menu';
import Pedidos from './pages/Pedidos';
import Caja from './pages/Caja';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Landing from './pages/Landing';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
    {/* Pública */}
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />

    {/* Todos los roles autenticados */}
    <Route path="/mesas" element={
        <PrivateRoute><Mesas /></PrivateRoute>
    } />
    <Route path="/menu" element={
        <PrivateRoute><Menu /></PrivateRoute>
    } />
    <Route path="/pedidos" element={
        <PrivateRoute><Pedidos /></PrivateRoute>
    } />

    {/* Solo ADMIN y CAJERO */}
    <Route path="/caja" element={
        <PrivateRoute roles={['ADMIN', 'CAJERO']}>
            <Caja />
        </PrivateRoute>
    } />

    {/* Solo ADMIN */}
    <Route path="/dashboard" element={
        <PrivateRoute roles={['ADMIN']}>
            <Dashboard />
        </PrivateRoute>
    } />
    <Route path="/usuarios" element={
        <PrivateRoute roles={['ADMIN']}>
            <Usuarios />
        </PrivateRoute>
    } />
</Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}