import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthResponse, User } from '../types';

interface AuthContextType {
    user: any;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => {},
    logout: () => {},
    isAuthenticated: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const processToken = (decoded: any) => {
        return {
            username: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
            role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
            id: decoded.id
        };
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('Initial token check:', token ? 'Token exists' : 'No token');
        
        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log('Initial decoded token:', decoded);
                setUser(processToken(decoded));
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Invalid token:', error);
                localStorage.removeItem('token');
                setUser(null);
                setIsAuthenticated(false);
            }
        }
    }, []);

    const login = (token: string) => {
        console.log('Login called with token:', token);
        if (!token) {
            console.error('No token provided to login');
            return;
        }
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);
        console.log('Login decoded token:', decoded);
        const userData = processToken(decoded);
        console.log('Processed user data:', userData);
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}; 