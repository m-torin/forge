'use client';

import { useCallback, useState } from 'react';

import { ModerationResult } from '../shared/types';

export interface UseModerationOptions {
  api?: string;
  onError?: (error: Error) => void;
  onResult?: (result: ModerationResult) => void;
}

export interface UseModerationReturn {
  clear: () => void;
  error: Error | null;
  isModerating: boolean;
  moderate: (content: string) => Promise<ModerationResult | null>;
  result: ModerationResult | null;
}

export function useModeration({
  api = '/api/ai/moderate',
  onError,
  onResult,
}: UseModerationOptions = {}): UseModerationReturn {
  const [result, setResult] = useState<ModerationResult | null>(null);
  const [isModerating, setIsModerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const moderate = useCallback(
    async (content: string): Promise<ModerationResult | null> => {
      try {
        setIsModerating(true);
        setError(null);

        const response = await fetch(api, {
          body: JSON.stringify({ content }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const moderationResult: ModerationResult = await response.json();
        setResult(moderationResult);
        onResult?.(moderationResult);

        return moderationResult;
      } catch (error: any) {
        const errorObj = error instanceof Error ? error : new Error('Moderation failed');
        setError(errorObj);
        onError?.(errorObj);
        return null;
      } finally {
        setIsModerating(false);
      }
    },
    [api, onResult, onError],
  );

  return {
    clear,
    error,
    isModerating,
    moderate,
    result,
  };
}
