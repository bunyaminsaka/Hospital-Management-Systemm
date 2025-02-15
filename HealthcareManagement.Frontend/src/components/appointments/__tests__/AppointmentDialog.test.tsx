import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { AppointmentDialog } from '../AppointmentDialog';
import { doctors, patients } from '../../../services/api';

// Mock the API services
jest.mock('../../../services/api', () => ({
    doctors: {
        getAll: jest.fn()
    },
    patients: {
        getAll: jest.fn()
    }
}));

const theme = createTheme();

describe('AppointmentDialog', () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();

    const mockDoctors = [
        { id: 1, name: 'Dr. Smith', specialty: 'Cardiology' },
        { id: 2, name: 'Dr. Jones', specialty: 'Pediatrics' }
    ];

    const mockPatients = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' }
    ];

    const renderDialog = (props = {}) => {
        return render(
            <ThemeProvider theme={theme}>
                <AppointmentDialog
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
        (doctors.getAll as jest.Mock).mockResolvedValue(mockDoctors);
        (patients.getAll as jest.Mock).mockResolvedValue(mockPatients);
    });

    it('renders new appointment dialog correctly', async () => {
        renderDialog();

        await waitFor(() => {
            expect(screen.getByText('New Appointment')).toBeInTheDocument();
        });

        expect(screen.getByLabelText('Doctor *')).toBeInTheDocument();
        expect(screen.getByLabelText('Patient *')).toBeInTheDocument();
        expect(screen.getByLabelText('Appointment Date *')).toBeInTheDocument();
        expect(screen.getByLabelText('Notes')).toBeInTheDocument();
    });

    it('loads and displays doctors and patients', async () => {
        renderDialog();

        await waitFor(() => {
            expect(doctors.getAll).toHaveBeenCalled();
            expect(patients.getAll).toHaveBeenCalled();
        });

        // Open doctor select
        fireEvent.mouseDown(screen.getByLabelText('Doctor *'));
        expect(screen.getByText('Dr. Smith - Cardiology')).toBeInTheDocument();
        expect(screen.getByText('Dr. Jones - Pediatrics')).toBeInTheDocument();

        // Open patient select
        fireEvent.mouseDown(screen.getByLabelText('Patient *'));
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('renders edit dialog with initial data', async () => {
        const initialData = {
            id: 1,
            doctorId: 1,
            patientId: 1,
            appointmentDate: '2023-12-01T10:00',
            status: 'Scheduled',
            notes: 'Regular checkup'
        };

        renderDialog({ initialData });

        await waitFor(() => {
            expect(screen.getByText('Edit Appointment')).toBeInTheDocument();
        });

        expect(screen.getByLabelText('Appointment Date *')).toHaveValue('2023-12-01T10:00');
        expect(screen.getByLabelText('Notes')).toHaveValue('Regular checkup');
    });

    it('handles form submission', async () => {
        renderDialog();

        await waitFor(() => {
            expect(doctors.getAll).toHaveBeenCalled();
        });

        // Select doctor
        fireEvent.mouseDown(screen.getByLabelText('Doctor *'));
        fireEvent.click(screen.getByText('Dr. Smith - Cardiology'));

        // Select patient
        fireEvent.mouseDown(screen.getByLabelText('Patient *'));
        fireEvent.click(screen.getByText('John Doe'));

        // Set date and notes
        fireEvent.change(screen.getByLabelText('Appointment Date *'), {
            target: { value: '2023-12-01T10:00' }
        });
        fireEvent.change(screen.getByLabelText('Notes'), {
            target: { value: 'Regular checkup' }
        });

        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                doctorId: 1,
                patientId: 1,
                appointmentDate: '2023-12-01T10:00',
                notes: 'Regular checkup',
                status: 'Scheduled'
            });
        });
    });

    it('validates required fields', async () => {
        renderDialog();

        await waitFor(() => {
            expect(doctors.getAll).toHaveBeenCalled();
        });

        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        expect(screen.getByLabelText('Doctor *')).toBeInvalid();
        expect(screen.getByLabelText('Patient *')).toBeInvalid();
        expect(screen.getByLabelText('Appointment Date *')).toBeInvalid();
    });

    it('handles dialog close', async () => {
        renderDialog();

        await waitFor(() => {
            expect(doctors.getAll).toHaveBeenCalled();
        });

        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('disables form submission while loading', async () => {
        renderDialog({ loading: true });

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
        });
    });

    it('shows status field only in edit mode', async () => {
        renderDialog();

        await waitFor(() => {
            expect(doctors.getAll).toHaveBeenCalled();
        });

        expect(screen.queryByLabelText('Status *')).not.toBeInTheDocument();

        renderDialog({
            initialData: {
                id: 1,
                doctorId: 1,
                patientId: 1,
                appointmentDate: '2023-12-01T10:00',
                status: 'Scheduled',
                notes: ''
            }
        });

        await waitFor(() => {
            expect(screen.getByLabelText('Status *')).toBeInTheDocument();
        });
    });

    it('handles API loading errors', async () => {
        (doctors.getAll as jest.Mock).mockRejectedValue(new Error('Failed to load doctors'));

        renderDialog();

        await waitFor(() => {
            expect(screen.getByText('Failed to fetch data:')).toBeInTheDocument();
        });
    });
}); 