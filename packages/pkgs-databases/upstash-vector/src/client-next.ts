/**
 * Next.js client-side Upstash Vector functionality
 * Optimized for Next.js client components with SSR support
 */

'use client';

import { createClientOperations, type ClientVectorOperations } from './client';
import type {
  SimilarityResult,
  SimilaritySearchOptions,
  UpstashVectorConfig,
  VectorRecord,
  VectorResult,
} from './types';

/**
 * Next.js client-side Vector client with SSR optimization
 */
class NextVectorClient {
  private static instance: ClientVectorOperations | null = null;
  private static initialized = false;

  /**
   * Get client instance with Next.js optimizations
   */
  static getClient(config?: Partial<UpstashVectorConfig>): ClientVectorOperations | null {
    // Return null during SSR
    if (typeof window === 'undefined') {
      return null;
    }

    if (!this.instance && !this.initialized) {
      this.initialized = true;

      try {
        this.instance = createClientOperations({
          // Default Next.js client config from environment
          url: process.env.NEXT_PUBLIC_UPSTASH_VECTOR_REST_URL,
          token: process.env.NEXT_PUBLIC_UPSTASH_VECTOR_REST_TOKEN,
          ...config,
        });
      } catch (error) {
        console.error('Failed to initialize Next.js Vector client:', error);
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
 * Hook for using Upstash Vector in Next.js client components
 */
export function useVector(config?: Partial<UpstashVectorConfig>) {
  const client = NextVectorClient.getClient(config);

  return {
    client,
    isReady: client !== null,
    isSSR: typeof window === 'undefined',
  };
}

/**
 * Get Next.js client-side Vector instance
 */
export function getNextClientVector(
  config?: Partial<UpstashVectorConfig>,
): ClientVectorOperations | null {
  return NextVectorClient.getClient(config);
}

/**
 * React hook for vector search with state management
 */
export function useVectorSearch<T = any>(config?: Partial<UpstashVectorConfig>) {
  const { client, isReady, isSSR } = useVector(config);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SimilarityResult<T>[]>([]);

  const search = async (
    vector: number[],
    options?: SimilaritySearchOptions & { useCache?: boolean },
  ): Promise<VectorResult<SimilarityResult<T>[]>> => {
    if (!client || isSSR) {
      const errorMsg = 'Vector client not available';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setLoading(true);
    setError(null);

    try {
      const searchResults = await client.cachedSimilaritySearch<T>(vector, options);
      setResults(searchResults);
      setLoading(false);
      return { success: true, data: searchResults };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return { search, results, loading, error, clearResults };
}

/**
 * Hook for vector mutations with optimistic updates
 */
export function useVectorMutation<T = any>(config?: Partial<UpstashVectorConfig>) {
  const { client } = useVector(config);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (
    operation: (client: ClientVectorOperations) => Promise<T>,
    options?: {
      optimisticUpdate?: () => void;
      onSuccess?: (result: T) => void;
      onError?: (error: string) => void;
    },
  ): Promise<VectorResult<T>> => {
    if (!client) {
      const errorMsg = 'Vector client not available';
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
 * Hook for batch vector operations with progress
 */
export function useBatchVectorOperations(config?: Partial<UpstashVectorConfig>) {
  const { client } = useVector(config);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const batchUpsert = async <T = any>(
    vectors: VectorRecord<T>[],
    options?: { batchSize?: number },
  ): Promise<VectorResult<void>> => {
    if (!client) {
      const errorMsg = 'Vector client not available';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setLoading(true);
    setError(null);
    setProgress({ completed: 0, total: vectors.length });

    try {
      await client.batchUpsert(vectors, {
        batchSize: options?.batchSize,
        onProgress: (completed, total) => {
          setProgress({ completed, total });
        },
      });

      setLoading(false);
      return { success: true, data: undefined };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  return { batchUpsert, loading, progress, error };
}

/**
 * Next.js API route helpers for client-side integration
 */
export const vectorApi = {
  /**
   * Search vectors via Next.js API route
   */
  async searchVectors<T = any>(
    vector: number[],
    options?: SimilaritySearchOptions,
  ): Promise<VectorResult<SimilarityResult<T>[]>> {
    try {
      const response = await fetch('/api/vector/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vector, ...options }),
      });

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
   * Upsert vectors via Next.js API route
   */
  async upsertVectors<T = any>(vectors: VectorRecord<T>[]): Promise<VectorResult<void>> {
    try {
      const response = await fetch('/api/vector/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vectors }),
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
   * Generate embeddings via Next.js API route
   */
  async generateEmbeddings(
    text: string | string[],
    options?: { model?: string; provider?: string },
  ): Promise<VectorResult<{ embeddings: number[][]; model: string; dimensions: number }>> {
    try {
      const response = await fetch('/api/vector/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, ...options }),
      });

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
   * Delete vectors via Next.js API route
   */
  async deleteVectors(ids: string[], namespace?: string): Promise<VectorResult<void>> {
    try {
      const response = await fetch('/api/vector/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, namespace }),
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

/**
 * Vector similarity utilities for client-side use
 */
export { vectorUtils } from './client';

/**
 * Local storage utilities for vector caching
 */
export const vectorStorage = {
  /**
   * Save search results to localStorage
   */
  saveSearchResults<T = any>(key: string, results: SimilarityResult<T>[], ttlMinutes = 60): void {
    if (typeof localStorage === 'undefined') return;

    const data = {
      results,
      expiry: Date.now() + ttlMinutes * 60 * 1000,
    };

    try {
      localStorage.setItem(`vector_search_${key}`, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  /**
   * Load search results from localStorage
   */
  loadSearchResults<T = any>(key: string): SimilarityResult<T>[] | null {
    if (typeof localStorage === 'undefined') return null;

    try {
      const item = localStorage.getItem(`vector_search_${key}`);
      if (!item) return null;

      const data = JSON.parse(item);
      if (Date.now() > data.expiry) {
        localStorage.removeItem(`vector_search_${key}`);
        return null;
      }

      return data.results;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return null;
    }
  },

  /**
   * Clear all cached search results
   */
  clearCache(): void {
    if (typeof localStorage === 'undefined') return;

    const keys = Object.keys(localStorage).filter(key => key.startsWith('vector_search_'));

    keys.forEach(key => localStorage.removeItem(key));
  },
};

// Re-export client utilities
export { safeClientOperation } from './client';

// Re-export types
export type {
  SimilarityResult,
  SimilaritySearchOptions,
  UpstashVectorConfig,
  VectorRecord,
  VectorResult,
} from './client';

// Conditional imports for React hooks (only in client environment)
const { useState } = (() => {
  try {
    return require('react');
  } catch {
    // Provide no-op implementations for SSR
    return {
      useState: (initial: any) => [initial, () => {}],
    };
  }
})();
