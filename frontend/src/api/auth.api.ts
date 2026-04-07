import apiClient from './client';

export const authApi = {
    register: (data: {
        nik: string;
        nama: string;
        email: string;
        nomor_hp?: string;
        password: string;
    }) => apiClient.post('/auth/register', data),

    login: (email: string, password: string) =>
        apiClient.post('/auth/login', { email, password }),

    verifyOtp: (email: string, otp: string) =>
        apiClient.post('/auth/verify-otp', { email, otp }),
};