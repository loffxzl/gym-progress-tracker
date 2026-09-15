import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { ApiError } from './utils/ApiError.js';
import { ApiResponse } from './utils/apiResponse.js';

import authRoutes from './routes/auth.routes.js';
import workoutRoutes from './routes/workout.routes.js';
import exerciseRoutes from './routes/exercise.routes.js';
import bodyWeightRoutes from './routes/bodyWeight.routes.js';
import searchRoutes from './routes/search.routes.js';

import { sanitizeInput } from './middlewares/sanitize.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// HTTP Request logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Response compression (gzip)
app.use(compression());

// Cookie parsing
app.use(cookieParser());

// Cross-Origin Resource Sharing
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// Body parsing
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Global Input Sanitization (XSS Prevention & String Trimming)
app.use(sanitizeInput);

import prisma from './config/db.js';

// Health Check Endpoint
app.get('/health', async (req, res) => {
  let dbStatus = 'connected';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'degraded';
  }

  res.status(200).json(
    new ApiResponse(200, {
      status: 'healthy',
      database: dbStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }, 'Gym Tracker API is healthy and operational')
  );
});

import aiCoachRoutes from './routes/aiCoach.routes.js';

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workouts', workoutRoutes);
app.use('/api/v1/exercises', exerciseRoutes);
app.use('/api/v1/body-weight', bodyWeightRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/ai-coach', aiCoachRoutes);

// Handle Unknown Routes (404)
app.use((req, res, next) => {
  next(ApiError.notFound(`Cannot find ${req.originalUrl} on this server`));
});

// Global Error Handler (must be last middleware)
app.use(errorHandler);

export default app;
