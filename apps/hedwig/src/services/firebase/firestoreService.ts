import {
  addDoc,
  arrayRemove,
  arrayUnion,
  clearIndexedDbPersistence,
  collection,
  deleteDoc,
  deleteField,
  disableNetwork,
  doc,
  type DocumentData,
  enableIndexedDbPersistence,
  enableMultiTabIndexedDbPersistence,
  enableNetwork,
  endBefore,
  type FieldValue,
  type Firestore,
  increment as firestoreIncrement,
  serverTimestamp as firestoreServerTimestamp,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  type OrderByDirection,
  query,
  type QueryConstraint,
  runTransaction,
  setDoc,
  startAfter,
  type Unsubscribe,
  updateDoc,
  where,
  type WhereFilterOp,
  writeBatch,
} from 'firebase/firestore';
// React hooks
import { useCallback, useEffect, useState } from 'react';

import { app } from '../../config/firebase';
import { SentryService } from '../sentryService';

import { FirebaseAuthService } from './authService';

export interface FirestoreQuery {
  endBefore?: unknown;
  limit?: number;
  orderBy?: {
    field: string;
    direction?: OrderByDirection;
  }[];
  startAfter?: unknown;
  where?: {
    field: string;
    operator: WhereFilterOp;
    value: unknown;
  }[];
}

export interface FirestoreDocument {
  [key: string]: unknown;
  id: string;
}

export class FirebaseFirestoreService {
  private static db: Firestore = getFirestore(app);
  private static listeners = new Map<string, Unsubscribe>();
  private static isOfflineEnabled = false;

  /**
   * Initialize Firestore with offline persistence
   */
  static async initialize(enableOffline = true): Promise<void> {
    if (enableOffline && !this.isOfflineEnabled) {
      try {
        // Try multi-tab persistence first
        await enableMultiTabIndexedDbPersistence(this.db);
        this.isOfflineEnabled = true;
      } catch (error) {
        // Fall back to single-tab persistence
        try {
          await enableIndexedDbPersistence(this.db);
          this.isOfflineEnabled = true;
        } catch (_err) {
          console.warn('Offline persistence not available:', _err);
        }
      }
    }
  }

  /**
   * Create or overwrite a document
   */
  static async setDocument<T extends DocumentData>(
    collectionPath: string,
    documentId: string,
    data: T,
    merge = false
  ): Promise<void> {
    try {
      const docRef = doc(this.db, collectionPath, documentId);
      await setDoc(docRef, data, { merge });
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firestore-set');
      throw error;
    }
  }

  /**
   * Add a new document with auto-generated ID
   */
  static async addDocument<T extends DocumentData>(
    collectionPath: string,
    data: T
  ): Promise<string> {
    try {
      const collectionRef = collection(this.db, collectionPath);
      const docRef = await addDoc(collectionRef, data);
      return docRef.id;
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firestore-add');
      throw error;
    }
  }

  /**
   * Get a single document
   */
  static async getDocument<T = DocumentData>(
    collectionPath: string,
    documentId: string
  ): Promise<FirestoreDocument & T | null> {
    try {
      const docRef = doc(this.db, collectionPath, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as FirestoreDocument & T;
      }
      
      return null;
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firestore-get');
      throw error;
    }
  }

  /**
   * Update a document
   */
  static async updateDocument(
    collectionPath: string,
    documentId: string,
    updates: Partial<DocumentData>
  ): Promise<void> {
    try {
      const docRef = doc(this.db, collectionPath, documentId);
      await updateDoc(docRef, updates);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firestore-update');
      throw error;
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(
    collectionPath: string,
    documentId: string
  ): Promise<void> {
    try {
      const docRef = doc(this.db, collectionPath, documentId);
      await deleteDoc(docRef);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firestore-delete');
      throw error;
    }
  }

  /**
   * Query documents
   */
  static async queryDocuments<T = DocumentData>(
    collectionPath: string,
    queryOptions?: FirestoreQuery
  ): Promise<(FirestoreDocument & T)[]> {
    try {
      const collectionRef = collection(this.db, collectionPath);
      const constraints = this.buildQueryConstraints(queryOptions);
      const q = query(collectionRef, ...constraints);
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as (FirestoreDocument & T)[];
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firestore-query');
      throw error;
    }
  }

  /**
   * Listen to a document
   */
  static listenToDocument<T = DocumentData>(
    collectionPath: string,
    documentId: string,
    callback: (data: (FirestoreDocument & T) | null) => void,
    onError?: (error: Error) => void
  ): () => void {
    const listenerKey = `${collectionPath}/${documentId}`;
    
    // Remove existing listener
    this.removeListener(listenerKey);

    const docRef = doc(this.db, collectionPath, documentId);
    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          callback({
            id: doc.id,
            ...doc.data(),
          } as FirestoreDocument & T);
        } else {
          callback(null);
        }
      },
      (error) => {
        SentryService.trackNetworkError(error, 'firestore-listen-doc');
        onError?.(error);
      }
    );

    this.listeners.set(listenerKey, unsubscribe);
    
