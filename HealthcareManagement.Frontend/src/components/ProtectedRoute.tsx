import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    roles?: string[];
}

export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
    const { user, isAuthenticated } = useAuth();
    
    console.log('Protected Route Check:', {
        isAuthenticated,
        user,
        roles,
        hasRole: roles ? (user?.role ? roles.includes(user.role) : false) : true
    });

    if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        return <Navigate to="/login" />;
    }

    if (roles && (!user?.role || !roles.includes(user.role))) {
        console.log('User does not have required role, redirecting to home');
        return <Navigate to="/" />;
    }

    return <>{children}</>;
}; 