import { db } from '../../config/firebase';

/**
 * Fetches a user's profile data from Firestore.
 */
export const getUserProfile = async (uid: string) => {
  const userDoc = await db.collection('users').doc(uid).get();
  return userDoc.exists ? userDoc.data() : null;
};
