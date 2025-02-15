import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from '@mui/material';
import { FormTextField } from '../FormComponents';
import { Patient } from '../../types';

interface PatientDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Patient, 'id'>) => void;
    initialData?: Patient;
    loading?: boolean;
}

export const PatientDialog: React.FC<PatientDialogProps> = ({
    open,
    onClose,
    onSubmit,
    initialData,
    loading
}) => {
    const [formData, setFormData] = React.useState<Omit<Patient, 'id'>>({
        name: '',
        dateOfBirth: '',
        gender: '',
        phoneNumber: '',
        email: '',
        ...initialData
    });

    React.useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                dateOfBirth: initialData.dateOfBirth.split('T')[0] // Format date for input
            });
        }
    }, [initialData]);

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
                    {initialData ? 'Edit Patient' : 'Add New Patient'}
                </DialogTitle>
                <DialogContent>
                    <FormTextField
                        name="name"
                        label="Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        fullWidth
                    />
                    <FormTextField
                        name="dateOfBirth"
                        label="Date of Birth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
                        fullWidth
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <FormTextField
                        name="gender"
                        label="Gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        fullWidth
                    />
                    <FormTextField
                        name="phoneNumber"
                        label="Phone Number"
                        value={formData.phoneNumber || ''}
                        onChange={handleChange}
                        fullWidth
                    />
                    <FormTextField
                        name="email"
                        label="Email"
                        type="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}; 