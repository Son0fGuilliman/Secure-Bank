import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding...');

    const adminHash = await bcrypt.hash('Admin@123', 12);
    await prisma.user.upsert({
        where: { email: 'admin@securebank.id' },
        update: {},
        create: {
            nik: '3201234567890001',
            nama: 'Admin SecureBank',
            email: 'admin@securebank.id',
            nomor_hp: '081234567890',
            password_hash: adminHash,
            role: 'admin',
            accounts: {
                create: {
                    nomor_rekening: '1000000001',
                    saldo: 0,
                    tipe_akun: 'admin',
                },
            },
        },
    });

    const user1Hash = await bcrypt.hash('Nasabah@123', 12);
    await prisma.user.upsert({
        where: { email: 'azmi@test.com' },
        update: {},
        create: {
            nik: '3201234567890002',
            nama: 'Azmi Aziz Syahputra',
            email: 'azmi@test.com',
            password_hash: user1Hash,
            accounts: {
                create: { nomor_rekening: '1000000002', saldo: 5000000 },
            },
        },
    });

    const user2Hash = await bcrypt.hash('Nasabah@123', 12);
    await prisma.user.upsert({
        where: { email: 'saci@test.com' },
        update: {},
        create: {
            nik: '3201234567890003',
            nama: 'Ni Wayan Saci Rani',
            email: 'saci@test.com',
            password_hash: user2Hash,
            accounts: {
                create: { nomor_rekening: '1000000003', saldo: 3000000 },
            },
        },
    });

    console.log('✅ Seeding selesai!');
    console.log('admin@securebank.id  / Admin@123');
    console.log('azmi@test.com        / Nasabah@123  (saldo Rp 5.000.000)');
    console.log('saci@test.com        / Nasabah@123  (saldo Rp 3.000.000)');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });