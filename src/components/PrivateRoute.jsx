import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, roles }) {
    const { usuario } = useAuth();

    // Si no está autenticado va al login
    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    // Si se especifican roles y el usuario no tiene el rol
    // redirige a su página principal según su rol
    if (roles && !roles.includes(usuario.rol)) {
        if (usuario.rol === 'MESERO') return <Navigate to="/pedidos" replace />;
        if (usuario.rol === 'CAJERO') return <Navigate to="/caja" replace />;
        return <Navigate to="/login" replace />;
    }

    return children;
}