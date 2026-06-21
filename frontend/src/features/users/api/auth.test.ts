import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logoutUser } from './auth';

// Mock Firebase auth
vi.mock('../../../config/firebase', () => ({
  auth: {
    currentUser: { uid: 'user-123', email: 'test@test.com' },
    signOut: vi.fn().mockResolvedValue(undefined),
  }
}));

// Mock API calls
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock Firebase auth functions
vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: class {},
  createUserWithEmailAndPassword: vi.fn().mockResolvedValue({
    user: { getIdToken: vi.fn().mockResolvedValue('token') }
  }),
  signInWithEmailAndPassword: vi.fn().mockResolvedValue({
    user: { getIdToken: vi.fn().mockResolvedValue('token') }
  }),
  updateProfile: vi.fn().mockResolvedValue(undefined),
}));

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logoutUser signs out and clears session', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    
    await logoutUser();
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/logout'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});
