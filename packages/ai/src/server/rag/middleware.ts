/**
 * AI SDK v5 Middleware for RAG Implementation
 * Follows the official pattern from Vercel AI SDK documentation
 */

import type { LanguageModelV2Middleware } from '@ai-sdk/provider';
import { logInfo } from '@repo/observability/server/next';
import { RAGDatabaseBridge, createRAGDatabaseBridge } from './database-bridge';

export interface RAGMiddlewareConfig {
  vectorStore?: RAGDatabaseBridge;
  topK?: number;
  useUpstashEmbedding?: boolean;
  similarityThreshold?: number;
  embeddingModel?: string;
  namespace?: string;
}

/**
 * Helper function to extract the last user message text from the prompt
 */
function getLastUserMessageText(prompt: any[]): string | null {
  for (let i = prompt.length - 1; i >= 0; i--) {
    const message = prompt[i];
    if (message.role === 'user') {
      if (typeof message.content === 'string') {
        return message.content;
      }
      if (Array.isArray(message.content)) {
        // Find the first text content part
        const textPart = message.content.find((part: any) => part.type === 'text');
        return textPart?.text || null;
      }
    }
  }
  return null;
}

/**
 * Helper function to add context to the last user message
 */
function addToLastUserMessage(params: any, contextText: string) {
  const newPrompt = [...params.prompt];

  for (let i = newPrompt.length - 1; i >= 0; i--) {
    if (newPrompt[i].role === 'user') {
      const originalContent = newPrompt[i].content;

      if (typeof originalContent === 'string') {
        newPrompt[i] = {
          ...newPrompt[i],
          content: `${contextText}

User question: ${originalContent}`,
        };
      } else if (Array.isArray(originalContent)) {
        // Add context as the first text part
        newPrompt[i] = {
          ...newPrompt[i],
          content: [{ type: 'text', text: contextText }, ...originalContent],
        };
      }
      break;
    }
  }

  return { ...params, prompt: newPrompt };
}

/**
 * Create RAG middleware for AI SDK v5
 * Implements the recommended pattern from AI SDK documentation
 */
export function createRAGMiddleware(config: RAGMiddlewareConfig): LanguageModelV2Middleware {
  const vectorStore =
    config.vectorStore ||
    createRAGDatabaseBridge({
      embeddingModel: config.embeddingModel || 'text-embedding-3-small',
      namespace: config.namespace,
      useUpstashEmbedding: config.useUpstashEmbedding,
    });

  const {
    topK = 5,
    useUpstashEmbedding: _useUpstashEmbedding = false,
    similarityThreshold = 0.7,
  } = config;

  return {
    transformParams: async ({ params }: any) => {
      const startTime = Date.now();

      // Extract the last user message
      const lastUserMessageText = getLastUserMessageText(params.prompt);

      if (!lastUserMessageText) {
        logInfo('RAG middleware: No user message found, skipping RAG', {
          operation: 'rag_middleware_skip',
        });
        return params; // No user message, skip RAG
      }

      try {
        // Search for relevant context using the database bridge
        const searchResults = await vectorStore.queryDocuments(lastUserMessageText, {
          topK,
          threshold: similarityThreshold,
          includeContent: true,
        });

        const relevantResults = searchResults;

        if (relevantResults.length === 0) {
          logInfo('RAG middleware: No relevant context found', {
            operation: 'rag_middleware_no_context',
            query: lastUserMessageText.substring(0, 100),
            searchTime: Date.now() - startTime,
          });

          // Add instruction for when no context is found
          const instruction =
            'You are a helpful assistant. No relevant information was found in the knowledge base for this question. Please respond with "Sorry, I don\'t know" if you cannot answer based on your general knowledge.';
          return addToLastUserMessage(params, instruction);
        }

        // Format context for injection
        const contextText = relevantResults
          .map((result, index) => {
            const source = result.metadata?.title || result.metadata?.source || 'Unknown';
            const content = result.content || result.metadata?.content || '';
            return `[Context ${index + 1} - Relevance: ${(result.score * 100).toFixed(1)}% - Source: ${source} - Doc ID: ${result.id}]
${content}`;
          })
          .join('\n');

        const instruction = `Use the following information to answer the question. Only respond based on the provided context. If the context doesn't contain relevant information, respond "Sorry, I don't know."

${contextText}`;

        logInfo('RAG middleware: Context injected successfully', {
          operation: 'rag_middleware_success',
          contextChunks: relevantResults.length,
          avgRelevance:
            relevantResults.reduce((sum, r) => sum + r.score, 0) / relevantResults.length,
          searchTime: Date.now() - startTime,
        });

        return addToLastUserMessage(params, instruction);
      } catch (error) {
        logInfo('RAG middleware: Error during context retrieval', {
          operation: 'rag_middleware_error',
          error: error instanceof Error ? error.message : 'Unknown error',
          query: lastUserMessageText.substring(0, 100),
        });

        // On error, continue without RAG context
        return params;
      }
    },
  };
}

/**
 * Convenience function to create RAG middleware from environment
 */
export function createRAGMiddlewareFromEnv(options?: {
  topK?: number;
  useUpstashEmbedding?: boolean;
  similarityThreshold?: number;
  namespace?: string;
}): LanguageModelV2Middleware | null {
  const vectorUrl = process.env.UPSTASH_VECTOR_REST_URL;
  const vectorToken = process.env.UPSTASH_VECTOR_REST_TOKEN;

  if (!vectorUrl || !vectorToken) {
    return null;
  }

  const vectorStore = createRAGDatabaseBridge({
    namespace: options?.namespace,
  });

  return createRAGMiddleware({
    vectorStore,
    topK: options?.topK,
    useUpstashEmbedding: options?.useUpstashEmbedding,
    similarityThreshold: options?.similarityThreshold,
  });
}

/**
 * Example usage patterns
 */
export const examples = {
  /**
   * Basic middleware usage with streamText
   */
  basic: `
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createRAGMiddlewareFromEnv } from './middleware';

const ragMiddleware = createRAGMiddlewareFromEnv({ topK: 3 });

if (ragMiddleware) {
  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    experimental_middlewares: [ragMiddleware],
  });
}
  `,

  /**
   * Advanced middleware with custom vector store
   */
  advanced: `
import { UpstashAIVector } from '../vector/ai-sdk-integration';
import { createRAGMiddleware } from './middleware';

const vectorStore = new UpstashAIVector({
  vectorUrl: process.env.UPSTASH_VECTOR_REST_URL!,
  vectorToken: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  namespace: 'my-app',
});

const ragMiddleware = createRAGMiddleware({
  vectorStore,
  topK: 5,
  useUpstashEmbedding: false,
  similarityThreshold: 0.8,
});
  `,
};
