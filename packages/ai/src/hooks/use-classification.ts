'use client';

import { useCallback, useState } from 'react';

import { ProductClassificationResult, ProductData } from '../shared/types';

export interface UseClassificationOptions {
  api?: string;
  onError?: (error: Error) => void;
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
  api = '/api/ai/classify',
  onError,
  onSuccess,
}: UseClassificationOptions = {}): UseClassificationReturn {
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
      } catch (error: unknown) {
        const errorObj = error instanceof Error ? error : new Error('Classification failed');
        setError(errorObj);
        onError?.(errorObj);
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
      } catch (error: unknown) {
        const errorObj = error instanceof Error ? error : new Error('Batch classification failed');
        setError(errorObj);
        onError?.(errorObj);
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
