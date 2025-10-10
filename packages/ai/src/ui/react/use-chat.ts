import { useChat as useAIChat } from '@ai-sdk/react';
import { logDebug, logError } from '@repo/observability';
import type { UIMessage } from 'ai';

// Safe environment access with React 19 compatible lazy initialization
let safeEnvCache: () => any;

function getSafeEnv(): () => any {
  if (!safeEnvCache) {
    try {
      // Use dynamic import only when needed, not at module level
      if (typeof window !== 'undefined') {
        // Client-side: use process.env fallback
        safeEnvCache = () => process.env;
      } else {
        // Server-side: try to require the env module synchronously
        try {
          const envModule = require('../../../env');
          safeEnvCache = envModule.safeEnv || (() => process.env);
        } catch {
          safeEnvCache = () => process.env;
        }
      }
    } catch {
      safeEnvCache = () => process.env;
    }
  }
  return safeEnvCache;
}

export interface UseChatConfig<TMessage extends UIMessage = UIMessage> {
  api?: string;
  id?: string;
  messages?: TMessage[];
  autoSend?: boolean;
  telemetry?: boolean;
  persist?: boolean;
  analytics?: boolean;
  maxRetries?: number;
  onToolCall?: (options: { toolCall: any }) => void;
  onFinish?: (message: any) => void;
  onError?: (error: Error) => void;
  onData?: (data: any) => void;
  generateId?: () => string;
  transport?: any;
  experimental_throttle?: number;
  sendExtraMessageFields?: boolean;

  // Monorepo integrations
  userId?: string;
  conversationId?: string;
  sessionId?: string;
}

/**
 * Enhanced useChat hook with monorepo integrations
 */
