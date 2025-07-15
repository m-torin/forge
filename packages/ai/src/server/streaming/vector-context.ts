/**
 * Real-time Vector Context for AI SDK Streaming
 * Integrates vector similarity into streaming responses
 */

import { openai } from '@ai-sdk/openai';
import { logError } from '@repo/observability/server/next';
import { embed, streamText, type StreamTextResult } from 'ai';
import type { VectorContext, VectorizedMessage } from '../../shared/types/vector';
import type { VectorDB } from '../vector';

export interface VectorStreamConfig {
  vectorDB: VectorDB;
  embeddingModel?: string;
  autoEnrichContext?: boolean;
  contextTopK?: number;
  similarityThreshold?: number;
  maxContextLength?: number;
}

export interface StreamWithVectorContext {
  <T extends Parameters<typeof streamText>[0]>(
    options: T & {
      vectorConfig?: VectorStreamConfig;
      onVectorContext?: (context: VectorContext[]) => void;
    },
  ): Promise<StreamTextResult<any, any>>;
}

/**
 * Enhanced streamText with automatic vector context enrichment
 */
export const streamTextWithVectorContext: StreamWithVectorContext = async options => {
  const { vectorConfig, onVectorContext, messages = [], ...streamOptions } = options;

  let enrichedMessages = messages;
  let vectorContext: VectorContext[] = [];

  // Auto-enrich context if configured
  if (vectorConfig?.autoEnrichContext && vectorConfig.vectorDB) {
    const result = await enrichMessagesWithVectorContext(messages, vectorConfig);
    enrichedMessages = result.enrichedMessages;
    vectorContext = result.vectorContext;

    // Notify about vector context
    if (onVectorContext && vectorContext.length > 0) {
      onVectorContext(vectorContext);
    }
  }

  // Add vector context to system message if found
  if (vectorContext.length > 0) {
    const contextText = vectorContext
      .map(ctx => `[Score: ${ctx.score.toFixed(3)}] ${ctx.content}`)
      .join('\n\n');

    const systemMessage = {
      role: 'system' as const,
      content: `You have access to the following relevant context from the knowledge base:

${contextText}

Use this context to provide more accurate and detailed responses. If the context is not relevant to the user's question, you may ignore it.`,
    };

    enrichedMessages = [systemMessage, ...enrichedMessages] as any;
  }

  return streamText({
    ...streamOptions,
    messages: enrichedMessages as any,
  });
};

/**
 * Enrich messages with vector context
 */
async function enrichMessagesWithVectorContext(
  messages: any[],
  config: VectorStreamConfig,
): Promise<{
  enrichedMessages: VectorizedMessage[];
  vectorContext: VectorContext[];
}> {
  const {
    vectorDB,
    embeddingModel = 'text-embedding-3-small',
    contextTopK = 5,
    similarityThreshold = 0.7,
    maxContextLength = 2000,
  } = config;

  if (messages.length === 0) {
    return { enrichedMessages: [], vectorContext: [] };
  }

  // Extract search query from recent user messages
  const userMessages = messages.filter(m => m.role === 'user').slice(-3); // Use last 3 user messages for context

  if (userMessages.length === 0) {
    return { enrichedMessages: messages, vectorContext: [] };
  }

  const searchQuery = userMessages
    .map(m => (typeof m.content === 'string' ? m.content : ''))
    .join(' ')
    .slice(0, maxContextLength); // Limit query length

  try {
    // Generate embedding for search
    const model = openai.embedding(embeddingModel);
    const { embedding } = await embed({ model, value: searchQuery });

    // Search vector database
    const results = await vectorDB.query(embedding, {
      topK: contextTopK,
      includeMetadata: true,
      // includeValues: false, // Removed invalid property
    });

    // Filter by similarity threshold
    const relevantContext: VectorContext[] = results
      .filter(result => (result.score ?? 0) >= similarityThreshold)
      .map(result => ({
        id: result.id,
        content: result.metadata?.content || '',
        score: result.score ?? 0,
        metadata: result.metadata,
      }));

    // Enrich messages with vector context
    const enrichedMessages: VectorizedMessage[] = messages.map(message => ({
      ...message,
      vectorContext: message.role === 'user' ? relevantContext : undefined,
      similarity:
        message.role === 'user' && relevantContext.length > 0
          ? relevantContext[0]?.score
          : undefined,
    }));

    return {
      enrichedMessages,
      vectorContext: relevantContext,
    };
  } catch (error) {
    logError('Error enriching messages with vector context', {
      operation: 'vector_context_enrichment',
      messageCount: messages.length,
      searchQuery: searchQuery.slice(0, 100),
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return { enrichedMessages: messages, vectorContext: [] };
  }
}

/**
 * Vector-aware chat middleware
 */
export function createVectorChatMiddleware(config: VectorStreamConfig) {
  return {
    async preprocessMessages(messages: any[]) {
      const result = await enrichMessagesWithVectorContext(messages, config);
      return result;
    },

    async searchContext(query: string): Promise<VectorContext[]> {
      const {
        vectorDB,
        embeddingModel = 'text-embedding-3-small',
        contextTopK = 5,
        similarityThreshold = 0.7,
      } = config;

      try {
        const model = openai.embedding(embeddingModel);
        const { embedding } = await embed({ model, value: query });

        const results = await vectorDB.query(embedding, {
          topK: contextTopK,
          includeMetadata: true,
        });

        return results
          .filter(result => (result.score ?? 0) >= similarityThreshold)
          .map(result => ({
            id: result.id,
            content: result.metadata?.content || '',
            score: result.score ?? 0,
            metadata: result.metadata,
          }));
      } catch (error) {
        logError('Error searching vector context', {
          operation: 'vector_context_search',
          query: query.slice(0, 100),
          error: error instanceof Error ? error : new Error(String(error)),
        });
        return [];
      }
    },

    formatContextForPrompt(context: VectorContext[]): string {
      if (context.length === 0) {
        return '';
      }

      return `Relevant context from knowledge base:

${context
  .map(
    (ctx, index) =>
      `${index + 1}. [Relevance: ${(ctx.score * 100).toFixed(1)}%]
${ctx.content}`,
  )
  .join('\n\n')}

---

`;
    },
  };
}

/**
 * Streaming response with progressive vector context
 */
export async function streamWithProgressiveContext(
  options: Parameters<typeof streamText>[0] & {
    vectorConfig: VectorStreamConfig;
    onContextUpdate?: (context: VectorContext[]) => void;
  },
) {
  const { vectorConfig, onContextUpdate, ...streamOptions } = options;

  // Start streaming immediately
  const stream = streamText(streamOptions);

  // Asynchronously enrich with vector context
  if (vectorConfig.autoEnrichContext) {
    const middleware = createVectorChatMiddleware(vectorConfig);

    // Extract query from the last user message
    const lastUserMessage = streamOptions.messages?.filter(m => m.role === 'user')?.slice(-1)[0];

    if (lastUserMessage) {
      // Search for context in parallel with streaming
      const content =
        typeof lastUserMessage.content === 'string'
          ? lastUserMessage.content
          : JSON.stringify(lastUserMessage.content);
      // Search for context in parallel with streaming
      (async () => {
        try {
          const context = await middleware.searchContext(content);
          if (context.length > 0 && onContextUpdate) {
            onContextUpdate(context);
          }
        } catch (error) {
          logError('Error in progressive context search', {
            operation: 'progressive_context_search',
            content: content.slice(0, 100),
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      })();
    }
  }

  return stream;
}

// Types are already exported above
