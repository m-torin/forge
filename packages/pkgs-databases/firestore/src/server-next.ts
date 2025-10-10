/**
 * Next.js server-side Firestore client
 * Optimized for Next.js server components and API routes
 */

import 'server-only';
import { createServerClient, type FirestoreClient } from './server';
import type { FirestoreConfig } from './types';

/**
 * Next.js optimized server client with caching and performance improvements
 */
class NextFirestoreClient {
  private static instance: FirestoreClient | null = null;
  private static config: FirestoreConfig | null = null;

  /**
   * Get singleton client instance optimized for Next.js
   */
  static getClient(config?: Partial<FirestoreConfig>): FirestoreClient {
    // Reuse existing client if config hasn't changed
    if (this.instance && (!config || this.isSameConfig(config))) {
      return this.instance;
    }

    // Create new client with Next.js optimizations
    this.instance = createServerClient({
      ...config,
      // Next.js specific optimizations
      databaseId: config?.databaseId || process.env.FIRESTORE_DATABASE_ID || '(default)',
    });

    if (config) {
      this.config = config as FirestoreConfig;
    }

    return this.instance;
  }

  /**
   * Check if configuration has changed
   */
  private static isSameConfig(newConfig: Partial<FirestoreConfig>): boolean {
    if (!this.config) return false;

    const keys: (keyof FirestoreConfig)[] = ['projectId', 'clientEmail', 'databaseId'];
    return keys.every(key => this.config![key] === newConfig[key]);
  }

  /**
   * Reset singleton (useful for testing)
   */
  static reset(): void {
    this.instance = null;
    this.config = null;
  }
}

/**
 * Get Next.js optimized Firestore client
 */
export function getNextFirestore(config?: Partial<FirestoreConfig>): FirestoreClient {
  return NextFirestoreClient.getClient(config);
}

/**
 * Create a new client instance (bypasses singleton)
 */
export function createNextFirestore(config?: Partial<FirestoreConfig>): FirestoreClient {
  return createServerClient(config);
}

/**
 * Next.js specific utilities
 */

/**
 * Cached document fetcher for Next.js
 */
export async function getCachedDocument<T = any>(
  client: FirestoreClient,
  documentPath: string,
  options: {
    revalidate?: number; // Next.js revalidation time
    tags?: string[]; // Next.js cache tags
  } = {},
): Promise<T | null> {
  // Note: In a real implementation, this would use Next.js cache API
  // For now, we'll do a direct fetch
  const doc = await client.doc(documentPath).get();
  return doc.exists() ? ({ id: doc.id, ...doc.data() } as T) : null;
}

/**
 * Cached collection fetcher for Next.js
 */
export async function getCachedCollection<T = any>(
  client: FirestoreClient,
  collectionPath: string,
  options: {
    revalidate?: number;
    tags?: string[];
    where?: Array<[string, any, any]>;
    orderBy?: [string, 'asc' | 'desc'];
    limit?: number;
  } = {},
): Promise<T[]> {
  let query = client.collection(collectionPath);

  // Apply filters
  if (options.where) {
    for (const [field, op, value] of options.where) {
      query = query.where(field, op, value);
    }
  }

  if (options.orderBy) {
    const [field, direction] = options.orderBy;
    query = query.orderBy(field, direction);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
}

/**
 * Server action helper for Firestore operations
 */
export function createFirestoreAction<T extends any[], R>(
  client: FirestoreClient,
  actionFn: (client: FirestoreClient, ...args: T) => Promise<R>,
) {
  return async (...args: T): Promise<R> => {
    'use server';
    return await actionFn(client, ...args);
  };
}

/**
 * Next.js API route helper
 */
export function createFirestoreApiHandler(client: FirestoreClient) {
  return {
    async GET(request: Request) {
      // Extract path from URL
      const url = new URL(request.url);
      const path = url.searchParams.get('path');

      if (!path) {
        return Response.json({ error: 'Path parameter is required' }, { status: 400 });
      }

      try {
        const doc = await client.doc(path).get();
        if (doc.exists()) {
          return Response.json({ id: doc.id, ...doc.data() });
        } else {
          return Response.json({ error: 'Document not found' }, { status: 404 });
        }
      } catch (error) {
        return Response.json({ error: 'Failed to fetch document' }, { status: 500 });
      }
    },

    async POST(request: Request) {
      try {
        const { path, data } = await request.json();

        if (!path || !data) {
          return Response.json({ error: 'Path and data are required' }, { status: 400 });
        }

        await client.doc(path).set(data);
        return Response.json({ success: true });
      } catch (error) {
        return Response.json({ error: 'Failed to create document' }, { status: 500 });
      }
    },

    async PUT(request: Request) {
      try {
        const { path, data } = await request.json();

        if (!path || !data) {
          return Response.json({ error: 'Path and data are required' }, { status: 400 });
        }

        await client.doc(path).update(data);
        return Response.json({ success: true });
      } catch (error) {
        return Response.json({ error: 'Failed to update document' }, { status: 500 });
      }
    },

    async DELETE(request: Request) {
      const url = new URL(request.url);
      const path = url.searchParams.get('path');

      if (!path) {
        return Response.json({ error: 'Path parameter is required' }, { status: 400 });
      }

      try {
        await client.doc(path).delete();
        return Response.json({ success: true });
      } catch (error) {
        return Response.json({ error: 'Failed to delete document' }, { status: 500 });
      }
    },
  };
}

/**
 * Default Next.js Firestore client
 */
export const nextFirestore = getNextFirestore();

// Re-export common server utilities
export { executeBatch, paginateQuery, safeFirestoreOperation } from './server';

// Re-export types
export type { FirestoreClient, FirestoreConfig } from './server';
