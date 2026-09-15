import { Router } from 'express';
import {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  startWorkout,
  endWorkout,
  getActiveWorkout,
  getAnalytics,
  getChartAnalytics,
} from '../controllers/workout.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import {
  createWorkoutSchema,
  updateWorkoutSchema,
  getWorkoutByIdSchema,
  startWorkoutSchema,
  endWorkoutSchema,
  getWorkoutsQuerySchema,
} from '../validations/workout.validation.js';

const router = Router();

// Protect all workout endpoints
router.use(authenticate);

router.get('/active', getActiveWorkout);
router.get('/analytics', getAnalytics);
router.get('/analytics/charts', getChartAnalytics);
router.post('/start', validate(startWorkoutSchema), startWorkout);
router.put('/:id/end', validate(endWorkoutSchema), endWorkout);

router
  .route('/')
  .get(validate(getWorkoutsQuerySchema), getWorkouts)
  .post(validate(createWorkoutSchema), createWorkout);

router
  .route('/:id')
  .get(validate(getWorkoutByIdSchema), getWorkoutById)
  .put(validate(updateWorkoutSchema), updateWorkout)
  .delete(validate(getWorkoutByIdSchema), deleteWorkout);

export default router;
