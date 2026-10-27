import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const tokenVigente = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

const limpiarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
};

const leerUsuarioInicial = () => {
    const token = localStorage.getItem('token');
    if (!token || !tokenVigente(token)) {
        limpiarSesion();
        return null;
    }
    try {
        return JSON.parse(localStorage.getItem('usuario') || 'null');
    } catch {
        return null;
    }
};

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(leerUsuarioInicial);

    const logout = useCallback(() => {
        limpiarSesion();
        setUsuario(null);
        window.location.href = '/login';
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(userData));
        setUsuario(userData);
    };

    // Cierra la sesión automáticamente cuando el token venza
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!usuario || !token) return;
        try {
            const exp = JSON.parse(atob(token.split('.')[1])).exp * 1000;
            const restante = exp - Date.now();
            if (restante <= 0) { logout(); return; }
            const t = setTimeout(logout, restante);
            return () => clearTimeout(t);
        } catch {
            logout();
        }
    }, [usuario, logout]);

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