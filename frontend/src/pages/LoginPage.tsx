import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth.api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

type Step = 'login' | 'otp';

export const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [step, setStep] = useState<Step>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);
        try {
            await authApi.login(email, password);
            toast.success('Kode OTP dikirim ke email kamu!');
            setStep('otp');
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Login gagal. Coba lagi.';
            setErrorMsg(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);
        try {
            const res = await authApi.verifyOtp(email, otp);
            const { accessToken, user } = res.data.data;
            login(accessToken, user);
            toast.success(`Selamat datang, ${user.nama}!`);
            navigate('/dashboard');
        } catch (err: any) {
            const msg = err.response?.data?.message || 'OTP salah atau expired.';
            setErrorMsg(msg);
            toast.error(msg);
            // Kalau OTP expired atau percobaan habis → balik ke step login
            if (
                msg.toLowerCase().includes('expired') ||
                msg.toLowerCase().includes('percobaan habis') ||
                msg.toLowerCase().includes('login ulang')
            ) {
                setTimeout(() => {
                    setStep('login');
                    setOtp('');
                    setErrorMsg('');
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">SecureBank</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {step === 'login' ? 'Masuk ke akun kamu' : 'Verifikasi kode OTP'}
                    </p>
                </div>

                {/* Step indicator */}
                <div className="flex gap-2 mb-8">
                    {(['login', 'otp'] as Step[]).map((s, i) => (
                        <div key={s} className="flex-1">
                            <div className={`h-1.5 rounded-full transition-colors ${s === 'login' || step === 'otp' ? 'bg-blue-600' : 'bg-gray-200'
                                }`} />
                            <p className="text-xs text-gray-400 mt-1 text-center">
                                {i + 1}. {s === 'login' ? 'Password' : 'Kode OTP'}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Error banner */}
                {errorMsg && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                        {errorMsg}
                    </div>
                )}

                {step === 'login' ? (
                    <form onSubmit={handleLogin} noValidate className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            autoComplete="username"
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimal 8 karakter"
                            autoComplete="current-password"
                            required
                        />
                        {/* Validasi manual agar tidak bergantung HTML5 */}
                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full mt-2"
                            size="lg"
                            onClick={(e) => {
                                if (!email || !password) {
                                    e.preventDefault();
                                    setErrorMsg('Email dan password wajib diisi');
                                }
                            }}
                        >
                            Lanjut
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} noValidate className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                            Kode OTP 6 digit dikirim ke <strong>{email}</strong>.<br />
                            Berlaku <strong>5 menit</strong> dan hanya bisa dipakai <strong>sekali</strong>.
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">
                                Kode OTP
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={otp}
                                onChange={(e) => {
                                    setErrorMsg('');
                                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                                }}
                                placeholder="000000"
                                maxLength={6}
                                autoComplete="one-time-code"
                                className="w-full px-3 py-4 border border-gray-300 rounded-lg text-center text-3xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-400 mt-1 text-center">
                                Cek folder Spam jika email tidak masuk
                            </p>
                        </div>
                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full"
                            size="lg"
                            disabled={otp.length !== 6}
                        >
                            Verifikasi & Masuk
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={() => { setStep('login'); setOtp(''); setErrorMsg(''); }}
                        >
                            ← Kembali & Login Ulang
                        </Button>
                    </form>
                )}

                <p className="text-center text-sm text-gray-500 mt-6">
                    Belum punya akun?{' '}
                    <Link to="/register" className="text-blue-600 hover:underline font-medium">
                        Daftar sekarang
                    </Link>
                </p>
            </div>
        </div>
    );
};