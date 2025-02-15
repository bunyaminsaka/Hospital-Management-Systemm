import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthContext, AuthContextType } from '../AuthContext';

interface WrapperProps {
    children: React.ReactNode;
    authValue?: Partial<AuthContextType>;
}

export const createWrapper = (authValue: Partial<AuthContextType> = {}) => {
    return ({ children }: WrapperProps) => (
        <AuthContext.Provider
            value={{
                user: null,
                login: jest.fn(),
                logout: jest.fn(),
                ...authValue
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const renderWithAuth = (
    ui: React.ReactElement,
    authValue: Partial<AuthContextType> = {},
    options?: Omit<RenderOptions, 'wrapper'>
) => {
    return render(ui, { wrapper: createWrapper(authValue), ...options });
}; 