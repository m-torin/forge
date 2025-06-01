import {
  type Database,
  type DatabaseReference,
  endAt,
  equalTo,
  get,
  getDatabase,
  increment,
  limitToFirst,
  limitToLast,
  onDisconnect,
  onValue,
  orderByChild,
  orderByKey,
  orderByValue,
  push,
  query,
  ref,
  remove,
  serverTimestamp,
  set,
  startAt,
  type Unsubscribe,
  update,
} from 'firebase/database';
// React hooks
import { useCallback, useEffect, useState } from 'react';

import { app } from '../../config/firebase';
import { SentryService } from '../sentryService';

import { FirebaseAuthService } from './authService';

export interface RealtimeQuery {
  endAt?: string | number | boolean | null;
  equalTo?: string | number | boolean | null;
  limitFirst?: number;
  limitLast?: number;
  orderBy?: 'child' | 'key' | 'value';
  orderByField?: string;
  startAt?: string | number | boolean | null;
}

export class FirebaseRealtimeDbService {
  private static db: Database = getDatabase(app);
  private static listeners = new Map<string, Unsubscribe>();

  /**
   * Write data to a path
   */
  static async write(path: string, data: unknown): Promise<void> {
    try {
      const dbRef = ref(this.db, path);
      await set(dbRef, data);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-rtdb-write');
      throw error;
    }
  }

  /**
   * Read data from a path
   */
  static async read<T = unknown>(path: string): Promise<T | null> {
    try {
      const dbRef = ref(this.db, path);
      const snapshot = await get(dbRef);
      
      if (snapshot.exists()) {
        return snapshot.val() as T;
      }
      
      return null;
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-rtdb-read');
      throw error;
    }
  }

  /**
   * Update data at a path
   */
  static async update(path: string, updates: Record<string, unknown>): Promise<void> {
    try {
      const dbRef = ref(this.db, path);
      await update(dbRef, updates);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-rtdb-update');
      throw error;
    }
  }

  /**
   * Delete data at a path
   */
  static async delete(path: string): Promise<void> {
    try {
      const dbRef = ref(this.db, path);
      await remove(dbRef);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-rtdb-delete');
      throw error;
    }
  }

  /**
   * Push new data to a list
   */
  static async push(path: string, data: unknown): Promise<string> {
    try {
      const dbRef = ref(this.db, path);
      const newRef = push(dbRef);
      await set(newRef, data);
      return newRef.key!;
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-rtdb-push');
      throw error;
    }
  }

  /**
   * Listen to data changes
   */
  static listen<T = unknown>(
    path: string,
    callback: (data: T | null) => void,
    options?: {
      onError?: (error: Error) => void;
      query?: RealtimeQuery;
    }
  ): () => void {
    try {
      // Remove existing listener if any
      this.removeListener(path);

      let dbRef: DatabaseReference | ReturnType<typeof query> = ref(this.db, path);

      // Apply query if provided
      if (options?.query) {
        dbRef = this.applyQuery(dbRef, options.query);
      }

      const listener = onValue(
        dbRef,
        (snapshot) => {
          callback(snapshot.val() as T);
        },
        (error) => {
          SentryService.trackNetworkError(error, 'firebase-rtdb-listen');
          options?.onError?.(error);
        }
      );

      // Store listener
      this.listeners.set(path, listener);

      // Return unsubscribe function
      return () => this.removeListener(path);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-rtdb-listen-setup');
      throw error;
    }
  }

  /**
   * Listen to a list with automatic updates
   */
  static listenToList<T extends Record<string, unknown> = Record<string, unknown>>(
    path: string,
    callback: (items: T[]) => void,
    options?: {
      onError?: (error: Error) => void;
      query?: RealtimeQuery;
    }
  ): () => void {
    return this.listen(
      path,
      (data) => {
        if (!data) {
          callback([]);
          return;
        }

        // Convert object to array
        const items = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...(value as T),
        }));

