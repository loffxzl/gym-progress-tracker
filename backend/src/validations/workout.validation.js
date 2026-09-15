import { z } from 'zod';

const exerciseSetSchema = z.object({
  setNumber: z.number().int('Set number must be an integer').positive('Set number must be positive'),
  weight: z.number().nonnegative('Weight cannot be negative').max(1000, 'Weight value cannot exceed 1000'),
  reps: z.number().int('Reps must be a whole number').nonnegative('Reps cannot be negative').max(1000, 'Reps value cannot exceed 1000'),
  notes: z.string().max(200, 'Set notes cannot exceed 200 characters').optional(),
  isCompleted: z.boolean().optional().default(false),
});

const exerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required').max(100, 'Exercise name cannot exceed 100 characters'),
  order: z.number().int().nonnegative().optional().default(0),
  sets: z.array(exerciseSetSchema).optional().default([]),
});

export const startWorkoutSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Workout title is required').max(100).optional().default('Workout Session'),
    notes: z.string().max(500).optional(),
  }),
});

export const endWorkoutSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid workout ID format'),
  }),
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    notes: z.string().max(500).optional(),
    date: z.string().optional(),
    exercises: z.array(exerciseSchema).optional().default([]),
  }),
});

export const createWorkoutSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Workout title is required').max(100),
    notes: z.string().max(500).optional(),
    date: z.string().optional(),
    exercises: z.array(exerciseSchema).optional().default([]),
  }),
});

export const updateWorkoutSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid workout ID format'),
  }),
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    notes: z.string().max(500).optional(),
    date: z.string().optional(),
  }),
});

export const getWorkoutByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid workout ID format'),
  }),
});

export const getWorkoutsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
    limit: z.string().optional().transform((val) => (val ? Math.min(50, Math.max(1, parseInt(val, 10))) : 10)),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

