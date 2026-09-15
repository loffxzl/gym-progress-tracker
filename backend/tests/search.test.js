import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Global Search Engine Test Suite', () => {
  let userACookie = '';

  const userA = {
    name: 'Search User',
    email: `search_${Date.now()}@example.com`,
    password: 'Password123!',
  };

  beforeAll(async () => {
    const res = await request(app).post('/api/v1/auth/register').send(userA);
    userACookie = res.headers['set-cookie'][0].split(';')[0];
  });

  it('should return empty result arrays for empty query string', async () => {
    const res = await request(app)
      .get('/api/v1/search?q=')
      .set('Cookie', [userACookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.exercises).toEqual([]);
    expect(res.body.data.workouts).toEqual([]);
  });

  it('should find exercises by case-insensitive name query', async () => {
    const res = await request(app)
      .get('/api/v1/search?q=bench')
      .set('Cookie', [userACookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.exercises)).toBe(true);
  });

  it('should support search by category enum keyword', async () => {
    const res = await request(app)
      .get('/api/v1/search?q=chest')
      .set('Cookie', [userACookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.exercises)).toBe(true);
  });
});
