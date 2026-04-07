import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatRupiah } from '../utils/format';
import { User, CreditCard, Shield } from 'lucide-react';

export const ProfilePage = () => {
    const { user } = useAuth();
    const account = user?.accounts?.[0];

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Profil Saya</h2>
                <p className="text-gray-500 text-sm mt-1">Informasi akun dan rekening kamu</p>
            </div>

            {/* Informasi Pribadi */}
            <Card title="Informasi Pribadi">
                <div className="flex items-start gap-4">
                    <div className="p-4 bg-blue-100 rounded-full">
                        <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="space-y-3 flex-1">
                        <div>
                            <p className="text-xs text-gray-400">Nama Lengkap</p>
                            <p className="font-semibold text-gray-900">{user?.nama}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Email</p>
                            <p className="font-medium text-gray-700">{user?.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Role</p>
                            <Badge variant={user?.role === 'admin' ? 'warning' : 'info'}>
                                {user?.role ?? 'nasabah'}
                            </Badge>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Informasi Rekening */}
            {account && (
                <Card title="Informasi Rekening">
                    <div className="flex items-start gap-4">
                        <div className="p-4 bg-green-100 rounded-full">
                            <CreditCard className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="space-y-3 flex-1">
                            <div>
                                <p className="text-xs text-gray-400">Nomor Rekening</p>
                                <p className="font-mono font-bold text-gray-900 text-lg">
                                    {account.nomor_rekening}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Saldo</p>
                                <p className="font-bold text-blue-600 text-xl">
                                    {formatRupiah(account.saldo)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Status Rekening</p>
                                <Badge variant="success">Aktif</Badge>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Keamanan */}
            <Card title="Keamanan Akun">
                <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                            Multi-Factor Authentication aktif
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Setiap login memerlukan kode OTP 6 digit yang dikirim ke email kamu
                        </p>
                    </div>
                    <Badge variant="success">Aktif</Badge>
                </div>
            </Card>
        </div>
    );
};