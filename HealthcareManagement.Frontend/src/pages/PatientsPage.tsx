import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    TextField,
    InputAdornment
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { patients } from '../services/api';
import { Patient } from '../types';
import { DataGrid } from '../components/DataGrid';
import { PatientDialog } from '../components/patients/PatientDialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { useAuth } from '../contexts/AuthContext';

const columns = [
    { id: 'name', label: 'Name' },
    { 
        id: 'dateOfBirth', 
        label: 'Date of Birth',
        format: (value: string) => new Date(value).toLocaleDateString()
    },
    { id: 'gender', label: 'Gender' },
    { id: 'phoneNumber', label: 'Phone Number' },
    { id: 'email', label: 'Email' }
];

export function PatientsPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';
    const isDoctor = user?.role === 'Doctor';
    const canModify = isAdmin || isDoctor;

    const [patientsList, setPatientsList] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>();
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [savingPatient, setSavingPatient] = useState(false);
    const [deletingPatient, setDeletingPatient] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const data = await patients.getAll();
            setPatientsList(data);
            setError('');
        } catch (err) {
            setError('Failed to fetch patients');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPatient = () => {
        setSelectedPatient(undefined);
        setDialogOpen(true);
    };

    const handleEditPatient = (patient: Patient) => {
        setSelectedPatient(patient);
        setDialogOpen(true);
    };

    const handleDeleteClick = (patient: Patient) => {
        setSelectedPatient(patient);
        setConfirmDialogOpen(true);
    };

    const handleSavePatient = async (patientData: Omit<Patient, 'id'>) => {
        try {
            setSavingPatient(true);
            if (selectedPatient) {
                await patients.update(selectedPatient.id, patientData);
            } else {
                await patients.create(patientData);
            }
            await fetchPatients();
            setDialogOpen(false);
        } catch (err) {
            setError('Failed to save patient');
        } finally {
            setSavingPatient(false);
        }
    };

    const handleDeletePatient = async () => {
        if (!selectedPatient) return;

        try {
            setDeletingPatient(true);
            await patients.delete(selectedPatient.id);
            await fetchPatients();
            setConfirmDialogOpen(false);
        } catch (err) {
            setError('Failed to delete patient');
        } finally {
            setDeletingPatient(false);
        }
    };

    const filteredPatients = patientsList.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <LoadingSpinner />;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Patients</Typography>
                {canModify && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddPatient}
                    >
                        Add Patient
                    </Button>
                )}
            </Box>

            {error && <ErrorDisplay error={error} />}

            <TextField
                fullWidth
                margin="normal"
                placeholder="Search patients..."
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
                rows={filteredPatients}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={filteredPatients.length}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
                onEdit={canModify ? handleEditPatient : undefined}
                onDelete={isAdmin ? handleDeleteClick : undefined}
            />

            <PatientDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleSavePatient}
                initialData={selectedPatient}
                loading={savingPatient}
            />

            <ConfirmDialog
                open={confirmDialogOpen}
                title="Delete Patient"
                message={`Are you sure you want to delete ${selectedPatient?.name}?`}
                onConfirm={handleDeletePatient}
                onClose={() => setConfirmDialogOpen(false)}
                loading={deletingPatient}
            />
        </Box>
    );
} 