import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { getAiCoachInsights } from '../controllers/aiCoach.controller.js';

const router = Router();

router.use(authenticate);

router.get('/insights', getAiCoachInsights);

export default router;
