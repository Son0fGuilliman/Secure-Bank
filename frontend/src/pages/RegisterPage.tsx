import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        nik: '', nama: '', email: '', nomor_hp: '', password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.nik.length !== 16 || !/^\d+$/.test(form.nik)) {
            toast.error('NIK harus tepat 16 digit angka');
            return;
        }
        if (form.password.length < 8) {
            toast.error('Password minimal 8 karakter');
            return;
        }
        setLoading(true);
        try {
            const res = await authApi.register(form);
            const { nomor_rekening } = res.data.data;
            toast.success(`Registrasi berhasil! Nomor rekening kamu: ${nomor_rekening}`);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registrasi gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Daftar Akun</h1>
                    <p className="text-slate-500 text-sm mt-1">Bergabung dengan SecureBank</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="NIK (16 digit)"
                        name="nik"
                        value={form.nik}
                        onChange={handleChange}
                        placeholder="3201234567890001"
                        maxLength={16}
                        required
                    />
                    <Input
                        label="Nama Lengkap"
                        name="nama"
                        value={form.nama}
                        onChange={handleChange}
                        placeholder="Nama sesuai KTP"
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        required
                    />
                    <Input
                        label="Nomor HP (opsional)"
                        name="nomor_hp"
                        value={form.nomor_hp}
                        onChange={handleChange}
                        placeholder="081234567890"
                    />
                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Minimal 8 karakter"
                        required
                    />

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                        Saldo awal rekening: <strong>Rp 1.000.000</strong> (untuk keperluan testing)
                    </div>

                    <Button type="submit" loading={loading} className="w-full" size="lg">
                        Daftar Sekarang
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Sudah punya akun?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                        Masuk di sini
                    </Link>
                </p>
            </div>
        </div>
    );
};