import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from '@mui/material';
import { FormTextField } from '../FormComponents';
import { Doctor } from '../../types';

interface DoctorDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Doctor, 'id'>) => void;
    initialData?: Doctor;
    loading?: boolean;
}

export const DoctorDialog: React.FC<DoctorDialogProps> = ({
    open,
    onClose,
    onSubmit,
    initialData,
    loading
}) => {
    const [formData, setFormData] = React.useState<Omit<Doctor, 'id'>>({
        name: '',
        specialty: '',
        phoneNumber: '',
        email: '',
        ...initialData
    });

    React.useEffect(() => {
        if (initialData) {
            setFormData(initialData);
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
                    {initialData ? 'Edit Doctor' : 'Add New Doctor'}
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
                        name="specialty"
                        label="Specialty"
                        value={formData.specialty}
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