'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSignedMediaUrl } from '../actions/media-url';

interface UseSignedMediaUrlOptions {
  context?: 'product' | 'user' | 'admin' | 'public';
  expiresIn?: number;
  enabled?: boolean;
}

/**
 * Hook to manage signed URLs for media with automatic refresh before expiration
 *
 * @param storageKey - The storage key for the media
 * @param options - Options for the signed URL
 * @returns Object with url, loading state, error, and refresh function
 */
export function useSignedMediaUrl(
  storageKey: string | undefined,
  options: UseSignedMediaUrlOptions = {},
) {
  const { context = 'admin', expiresIn = 7200, enabled = true } = options;
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expirationTime, setExpirationTime] = useState<Date | null>(null);

  const refreshUrl = useCallback(async () => {
    if (!storageKey || !enabled) return;

    try {
      setLoading(true);
      setError(null);

      const result = await getSignedMediaUrl(storageKey, {
        context,
        expiresIn,
      });

      if (result.success) {
        setUrl(result.data);
        // Calculate expiration time (slightly before actual expiration for safety)
        const safetyBuffer = Math.min(300, expiresIn * 0.1); // 10% or 5 minutes, whichever is less
        const expiresAt = new Date(Date.now() + (expiresIn - safetyBuffer) * 1000);
        setExpirationTime(expiresAt);
      } else {
        setError(result.error || 'Failed to get signed URL');
        setUrl(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get signed URL');
      setUrl(null);
    } finally {
      setLoading(false);
    }
  }, [storageKey, context, expiresIn, enabled]);

  // Initial load
  useEffect(() => {
    refreshUrl();
  }, [refreshUrl]);

  // Set up auto-refresh before expiration
  useEffect(() => {
    if (!expirationTime || !enabled) return;

    const timeUntilExpiration = expirationTime.getTime() - Date.now();
    if (timeUntilExpiration <= 0) {
      // Already expired, refresh immediately
      refreshUrl();
      return;
    }

    // Set timeout to refresh before expiration
    const refreshTimer = setTimeout(() => {
      refreshUrl();
    }, timeUntilExpiration);

    return () => clearTimeout(refreshTimer);
  }, [expirationTime, refreshUrl, enabled]);

  return {
    url,
    loading,
    error,
    refresh: refreshUrl,
    expiresAt: expirationTime,
  };
}

/**
 * Hook to manage multiple signed URLs at once
 * Useful for lists of media items
 */
export function useSignedMediaUrls(
  storageKeys: Array<{ key: string; context?: 'product' | 'user' | 'admin' | 'public' }>,
  options: Omit<UseSignedMediaUrlOptions, 'context'> = {},
) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const refreshUrls = useCallback(async () => {
    if (options.enabled === false) return;

    try {
      setLoading(true);
      const newUrls: Record<string, string> = {};
      const newErrors: Record<string, string> = {};

      // Batch requests for better performance
      const results = await Promise.allSettled(
        storageKeys.map(async ({ key, context = 'admin' }) => {
          const result = await getSignedMediaUrl(key, {
            context,
            expiresIn: options.expiresIn || 7200,
          });
          return { key, result };
        }),
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { key, result: urlResult } = result.value;
          if (urlResult.success) {
            newUrls[key] = urlResult.data;
          } else {
            newErrors[key] = urlResult.error || 'Failed to get URL';
          }
        } else {
          // Extract key from the rejected promise if possible
          console.error('Failed to get signed URL:', result.reason);
        }
      });

      setUrls(newUrls);
      setErrors(newErrors);
    } catch (err) {
      console.error('Failed to refresh URLs:', err);
    } finally {
      setLoading(false);
    }
  }, [storageKeys, options.expiresIn, options.enabled]);

  useEffect(() => {
    refreshUrls();
  }, [refreshUrls]);

  return {
    urls,
    loading,
    errors,
    refresh: refreshUrls,
  };
}
