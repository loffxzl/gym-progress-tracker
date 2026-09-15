import { z } from 'zod';

const CATEGORIES = ['CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'CARDIO', 'FULL_BODY'];
const EQUIPMENT_TYPES = ['BARBELL', 'DUMBBELL', 'CABLE', 'MACHINE', 'BODYWEIGHT', 'BAND', 'OTHER'];

export const createExerciseSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Exercise name must be at least 2 characters long').max(100),
    category: z.enum(CATEGORIES, { invalid_type_error: 'Invalid exercise category' }),
    equipment: z.enum(EQUIPMENT_TYPES, { invalid_type_error: 'Invalid equipment type' }).nullable().optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const updateExerciseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid exercise ID format'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    category: z.enum(CATEGORIES, { invalid_type_error: 'Invalid exercise category' }).optional(),
    equipment: z.enum(EQUIPMENT_TYPES, { invalid_type_error: 'Invalid equipment type' }).nullable().optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const getExerciseByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid exercise ID format'),
  }),
});

export const getExercisesQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    page: z.string().optional().default('1').transform((val) => Math.max(1, parseInt(val, 10) || 1)),
    limit: z.string().optional().default('10').transform((val) => Math.min(50, Math.max(1, parseInt(val, 10) || 10))),
  }),
});