export function useChat<TMessage extends UIMessage = UIMessage>(
  config: UseChatConfig<TMessage> = {},
) {
  const env = getSafeEnv()();

  // Use the SDK hook with enhanced configuration
  const chat = useAIChat<TMessage>({
    ...(config.api && { api: config.api }),
    ...(config.id && { id: config.id }),
    ...(config.messages && { messages: config.messages }),
    ...(config.experimental_throttle !== undefined && {
      experimental_throttle: config.experimental_throttle,
    }),
    ...(config.generateId && { generateId: config.generateId }),
    ...(config.transport && { transport: config.transport }),
    ...(config.onData && { onData: config.onData }),
    ...(config.sendExtraMessageFields !== undefined && {
      sendExtraMessageFields: config.sendExtraMessageFields,
    }),

    // Enhanced callbacks
    onToolCall: config.onToolCall,

    onFinish: async (options: any) => {
      const message = options.message;
      const usage = options.usage;

      // Telemetry tracking (monorepo integration)
      if ((config.telemetry ?? env.AI_TELEMETRY) && typeof window !== 'undefined') {
        logDebug('[AI Chat] Message completed:', {
          messageId: message.id,
          usage,
          conversationId: config.conversationId,
          userId: config.userId,
          timestamp: new Date().toISOString(),
        });
      }

      // Analytics tracking (if enabled)
      if (config.analytics) {
        try {
          // This would integrate with @repo/analytics
          if (typeof window !== 'undefined' && (window as any).analytics) {
            (window as any).analytics.track('chat_message_completed', {
              messageId: message.id,
              tokens: usage?.totalTokens,
              conversationId: config.conversationId,
              userId: config.userId,
            });
          }
        } catch (error) {
          logError('[AI Chat] Analytics tracking failed:', error);
        }
      }

      // Persistence (if enabled)
      if (config.persist && config.conversationId) {
        try {
          // This would integrate with @repo/db-prisma
          await fetch('/api/conversations/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId: config.conversationId,
              messages: [...chat.messages, message],
              userId: config.userId,
            }),
          });
        } catch (error) {
          logError('[AI Chat] Failed to persist conversation:', error);
        }
      }

      // Call user's onFinish
      config.onFinish?.(message);
    },

    onError: error => {
      // Enhanced error logging
      if (getSafeEnv()().AI_TELEMETRY) {
        logError('[AI Chat] Error occurred:', {
          error: error.message,
          conversationId: config.conversationId,
          userId: config.userId,
          timestamp: new Date().toISOString(),
        });
      }

      // Analytics error tracking
      if (config.analytics && typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('chat_error', {
          error: error.message,
          conversationId: config.conversationId,
          userId: config.userId,
        });
      }

      config.onError?.(error);
    },
  });

  // Return enhanced chat interface
  return {
    ...chat,

    // Enhanced convenience methods
    async regenerate() {
      const lastUserMessage = chat.messages
        .slice()
        .reverse()
        .find(m => m.role === 'user');

      if (lastUserMessage) {
        // AI SDK v5: Extract text from parts array format
        let text = '';

        if ('parts' in lastUserMessage && lastUserMessage.parts) {
          const textPart = lastUserMessage.parts.find(p => p.type === 'text');
          if (textPart && 'text' in textPart) {
            text = textPart.text;
          }
        }

        if (text) {
          // AI SDK v5: Use sendMessage directly
          chat.sendMessage({ text });
        }
      }
    },

    // Send a quick message without form handling
    async send(text: string) {
      if (!text.trim()) return;

      // AI SDK v5: Use sendMessage directly
      chat.sendMessage({ text });
    },

    // Retry last assistant message
    async retry() {
      const lastAssistantIndex = chat.messages
        .map((m, i) => ({ message: m, index: i }))
        .filter(({ message }) => message.role === 'assistant')
        .pop()?.index;

      if (lastAssistantIndex !== undefined) {
        const messagesToKeep = chat.messages.slice(0, lastAssistantIndex);
        chat.setMessages(messagesToKeep);

        // Re-trigger the last user message
        const lastUserMessage = messagesToKeep
          .slice()
          .reverse()
          .find(m => m.role === 'user');

        if (lastUserMessage) {
          let text = '';
          // AI SDK v5: Extract from parts array format
          if ('parts' in lastUserMessage && lastUserMessage.parts) {
            const textPart = lastUserMessage.parts.find(p => p.type === 'text');
            if (textPart && 'text' in textPart) {
              text = textPart.text;
            }
          }

          if (text) {
            // AI SDK v5: Use handleSubmit with form event simulation
            const formEvent = new Event('submit') as any;
            formEvent.preventDefault = () => {};
            chat.sendMessage({ text });
          }
        }
      }
    },

    // Clear conversation with optional persistence
    async clear() {
      chat.setMessages([]);

      // Clear persisted conversation if enabled
      if (config.persist && config.conversationId) {
        try {
          await fetch(`/api/conversations/${config.conversationId}`, {
            method: 'DELETE',
          });
        } catch (error) {
          logError('[AI Chat] Failed to clear persisted conversation:', error);
        }
      }
    },

    // Create conversation branch
    branch(messageIndex: number) {
      const branchedMessages = chat.messages.slice(0, messageIndex + 1);
      return useChat({
        ...config,
        messages: branchedMessages,
        conversationId: `${config.conversationId}_branch_${Date.now()}`,
      });
    },

    // Export conversation
    export() {
      return {
        messages: chat.messages,
        conversationId: config.conversationId,
        userId: config.userId,
        timestamp: new Date().toISOString(),
      };
    },

    // Get conversation stats
    getStats() {
      const messages = chat.messages;
      const userMessages = messages.filter(m => m.role === 'user').length;
      const assistantMessages = messages.filter(m => m.role === 'assistant').length;
      const totalTokens = messages.reduce((sum, m) => {
        // This would calculate actual tokens - placeholder for now
        const content = m.parts?.map((p: any) => (p.type === 'text' ? p.text : '')).join('') || '';
        return sum + content.length / 4; // Rough estimate
      }, 0);

      return {
        totalMessages: messages.length,
        userMessages,
        assistantMessages,
        estimatedTokens: Math.round(totalTokens),
        conversationId: config.conversationId,
      };
    },

    // Enhanced status handling patterns
    getStatusInfo() {
      return {
        isLoading: chat.status === 'submitted' || chat.status === 'streaming',
        isReady: chat.status === 'ready',
        hasError: !!chat.error,
        canStop: chat.status === 'submitted' || chat.status === 'streaming',
        canRetry: chat.status === 'ready' && !!chat.error,
        status: chat.status,
        error: chat.error,
        canSend: chat.status === 'ready' && !chat.error,
      };
    },

    // Enhanced error handling with telemetry
    async handleError(error: Error, context?: string) {
      const errorInfo = {
        error: error.message,
        stack: error.stack,
        context,
        conversationId: config.conversationId,
        userId: config.userId,
        timestamp: new Date().toISOString(),
        messagesCount: chat.messages.length,
      };

      // Log with telemetry
      if (getSafeEnv()().AI_TELEMETRY) {
        logError(`[AI Chat] Enhanced error handling${context ? ` (${context})` : ''}:`, errorInfo);
      }

      // Analytics tracking
      if (config.analytics && typeof window !== 'undefined' && (window as any).analytics) {
        try {
          (window as any).analytics.track('chat_enhanced_error', errorInfo);
        } catch (analyticsError) {
          logError('[AI Chat] Analytics error tracking failed:', analyticsError);
        }
      }

      // Call user's onError if provided
      config.onError?.(error);

      return errorInfo;
    },

    // Status-aware message operations
    async safeSendMessage(text: string) {
      if (chat.status !== 'ready') {
        throw new Error(`Cannot send message: chat status is '${chat.status}'`);
      }

      try {
        // AI SDK v5: Use sendMessage directly
        return chat.sendMessage({ text });
      } catch (error) {
        await this.handleError(error as Error, 'safeSendMessage');
        throw error;
      }
    },
  };
}
