import { Router } from 'express';
import { register, login, verifyOtp } from './auth.controller';
import { loginLimiter, otpLimiter } from '../../middleware/rateLimiter.middleware';

const router = Router();
router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/verify-otp', otpLimiter, verifyOtp);
export default router;