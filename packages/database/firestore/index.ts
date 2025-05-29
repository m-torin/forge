import 'server-only';
import { firestore } from './client';
import { FirestoreAdapter } from './adapter';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Export the Firestore client for direct access
export { firestore };

// Export the FirestoreAdapter for internal use
export { FirestoreAdapter };

// Re-export types from firebase-admin/firestore
export * from 'firebase-admin/firestore';

// Export a function to create a new adapter instance
export function createFirestoreAdapter(): FirestoreAdapter {
  return new FirestoreAdapter();
}
