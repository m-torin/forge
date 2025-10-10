/**
 * Next.js client-side Firestore functionality
 * Optimized for Next.js client components with SSR support
 */

'use client';

import { createClient, type FirestoreClient } from './client';
import type { FirestoreClientConfig, FirestoreResult } from './types';

/**
 * Next.js client-side Firestore client with SSR optimization
 */
class NextFirestoreClient {
  private static instance: FirestoreClient | null = null;
  private static initialized = false;

  /**
   * Get client instance with Next.js optimizations
   */
  static getClient(config?: Partial<FirestoreClientConfig>): FirestoreClient | null {
    // Return null during SSR
    if (typeof window === 'undefined') {
      return null;
    }

    if (!this.instance && !this.initialized) {
      this.initialized = true;

      try {
        this.instance = createClient({
          // Default Next.js client config
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
          ...config,
        });
      } catch (error) {
        console.error('Failed to initialize Next.js Firestore client:', error);
      }
    }

    return this.instance;
  }

  /**
   * Reset client (useful for testing or config changes)
   */
  static reset(): void {
    this.instance = null;
    this.initialized = false;
  }
}

/**
 * Hook for using Firestore in Next.js client components
 */
export function useFirestore(config?: Partial<FirestoreClientConfig>) {
  const client = NextFirestoreClient.getClient(config);

  return {
    client,
    isReady: client !== null,
    isSSR: typeof window === 'undefined',
  };
}

/**
 * Get Next.js client-side Firestore instance
 */
export function getNextClientFirestore(
  config?: Partial<FirestoreClientConfig>,
): FirestoreClient | null {
  return NextFirestoreClient.getClient(config);
}

/**
 * React hook for document subscription
 */
export function useFirestoreDocument<T = any>(
  documentPath: string | null,
  config?: Partial<FirestoreClientConfig>,
) {
  const { client, isReady, isSSR } = useFirestore(config);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client || !documentPath || isSSR) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = client.doc(documentPath).onSnapshot(
      (snapshot: any) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err: Error) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [client, documentPath, isSSR]);

  return { data, loading, error };
}

/**
 * React hook for collection subscription
 */
export function useFirestoreCollection<T = any>(
  collectionPath: string | null,
  constraints: {
    where?: Array<[string, any, any]>;
    orderBy?: [string, 'asc' | 'desc'];
    limit?: number;
  } = {},
  config?: Partial<FirestoreClientConfig>,
) {
  const { client, isReady, isSSR } = useFirestore(config);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client || !collectionPath || isSSR) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let query = client.collection(collectionPath);

    // Apply constraints
    if (constraints.where) {
      for (const [field, op, value] of constraints.where) {
        query = query.where(field, op, value);
      }
    }

    if (constraints.orderBy) {
      const [field, direction] = constraints.orderBy;
      query = query.orderBy(field, direction);
    }

    if (constraints.limit) {
      query = query.limit(constraints.limit);
    }

    const unsubscribe = query.onSnapshot(
      (snapshot: any) => {
        const items = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(items as T[]);
        setLoading(false);
      },
      (err: Error) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [client, collectionPath, JSON.stringify(constraints), isSSR]);

  return { data, loading, error };
}

/**
 * Hook for Firestore mutations with optimistic updates
 */
export function useFirestoreMutation<T = any>(config?: Partial<FirestoreClientConfig>) {
  const { client } = useFirestore(config);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (
    operation: (client: FirestoreClient) => Promise<T>,
    options?: {
      optimisticUpdate?: () => void;
      onSuccess?: (result: T) => void;
      onError?: (error: string) => void;
    },
  ): Promise<FirestoreResult<T>> => {
    if (!client) {
      const errorMsg = 'Firestore client not available';
      if (options?.onError) options.onError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setLoading(true);
    setError(null);

    // Apply optimistic update
    if (options?.optimisticUpdate) {
      options.optimisticUpdate();
    }

    try {
      const result = await operation(client);

      if (options?.onSuccess) {
        options.onSuccess(result);
      }

      setLoading(false);
      return { success: true, data: result };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);

      if (options?.onError) {
        options.onError(errorMsg);
      }

      setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  return { mutate, loading, error };
}

/**
 * Next.js API route helpers for client-side integration
 */
export const firestoreApi = {
  /**
   * Fetch document via Next.js API route
   */
  async getDocument<T = any>(path: string): Promise<FirestoreResult<T>> {
    try {
      const response = await fetch(`/api/firestore?path=${encodeURIComponent(path)}`);

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  /**
   * Create document via Next.js API route
   */
  async createDocument<T = any>(path: string, data: T): Promise<FirestoreResult<void>> {
    try {
      const response = await fetch('/api/firestore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, data }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error };
      }

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  /**
   * Update document via Next.js API route
   */
  async updateDocument<T = any>(path: string, data: Partial<T>): Promise<FirestoreResult<void>> {
    try {
      const response = await fetch('/api/firestore', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, data }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error };
      }

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  /**
   * Delete document via Next.js API route
   */
  async deleteDocument(path: string): Promise<FirestoreResult<void>> {
    try {
      const response = await fetch(`/api/firestore?path=${encodeURIComponent(path)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error };
      }

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },
};

// Re-export client utilities
export { paginateClientQuery, safeClientOperation } from './client';

// Re-export types
export type { FirestoreClient, FirestoreClientConfig, FirestoreResult } from './client';

// Conditional imports for React hooks (only in client environment)
const { useState, useEffect } = (() => {
  try {
    return require('react');
  } catch {
    // Provide no-op implementations for SSR
    return {
      useState: (initial: any) => [initial, () => {}],
      useEffect: () => {},
    };
  }
})();
