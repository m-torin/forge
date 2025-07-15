/**
 * Next.js client-side Firestore functionality
 * This provides Next.js-specific Firestore utilities that are safe for client-side use
 */

import { useCallback, useEffect, useState } from 'react';

('use client');

// Re-export all base client functionality
export * from './client';

// Next.js client-side Firestore utilities
export interface FirestoreClientState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for fetching Firestore data on the client side via API routes
 * This provides a pattern for client-side Firestore data fetching
 */
export function useFirestoreData<T>(
  collection: string,
  id?: string,
  fetcher?: (collection: string, id?: string) => Promise<T>,
  options?: {
    refreshInterval?: number;
    revalidateOnFocus?: boolean;
  },
): FirestoreClientState<T> & { mutate: (data?: T) => void } {
  const [state, setState] = useState<FirestoreClientState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    if (!fetcher) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await fetcher(collection, id);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      }));
    }
  }, [collection, id, fetcher]);

  const mutate = useCallback(
    (data?: T) => {
      if (data !== undefined) {
        setState(prev => ({ ...prev, data }));
      } else {
        fetchData();
      }
    },
    [fetchData],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh interval
  useEffect(() => {
    if (options?.refreshInterval) {
      const interval = setInterval(fetchData, options.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, options?.refreshInterval]);

  // Revalidate on focus
  useEffect(() => {
    if (options?.revalidateOnFocus) {
      const handleFocus = () => fetchData();
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [fetchData, options?.revalidateOnFocus]);

  return { ...state, mutate };
}

/**
 * Hook for Firestore collection data
 */
export function useFirestoreCollection<T>(
  collection: string,
  fetcher?: (collection: string) => Promise<T[]>,
  options?: {
    refreshInterval?: number;
    revalidateOnFocus?: boolean;
  },
) {
  return useFirestoreData<T[]>(collection, undefined, fetcher, options);
}

/**
 * Hook for Firestore document data
 */
export function useFirestoreDocument<T>(
  collection: string,
  id: string,
  fetcher?: (collection: string, id: string) => Promise<T>,
  options?: {
    refreshInterval?: number;
    revalidateOnFocus?: boolean;
  },
) {
  // Create a wrapper that handles the optional id parameter
  const wrappedFetcher = fetcher
    ? (collection: string, id?: string) => {
        if (!id) throw new Error('Document ID is required');
        return fetcher(collection, id);
      }
    : undefined;

  return useFirestoreData<T>(collection, id, wrappedFetcher, options);
}

/**
 * Client-side Firestore query builder hook
 */
export function useFirestoreQuery<_T>() {
  const [query, setQuery] = useState<{
    collection: string;
    where?: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
    orderBy?: Array<{
      field: string;
      direction: 'asc' | 'desc';
    }>;
    limit?: number;
  } | null>(null);

  const buildQuery = useCallback(() => {
    return {
      collection: (collectionName: string) => {
        setQuery({ collection: collectionName });
        return {
          where: (field: string, operator: string, value: any) => {
            setQuery(prev => ({
              collection: prev?.collection || '',
              ...prev,
              where: [...(prev?.where || []), { field, operator, value }],
            }));
            return buildQuery();
          },
          orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => {
            setQuery(prev => ({
              collection: prev?.collection || '',
              ...prev,
              orderBy: [...(prev?.orderBy || []), { field, direction }],
            }));
            return buildQuery();
          },
          limit: (count: number) => {
            setQuery(prev => ({
              collection: prev?.collection || '',
              ...prev,
              limit: count,
            }));
            return buildQuery();
          },
          get: query,
        };
      },
    };
  }, [query]);

  return buildQuery();
}

/**
 * Client-side Firestore validation
 */
export function useFirestoreValidation() {
  return useCallback((data: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check for undefined values (Firestore doesn't support them)
    const checkForUndefined = (obj: any, path = ''): void => {
      if (obj === undefined) {
        errors.push(`Undefined value at path: ${path}`);
        return;
      }

      if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          checkForUndefined(value, currentPath);
        });
      } else if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          const currentPath = path ? `${path}[${index}]` : `[${index}]`;
          checkForUndefined(item, currentPath);
        });
      }
    };

    checkForUndefined(data);

    // Check document ID if present
    if (data.id && typeof data.id === 'string') {
      if (data.id.length > 1500) {
        errors.push('Document ID must be 1500 characters or less');
      }

      const invalidChars = /[\/\x00-\x1f\x7f]/;
      if (invalidChars.test(data.id)) {
        errors.push('Document ID contains invalid characters');
      }
    }

    // Check field names
    const checkFieldNames = (obj: any, path = ''): void => {
      if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        Object.keys(obj).forEach(key => {
          const currentPath = path ? `${path}.${key}` : key;

          // Field names cannot start with dots or contain certain characters
          if (key.startsWith('.') || key.endsWith('.') || key.includes('..')) {
            errors.push(`Invalid field name at path: ${currentPath}`);
          }

          const invalidChars = /[~*\/\[\]]/;
          if (invalidChars.test(key)) {
            errors.push(`Field name contains invalid characters at path: ${currentPath}`);
          }

          checkFieldNames(obj[key], currentPath);
        });
      }
    };

    checkFieldNames(data);

    return {
      valid: errors.length === 0,
      errors,
    };
  }, []);
}

