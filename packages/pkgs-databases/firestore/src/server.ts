/**
 * Server-side Firestore client for Node.js environments
 */

import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { detectRuntime, getOptimizedSettings, mergeConfig, validateServerConfig } from './config';
import type {
  BatchOperation,
  FirestoreClient,
  FirestoreConfig,
  FirestoreResult,
  PaginatedResult,
  PaginationOptions,
} from './types';

/**
 * Firestore server client implementation
 */
class FirestoreServerClient implements FirestoreClient {
  private app: App;
  private firestore: Firestore;
  private config: FirestoreConfig;

  constructor(config: Partial<FirestoreConfig> = {}) {
    this.config = mergeConfig(config);
    this.app = this.initializeApp();
    this.firestore = this.initializeFirestore();
  }

  /**
   * Initialize Firebase Admin app
   */
  private initializeApp(): App {
    const appName = this.config.databaseId || 'default';

    // Check if app already exists
    const existingApp = getApps().find(app => app.name === appName);
    if (existingApp) {
      return existingApp;
    }

    // Create credential object
    const credential = this.config.keyFilename
      ? cert(this.config.keyFilename)
      : cert({
          projectId: this.config.projectId,
          clientEmail: this.config.clientEmail!,
          privateKey: this.config.privateKey!.replace(/\\n/g, '\n'),
        });

    // Initialize app
    return initializeApp(
      {
        credential,
        projectId: this.config.projectId,
        databaseURL: this.config.databaseURL,
      },
      appName,
    );
  }

  /**
   * Initialize Firestore instance
   */
  private initializeFirestore(): Firestore {
    const firestore = getFirestore(this.app, this.config.databaseId);

    // Apply runtime optimizations
    const runtime = detectRuntime();
    const settings = getOptimizedSettings(runtime);

    if (settings.enableLogging && typeof settings.enableLogging === 'boolean') {
      // Configure logging if needed
    }

    return firestore;
  }

  /**
   * Get collection reference
   */
  collection(collectionPath: string) {
    const collectionRef = this.firestore.collection(collectionPath);

    return {
      add: async (data: any) => {
        return await collectionRef.add(data);
      },

      doc: (id?: string) =>
        this.doc(`${collectionPath}/${id || this.firestore.collection('_').doc().id}`),

      where: (field: string, op: any, value: any) => {
        const query = collectionRef.where(field, op, value);
        return this.createQueryBuilder(query);
      },

      orderBy: (field: string, direction: any = 'asc') => {
        const query = collectionRef.orderBy(field, direction);
        return this.createQueryBuilder(query);
      },

      limit: (count: number) => {
        const query = collectionRef.limit(count);
        return this.createQueryBuilder(query);
      },

      get: async () => {
        return await collectionRef.get();
      },
    };
  }

  /**
   * Get document reference
   */
  doc(documentPath: string) {
    const docRef = this.firestore.doc(documentPath);

    return {
      get: async (options?: any) => {
        return await docRef.get(options);
      },

      set: async (data: any, options?: any) => {
        return await docRef.set(data, options);
      },

      update: async (data: any) => {
        return await docRef.update(data);
      },

      delete: async () => {
        return await docRef.delete();
      },

      onSnapshot: (callback: any, errorCallback?: any) => {
        return docRef.onSnapshot(callback, errorCallback);
      },

      collection: (collectionPath: string) => {
        return this.collection(`${documentPath}/${collectionPath}`);
      },
    };
  }

  /**
   * Create query builder
   */
  private createQueryBuilder(query: any) {
    return {
      where: (field: string, op: any, value: any) => {
        return this.createQueryBuilder(query.where(field, op, value));
      },

      orderBy: (field: string, direction: any = 'asc') => {
        return this.createQueryBuilder(query.orderBy(field, direction));
      },

      limit: (count: number) => {
        return this.createQueryBuilder(query.limit(count));
      },

      offset: (count: number) => {
        return this.createQueryBuilder(query.offset(count));
      },

      startAt: (...values: any[]) => {
        return this.createQueryBuilder(query.startAt(...values));
      },

      startAfter: (...values: any[]) => {
        return this.createQueryBuilder(query.startAfter(...values));
      },

      endAt: (...values: any[]) => {
        return this.createQueryBuilder(query.endAt(...values));
      },

      endBefore: (...values: any[]) => {
        return this.createQueryBuilder(query.endBefore(...values));
      },

      get: async () => {
        return await query.get();
      },
    };
  }

  /**
   * Run transaction
   */
  async runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T> {
    return await this.firestore.runTransaction(updateFunction);
  }

  /**
   * Create batch
   */
  batch() {
    return this.firestore.batch();
  }

  /**
   * Get all documents
   */
  async getAll(...documentReferences: any[]) {
    return await this.firestore.getAll(...documentReferences);
  }

  /**
   * Terminate connection
   */
  async terminate() {
    await this.app.delete();
  }
}

/**
 * Create server client instance
 */
export function createServerClient(config?: Partial<FirestoreConfig>): FirestoreClient {
  return new FirestoreServerClient(config);
}

/**
 * Safe operation wrapper
 */
export async function safeFirestoreOperation<T>(
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
 * Paginate query results
 */
export async function paginateQuery<T>(
  query: any,
  options: PaginationOptions = {},
): Promise<PaginatedResult<T>> {
  const { page = 1, pageSize = 20, limit = pageSize, offset = (page - 1) * pageSize } = options;

  // Apply pagination to query
  let paginatedQuery = query.limit(limit);
  if (offset > 0) {
    paginatedQuery = paginatedQuery.offset(offset);
  }

  const snapshot = await paginatedQuery.get();
  const items = snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];

  // Get total count (this is expensive in Firestore)
  const totalSnapshot = await query.get();
  const total = totalSnapshot.size;

  const hasNext = page * pageSize < total;
  const hasPrev = page > 1;

  return {
    items,
    total,
    page,
    pageSize,
    hasNext,
    hasPrev,
    nextCursor: hasNext ? snapshot.docs[snapshot.docs.length - 1] : undefined,
    prevCursor: hasPrev ? snapshot.docs[0] : undefined,
  };
}

/**
 * Execute batch operations
 */
export async function executeBatch(
  client: FirestoreClient,
  operations: BatchOperation[],
): Promise<void> {
  const batch = client.batch();

  for (const operation of operations) {
    switch (operation.type) {
      case 'set':
        batch.set(operation.ref, operation.data, operation.options);
        break;
      case 'update':
        batch.update(operation.ref, operation.data);
        break;
      case 'delete':
        batch.delete(operation.ref);
        break;
    }
  }

  await batch.commit();
}

/**
 * Default server client instance
 */
let defaultClient: FirestoreClient | null = null;

/**
 * Get or create default server client
 */
export function getServerClient(config?: Partial<FirestoreConfig>): FirestoreClient {
  if (!defaultClient || config) {
    defaultClient = createServerClient(config);
  }
  return defaultClient;
}

/**
 * Export the default client
 */
export const firestore = getServerClient();

// Re-export types
export { mergeConfig, validateServerConfig };
export type { FirestoreClient, FirestoreConfig, FirestoreResult };
