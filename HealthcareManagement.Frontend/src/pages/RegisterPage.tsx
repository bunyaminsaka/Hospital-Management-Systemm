import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    MenuItem,
    Alert,
    FormControl,
    InputLabel,
    Select,
    TextField,
    CircularProgress
} from '@mui/material';
import { FormTextField } from '../components/FormComponents';
import { auth } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Patient');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Additional fields for doctor
    const [name, setName] = useState('');
    const [pwzNumber, setPwzNumber] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const registerData = {
                username,
                password,
                role,
                ...(role === 'Doctor' && {
                    name,
                    pwzNumber,
                    specialty,
                    email,
                    phoneNumber
                })
            };

            const response = await auth.register(registerData);
            login(response.token);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8 }}>
                <Typography component="h1" variant="h5">
                    Register
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <FormTextField
                        required
                        fullWidth
                        label="Username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        margin="normal"
                    />
                    <FormTextField
                        required
                        fullWidth
                        label="Password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Role</InputLabel>
                        <Select value={role} onChange={(e) => setRole(e.target.value)}>
                            <MenuItem value="Patient">Patient</MenuItem>
                            <MenuItem value="Doctor">Doctor</MenuItem>
                        </Select>
                    </FormControl>

                    {role === 'Doctor' && (
                        <>
                            <TextField
                                margin="normal"
                                fullWidth
                                label="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                label="PWZ Number"
                                value={pwzNumber}
                                onChange={(e) => setPwzNumber(e.target.value)}
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                label="Specialty"
                                value={specialty}
                                onChange={(e) => setSpecialty(e.target.value)}
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                label="Phone Number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Register'}
                    </Button>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                </Box>
            </Box>
        </Container>
    );
} 