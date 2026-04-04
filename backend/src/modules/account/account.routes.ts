import { Router } from 'express';
import { getMyAccount, getAllUsers, updateUserStatus } from './account.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();
router.get('/me', authenticateToken, getMyAccount);
router.get('/admin/users', authenticateToken, requireRole('admin'), getAllUsers);
router.patch('/admin/users/:userId/status', authenticateToken, requireRole('admin'), updateUserStatus);
export default router;