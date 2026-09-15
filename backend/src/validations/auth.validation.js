import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long').max(50, 'Name cannot exceed 50 characters'),
    email: z.string().email('Invalid email address format'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .max(100, 'Password cannot exceed 100 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long').max(50, 'Name cannot exceed 50 characters').optional(),
    height: z.number().positive('Height must be a positive number').min(30, 'Height must be at least 30 cm').max(300, 'Height cannot exceed 300 cm').nullable().optional(),
    goalWeight: z.number().positive('Goal weight must be a positive number').min(1, 'Goal weight must be at least 1').max(1000, 'Goal weight cannot exceed 1000').nullable().optional(),
    experience: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], { invalid_type_error: 'Invalid experience level' }).optional(),
    units: z.enum(['KG', 'LBS'], { invalid_type_error: 'Units must be KG or LBS' }).optional(),
    timezone: z.string().max(100, 'Timezone string too long').optional(),
    avatarUrl: z.string().url('Avatar URL must be a valid HTTP/HTTPS URL').nullable().optional().or(z.literal('')),
    theme: z.enum(['DARK', 'LIGHT', 'SYSTEM'], { invalid_type_error: 'Invalid theme selection' }).optional(),
    restTimerSound: z.boolean().optional(),
    autoStartRestTimer: z.boolean().optional(),
  }),
});
