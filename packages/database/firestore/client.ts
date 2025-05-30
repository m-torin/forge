import { type App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { type Firestore, getFirestore as getFirestoreInstance } from 'firebase-admin/firestore';

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
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      projectId: env.FIREBASE_PROJECT_ID,
    }),
  });
}

// Global type for Firestore client singleton
const globalForFirestore = global as unknown as { firestoreDb: Firestore };

// Create a singleton instance of the Firestore client
export const firestoreClientSingleton = (): Firestore => {
  const app = initializeFirebaseApp();
  return getFirestoreInstance(app);
};

// Export a lazy getter for the Firestore client
export const getFirestore = (): Firestore => {
  if (!globalForFirestore.firestoreDb) {
    globalForFirestore.firestoreDb = firestoreClientSingleton();
  }
  return globalForFirestore.firestoreDb;
};

// For backward compatibility, export firestore as a getter
export const firestore = new Proxy({} as Firestore, {
  get(target, prop, receiver) {
    const db = getFirestore();
    return Reflect.get(db, prop, receiver);
  },
});
