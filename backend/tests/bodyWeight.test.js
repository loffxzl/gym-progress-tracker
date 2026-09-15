import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Body Weight & Authorization Security Test Suite', () => {
  let userACookie = '';
  let userBCookie = '';
  let entryId = '';

  const userA = {
    name: 'Weight User A',
    email: `bwuser_a_${Date.now()}@example.com`,
    password: 'Password123!',
  };

  const userB = {
    name: 'Weight User B',
    email: `bwuser_b_${Date.now()}@example.com`,
    password: 'Password123!',
  };

  beforeAll(async () => {
    const resA = await request(app).post('/api/v1/auth/register').send(userA);
    userACookie = resA.headers['set-cookie'][0].split(';')[0];

    const resB = await request(app).post('/api/v1/auth/register').send(userB);
    userBCookie = resB.headers['set-cookie'][0].split(';')[0];
  });

  describe('Body Weight CRUD & Aggregations', () => {
    it('should create body weight entry for User A', async () => {
      const res = await request(app)
        .post('/api/v1/body-weight')
        .set('Cookie', [userACookie])
        .send({
          weight: 75.5,
          notes: 'Morning weigh-in',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.weight).toBe(75.5);
      entryId = res.body.data.id;
    });

    it('should reject invalid weight values (e.g. negative or excessive)', async () => {
      const res = await request(app)
        .post('/api/v1/body-weight')
        .set('Cookie', [userACookie])
        .send({
          weight: -10, // invalid negative weight
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fetch body weight history & rolling statistics', async () => {
      const res = await request(app)
        .get('/api/v1/body-weight')
        .set('Cookie', [userACookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.currentWeight).toBe(75.5);
      expect(Array.isArray(res.body.data.history)).toBe(true);
    });

    it('should set goal weight target for User A', async () => {
      const res = await request(app)
        .put('/api/v1/body-weight/goal')
        .set('Cookie', [userACookie])
        .send({
          goalWeight: 72.0,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.goalWeight).toBe(72.0);
    });

    it('should reject invalid goal weight (e.g. 0 or string)', async () => {
      const res = await request(app)
        .put('/api/v1/body-weight/goal')
        .set('Cookie', [userACookie])
        .send({
          goalWeight: 'invalid-weight',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Authorization Guards for Body Weight', () => {
    it('should block User B from deleting User A body weight entry', async () => {
      const res = await request(app)
        .delete(`/api/v1/body-weight/${entryId}`)
        .set('Cookie', [userBCookie]);

      expect([403, 404]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('should allow User A to delete their own body weight entry', async () => {
      const res = await request(app)
        .delete(`/api/v1/body-weight/${entryId}`)
        .set('Cookie', [userACookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
