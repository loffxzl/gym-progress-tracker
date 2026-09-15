import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';

describe('Authentication & Security Test Suite', () => {
  const testUser = {
    name: 'Auth Test User',
    email: `authtest_${Date.now()}@example.com`,
    password: 'Password123!',
  };

  let authCookie = '';

  describe('Registration Tests', () => {
    it('should register a new user successfully and set HTTP-Only cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user).not.toHaveProperty('password');
      expect(res.body.data).not.toHaveProperty('token'); // Token omitted from JSON payload

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('token=');
      expect(cookies[0]).toContain('HttpOnly');
    });

    it('should fail registration when email already exists', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('should fail registration with invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'User', email: 'invalid-email', password: 'Password123!' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].field).toBe('email');
    });

    it('should fail registration with weak/short password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'User', email: 'weakpass@example.com', password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].field).toBe('password');
    });

    it('should fail registration when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'missingfields@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Login Tests', () => {
    it('should login successfully with valid credentials and return HTTP-Only cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data).not.toHaveProperty('token');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('token=');
      authCookie = cookies[0].split(';')[0];
    });

    it('should fail login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should fail login with unknown email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent_user_999@example.com', password: 'Password123!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should fail login when missing email or password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('/api/v1/auth/me Session Hydration Tests', () => {
    it('should fetch active user profile when cookie is present', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testUser.email);
    });

    it('should return 401 Unauthorized when unauthenticated (no cookie or header)', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('missing');
    });

    it('should return 401 Unauthorized when token signature is invalid', async () => {
      const invalidToken = jwt.sign({ id: 'fake-id' }, 'wrong-secret-key');
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', [`token=${invalidToken}`]);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid authentication token signature');
    });

    it('should return 401 Unauthorized when token is expired', async () => {
      const expiredToken = jwt.sign({ id: 'fake-id' }, env.JWT_SECRET, { expiresIn: '0s' });
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', [`token=${expiredToken}`]);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('expired');
    });
  });

  describe('Logout Tests', () => {
    it('should clear authentication cookie on logout', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=;/); // Cookie cleared
    });

    it('should fail subsequent authenticated request after logout', async () => {
      // Cleared cookie passed
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', ['token=;']);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
