import { useState, useEffect } from 'react';
import { accountApi } from '../api/account.api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatRupiah } from '../utils/format';
import toast from 'react-hot-toast';
import { Users, Search } from 'lucide-react';

interface AdminUser {
    id: string;
    nik: string;
    nama: string;
    email: string;
    nomor_hp: string | null;
    role: string;
    status: string;
    created_at: string;
    accounts: { nomor_rekening: string; saldo: string; status: string }[];
}

export const AdminPage = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await accountApi.getAllUsers();
            setUsers(res.data.data);
        } catch {
            toast.error('Gagal memuat data user');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleToggleStatus = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'aktif' ? 'suspend' : 'aktif';
        setActionLoading(userId);
        try {
            await accountApi.updateUserStatus(userId, newStatus as 'aktif' | 'suspend');
            toast.success(`User berhasil di${newStatus === 'suspend' ? 'suspend' : 'aktifkan'}`);
            fetchUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal update status');
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = users.filter(u =>
        u.nama.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.accounts[0]?.nomor_rekening.includes(search)
    );

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Kelola semua akun nasabah — total {users.filter(u => u.role === 'nasabah').length} nasabah
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-lg">
                    <Users className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Admin Mode</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Nasabah', value: users.filter(u => u.role === 'nasabah').length, color: 'blue' },
                    { label: 'Akun Aktif', value: users.filter(u => u.status === 'aktif').length, color: 'green' },
                    { label: 'Akun Suspend', value: users.filter(u => u.status === 'suspend').length, color: 'red' },
                ].map(({ label, value, color }) => (
                    <div key={label} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-4`}>
                        <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
                        <p className={`text-sm text-${color}-600`}>{label}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Cari nama, email, atau nomor rekening..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* User Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 text-left">
                                <th className="pb-3 font-semibold text-gray-600">Nasabah</th>
                                <th className="pb-3 font-semibold text-gray-600">No. Rekening</th>
                                <th className="pb-3 font-semibold text-gray-600">Saldo</th>
                                <th className="pb-3 font-semibold text-gray-600">Status</th>
                                <th className="pb-3 font-semibold text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="py-3">
                                        <p className="font-medium text-gray-900">{user.nama}</p>
                                        <p className="text-xs text-gray-400">{user.email}</p>
                                        <Badge variant={user.role === 'admin' ? 'warning' : 'info'}>
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="py-3">
                                        <span className="font-mono text-xs text-gray-600">
                                            {user.accounts[0]?.nomor_rekening || '-'}
                                        </span>
                                    </td>
                                    <td className="py-3 font-medium">
                                        {user.accounts[0] ? formatRupiah(user.accounts[0].saldo) : '-'}
                                    </td>
                                    <td className="py-3">
                                        <Badge variant={user.status === 'aktif' ? 'success' : 'danger'}>
                                            {user.status}
                                        </Badge>
                                    </td>
                                    <td className="py-3">
                                        {user.role !== 'admin' && (
                                            <Button
                                                size="sm"
                                                variant={user.status === 'aktif' ? 'danger' : 'secondary'}
                                                loading={actionLoading === user.id}
                                                onClick={() => handleToggleStatus(user.id, user.status)}
                                            >
                                                {user.status === 'aktif' ? 'Suspend' : 'Aktifkan'}
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <p className="text-center text-gray-400 py-8">Tidak ada hasil untuk "{search}"</p>
                    )}
                </div>
            </Card>
        </div>
    );
};