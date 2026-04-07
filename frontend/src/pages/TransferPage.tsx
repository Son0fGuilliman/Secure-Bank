import { useState } from 'react';
import { transactionApi } from '../api/transaction.api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatRupiah } from '../utils/format';
import toast from 'react-hot-toast';
import { CheckCircle, Copy } from 'lucide-react';

type Step = 'form' | 'confirm' | 'success';

interface TransferResult {
    transaction_id: string;
    nominal: number;
    ke_rekening: string;
    nama_penerima: string;
    blockchain_hash: string;
    waktu: string;
}

export const TransferPage = () => {
    const [step, setStep] = useState<Step>('form');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<TransferResult | null>(null);
    const [form, setForm] = useState({
        nomor_rekening_tujuan: '',
        nominal: '',
        keterangan: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        const num = parseInt(form.nominal);
        if (isNaN(num) || num < 10000) {
            toast.error('Nominal minimal Rp 10.000');
            return;
        }
        if (num > 50000000) {
            toast.error('Nominal maksimal Rp 50.000.000');
            return;
        }
        setStep('confirm');
    };

    const handleTransfer = async () => {
        setLoading(true);
        try {
            const res = await transactionApi.transfer({
                nomor_rekening_tujuan: form.nomor_rekening_tujuan,
                nominal: parseInt(form.nominal),
                keterangan: form.keterangan || undefined,
            });
            setResult(res.data.data);
            setStep('success');
            toast.success('Transfer berhasil!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Transfer gagal');
            setStep('form');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setStep('form');
        setResult(null);
        setForm({ nomor_rekening_tujuan: '', nominal: '', keterangan: '' });
    };

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Transfer Dana</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Setiap transfer dicatat di blockchain sebagai bukti permanen
                </p>
            </div>

            {step === 'form' && (
                <Card>
                    <form onSubmit={handleConfirm} className="space-y-4">
                        <Input
                            label="Nomor Rekening Tujuan"
                            name="nomor_rekening_tujuan"
                            value={form.nomor_rekening_tujuan}
                            onChange={handleChange}
                            placeholder="Contoh: 1000000003"
                            required
                        />
                        <div>
                            <label className="text-sm font-medium text-gray-700">Nominal (Rp)</label>
                            <div className="relative mt-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                                <input
                                    type="number"
                                    name="nominal"
                                    value={form.nominal}
                                    onChange={handleChange}
                                    placeholder="100000"
                                    min={10000}
                                    max={50000000}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Min: Rp 10.000 — Max: Rp 50.000.000/transaksi</p>
                        </div>
                        <Input
                            label="Keterangan (opsional)"
                            name="keterangan"
                            value={form.keterangan}
                            onChange={handleChange}
                            placeholder="Bayar utang, dll."
                            maxLength={200}
                        />
                        <Button type="submit" className="w-full" size="lg">
                            Lanjut ke Konfirmasi
                        </Button>
                    </form>
                </Card>
            )}

            {step === 'confirm' && (
                <Card title="Konfirmasi Transfer">
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Ke Rekening</span>
                            <span className="font-medium font-mono">{form.nomor_rekening_tujuan}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Nominal</span>
                            <span className="font-semibold text-lg text-blue-600">
                                {formatRupiah(parseInt(form.nominal))}
                            </span>
                        </div>
                        {form.keterangan && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Keterangan</span>
                                <span className="font-medium">{form.keterangan}</span>
                            </div>
                        )}
                        <div className="border-t border-gray-100 pt-3">
                            <p className="text-xs text-gray-400">
                                Transaksi ini akan dicatat permanen di Hyperledger Besu blockchain.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setStep('form')}
                        >
                            Kembali
                        </Button>
                        <Button
                            className="flex-1"
                            loading={loading}
                            onClick={handleTransfer}
                        >
                            Konfirmasi & Transfer
                        </Button>
                    </div>
                </Card>
            )}

            {step === 'success' && result && (
                <Card>
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Transfer Berhasil!</h3>
                            <p className="text-gray-500 text-sm mt-1">
                                {formatRupiah(result.nominal)} → {result.nama_penerima}
                            </p>
                        </div>

                        {/* Blockchain proof */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                            <p className="text-xs font-semibold text-green-700 mb-1">
                                🔗 Bukti Blockchain (SHA-256 Hash)
                            </p>
                            <div className="flex items-center gap-2">
                                <p className="text-xs font-mono text-green-800 break-all flex-1">
                                    {result.blockchain_hash}
                                </p>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(result.blockchain_hash);
                                        toast.success('Hash disalin!');
                                    }}
                                    className="shrink-0 p-1 hover:bg-green-100 rounded"
                                >
                                    <Copy className="h-3 w-3 text-green-600" />
                                </button>
                            </div>
                        </div>

                        <Button onClick={handleReset} className="w-full" size="lg">
                            Transfer Lagi
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};