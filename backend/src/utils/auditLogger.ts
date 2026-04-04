import prisma from '../config/database';

interface AuditLogData {
    userId?: string;
    aksi: string;
    ipAddress?: string;
    hasil: 'sukses' | 'gagal';
}

export const createAuditLog = async (data: AuditLogData): Promise<void> => {
    try {
        await prisma.auditLog.create({
            data: {
                user_id: data.userId ?? null,
                aksi: data.aksi.slice(0, 100),
                ip_address: data.ipAddress ?? null,
                hasil: data.hasil,
            },
        });
    } catch (err) {
        console.error('[AuditLog Error]', err);
    }
};