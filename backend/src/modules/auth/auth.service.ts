import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import redis from '../../config/redis';
import { generateOTP, generateAccountNumber, hashOTP } from '../../utils/crypto';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt';
import { sendOTPEmail } from '../../utils/email';
import { createAuditLog } from '../../utils/auditLogger';

const OTP_TTL = 5 * 60;
const OTP_MAX_ATTEMPTS = 3;

export const registerService = async (data: {
    nik: string; nama: string; email: string;
    nomor_hp?: string; password: string;
}) => {
    const [emailExists, nikExists] = await Promise.all([
        prisma.user.findUnique({ where: { email: data.email } }),
        prisma.user.findUnique({ where: { nik: data.nik } }),
    ]);
    if (emailExists) throw new Error('Email sudah terdaftar');
    if (nikExists) throw new Error('NIK sudah terdaftar');

    const password_hash = await bcrypt.hash(data.password, 12);

    let nomor_rekening = generateAccountNumber();
    while (await prisma.account.findUnique({ where: { nomor_rekening } })) {
        nomor_rekening = generateAccountNumber();
    }

    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                nik: data.nik, nama: data.nama, email: data.email,
                nomor_hp: data.nomor_hp || null, password_hash,
            },
        });
        const account = await tx.account.create({
            data: { user_id: user.id, nomor_rekening, saldo: 1000000 },
        });
        return { user, account };
    });

    await createAuditLog({ userId: result.user.id, aksi: 'register', hasil: 'sukses' });

    return {
        id: result.user.id,
        nama: result.user.nama,
        email: result.user.email,
        nomor_rekening: result.account.nomor_rekening,
    };
};

export const loginService = async (
    email: string, password: string, ipAddress?: string
) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        await createAuditLog({
            aksi: `login_gagal:${email}`, ipAddress, hasil: 'gagal',
        });
        throw new Error('Email atau password salah');
    }

    if (user.status === 'suspend')
        throw new Error('Akun kamu telah disuspend. Hubungi admin.');

    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    await redis.setex(`otp:${email}`, OTP_TTL, `${otpHash}:0`);

    // Kirim email OTP — jangan sampai hang request jika SMTP bermasalah
    try {
        await sendOTPEmail(email, user.nama, otp);
        console.log(`✅ OTP email sent to ${email}`);
    } catch (emailErr) {
        console.error(`❌ Gagal kirim OTP email ke ${email}:`, (emailErr as Error).message);
        // OTP sudah tersimpan di Redis, user tetap bisa cek email (jika terkirim sebagian)
        // Jangan throw — biarkan response tetap terkirim
    }

    await createAuditLog({
        userId: user.id, aksi: 'login_otp_dikirim', ipAddress, hasil: 'sukses',
    });

    return { message: 'Kode OTP telah dikirim ke email kamu. Berlaku 5 menit.' };
};

export const verifyOtpService = async (
    email: string, otp: string, ipAddress?: string
) => {
    const stored = await redis.get(`otp:${email}`);
    if (!stored) throw new Error('OTP expired. Silakan login ulang.');

    const [storedHash, attemptsStr] = stored.split(':');
    const attempts = parseInt(attemptsStr, 10);

    if (attempts >= OTP_MAX_ATTEMPTS) {
        await redis.del(`otp:${email}`);
        throw new Error('Percobaan OTP habis. Silakan login ulang dari awal.');
    }

    if (hashOTP(otp) !== storedHash) {
        const remaining = OTP_MAX_ATTEMPTS - attempts - 1;
        const ttl = await redis.ttl(`otp:${email}`);
        if (ttl > 0) await redis.setex(`otp:${email}`, ttl, `${storedHash}:${attempts + 1}`);
        throw new Error(
            remaining > 0 ? `OTP salah. Sisa percobaan: ${remaining}` : 'OTP salah. Percobaan habis.'
        );
    }

    await redis.del(`otp:${email}`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            accounts: {
                where: { status: 'aktif' },
                select: { id: true, nomor_rekening: true, saldo: true },
            },
        },
    });
    if (!user) throw new Error('User tidak ditemukan');

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };

    await createAuditLog({
        userId: user.id, aksi: 'login_sukses', ipAddress, hasil: 'sukses',
    });

    return {
        accessToken: generateAccessToken(tokenPayload),
        refreshToken: generateRefreshToken(tokenPayload),
        user: {
            id: user.id, nama: user.nama,
            email: user.email, role: user.role,
            accounts: user.accounts,
        },
    };
};