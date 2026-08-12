import { createContext, useContext, useState } from 'react';

// Contexto global para el usuario autenticado
// Cualquier componente puede acceder al usuario y token
const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [usuario, setUsuario] = useState(() => {
        // Al iniciar la app verifica si hay usuario guardado
        const saved = localStorage.getItem('usuario');
        return saved ? JSON.parse(saved) : null;
    });

    const login = (userData, token) => {
        // Guarda el token y usuario en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(userData));
        setUsuario(userData);
    };

    const logout = () => {
        // Limpia todo al cerrar sesión
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook para usar el contexto fácilmente
// en vez de importar useContext y AuthContext en cada archivo
export function useAuth() {
    return useContext(AuthContext);
}