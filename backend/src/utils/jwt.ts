import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const getPrivateKey = () =>
    fs.readFileSync(path.resolve(process.env.JWT_PRIVATE_KEY_PATH || './keys/private.key'));

const getPublicKey = () =>
    fs.readFileSync(path.resolve(process.env.JWT_PUBLIC_KEY_PATH || './keys/public.key'));

export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
    type: 'access' | 'refresh';
    iat?: number;
    exp?: number;
}

export const generateAccessToken = (
    payload: Omit<JwtPayload, 'type' | 'iat' | 'exp'>
): string =>
    jwt.sign({ ...payload, type: 'access' }, getPrivateKey(), {
        algorithm: 'RS256',
        expiresIn: (process.env.JWT_ACCESS_EXPIRES as jwt.SignOptions['expiresIn']) || '15m',
    });

export const generateRefreshToken = (
    payload: Omit<JwtPayload, 'type' | 'iat' | 'exp'>
): string =>
    jwt.sign({ ...payload, type: 'refresh' }, getPrivateKey(), {
        algorithm: 'RS256',
        expiresIn: (process.env.JWT_REFRESH_EXPIRES as jwt.SignOptions['expiresIn']) || '7d',
    });

export const verifyToken = (token: string): JwtPayload =>
    jwt.verify(token, getPublicKey(), { algorithms: ['RS256'] }) as JwtPayload;