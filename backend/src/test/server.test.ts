import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('Server Core', () => {
  // ──────────────────────────────────────────────
  // Health Check Endpoint
  // ──────────────────────────────────────────────
  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: 'ok',
        message: 'CarbonTrail API is running',
      });
    });

    it('should return JSON content type', async () => {
      const res = await request(app).get('/health');

      expect(res.headers['content-type']).toMatch(/application\/json/);
    });
  });

  // ──────────────────────────────────────────────
  // Security Headers (Helmet)
  // ──────────────────────────────────────────────
  describe('Security Headers', () => {
    it('should include X-Content-Type-Options header', async () => {
      const res = await request(app).get('/health');

      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should include X-Frame-Options header', async () => {
      const res = await request(app).get('/health');

      expect(res.headers['x-frame-options']).toBeDefined();
    });
  });

  // ──────────────────────────────────────────────
  // CORS
  // ──────────────────────────────────────────────
  describe('CORS', () => {
    it('should allow cross-origin requests', async () => {
      const res = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:5173');

      // CORS headers should be present
      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  // ──────────────────────────────────────────────
  // 404 Handling
  // ──────────────────────────────────────────────
  describe('Unknown Routes', () => {
    it('should return 404 for an unknown API route', async () => {
      const res = await request(app).get('/api/nonexistent');

      expect(res.status).toBe(404);
    });
  });
});
