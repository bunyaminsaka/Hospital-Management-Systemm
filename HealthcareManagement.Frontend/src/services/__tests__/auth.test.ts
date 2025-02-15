import { auth } from '../api';
import { mockAxios, resetMockAxios } from './mockAxios';

describe('auth service', () => {
    beforeEach(() => {
        resetMockAxios();
        localStorage.clear();
    });

    describe('login', () => {
        it('sends correct login request', async () => {
            const mockResponse = { data: { token: 'test-token', role: 'Admin' } };
            mockAxios.post.mockResolvedValueOnce(mockResponse);

            const credentials = {
                username: 'testuser',
                password: 'password123'
            };

            const result = await auth.login(credentials.username, credentials.password);

            expect(mockAxios.post).toHaveBeenCalledWith('/auth/login', credentials);
            expect(result).toEqual(mockResponse.data);
        });

        it('handles login error', async () => {
            mockAxios.post.mockRejectedValueOnce(new Error('Invalid credentials'));

            await expect(auth.login('testuser', 'wrongpass'))
                .rejects.toThrow('Invalid credentials');
        });
    });

    describe('register', () => {
        it('sends correct register request', async () => {
            const mockResponse = { data: { id: 1, username: 'newuser', role: 'Doctor' } };
            mockAxios.post.mockResolvedValueOnce(mockResponse);

            const userData = {
                username: 'newuser',
                password: 'password123',
                role: 'Doctor'
            };

            const result = await auth.register(userData);

            expect(mockAxios.post).toHaveBeenCalledWith('/auth/register', userData);
            expect(result).toEqual(mockResponse.data);
        });

        it('handles registration error', async () => {
            mockAxios.post.mockRejectedValueOnce(new Error('Username taken'));

            await expect(auth.register({
                username: 'existinguser',
                password: 'password123',
                role: 'Doctor'
            })).rejects.toThrow('Username taken');
        });
    });
}); 