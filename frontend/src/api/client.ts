import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
});

// Attach token dari memory ke setiap request
apiClient.interceptors.request.use((config) => {
    const token = window.__accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Global error handler
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        //Jangan redirect kalau ini endpoint auth (login/OTP flow)
        //401 dari verify-otp = OTP salah, bukan token expired
        const isAuthEndpoint = error.config?.url?.includes('/auth/');

        if (error.response?.status === 401 && !isAuthEndpoint) {
            // Token expired — clear dan redirect ke login
            window.__accessToken = undefined;
            sessionStorage.removeItem('sb_token');
            sessionStorage.removeItem('sb_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Simpan token di memory (bukan localStorage — lebih aman dari XSS)
declare global {
    interface Window {
        __accessToken?: string;
    }
}

export const setToken = (token: string) => {
    window.__accessToken = token;
    //backup ke sessionStorage agar token tetap ada walaupun user refresh page (tapi hilang kalau tab ditutup)
    sessionStorage.setItem('sb_token', token);
};

export const clearToken = () => {
    window.__accessToken = undefined;
    sessionStorage.removeItem('sb_token');
    sessionStorage.removeItem('sb_user');
};

export default apiClient;