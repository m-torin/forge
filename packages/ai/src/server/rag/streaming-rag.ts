/**
 * Streaming RAG with Real-time Context Injection
 * Advanced streaming capabilities with progressive context enhancement
 */

import { logInfo, logWarn } from '@repo/observability/server/next';
import { streamObject, streamText, type LanguageModel } from 'ai';
import { z } from 'zod';
import type { RAGDatabaseBridge } from './database-bridge';
import { ragRetry } from './enhanced-retry';
import { recordRAGOperation } from './health-monitoring';

/**
 * Configuration for streaming RAG
 */
export interface StreamingRAGConfig {
  vectorStore: RAGDatabaseBridge;
  languageModel: LanguageModel;
  topK?: number;
  threshold?: number;
  enableProgressiveContext?: boolean;
  enableRealTimeSearch?: boolean;
  contextRefreshInterval?: number; // ms
  maxContextLength?: number;
}

/**
 * Streaming context result
 */
export interface StreamingContextResult {
  id: string;
  score: number;
  content: string;
  metadata?: Record<string, any>;
  timestamp: number;
  isNew?: boolean;
}

/**
 * Progressive context enhancement for long-running streams
 */
export class ProgressiveContextEnhancer {
  private contextCache = new Map<string, StreamingContextResult[]>();
  private lastUpdate = new Map<string, number>();

  constructor(
    private vectorStore: RAGDatabaseBridge,
    private config: StreamingRAGConfig,
  ) {}

  /**
   * Get initial context for a query
   */
  async getInitialContext(query: string): Promise<StreamingContextResult[]> {
    const startTime = Date.now();

    try {
      const results = await ragRetry.vector(
        async () =>
          await this.vectorStore.queryDocuments(query, {
            topK: this.config.topK || 5,
            threshold: this.config.threshold || 0.7,
            includeContent: true,
          }),
      );

      const contextResults: StreamingContextResult[] = results.map(result => ({
        id: String(result.id),
        score: result.score,
        content: result.content || '',
        metadata: result.metadata,
        timestamp: Date.now(),
        isNew: true,
      }));

      // Cache the results
      this.contextCache.set(query, contextResults);
      this.lastUpdate.set(query, Date.now());

      const responseTime = Date.now() - startTime;
      recordRAGOperation('vector_query', true, responseTime, {
        resultsFound: results.length,
        avgRelevance: results.reduce((sum, r) => sum + r.score, 0) / results.length,
      });

      logInfo('Initial context retrieved for streaming', {
        operation: 'streaming_rag_initial_context',
        query: query.substring(0, 100),
        resultsFound: contextResults.length,
        responseTime,
      });

      return contextResults;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      recordRAGOperation('vector_query', false, responseTime);

      logWarn('Failed to get initial context', {
        operation: 'streaming_rag_initial_context_error',
        error: error instanceof Error ? error.message : String(error),
        query: query.substring(0, 100),
      });

      return [];
    }
  }

  /**
   * Refresh context during streaming (for real-time updates)
   */
  async refreshContext(query: string): Promise<StreamingContextResult[]> {
    const lastUpdateTime = this.lastUpdate.get(query) || 0;
    const now = Date.now();

    // Check if refresh is needed
    if (
      this.config.contextRefreshInterval &&
      now - lastUpdateTime < this.config.contextRefreshInterval
    ) {
      return this.contextCache.get(query) || [];
    }

    try {
      const newResults = await ragRetry.vector(
        async () =>
          await this.vectorStore.queryDocuments(query, {
            topK: this.config.topK || 5,
            threshold: this.config.threshold || 0.7,
            includeContent: true,
          }),
      );

      const existingContext = this.contextCache.get(query) || [];
      const existingIds = new Set(existingContext.map(c => c.id));

      // Identify new context
      const newContext: StreamingContextResult[] = newResults
        .filter(result => !existingIds.has(String(result.id)))
        .map(result => ({
          id: String(result.id),
          score: result.score,
          content: result.content || '',
          metadata: result.metadata,
          timestamp: now,
          isNew: true,
        }));

      // Mark existing context as not new
      const updatedContext = [...existingContext.map(c => ({ ...c, isNew: false })), ...newContext];

      // Update cache
      this.contextCache.set(query, updatedContext);
      this.lastUpdate.set(query, now);

      if (newContext.length > 0) {
        logInfo('Context refreshed with new results', {
          operation: 'streaming_rag_context_refresh',
          query: query.substring(0, 100),
          newResults: newContext.length,
          totalResults: updatedContext.length,
        });
      }

      return updatedContext;
    } catch (error) {
      logWarn('Failed to refresh context', {
        operation: 'streaming_rag_context_refresh_error',
        error: error instanceof Error ? error.message : String(error),
        query: query.substring(0, 100),
      });

      return this.contextCache.get(query) || [];
    }
  }

