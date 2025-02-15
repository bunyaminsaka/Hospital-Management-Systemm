import { appointments } from '../api';
import { mockAxios, resetMockAxios } from './mockAxios';

describe('appointments service', () => {
    beforeEach(() => {
        resetMockAxios();
    });

    it('gets all appointments', async () => {
        const mockAppointments = [
            {
                id: 1,
                doctorId: 1,
                doctorName: 'Dr. Smith',
                patientId: 1,
                patientName: 'John Doe',
                appointmentDate: '2023-12-01T10:00:00',
                status: 'Scheduled',
                notes: 'Regular checkup'
            },
            {
                id: 2,
                doctorId: 2,
                doctorName: 'Dr. Jones',
                patientId: 2,
                patientName: 'Jane Smith',
                appointmentDate: '2023-12-02T14:30:00',
                status: 'Scheduled',
                notes: 'Follow-up'
            }
        ];
        mockAxios.get.mockResolvedValueOnce({ data: mockAppointments });

        const result = await appointments.getAll();

        expect(mockAxios.get).toHaveBeenCalledWith('/appointments');
        expect(result).toEqual(mockAppointments);
    });

    it('gets appointment by id', async () => {
        const mockAppointment = {
            id: 1,
            doctorId: 1,
            doctorName: 'Dr. Smith',
            patientId: 1,
            patientName: 'John Doe',
            appointmentDate: '2023-12-01T10:00:00',
            status: 'Scheduled',
            notes: 'Regular checkup'
        };
        mockAxios.get.mockResolvedValueOnce({ data: mockAppointment });

        const result = await appointments.getById(1);

        expect(mockAxios.get).toHaveBeenCalledWith('/appointments/1');
        expect(result).toEqual(mockAppointment);
    });

    it('creates new appointment', async () => {
        const newAppointment = {
            doctorId: 1,
            patientId: 1,
            appointmentDate: '2023-12-01T10:00:00',
            notes: 'Regular checkup'
        };
        const mockResponse = {
            id: 1,
            ...newAppointment,
            doctorName: 'Dr. Smith',
            patientName: 'John Doe',
            status: 'Scheduled'
        };
        mockAxios.post.mockResolvedValueOnce({ data: mockResponse });

        const result = await appointments.create(newAppointment);

        expect(mockAxios.post).toHaveBeenCalledWith('/appointments', newAppointment);
        expect(result).toEqual(mockResponse);
    });

    it('updates appointment', async () => {
        const appointmentId = 1;
        const updateData = {
            appointmentDate: '2023-12-02T11:00:00',
            status: 'Rescheduled',
            notes: 'Rescheduled appointment'
        };
        mockAxios.put.mockResolvedValueOnce({ data: null });

        await appointments.update(appointmentId, updateData);

        expect(mockAxios.put).toHaveBeenCalledWith(`/appointments/${appointmentId}`, updateData);
    });

    it('deletes appointment', async () => {
        const appointmentId = 1;
        mockAxios.delete.mockResolvedValueOnce({ data: null });

        await appointments.delete(appointmentId);

        expect(mockAxios.delete).toHaveBeenCalledWith(`/appointments/${appointmentId}`);
    });

    it('gets appointments by doctor', async () => {
        const doctorId = 1;
        const mockAppointments = [
            {
                id: 1,
                doctorId: 1,
                doctorName: 'Dr. Smith',
                patientId: 1,
                patientName: 'John Doe',
                appointmentDate: '2023-12-01T10:00:00',
                status: 'Scheduled',
                notes: 'Regular checkup'
            }
        ];
        mockAxios.get.mockResolvedValueOnce({ data: mockAppointments });

        const result = await appointments.getByDoctor(doctorId);

        expect(mockAxios.get).toHaveBeenCalledWith(`/appointments/doctor/${doctorId}`);
        expect(result).toEqual(mockAppointments);
    });

    it('gets appointments by patient', async () => {
        const patientId = 1;
        const mockAppointments = [
            {
                id: 1,
                doctorId: 1,
                doctorName: 'Dr. Smith',
                patientId: 1,
                patientName: 'John Doe',
                appointmentDate: '2023-12-01T10:00:00',
                status: 'Scheduled',
                notes: 'Regular checkup'
            }
        ];
        mockAxios.get.mockResolvedValueOnce({ data: mockAppointments });

        const result = await appointments.getByPatient(patientId);

        expect(mockAxios.get).toHaveBeenCalledWith(`/appointments/patient/${patientId}`);
        expect(result).toEqual(mockAppointments);
    });

    it('handles API errors', async () => {
        mockAxios.get.mockRejectedValueOnce(new Error('Network error'));

        await expect(appointments.getAll()).rejects.toThrow('Network error');
    });
}); 