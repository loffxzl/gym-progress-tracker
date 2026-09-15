import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('AI Coach Service & Endpoint Test Suite', () => {
  let userACookie = '';

  const userA = {
    name: 'AI Coach User',
    email: `aicoach_${Date.now()}@example.com`,
    password: 'Password123!',
  };

  beforeAll(async () => {
    const res = await request(app).post('/api/v1/auth/register').send(userA);
    userACookie = res.headers['set-cookie'][0].split(';')[0];
  });

  it('should return structured AI insights for user with no workouts', async () => {
    const res = await request(app)
      .get('/api/v1/ai-coach/insights')
      .set('Cookie', [userACookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalWorkoutsLogged).toBe(0);
    expect(Array.isArray(res.body.data.plateaus)).toBe(true);
    expect(res.body.data.insights).toHaveProperty('summary');
  });

  it('should detect plateau when user logs 3 sessions with unchanged weight', async () => {
    // Log 3 workouts with 100kg bench press
    for (let i = 0; i < 3; i++) {
      const startRes = await request(app)
        .post('/api/v1/workouts/start')
        .set('Cookie', [userACookie])
        .send({ title: `Plateau Test Session ${i + 1}` });

      const wId = startRes.body.data.id;

      await request(app)
        .put(`/api/v1/workouts/${wId}/end`)
        .set('Cookie', [userACookie])
        .send({
          title: `Plateau Test Session ${i + 1}`,
          exercises: [
            {
              name: 'Bench Press',
              sets: [{ setNumber: 1, weight: 100, reps: 5, isCompleted: true }],
            },
          ],
        });
    }

    const res = await request(app)
      .get('/api/v1/ai-coach/insights')
      .set('Cookie', [userACookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalWorkoutsLogged).toBeGreaterThanOrEqual(3);
    expect(res.body.data.plateaus.some((p) => p.exerciseName === 'Bench Press')).toBe(true);
  });
});
