'use client';

import { useChat as useVercelChat } from '@ai-sdk/react';
import { logWarn } from '@repo/observability';
import { useCallback, useEffect } from 'react';

// Import the exact types from AI SDK v5
export interface UseAIChatOptions {
  api?: string;
  id?: string;
  initialInput?: string;
  initialMessages?: any[];
  headers?: Record<string, string> | Headers;
  body?: any;
  credentials?: 'omit' | 'same-origin' | 'include';
  maxSteps?: number;
  streamProtocol?: 'text' | 'data';
  generateId?: () => string;
  fetch?: typeof globalThis.fetch;

  // Custom callback options that we implement manually
  onRateLimit?: (retryAfter: number) => void;
  onTokenUsage?: (usage: { completion: number; prompt: number; total: number }) => void;
  onError?: (error: any) => void;
  onFinish?: (message: any, options?: any) => void;
}

export function useAIChat({
  onError,
  onFinish,
  onRateLimit,
  onTokenUsage,
  api: _api = '/api/ai/chat',
  ...options
}: UseAIChatOptions = {}) {
  const chat = useVercelChat({
    streamProtocol: 'text',
    ...options,
  } as any);

  // Handle errors manually since onError callback is removed in v5
  useEffect(() => {
    if (chat.error && onError) {
      const errorMessage = chat.error?.message || chat.error?.toString() || '';
      if (errorMessage.includes('429') && onRateLimit) {
        const match = errorMessage.match(/retry after (\d+)/);
        const retryAfter = match ? parseInt(match[1]) : 60;
        onRateLimit(retryAfter);
      }
      onError(chat.error);
    }
  }, [chat.error, onError, onRateLimit]);

  // Note: onFinish and onTokenUsage callbacks are not available in AI SDK v5
  // These would need to be implemented differently if token usage tracking is needed
  useEffect(() => {
    if (onFinish) {
      logWarn('onFinish callback is not supported in AI SDK v5. Consider alternative approaches.');
    }
    if (onTokenUsage) {
      logWarn(
        'onTokenUsage callback is not supported in AI SDK v5. Consider alternative approaches.',
      );
    }
  }, [onFinish, onTokenUsage]);

  // Enhanced append with retry logic for backward compatibility
  const appendWithRetry = useCallback(
    async (message: any, retries = 3): Promise<void> => {
      try {
        // Support both v4 and v5 message formats using append method
        if (typeof message === 'string') {
          // Simple string message - convert to message object
          await chat.append({ role: 'user', content: message } as any);
          return;
        } else if (message.content && typeof message.content === 'string') {
          // v4 style message with content string - already compatible
          await chat.append(message as any);
          return;
        } else if (message.text) {
          // v5 style message - convert to v4 format for append
          await chat.append({ role: 'user', content: message.text } as any);
          return;
        } else {
          // Fallback for other formats
          await chat.append(message as any);
          return;
        }
      } catch (error: any) {
        const errorMessage = error?.message || error?.toString() || '';
        if (retries > 0 && errorMessage.includes('429')) {
          // Wait and retry on rate limit
          const match = errorMessage.match(/retry after (\d+)/);
          const retrySeconds = match ? parseInt(match[1]) : 5;
          const delay = retrySeconds * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return appendWithRetry(message, retries - 1);
        }
        throw error;
      }
    },
    [chat.append],
  );

  // Helper to clear messages
  const clear = useCallback(() => {
    chat.setMessages([]);
  }, [chat.setMessages]);

  // Helper to regenerate last message
  const regenerate = useCallback(() => {
    if (chat.messages.length < 2) return;

    // Remove last assistant message
    const newMessages = chat.messages.slice(0, -1);
    chat.setMessages(newMessages);

    // Resubmit last user message
    const lastUserMessage = newMessages[newMessages.length - 1];
    if (lastUserMessage?.role === 'user') {
      // Use appendWithRetry for better compatibility
      void appendWithRetry(lastUserMessage);
    }
  }, [chat.messages, chat.setMessages, appendWithRetry]);

  return {
    ...chat,
    appendWithRetry,
    clear,
    regenerate,
    // Backward compatibility for isLoading
    isLoading: chat.status === 'submitted' || chat.status === 'streaming',
  };
}