    return () => this.removeListener(listenerKey);
  }

  /**
   * Listen to a collection/query
   */
  static listenToCollection<T = DocumentData>(
    collectionPath: string,
    callback: (data: (FirestoreDocument & T)[]) => void,
    options?: {
      query?: FirestoreQuery;
      onError?: (error: Error) => void;
    }
  ): () => void {
    const listenerKey = `${collectionPath}_${JSON.stringify(options?.query || {})}`;
    
    // Remove existing listener
    this.removeListener(listenerKey);

    const collectionRef = collection(this.db, collectionPath);
    const constraints = this.buildQueryConstraints(options?.query);
    const q = query(collectionRef, ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const documents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as (FirestoreDocument & T)[];
        
        callback(documents);
      },
      (error) => {
        SentryService.trackNetworkError(error, 'firestore-listen-collection');
        options?.onError?.(error);
      }
    );

    this.listeners.set(listenerKey, unsubscribe);
    
    return () => this.removeListener(listenerKey);
  }

  /**
   * Remove listener
   */
  private static removeListener(key: string): void {
    const unsubscribe = this.listeners.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(key);
    }
  }

  /**
   * Remove all listeners
   */
  static removeAllListeners(): void {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }

  /**
   * Build query constraints
   */
  private static buildQueryConstraints(
    queryOptions?: FirestoreQuery
  ): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];

    if (!queryOptions) return constraints;

    // Where clauses
    queryOptions.where?.forEach(({ field, operator, value }) => {
      constraints.push(where(field, operator, value));
    });

    // Order by
    queryOptions.orderBy?.forEach(({ direction, field }) => {
      constraints.push(orderBy(field, direction || 'asc'));
    });

    // Limit
    if (queryOptions.limit) {
      constraints.push(limit(queryOptions.limit));
    }

    // Pagination
    if (queryOptions.startAfter) {
      constraints.push(startAfter(queryOptions.startAfter));
    }
    if (queryOptions.endBefore) {
      constraints.push(endBefore(queryOptions.endBefore));
    }

    return constraints;
  }

  /**
   * Batch operations
   */
  static async batchWrite(
    operations: {
      type: 'set' | 'update' | 'delete';
      collection: string;
      documentId: string;
      data?: DocumentData;
    }[]
  ): Promise<void> {
    try {
      const batch = writeBatch(this.db);

      operations.forEach(op => {
        const docRef = doc(this.db, op.collection, op.documentId);
        
        switch (op.type) {
          case 'set':
            batch.set(docRef, op.data || {});
            break;
          case 'update':
            batch.update(docRef, op.data || {});
            break;
          case 'delete':
            batch.delete(docRef);
            break;
        }
      });

      await batch.commit();
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firestore-batch');
      throw error;
    }
  }

  /**
   * Transaction
   */
  static async runTransaction<T>(
    updateFunction: (transaction: any) => Promise<T>
  ): Promise<T> {
    try {
      return await runTransaction(this.db, updateFunction);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firestore-transaction');
      throw error;
    }
  }

  // Field value helpers

  static serverTimestamp(): FieldValue {
    return firestoreServerTimestamp();
  }

  static increment(n: number): FieldValue {
    return firestoreIncrement(n);
  }

  static arrayUnion(...elements: any[]): FieldValue {
    return arrayUnion(...elements);
  }

  static arrayRemove(...elements: any[]): FieldValue {
    return arrayRemove(...elements);
  }

  static deleteField(): FieldValue {
    return deleteField();
  }

  // Network management

  static async goOnline(): Promise<void> {
    await enableNetwork(this.db);
  }

  static async goOffline(): Promise<void> {
    await disableNetwork(this.db);
  }

  static async clearCache(): Promise<void> {
    await clearIndexedDbPersistence(this.db);
  }

  // User-specific methods

  private static getCurrentUserId(): string | null {
    const user = FirebaseAuthService.getCurrentUser();
    return user?.uid || null;
  }

  static async setUserDocument<T extends DocumentData>(
    subCollection: string,
    data: T,
    documentId?: string
  ): Promise<string> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const docId = documentId || userId;
    await this.setDocument(`users/${userId}/${subCollection}`, docId, data);
    return docId;
  }

  static async getUserDocument<T = DocumentData>(
    subCollection: string,
    documentId?: string
  ): Promise<(FirestoreDocument & T) | null> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const docId = documentId || userId;
    return await this.getDocument<T>(`users/${userId}/${subCollection}`, docId);
  }

  static async queryUserDocuments<T = DocumentData>(
    subCollection: string,
    queryOptions?: FirestoreQuery
  ): Promise<(FirestoreDocument & T)[]> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    return await this.queryDocuments<T>(`users/${userId}/${subCollection}`, queryOptions);
  }
}

export function useFirestoreDocument<T = DocumentData>(
  collectionPath: string,
  documentId: string,
  options?: {
    enabled?: boolean;
  }
) {
  const [data, setData] = useState<(FirestoreDocument & T) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (options?.enabled === false || !documentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = FirebaseFirestoreService.listenToDocument<T>(
      collectionPath,
      documentId,
      (doc) => {
        setData(doc);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionPath, documentId, options?.enabled]);

  const refetch = useCallback(async () => {
    if (!documentId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const doc = await FirebaseFirestoreService.getDocument<T>(collectionPath, documentId);
      setData(doc);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [collectionPath, documentId]);

  return { data, error, loading, refetch };
}

export function useFirestoreCollection<T = DocumentData>(
  collectionPath: string,
  options?: {
    query?: FirestoreQuery;
    enabled?: boolean;
  }
) {
  const [data, setData] = useState<(FirestoreDocument & T)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (options?.enabled === false) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = FirebaseFirestoreService.listenToCollection<T>(
      collectionPath,
      (docs) => {
        setData(docs);
        setLoading(false);
      },
      {
        onError: (err) => {
          setError(err);
          setLoading(false);
        },
        query: options?.query,
      }
    );

    return unsubscribe;
  }, [collectionPath, JSON.stringify(options)]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const docs = await FirebaseFirestoreService.queryDocuments<T>(
        collectionPath,
        options?.query
      );
      setData(docs);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [collectionPath, options?.query]);

  return { data, error, loading, refetch };
}