/**
 * Client-side cache utilities for Firestore
 */
export function useFirestoreCache<T>() {
  const [cache, setCache] = useState<Map<string, { data: T; timestamp: number }>>(new Map());

  const get = useCallback(
    (key: string, ttl = 5 * 60 * 1000): T | null => {
      const entry = cache.get(key);
      if (!entry) return null;

      if (Date.now() - entry.timestamp > ttl) {
        setCache(prev => {
          const newCache = new Map(prev);
          newCache.delete(key);
          return newCache;
        });
        return null;
      }

      return entry.data;
    },
    [cache],
  );

  const set = useCallback((key: string, data: T) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.set(key, { data, timestamp: Date.now() });
      return newCache;
    });
  }, []);

  const remove = useCallback((key: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
  }, []);

  const clear = useCallback(() => {
    setCache(new Map());
  }, []);

  return { get, set, remove, clear };
}

/**
 * Real-time Firestore connection status
 */
export function useFirestoreConnectionStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  useEffect(() => {
    // This would typically connect to a WebSocket or Server-Sent Events
    // endpoint that monitors Firestore connection status
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/firestore/health');
        if (response.ok) {
          setStatus('connected');
        } else {
          setStatus('disconnected');
        }
      } catch {
        setStatus('disconnected');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return status;
}

/**
 * Optimistic updates hook for Firestore
 */
export function useFirestoreOptimisticUpdates<T>() {
  const [optimisticData, setOptimisticData] = useState<Map<string, T>>(new Map());

  const addOptimisticUpdate = useCallback((key: string, data: T) => {
    setOptimisticData(prev => {
      const newMap = new Map(prev);
      newMap.set(key, data);
      return newMap;
    });
  }, []);

  const removeOptimisticUpdate = useCallback((key: string) => {
    setOptimisticData(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  const getOptimisticData = useCallback(
    (key: string): T | undefined => {
      return optimisticData.get(key);
    },
    [optimisticData],
  );

  const clearOptimisticUpdates = useCallback(() => {
    setOptimisticData(new Map());
  }, []);

  return {
    addOptimisticUpdate,
    removeOptimisticUpdate,
    getOptimisticData,
    clearOptimisticUpdates,
    optimisticData: Array.from(optimisticData.entries()),
  };
}

/**
 * Client-side Firestore utilities
 */
export const FirestoreClientUtils = {
  formatDocumentPath: (collection: string, id: string) => `${collection}/${id}`,
  parseDocumentPath: (path: string) => {
    const parts = path.split('/');
    return parts.length >= 2 ? { collection: parts[0], id: parts.slice(1).join('/') } : null;
  },
  isValidDocumentId: (id: string) => {
    if (!id || typeof id !== 'string') return false;
    if (id.length === 0 || id.length > 1500) return false;
    const invalidChars = /[\/\x00-\x1f\x7f]/;
    return !invalidChars.test(id);
  },
  isValidFieldPath: (path: string) => {
    if (!path || typeof path !== 'string') return false;
    if (path.startsWith('.') || path.endsWith('.') || path.includes('..')) return false;
    const invalidChars = /[~*\/\[\]]/;
    return !invalidChars.test(path);
  },
  sanitizeDocumentId: (id: string) => {
    return id.replace(/[\/\x00-\x1f\x7f]/g, '_').substring(0, 1500);
  },
  sanitizeFieldPath: (path: string) => {
    return path
      .replace(/[~*\/\[\]]/g, '_')
      .replace(/^\.+|\.+$/g, '')
      .replace(/\.{2,}/g, '.');
  },
} as const;
