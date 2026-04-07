export interface User {
    id: string;
    nama: string;
    email: string;
    role: 'nasabah' | 'admin';
    accounts: Account[];
}

export interface Account {
    id: string;
    nomor_rekening: string;
    saldo: string | number;
    tipe_akun?: string;
    status?: string;
    nama?: string;
    email?: string;
    role?: string;
    created_at?: string;
}

export interface Transaction {
    id: string;
    tipe: 'debit' | 'kredit';
    nominal: string | number;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    keterangan: string | null;
    nama_pengirim: string;
    nomor_rekening_pengirim: string;
    nama_penerima: string;
    nomor_rekening_penerima: string;
    blockchain_hash: string | null;
    blockchain_confirmed: string | null;
    waktu: string;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}

export interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
}