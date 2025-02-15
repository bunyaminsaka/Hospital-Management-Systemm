import { medicalRecords } from '../api';
import { mockAxios, resetMockAxios } from './mockAxios';

describe('medicalRecords service', () => {
    beforeEach(() => {
        resetMockAxios();
    });

    it('gets all medical records', async () => {
        const mockRecords = [
            {
                id: 1,
                patientId: 1,
                patientName: 'John Doe',
                recordDate: '2023-12-01T10:00:00',
                diagnosis: 'Common Cold',
                treatment: 'Rest and fluids',
                notes: 'Patient showing improvement'
            },
            {
                id: 2,
                patientId: 2,
                patientName: 'Jane Smith',
                recordDate: '2023-12-02T14:30:00',
                diagnosis: 'Migraine',
                treatment: 'Prescribed pain medication',
                notes: 'Follow-up in 2 weeks'
            }
        ];
        mockAxios.get.mockResolvedValueOnce({ data: mockRecords });

        const result = await medicalRecords.getAll();

        expect(mockAxios.get).toHaveBeenCalledWith('/medical-records');
        expect(result).toEqual(mockRecords);
    });

    it('gets medical record by id', async () => {
        const mockRecord = {
            id: 1,
            patientId: 1,
            patientName: 'John Doe',
            recordDate: '2023-12-01T10:00:00',
            diagnosis: 'Common Cold',
            treatment: 'Rest and fluids',
            notes: 'Patient showing improvement'
        };
        mockAxios.get.mockResolvedValueOnce({ data: mockRecord });

        const result = await medicalRecords.getById(1);

        expect(mockAxios.get).toHaveBeenCalledWith('/medical-records/1');
        expect(result).toEqual(mockRecord);
    });

    it('creates new medical record', async () => {
        const newRecord = {
            patientId: 1,
            diagnosis: 'Common Cold',
            treatment: 'Rest and fluids',
            notes: 'Patient showing improvement'
        };
        const mockResponse = {
            id: 1,
            ...newRecord,
            patientName: 'John Doe',
            recordDate: '2023-12-01T10:00:00'
        };
        mockAxios.post.mockResolvedValueOnce({ data: mockResponse });

        const result = await medicalRecords.create(newRecord);

        expect(mockAxios.post).toHaveBeenCalledWith('/medical-records', newRecord);
        expect(result).toEqual(mockResponse);
    });

    it('updates medical record', async () => {
        const recordId = 1;
        const updateData = {
            diagnosis: 'Updated Diagnosis',
            treatment: 'Updated Treatment',
            notes: 'Updated notes'
        };
        mockAxios.put.mockResolvedValueOnce({ data: null });

        await medicalRecords.update(recordId, updateData);

        expect(mockAxios.put).toHaveBeenCalledWith(`/medical-records/${recordId}`, updateData);
    });

    it('deletes medical record', async () => {
        const recordId = 1;
        mockAxios.delete.mockResolvedValueOnce({ data: null });

        await medicalRecords.delete(recordId);

        expect(mockAxios.delete).toHaveBeenCalledWith(`/medical-records/${recordId}`);
    });

    it('gets medical records by patient', async () => {
        const patientId = 1;
        const mockRecords = [
            {
                id: 1,
                patientId: 1,
                patientName: 'John Doe',
                recordDate: '2023-12-01T10:00:00',
                diagnosis: 'Common Cold',
                treatment: 'Rest and fluids',
                notes: 'Patient showing improvement'
            }
        ];
        mockAxios.get.mockResolvedValueOnce({ data: mockRecords });

        const result = await medicalRecords.getByPatient(patientId);

        expect(mockAxios.get).toHaveBeenCalledWith(`/medical-records/patient/${patientId}`);
        expect(result).toEqual(mockRecords);
    });

    it('searches medical records', async () => {
        const searchTerm = 'Cold';
        const mockRecords = [
            {
                id: 1,
                patientId: 1,
                patientName: 'John Doe',
                recordDate: '2023-12-01T10:00:00',
                diagnosis: 'Common Cold',
                treatment: 'Rest and fluids',
                notes: 'Patient showing improvement'
            }
        ];
        mockAxios.get.mockResolvedValueOnce({ data: mockRecords });

        const result = await medicalRecords.search(searchTerm);

        expect(mockAxios.get).toHaveBeenCalledWith(`/medical-records/search/${searchTerm}`);
        expect(result).toEqual(mockRecords);
    });

    it('handles API errors', async () => {
        mockAxios.get.mockRejectedValueOnce(new Error('Network error'));

        await expect(medicalRecords.getAll()).rejects.toThrow('Network error');
    });
}); 