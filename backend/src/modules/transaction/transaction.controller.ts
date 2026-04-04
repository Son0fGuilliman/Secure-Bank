import { Request, Response } from 'express';
import { transferSchema } from './transaction.validator';
import { transferService, getHistoryService } from './transaction.service';

export const transfer = async (req: Request, res: Response): Promise<void> => {
    const { error, value } = transferSchema.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(400).json({
            success: false,
            message: error.details.map((d) => d.message).join('; '),
        });
        return;
    }
    try {
        const data = await transferService(req.user!.userId, value, req.ip);
        res.json({ success: true, message: 'Transfer berhasil', data });
    } catch (err) {
        res.status(400).json({ success: false, message: (err as Error).message });
    }
};

export const getHistory = async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    try {
        const data = await getHistoryService(req.user!.userId, page, limit);
        res.json({ success: true, data });
    } catch (err) {
        res.status(400).json({ success: false, message: (err as Error).message });
    }
};
