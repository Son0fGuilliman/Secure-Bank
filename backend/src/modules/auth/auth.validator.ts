import Joi from 'joi';

export const registerSchema = Joi.object({
    nik: Joi.string().length(16).pattern(/^\d+$/).required()
        .messages({
            'string.length': 'NIK harus 16 digit',
            'string.pattern.base': 'NIK hanya boleh angka',
        }),
    nama: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    nomor_hp: Joi.string().min(10).max(15).pattern(/^\d+$/).optional().allow(''),
    password: Joi.string().min(8).max(100).required()
        .messages({ 'string.min': 'Password minimal 8 karakter' }),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const verifyOtpSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required()
        .messages({ 'string.length': 'OTP harus 6 digit' }),
});