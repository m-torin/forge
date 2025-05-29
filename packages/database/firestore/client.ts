import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { keys } from '../keys';

// Initialize Firebase app
export function initializeFirebaseApp(): App {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  const env = keys();
  return initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// Global type for Firestore client singleton
const globalForFirestore = global as unknown as { firestoreDb: Firestore };

// Create a singleton instance of the Firestore client
export const firestoreClientSingleton = (): Firestore => {
  const app = initializeFirebaseApp();
  return getFirestore(app);
};

// Export the Firestore client singleton
export const firestore = globalForFirestore.firestoreDb || firestoreClientSingleton();

// In development, attach to global to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForFirestore.firestoreDb = firestore;
}
