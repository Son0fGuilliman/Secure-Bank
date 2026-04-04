import { Request, Response } from 'express';
import * as v from './auth.validator';
import * as s from './auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
    const { error, value } = v.registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(400).json({
            success: false,
            message: error.details.map((d) => d.message).join('; '),
        });
        return;
    }
    try {
        const data = await s.registerService(value);
        res.status(201).json({ success: true, message: 'Registrasi berhasil', data });
    } catch (err) {
        res.status(400).json({ success: false, message: (err as Error).message });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { error, value } = v.loginSchema.validate(req.body);
    if (error) {
        res.status(400).json({ success: false, message: error.details[0].message });
        return;
    }
    try {
        const result = await s.loginService(value.email, value.password, req.ip);
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(401).json({ success: false, message: (err as Error).message });
    }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const { error, value } = v.verifyOtpSchema.validate(req.body);
    if (error) {
        res.status(400).json({ success: false, message: error.details[0].message });
        return;
    }
    try {
        const data = await s.verifyOtpService(value.email, value.otp, req.ip);
        res.json({ success: true, message: 'Login berhasil', data });
    } catch (err) {
        res.status(401).json({ success: false, message: (err as Error).message });
    }
};