import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';

// Using the provided service account JSON file
const serviceAccountPath = path.resolve(__dirname, '../../carbontrail-74b5b-firebase-adminsdk-fbsvc-9d949c0b73.json');

const app = initializeApp({
  credential: cert(require(serviceAccountPath)),
});

console.log('Firebase Admin initialized successfully.');

export const auth = getAuth(app);
export const db = getFirestore(app);
