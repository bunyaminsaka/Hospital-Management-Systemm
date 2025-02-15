import { doctors } from '../api';
import { mockAxios, resetMockAxios } from './mockAxios';

describe('doctors service', () => {
    beforeEach(() => {
        resetMockAxios();
    });

    it('gets all doctors', async () => {
        const mockDoctors = [
            { id: 1, name: 'Dr. Smith', specialty: 'Cardiology' },
            { id: 2, name: 'Dr. Jones', specialty: 'Pediatrics' }
        ];
        mockAxios.get.mockResolvedValueOnce({ data: mockDoctors });

        const result = await doctors.getAll();

        expect(mockAxios.get).toHaveBeenCalledWith('/doctors');
        expect(result).toEqual(mockDoctors);
    });

    it('gets doctor by id', async () => {
        const mockDoctor = { id: 1, name: 'Dr. Smith', specialty: 'Cardiology' };
        mockAxios.get.mockResolvedValueOnce({ data: mockDoctor });

        const result = await doctors.getById(1);

        expect(mockAxios.get).toHaveBeenCalledWith('/doctors/1');
        expect(result).toEqual(mockDoctor);
    });

    it('creates new doctor', async () => {
        const newDoctor = { name: 'Dr. Smith', specialty: 'Cardiology' };
        const mockResponse = { id: 1, ...newDoctor };
        mockAxios.post.mockResolvedValueOnce({ data: mockResponse });

        const result = await doctors.create(newDoctor);

        expect(mockAxios.post).toHaveBeenCalledWith('/doctors', newDoctor);
        expect(result).toEqual(mockResponse);
    });

    it('updates doctor', async () => {
        const doctorId = 1;
        const updateData = { name: 'Dr. Smith Updated', specialty: 'Neurology' };
        mockAxios.put.mockResolvedValueOnce({ data: null });

        await doctors.update(doctorId, updateData);

        expect(mockAxios.put).toHaveBeenCalledWith(`/doctors/${doctorId}`, updateData);
    });

    it('deletes doctor', async () => {
        const doctorId = 1;
        mockAxios.delete.mockResolvedValueOnce({ data: null });

        await doctors.delete(doctorId);

        expect(mockAxios.delete).toHaveBeenCalledWith(`/doctors/${doctorId}`);
    });

    it('handles API errors', async () => {
        mockAxios.get.mockRejectedValueOnce(new Error('Network error'));

        await expect(doctors.getAll()).rejects.toThrow('Network error');
    });
}); 