'use client';

import { useChat as useVercelChat } from '@ai-sdk/react';
import { logWarn } from '@repo/observability';
import type { CoreMessage } from 'ai';
import { useCallback, useEffect } from 'react';

// AI SDK v5 Transport Configuration
export interface V5TransportConfig {
  url?: string;
  headers?: Record<string, string> | Headers;
  body?: Record<string, unknown>;
  credentials?: 'omit' | 'same-origin' | 'include';
  fetch?: typeof globalThis.fetch;
}

// Import the exact types from AI SDK v5
export interface UseAIChatOptions {
  api?: string;
  id?: string;
  initialInput?: string;
  initialMessages?: CoreMessage[];

  // V5 Transport-based configuration
  transport?: V5TransportConfig;

  // Legacy options for backward compatibility
  headers?: Record<string, string> | Headers;
  body?: Record<string, unknown>;
  credentials?: 'omit' | 'same-origin' | 'include';
  maxSteps?: number;
  streamProtocol?: 'text' | 'data';
  generateId?: () => string;
  fetch?: typeof globalThis.fetch;

  // Custom callback options that we implement manually
  onRateLimit?: (retryAfter: number) => void;
  onTokenUsage?: (usage: { completion: number; prompt: number; total: number }) => void;
  onError?: (error: Error) => void;
  onFinish?: (message: CoreMessage, options?: Record<string, unknown>) => void;
}

export function useAIChat({
  onError,
  onFinish,
  onRateLimit,
  onTokenUsage,
  api: api = '/api/ai/chat',
  transport,
  ...options
}: UseAIChatOptions = {}) {
  // Configure transport if provided (v5 pattern)
  const chatConfig = transport
    ? {
        ...options,
        api: transport.url || api,
        headers: transport.headers || options.headers,
        body: transport.body || options.body,
        credentials: transport.credentials || options.credentials,
        fetch: transport.fetch || options.fetch,
      }
    : {
        streamProtocol: 'text' as const,
        ...options,
      };

  const chat = useVercelChat(chatConfig);

  // Handle errors manually since onError callback is removed in v5
  useEffect(() => {
    if (chat.error && onError) {
      const errorMessage = chat.error?.message || chat.error?.toString() || '';
      if (errorMessage.includes('429') && onRateLimit) {
        const match = errorMessage.match(/retry after (\\d+)/);
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

  // Enhanced sendMessage with retry logic (v5 pattern)
  const sendMessage = useCallback(
    async (message: string | CoreMessage | { text: string }, retries = 3): Promise<void> => {
      try {
        // Temporary fix: use any to bypass type checking until dependencies are resolved
        if (typeof message === 'string') {
          await (chat.append as any)({
            role: 'user',
            content: message,
          });
        } else if ('text' in message && message.text) {
          await (chat.append as any)({
            role: 'user',
            content: message.text,
          });
        } else {
          // For CoreMessage, convert to the expected format
          const coreMessage = message as CoreMessage;
          await (chat.append as any)({
            role: coreMessage.role,
            content: coreMessage.content,
          });
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (retries > 0 && errorMessage.includes('429')) {
          // Wait and retry on rate limit
          const match = errorMessage.match(/retry after (\\d+)/);
          const retrySeconds = match ? parseInt(match[1]) : 5;
          const delay = retrySeconds * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return sendMessage(message, retries - 1);
        }
        throw error;
      }
    },
    [chat.append],
  );

  // Backward compatibility alias
  const appendWithRetry = sendMessage;

  // Helper to clear messages
  const clear = useCallback(() => {
    chat.setMessages([]);
  }, [chat.setMessages]);

  // Helper to regenerate last message (v5 compatible)
  const regenerate = useCallback(() => {
    if (chat.messages.length < 2) return;

    // Remove last assistant message
    const newMessages = chat.messages.slice(0, -1);
    chat.setMessages(newMessages);

    // Resubmit last user message
    const lastUserMessage = newMessages[newMessages.length - 1];
    if (lastUserMessage?.role === 'user') {
      // Convert to compatible format for sendMessage
      const messageContent = (lastUserMessage as any).content;
      void sendMessage({
        role: lastUserMessage.role as 'user' | 'assistant' | 'system',
        content: typeof messageContent === 'string' ? messageContent : String(messageContent),
      } as CoreMessage);
    }
  }, [chat.messages, chat.setMessages, sendMessage]);

  return {
    ...chat,
    // V5 primary method
    sendMessage,
    // Backward compatibility
    appendWithRetry,
    clear,
    regenerate,
    // Backward compatibility for isLoading
    isLoading: chat.status === 'submitted' || chat.status === 'streaming',
    // V5 transport config access
    transport: transport || {
      url: api,
      headers: options.headers,
      body: options.body,
      credentials: options.credentials,
      fetch: options.fetch,
    },
  };
}
