import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginWithEmail, registerWithEmail, loginWithGoogle, logoutUser } from './auth';

vi.mock('../../../config/firebase', () => ({
  auth: {
    currentUser: { uid: 'user-123', email: 'test@test.com' },
    signOut: vi.fn().mockResolvedValue(undefined),
  }
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: class {},
  signInWithPopup: vi.fn().mockResolvedValue({
    user: { getIdToken: vi.fn().mockResolvedValue('token') }
  }),
  createUserWithEmailAndPassword: vi.fn().mockResolvedValue({
    user: { getIdToken: vi.fn().mockResolvedValue('token'), uid: 'uid' }
  }),
  signInWithEmailAndPassword: vi.fn().mockResolvedValue({
    user: { getIdToken: vi.fn().mockResolvedValue('token'), uid: 'uid' }
  }),
  updateProfile: vi.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  signOut: vi.fn().mockResolvedValue(undefined)
}));

describe('Auth API — success paths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logoutUser clears session and signs out', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    await logoutUser();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/logout'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('loginWithEmail returns user on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const res = await loginWithEmail('test@test.com', 'password123');
    expect(res.error).toBeNull();
    expect(res.user).toBeDefined();
  });

  it('registerWithEmail returns user on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const res = await registerWithEmail('Name', 'test@test.com', 'password123');
    expect(res.error).toBeNull();
    expect(res.user).toBeDefined();
  });

  it('loginWithGoogle returns user on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    const res = await loginWithGoogle();
    expect(res.error).toBeNull();
    expect(res.user).toBeDefined();
  });
});

describe('Auth API — error paths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loginWithEmail returns error message on Firebase failure', async () => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(
      new Error('Firebase: Error (auth/wrong-password).')
    );
    const res = await loginWithEmail('test@test.com', 'wrong');
    expect(res.user).toBeNull();
    expect(res.error).toBe('Firebase: Error (auth/wrong-password).');
  });

  it('registerWithEmail returns error message on duplicate email', async () => {
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValueOnce(
      new Error('Firebase: Error (auth/email-already-in-use).')
    );
    const res = await registerWithEmail('Name', 'existing@test.com', 'pass123');
    expect(res.user).toBeNull();
    expect(res.error).toBe('Firebase: Error (auth/email-already-in-use).');
  });

  it('loginWithGoogle returns error if popup is closed', async () => {
    const { signInWithPopup } = await import('firebase/auth');
    vi.mocked(signInWithPopup).mockRejectedValueOnce(
      new Error('Firebase: Error (auth/popup-closed-by-user).')
    );
    const res = await loginWithGoogle();
    expect(res.user).toBeNull();
    expect(res.error).toBe('Firebase: Error (auth/popup-closed-by-user).');
  });

  it('logoutUser handles fetch failure gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const res = await logoutUser();
    expect(res.error).toBe('Network error');
  });
});
