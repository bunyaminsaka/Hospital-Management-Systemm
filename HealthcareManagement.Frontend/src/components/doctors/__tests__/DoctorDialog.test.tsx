import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { DoctorDialog } from '../DoctorDialog';

const theme = createTheme();

describe('DoctorDialog', () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();

    const renderDialog = (props = {}) => {
        return render(
            <ThemeProvider theme={theme}>
                <DoctorDialog
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

    it('renders new doctor dialog correctly', () => {
        renderDialog();

        expect(screen.getByText('Add New Doctor')).toBeInTheDocument();
        expect(screen.getByLabelText('Name *')).toBeInTheDocument();
        expect(screen.getByLabelText('Specialty *')).toBeInTheDocument();
        expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('renders edit dialog with initial data', () => {
        const initialData = {
            id: 1,
            name: 'Dr. Smith',
            specialty: 'Cardiology',
            phoneNumber: '123-456-7890',
            email: 'dr.smith@example.com'
        };

        renderDialog({ initialData });

        expect(screen.getByText('Edit Doctor')).toBeInTheDocument();
        expect(screen.getByLabelText('Name *')).toHaveValue(initialData.name);
        expect(screen.getByLabelText('Specialty *')).toHaveValue(initialData.specialty);
        expect(screen.getByLabelText('Phone Number')).toHaveValue(initialData.phoneNumber);
        expect(screen.getByLabelText('Email')).toHaveValue(initialData.email);
    });

    it('handles form submission', async () => {
        renderDialog();

        fireEvent.change(screen.getByLabelText('Name *'), {
            target: { value: 'Dr. Smith' }
        });
        fireEvent.change(screen.getByLabelText('Specialty *'), {
            target: { value: 'Cardiology' }
        });
        fireEvent.change(screen.getByLabelText('Phone Number'), {
            target: { value: '123-456-7890' }
        });
        fireEvent.change(screen.getByLabelText('Email'), {
            target: { value: 'dr.smith@example.com' }
        });

        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                name: 'Dr. Smith',
                specialty: 'Cardiology',
                phoneNumber: '123-456-7890',
                email: 'dr.smith@example.com'
            });
        });
    });

    it('validates required fields', async () => {
        renderDialog();

        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        expect(screen.getByLabelText('Name *')).toBeInvalid();
        expect(screen.getByLabelText('Specialty *')).toBeInvalid();
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
}); 