  /**
   * Format context for streaming injection
   */
  formatContextForStreaming(
    context: StreamingContextResult[],
    options?: {
      includeMetadata?: boolean;
      maxLength?: number;
      highlightNew?: boolean;
    },
  ): string {
    const maxLength = options?.maxLength || this.config.maxContextLength || 4000;
    let formattedContext = '';

    for (const result of context) {
      const source = result.metadata?.title || result.metadata?.source || `Document ${result.id}`;
      const relevance = (result.score * 100).toFixed(1);
      const newIndicator = options?.highlightNew && result.isNew ? ' [NEW]' : '';

      const contextChunk = `[${source} - Relevance: ${relevance}%${newIndicator}]\n${result.content}\n\n`;

      if (formattedContext.length + contextChunk.length > maxLength) {
        break;
      }

      formattedContext += contextChunk;
    }

    return formattedContext.trim();
  }

  /**
   * Clear cache for a query
   */
  clearContext(query: string): void {
    this.contextCache.delete(query);
    this.lastUpdate.delete(query);
  }
}

/**
 * Create streaming RAG with progressive context enhancement
 */
export async function createStreamingRAG(
  query: string,
  config: StreamingRAGConfig,
  options?: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    onContextUpdate?: (context: StreamingContextResult[]) => void;
  },
) {
  const enhancer = new ProgressiveContextEnhancer(config.vectorStore, config);

  // Get initial context
  const initialContext = await enhancer.getInitialContext(query);

  if (initialContext.length === 0) {
    logWarn('No initial context found for streaming RAG', {
      operation: 'streaming_rag_no_context',
      query: query.substring(0, 100),
    });

    // Stream without RAG context
    return streamText({
      model: config.languageModel,
      messages: [
        {
          role: 'system',
          content:
            options?.systemPrompt ||
            'You are a helpful assistant. No relevant context was found in the knowledge base for this query.',
        },
        {
          role: 'user',
          content: query,
        },
      ],
      temperature: options?.temperature ?? 0.1,
      maxOutputTokens: options?.maxTokens,
    });
  }

  // Format initial context
  const contextText = enhancer.formatContextForStreaming(initialContext, {
    highlightNew: false,
    maxLength: config.maxContextLength,
  });

  const systemPrompt =
    options?.systemPrompt ||
    `You are a knowledgeable assistant. Use the following context to answer questions accurately and comprehensively. Only use information from the provided context.

Context:
${contextText}`;

  // Notify about initial context
  options?.onContextUpdate?.(initialContext);

  // Setup context refresh if enabled
  let refreshInterval: NodeJS.Timeout | undefined;
  if (config.enableRealTimeSearch && config.contextRefreshInterval) {
    refreshInterval = setInterval(async () => {
      try {
        const updatedContext = await enhancer.refreshContext(query);
        const hasNewContext = updatedContext.some(c => c.isNew);

        if (hasNewContext) {
          options?.onContextUpdate?.(updatedContext);
        }
      } catch (error) {
        logWarn('Context refresh failed during streaming', { error });
      }
    }, config.contextRefreshInterval);
  }

  // Create the streaming response
  const streamResponse = streamText({
    model: config.languageModel,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: query,
      },
    ],
    temperature: options?.temperature ?? 0.1,
    maxOutputTokens: options?.maxTokens,
    onFinish: () => {
      // Cleanup
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      enhancer.clearContext(query);
    },
  });

  logInfo('Streaming RAG response initiated', {
    operation: 'streaming_rag_started',
    query: query.substring(0, 100),
    initialContextCount: initialContext.length,
    enableRealTimeSearch: config.enableRealTimeSearch,
  });

  return streamResponse;
}

/**
 * Create streaming structured RAG response
 */
export async function createStreamingStructuredRAG<T extends z.ZodType>(
  query: string,
  schema: T,
  config: StreamingRAGConfig,
  options?: {
    systemPrompt?: string;
    temperature?: number;
    onContextUpdate?: (context: StreamingContextResult[]) => void;
  },
) {
  const enhancer = new ProgressiveContextEnhancer(config.vectorStore, config);

  // Get initial context
  const initialContext = await enhancer.getInitialContext(query);

  if (initialContext.length === 0) {
    throw new Error('No relevant context found for structured RAG query');
  }

  // Format context
  const contextText = enhancer.formatContextForStreaming(initialContext);

  const systemPrompt =
    options?.systemPrompt ||
    `You are a knowledgeable assistant that provides structured responses based on provided context. Use ONLY the information from the context to structure your response.

Context:
${contextText}`;

  // Notify about initial context
  options?.onContextUpdate?.(initialContext);

  // Create streaming structured response
  const streamResponse = streamObject({
    model: config.languageModel,
    schema,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: query,
      },
    ],
    temperature: options?.temperature ?? 0.1,
  });

  logInfo('Streaming structured RAG response initiated', {
    operation: 'streaming_structured_rag_started',
    query: query.substring(0, 100),
    initialContextCount: initialContext.length,
    schemaName: schema.description || 'structured_response',
  });

  return streamResponse;
}

