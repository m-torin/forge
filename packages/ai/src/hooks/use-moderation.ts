'use client';

import { useCallback, useState } from 'react';

import { ModerationResult } from '../shared/types';
import { BaseAIHookOptions, mergeTransportConfig } from '../shared/types/transport';

export interface UseModerationOptions extends BaseAIHookOptions {
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
  api: apiProp,
  transport,
  onError,
  onRateLimit,
  onResult,
  ...options
}: UseModerationOptions = {}): UseModerationReturn {
  // Configure transport using shared utility
  const { api, ...transportConfig } = mergeTransportConfig(
    { api: apiProp, transport, ...options },
    '/api/ai/moderate',
  );
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

        const response = await (transportConfig.fetch || fetch)(api, {
          body: JSON.stringify({
            content,
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

        const moderationResult: ModerationResult = await response.json();
        setResult(moderationResult);
        onResult?.(moderationResult);

        return moderationResult;
      } catch (error: unknown) {
        const errorObj = error instanceof Error ? error : new Error('Moderation failed');
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
        setIsModerating(false);
      }
    },
    [api, transportConfig, onResult, onError, onRateLimit],
  );

  return {
    clear,
    error,
    isModerating,
    moderate,
    result,
  };
}
