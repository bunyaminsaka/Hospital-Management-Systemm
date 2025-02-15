import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Divider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Avatar
} from '@mui/material';
import { LocalHospital as MedicalIcon, Phone as PhoneIcon, Email as EmailIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { doctors, patients, medicalRecords } from '../services/api';
import { Doctor, Patient, MedicalRecord, Appointment } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';

interface PatientWithRecords extends Patient {
    medicalRecords: MedicalRecord[];
}

interface DoctorAppointment extends Appointment {
    patientId: number;
}

export function DoctorPanel() {
    const { user } = useAuth();
    const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
    const [patientsWithRecords, setPatientsWithRecords] = useState<PatientWithRecords[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<PatientWithRecords | null>(null);
    const [openRecordsDialog, setOpenRecordsDialog] = useState(false);

    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                const userId = user?.id;
                console.log('Fetching data for doctor with userId:', userId);
                
                if (!userId) {
                    setError('User ID not found');
                    setLoading(false);
                    return;
                }

                const doctorData = await doctors.getDoctorByUserId(userId);
                console.log('Doctor data:', doctorData);
                setCurrentDoctor(doctorData);

                const appointments = await doctors.getAppointments(doctorData.id);
                console.log('Appointments:', appointments);
                
                const patientIds = [...new Set(appointments.map((a: DoctorAppointment) => a.patientId))] as number[];
                console.log('Patient IDs:', patientIds);

                const patientPromises = patientIds.map(async (patientId: number) => {
                    const patient = await patients.getById(patientId);
                    const records = await medicalRecords.getByPatientId(patientId);
                    console.log(`Patient ${patientId} records:`, records);
                    return {
                        ...patient,
                        medicalRecords: records
                    };
                });

                const patientsData = await Promise.all(patientPromises);
                console.log('Final patients data:', patientsData);
                setPatientsWithRecords(patientsData);
            } catch (err: any) {
                console.error('Error in fetchDoctorData:', err);
                setError(err.message || 'Failed to fetch doctor data');
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchDoctorData();
        }
    }, [user]);

    const handleViewRecords = (patient: PatientWithRecords) => {
        setSelectedPatient(patient);
        setOpenRecordsDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenRecordsDialog(false);
        setSelectedPatient(null);
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay error={error} />;
    if (!currentDoctor) return <ErrorDisplay error="Doctor not found" />;

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                {/* Doctor Information Card */}
                <Grid item xs={12} md={4}>
                    <Card elevation={3}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main', mr: 2 }}>
                                    {currentDoctor.name.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h5">{currentDoctor.name}</Typography>
                                    <Chip label={currentDoctor.specialty} color="primary" size="small" />
                                </Box>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box display="flex" alignItems="center" mb={1}>
                                <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography>{currentDoctor.phoneNumber}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center">
                                <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography>{currentDoctor.email}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Patients Table */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={3}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Patient Name</TableCell>
                                        <TableCell>Latest Diagnosis</TableCell>
                                        <TableCell>Last Visit</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {patientsWithRecords.length > 0 ? (
                                        patientsWithRecords.map((patient) => {
                                            const latestRecord = patient.medicalRecords[0];
                                            return (
                                                <TableRow key={patient.id} hover>
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center">
                                                            <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                                                                {patient.name.charAt(0)}
                                                            </Avatar>
                                                            <Typography>{patient.name}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>{latestRecord?.diagnosis || 'No diagnosis'}</TableCell>
                                                    <TableCell>
                                                        {latestRecord ? 
                                                            (latestRecord.date ? 
                                                                format(new Date(latestRecord.date), 'MMM dd, yyyy')
                                                                : 'Invalid date')
                                                            : 'No visits'}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            startIcon={<MedicalIcon />}
                                                            onClick={() => handleViewRecords(patient)}
                                                        >
                                                            Medical Records
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                <Typography color="textSecondary" sx={{ py: 3 }}>
                                                    No patients found
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Medical Records Dialog */}
            <Dialog
                open={openRecordsDialog}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                            {selectedPatient?.name.charAt(0)}
                        </Avatar>
                        <Typography variant="h6">
                            Medical Records - {selectedPatient?.name}
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedPatient?.medicalRecords.map((record, index) => (
                        <Card key={record.id} sx={{ mb: 2, bgcolor: 'background.default' }}>
                            <CardContent>
                                <Typography variant="subtitle1" color="primary" gutterBottom>
                                    Visit Date: {record.date ? 
                                        format(new Date(record.date), 'MMMM dd, yyyy')
                                        : 'Invalid date'}
                                </Typography>
                                <Typography variant="h6" gutterBottom>
                                    Diagnosis: {record.diagnosis}
                                </Typography>
                                <Typography color="text.secondary">
                                    Prescription: {record.prescriptions || 'No prescription'}
                                </Typography>
                                <Typography color="text.secondary">
                                    Notes: {record.notes || 'No notes'}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                    {selectedPatient?.medicalRecords.length === 0 && (
                        <Typography color="text.secondary" align="center">
                            No medical records found
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 