import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders circular progress', () => {
        render(<LoadingSpinner />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders with correct styling', () => {
        render(<LoadingSpinner />);
        const container = screen.getByRole('progressbar').parentElement;
        expect(container).toHaveStyle({
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px'
        });
    });
}); 