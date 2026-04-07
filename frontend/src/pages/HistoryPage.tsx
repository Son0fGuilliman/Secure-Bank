import { useState, useEffect } from 'react';
import { transactionApi } from '../api/transaction.api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { formatRupiah, formatDate } from '../utils/format';
import type { Transaction, Pagination } from '../types';
import { ArrowUpRight, ArrowDownLeft, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const HistoryPage = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Transaction | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const res = await transactionApi.getHistory(page, 10);
                setTransactions(res.data.data.data);
                setPagination(res.data.data.pagination);
            } catch {
                toast.error('Gagal memuat riwayat');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [page]);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Klik transaksi untuk melihat bukti blockchain
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List */}
                <div className="lg:col-span-2">
                    <Card>
                        {transactions.length === 0 ? (
                            <p className="text-center text-gray-400 py-8">Belum ada transaksi</p>
                        ) : (
                            <div className="space-y-2">
                                {transactions.map((tx) => (
                                    <div
                                        key={tx.id}
                                        onClick={() => setSelected(tx)}
                                        className={`
                      flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                      ${selected?.id === tx.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}
                    `}
                                    >
                                        <div className={`p-2 rounded-full shrink-0 ${tx.tipe === 'debit' ? 'bg-red-100' : 'bg-green-100'}`}>
                                            {tx.tipe === 'debit'
                                                ? <ArrowUpRight className="h-4 w-4 text-red-600" />
                                                : <ArrowDownLeft className="h-4 w-4 text-green-600" />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {tx.tipe === 'debit' ? `Transfer ke ${tx.nama_penerima}` : `Dari ${tx.nama_pengirim}`}
                                            </p>
                                            <p className="text-xs text-gray-400">{formatDate(tx.waktu)}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={`text-sm font-semibold ${tx.tipe === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                                                {tx.tipe === 'debit' ? '-' : '+'}{formatRupiah(tx.nominal)}
                                            </p>
                                            <Badge variant={tx.status === 'COMPLETED' ? 'success' : tx.status === 'FAILED' ? 'danger' : 'warning'}>
                                                {tx.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination && pagination.total_pages > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-500">
                                    Halaman {pagination.page} dari {pagination.total_pages} ({pagination.total} transaksi)
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={page === pagination.total_pages}
                                        onClick={() => setPage(p => p + 1)}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Detail Panel */}
                <div>
                    {selected ? (
                        <Card title="Detail Transaksi">
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-500 text-xs">Jenis</p>
                                    <p className="font-medium capitalize">{selected.tipe === 'debit' ? '🔴 Transfer Keluar' : '🟢 Transfer Masuk'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs">Nominal</p>
                                    <p className="font-bold text-lg">{formatRupiah(selected.nominal)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs">Dari</p>
                                    <p className="font-medium">{selected.nama_pengirim}</p>
                                    <p className="text-xs text-gray-400 font-mono">{selected.nomor_rekening_pengirim}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs">Ke</p>
                                    <p className="font-medium">{selected.nama_penerima}</p>
                                    <p className="text-xs text-gray-400 font-mono">{selected.nomor_rekening_penerima}</p>
                                </div>
                                {selected.keterangan && (
                                    <div>
                                        <p className="text-gray-500 text-xs">Keterangan</p>
                                        <p className="font-medium">{selected.keterangan}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-gray-500 text-xs">Waktu</p>
                                    <p className="font-medium">{formatDate(selected.waktu)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs">Status</p>
                                    <Badge variant={selected.status === 'COMPLETED' ? 'success' : 'danger'}>
                                        {selected.status}
                                    </Badge>
                                </div>

                                {/* Blockchain hash */}
                                {selected.blockchain_hash && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-xs font-semibold text-blue-700 mb-1">🔗 Bukti Blockchain</p>
                                        <p className="text-xs font-mono text-blue-800 break-all">{selected.blockchain_hash}</p>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(selected.blockchain_hash!);
                                                toast.success('Hash disalin!');
                                            }}
                                            className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                        >
                                            <Copy className="h-3 w-3" /> Salin Hash
                                        </button>
                                        {selected.blockchain_confirmed && (
                                            <p className="text-xs text-blue-600 mt-1">
                                                Dikonfirmasi: {formatDate(selected.blockchain_confirmed)}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ) : (
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400 text-sm">
                            Pilih transaksi untuk melihat detail dan bukti blockchain
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};