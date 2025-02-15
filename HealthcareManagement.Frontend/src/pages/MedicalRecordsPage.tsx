import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    TextField,
    InputAdornment
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { medicalRecords } from '../services/api';
import { MedicalRecord } from '../types';
import { DataGrid } from '../components/DataGrid';
import { MedicalRecordDialog } from '../components/medical-records/MedicalRecordDialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { useAuth } from '../contexts/AuthContext';

const columns = [
    { id: 'patientName', label: 'Patient' },
    { 
        id: 'recordDate', 
        label: 'Date',
        format: (value: string) => new Date(value).toLocaleDateString()
    },
    { id: 'diagnosis', label: 'Diagnosis' },
    { id: 'treatment', label: 'Treatment' },
    { id: 'notes', label: 'Notes' }
];

export function MedicalRecordsPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';
    const isDoctor = user?.role === 'Doctor';
    const canModify = isAdmin || isDoctor;

    const [recordsList, setRecordsList] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | undefined>();
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [savingRecord, setSavingRecord] = useState(false);
    const [deletingRecord, setDeletingRecord] = useState(false);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const data = await medicalRecords.getAll();
            setRecordsList(data);
            setError('');
        } catch (err) {
            setError('Failed to fetch medical records');
        } finally {
            setLoading(false);
        }
    };

    const handleAddRecord = () => {
        setSelectedRecord(undefined);
        setDialogOpen(true);
    };

    const handleEditRecord = (record: MedicalRecord) => {
        setSelectedRecord(record);
        setDialogOpen(true);
    };

    const handleDeleteClick = (record: MedicalRecord) => {
        setSelectedRecord(record);
        setConfirmDialogOpen(true);
    };

    const handleSaveRecord = async (recordData: Omit<MedicalRecord, 'id'>) => {
        try {
            setSavingRecord(true);
            if (selectedRecord) {
                await medicalRecords.update(selectedRecord.id, {
                    diagnosis: recordData.diagnosis,
                    prescriptions: recordData.prescriptions,
                    notes: recordData.notes,
                    date: recordData.date,
                    patientId: recordData.patientId
                });
            } else {
                await medicalRecords.create(recordData);
            }
            await fetchRecords();
            setDialogOpen(false);
        } catch (err) {
            setError('Failed to save record');
        } finally {
            setSavingRecord(false);
        }
    };

    const handleDeleteRecord = async () => {
        if (!selectedRecord) return;
        try {
            setDeletingRecord(true);
            await medicalRecords.delete(selectedRecord.id);
            await fetchRecords();
            setConfirmDialogOpen(false);
        } catch (err) {
            setError('Failed to delete medical record');
        } finally {
            setDeletingRecord(false);
        }
    };

    const filteredRecords = recordsList.filter(record =>
        record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <LoadingSpinner />;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Medical Records</Typography>
                {canModify && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddRecord}
                    >
                        New Record
                    </Button>
                )}
            </Box>

            {error && <ErrorDisplay error={error} />}

            <TextField
                fullWidth
                margin="normal"
                placeholder="Search medical records..."
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
                rows={filteredRecords}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={filteredRecords.length}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
                onEdit={canModify ? handleEditRecord : undefined}
                onDelete={isAdmin ? handleDeleteRecord : undefined}
            />

            <MedicalRecordDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleSaveRecord}
                initialData={selectedRecord}
                loading={savingRecord}
            />

            <ConfirmDialog
                open={confirmDialogOpen}
                title="Delete Medical Record"
                message={`Are you sure you want to delete this medical record?`}
                onConfirm={handleDeleteRecord}
                onClose={() => setConfirmDialogOpen(false)}
                loading={deletingRecord}
            />
        </Box>
    );
} 