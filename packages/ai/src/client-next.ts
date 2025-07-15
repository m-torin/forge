'use client';

/**
 * Client-side AI exports for Next.js
 *
 * This file provides client-side AI functionality specifically for Next.js applications.
 */

// Next.js specific imports
import { logError } from '@repo/observability/server/next';
import { useCallback, useState } from 'react';
import type { VectorEnrichedMessage, VectorSearchResult } from './shared/types/vector';

// Next.js client exports (extends client)
export * from './client';
export * from './hooks';

// Re-export shared types explicitly to avoid conflicts
export type { ChatMessage } from './shared/types';

// Export standard message types for AI SDK v5 compatibility
export {
  messageMetadataSchema,
  type ChatHelperProps,
  type StandardAttachment,
  type StandardChatMessage,
  type StandardMessageMetadata,
  type StandardUIDataTypes,
  type StandardUseChatHelpers,
} from './shared/types/messages';

// Shared models (client-safe metadata)
export {
  ANTHROPIC_MODEL_METADATA,
  PERPLEXITY_MODEL_METADATA,
  XAI_MODEL_METADATA,
} from './shared/models/metadata';

// Loading messages utilities (client-safe)
export {
  analyzeUserMessage,
  createLoadingMessageManager,
  getContextualLoadingMessage,
  getLoadingMessageForDuration,
  getRandomLoadingMessage,
  toolLoadingMessages,
  type LoadingContext,
  type LoadingMessageConfig,
} from './shared/ui/loading-messages';

/**
 * Next.js Client for AI Package with Vector Support
 * For use in Next.js client-side components and hooks
 *
 * Enhanced with AI SDK vector integrations:
 * - React hooks for vector operations
 * - Client-side vector search
 * - Real-time context updates
 */

/**
 * React hook for vector search operations
 */
export function useVectorSearch(config: {
  apiRoute?: string;
  apiKey?: string;
  timeout?: number;
  autoSearch?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<VectorSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (
      query: string,
      options?: {
        topK?: number;
        filter?: Record<string, any>;
        threshold?: number;
      },
    ) => {
      if (!query.trim()) {
        setResults([]);
        return [];
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(config.apiRoute || '/api/vector/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
          },
          body: JSON.stringify({
            query,
            ...options,
          }),
          signal: AbortSignal.timeout(config.timeout || 30000),
        });

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }

        const data = await response.json();
        const searchResults = data.results || [];
        setResults(searchResults);
        return searchResults;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setResults([]);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [config.apiRoute, config.apiKey, config.timeout],
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    search,
    results,
    isLoading,
    error,
    clearResults,
  };
}

/**
 * React hook for vector-enhanced chat
 */
export function useVectorChat(config: {
  apiRoute?: string;
  apiKey?: string;
  autoEnrichContext?: boolean;
  contextTopK?: number;
  similarityThreshold?: number;
}) {
  const [messages, setMessages] = useState<VectorEnrichedMessage[]>([]);
  const [vectorContext, setVectorContext] = useState<VectorSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: VectorEnrichedMessage = {
        role: 'user',
        content,
      };

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Search for relevant context if enabled
        let contextResults: VectorSearchResult[] = [];
        if (config.autoEnrichContext) {
          const contextResponse = await fetch(config.apiRoute || '/api/vector/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
            },
            body: JSON.stringify({
              query: content,
              topK: config.contextTopK || 5,
              threshold: config.similarityThreshold || 0.7,
            }),
          });

          if (contextResponse.ok) {
            const contextData = await contextResponse.json();
            contextResults = contextData.results || [];
            setVectorContext(contextResults);
          }
        }

        // Send to chat API with context
        const chatResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            vectorContext: contextResults,
          }),
        });

        if (!chatResponse.ok) {
          throw new Error(`Chat failed: ${chatResponse.statusText}`);
        }

        const assistantMessage = await chatResponse.json();
        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        logError('Error in vector chat', {
          operation: 'vector_chat',
          error: error instanceof Error ? error : new Error(String(error)),
        });
        // Add error message
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'Sorry, I encountered an error processing your message.',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, config],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setVectorContext([]);
  }, []);

  return {
    messages,
    vectorContext,
    sendMessage,
    isLoading,
    clearChat,
    hasContext: vectorContext.length > 0,
  };
}

/**
 * React hook for embedding operations
 */
export function useEmbeddings(config: {
  apiRoute?: string;
  apiKey?: string;
  embeddingModel?: string;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastEmbeddings, setLastEmbeddings] = useState<number[][]>([]);

  const generateEmbeddings = useCallback(
    async (content: string | string[]) => {
      setIsGenerating(true);

      try {
        const response = await fetch(config.apiRoute || '/api/vector/embed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
          },
          body: JSON.stringify({
            content: Array.isArray(content) ? content : [content],
            model: config.embeddingModel || 'text-embedding-3-small',
          }),
        });

        if (!response.ok) {
          throw new Error(`Embedding generation failed: ${response.statusText}`);
        }

        const data = await response.json();
        setLastEmbeddings(data.embeddings);
        return data;
      } catch (error) {
        logError('Error generating embeddings', {
          operation: 'generate_embeddings',
          error: error instanceof Error ? error : new Error(String(error)),
        });
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [config],
  );

  return {
    generateEmbeddings,
    isGenerating,
    lastEmbeddings,
  };
}

/**
 * React hook for vector recommendations
 */
export function useVectorRecommendations(config: {
  apiRoute?: string;
  apiKey?: string;
  autoUpdate?: boolean;
}) {
  const [recommendations, setRecommendations] = useState<VectorSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getRecommendations = useCallback(
    async (
      targetId: string,
      options?: {
        topK?: number;
        threshold?: number;
      },
    ) => {
      setIsLoading(true);

      try {
        const response = await fetch(config.apiRoute || '/api/vector/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
          },
          body: JSON.stringify({
            targetId,
            ...options,
          }),
        });

        if (!response.ok) {
          throw new Error(`Recommendations failed: ${response.statusText}`);
        }

        const data = await response.json();
        const results = data.results || [];
        setRecommendations(results);
        return results;
      } catch (error) {
        logError('Error getting recommendations', {
          operation: 'get_recommendations',
          error: error instanceof Error ? error : new Error(String(error)),
        });
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [config],
  );

  return {
    recommendations,
    getRecommendations,
    isLoading,
  };
}