/**
 * Create a real-time RAG conversation stream
 */
export class RealTimeRAGConversation {
  private enhancer: ProgressiveContextEnhancer;
  private conversationHistory: Array<{ role: string; content: string; timestamp: number }> = [];

  constructor(private config: StreamingRAGConfig) {
    this.enhancer = new ProgressiveContextEnhancer(config.vectorStore, config);
  }

  /**
   * Add message to conversation and get streaming response
   */
  async addMessage(
    message: string,
    options?: {
      contextQuery?: string; // Use different query for context than the message
      onContextUpdate?: (context: StreamingContextResult[]) => void;
      temperature?: number;
    },
  ) {
    const timestamp = Date.now();
    this.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp,
    });

    // Use provided context query or the message itself
    const contextQuery = options?.contextQuery || message;

    // Get context for this message
    const context = await this.enhancer.getInitialContext(contextQuery);

    if (context.length > 0) {
      const contextText = this.enhancer.formatContextForStreaming(context);

      // Add context as system message
      this.conversationHistory.push({
        role: 'system',
        content: `[Context for your response based on "${contextQuery}"]\n${contextText}`,
        timestamp,
      });

      options?.onContextUpdate?.(context);
    }

    // Create messages for the API
    const messages = this.conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }));

    // Stream the response
    const streamResponse = streamText({
      model: this.config.languageModel,
      messages,
      temperature: options?.temperature ?? 0.1,
      onFinish: result => {
        // Add assistant response to history
        this.conversationHistory.push({
          role: 'assistant',
          content: result.text,
          timestamp: Date.now(),
        });
      },
    });

    logInfo('Real-time RAG conversation message processed', {
      operation: 'realtime_rag_conversation',
      messageLength: message.length,
      contextCount: context.length,
      historyLength: this.conversationHistory.length,
    });

    return streamResponse;
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Update context for the entire conversation
   */
  async refreshGlobalContext(query: string) {
    return this.enhancer.refreshContext(query);
  }
}

/**
 * Usage examples
 */
export const streamingRAGExamples = {
  /**
   * Basic streaming RAG
   */
  basic: `
import { createStreamingRAG } from './streaming-rag';
import { openai } from '@ai-sdk/openai';

const stream = await createStreamingRAG(
  'Explain React hooks with examples',
  {
    vectorStore,
    languageModel: openai('gpt-4o'),
    topK: 5,
    threshold: 0.8,
  },
  {
    onContextUpdate: (context) => {
      console.log(\`Updated context: \${context.length} documents\`);
    }
  }
);

for await (const chunk of stream.textStream) {
  process.stdout.write(chunk);
}
  `,

  /**
   * Real-time conversation
   */
  realtime: `
const conversation = new RealTimeRAGConversation({
  vectorStore,
  languageModel: openai('gpt-4o'),
  enableRealTimeSearch: true,
  contextRefreshInterval: 30000, // 30 seconds
});

// Start conversation
const response1 = await conversation.addMessage(
  'What are the best practices for React components?',
  {
    onContextUpdate: (context) => {
      console.log('New context available:', context.length);
    }
  }
);

// Continue conversation with context awareness
const response2 = await conversation.addMessage(
  'Can you show me an example?',
  {
    contextQuery: 'React component examples best practices' // More specific context query
  }
);
  `,

  /**
   * Streaming structured responses
   */
  structured: `
const analysisSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  examples: z.array(z.object({
    title: z.string(),
    description: z.string(),
    code: z.string().optional(),
  })),
  confidence: z.number().min(0).max(1),
});

const stream = await createStreamingStructuredRAG(
  'Analyze React hooks patterns',
  analysisSchema,
  config,
  {
    onPartialObject: (partial) => {
      if (partial.summary) {
        console.log('Summary:', partial.summary);
      }
      if (partial.keyPoints) {
        console.log('Key points so far:', partial.keyPoints.length);
      }
    }
  }
);

const finalResult = await stream.object;
  `,
};
