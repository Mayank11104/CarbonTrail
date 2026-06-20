import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';

let app;

if (process.env.NODE_ENV === 'production') {
  // In Cloud Run, rely on the implicit service account
  app = initializeApp({
    credential: applicationDefault(),
  });
} else {
  // Locally, use the explicit JSON file
  const serviceAccountPath = path.resolve(__dirname, '../../carbontrail-74b5b-firebase-adminsdk-fbsvc-9d949c0b73.json');
  app = initializeApp({
    credential: cert(require(serviceAccountPath)),
  });
}

console.log('Firebase Admin initialized successfully.');

export const auth = getAuth(app);
export const db = getFirestore(app);
