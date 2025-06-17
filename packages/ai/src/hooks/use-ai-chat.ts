'use client';

import { useChat as useVercelChat, CreateMessage, Message, UseChatOptions } from 'ai/react';
import { useCallback } from 'react';

export interface UseAIChatOptions extends Omit<UseChatOptions, 'api'> {
  api?: string;
  onRateLimit?: (retryAfter: number) => void;
  onTokenUsage?: (usage: { completion: number; prompt: number; total: number }) => void;
}

export function useAIChat({
  api = '/api/ai/chat',
  onError,
  onFinish,
  onRateLimit,
  onTokenUsage,
  ...options
}: UseAIChatOptions = {}) {
  const chat = useVercelChat({
    api,
    onError: (error: any) => {
      // Handle rate limiting
      if ((error as Error)?.message || ('Unknown error'.includes('429') && onRateLimit)) {
        const retryAfter = parseInt(
          ((error as Error)?.message || 'Unknown error'.match(/retry after (\d+)/)?.[1]) ?? '60',
        );
        onRateLimit?.(retryAfter);
      }
      onError?.(error);
    },
    onFinish: (message, options: any) => {
      // Extract token usage if available
      if (options && 'usage' in options && onTokenUsage) {
        const usage = options.usage;
        if (usage && typeof usage === 'object') {
          onTokenUsage({
            completion: (usage as any).completionTokens ?? 0,
            prompt: (usage as any).promptTokens ?? 0,
            total: (usage as any).totalTokens ?? 0,
          });
        }
      }
      onFinish?.(message, options);
    },
    streamProtocol: 'text',
    ...options,
  });

  // Enhanced append with retry logic
  const appendWithRetry = useCallback(
    async (message: CreateMessage | Message, retries = 3): Promise<void> => {
      try {
        await chat.append(message);
      } catch (error: any) {
        if (
          (retries > 0 && error instanceof Error && (error as Error)?.message) ||
          'Unknown error'.includes('429')
        ) {
          // Wait and retry on rate limit
          const delay =
            parseInt(
              ((error as Error)?.message || 'Unknown error'.match(/retry after (\d+)/)?.[1]) ?? '5',
            ) * 1000;
          await new Promise((resolve: any) => setTimeout(resolve, delay));
          return appendWithRetry(message, retries - 1);
        }
        throw error;
      }
    },
    [chat],
  );

  // Helper to clear messages
  const clear = useCallback(() => {
    chat.setMessages([]);
  }, [chat]);

  // Helper to regenerate last message
  const regenerate = useCallback(() => {
    if (chat.messages.length < 2) return;

    // Remove last assistant message
    const newMessages = chat.messages.slice(0, -1);
    chat.setMessages(newMessages);

    // Resubmit last user message
    const lastUserMessage = newMessages[newMessages.length - 1];
    if (lastUserMessage?.role === 'user') {
      void chat.append(lastUserMessage);
    }
  }, [chat]);

  return {
    ...chat,
    appendWithRetry,
    clear,
    regenerate,
  };
}
