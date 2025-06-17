/**
 * React hooks for Next.js integration
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ExtractedData, ScrapeOptions, ScrapeResult, SelectorMap } from '../shared/types';

export interface UseExtractReturn {
  data: ExtractedData | null;
  error: Error | null;
  extract: (html: string, selectors: SelectorMap, provider?: string) => Promise<void>;
  loading: boolean;
  reset: () => void;
}

export interface UseMultiScrapeOptions {
  concurrent?: number;
  onError?: (error: Error) => void;
  onProgress?: (completed: number, total: number) => void;
  onResult?: (result: ScrapeResult, index: number) => void;
}

export interface UseMultiScrapeReturn {
  error: Error | null;
  loading: boolean;
  progress: { completed: number; total: number };
  reset: () => void;
  results: ScrapeResult[];
  scrapeMultiple: (urls: string[], options?: ScrapeOptions) => Promise<void>;
}

export interface UseScrapeOptions {
  immediate?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (result: ScrapeResult) => void;
  retries?: number;
  retryDelay?: number;
}

export interface UseScrapeReturn {
  data: null | ScrapeResult;
  error: Error | null;
  loading: boolean;
  reset: () => void;
  scrape: (url: string, options?: ScrapeOptions) => Promise<void>;
}

/**
 * Hook for extracting data from HTML
 */
export function useExtract(): UseExtractReturn {
  const [data, setData] = useState<ExtractedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const extract = useCallback(async (html: string, selectors: SelectorMap, provider?: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/extract', {
        body: JSON.stringify({ html, provider, selectors }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message ?? `HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!controller.signal.aborted) {
        setData(result);
        setLoading(false);
      }
    } catch (error: any) {
      if (!controller.signal.aborted) {
        setError(error instanceof Error ? error : new Error(String(error)));
        setLoading(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { data, error, extract, loading, reset };
}

/**
 * Hook for scraping multiple URLs
 */
export function useMultiScrape(options: UseMultiScrapeOptions = {}): UseMultiScrapeReturn {
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrapeMultiple = useCallback(
    async (urls: string[], scrapeOptions: ScrapeOptions = {}) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);
      setResults([]);
      setProgress({ completed: 0, total: urls.length });

      try {
        const response = await fetch('/api/scrape-multiple', {
          body: JSON.stringify({
            concurrent: options.concurrent ?? 5,
            options: scrapeOptions,
            urls,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message ?? `HTTP ${response.status}`);
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          if (controller.signal.aborted) return;

          buffer += decoder.decode(value, { stream: true });

          // Process complete JSON objects
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? ''; // Keep incomplete line

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);

                if (data.type === 'result') {
                  setResults((prev: any) => [...prev, data.result]);
                  setProgress((prev: any) => ({ ...prev, completed: prev.completed + 1 }));

                  if (options.onProgress) {
                    options.onProgress(data.index + 1, urls.length);
                  }

                  if (options.onResult) {
                    options.onResult(data.result, data.index);
                  }
                } else if (data.type === 'error') {
                  if (options.onError) {
                    options.onError(new Error(data.message));
                  }
                }
              } catch {
                // eslint-disable-next-line no-console
                console.warn('Failed to parse response line: ', line);
              }
            }
          }
        }

        setLoading(false);
      } catch (error: any) {
        if (!controller.signal.aborted) {
          const errorObj = error instanceof Error ? error : new Error(String(error));
          setError(errorObj);
          setLoading(false);

          if (options.onError) {
            options.onError(errorObj);
          }
        }
      }
    },
    [options],
  );

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setResults([]);
    setLoading(false);
    setError(null);
    setProgress({ completed: 0, total: 0 });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { error, loading, progress, reset, results, scrapeMultiple };
}

/**
 * Hook for scraping a single URL
 */
export function useScrape(options: UseScrapeOptions = {}): UseScrapeReturn {
  const [data, setData] = useState<null | ScrapeResult>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrape = useCallback(
    async (url: string, scrapeOptions: ScrapeOptions = {}) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);

      let attempt = 0;
      const maxAttempts = (options.retries ?? 0) + 1;

      while (attempt < maxAttempts) {
        try {
          const response = await fetch('/api/scrape', {
            body: JSON.stringify({ options: scrapeOptions, url }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
            signal: controller.signal,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message ?? `HTTP ${response.status}`);
          }

          const result = await response.json();

          if (!controller.signal.aborted) {
            setData(result);
            setLoading(false);

            if (options.onSuccess) {
              options.onSuccess(result);
            }
          }

          return;
        } catch (error: any) {
          if (controller.signal.aborted) {
            return;
          }

          attempt++;

          if (attempt >= maxAttempts) {
            const errorObj = error instanceof Error ? error : new Error(String(error));
            setError(errorObj);
            setLoading(false);

            if (options.onError) {
              options.onError(errorObj);
            }
            return;
          }

          // Wait before retry
          if (options.retryDelay) {
            await new Promise((resolve: any) => setTimeout(resolve, options.retryDelay));
          }
        }
      }
    },
    [options],
  );

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { data, error, loading, reset, scrape };
}

/**
 * Hook for real-time scraping status
 */
export function useScrapeStatus() {
  const [status, setStatus] = useState<{
    activeJobs: number;
    isActive: boolean;
    lastUpdate: Date | null;
    queueSize: number;
  }>({ activeJobs: 0, isActive: false, lastUpdate: null, queueSize: 0 });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/scrape-status');
        if (response.ok) {
          const statusData = await response.json();
          setStatus({
            ...statusData,
            lastUpdate: new Date(),
          });
        }
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch scrape status: ', error);
      }
    };

    // Initial fetch
    void fetchStatus();

    // Poll every 5 seconds
    const interval = setInterval(() => {
      void fetchStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return status;
}
