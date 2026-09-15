import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Phase 3 — Database & Prisma Enums Hardening Test Suite', () => {
  const testUser = {
    name: 'Enum Test User',
    email: `enumtest_${Date.now()}@example.com`,
    password: 'Password123!',
  };

  let authCookie = '';

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);
    
    expect(res.status).toBe(201);
    const cookies = res.headers['set-cookie'];
    authCookie = cookies[0];
  });

  describe('User Profile Enum Validation', () => {
    it('should accept valid Enum values for experience, units, and theme', async () => {
      const res = await request(app)
        .put('/api/v1/auth/profile')
        .set('Cookie', [authCookie])
        .send({
          experience: 'ADVANCED',
          units: 'LBS',
          theme: 'LIGHT',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.experience).toBe('ADVANCED');
      expect(res.body.data.units).toBe('LBS');
      expect(res.body.data.theme).toBe('LIGHT');
    });

    it('should reject invalid experience enum value', async () => {
      const res = await request(app)
        .put('/api/v1/auth/profile')
        .set('Cookie', [authCookie])
        .send({
          experience: 'EXPERT', // invalid
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid units enum value', async () => {
      const res = await request(app)
        .put('/api/v1/auth/profile')
        .set('Cookie', [authCookie])
        .send({
          units: 'STONES', // invalid
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Exercise Library Enum Validation & Filtering', () => {
    let createdExerciseId = '';

    it('should create exercise with valid Category and Equipment enums', async () => {
      const res = await request(app)
        .post('/api/v1/exercises')
        .set('Cookie', [authCookie])
        .send({
          name: 'Incline Bench Press',
          category: 'CHEST',
          equipment: 'BARBELL',
          notes: 'Upper chest focus',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category).toBe('CHEST');
      expect(res.body.data.equipment).toBe('BARBELL');
      createdExerciseId = res.body.data.id;
    });

    it('should reject exercise creation with lowercase or invalid category', async () => {
      const res = await request(app)
        .post('/api/v1/exercises')
        .set('Cookie', [authCookie])
        .send({
          name: 'Invalid Exercise',
          category: 'Chest', // lowercase/titlecase is rejected by strict Zod enum
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should filter exercises by uppercase category enum in GET /exercises', async () => {
      const res = await request(app)
        .get('/api/v1/exercises?category=CHEST')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      const items = res.body.data.items;
      expect(items.some((e) => e.name === 'Incline Bench Press')).toBe(true);
    });

    it('should allow filtering with lowercase category via query parameter auto-conversion', async () => {
      const res = await request(app)
        .get('/api/v1/exercises?category=chest')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.some((e) => e.name === 'Incline Bench Press')).toBe(true);
    });
  });
});
