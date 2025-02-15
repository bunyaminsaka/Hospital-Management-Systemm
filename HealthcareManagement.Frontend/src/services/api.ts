import axios, { AxiosRequestHeaders } from 'axios';
import { Doctor, Patient, Appointment, MedicalRecord, AuthResponse } from '../types';

const API_URL = 'https://localhost:7697/api';  // Make sure this port matches your API

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
        if (!config.headers) {
            config.headers = {} as AxiosRequestHeaders;
        }
        // Log the full token for debugging
        console.log('Full token being sent:', token);
        config.headers['Authorization'] = `Bearer ${token}`;
        
        // Log the full headers
        console.log('Request headers:', config.headers);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            response: error.response?.data
        });
        return Promise.reject(error);
    }
);

export const auth = {
    login: async (username: string, password: string): Promise<AuthResponse> => {
        try {
            const response = await api.post('/auth/login', { username, password });
            console.log('Login response:', response.data); // Add logging
            return response.data;
        } catch (error) {
            console.error('Login error:', error); // Add logging
            throw error;
        }
    },
    register: async (data: { username: string; password: string; role: string }) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    }
};

export const doctors = {
    getAll: async () => {
        const response = await api.get('/doctors');
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get(`/doctors/${id}`);
        return response.data;
    },
    getDoctorByUserId: async (userId: number) => {
        const response = await api.get(`/doctors/user/${userId}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/doctors', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await api.put(`/doctors/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/doctors/${id}`);
    },
    getAppointments: async (doctorId: number) => {
        const response = await api.get(`/doctors/${doctorId}/appointments`);
        return response.data;
    }
};

export const patients = {
    getAll: async () => {
        const response = await api.get('/patients');
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get(`/patients/${id}`);
        return response.data;
    },
    create: async (patient: Omit<Patient, 'id'>) => {
        const response = await api.post('/patients', patient);
        return response.data;
    },
    update: async (id: number, patient: Omit<Patient, 'id'>) => {
        const response = await api.put(`/patients/${id}`, patient);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/patients/${id}`);
    }
};

export const appointments = {
    getAll: async () => {
        const response = await api.get('/appointments');
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get(`/appointments/${id}`);
        return response.data;
    },
    create: async (appointment: Omit<Appointment, 'id' | 'doctorName' | 'patientName'>) => {
        const response = await api.post('/appointments', appointment);
        return response.data;
    },
    update: async (id: number, appointment: Pick<Appointment, 'appointmentDate' | 'status' | 'notes'>) => {
        const response = await api.put(`/appointments/${id}`, appointment);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/appointments/${id}`);
    }
};

export const medicalRecords = {
    getAll: async () => {
        const response = await api.get('/medicalrecords');
        return response.data;
    },
    getByPatientId: async (patientId: number) => {
        const response = await api.get(`/medicalrecords/patient/${patientId}`);
        return response.data;
    },
    create: async (record: Omit<MedicalRecord, 'id' | 'recordDate' | 'patientName'>) => {
        const response = await api.post('/medicalrecords', record);
        return response.data;
    },
    update: async (id: number, data: Pick<MedicalRecord, 'diagnosis' | 'prescriptions' | 'notes' | 'date' | 'patientId'>) => {
        const response = await api.put(`/medicalrecords/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/medicalrecords/${id}`);
    }
};

export const users = {
    getAll: async () => {
        const response = await api.get('/users');
        return response.data;
    },
    create: async (userData: any) => {
        const response = await api.post('/users', userData);
        return response.data;
    },
    update: async (id: number, userData: any) => {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/users/${id}`);
    }
};

export default api; 