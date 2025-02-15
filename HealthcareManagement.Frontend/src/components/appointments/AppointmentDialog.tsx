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
import { Appointment, Doctor, Patient } from '../../types';
import { doctors, patients } from '../../services/api';

interface AppointmentDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Appointment, 'id' | 'doctorName' | 'patientName'>) => void;
    initialData?: Appointment;
    loading?: boolean;
}

export const AppointmentDialog: React.FC<AppointmentDialogProps> = ({
    open,
    onClose,
    onSubmit,
    initialData,
    loading
}) => {
    const [formData, setFormData] = React.useState<Omit<Appointment, 'id' | 'doctorName' | 'patientName'>>({
        appointmentDate: '',
        status: 'Scheduled',
        notes: '',
        doctorId: 0,
        patientId: 0
    });

    const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
    const [patientsList, setPatientsList] = useState<Patient[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (open) {
            fetchData();
        }
    }, [open]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                appointmentDate: initialData.appointmentDate.split('T')[0]
            });
        }
    }, [initialData]);

    const fetchData = async () => {
        try {
            setLoadingData(true);
            const [doctorsData, patientsData] = await Promise.all([
                doctors.getAll(),
                patients.getAll()
            ]);
            setDoctorsList(doctorsData);
            setPatientsList(patientsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoadingData(false);
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
                    {initialData ? 'Edit Appointment' : 'New Appointment'}
                </DialogTitle>
                <DialogContent>
                    <FormTextField
                        select
                        name="doctorId"
                        label="Doctor"
                        value={formData.doctorId}
                        onChange={handleChange}
                        required
                        fullWidth
                        disabled={loadingData}
                    >
                        {doctorsList.map((doctor) => (
                            <MenuItem key={doctor.id} value={doctor.id}>
                                {doctor.name} - {doctor.specialty}
                            </MenuItem>
                        ))}
                    </FormTextField>

                    <FormTextField
                        select
                        name="patientId"
                        label="Patient"
                        value={formData.patientId}
                        onChange={handleChange}
                        required
                        fullWidth
                        disabled={loadingData}
                    >
                        {patientsList.map((patient) => (
                            <MenuItem key={patient.id} value={patient.id}>
                                {patient.name}
                            </MenuItem>
                        ))}
                    </FormTextField>

                    <FormTextField
                        name="appointmentDate"
                        label="Appointment Date"
                        type="datetime-local"
                        value={formData.appointmentDate}
                        onChange={handleChange}
                        required
                        fullWidth
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />

                    {initialData && (
                        <FormTextField
                            select
                            name="status"
                            label="Status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                            fullWidth
                        >
                            <MenuItem value="Scheduled">Scheduled</MenuItem>
                            <MenuItem value="Completed">Completed</MenuItem>
                            <MenuItem value="Cancelled">Cancelled</MenuItem>
                        </FormTextField>
                    )}

                    <FormTextField
                        name="notes"
                        label="Notes"
                        value={formData.notes || ''}
                        onChange={handleChange}
                        multiline
                        rows={4}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={loading || loadingData}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}; 