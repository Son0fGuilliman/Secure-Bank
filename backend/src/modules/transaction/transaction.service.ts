import prisma from '../../config/database';
import { hashTransactionData } from '../../utils/crypto';
import { sendTransferNotification } from '../../utils/email';
import { createAuditLog } from '../../utils/auditLogger';
import { getAccountByNomorRekening } from '../account/account.service';

const DAILY_LIMIT = 50_000_000;

export const transferService = async (
    userId: string,
    data: { nomor_rekening_tujuan: string; nominal: number; keterangan?: string },
    ipAddress?: string
) => {
    const senderAccount = await prisma.account.findFirst({
        where: { user_id: userId, status: 'aktif' },
        include: { user: { select: { nama: true, email: true } } },
    });
    if (!senderAccount) throw new Error('Rekening pengirim tidak ditemukan');

    const receiverAccount = await getAccountByNomorRekening(data.nomor_rekening_tujuan);
    if (!receiverAccount) throw new Error('Nomor rekening tujuan tidak ditemukan');
    if (receiverAccount.id === senderAccount.id)
        throw new Error('Tidak bisa transfer ke rekening sendiri');
    if (receiverAccount.status !== 'aktif')
        throw new Error('Rekening tujuan tidak aktif');

    if (Number(senderAccount.saldo) < data.nominal) {
        await createAuditLog({
            userId, aksi: `transfer_gagal_saldo:${data.nominal}`, ipAddress, hasil: 'gagal',
        });
        throw new Error('Saldo tidak mencukupi');
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const agg = await prisma.transaction.aggregate({
        where: { dari_rekening: senderAccount.id, status: 'COMPLETED', waktu: { gte: todayStart } },
        _sum: { nominal: true },
    });
    const todayUsed = Number(agg._sum.nominal ?? 0);
    if (todayUsed + data.nominal > DAILY_LIMIT) {
        const sisa = DAILY_LIMIT - todayUsed;
        throw new Error(`Limit harian terlampaui. Sisa: Rp ${sisa.toLocaleString('id-ID')}`);
    }

    const txRecord = await prisma.$transaction(async (tx) => {
        await tx.account.update({
            where: { id: senderAccount.id },
            data: { saldo: { decrement: data.nominal } },
        });
        await tx.account.update({
            where: { id: receiverAccount.id },
            data: { saldo: { increment: data.nominal } },
        });
        return tx.transaction.create({
            data: {
                dari_rekening: senderAccount.id,
                ke_rekening: receiverAccount.id,
                nominal: data.nominal,
                status: 'PENDING',
                keterangan: data.keterangan || null,
            },
        });
    });

    const blockchainHash = hashTransactionData({
        transactionId: txRecord.id,
        nominal: data.nominal.toString(),
        dariRekening: senderAccount.id,
        keRekening: receiverAccount.id,
        waktu: txRecord.waktu.toISOString(),
    });

    await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
            where: { id: txRecord.id },
            data: { status: 'COMPLETED', blockchain_hash: blockchainHash },
        });
        await tx.blockchainRecord.create({
            data: {
                transaction_id: txRecord.id,
                tx_hash: blockchainHash,
                confirmed_at: new Date(),
            },
        });
    });

    await createAuditLog({
        userId,
        aksi: `transfer:${data.nominal}:ke:${receiverAccount.nomor_rekening}`,
        ipAddress,
        hasil: 'sukses',
    });

    sendTransferNotification(
        senderAccount.user.email, senderAccount.user.nama,
        'debit', data.nominal, blockchainHash, data.keterangan
    ).catch((e) => console.error('[Email]', e));

    sendTransferNotification(
        receiverAccount.user.email, receiverAccount.user.nama,
        'kredit', data.nominal, blockchainHash, data.keterangan
    ).catch((e) => console.error('[Email]', e));

    return {
        transaction_id: txRecord.id,
        nominal: data.nominal,
        ke_rekening: receiverAccount.nomor_rekening,
        nama_penerima: receiverAccount.user.nama,
        status: 'COMPLETED',
        blockchain_hash: blockchainHash,
        waktu: txRecord.waktu,
    };
};

export const getHistoryService = async (
    userId: string, page = 1, limit = 10
) => {
    const account = await prisma.account.findFirst({
        where: { user_id: userId, status: 'aktif' },
    });
    if (!account) throw new Error('Rekening tidak ditemukan');

    const skip = (page - 1) * limit;
    const where = {
        OR: [{ dari_rekening: account.id }, { ke_rekening: account.id }],
    };

    const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
            where,
            include: {
                from_account: { include: { user: { select: { nama: true } } } },
                to_account: { include: { user: { select: { nama: true } } } },
                blockchain_record: true,
            },
            orderBy: { waktu: 'desc' },
            skip,
            take: limit,
        }),
        prisma.transaction.count({ where }),
    ]);

    return {
        data: transactions.map((tx) => ({
            id: tx.id,
            tipe: tx.dari_rekening === account.id ? 'debit' : 'kredit',
            nominal: tx.nominal,
            status: tx.status,
            keterangan: tx.keterangan,
            nama_pengirim: tx.from_account.user.nama,
            nomor_rekening_pengirim: tx.from_account.nomor_rekening,
            nama_penerima: tx.to_account.user.nama,
            nomor_rekening_penerima: tx.to_account.nomor_rekening,
            blockchain_hash: tx.blockchain_hash,
            blockchain_confirmed: tx.blockchain_record?.confirmed_at ?? null,
            waktu: tx.waktu,
        })),
        pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
};