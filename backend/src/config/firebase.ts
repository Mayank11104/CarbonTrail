import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import type { App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import path from 'path';

let app: App;

if (process.env.NODE_ENV === 'production') {
  app = initializeApp({
    credential: applicationDefault(),
  });
} else {
  const serviceAccountPath = path.resolve(__dirname, '../../carbontrail-74b5b-firebase-adminsdk-fbsvc-9d949c0b73.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
  app = initializeApp({
    credential: cert(serviceAccount),
  });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
