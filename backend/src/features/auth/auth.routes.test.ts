import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../index';

// Firebase Auth mock is already set up in test/setup.ts
// (verifyIdToken resolves for 'valid-mock-token' and rejects otherwise)

describe('Auth Routes', () => {
  // ──────────────────────────────────────────────
  // POST /api/auth/session
  // ──────────────────────────────────────────────
  describe('POST /api/auth/session', () => {
    it('should return 401 if no idToken is provided in the body', async () => {
      const res = await request(app)
        .post('/api/auth/session')
        .send({});

      expect(res.status).toBe(401);
    });

    it('should return 401 if the idToken is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/session')
        .send({ idToken: 'invalid-token' });

      expect(res.status).toBe(401);
    });
  });

  // ──────────────────────────────────────────────
  // POST /api/auth/logout
  // ──────────────────────────────────────────────
  describe('POST /api/auth/logout', () => {
    it('should return 200 and clear the session cookie', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'success' });
    });

    it('should include a Set-Cookie header to clear the session', async () => {
      const res = await request(app).post('/api/auth/logout');

      // The response should have a Set-Cookie header that clears 'session'
      const setCookie = res.headers['set-cookie'];
      expect(setCookie).toBeDefined();
      expect(setCookie.toString()).toContain('session=');
    });
  });
});
