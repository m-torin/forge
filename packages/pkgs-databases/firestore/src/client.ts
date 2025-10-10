/**
 * Client-side Firestore functionality for browser environments
 * This provides Firestore operations that are safe to use on the client side
 */

import { mergeClientConfig, validateClientConfig } from './config';
import type {
  FirestoreClient,
  FirestoreClientConfig,
  FirestoreResult,
  PaginatedResult,
  PaginationOptions,
  Subscription,
  SubscriptionOptions,
} from './types';

/**
 * Browser Firestore client implementation
 * Note: This requires Firebase v9+ SDK to be installed separately
 */
class FirestoreClientImpl implements FirestoreClient {
  private config: FirestoreClientConfig;
  private firestore: any; // Firebase client instance
  private app: any; // Firebase app instance

  constructor(config: Partial<FirestoreClientConfig> = {}) {
    this.config = mergeClientConfig(config);
    this.initializeFirebase();
  }

  /**
   * Initialize Firebase client
   * Note: Requires firebase/app and firebase/firestore to be installed
   */
  private async initializeFirebase() {
    try {
      // Dynamic import of Firebase client SDK
      const { initializeApp, getApps } = await import('firebase/app');
      const { getFirestore, connectFirestoreEmulator } = await import('firebase/firestore');

      // Check if app already exists
      const existingApps = getApps();
      const existingApp = existingApps.find(app => app.name === this.config.projectId);

      if (existingApp) {
        this.app = existingApp;
      } else {
        this.app = initializeApp(
          {
            apiKey: this.config.apiKey,
            authDomain: this.config.authDomain,
            projectId: this.config.projectId,
            storageBucket: this.config.storageBucket,
            messagingSenderId: this.config.messagingSenderId,
            appId: this.config.appId,
          },
          this.config.projectId,
        );
      }

      this.firestore = getFirestore(this.app);

      // Connect to emulator in development
      if (process.env.NODE_ENV === 'development' && process.env.FIRESTORE_EMULATOR_HOST) {
        const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
        connectFirestoreEmulator(this.firestore, host, parseInt(port));
      }
    } catch (error) {
      throw new Error(`Failed to initialize Firebase client: ${error}`);
    }
  }

  /**
   * Get collection reference
   */
  collection(collectionPath: string) {
    return {
      add: async (data: any) => {
        const { addDoc, collection } = await import('firebase/firestore');
        const collectionRef = collection(this.firestore, collectionPath);
        return await addDoc(collectionRef, data);
      },

      doc: (id?: string) => {
        const docPath = id ? `${collectionPath}/${id}` : `${collectionPath}/${Date.now()}`;
        return this.doc(docPath);
      },

      where: (field: string, op: any, value: any) => {
        return this.createQueryBuilder(collectionPath, [['where', field, op, value]]);
      },

      orderBy: (field: string, direction: any = 'asc') => {
        return this.createQueryBuilder(collectionPath, [['orderBy', field, direction]]);
      },

      limit: (count: number) => {
        return this.createQueryBuilder(collectionPath, [['limit', count]]);
      },

      get: async () => {
        const { getDocs, collection } = await import('firebase/firestore');
        const collectionRef = collection(this.firestore, collectionPath);
        return await getDocs(collectionRef);
      },
    };
  }

  /**
   * Get document reference
   */
  doc(documentPath: string) {
    return {
      get: async (options?: any) => {
        const { getDoc, doc } = await import('firebase/firestore');
        const docRef = doc(this.firestore, documentPath);
        return await getDoc(docRef);
      },

      set: async (data: any, options?: any) => {
        const { setDoc, doc } = await import('firebase/firestore');
        const docRef = doc(this.firestore, documentPath);
        return await setDoc(docRef, data, options);
      },

      update: async (data: any) => {
        const { updateDoc, doc } = await import('firebase/firestore');
        const docRef = doc(this.firestore, documentPath);
        return await updateDoc(docRef, data);
      },

      delete: async () => {
        const { deleteDoc, doc } = await import('firebase/firestore');
        const docRef = doc(this.firestore, documentPath);
        return await deleteDoc(docRef);
      },

      onSnapshot: (callback: any, errorCallback?: any) => {
        return this.subscribe(documentPath, callback, { onError: errorCallback });
      },

      collection: (collectionPath: string) => {
        return this.collection(`${documentPath}/${collectionPath}`);
      },
    };
  }

