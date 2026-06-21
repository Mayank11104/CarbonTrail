import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock global fetch
const mockFetch = vi.fn()
globalThis.fetch = mockFetch as any

// We need to mock import.meta.env before importing the module
vi.stubEnv('VITE_BACKEND_URL', 'http://localhost:3000')

import { fetchCoachInsight, fetchPersonalizedChallenge, uploadAndScanBill } from './coach'

describe('Coach API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ──────────────────────────────────────────────
  // fetchCoachInsight
  // ──────────────────────────────────────────────
  describe('fetchCoachInsight', () => {
    it('sends POST request with Bearer token to /api/ai/coach', async () => {
      const mockResponse = {
        insight: 'Your transport emissions are high.',
        tip: 'Try cycling.',
        actions: ['Bike to work'],
        worstCategory: 'transport',
        weeklyTotal: 12.5,
      }
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await fetchCoachInsight('test-token')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai/coach'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('throws an error when the response is not ok', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Invalid token' }),
      })

      await expect(fetchCoachInsight('bad-token')).rejects.toThrow('Invalid token')
    })

    it('throws a fallback error if response body is not JSON', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('not json')),
      })

      await expect(fetchCoachInsight('any-token')).rejects.toThrow('Request failed with status 500')
    })
  })

  // ──────────────────────────────────────────────
  // fetchPersonalizedChallenge
  // ──────────────────────────────────────────────
  describe('fetchPersonalizedChallenge', () => {
    it('sends POST request with Bearer token to /api/ai/challenge', async () => {
      const mockChallenge = {
        title: 'Eco Commute',
        description: 'Reduce transport emissions.',
        targetSaving: 5.0,
        category: 'transport',
        tasks: ['Walk to work'],
      }
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockChallenge),
      })

      const result = await fetchPersonalizedChallenge('test-token')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai/challenge'),
        expect.objectContaining({ method: 'POST' })
      )
      expect(result).toEqual(mockChallenge)
    })

    it('throws an error when the response is not ok', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Service down' }),
      })

      await expect(fetchPersonalizedChallenge('any-token')).rejects.toThrow('Service down')
    })
  })

  // ──────────────────────────────────────────────
  // uploadAndScanBill
  // ──────────────────────────────────────────────
  describe('uploadAndScanBill', () => {
    it('sends POST request with image data to /api/ai/scan', async () => {
      const mockScan = {
        category: 'energy',
        value: 320,
        unit: 'kWh',
        carbonImpact: 128.0,
        details: 'Electricity bill detected.',
      }
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockScan),
      })

      const result = await uploadAndScanBill('test-token', 'base64data==', 'image/png')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai/scan'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ base64Image: 'base64data==', mimeType: 'image/png' }),
        })
      )
      expect(result).toEqual(mockScan)
    })

    it('throws an error when the response is not ok', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Missing mimeType' }),
      })

      await expect(uploadAndScanBill('tok', 'img', '')).rejects.toThrow('Missing mimeType')
    })
  })
})
