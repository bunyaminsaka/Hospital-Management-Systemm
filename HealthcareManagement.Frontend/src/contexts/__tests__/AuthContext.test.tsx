import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

describe('AuthContext', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        jest.clearAllMocks();
    });

    it('provides initial null user state', () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider
        });

        expect(result.current.user).toBeNull();
    });

    it('updates user state and stores token on login', () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider
        });

        const mockLoginResponse = {
            token: 'test-token',
            role: 'Admin'
        };

        act(() => {
            result.current.login(mockLoginResponse);
        });

        expect(result.current.user).toEqual({
            role: 'Admin'
        });
        expect(localStorage.getItem('token')).toBe('test-token');
    });

    it('clears user state and token on logout', () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider
        });

        // First login
        act(() => {
            result.current.login({
                token: 'test-token',
                role: 'Admin'
            });
        });

        // Then logout
        act(() => {
            result.current.logout();
        });

        expect(result.current.user).toBeNull();
        expect(localStorage.getItem('token')).toBeNull();
    });

    it('restores user state from stored token on mount', () => {
        // Set up a stored token
        localStorage.setItem('token', 'test-token');

        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider
        });

        expect(result.current.user).not.toBeNull();
        expect(result.current.user?.role).toBeDefined();
    });

    it('handles invalid stored token', () => {
        // Set up an invalid token
        localStorage.setItem('token', 'invalid-token');

        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider
        });

        expect(result.current.user).toBeNull();
        expect(localStorage.getItem('token')).toBeNull();
    });

    it('provides login function', () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider
        });

        expect(result.current.login).toBeDefined();
        expect(typeof result.current.login).toBe('function');
    });

    it('provides logout function', () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider
        });

        expect(result.current.logout).toBeDefined();
        expect(typeof result.current.logout).toBe('function');
    });
}); 