  /**
   * Create query builder for client-side queries
   */
  private createQueryBuilder(collectionPath: string, constraints: any[] = []) {
    return {
      where: (field: string, op: any, value: any) => {
        return this.createQueryBuilder(collectionPath, [
          ...constraints,
          ['where', field, op, value],
        ]);
      },

      orderBy: (field: string, direction: any = 'asc') => {
        return this.createQueryBuilder(collectionPath, [
          ...constraints,
          ['orderBy', field, direction],
        ]);
      },

      limit: (count: number) => {
        return this.createQueryBuilder(collectionPath, [...constraints, ['limit', count]]);
      },

      offset: (count: number) => {
        return this.createQueryBuilder(collectionPath, [...constraints, ['startAt', count]]);
      },

      startAt: (...values: any[]) => {
        return this.createQueryBuilder(collectionPath, [...constraints, ['startAt', ...values]]);
      },

      startAfter: (...values: any[]) => {
        return this.createQueryBuilder(collectionPath, [...constraints, ['startAfter', ...values]]);
      },

      endAt: (...values: any[]) => {
        return this.createQueryBuilder(collectionPath, [...constraints, ['endAt', ...values]]);
      },

      endBefore: (...values: any[]) => {
        return this.createQueryBuilder(collectionPath, [...constraints, ['endBefore', ...values]]);
      },

      get: async () => {
        const {
          getDocs,
          collection,
          query,
          where,
          orderBy,
          limit,
          startAt,
          startAfter,
          endAt,
          endBefore,
        } = await import('firebase/firestore');

        const collectionRef = collection(this.firestore, collectionPath);

        // Apply constraints
        const queryConstraints: any[] = [];
        for (const [method, ...args] of constraints) {
          switch (method) {
            case 'where':
              queryConstraints.push(where(...args));
              break;
            case 'orderBy':
              queryConstraints.push(orderBy(...args));
              break;
            case 'limit':
              queryConstraints.push(limit(...args));
              break;
            case 'startAt':
              queryConstraints.push(startAt(...args));
              break;
            case 'startAfter':
              queryConstraints.push(startAfter(...args));
              break;
            case 'endAt':
              queryConstraints.push(endAt(...args));
              break;
            case 'endBefore':
              queryConstraints.push(endBefore(...args));
              break;
          }
        }

        const q = query(collectionRef, ...queryConstraints);
        return await getDocs(q);
      },
    };
  }

  /**
   * Run transaction
   */
  async runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T> {
    const { runTransaction } = await import('firebase/firestore');
    return await runTransaction(this.firestore, updateFunction);
  }

  /**
   * Create batch
   */
  batch() {
    import('firebase/firestore').then(({ writeBatch }) => {
      return writeBatch(this.firestore);
    });
  }

  /**
   * Get all documents (limited in client)
   */
  async getAll(...documentReferences: any[]) {
    const { getDoc } = await import('firebase/firestore');
    return await Promise.all(documentReferences.map(ref => getDoc(ref)));
  }

  /**
   * Subscribe to document or collection changes
   */
  subscribe(
    path: string,
    callback: (snapshot: any) => void,
    options: SubscriptionOptions = {},
  ): Subscription {
    import('firebase/firestore').then(({ onSnapshot, doc, collection }) => {
      const ref =
        path.includes('/') && path.split('/').length % 2 === 0
          ? doc(this.firestore, path)
          : collection(this.firestore, path);

      const unsubscribe = onSnapshot(
        ref,
        { includeMetadataChanges: options.includeMetadataChanges || false },
        callback,
        options.onError,
      );

      return { unsubscribe };
    });

    // Return placeholder for now
    return { unsubscribe: () => {} };
  }

  /**
   * Terminate connection
   */
  async terminate() {
    const { terminate } = await import('firebase/firestore');
    await terminate(this.firestore);
  }

  /**
   * Enable offline persistence
   */
  async enablePersistence() {
    try {
      const { enableIndexedDbPersistence } = await import('firebase/firestore');
      await enableIndexedDbPersistence(this.firestore);
    } catch (error) {
      console.warn('Failed to enable persistence:', error);
    }
  }

  /**
   * Clear offline persistence
   */
  async clearPersistence() {
    try {
      const { clearIndexedDbPersistence } = await import('firebase/firestore');
      await clearIndexedDbPersistence(this.firestore);
    } catch (error) {
      console.warn('Failed to clear persistence:', error);
    }
  }
}

/**
 * Create client instance for browser environments
 */
export function createClient(config?: Partial<FirestoreClientConfig>): FirestoreClient {
  return new FirestoreClientImpl(config);
}

/**
 * Safe client operation wrapper
 */
export async function safeClientOperation<T>(
  operation: () => Promise<T>,
): Promise<FirestoreResult<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

/**
 * Client-side pagination helper
 */
export async function paginateClientQuery<T>(
  query: any,
  options: PaginationOptions = {},
): Promise<PaginatedResult<T>> {
  const { page = 1, pageSize = 20 } = options;

  // For client-side, we'll use cursor-based pagination
  const snapshot = await query.limit(pageSize).get();
  const items = snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];

  const hasNext = snapshot.docs.length === pageSize;
  const hasPrev = page > 1;

  return {
    items,
    total: -1, // Not available in client-side pagination
    page,
    pageSize,
    hasNext,
    hasPrev,
    nextCursor: hasNext ? snapshot.docs[snapshot.docs.length - 1] : undefined,
    prevCursor: undefined, // Not easily available in Firestore
  };
}

// Default client instance
let defaultClient: FirestoreClient | null = null;

/**
 * Get or create default client
 */
export function getClient(config?: Partial<FirestoreClientConfig>): FirestoreClient {
  if (!defaultClient || config) {
    defaultClient = createClient(config);
  }
  return defaultClient;
}

// Re-export types
export { mergeClientConfig, validateClientConfig };
export type { FirestoreClient, FirestoreClientConfig, FirestoreResult };
