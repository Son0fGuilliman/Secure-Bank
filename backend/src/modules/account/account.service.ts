import prisma from '../../config/database';

export const getMyAccountService = async (userId: string) => {
    const account = await prisma.account.findFirst({
        where: { user_id: userId, status: 'aktif' },
        include: { user: { select: { nama: true, email: true, role: true } } },
    });
    if (!account) throw new Error('Rekening tidak ditemukan');
    return {
        id: account.id,
        nomor_rekening: account.nomor_rekening,
        saldo: account.saldo,
        tipe_akun: account.tipe_akun,
        status: account.status,
        nama: account.user.nama,
        email: account.user.email,
        role: account.user.role,
        created_at: account.created_at,
    };
};

export const getAccountByNomorRekening = async (nomor_rekening: string) => {
    return prisma.account.findUnique({
        where: { nomor_rekening },
        include: { user: { select: { nama: true, email: true } } },
    });
};

export const getAllUsersService = async () => {
    return prisma.user.findMany({
        select: {
            id: true, nik: true, nama: true, email: true,
            nomor_hp: true, role: true, status: true, created_at: true,
            accounts: { select: { nomor_rekening: true, saldo: true, status: true } },
        },
        orderBy: { created_at: 'desc' },
    });
};

export const updateUserStatusService = async (
    userId: string, status: 'aktif' | 'suspend'
) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User tidak ditemukan');
    if (user.role === 'admin') throw new Error('Tidak bisa suspend akun admin');
    return prisma.user.update({
        where: { id: userId },
        data: { status },
        select: { id: true, nama: true, status: true },
    });
};