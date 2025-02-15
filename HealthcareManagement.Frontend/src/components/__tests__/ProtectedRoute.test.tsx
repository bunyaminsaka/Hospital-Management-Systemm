import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { AuthContext } from '../../contexts/AuthContext';

describe('ProtectedRoute', () => {
    const mockNavigate = jest.fn();

    jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate
    }));

    const renderWithAuth = (
        user: { role: string } | null,
        roles?: string[],
        initialEntries = ['/protected']
    ) => {
        return render(
            <AuthContext.Provider value={{ user, login: jest.fn(), logout: jest.fn() }}>
                <MemoryRouter initialEntries={initialEntries}>
                    <Routes>
                        <Route path="/login" element={<div>Login Page</div>} />
                        <Route
                            path="/protected"
                            element={
                                <ProtectedRoute roles={roles}>
                                    <div>Protected Content</div>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </MemoryRouter>
            </AuthContext.Provider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders children when user is authenticated', () => {
        renderWithAuth({ role: 'Admin' });
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('redirects to login when user is not authenticated', () => {
        renderWithAuth(null);
        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('allows access when user has required role', () => {
        renderWithAuth({ role: 'Admin' }, ['Admin']);
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('allows access when user has one of the required roles', () => {
        renderWithAuth({ role: 'Doctor' }, ['Admin', 'Doctor']);
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('denies access when user does not have required role', () => {
        renderWithAuth({ role: 'Nurse' }, ['Admin', 'Doctor']);
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    it('allows access when no specific roles are required', () => {
        renderWithAuth({ role: 'Nurse' });
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('preserves the current location when redirecting to login', () => {
        const initialEntries = ['/protected?param=value'];
        renderWithAuth(null, undefined, initialEntries);
        
        expect(screen.getByText('Login Page')).toBeInTheDocument();
        // The location state should be preserved in the navigation
        expect(window.location.search).toBe('?param=value');
    });

    it('handles nested protected routes correctly', () => {
        render(
            <AuthContext.Provider value={{ user: { role: 'Admin' }, login: jest.fn(), logout: jest.fn() }}>
                <MemoryRouter initialEntries={['/admin/dashboard']}>
                    <Routes>
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute roles={['Admin']}>
                                    <div>Admin Layout</div>
                                </ProtectedRoute>
                            }
                        >
                            <Route
                                path="dashboard"
                                element={
                                    <ProtectedRoute roles={['Admin']}>
                                        <div>Dashboard Content</div>
                                    </ProtectedRoute>
                                }
                            />
                        </Route>
                    </Routes>
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.getByText('Admin Layout')).toBeInTheDocument();
        expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    });

    it('handles role changes correctly', () => {
        const { rerender } = render(
            <AuthContext.Provider value={{ user: { role: 'Admin' }, login: jest.fn(), logout: jest.fn() }}>
                <MemoryRouter>
                    <ProtectedRoute roles={['Admin']}>
                        <div>Protected Content</div>
                    </ProtectedRoute>
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();

        // Change the user's role
        rerender(
            <AuthContext.Provider value={{ user: { role: 'User' }, login: jest.fn(), logout: jest.fn() }}>
                <MemoryRouter>
                    <ProtectedRoute roles={['Admin']}>
                        <div>Protected Content</div>
                    </ProtectedRoute>
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    it('handles loading states correctly', () => {
        render(
            <AuthContext.Provider value={{ user: null, loading: true, login: jest.fn(), logout: jest.fn() }}>
                <MemoryRouter>
                    <ProtectedRoute>
                        <div>Protected Content</div>
                    </ProtectedRoute>
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
}); 