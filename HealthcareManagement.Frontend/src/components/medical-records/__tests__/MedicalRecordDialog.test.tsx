import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { MedicalRecordDialog } from '../MedicalRecordDialog';
import { patients } from '../../../services/api';

// Mock the API services
jest.mock('../../../services/api', () => ({
    patients: {
        getAll: jest.fn()
    }
}));

const theme = createTheme();

describe('MedicalRecordDialog', () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();

    const mockPatients = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' }
    ];

    const renderDialog = (props = {}) => {
        return render(
            <ThemeProvider theme={theme}>
                <MedicalRecordDialog
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
        (patients.getAll as jest.Mock).mockResolvedValue(mockPatients);
    });

    it('renders new medical record dialog correctly', async () => {
        renderDialog();

        await waitFor(() => {
            expect(screen.getByText('New Medical Record')).toBeInTheDocument();
        });

        expect(screen.getByLabelText('Patient *')).toBeInTheDocument();
        expect(screen.getByLabelText('Diagnosis *')).toBeInTheDocument();
        expect(screen.getByLabelText('Treatment *')).toBeInTheDocument();
        expect(screen.getByLabelText('Notes')).toBeInTheDocument();
    });

    it('loads and displays patients', async () => {
        renderDialog();

        await waitFor(() => {
            expect(patients.getAll).toHaveBeenCalled();
        });

        // Open patient select
        fireEvent.mouseDown(screen.getByLabelText('Patient *'));
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('renders edit dialog with initial data', async () => {
        const initialData = {
            id: 1,
            patientId: 1,
            diagnosis: 'Common Cold',
            treatment: 'Rest and fluids',
            notes: 'Patient showing improvement',
            recordDate: '2023-12-01T10:00:00'
        };

        renderDialog({ initialData });

        await waitFor(() => {
            expect(screen.getByText('Edit Medical Record')).toBeInTheDocument();
        });

        expect(screen.getByLabelText('Diagnosis *')).toHaveValue(initialData.diagnosis);
        expect(screen.getByLabelText('Treatment *')).toHaveValue(initialData.treatment);
        expect(screen.getByLabelText('Notes')).toHaveValue(initialData.notes);
    });

    it('handles form submission', async () => {
        renderDialog();

        await waitFor(() => {
            expect(patients.getAll).toHaveBeenCalled();
        });

        // Select patient
        fireEvent.mouseDown(screen.getByLabelText('Patient *'));
        fireEvent.click(screen.getByText('John Doe'));

        // Fill in other fields
        fireEvent.change(screen.getByLabelText('Diagnosis *'), {
            target: { value: 'Common Cold' }
        });
        fireEvent.change(screen.getByLabelText('Treatment *'), {
            target: { value: 'Rest and fluids' }
        });
        fireEvent.change(screen.getByLabelText('Notes'), {
            target: { value: 'Patient showing improvement' }
        });

        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                patientId: 1,
                diagnosis: 'Common Cold',
                treatment: 'Rest and fluids',
                notes: 'Patient showing improvement'
            });
        });
    });

    it('validates required fields', async () => {
        renderDialog();

        await waitFor(() => {
            expect(patients.getAll).toHaveBeenCalled();
        });

        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        expect(screen.getByLabelText('Patient *')).toBeInvalid();
        expect(screen.getByLabelText('Diagnosis *')).toBeInvalid();
        expect(screen.getByLabelText('Treatment *')).toBeInvalid();
    });

    it('handles dialog close', async () => {
        renderDialog();

        await waitFor(() => {
            expect(patients.getAll).toHaveBeenCalled();
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

    it('hides patient selection in edit mode', async () => {
        const initialData = {
            id: 1,
            patientId: 1,
            diagnosis: 'Common Cold',
            treatment: 'Rest and fluids',
            notes: 'Patient showing improvement',
            recordDate: '2023-12-01T10:00:00'
        };

        renderDialog({ initialData });

        await waitFor(() => {
            expect(screen.queryByLabelText('Patient *')).not.toBeInTheDocument();
        });
    });

    it('handles API loading errors', async () => {
        (patients.getAll as jest.Mock).mockRejectedValue(new Error('Failed to load patients'));

        renderDialog();

        await waitFor(() => {
            expect(screen.getByText('Failed to fetch patients:')).toBeInTheDocument();
        });
    });
}); 