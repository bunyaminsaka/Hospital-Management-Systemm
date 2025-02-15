import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorDisplay } from '../ErrorDisplay';

describe('ErrorDisplay', () => {
    it('renders error message', () => {
        const errorMessage = 'Something went wrong';
        render(<ErrorDisplay error={errorMessage} />);
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('renders with error alert styling', () => {
        render(<ErrorDisplay error="Test error" />);
        const alert = screen.getByRole('alert');
        expect(alert).toHaveClass('MuiAlert-standardError');
    });
}); 