import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Workouts & Authorization Security Test Suite', () => {
  let userACookie = '';
  let userBCookie = '';
  let userAWorkoutId = '';

  const userA = {
    name: 'User Alpha',
    email: `usera_${Date.now()}@example.com`,
    password: 'Password123!',
  };

  const userB = {
    name: 'User Beta',
    email: `userb_${Date.now()}@example.com`,
    password: 'Password123!',
  };

  beforeAll(async () => {
    // Register User A
    const resA = await request(app).post('/api/v1/auth/register').send(userA);
    expect(resA.status).toBe(201);
    userACookie = resA.headers['set-cookie'][0].split(';')[0];

    // Register User B
    const resB = await request(app).post('/api/v1/auth/register').send(userB);
    expect(resB.status).toBe(201);
    userBCookie = resB.headers['set-cookie'][0].split(';')[0];
  });

  describe('Active Workout Lifecycle (User A)', () => {
    it('should start an active workout session', async () => {
      const res = await request(app)
        .post('/api/v1/workouts/start')
        .set('Cookie', [userACookie])
        .send({ title: 'User A Push Day' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('IN_PROGRESS');
      expect(res.body.data.title).toBe('User A Push Day');
      userAWorkoutId = res.body.data.id;
    });

    it('should retrieve current active workout for User A', async () => {
      const res = await request(app)
        .get('/api/v1/workouts/active')
        .set('Cookie', [userACookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).not.toBeNull();
      expect(res.body.data.id).toBe(userAWorkoutId);
    });

    it('should complete active workout with exercises, sets, and notes', async () => {
      const res = await request(app)
        .put(`/api/v1/workouts/${userAWorkoutId}/end`)
        .set('Cookie', [userACookie])
        .send({
          title: 'User A Push Day Completed',
          notes: 'Great workout session',
          exercises: [
            {
              name: 'Bench Press',
              sets: [
                { setNumber: 1, weight: 80, reps: 10, isCompleted: true, notes: 'Warmup' },
                { setNumber: 2, weight: 100, reps: 8, isCompleted: true, notes: 'Working set' },
              ],
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.data.exercises).toHaveLength(1);
      expect(res.body.data.exercises[0].sets).toHaveLength(2);
    });

    it('should fetch workout details for User A', async () => {
      const res = await request(app)
        .get(`/api/v1/workouts/${userAWorkoutId}`)
        .set('Cookie', [userACookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(userAWorkoutId);
      expect(res.body.data.exercises[0].name).toBe('Bench Press');
    });

    it('should list workouts history for User A', async () => {
      const res = await request(app)
        .get('/api/v1/workouts')
        .set('Cookie', [userACookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.some((w) => w.id === userAWorkoutId)).toBe(true);
    });
  });

  describe('Validation & Edge Cases', () => {
    it('should reject workout creation with missing title', async () => {
      const res = await request(app)
        .post('/api/v1/workouts')
        .set('Cookie', [userACookie])
        .send({ notes: 'No title' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent workout ID', async () => {
      const res = await request(app)
        .get('/api/v1/workouts/00000000-0000-0000-0000-000000000000')
        .set('Cookie', [userACookie]);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Authorization Ownership Guards (User B accessing User A resources)', () => {
    it('should block User B from reading User A workout details', async () => {
      const res = await request(app)
        .get(`/api/v1/workouts/${userAWorkoutId}`)
        .set('Cookie', [userBCookie]);

      expect([403, 404]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('should block User B from updating User A workout', async () => {
      const res = await request(app)
        .put(`/api/v1/workouts/${userAWorkoutId}`)
        .set('Cookie', [userBCookie])
        .send({ title: 'Hacked Workout Title' });

      expect([403, 404]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('should block User B from ending User A workout', async () => {
      const res = await request(app)
        .put(`/api/v1/workouts/${userAWorkoutId}/end`)
        .set('Cookie', [userBCookie])
        .send({ title: 'Hacked End Workout' });

      expect([403, 404]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('should block User B from deleting User A workout', async () => {
      const res = await request(app)
        .delete(`/api/v1/workouts/${userAWorkoutId}`)
        .set('Cookie', [userBCookie]);

      expect([403, 404]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('should allow User A to delete their own workout', async () => {
      const res = await request(app)
        .delete(`/api/v1/workouts/${userAWorkoutId}`)
        .set('Cookie', [userACookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
