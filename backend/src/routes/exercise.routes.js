import { Router } from 'express';
import {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  softDeleteExercise,
} from '../controllers/exercise.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import {
  createExerciseSchema,
  updateExerciseSchema,
  getExerciseByIdSchema,
  getExercisesQuerySchema,
} from '../validations/exercise.validation.js';

const router = Router();

// Protect all exercise catalog endpoints
router.use(authenticate);

router
  .route('/')
  .get(validate(getExercisesQuerySchema), getExercises)
  .post(validate(createExerciseSchema), createExercise);

router
  .route('/:id')
  .get(validate(getExerciseByIdSchema), getExerciseById)
  .put(validate(updateExerciseSchema), updateExercise)
  .delete(validate(getExerciseByIdSchema), softDeleteExercise);

export default router;
