import 'server-only';

import { type App, cert, getApps, initializeApp } from 'firebase-admin/app';
import {
  type CollectionReference,
  type DocumentData,
  type Firestore,
  type Query,
  type Transaction,
  type WriteBatch,
  type WriteResult,
  FieldValue as FirebaseFieldValue,
  getFirestore,
} from 'firebase-admin/firestore';
import { safeEnv } from '../../env';

// Global type for Firestore client singleton
const globalForFirestore = global as unknown as {
  firestoreApp?: App;
  firestore?: Firestore;
};

// Create a singleton instance of the Firestore client
export const firestoreClientSingleton = (): Firestore => {
  // Initialize Firebase if not already initialized
  if (!globalForFirestore.firestoreApp) {
    const apps = getApps();
    if (apps.length === 0) {
      const env = safeEnv();
      globalForFirestore.firestoreApp = initializeApp({
        credential: cert({
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          projectId: env.FIREBASE_PROJECT_ID,
        }),
      });
    } else {
      globalForFirestore.firestoreApp = apps[0];
    }
  }

  if (!globalForFirestore.firestore) {
    globalForFirestore.firestore = getFirestore(globalForFirestore.firestoreApp);
  }

  return globalForFirestore.firestore;
};

// Environment-based Firestore client creation
export function createFirestoreFromEnv(): Firestore {
  const env = safeEnv();

  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    throw new Error(
      'Missing Firebase configuration. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.',
    );
  }

  const app = initializeApp({
    credential: cert({
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      projectId: env.FIREBASE_PROJECT_ID,
    }),
  });

  return getFirestore(app);
}

// Export the Firestore client instance for direct access
export const firestore = firestoreClientSingleton();

/**
 * Server-side Firestore operations
 * This provides the actual Firestore client instance and server-only operations
 */

// All exports are already handled above

// Re-export all Firestore types and functions
export * from 'firebase-admin/firestore';

/**
 * Core Firestore operations
 */
export class FirestoreOperations {
  private client: Firestore;

  constructor(client?: Firestore) {
    this.client = client || firestore;
  }

  /**
   * Create a new document
   */
  async create<T = DocumentData>(
    collection: string,
    data: any,
    id?: string,
  ): Promise<T & { id: string }> {
    const docRef = id
      ? this.client.collection(collection).doc(id)
      : this.client.collection(collection).doc();

    // If id wasn't provided, add it to the data
    const documentData = { ...data, id: docRef.id };

    await docRef.set(documentData);
    return documentData as T & { id: string };
  }

  /**
   * Get a document by ID
   */
  async get<T = DocumentData>(
    collection: string,
    id: string,
  ): Promise<(T & { id: string }) | null> {
    const docRef = this.client.collection(collection).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    return { id: doc.id, ...doc.data() } as T & { id: string };
  }

  /**
   * Update a document
   */
  async update<T = DocumentData>(
    collection: string,
    id: string,
    data: Partial<T>,
  ): Promise<T & { id: string }> {
    const docRef = this.client.collection(collection).doc(id);
    await docRef.update(data);

    // Get the updated document
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as T & { id: string };
  }

  /**
   * Delete a document
   */
  async delete<T = DocumentData>(
    collection: string,
    id: string,
  ): Promise<(T & { id: string }) | null> {
    const docRef = this.client.collection(collection).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    const data = { id: doc.id, ...doc.data() } as T & { id: string };
    await docRef.delete();
    return data;
  }

