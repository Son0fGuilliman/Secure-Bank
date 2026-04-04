import { Router } from 'express';
import { transfer, getHistory } from './transaction.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { generalLimiter } from '../../middleware/rateLimiter.middleware';

const router = Router();
router.use(authenticateToken);
router.post('/transfer', generalLimiter, transfer);
router.get('/history', getHistory);
export default router;