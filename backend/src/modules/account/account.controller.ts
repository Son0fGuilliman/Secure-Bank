import { Request, Response } from 'express';
import {
    getMyAccountService, getAllUsersService, updateUserStatusService,
} from './account.service';
import { createAuditLog } from '../../utils/auditLogger';

export const getMyAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await getMyAccountService(req.user!.userId);
        res.json({ success: true, data });
    } catch (err) {
        res.status(404).json({ success: false, message: (err as Error).message });
    }
};

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
    try {
        const data = await getAllUsersService();
        res.json({ success: true, data });
    } catch {
        res.status(500).json({ success: false, message: 'Gagal mengambil data' });
    }
};

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { status } = req.body;
    if (!['aktif', 'suspend'].includes(status)) {
        res.status(400).json({ success: false, message: 'Status tidak valid' });
        return;
    }
    try {
        const updated = await updateUserStatusService(userId, status);
        await createAuditLog({
            userId: req.user!.userId,
            aksi: `admin_${status}_user:${userId}`,
            ipAddress: req.ip,
            hasil: 'sukses',
        });
        res.json({
            success: true,
            message: `User ${updated.nama} berhasil di${status === 'suspend' ? 'suspend' : 'aktifkan'}`,
            data: updated,
        });
    } catch (err) {
        res.status(400).json({ success: false, message: (err as Error).message });
    }
};