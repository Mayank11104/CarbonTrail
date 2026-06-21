import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from '../../../config/firebase';
import { BACKEND_URL } from '../../../config/constants';

const googleProvider = new GoogleAuthProvider();

const createBackendSession = async (user: User) => {
  const idToken = await user.getIdToken();
  await fetch(`${BACKEND_URL}/api/auth/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
    credentials: 'include', // Ensure the cookie is set in the browser
  });
};

const getErrorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : 'An unexpected error occurred.';

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await createBackendSession(userCredential.user);
    return { user: userCredential.user, error: null };
  } catch (err) {
    return { user: null, error: getErrorMessage(err) };
  }
};

export const registerWithEmail = async (name: string, email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    await createBackendSession(userCredential.user);
    return { user: userCredential.user, error: null };
  } catch (err) {
    return { user: null, error: getErrorMessage(err) };
  }
};

export const loginWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    await createBackendSession(userCredential.user);
    return { user: userCredential.user, error: null };
  } catch (err) {
    return { user: null, error: getErrorMessage(err) };
  }
};

export const logoutUser = async () => {
  try {
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    await signOut(auth);
    return { error: null };
  } catch (err) {
    return { error: getErrorMessage(err) };
  }
};
