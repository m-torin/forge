'use client';

import { useCallback, useState } from 'react';

import { ProductClassificationResult, ProductData } from '../shared/types';
import { BaseAIHookOptions, mergeTransportConfig } from '../shared/types/transport';

export interface UseClassificationOptions extends BaseAIHookOptions {
  onSuccess?: (result: ProductClassificationResult) => void;
}

export interface UseClassificationReturn {
  batchClassify: (products: ProductData[]) => Promise<
    | null
    | {
        error?: string;
        productId: string;
        result: ProductClassificationResult;
      }[]
  >;
  classify: (product: ProductData) => Promise<null | ProductClassificationResult>;
  clear: () => void;
  error: Error | null;
  isClassifying: boolean;
  result: null | ProductClassificationResult;
}

export function useClassification({
  api: apiProp,
  transport,
  onError,
  onRateLimit,
  onSuccess,
  ...options
}: UseClassificationOptions = {}): UseClassificationReturn {
  // Configure transport using shared utility
  const { api, ...transportConfig } = mergeTransportConfig(
    { api: apiProp, transport, ...options },
    '/api/ai/classify',
  );
  const [result, setResult] = useState<null | ProductClassificationResult>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const classify = useCallback(
    async (product: ProductData): Promise<null | ProductClassificationResult> => {
      try {
        setIsClassifying(true);
        setError(null);

        const response = await (transportConfig.fetch || fetch)(api, {
          body: JSON.stringify({
            product,
            ...transportConfig.body,
          }),
          headers: {
            'Content-Type': 'application/json',
            ...(transportConfig.headers || {}),
          },
          credentials: transportConfig.credentials,
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const classificationResult: ProductClassificationResult = await response.json();
        setResult(classificationResult);
        onSuccess?.(classificationResult);

        return classificationResult;
      } catch (error: unknown) {
        const errorObj = error instanceof Error ? error : new Error('Classification failed');
        setError(errorObj);

        // Handle rate limiting
        if (errorObj.message.includes('429') && onRateLimit) {
          const match = errorObj.message.match(/retry after (\d+)/);
          const retryAfter = match ? parseInt(match[1]) : 60;
          onRateLimit(retryAfter);
        }

        onError?.(errorObj);
        return null;
      } finally {
        setIsClassifying(false);
      }
    },
    [api, transportConfig, onSuccess, onError, onRateLimit],
  );

  const batchClassify = useCallback(
    async (
      products: ProductData[],
    ): Promise<
      | null
      | {
          error?: string;
          productId: string;
          result: ProductClassificationResult;
        }[]
    > => {
      try {
        setIsClassifying(true);
        setError(null);

        const response = await (transportConfig.fetch || fetch)(`${api}/batch`, {
          body: JSON.stringify({
            products,
            ...transportConfig.body,
          }),
          headers: {
            'Content-Type': 'application/json',
            ...(transportConfig.headers || {}),
          },
          credentials: transportConfig.credentials,
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const results = await response.json();
        return results;
      } catch (error: unknown) {
        const errorObj = error instanceof Error ? error : new Error('Batch classification failed');
        setError(errorObj);

        // Handle rate limiting
        if (errorObj.message.includes('429') && onRateLimit) {
          const match = errorObj.message.match(/retry after (\d+)/);
          const retryAfter = match ? parseInt(match[1]) : 60;
          onRateLimit(retryAfter);
        }

        onError?.(errorObj);
        return null;
      } finally {
        setIsClassifying(false);
      }
    },
    [api, transportConfig, onError, onRateLimit],
  );

  return {
    batchClassify,
    classify,
    clear,
    error,
    isClassifying,
    result,
  };
}
