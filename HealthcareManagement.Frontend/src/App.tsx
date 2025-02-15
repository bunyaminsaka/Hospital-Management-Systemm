import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { PatientsPage } from './pages/PatientsPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { MedicalRecordsPage } from './pages/MedicalRecordsPage';
import { DoctorPanel } from './pages/DoctorPanel';
import { AdminPanel } from './pages/AdminPanel';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Layout>
                    <Box sx={{ display: 'flex' }}>
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/doctors" element={
                                <ProtectedRoute>
                                    <DoctorsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/patients" element={
                                <ProtectedRoute>
                                    <PatientsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/appointments" element={
                                <ProtectedRoute>
                                    <AppointmentsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/medical-records" element={
                                <ProtectedRoute roles={['Admin', 'Doctor']}>
                                    <MedicalRecordsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/doctor-panel" element={
                                <ProtectedRoute roles={['Doctor']}>
                                    <DoctorPanel />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin" element={
                                <ProtectedRoute roles={['Admin']}>
                                    <AdminPanel />
                                </ProtectedRoute>
                            } />
                            <Route path="/" element={<Navigate to="/doctors" replace />} />
                        </Routes>
                    </Box>
                </Layout>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App; 