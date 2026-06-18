import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../../../config/firebase';

const googleProvider = new GoogleAuthProvider();
const BACKEND_URL = 'http://localhost:3000';

const createBackendSession = async (user: any) => {
  const idToken = await user.getIdToken();
  await fetch(`${BACKEND_URL}/api/auth/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
    credentials: 'include', // Ensure the cookie is set in the browser
  });
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await createBackendSession(userCredential.user);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const registerWithEmail = async (name: string, email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Update the profile with the user's name
    await updateProfile(userCredential.user, { displayName: name });
    await createBackendSession(userCredential.user);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const loginWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    await createBackendSession(userCredential.user);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    // Clear backend session cookie first
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    
    // Then clear Firebase client auth state
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};
