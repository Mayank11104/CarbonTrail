import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../index';

// Mock the AI service module
vi.mock('./ai.service', () => ({
  getCoachInsight: vi.fn(),
  getPersonalizedChallenge: vi.fn(),
  scanReceiptOrBill: vi.fn(),
}));

import { getCoachInsight, getPersonalizedChallenge, scanReceiptOrBill } from './ai.service';

const mockedGetCoachInsight = vi.mocked(getCoachInsight);
const mockedGetPersonalizedChallenge = vi.mocked(getPersonalizedChallenge);
const mockedScanReceiptOrBill = vi.mocked(scanReceiptOrBill);

describe('AI Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  // POST /api/ai/coach
  // ──────────────────────────────────────────────
  describe('POST /api/ai/coach', () => {
    it('should return 401 if no Authorization header is provided', async () => {
      const res = await request(app).post('/api/ai/coach');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Missing or invalid Authorization header');
    });

    it('should return 401 if Authorization header does not start with Bearer', async () => {
      const res = await request(app)
        .post('/api/ai/coach')
        .set('Authorization', 'Basic some-token');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Missing or invalid Authorization header');
    });

    it('should return 200 with coach insight on success', async () => {
      const mockInsight = {
        insight: 'Your transport emissions are high this week at 12.5 kg CO2.',
        tip: 'Try cycling for short commutes under 5km.',
        actions: ['Bike to work Monday', 'Take the metro', 'Carpool with a friend'],
        worstCategory: 'transport',
        weeklyTotal: 18.5,
      };
      mockedGetCoachInsight.mockResolvedValue(mockInsight);

      const res = await request(app)
        .post('/api/ai/coach')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockInsight);
      expect(mockedGetCoachInsight).toHaveBeenCalledWith('valid-token');
    });

    it('should return 500 when the AI service throws a generic error', async () => {
      mockedGetCoachInsight.mockRejectedValue(new Error('Gemini API timeout'));

      const res = await request(app)
        .post('/api/ai/coach')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to generate AI insight');
    });

    it('should return 401 when token is expired', async () => {
      const tokenError: any = new Error('Token expired');
      tokenError.code = 'auth/id-token-expired';
      mockedGetCoachInsight.mockRejectedValue(tokenError);

      const res = await request(app)
        .post('/api/ai/coach')
        .set('Authorization', 'Bearer expired-token');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid or expired token');
    });
  });

  // ──────────────────────────────────────────────
  // POST /api/ai/challenge
  // ──────────────────────────────────────────────
  describe('POST /api/ai/challenge', () => {
    it('should return 401 if no Authorization header is provided', async () => {
      const res = await request(app).post('/api/ai/challenge');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Missing or invalid Authorization header');
    });

    it('should return 200 with a challenge on success', async () => {
      const mockChallenge = {
        title: 'Green Commute Week',
        description: 'Swap car trips for public transit to cut transport emissions by 40%.',
        targetSaving: 6.5,
        category: 'transport',
        tasks: ['Take the bus to work', 'Walk for errands under 1km', 'Carpool once this week'],
      };
      mockedGetPersonalizedChallenge.mockResolvedValue(mockChallenge);

      const res = await request(app)
        .post('/api/ai/challenge')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockChallenge);
      expect(mockedGetPersonalizedChallenge).toHaveBeenCalledWith('valid-token');
    });

    it('should return 500 when the AI service throws a generic error', async () => {
      mockedGetPersonalizedChallenge.mockRejectedValue(new Error('Service unavailable'));

      const res = await request(app)
        .post('/api/ai/challenge')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to generate AI challenge');
    });
  });

  // ──────────────────────────────────────────────
  // POST /api/ai/scan
  // ──────────────────────────────────────────────
  describe('POST /api/ai/scan', () => {
    it('should return 401 if no Authorization header is provided', async () => {
      const res = await request(app).post('/api/ai/scan');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Missing or invalid Authorization header');
    });

    it('should return 400 if base64Image is missing', async () => {
      const res = await request(app)
        .post('/api/ai/scan')
        .set('Authorization', 'Bearer valid-token')
        .send({ mimeType: 'image/png' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing base64Image or mimeType');
    });

    it('should return 400 if mimeType is missing', async () => {
      const res = await request(app)
        .post('/api/ai/scan')
        .set('Authorization', 'Bearer valid-token')
        .send({ base64Image: 'abc123==' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing base64Image or mimeType');
    });

    it('should return 200 with scan result on success', async () => {
      const mockScan = {
        category: 'energy' as const,
        value: 320,
        unit: 'kWh',
        carbonImpact: 128.0,
        details: 'Parsed electricity bill showing 320 kWh used.',
      };
      mockedScanReceiptOrBill.mockResolvedValue(mockScan);

      const res = await request(app)
        .post('/api/ai/scan')
        .set('Authorization', 'Bearer valid-token')
        .send({ base64Image: 'abc123==', mimeType: 'image/png' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockScan);
      expect(mockedScanReceiptOrBill).toHaveBeenCalledWith('valid-token', 'abc123==', 'image/png');
    });

    it('should return 500 when the scan service throws', async () => {
      mockedScanReceiptOrBill.mockRejectedValue(new Error('Vision API error'));

      const res = await request(app)
        .post('/api/ai/scan')
        .set('Authorization', 'Bearer valid-token')
        .send({ base64Image: 'abc123==', mimeType: 'image/png' });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to scan image');
    });
  });
});
