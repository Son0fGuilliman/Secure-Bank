import apiClient from './client';

export const transactionApi = {
    transfer: (data: {
        nomor_rekening_tujuan: string;
        nominal: number;
        keterangan?: string;
    }) => apiClient.post('/transactions/transfer', data),

    getHistory: (page = 1, limit = 10) =>
        apiClient.get(`/transactions/history?page=${page}&limit=${limit}`),
};