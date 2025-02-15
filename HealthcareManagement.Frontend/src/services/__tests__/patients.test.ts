import { patients } from '../api';
import { mockAxios, resetMockAxios } from './mockAxios';

describe('patients service', () => {
    beforeEach(() => {
        resetMockAxios();
    });

    it('gets all patients', async () => {
        const mockPatients = [
            { id: 1, name: 'John Doe', dateOfBirth: '1990-01-01', gender: 'Male' },
            { id: 2, name: 'Jane Smith', dateOfBirth: '1995-02-15', gender: 'Female' }
        ];
        mockAxios.get.mockResolvedValueOnce({ data: mockPatients });

        const result = await patients.getAll();

        expect(mockAxios.get).toHaveBeenCalledWith('/patients');
        expect(result).toEqual(mockPatients);
    });

    it('gets patient by id', async () => {
        const mockPatient = { id: 1, name: 'John Doe', dateOfBirth: '1990-01-01', gender: 'Male' };
        mockAxios.get.mockResolvedValueOnce({ data: mockPatient });

        const result = await patients.getById(1);

        expect(mockAxios.get).toHaveBeenCalledWith('/patients/1');
        expect(result).toEqual(mockPatient);
    });

    it('creates new patient', async () => {
        const newPatient = {
            name: 'John Doe',
            dateOfBirth: '1990-01-01',
            gender: 'Male',
            phoneNumber: '123-456-7890',
            email: 'john@example.com'
        };
        const mockResponse = { id: 1, ...newPatient };
        mockAxios.post.mockResolvedValueOnce({ data: mockResponse });

        const result = await patients.create(newPatient);

        expect(mockAxios.post).toHaveBeenCalledWith('/patients', newPatient);
        expect(result).toEqual(mockResponse);
    });

    it('updates patient', async () => {
        const patientId = 1;
        const updateData = {
            name: 'John Doe Updated',
            phoneNumber: '098-765-4321',
            email: 'john.updated@example.com'
        };
        mockAxios.put.mockResolvedValueOnce({ data: null });

        await patients.update(patientId, updateData);

        expect(mockAxios.put).toHaveBeenCalledWith(`/patients/${patientId}`, updateData);
    });

    it('deletes patient', async () => {
        const patientId = 1;
        mockAxios.delete.mockResolvedValueOnce({ data: null });

        await patients.delete(patientId);

        expect(mockAxios.delete).toHaveBeenCalledWith(`/patients/${patientId}`);
    });

    it('gets patients by gender', async () => {
        const mockPatients = [
            { id: 1, name: 'John Doe', dateOfBirth: '1990-01-01', gender: 'Male' }
        ];
        mockAxios.get.mockResolvedValueOnce({ data: mockPatients });

        const result = await patients.getByGender('Male');

        expect(mockAxios.get).toHaveBeenCalledWith('/patients/gender/Male');
        expect(result).toEqual(mockPatients);
    });

    it('searches patients', async () => {
        const mockPatients = [
            { id: 1, name: 'John Doe', dateOfBirth: '1990-01-01', gender: 'Male' }
        ];
        mockAxios.get.mockResolvedValueOnce({ data: mockPatients });

        const result = await patients.search('John');

        expect(mockAxios.get).toHaveBeenCalledWith('/patients/search/John');
        expect(result).toEqual(mockPatients);
    });

    it('handles API errors', async () => {
        mockAxios.get.mockRejectedValueOnce(new Error('Network error'));

        await expect(patients.getAll()).rejects.toThrow('Network error');
    });
}); 