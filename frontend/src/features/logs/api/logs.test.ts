import { describe, it, expect, vi } from 'vitest';
import { saveLog, saveScannedLog, subscribeToDailyLogs, subscribeToStreak, subscribeToWeeklyLogs } from './logs';

vi.mock('../../../config/firebase', () => ({
  db: {}
}));

const mockDocData = {
  category: 'transport',
  option: 'Car',
  amount: 10,
  carbonImpact: 2.4,
  timestamp: { toDate: () => new Date() }
};

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn((_q, callback) => {
    callback({ docs: [{ id: '1', data: () => mockDocData }] });
    return () => {};
  }),
  addDoc: vi.fn().mockResolvedValue({ id: 'mock-id' }),
  Timestamp: { now: vi.fn(), fromDate: vi.fn() },
}));

describe('Logs API — saveLog', () => {
  it('returns null if category is empty', async () => {
    expect(await saveLog('user-1', '' as any, 'Car', 10)).toBeNull();
  });

  it('transport / Car: 10km → 2.4 kg CO2', async () => {
    const result = await saveLog('user-1', 'transport', 'Car', 10);
    expect(result).toEqual(expect.objectContaining({ carbonImpact: 2.4 }));
  });

  it('transport / Bus: 10km → 0.8 kg CO2', async () => {
    const result = await saveLog('user-1', 'transport', 'Bus', 10);
    expect(result).toEqual(expect.objectContaining({ carbonImpact: 0.8 }));
  });

  it('transport / Metro: 10km → 0.4 kg CO2', async () => {
    const result = await saveLog('user-1', 'transport', 'Metro', 10);
    expect(result).toEqual(expect.objectContaining({ carbonImpact: 0.4 }));
  });

  it('transport / Walk/Bike: any distance → 0 kg CO2', async () => {
    const result = await saveLog('user-1', 'transport', 'Walk/Bike', 10);
    expect(result).toEqual(expect.objectContaining({ carbonImpact: 0 }));
  });

  it('food / Beef/Lamb: 1 meal → 5 kg CO2', async () => {
    const result = await saveLog('user-1', 'food', 'Beef/Lamb', 1);
    expect(result).toEqual(expect.objectContaining({ carbonImpact: 5 }));
  });

  it('food / Chicken/Pork: 2 meals → 3 kg CO2', async () => {
    const result = await saveLog('user-1', 'food', 'Chicken/Pork', 2);
    expect(result).toEqual(expect.objectContaining({ carbonImpact: 3 }));
  });

  it('food / Vegetarian: 1 meal → 0.8 kg CO2', async () => {
    const result = await saveLog('user-1', 'food', 'Vegetarian', 1);
    expect(result).toEqual(expect.objectContaining({ carbonImpact: 0.8 }));
  });

  it('food / Vegan: 1 meal → 0.4 kg CO2', async () => {
    const result = await saveLog('user-1', 'food', 'Vegan', 1);
    expect(result).toEqual(expect.objectContaining({ carbonImpact: 0.4 }));
  });

  it('energy / AC (Hours): 1 hour → 0.9 kg CO2', async () => {
    const result = await saveLog('user-1', 'energy', 'AC (Hours)', 1);
    expect(result).toEqual(expect.objectContaining({ carbonImpact: 0.9 }));
  });

  it('energy / Heater (Hours): 1 hour → 1.2 kg CO2', async () => {
    const result = await saveLog('user-1', 'energy', 'Heater (Hours)', 1);
    expect(result).toEqual(expect.objectContaining({ carbonImpact: 1.2 }));
  });

  it('energy / General Usage: 1 unit → 0.5 kg CO2', async () => {
    const result = await saveLog('user-1', 'energy', 'General Usage', 1);
    expect(result).toEqual(expect.objectContaining({ carbonImpact: 0.5 }));
  });

  it('shopping / Electronics: 1 item → 15 kg CO2', async () => {
    const result = await saveLog('user-1', 'shopping', 'Electronics', 1);
    expect(result).toEqual(expect.objectContaining({ carbonImpact: 15 }));
  });

  it('shopping / Clothing: 1 item → 5 kg CO2', async () => {
    const result = await saveLog('user-1', 'shopping', 'Clothing', 1);
    expect(result).toEqual(expect.objectContaining({ carbonImpact: 5 }));
  });

  it('shopping / Home Goods: 1 item → 3 kg CO2', async () => {
    const result = await saveLog('user-1', 'shopping', 'Home Goods', 1);
    expect(result).toEqual(expect.objectContaining({ carbonImpact: 3 }));
  });

  it('shopping / Other: 1 item → 2 kg CO2', async () => {
    const result = await saveLog('user-1', 'shopping', 'Other', 1);
    expect(result).toEqual(expect.objectContaining({ carbonImpact: 2 }));
  });
});

describe('Logs API — saveScannedLog', () => {
  it('saves log with provided carbonImpact', async () => {
    const result = await saveScannedLog('user-1', 'shopping', 'Electronics', 1, 15);
    expect(result?.carbonImpact).toBe(15);
  });

  it('returns null if category is empty', async () => {
    expect(await saveScannedLog('user-1', '' as any, 'Electronics', 1, 15)).toBeNull();
  });

  it('saves energy scan result', async () => {
    const result = await saveScannedLog('user-1', 'energy', 'Electricity bill 320 kWh', 320, 128);
    expect(result?.carbonImpact).toBe(128);
  });
});

describe('Logs API — real-time listeners', () => {
  it('subscribeToDailyLogs calls back with logs array', () => {
    subscribeToDailyLogs('user-1', (logs) => {
      expect(logs.length).toBe(1);
      expect(logs[0].carbonImpact).toBe(2.4);
    });
  });

  it('subscribeToStreak returns non-negative streak', () => {
    subscribeToStreak('user-1', (streak) => {
      expect(streak).toBeGreaterThanOrEqual(0);
    });
  });

  it('subscribeToWeeklyLogs calls back with logs array', () => {
    subscribeToWeeklyLogs('user-1', (logs) => {
      expect(logs.length).toBe(1);
    });
  });
});
