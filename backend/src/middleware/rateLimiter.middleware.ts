import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { success: false, message: 'Terlalu banyak percobaan login. Tunggu 1 menit.' },
});

export const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 3,
    message: { success: false, message: 'Terlalu banyak percobaan OTP. Tunggu 5 menit.' },
});

export const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { success: false, message: 'Terlalu banyak request.' },
});