import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const token = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null;

    if (!token) {
        res.status(401).json({ success: false, message: 'Token tidak ditemukan. Silakan login.' });
        return;
    }

    try {
        const payload = verifyToken(token);
        if (payload.type !== 'access') {
            res.status(401).json({ success: false, message: 'Token tidak valid' });
            return;
        }
        req.user = payload;
        next();
    } catch {
        res.status(401).json({ success: false, message: 'Token expired. Silakan login ulang.' });
    }
};