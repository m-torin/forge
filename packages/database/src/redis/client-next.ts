/**
 * Next.js client-side Redis functionality
 * This provides Next.js-specific Redis utilities that are safe for client-side use
 */

import { useCallback, useEffect, useState } from 'react';

('use client');

// Re-export all base client functionality
export * from './client';

// Next.js client-side Redis utilities
export interface RedisClientState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for fetching Redis data on the client side via API routes
 * This provides a pattern for client-side Redis data fetching
 */
export function useRedisData<T>(
  key: string,
  fetcher?: (key: string) => Promise<T>,
  options?: {
    refreshInterval?: number;
    revalidateOnFocus?: boolean;
  },
): RedisClientState<T> & { mutate: (data?: T) => void } {
  const [state, setState] = useState<RedisClientState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    if (!fetcher) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await fetcher(key);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      }));
    }
  }, [key, fetcher]);

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
 * Hook for Redis hash data
 */
export function useRedisHash(
  key: string,
  fetcher?: (key: string) => Promise<Record<string, any>>,
  options?: {
    refreshInterval?: number;
    revalidateOnFocus?: boolean;
  },
) {
  return useRedisData<Record<string, any>>(key, fetcher, options);
}

/**
 * Hook for Redis list data
 */
export function useRedisList(
  key: string,
  fetcher?: (key: string) => Promise<any[]>,
  options?: {
    refreshInterval?: number;
    revalidateOnFocus?: boolean;
  },
) {
  return useRedisData<any[]>(key, fetcher, options);
}

/**
 * Client-side Redis key validation
 */
export function useRedisKeyValidation() {
  return useCallback((key: string): { valid: boolean; error?: string } => {
    if (!key || typeof key !== 'string') {
      return { valid: false, error: 'Key must be a non-empty string' };
    }

    if (key.length > 512) {
      return { valid: false, error: 'Key must be 512 characters or less' };
    }

    if (key.includes('\n') || key.includes('\r')) {
      return { valid: false, error: 'Key cannot contain newline characters' };
    }

    return { valid: true };
  }, []);
}

/**
 * Client-side Redis pattern matching
 */
export function useRedisPatternMatcher() {
  return useCallback((pattern: string, key: string): boolean => {
    // Simple pattern matching for client-side validation
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
      .replace(/\[([^\]]+)\]/g, '[$1]');

    try {
      // eslint-disable-next-line security/detect-non-literal-regexp -- Pattern is user-provided for Redis pattern matching
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(key);
    } catch {
      throw new Error('Invalid Redis pattern');
    }
  }, []);
}

/**
 * Client-side cache utilities
 */
export function useClientCache<T>() {
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
 * Redis feature flag hook for client-side
 */
export function useFeatureFlag(
  flagName: string,
  defaultValue = false,
  fetcher?: (flagName: string) => Promise<boolean>,
) {
  const { data, loading, error } = useRedisData<boolean>(
    `feature_flag:${flagName}`,
    fetcher,
    { refreshInterval: 60000 }, // Refresh every minute
  );

  return {
    enabled: data ?? defaultValue,
    loading,
    error,
  };
}

/**
 * Real-time Redis connection status
 */
export function useRedisConnectionStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  useEffect(() => {
    // This would typically connect to a WebSocket or Server-Sent Events
    // endpoint that monitors Redis connection status
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/redis/health');
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
 * Client-side Redis utilities
 */
export const RedisClientUtils = {
  formatKey: (collection: string, id: string) => `${collection}:${id}`,
  parseKey: (key: string) => {
    const parts = key.split(':');
    return parts.length >= 2 ? { collection: parts[0], id: parts.slice(1).join(':') } : null;
  },
  isValidKey: (key: string) => {
    return typeof key === 'string' && key.length > 0 && key.length <= 512;
  },
  sanitizeKey: (key: string) => {
    return key.replace(/[^\w:.-]/g, '_').substring(0, 512);
  },
} as const;
