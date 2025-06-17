import { type App, cert, getApps, initializeApp } from 'firebase-admin/app';
import {
  type CollectionReference,
  type DocumentData,
  type Firestore,
  getFirestore,
  type Query,
} from 'firebase-admin/firestore';

import { keys } from '../keys';
import { type DatabaseAdapter } from '../types';

export class FirestoreAdapter implements DatabaseAdapter {
  private app: App;
  private db: Firestore;
  private initialized = false;

  constructor() {
    // Will be initialized in the initialize method
    this.app = null as unknown as App;
    this.db = null as unknown as Firestore;
  }

  async count(collection: string, query?: any): Promise<number> {
    let firestoreQuery: CollectionReference<DocumentData> | Query<DocumentData> =
      this.db.collection(collection);

    if (query?.where) {
      Object.entries(query.where).forEach(([field, value]: any) => {
        // @ts-ignore - Dynamic field access
        firestoreQuery = firestoreQuery.where(field, '==', value);
      });
    }

    const snapshot = await firestoreQuery.count().get();
    return snapshot.data().count;
  }

  async create<T>(collection: string, data: any): Promise<T> {
    const docRef = data.id
      ? this.db.collection(collection).doc(data.id)
      : this.db.collection(collection).doc();

    // If id wasn't provided, add it to the data
    data.id ??= docRef.id;

    await docRef.set(data);
    return data as T;
  }

  async delete<T>(collection: string, id: string): Promise<T> {
    // Get the document before deleting it
    const docRef = this.db.collection(collection).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error(`Document with id ${id} not found in collection ${collection}`);
    }

    const data = { id: doc.id, ...doc.data() } as T;

    // Delete the document
    await docRef.delete();

    return data;
  }

  async disconnect(): Promise<void> {
    // Firestore doesn't require explicit disconnection
    this.initialized = false;
  }

  async findMany<T>(collection: string, query?: any): Promise<T[]> {
    let firestoreQuery: CollectionReference<DocumentData> | Query<DocumentData> =
      this.db.collection(collection);

    if (query) {
      // Handle where conditions
      if (query.where) {
        Object.entries(query.where).forEach(([field, value]: any) => {
          // @ts-ignore - Dynamic field access
          firestoreQuery = firestoreQuery.where(field, '==', value);
        });
      }

      // Handle ordering
      if (query.orderBy) {
        Object.entries(query.orderBy).forEach(([field, direction]: any) => {
          firestoreQuery = firestoreQuery.orderBy(
            field,
            // @ts-ignore - Dynamic direction
            direction === 'desc' ? 'desc' : 'asc',
          );
        });
      }

      // Handle pagination
      if (query.skip) {
        // Firestore doesn't have a direct skip, but we can use startAfter with a separate query
        if (query.skip > 0) {
          const snapshot = await firestoreQuery.limit(query.skip).get();
          if (!snapshot.empty) {
            const lastDoc = snapshot.docs[snapshot.docs.length - 1];
            firestoreQuery = firestoreQuery.startAfter(lastDoc);
          }
        }
      }

      if (query.take) {
        firestoreQuery = firestoreQuery.limit(query.take);
      }
    }

    const snapshot = await firestoreQuery.get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as T[];
  }

  async findUnique<T>(collection: string, query: any): Promise<null | T> {
    // In Firestore, we typically query by ID for unique documents
    if (query.where?.id) {
      const docRef = this.db.collection(collection).doc(query.where.id);
      const doc = await docRef.get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() } as T;
    }

    // Handle other unique queries
    let firestoreQuery: CollectionReference<DocumentData> | Query<DocumentData> =
      this.db.collection(collection);

    if (query.where) {
      Object.entries(query.where).forEach(([field, value]: any) => {
        // @ts-ignore - Dynamic field access
        firestoreQuery = firestoreQuery.where(field, '==', value);
      });
    }

    const snapshot = await firestoreQuery.limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as T;
  }

  // Get the underlying Firestore client for direct access
  getClient(): Firestore {
    return this.db;
  }

  async initialize(): Promise<void> {
    if (!this.initialized) {
      // Initialize Firebase if not already initialized
      const apps = getApps();
      if (apps.length === 0) {
        const env = keys();
        this.app = initializeApp({
          credential: cert({
            clientEmail: env.FIREBASE_CLIENT_EMAIL,
            privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            projectId: env.FIREBASE_PROJECT_ID,
          }),
        });
      } else {
        this.app = apps[0];
      }

      this.db = getFirestore(this.app);
      this.initialized = true;
    }
  }

  async raw<T = any>(operation: string, params: any): Promise<T> {
    // For direct access to Firestore operations
    // This is a simplified implementation - in a real app, you'd handle more operations
    switch (operation) {
      case 'batch':
        return this.db.batch() as unknown as T;
      case 'collection':
        return this.db.collection(params.name) as unknown as T;
      case 'doc':
        return this.db.collection(params.collection).doc(params.id) as unknown as T;
      case 'query':
        return this.executeRawQuery(params) as unknown as T;
      case 'transaction':
        return this.db.runTransaction(params.callback) as unknown as T;
      default:
        throw new Error(`Unsupported Firestore operation: ${operation}`);
    }
  }

  async update<T>(collection: string, id: string, data: any): Promise<T> {
    const docRef = this.db.collection(collection).doc(id);
    await docRef.update(data);

    // Get the updated document
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as T;
  }

  private async executeRawQuery(params: any): Promise<DocumentData[]> {
    let query: CollectionReference<DocumentData> | Query<DocumentData> = this.db.collection(
      params.collection,
    );

    if (params.where) {
      params.where.forEach((condition: any) => {
        query = query.where(condition.field, condition.operator ?? '==', condition.value);
      });
    }

    if (params.orderBy) {
      params.orderBy.forEach((order: any) => {
        query = query.orderBy(order.field, order.direction ?? 'asc');
      });
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }
}
