'use client';

import { useChat as useVercelChat } from 'ai/react';
import { useCallback } from 'react';

import { models } from '../lib/models';

import type { CreateMessage, Message, UseChatOptions } from 'ai/react';

export interface UseAIChatOptions extends Omit<UseChatOptions, 'api'> {
  api?: string;
  onRateLimit?: (retryAfter: number) => void;
  onTokenUsage?: (usage: { prompt: number; completion: number; total: number }) => void;
}

export function useAIChat({
  api = '/api/chat',
  onError,
  onFinish,
  onRateLimit,
  onTokenUsage,
  ...options
}: UseAIChatOptions = {}) {
  const chat = useVercelChat({
    api,
    onError: (error) => {
      // Handle rate limiting
      if (error.message?.includes('429') && onRateLimit) {
        const retryAfter = parseInt(error.message.match(/retry after (\d+)/)?.[1] || '60');
        onRateLimit(retryAfter);
      }
      onError?.(error);
    },
    onFinish: (message, options) => {
      // Extract token usage if available
      if (options && 'usage' in options && onTokenUsage) {
        onTokenUsage(options.usage as any);
      }
      onFinish?.(message, options);
    },
    streamProtocol: 'text',
    ...options,
  });

  // Enhanced append with retry logic
  const appendWithRetry = useCallback(
    async (message: Message | CreateMessage, retries = 3): Promise<void> => {
      try {
        await chat.append(message);
      } catch (error) {
        if (retries > 0 && error instanceof Error && error.message.includes('429')) {
          // Wait and retry on rate limit
          const delay = parseInt(error.message.match(/retry after (\d+)/)?.[1] || '5') * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
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
      chat.append(lastUserMessage);
    }
  }, [chat]);

  return {
    ...chat,
    appendWithRetry,
    clear,
    model: models.chat,
    regenerate,
  };
}
