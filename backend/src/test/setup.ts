import { vi } from 'vitest';

// Mock firebase-admin
vi.mock('firebase-admin/app', () => ({
  initializeApp: vi.fn(),
  cert: vi.fn(),
}));

vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn(() => ({
    verifyIdToken: vi.fn(async (token: string) => {
      if (token === 'valid-mock-token') {
        return {
          uid: 'mock-user-123',
          email: 'test@example.com',
          name: 'Test User'
        };
      }
      throw new Error('auth/invalid-argument');
    }),
  })),
}));

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({
    collection: vi.fn(),
  })),
}));
