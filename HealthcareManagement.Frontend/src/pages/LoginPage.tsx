import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Typography, Paper, Alert, Container, Box } from '@mui/material';
import { FormContainer, FormTextField } from '../components/FormComponents';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../services/api';

export function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log('Attempting login with:', { username, password });

        try {
            const response = await auth.login(username, password);
            console.log('Login successful:', response);
            login(response.token);
            navigate('/doctor-panel');
        } catch (error) {
            console.error('Login error:', error);
            setError('Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8 }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Login
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit}>
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
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                        <Box sx={{ textAlign: 'center' }}>
                            <Link to="/register">
                                Don't have an account? Register
                            </Link>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
} 