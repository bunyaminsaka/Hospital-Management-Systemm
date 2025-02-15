export interface Doctor {
    id: number;
    name: string;
    PWZNumber: string;
    specialty: string;
    workHours: string;
    phoneNumber?: string;
    email?: string;
    userId?: number;
}

export interface Patient {
    id: number;
    name: string;
    dateOfBirth: string;
    gender: string;
    phoneNumber?: string;
    email?: string;
}

export interface Appointment {
    id: number;
    appointmentDate: string;
    status: string;
    notes?: string;
    doctorId: number;
    patientId: number;
    doctorName: string;
    patientName: string;
}

export interface MedicalRecord {
    id: number;
    recordDate: string;
    diagnosis: string;
    treatment: string;
    notes?: string;
    patientId: number;
    patientName: string;
}

export interface AuthResponse {
    token: string;
    username: string;
    role: string;
}

export interface User {
    username: string;
    role: string;
} 