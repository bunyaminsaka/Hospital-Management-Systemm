import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    TextField,
    InputAdornment
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { doctors } from '../services/api';
import { Doctor } from '../types';
import { DataGrid } from '../components/DataGrid';
import { DoctorDialog } from '../components/doctors/DoctorDialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { useAuth } from '../contexts/AuthContext';

const columns = [
    { id: 'name', label: 'Name' },
    { id: 'specialty', label: 'Specialty' },
    { id: 'phoneNumber', label: 'Phone Number' },
    { id: 'email', label: 'Email' }
];

export function DoctorsPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';

    const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | undefined>();
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [savingDoctor, setSavingDoctor] = useState(false);
    const [deletingDoctor, setDeletingDoctor] = useState(false);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const data = await doctors.getAll();
            setDoctorsList(data);
            setError('');
        } catch (err) {
            setError('Failed to fetch doctors');
        } finally {
            setLoading(false);
        }
    };

    const handleAddDoctor = () => {
        setSelectedDoctor(undefined);
        setDialogOpen(true);
    };

    const handleEditDoctor = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setDialogOpen(true);
    };

    const handleDeleteClick = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setConfirmDialogOpen(true);
    };

    const handleSaveDoctor = async (doctorData: Omit<Doctor, 'id'>) => {
        try {
            setSavingDoctor(true);
            if (selectedDoctor) {
                await doctors.update(selectedDoctor.id, doctorData);
            } else {
                await doctors.create(doctorData);
            }
            await fetchDoctors();
            setDialogOpen(false);
        } catch (err) {
            setError('Failed to save doctor');
        } finally {
            setSavingDoctor(false);
        }
    };

    const handleDeleteDoctor = async () => {
        if (!selectedDoctor) return;

        try {
            setDeletingDoctor(true);
            await doctors.delete(selectedDoctor.id);
            await fetchDoctors();
            setConfirmDialogOpen(false);
        } catch (err) {
            setError('Failed to delete doctor');
        } finally {
            setDeletingDoctor(false);
        }
    };

    const filteredDoctors = doctorsList.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <LoadingSpinner />;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Doctors</Typography>
                {isAdmin && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddDoctor}
                    >
                        Add Doctor
                    </Button>
                )}
            </Box>

            {error && <ErrorDisplay error={error} />}

            <TextField
                fullWidth
                margin="normal"
                placeholder="Search doctors..."
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
                rows={filteredDoctors}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={filteredDoctors.length}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
                onEdit={isAdmin ? handleEditDoctor : undefined}
                onDelete={isAdmin ? handleDeleteClick : undefined}
            />

            <DoctorDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleSaveDoctor}
                initialData={selectedDoctor}
                loading={savingDoctor}
            />

            <ConfirmDialog
                open={confirmDialogOpen}
                title="Delete Doctor"
                message={`Are you sure you want to delete ${selectedDoctor?.name}?`}
                onConfirm={handleDeleteDoctor}
                onClose={() => setConfirmDialogOpen(false)}
                loading={deletingDoctor}
            />
        </Box>
    );
} 