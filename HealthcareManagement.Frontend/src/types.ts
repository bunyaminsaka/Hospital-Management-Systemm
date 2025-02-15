export interface User {
    id: number;
    username: string;
    role: string;
}

export interface Doctor {
    id: number;
    name: string;
    specialty: string;
    phoneNumber: string;
    email: string;
}

export interface Patient {
    id: number;
    name: string;
    dateOfBirth: string;
    gender: string;
    phoneNumber: string;
    email: string;
}

export interface Appointment {
    id: number;
    doctorId: number;
    doctorName: string;
    patientId: number;
    patientName: string;
    appointmentDate: string;
    status: string;
    notes: string;
}

export interface MedicalRecord {
    id: number;
    date: string;
    diagnosis: string;
    prescriptions: string;
    notes: string;
    patientId: number;
}

export interface AuthResponse {
    token: string;
    role: string;
} 