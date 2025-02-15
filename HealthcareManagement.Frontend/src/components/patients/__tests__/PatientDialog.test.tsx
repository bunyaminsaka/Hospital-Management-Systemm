import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { PatientDialog } from '../PatientDialog';

const theme = createTheme();

describe('PatientDialog', () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();

    const renderDialog = (props = {}) => {
        return render(
            <ThemeProvider theme={theme}>
                <PatientDialog
                    open={true}
                    onClose={mockOnClose}
                    onSubmit={mockOnSubmit}
                    {...props}
                />
            </ThemeProvider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders new patient dialog correctly', () => {
        renderDialog();

        expect(screen.getByText('Add New Patient')).toBeInTheDocument();
        expect(screen.getByLabelText('Name *')).toBeInTheDocument();
        expect(screen.getByLabelText('Date of Birth *')).toBeInTheDocument();
        expect(screen.getByLabelText('Gender *')).toBeInTheDocument();
        expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('renders edit dialog with initial data', () => {
        const initialData = {
            id: 1,
            name: 'John Doe',
            dateOfBirth: '1990-01-01',
            gender: 'Male',
            phoneNumber: '123-456-7890',
            email: 'john@example.com'
        };

        renderDialog({ initialData });

        expect(screen.getByText('Edit Patient')).toBeInTheDocument();
        expect(screen.getByLabelText('Name *')).toHaveValue(initialData.name);
        expect(screen.getByLabelText('Date of Birth *')).toHaveValue(initialData.dateOfBirth);
        expect(screen.getByLabelText('Gender *')).toHaveValue(initialData.gender);
        expect(screen.getByLabelText('Phone Number')).toHaveValue(initialData.phoneNumber);
        expect(screen.getByLabelText('Email')).toHaveValue(initialData.email);
    });

    it('handles form submission', async () => {
        renderDialog();

        fireEvent.change(screen.getByLabelText('Name *'), {
            target: { value: 'John Doe' }
        });
        fireEvent.change(screen.getByLabelText('Date of Birth *'), {
            target: { value: '1990-01-01' }
        });
        fireEvent.change(screen.getByLabelText('Gender *'), {
            target: { value: 'Male' }
        });
        fireEvent.change(screen.getByLabelText('Phone Number'), {
            target: { value: '123-456-7890' }
        });
        fireEvent.change(screen.getByLabelText('Email'), {
            target: { value: 'john@example.com' }
        });

        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                name: 'John Doe',
                dateOfBirth: '1990-01-01',
                gender: 'Male',
                phoneNumber: '123-456-7890',
                email: 'john@example.com'
            });
        });
    });

    it('validates required fields', async () => {
        renderDialog();

        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        expect(screen.getByLabelText('Name *')).toBeInvalid();
        expect(screen.getByLabelText('Date of Birth *')).toBeInvalid();
        expect(screen.getByLabelText('Gender *')).toBeInvalid();
    });

    it('handles dialog close', () => {
        renderDialog();

        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('disables form submission while loading', () => {
        renderDialog({ loading: true });

        expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    });

    it('formats date correctly for edit mode', () => {
        const initialData = {
            id: 1,
            name: 'John Doe',
            dateOfBirth: '1990-01-01T00:00:00', // Full ISO string
            gender: 'Male',
            phoneNumber: '123-456-7890',
            email: 'john@example.com'
        };

        renderDialog({ initialData });

        expect(screen.getByLabelText('Date of Birth *')).toHaveValue('1990-01-01');
    });

    it('validates email format', async () => {
        renderDialog();

        fireEvent.change(screen.getByLabelText('Email'), {
            target: { value: 'invalid-email' }
        });

        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        expect(screen.getByLabelText('Email')).toBeInvalid();
    });
}); 