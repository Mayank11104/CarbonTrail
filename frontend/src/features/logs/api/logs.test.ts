import { describe, it, expect, vi } from 'vitest';
import { saveLog } from './logs';

// Mock Firebase
vi.mock('../../../config/firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn().mockResolvedValue({ id: 'mock-id' }),
  Timestamp: { now: vi.fn() },
}));

describe('Logs API - saveLog', () => {
  it('returns null if category is empty', async () => {
    const result = await saveLog('user-1', '' as any, 'Car', 10);
    expect(result).toBeNull();
  });

  it('calculates carbon and saves doc', async () => {
    const result = await saveLog('user-1', 'transport', 'Car', 10);
    expect(result).toEqual(expect.objectContaining({
      id: 'mock-id',
      category: 'transport',
      option: 'Car',
      amount: 10,
      carbonImpact: 2.4 // 10 * 0.24
    }));
  });
});
