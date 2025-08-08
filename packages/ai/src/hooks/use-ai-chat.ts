'use client';

import { useChat as useVercelChat } from '@ai-sdk/react';
import { logWarn } from '@repo/observability';
import type { ModelMessage } from 'ai';
import { useCallback, useEffect } from 'react';

import { BaseAIHookOptions, mergeTransportConfig } from '../shared/types/transport';

// Import the exact types from AI SDK v5
export interface UseAIChatOptions extends BaseAIHookOptions {
  id?: string;
  initialInput?: string;
  initialMessages?: ModelMessage[];

  // Advanced options
  streamProtocol?: 'text' | 'data';
  generateId?: () => string;

  // Custom callback options that we implement manually
  onTokenUsage?: (usage: { completion: number; prompt: number; total: number }) => void;
  onFinish?: (message: ModelMessage, options?: Record<string, unknown>) => void;
}

export function useAIChat({
  onError,
  onFinish,
  onRateLimit,
  onTokenUsage,
  api: apiProp,
  transport,
  ...options
}: UseAIChatOptions = {}) {
  // Configure transport using shared utility
  const { api, ...transportConfig } = mergeTransportConfig(
    { api: apiProp, transport, ...options },
    '/api/ai/chat',
  );

  const chatConfig = {
    api,
    ...transportConfig,
    streamProtocol: options.streamProtocol || ('text' as const),
    generateId: options.generateId,
    initialInput: options.initialInput,
    initialMessages: options.initialMessages,
    id: options.id,
  };

  const chat = useVercelChat(chatConfig);

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

  // Enhanced sendMessage with retry logic (v5 pattern)
  const sendMessage = useCallback(
    async (message: string | { text: string }, retries = 3): Promise<void> => {
      try {
        // AI SDK v5 sendMessage - supports string or { text: string } format
        if (typeof message === 'string') {
          await chat.sendMessage({ text: message });
        } else {
          await chat.sendMessage({ text: message.text });
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (retries > 0 && errorMessage.includes('429')) {
          // Wait and retry on rate limit
          const match = errorMessage.match(/retry after (\d+)/);
          const retrySeconds = match ? parseInt(match[1]) : 5;
          const delay = retrySeconds * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return sendMessage(message, retries - 1);
        }
        throw error;
      }
    },
    [chat.sendMessage],
  );

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
      // Extract text content for v5 sendMessage
      const messageContent = (lastUserMessage as any).content;
      const textContent =
        typeof messageContent === 'string' ? messageContent : String(messageContent);
      void sendMessage(textContent);
    }
  }, [chat.messages, chat.setMessages, sendMessage]);

  return {
    ...chat,
    // V5 primary method
    sendMessage,
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
