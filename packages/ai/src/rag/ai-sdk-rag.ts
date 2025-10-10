/**
 * RAG implementation using AI SDK patterns
 * Compatible with Vercel AI SDK useChat hook
 */

import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { logWarn } from '@repo/observability/server/next';
import { embed, embedMany, stepCountIs, streamText, type StopCondition } from 'ai';
import { safeEnv } from '../../env';
import { createUpstashVectorTools, type UpstashAIConfig } from '../vector/ai-sdk-integration';

export interface RAGChatConfig {
  vectorUrl: string;
  vectorToken: string;
  model?: string;
  provider?: 'openai' | 'anthropic';
  systemPrompt?: string;
  namespace?: string;
  useUpstashEmbedding?: boolean;
  maxSteps?: number;
  stopWhen?: StopCondition<any> | StopCondition<any>[];
}

/**
 * Create a RAG chat handler compatible with Vercel AI SDK
 */
export function createRAGChatHandler(config: RAGChatConfig) {
  const tools = createUpstashVectorTools({
    url: config.vectorUrl,
    token: config.vectorToken,
    namespace: config.namespace,
  });

  return async (req: Request) => {
    const { messages } = await req.json();

    // Select AI provider
    const getModel = () => {
      const provider = config.provider || 'openai';
      const modelName =
        config.model || (provider === 'openai' ? 'gpt-4o' : 'claude-3-5-sonnet-20241022');

      switch (provider) {
        case 'anthropic':
          return anthropic(modelName);
        case 'openai':
        default:
          return openai(modelName);
      }
    };

    const stopWhen = config.stopWhen ?? stepCountIs(config.maxSteps || 3);

    const result = streamText({
      model: getModel(),
      messages,
      system:
        config.systemPrompt ||
        `You are a helpful assistant. Check your knowledge base before answering any questions.
        Only respond to questions using information from tool calls.
        if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
      tools,
      stopWhen,
    });

    return result.toTextStreamResponse();
  };
}

/**
 * Create a simple RAG system for quick setup
 */
export class AISDKRag {
  private vectorConfig: UpstashAIConfig;
  private useUpstashEmbedding: boolean;

  constructor(config: RAGChatConfig) {
    this.vectorConfig = {
      vectorUrl: config.vectorUrl,
      vectorToken: config.vectorToken,
      namespace: config.namespace,
    };
    this.useUpstashEmbedding = config.useUpstashEmbedding || false;
  }

  /**
   * Add content to the knowledge base
   */
  async addContent(content: string, metadata?: Record<string, any>): Promise<string> {
    const tools = createUpstashVectorTools(this.vectorConfig);
    const result = await tools.addResource.execute?.(
      { content, metadata },
      { toolCallId: 'add-content', messages: [] },
    );
    // AI SDK tools can return AsyncIterable, but our implementation returns string
    return typeof result === 'string' ? result : String(result);
  }

  /**
   * Add a document with automatic chunking
   */
  async addDocument(
    content: string,
    title?: string,
    metadata?: Record<string, any>,
  ): Promise<string> {
    const tools = createUpstashVectorTools(this.vectorConfig);
    const result = await tools.addDocument.execute?.(
      { content, title, metadata },
      { toolCallId: 'add-document', messages: [] },
    );
    // AI SDK tools can return AsyncIterable, but our implementation returns string
    return typeof result === 'string' ? result : String(result);
  }

  /**
   * Search the knowledge base
   */
  async search(
    query: string,
    topK?: number,
  ): Promise<
    Array<{
      content: string;
      score: number;
      metadata: any;
    }>
  > {
    const tools = createUpstashVectorTools(this.vectorConfig);
    const results = await tools.getInformation.execute?.(
      { question: query, topK: topK ?? 4 },
      { toolCallId: 'get-information', messages: [] },
    );

    // Handle the union type: results can be AsyncIterable or direct array
    if (!results) return [];

    // For AsyncIterable, we need to collect the results
    if (Symbol.asyncIterator in Object(results)) {
      const collected = [];
      for await (const chunk of results as any) {
        if (Array.isArray(chunk)) {
          collected.push(...chunk);
        } else {
          collected.push(chunk);
        }
      }
      return collected.map((result: any) => ({
        content: String(result.data || result.id),
        score: result.score || 0,
        metadata: result.metadata,
      }));
    }

    // Direct array or single result
    const resultsArray = Array.isArray(results) ? results : [results];
    return resultsArray.map((result: any) => ({
      content: String(result.data || result.id),
      score: result.score || 0,
      metadata: result.metadata,
    }));
  }

  /**
   * Query with context (simple RAG without streaming)
   */
  async query(
    question: string,
    options?: {
      model?: string;
      provider?: 'openai' | 'anthropic';
      systemPrompt?: string;
    },
  ) {
    // Search for relevant context
    const searchResults = await this.search(question, 5);

    // Format context
    const context = searchResults
      .map((result: any) => `Content (score: ${result.score.toFixed(3)}): ${result.content}`)
      .join('\n');

    // Generate response with context
    const provider = options?.provider || 'openai';
    const modelName =
      options?.model || (provider === 'openai' ? 'gpt-4o' : 'claude-3-5-sonnet-20241022');

    const model = provider === 'anthropic' ? anthropic(modelName) : openai(modelName);

    const result = streamText({
      model,
      messages: [
        {
          role: 'system',

          content:
            options?.systemPrompt ||
            `You are a helpful assistant. Use the following context to answer the user's question. Only respond based on the provided context. If the context doesn't contain relevant information, respond "Sorry, I don't know."

Context:
${context}`,
        },
        {
          role: 'user',

          content: question,
        },
      ],
    });

    return result.text;
  }
}

/**
 * Create AI SDK RAG instance from environment
 */
export function createAISDKRagFromEnv(options?: {
  namespace?: string;
  useUpstashEmbedding?: boolean;
}): AISDKRag | null {
  const env = safeEnv();
  const vectorUrl = env.UPSTASH_VECTOR_REST_URL;
  const vectorToken = env.UPSTASH_VECTOR_REST_TOKEN;

  if (!vectorUrl || !vectorToken) {
    logWarn('Missing UPSTASH_VECTOR_REST_URL or UPSTASH_VECTOR_REST_TOKEN', {
      operation: 'ai_sdk_rag_initialization',
    });
    return null;
  }

  return new AISDKRag({
    vectorUrl,
    vectorToken,
    namespace: options?.namespace ?? env.VECTOR_NAMESPACE,
    useUpstashEmbedding: options?.useUpstashEmbedding ?? false,
  });
}

/**
 * Quick RAG setup function - matches AI SDK v5 documentation pattern
 * Create and initialize a RAG system with documents in one call
 */
export async function quickRAG(
  documents: Array<{ content: string; title?: string; metadata?: any }>,
  config?: {
    vectorUrl?: string;
    vectorToken?: string;
    namespace?: string;
    useUpstashEmbedding?: boolean;
  },
): Promise<AISDKRag> {
  const env = safeEnv();
  const rag = config
    ? new AISDKRag({
        vectorUrl: config.vectorUrl || env.UPSTASH_VECTOR_REST_URL || '',
        vectorToken: config.vectorToken || env.UPSTASH_VECTOR_REST_TOKEN || '',
        namespace: config.namespace,
        useUpstashEmbedding: config.useUpstashEmbedding,
      })
    : createAISDKRagFromEnv(config);

  if (!rag) {
    throw new Error('Failed to create RAG instance. Check your Upstash Vector credentials.');
  }

  // Add all documents
  for (const doc of documents) {
    await rag.addDocument(doc.content, doc.title, doc.metadata);
  }

  return rag;
}

/**
 * One-shot RAG query
 */
export async function ragQuery(
  question: string,
  documents: Array<{ content: string; title?: string; metadata?: any }>,
  config?: {
    vectorUrl?: string;
    vectorToken?: string;
    namespace?: string;
    useUpstashEmbedding?: boolean;
    model?: string;
    provider?: 'openai' | 'anthropic';
  },
): Promise<string> {
  const rag = await quickRAG(documents, config);
  return rag.query(question, {
    model: config?.model,
    provider: config?.provider,
  });
}

/**
 * Generate a single embedding - matches AI SDK documentation pattern
 */
export async function generateEmbedding(value: string): Promise<number[]> {
  const input = value.replaceAll('\n', ' ');
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: input,
  });
  return embedding;
}

/**
 * Generate multiple embeddings in batch - AI SDK v5 pattern
 */
export async function generateEmbeddings(values: string[]): Promise<number[][]> {
  const cleanedValues = values.map(value => value.replaceAll('\n', ' '));
  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: cleanedValues,
  });
  return embeddings;
}

/**
 * Batch process documents with embeddings
 */
export async function batchProcessDocuments(
  documents: Array<{
    id: string;
    content: string;
    metadata?: Record<string, any>;
  }>,
  config?: {
    vectorUrl?: string;
    vectorToken?: string;
    namespace?: string;
    chunkSize?: number;
  },
): Promise<{
  processed: number;
  failed: number;
  errors: string[];
}> {
  const env = safeEnv();
  const result = { processed: 0, failed: 0, errors: [] as string[] };

  try {
    const rag = new AISDKRag({
      vectorUrl: config?.vectorUrl || env.UPSTASH_VECTOR_REST_URL || '',
      vectorToken: config?.vectorToken || env.UPSTASH_VECTOR_REST_TOKEN || '',
      namespace: config?.namespace,
      useUpstashEmbedding: false,
    });

    // Process documents in batches for efficiency
    const batchSize = config?.chunkSize || 10;

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);

      try {
        // Add documents concurrently within batch
        await Promise.all(
          batch.map(async doc => {
            await rag.addDocument(doc.content, doc.id, doc.metadata);
          }),
        );

        result.processed += batch.length;
      } catch (error) {
        result.failed += batch.length;
        result.errors.push(
          `Batch ${i / batchSize + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }
  } catch (error) {
    result.failed = documents.length;
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
  }

  return result;
}

/**
 * Find relevant content - matches AI SDK documentation pattern
 */
export async function findRelevantContent(
  userQuery: string,
  config?: {
    vectorUrl?: string;
    vectorToken?: string;
    namespace?: string;
    topK?: number;
    threshold?: number;
  },
) {
  const env = safeEnv();
  const vectorUrl = config?.vectorUrl || env.UPSTASH_VECTOR_REST_URL;
  const vectorToken = config?.vectorToken || env.UPSTASH_VECTOR_REST_TOKEN;

  if (!vectorUrl || !vectorToken) {
    throw new Error('Vector database not configured');
  }

  const rag = new AISDKRag({
    vectorUrl,
    vectorToken,
    namespace: config?.namespace,
    useUpstashEmbedding: false,
  });

  const results = await rag.search(userQuery, config?.topK || 4);

  // Filter by threshold if provided
  if (config?.threshold !== undefined) {
    return results.filter(result => result.score >= (config.threshold as number));
  }

  return results.map(result => ({
    name: result.content,
    similarity: result.score,
  }));
}

// Export examples for documentation
export const examples = {
  /**
   * Basic RAG setup
   */
  basic: async () => {
    const rag = createAISDKRagFromEnv();
    if (!rag) throw new Error('Missing Upstash Vector credentials');

    await rag.addContent(
      "Paris is the capital of France. It's known for the Eiffel Tower and amazing cuisine.",
    );
    const answer = await rag.query('What is Paris known for?');
    return answer;
  },

  /**
   * Document-based RAG
   */
  documents: async (documents: Array<{ content: string; title?: string }>) => {
    const rag = await quickRAG(documents);
    const answer = await rag.query('Summarize the main points from these documents.');
    return answer;
  },

  /**
   * One-shot query
   */
  oneShot: async (question: string, content: string) => {
    return ragQuery(question, [{ content }]);
  },
};