        callback(items as T[]);
      },
      options
    );
  }

  /**
   * Remove listener
   */
  static removeListener(path: string): void {
    const listener = this.listeners.get(path);
    if (listener) {
      listener();
      this.listeners.delete(path);
    }
  }

  /**
   * Remove all listeners
   */
  static removeAllListeners(): void {
    this.listeners.forEach((listener) => listener());
    this.listeners.clear();
  }

  /**
   * Apply query constraints
   */
  private static applyQuery(
    dbRef: DatabaseReference,
    queryOptions: RealtimeQuery
  ): ReturnType<typeof query> {
    let queryRef: ReturnType<typeof query> = dbRef as ReturnType<typeof query>;

    // Order by
    if (queryOptions.orderBy === 'child' && queryOptions.orderByField) {
      queryRef = query(queryRef, orderByChild(queryOptions.orderByField));
    } else if (queryOptions.orderBy === 'key') {
      queryRef = query(queryRef, orderByKey());
    } else if (queryOptions.orderBy === 'value') {
      queryRef = query(queryRef, orderByValue());
    }

    // Limit
    if (queryOptions.limitFirst) {
      queryRef = query(queryRef, limitToFirst(queryOptions.limitFirst));
    } else if (queryOptions.limitLast) {
      queryRef = query(queryRef, limitToLast(queryOptions.limitLast));
    }

    // Range
    if (queryOptions.startAt !== undefined) {
      queryRef = query(queryRef, startAt(queryOptions.startAt));
    }
    if (queryOptions.endAt !== undefined) {
      queryRef = query(queryRef, endAt(queryOptions.endAt));
    }

    // Equality
    if (queryOptions.equalTo !== undefined) {
      queryRef = query(queryRef, equalTo(queryOptions.equalTo));
    }

    return queryRef;
  }

  /**
   * Batch write operations
   */
  static async batchWrite(operations: {
    path: string;
    type: 'set' | 'update' | 'remove';
    data?: unknown;
  }[]): Promise<void> {
    const updates: Record<string, any> = {};

    operations.forEach((op) => {
      switch (op.type) {
        case 'set':
          updates[op.path] = op.data;
          break;
        case 'update':
          // For updates, we need to merge the paths
          Object.entries(op.data || {}).forEach(([key, value]) => {
            updates[`${op.path}/${key}`] = value;
          });
          break;
        case 'remove':
          updates[op.path] = null;
          break;
      }
    });

    try {
      await update(ref(this.db), updates);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-rtdb-batch');
      throw error;
    }
  }

  /**
   * Transaction
   */
  static async transaction<T = unknown>(
    path: string,
    updateFunction: (currentData: T | null) => T
  ): Promise<void> {
    try {
      const dbRef = ref(this.db, path);
      
      // Read current value
      const snapshot = await get(dbRef);
      const currentData = snapshot.val() as T | null;
      
      // Apply update function
      const newData = updateFunction(currentData);
      
      // Write new value
      await set(dbRef, newData);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-rtdb-transaction');
      throw error;
    }
  }

  // Utility methods

  /**
   * Get server timestamp
   */
  static getServerTimestamp() {
    return serverTimestamp();
  }

  /**
   * Get increment value
   */
  static getIncrement(value: number) {
    return increment(value);
  }

  /**
   * Set up offline persistence
   */
  static async enableOffline(): Promise<void> {
    // Offline persistence is automatically enabled in Firebase SDK
    // This method is here for consistency
  }

  /**
   * Handle connection state
   */
  static onConnectionStateChange(
    callback: (isConnected: boolean) => void
  ): () => void {
    const connectedRef = ref(this.db, '.info/connected');
    const listener = onValue(connectedRef, (snapshot) => {
      callback(snapshot.val() === true);
    });

    return listener;
  }

  /**
   * Set data on disconnect
   */
  static async setOnDisconnect(path: string, value: unknown): Promise<void> {
    try {
      const dbRef = ref(this.db, path);
      await onDisconnect(dbRef).set(value);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-rtdb-disconnect');
      throw error;
    }
  }

  // User-specific methods

  /**
   * Get current user ID
   */
  private static getCurrentUserId(): string | null {
    const user = FirebaseAuthService.getCurrentUser();
    return user?.uid || null;
  }

  /**
   * Write user data
   */
  static async writeUserData(subPath: string, data: unknown): Promise<void> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    await this.write(`users/${userId}/${subPath}`, data);
  }

  /**
   * Read user data
   */
  static async readUserData<T = unknown>(subPath: string): Promise<T | null> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    return await this.read<T>(`users/${userId}/${subPath}`);
  }

  /**
   * Listen to user data
   */
  static listenToUserData<T = unknown>(
    subPath: string,
    callback: (data: T | null) => void,
    options?: {
      onError?: (error: Error) => void;
      query?: RealtimeQuery;
    }
  ): () => void {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    return this.listen(`users/${userId}/${subPath}`, callback, options);
  }
}

export function useRealtimeData<T = unknown>(
  path: string,
  options?: {
    query?: RealtimeQuery;
    enabled?: boolean;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (options?.enabled === false) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = FirebaseRealtimeDbService.listen<T>(
      path,
      (newData) => {
        setData(newData);
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
  }, [path, options?.enabled, options?.query]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newData = await FirebaseRealtimeDbService.read<T>(path);
      setData(newData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [path]);

  return { data, error, loading, refetch };
}

export function useRealtimeList<T extends Record<string, unknown> = Record<string, unknown>>(
  path: string,
  options?: {
    query?: RealtimeQuery;
    enabled?: boolean;
  }
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (options?.enabled === false) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = FirebaseRealtimeDbService.listenToList<T>(
      path,
      (newItems) => {
        setItems(newItems);
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
  }, [path, options?.enabled, options?.query]);

  return { error, items, loading };
}

export function useRealtimeConnection() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = FirebaseRealtimeDbService.onConnectionStateChange(
      setIsConnected
    );

    return unsubscribe;
  }, []);

  return isConnected;
}