  /**
   * Find many documents with optional query
   */
  async findMany<T = DocumentData>(
    collection: string,
    options?: {
      where?: Array<{ field: string; operator: FirebaseFirestore.WhereFilterOp; value: any }>;
      orderBy?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
      limit?: number;
      offset?: number;
      startAfter?: any;
      startAt?: any;
      endBefore?: any;
      endAt?: any;
    },
  ): Promise<(T & { id: string })[]> {
    let query: CollectionReference<DocumentData> | Query<DocumentData> =
      this.client.collection(collection);

    if (options?.where) {
      options.where.forEach(({ field, operator, value }) => {
        query = query.where(field, operator, value);
      });
    }

    if (options?.orderBy) {
      options.orderBy.forEach(({ field, direction = 'asc' }) => {
        query = query.orderBy(field, direction);
      });
    }

    if (options?.startAfter) {
      query = query.startAfter(options.startAfter);
    }

    if (options?.startAt) {
      query = query.startAt(options.startAt);
    }

    if (options?.endBefore) {
      query = query.endBefore(options.endBefore);
    }

    if (options?.endAt) {
      query = query.endAt(options.endAt);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    // Handle offset with a separate query (Firestore doesn't have direct skip)
    if (options?.offset && options.offset > 0) {
      const offsetQuery = this.client.collection(collection);
      // Apply same where conditions for offset query
      let offsetQueryWithConditions: CollectionReference<DocumentData> | Query<DocumentData> =
        offsetQuery;
      if (options.where) {
        options.where.forEach(({ field, operator, value }) => {
          offsetQueryWithConditions = offsetQueryWithConditions.where(field, operator, value);
        });
      }
      if (options.orderBy) {
        options.orderBy.forEach(({ field, direction = 'asc' }) => {
          offsetQueryWithConditions = offsetQueryWithConditions.orderBy(field, direction);
        });
      }

      const offsetSnapshot = await offsetQueryWithConditions.limit(options.offset).get();
      if (!offsetSnapshot.empty) {
        const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (T & { id: string })[];
  }

  /**
   * Find a unique document
   */
  async findUnique<T = DocumentData>(
    collection: string,
    options: {
      where?: Array<{ field: string; operator: FirebaseFirestore.WhereFilterOp; value: any }>;
      id?: string;
    },
  ): Promise<(T & { id: string }) | null> {
    // If querying by ID, use direct document access
    if (options.id) {
      return this.get<T>(collection, options.id);
    }

    // Otherwise use where conditions
    let query: CollectionReference<DocumentData> | Query<DocumentData> =
      this.client.collection(collection);

    if (options.where) {
      options.where.forEach(({ field, operator, value }) => {
        query = query.where(field, operator, value);
      });
    }

    const snapshot = await query.limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as T & { id: string };
  }

  /**
   * Count documents in a collection
   */
  async count(
    collection: string,
    options?: {
      where?: Array<{ field: string; operator: FirebaseFirestore.WhereFilterOp; value: any }>;
    },
  ): Promise<number> {
    let query: CollectionReference<DocumentData> | Query<DocumentData> =
      this.client.collection(collection);

    if (options?.where) {
      options.where.forEach(({ field, operator, value }) => {
        query = query.where(field, operator, value);
      });
    }

    const snapshot = await query.count().get();
    return snapshot.data().count;
  }

  /**
   * Batch operations
   */
  batch(): WriteBatch {
    return this.client.batch();
  }

  /**
   * Transaction operations
   */
  async transaction<T>(callback: (transaction: Transaction) => Promise<T>): Promise<T> {
    return this.client.runTransaction(callback);
  }

  /**
   * Get a collection reference
   */
  collection(path: string): CollectionReference<DocumentData> {
    return this.client.collection(path);
  }

  /**
   * Get a document reference
   */
  doc(path: string): FirebaseFirestore.DocumentReference<DocumentData> {
    return this.client.doc(path);
  }

  /**
   * Collection group query
   */
  collectionGroup(collectionId: string): Query<DocumentData> {
    return this.client.collectionGroup(collectionId);
  }

  /**
   * Execute a raw query with custom parameters
   */
  async executeRawQuery<T = DocumentData>(
    collection: string,
    params: {
      where?: Array<{ field: string; operator: FirebaseFirestore.WhereFilterOp; value: any }>;
      orderBy?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
      limit?: number;
    },
  ): Promise<(T & { id: string })[]> {
    let query: CollectionReference<DocumentData> | Query<DocumentData> =
      this.client.collection(collection);

    if (params.where) {
      params.where.forEach(({ field, operator, value }) => {
        query = query.where(field, operator, value);
      });
    }

    if (params.orderBy) {
      params.orderBy.forEach(({ field, direction = 'asc' }) => {
        query = query.orderBy(field, direction);
      });
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (T & { id: string })[];
  }

  /**
   * Bulk operations
   */
  async bulkCreate<T = DocumentData>(
    collection: string,
    documents: Array<T & { id?: string }>,
  ): Promise<(T & { id: string })[]> {
    const batch = this.client.batch();
    const results: (T & { id: string })[] = [];

    documents.forEach(doc => {
      const docRef = doc.id
        ? this.client.collection(collection).doc(doc.id)
        : this.client.collection(collection).doc();

      const documentData = { ...doc, id: docRef.id };
      batch.set(docRef, documentData);
      results.push(documentData as T & { id: string });
    });

    await batch.commit();
    return results;
  }

  async bulkUpdate<T = DocumentData>(
    collection: string,
    updates: Array<{ id: string; data: Partial<T> }>,
  ): Promise<WriteResult[]> {
    const batch = this.client.batch();

    updates.forEach(({ id, data }) => {
      const docRef = this.client.collection(collection).doc(id);
      batch.update(docRef, data);
    });

    return batch.commit();
  }

  async bulkDelete(collection: string, ids: string[]): Promise<WriteResult[]> {
    const batch = this.client.batch();

    ids.forEach(id => {
      const docRef = this.client.collection(collection).doc(id);
      batch.delete(docRef);
    });

    return batch.commit();
  }

  /**
   * Field value utilities
   */
  get FieldValue(): typeof FirebaseFieldValue {
    return FirebaseFieldValue;
  }

  /**
   * Raw access to the client
   */
  getClient(): Firestore {
    return this.client;
  }
}

// Create a default instance
export const firestoreOps = new FirestoreOperations();

// Export convenience functions
export const {
  create,
  get,
  update,
  delete: deleteDoc,
  findMany,
  findUnique,
  count,
  batch,
  transaction,
  collection,
  doc,
  collectionGroup,
  executeRawQuery,
  bulkCreate,
  bulkUpdate,
  bulkDelete,
  getClient,
} = firestoreOps;

// Export FieldValue separately to avoid naming conflicts
export const FieldValue = FirebaseFieldValue;
