'use client';

import { useCallback, useState } from 'react';

import type { ProductClassificationResult, ProductData } from '../shared/types';

export interface UseClassificationOptions {
  api?: string;
  onError?: (error: Error) => void;
  onSuccess?: (result: ProductClassificationResult) => void;
}

export interface UseClassificationReturn {
  batchClassify: (products: ProductData[]) => Promise<
    | {
        productId: string;
        result: ProductClassificationResult;
        error?: string;
      }[]
    | null
  >;
  classify: (product: ProductData) => Promise<ProductClassificationResult | null>;
  clear: () => void;
  error: Error | null;
  isClassifying: boolean;
  result: ProductClassificationResult | null;
}

export function useClassification({
  api = '/api/ai/classify',
  onError,
  onSuccess,
}: UseClassificationOptions = {}): UseClassificationReturn {
  const [result, setResult] = useState<ProductClassificationResult | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const classify = useCallback(
    async (product: ProductData): Promise<ProductClassificationResult | null> => {
      try {
        setIsClassifying(true);
        setError(null);

        const response = await fetch(api, {
          body: JSON.stringify({ product }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const classificationResult: ProductClassificationResult = await response.json();
        setResult(classificationResult);
        onSuccess?.(classificationResult);

        return classificationResult;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Classification failed');
        setError(error);
        onError?.(error);
        return null;
      } finally {
        setIsClassifying(false);
      }
    },
    [api, onSuccess, onError],
  );

  const batchClassify = useCallback(
    async (
      products: ProductData[],
    ): Promise<
      | {
          productId: string;
          result: ProductClassificationResult;
          error?: string;
        }[]
      | null
    > => {
      try {
        setIsClassifying(true);
        setError(null);

        const response = await fetch(`${api}/batch`, {
          body: JSON.stringify({ products }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const results = await response.json();
        return results;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Batch classification failed');
        setError(error);
        onError?.(error);
        return null;
      } finally {
        setIsClassifying(false);
      }
    },
    [api, onError],
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
