/**
 * Next.js client-side Upstash Vector functionality
 * This provides Next.js-specific Vector utilities that are safe for client-side use
 */

import { useCallback, useEffect, useState } from 'react';

('use client');

// Re-export all base client functionality
export * from './client';

// Next.js client-side Vector utilities
export interface VectorClientState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for fetching Vector data on the client side via API routes
 * This provides a pattern for client-side Vector data fetching
 */
export function useVectorData<T>(
  fetcher?: () => Promise<T>,
  options?: {
    refreshInterval?: number;
    revalidateOnFocus?: boolean;
  },
): VectorClientState<T> & { mutate: (data?: T) => void } {
  const [state, setState] = useState<VectorClientState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    if (!fetcher) return;

    try {
      setState((prev: VectorClientState<T>) => ({ ...prev, loading: true, error: null }));
      const data = await fetcher();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState((prev: VectorClientState<T>) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      }));
    }
  }, [fetcher]);

  const mutate = useCallback(
    (data?: T) => {
      if (data !== undefined) {
        setState((prev: VectorClientState<T>) => ({ ...prev, data }));
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
 * Hook for Vector search operations
 */
export function useVectorSearch<T>(
  searchVector?: number[],
  fetcher?: (vector: number[]) => Promise<T[]>,
  options?: {
    topK?: number;
    refreshInterval?: number;
    revalidateOnFocus?: boolean;
  },
) {
  const wrappedFetcher = useCallback(async () => {
    if (!fetcher || !searchVector) return null;
    return await fetcher(searchVector);
  }, [fetcher, searchVector]);

  return useVectorData<T[] | null>(wrappedFetcher, options);
}

/**
 * Hook for Vector similarity search
 */
export function useVectorSimilarity<T>(
  referenceId?: string,
  fetcher?: (id: string) => Promise<T[]>,
  options?: {
    topK?: number;
    threshold?: number;
    refreshInterval?: number;
    revalidateOnFocus?: boolean;
  },
) {
  const wrappedFetcher = useCallback(async () => {
    if (!fetcher || !referenceId) return null;
    return await fetcher(referenceId);
  }, [fetcher, referenceId]);

  return useVectorData<T[] | null>(wrappedFetcher, options);
}

/**
 * Client-side Vector operations state management
 */
export function useVectorOperations() {
  const [operations, setOperations] = useState<
    Array<{
      id: string;
      type: 'upsert' | 'delete' | 'query';
      status: 'pending' | 'success' | 'error';
      timestamp: Date;
      error?: string;
    }>
  >([]);

  const addOperation = useCallback(
    (operation: {
      id: string;
      type: 'upsert' | 'delete' | 'query';
      status: 'pending' | 'success' | 'error';
      error?: string;
    }) => {
      setOperations((prev: any[]) => [...prev, { ...operation, timestamp: new Date() }]);
    },
    [],
  );

  const updateOperation = useCallback(
    (
      id: string,
      updates: {
        status?: 'pending' | 'success' | 'error';
        error?: string;
      },
    ) => {
      setOperations((prev: any[]) =>
        prev.map((op: any) => (op.id === id ? { ...op, ...updates } : op)),
      );
    },
    [],
  );

  const clearOperations = useCallback(() => {
    setOperations([]);
  }, []);

  const getOperationsByStatus = useCallback(
    (status: 'pending' | 'success' | 'error') => {
      return operations.filter((op: any) => op.status === status);
    },
    [operations],
  );

  return {
    operations,
    addOperation,
    updateOperation,
    clearOperations,
    getOperationsByStatus,
    pendingCount: operations.filter((op: any) => op.status === 'pending').length,
    successCount: operations.filter((op: any) => op.status === 'success').length,
    errorCount: operations.filter((op: any) => op.status === 'error').length,
  };
}

/**
 * Client-side Vector validation hooks
 */
export function useVectorValidation() {
  return useCallback(
    (data: {
      id: string;
      vector?: number[];
      metadata?: Record<string, any>;
      data?: string;
    }): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];

      // Validate ID
      if (!data.id || typeof data.id !== 'string') {
        errors.push('ID is required and must be a string');
      } else if (data.id.length > 512) {
        errors.push('ID must be 512 characters or less');
      }

      // Validate vector if provided
      if (data.vector) {
        if (!Array.isArray(data.vector)) {
          errors.push('Vector must be an array of numbers');
        } else if (data.vector.some(val => typeof val !== 'number' || !isFinite(val))) {
          errors.push('Vector must contain only finite numbers');
        }
      }

      // Validate metadata if provided
      if (data.metadata) {
        try {
          const metadataString = JSON.stringify(data.metadata);
          if (metadataString.length > 40 * 1024) {
            errors.push('Metadata must be less than 40KB');
          }
        } catch {
          throw new Error('Metadata must be JSON serializable');
        }
      }

      // Validate data if provided
      if (data.data && typeof data.data !== 'string') {
        errors.push('Data must be a string');
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },
    [],
  );
}

/**
 * Client-side cache utilities for Vector data
 */
export function useVectorCache<T>() {
  const [cache, setCache] = useState<Map<string, { data: T; timestamp: number; ttl: number }>>(
    new Map(),
  );

  const get = useCallback(
    (key: string): T | null => {
      const entry = cache.get(key);
      if (!entry) return null;

      if (Date.now() - entry.timestamp > entry.ttl) {
        setCache((prev: Map<string, any>) => {
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

  const set = useCallback((key: string, data: T, ttl = 5 * 60 * 1000) => {
    setCache((prev: Map<string, any>) => {
      const newCache = new Map(prev);
      newCache.set(key, { data, timestamp: Date.now(), ttl });
      return newCache;
    });
  }, []);

  const remove = useCallback((key: string) => {
    setCache((prev: Map<string, any>) => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
  }, []);

  const clear = useCallback(() => {
    setCache(new Map());
  }, []);

  const size = cache.size;
  const keys = Array.from(cache.keys());

  return { get, set, remove, clear, size, keys };
}

/**
 * Real-time Vector service connection status
 */
export function useVectorConnectionStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  useEffect(() => {
    // This would typically connect to a WebSocket or Server-Sent Events
    // endpoint that monitors Vector service connection status
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/vector/health');
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
 * Vector similarity calculation utilities
 */
export function useVectorSimilarityCalculator() {
  const calculateCosineSimilarity = useCallback((a: number[], b: number[]): number => {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimensions');
    }

    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
  }, []);

  const calculateEuclideanDistance = useCallback((a: number[], b: number[]): number => {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimensions');
    }

    return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
  }, []);

  const normalizeVector = useCallback((vector: number[]): number[] => {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  }, []);

  return {
    calculateCosineSimilarity,
    calculateEuclideanDistance,
    normalizeVector,
  };
}

/**
 * Client-side Vector utilities
 */
export const VectorClientUtils = {
  formatVectorId: (namespace: string, id: string) => `${namespace}:${id}`,
  parseVectorId: (vectorId: string) => {
    const parts = vectorId.split(':');
    return parts.length >= 2 ? { namespace: parts[0], id: parts.slice(1).join(':') } : null;
  },
  isValidVectorId: (id: string) => {
    return typeof id === 'string' && id.length > 0 && id.length <= 512;
  },
  sanitizeVectorId: (id: string) => {
    return id.replace(/[^\w:.-]/g, '_').substring(0, 512);
  },
  validateVectorDimensions: (vector: number[], expectedDimensions: number) => {
    return Array.isArray(vector) && vector.length === expectedDimensions;
  },
} as const;
