'use client';

import { useCallback, useRef, useState } from 'react';

import { StreamChunk } from '../shared/types';
import { BaseAIHookOptions, mergeTransportConfig } from '../shared/types/transport';

export interface UseAIStreamOptions extends BaseAIHookOptions {
  onChunk?: (chunk: StreamChunk) => void;
  onComplete?: (fullText: string) => void;
}

export interface UseAIStreamReturn {
  clear: () => void;
  error: Error | null;
  isStreaming: boolean;
  stop: () => void;
  stream: (
    prompt: string,
    options?: { systemPrompt?: string; temperature?: number },
  ) => Promise<void>;
  text: string;
}

export function useAIStream({
  api: apiProp,
  transport,
  onChunk,
  onComplete,
  onError,
  onRateLimit,
  ...options
}: UseAIStreamOptions = {}): UseAIStreamReturn {
  // Configure transport using shared utility
  const { api, ...transportConfig } = mergeTransportConfig(
    { api: apiProp, transport, ...options },
    '/api/ai/stream',
  );
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  const clear = useCallback(() => {
    setText('');
    setError(null);
  }, []);

  const stream = useCallback(
    async (prompt: string, options?: { systemPrompt?: string; temperature?: number }) => {
      try {
        setIsStreaming(true);
        setError(null);
        setText('');

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        const response = await (transportConfig.fetch || fetch)(api, {
          body: JSON.stringify({
            prompt,
            ...options,
            ...transportConfig.body,
          }),
          headers: {
            'Content-Type': 'application/json',
            ...(transportConfig.headers || {}),
          },
          credentials: transportConfig.credentials,
          method: 'POST',
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No readable stream available');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';

        try {
          while (!abortControllerRef.current?.signal.aborted) {
            const { done, value } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');

            // Keep the last incomplete line in buffer
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);

                if (data === '[DONE]') {
                  break;
                }

                try {
                  const chunk: StreamChunk = JSON.parse(data);
                  fullText += chunk.text;
                  setText(fullText);

                  onChunk?.(chunk);
                } catch (_parseError) {
                  // Failed to parse stream chunk - silently continue
                  // TODO: Add proper error logging via observability package
                }
              }
            }
          }

          onComplete?.(fullText);
        } finally {
          reader.releaseLock();
        }
      } catch (error) {
        const errorObj = error as Error;
        setError(errorObj);
        setIsStreaming(false);

        // Handle rate limiting
        if (errorObj.message.includes('429') && onRateLimit) {
          const match = errorObj.message.match(/retry after (\d+)/);
          const retryAfter = match ? parseInt(match[1]) : 60;
          onRateLimit(retryAfter);
        }

        onError?.(errorObj);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [api, transportConfig, onChunk, onComplete, onError, onRateLimit],
  );

  return {
    clear,
    error,
    isStreaming,
    stop,
    stream,
    text,
  };
}
