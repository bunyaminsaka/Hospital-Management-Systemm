import React, { useEffect, useState } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Typography,
    Paper,
    Button,
    Card,
    CardContent,
    Grid,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Fab
} from '@mui/material';
import {
    Person as UserIcon,
    LocalHospital as DoctorIcon,
    PersonAdd as PatientIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { doctors, patients, users } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { User, Doctor, Patient } from '../types';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export function AdminPanel() {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [usersList, setUsersList] = useState<User[]>([]);
    const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
    const [patientsList, setPatientsList] = useState<Patient[]>([]);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editRole, setEditRole] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [availableRoles] = useState(['Admin', 'Doctor', 'Patient']);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        role: 'User'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, doctorsData, patientsData] = await Promise.all([
                users.getAll(),
                doctors.getAll(),
                patients.getAll()
            ]);
            setUsersList(usersData);
            setDoctorsList(doctorsData);
            setPatientsList(patientsData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setEditRole(user.role);
        setEditDialogOpen(true);
    };

    const handleEditClose = () => {
        setEditDialogOpen(false);
        setSelectedUser(null);
        setEditRole('');
    };

    const handleEditSave = async () => {
        if (!selectedUser) return;
        try {
            await users.update(selectedUser.id, { role: editRole });
            await fetchData();
            handleEditClose();
        } catch (err: any) {
            setError('Failed to update user');
        }
    };

    const handleDeleteClick = (user: User) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedUser) return;
        try {
            await users.delete(selectedUser.id);
            await fetchData();
            setDeleteDialogOpen(false);
            setSelectedUser(null);
        } catch (err: any) {
            setError('Failed to delete user');
        }
    };

    const handleAddClick = () => {
        setAddDialogOpen(true);
    };

    const handleAddClose = () => {
        setAddDialogOpen(false);
        setNewUser({ username: '', password: '', role: 'User' });
    };

    const handleAddSave = async () => {
        try {
            await users.create(newUser);
            await fetchData();
            handleAddClose();
        } catch (err: any) {
            setError('Failed to create user');
        }
    };

    const RoleBadge = ({ role }: { role: string }) => {
        const getColor = () => {
            switch (role) {
                case 'Admin': return 'error';
                case 'Doctor': return 'primary';
                case 'Patient': return 'success';
                default: return 'default';
            }
        };

        return (
            <Chip 
                label={role} 
                color={getColor()} 
                size="small" 
                sx={{ ml: 1 }} 
            />
        );
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay error={error} />;

    return (
        <>
            <Box sx={{ width: '100%', p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Admin Dashboard
                </Typography>

                <Paper sx={{ width: '100%', mb: 2 }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                    >
                        <Tab icon={<UserIcon />} label="Users" />
                        <Tab icon={<DoctorIcon />} label="Doctors" />
                        <Tab icon={<PatientIcon />} label="Patients" />
                    </Tabs>

                    <TabPanel value={tabValue} index={0}>
                        <Box position="relative" minHeight="200px">
                            <Grid container spacing={2}>
                                {usersList.map(user => (
                                    <Grid item xs={12} md={4} key={user.id}>
                                        <Card>
                                            <CardContent>
                                                <Box display="flex" alignItems="center" mb={1}>
                                                    <Typography variant="h6">{user.username}</Typography>
                                                    <RoleBadge role={user.role} />
                                                </Box>
                                                <Box sx={{ mt: 2 }}>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => handleEditClick(user)}
                                                        startIcon={<EditIcon />}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        Change Role
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => handleDeleteClick(user)}
                                                        startIcon={<DeleteIcon />}
                                                    >
                                                        Delete
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                            <Fab
                                color="primary"
                                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                                onClick={handleAddClick}
                            >
                                <AddIcon />
                            </Fab>
                        </Box>
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <Grid container spacing={2}>
                            {doctorsList.map(doctor => (
                                <Grid item xs={12} md={4} key={doctor.id}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6">{doctor.name}</Typography>
                                            <Typography color="textSecondary">Specialty: {doctor.specialty}</Typography>
                                            <Typography color="textSecondary">Email: {doctor.email}</Typography>
                                            <Typography color="textSecondary">Phone: {doctor.phoneNumber}</Typography>
                                            <Box sx={{ mt: 2 }}>
                                                <Tooltip title="Edit Doctor">
                                                    <IconButton>
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Doctor">
                                                    <IconButton color="error">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                        <Grid container spacing={2}>
                            {patientsList.map(patient => (
                                <Grid item xs={12} md={4} key={patient.id}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6">{patient.name}</Typography>
                                            <Typography color="textSecondary">
                                                Date of Birth: {new Date(patient.dateOfBirth).toLocaleDateString()}
                                            </Typography>
                                            <Typography color="textSecondary">Gender: {patient.gender}</Typography>
                                            <Typography color="textSecondary">Email: {patient.email}</Typography>
                                            <Typography color="textSecondary">Phone: {patient.phoneNumber}</Typography>
                                            <Box sx={{ mt: 2 }}>
                                                <Tooltip title="Edit Patient">
                                                    <IconButton>
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Patient">
                                                    <IconButton color="error">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </TabPanel>
                </Paper>
            </Box>

            <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="xs" fullWidth>
                <DialogTitle>
                    Change Role for {selectedUser?.username}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {availableRoles.map(role => (
                            <Button
                                key={role}
                                variant={editRole === role ? "contained" : "outlined"}
                                onClick={() => setEditRole(role)}
                                sx={{ mr: 1, mb: 1 }}
                            >
                                {role}
                            </Button>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditClose}>Cancel</Button>
                    <Button 
                        onClick={handleEditSave} 
                        variant="contained" 
                        disabled={!editRole || editRole === selectedUser?.role}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete user "{selectedUser?.username}"?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={addDialogOpen} onClose={handleAddClose} maxWidth="xs" fullWidth>
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Username"
                        fullWidth
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Password"
                        type="password"
                        fullWidth
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            label="Role"
                        >
                            {availableRoles.map(role => (
                                <MenuItem key={role} value={role}>{role}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddClose}>Cancel</Button>
                    <Button 
                        onClick={handleAddSave}
                        variant="contained"
                        disabled={!newUser.username || !newUser.password}
                    >
                        Create User
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
} 