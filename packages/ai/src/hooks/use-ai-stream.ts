'use client';

import { useCallback, useRef, useState } from 'react';

import { StreamChunk } from '../shared/types';

export interface UseAIStreamOptions {
  api?: string;
  onChunk?: (chunk: StreamChunk) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
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
  api = '/api/ai/stream',
  onChunk,
  onComplete,
  onError,
}: UseAIStreamOptions = {}): UseAIStreamReturn {
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

        const response = await fetch(api, {
          body: JSON.stringify({
            prompt,
            ...options,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
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
                } catch (error) {
                  // eslint-disable-next-line no-console
                  console.error('Failed to parse chunk: ', data);
                }
              }
            }
          }

          onComplete?.(fullText);
        } finally {
          reader.releaseLock();
        }
      } catch (error: any) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
        if (errorObj.name !== 'AbortError') {
          setError(errorObj);
          onError?.(errorObj);
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [api, onChunk, onComplete, onError],
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
