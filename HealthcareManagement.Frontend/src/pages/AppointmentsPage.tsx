import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    TextField,
    InputAdornment
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { appointments } from '../services/api';
import { Appointment } from '../types';
import { DataGrid } from '../components/DataGrid';
import { AppointmentDialog } from '../components/appointments/AppointmentDialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { useAuth } from '../contexts/AuthContext';

const columns = [
    { id: 'doctorName', label: 'Doctor' },
    { id: 'patientName', label: 'Patient' },
    { 
        id: 'appointmentDate', 
        label: 'Date & Time',
        format: (value: string) => new Date(value).toLocaleString()
    },
    { id: 'status', label: 'Status' },
    { id: 'notes', label: 'Notes' }
];

export function AppointmentsPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';
    const isDoctor = user?.role === 'Doctor';
    const canModify = isAdmin || isDoctor;

    const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [savingAppointment, setSavingAppointment] = useState(false);
    const [deletingAppointment, setDeletingAppointment] = useState(false);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const data = await appointments.getAll();
            setAppointmentsList(data);
            setError('');
        } catch (err) {
            setError('Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAppointment = () => {
        setSelectedAppointment(undefined);
        setDialogOpen(true);
    };

    const handleEditAppointment = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setDialogOpen(true);
    };


    const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id' | 'doctorName' | 'patientName'>) => {
        try {
            setSavingAppointment(true);
            if (selectedAppointment) {
                await appointments.update(selectedAppointment.id, appointmentData);
            } else {
                await appointments.create(appointmentData);
            }
            await fetchAppointments();
            setDialogOpen(false);
        } catch (err) {
            setError('Failed to save appointment');
        } finally {
            setSavingAppointment(false);
        }
    };

    const handleDeleteAppointment = async () => {
        if (!selectedAppointment) return;
        try {
            setDeletingAppointment(true);
            await appointments.delete(selectedAppointment.id);
            await fetchAppointments();
            setConfirmDialogOpen(false);
        } catch (err) {
            setError('Failed to delete appointment');
        } finally {
            setDeletingAppointment(false);
        }
    };

    const filteredAppointments = appointmentsList.filter(appointment =>
        appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <LoadingSpinner />;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Appointments</Typography>
                {canModify && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddAppointment}
                    >
                        New Appointment
                    </Button>
                )}
            </Box>

            {error && <ErrorDisplay error={error} />}

            <TextField
                fullWidth
                margin="normal"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ),
                }}
            />

            <DataGrid
                columns={columns}
                rows={filteredAppointments}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={filteredAppointments.length}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
                onEdit={canModify ? handleEditAppointment : undefined}
                onDelete={isAdmin ? handleDeleteAppointment : undefined}
            />

            <AppointmentDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleSaveAppointment}
                initialData={selectedAppointment}
                loading={savingAppointment}
            />

            <ConfirmDialog
                open={confirmDialogOpen}
                title="Delete Appointment"
                message={`Are you sure you want to delete this appointment?`}
                onConfirm={handleDeleteAppointment}
                onClose={() => setConfirmDialogOpen(false)}
                loading={deletingAppointment}
            />
        </Box>
    );
} 