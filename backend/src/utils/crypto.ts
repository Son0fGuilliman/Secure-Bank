import crypto from 'crypto';

export const generateOTP = (): string =>
    Math.floor(100000 + Math.random() * 900000).toString();

export const generateAccountNumber = (): string => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(10 + Math.random() * 90).toString();
    return `1${timestamp}${random}`;
};

export const hashTransactionData = (data: {
    transactionId: string;
    nominal: string;
    dariRekening: string;
    keRekening: string;
    waktu: string;
}): string =>
    '0x' + crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');

export const hashOTP = (otp: string): string =>
    crypto
        .createHmac('sha256', process.env.OTP_SECRET || 'default-secret')
        .update(otp)
        .digest('hex');