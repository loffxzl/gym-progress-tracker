import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Analytics & Personal Records Engine Test Suite', () => {
  let userACookie = '';

  const userA = {
    name: 'Analytics User',
    email: `analytics_${Date.now()}@example.com`,
    password: 'Password123!',
  };

  beforeAll(async () => {
    const res = await request(app).post('/api/v1/auth/register').send(userA);
    userACookie = res.headers['set-cookie'][0].split(';')[0];
  });

  it('should return empty analytics structure for user with no workouts', async () => {
    const res = await request(app)
      .get('/api/v1/workouts/analytics')
      .set('Cookie', [userACookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalWorkouts).toBe(0);
    expect(res.body.data.totalVolume).toBe(0);
    expect(res.body.data.highestWeightSet).toBeNull();
  });

  it('should compute analytics and PRs after logging a workout with sets', async () => {
    // 1. Create a workout session
    const startRes = await request(app)
      .post('/api/v1/workouts/start')
      .set('Cookie', [userACookie])
      .send({ title: 'Leg Day Session' });

    const workoutId = startRes.body.data.id;

    // 2. Complete workout session
    await request(app)
      .put(`/api/v1/workouts/${workoutId}/end`)
      .set('Cookie', [userACookie])
      .send({
        title: 'Leg Day Session Completed',
        exercises: [
          {
            name: 'Squat',
            sets: [
              { setNumber: 1, weight: 140, reps: 5, isCompleted: true },
              { setNumber: 2, weight: 150, reps: 3, isCompleted: true },
            ],
          },
        ],
      });

    // 3. Fetch analytics
    const res = await request(app)
      .get('/api/v1/workouts/analytics')
      .set('Cookie', [userACookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalWorkouts).toBe(1);
    expect(res.body.data.totalVolume).toBe(140 * 5 + 150 * 3); // 700 + 450 = 1150
    expect(res.body.data.highestWeightSet.weight).toBe(150);
  });

  it('should fetch chart analytics data endpoints', async () => {
    const res = await request(app)
      .get('/api/v1/workouts/analytics/charts')
      .set('Cookie', [userACookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.workoutVolume)).toBe(true);
    expect(Array.isArray(res.body.data.weeklyVolume)).toBe(true);
    expect(Array.isArray(res.body.data.monthlyVolume)).toBe(true);
  });
});
