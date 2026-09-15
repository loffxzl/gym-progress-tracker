import { Router } from 'express';
import { register, login, logout, getMe, updateProfile } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validations/auth.validation.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { loginRateLimiter, registerRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

const isTest = process.env.NODE_ENV === 'test';

router.post('/register', ...(isTest ? [] : [registerRateLimiter]), validate(registerSchema), register);
router.post('/login', ...(isTest ? [] : [loginRateLimiter]), validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);

export default router;
