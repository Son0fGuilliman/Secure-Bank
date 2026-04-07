import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountApi } from '../api/account.api';
import { transactionApi } from '../api/transaction.api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatRupiah, formatDateShort, truncateHash } from '../utils/format';
import type { Account, Transaction } from '../types';
import { ArrowUpRight, ArrowDownLeft, ExternalLink } from 'lucide-react';

export const DashboardPage = () => {
    const { user } = useAuth();
    const [account, setAccount] = useState<Account | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [accRes, txRes] = await Promise.all([
                    accountApi.getMyAccount(),
                    transactionApi.getHistory(1, 5),
                ]);
                setAccount(accRes.data.data);
                setTransactions(txRes.data.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <LoadingSpinner text="Memuat dashboard..." />;

    return (
        <div className="space-y-6">
            {/* Greeting */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">
                    Selamat datang, {user?.nama?.split(' ')[0]}! 👋
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                    Ini ringkasan rekening kamu hari ini
                </p>
            </div>

            {/* Saldo Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
                <p className="text-blue-200 text-sm">Saldo Rekening</p>
                <p className="text-4xl font-bold mt-1">
                    {account ? formatRupiah(account.saldo) : 'Rp -'}
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-blue-200">
                    <span>No. Rek: <strong className="text-white">{account?.nomor_rekening}</strong></span>
                    <Badge variant="info">
                        {account?.tipe_akun || 'tabungan'}
                    </Badge>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <Link
                    to="/transfer"
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                    <div className="p-3 bg-blue-100 rounded-full">
                        <ArrowUpRight className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Transfer</span>
                </Link>
                <Link
                    to="/history"
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                    <div className="p-3 bg-green-100 rounded-full">
                        <ArrowDownLeft className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Riwayat</span>
                </Link>
            </div>

            {/* Transaksi Terakhir */}
            <Card title="5 Transaksi Terakhir">
                {transactions.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-4">
                        Belum ada transaksi
                    </p>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                                <div className={`p-2 rounded-full ${tx.tipe === 'debit' ? 'bg-red-100' : 'bg-green-100'}`}>
                                    {tx.tipe === 'debit'
                                        ? <ArrowUpRight className="h-4 w-4 text-red-600" />
                                        : <ArrowDownLeft className="h-4 w-4 text-green-600" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {tx.tipe === 'debit' ? `ke ${tx.nama_penerima}` : `dari ${tx.nama_pengirim}`}
                                    </p>
                                    <p className="text-xs text-gray-400">{formatDateShort(tx.waktu)}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-semibold ${tx.tipe === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                                        {tx.tipe === 'debit' ? '-' : '+'}{formatRupiah(tx.nominal)}
                                    </p>
                                    {tx.blockchain_hash && (
                                        <span className="text-xs text-blue-500 font-mono" title={tx.blockchain_hash}>
                                            {truncateHash(tx.blockchain_hash, 8)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link
                        to="/history"
                        className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                        Lihat semua transaksi <ExternalLink className="h-3 w-3" />
                    </Link>
                </div>
            </Card>
        </div>
    );
};