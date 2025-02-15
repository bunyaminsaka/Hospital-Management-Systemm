import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    MenuItem
} from '@mui/material';
import { FormTextField } from '../FormComponents';
import { MedicalRecord, Patient } from '../../types';
import { patients } from '../../services/api';

interface MedicalRecordDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<MedicalRecord, 'id' | 'recordDate' | 'patientName'>) => void;
    initialData?: MedicalRecord;
    loading?: boolean;
}

export const MedicalRecordDialog: React.FC<MedicalRecordDialogProps> = ({
    open,
    onClose,
    onSubmit,
    initialData,
    loading
}) => {
    const [formData, setFormData] = React.useState<Omit<MedicalRecord, 'id' | 'recordDate' | 'patientName'>>({
        diagnosis: '',
        treatment: '',
        notes: '',
        patientId: 0
    });

    const [patientsList, setPatientsList] = useState<Patient[]>([]);
    const [loadingPatients, setLoadingPatients] = useState(true);

    useEffect(() => {
        if (open) {
            fetchPatients();
        }
    }, [open]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                diagnosis: initialData.diagnosis,
                treatment: initialData.treatment,
                notes: initialData.notes || '',
                patientId: initialData.patientId
            });
        }
    }, [initialData]);

    const fetchPatients = async () => {
        try {
            setLoadingPatients(true);
            const data = await patients.getAll();
            setPatientsList(data);
        } catch (error) {
            console.error('Failed to fetch patients:', error);
        } finally {
            setLoadingPatients(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {initialData ? 'Edit Medical Record' : 'New Medical Record'}
                </DialogTitle>
                <DialogContent>
                    {!initialData && (
                        <FormTextField
                            select
                            name="patientId"
                            label="Patient"
                            value={formData.patientId}
                            onChange={handleChange}
                            required
                            fullWidth
                            disabled={loadingPatients}
                        >
                            {patientsList.map((patient) => (
                                <MenuItem key={patient.id} value={patient.id}>
                                    {patient.name}
                                </MenuItem>
                            ))}
                        </FormTextField>
                    )}

                    <FormTextField
                        name="diagnosis"
                        label="Diagnosis"
                        value={formData.diagnosis}
                        onChange={handleChange}
                        required
                        fullWidth
                        multiline
                        rows={2}
                    />

                    <FormTextField
                        name="treatment"
                        label="Treatment"
                        value={formData.treatment}
                        onChange={handleChange}
                        required
                        fullWidth
                        multiline
                        rows={2}
                    />

                    <FormTextField
                        name="notes"
                        label="Notes"
                        value={formData.notes || ''}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={loading || loadingPatients}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}; 