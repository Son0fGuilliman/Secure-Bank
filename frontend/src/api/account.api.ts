import apiClient from './client';

export const accountApi = {
    getMyAccount: () => apiClient.get('/accounts/me'),

    getAllUsers: () => apiClient.get('/accounts/admin/users'),

    updateUserStatus: (userId: string, status: 'aktif' | 'suspend') =>
        apiClient.patch(`/accounts/admin/users/${userId}/status`, { status }),
};