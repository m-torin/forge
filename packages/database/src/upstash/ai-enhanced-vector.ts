/**
 * AI-Enhanced Vector Operations
 * Extends the existing VectorOperations with AI SDK v5 embedding capabilities
 * Preserves all existing functionality while adding RAG-specific features
 */

import 'server-only';

import { openai } from '@ai-sdk/openai';
import { logError, logInfo } from '@repo/observability/server/next';
import { embed, embedMany, type EmbeddingModel } from 'ai';
import { VectorOperations } from './server';

type Dict = Record<string, unknown>;

/**
 * Configuration for AI-enhanced vector operations
 */
export interface AIVectorConfig {
  embeddingModel?:
    | EmbeddingModel<string>
    | 'text-embedding-3-small'
    | 'text-embedding-3-large'
    | 'text-embedding-ada-002';
  namespace?: string;
  dimensions?: number;
  retryConfig?: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
  };
}

/**
 * Result interface for AI-enhanced operations
 */
export interface AIVectorResult {
  success: boolean;
  count: number;
  ids: string[];
  processingTime?: number;
  embeddingTokens?: number;
}

/**
 * Enhanced Vector Operations with AI SDK v5 support
 * Extends existing VectorOperations with embedding generation capabilities
 */
export class AIEnhancedVectorOperations extends VectorOperations {
  private embeddingModel: EmbeddingModel<string>;
  private config: Required<AIVectorConfig>;

  constructor(config: AIVectorConfig = {}) {
    super(); // Use existing VectorOperations constructor

    // Initialize embedding model
    if (typeof config.embeddingModel === 'string' || !config.embeddingModel) {
      this.embeddingModel = openai.embedding(config.embeddingModel || 'text-embedding-3-small');
    } else {
      this.embeddingModel = config.embeddingModel;
    }

    // Set configuration with defaults
    this.config = {
      embeddingModel: config.embeddingModel || 'text-embedding-3-small',
      namespace: config.namespace || '',
      dimensions: config.dimensions || 1536,
      retryConfig: {
        maxRetries: config.retryConfig?.maxRetries || 3,
        baseDelay: config.retryConfig?.baseDelay || 1000,
        maxDelay: config.retryConfig?.maxDelay || 8000,
      },
    };
  }

  /**
   * Upsert data with AI SDK embedding generation
   * Generates embeddings using AI SDK v5 and stores in vector database
   */
  async upsertWithEmbedding(
    data: Array<{
      id: string;
      content: string;
      metadata?: Dict;
    }>,
    options?: {
      namespace?: string;
      batchSize?: number;
    },
  ): Promise<AIVectorResult> {
    const startTime = Date.now();
    const namespace = options?.namespace || this.config.namespace;

    try {
      if (!data || data.length === 0) {
        throw new Error('No data provided for embedding generation');
      }

      logInfo('Starting AI embedding generation', {
        operation: 'ai_vector_upsert_with_embedding',
        documentCount: data.length,
        namespace,
        embeddingModel:
          typeof this.config.embeddingModel === 'string' ? this.config.embeddingModel : 'custom',
      });

      // Generate embeddings using AI SDK
      const contents = data.map(item => item.content);
      const { embeddings, usage } = await this.retryOperation(async () => {
        return embedMany({
          model: this.embeddingModel,
          values: contents,
        });
      });

      // Format for Upstash Vector
      const vectorData = data.map((item, index) => ({
        id: item.id,
        vector: embeddings[index],
        metadata: {
          ...item.metadata,
          content: item.content,
          timestamp: new Date().toISOString(),
          embeddingModel:
            typeof this.config.embeddingModel === 'string' ? this.config.embeddingModel : 'custom',
        },
      }));

      // Use parent class bulk upsert with batching
      const _results = await this.bulkUpsert(vectorData, {
        namespace,
        batchSize: options?.batchSize || 100,
      });

      const processingTime = Date.now() - startTime;

      logInfo('AI embedding upsert completed', {
        operation: 'ai_vector_upsert_with_embedding_success',
        documentsProcessed: data.length,
        embeddingTokens: usage?.tokens,
        processingTime,
        namespace,
      });

      return {
        success: true,
        count: vectorData.length,
        ids: vectorData.map(item => item.id),
        processingTime,
        embeddingTokens: usage?.tokens,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logError('AI embedding upsert failed', {
        error: error instanceof Error ? error : new Error(String(error)),
        operation: 'ai_vector_upsert_with_embedding_error',
        dataCount: data?.length || 0,
        processingTime,
        namespace,
      });

      throw error;
    }
  }

  /**
   * Query vectors with AI SDK embedding generation
   * Generates query embedding and searches for similar vectors
   */
  async queryWithEmbedding(
    query: string,
    options?: {
      topK?: number;
      namespace?: string;
      includeMetadata?: boolean;
      includeData?: boolean;
      filter?: string;
      threshold?: number;
    },
  ): Promise<
    Array<{
      id: string | number;
      score: number;
      content?: string;
      metadata?: Dict;
    }>
  > {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Query cannot be empty');
      }

      logInfo('Starting AI embedding query', {
        operation: 'ai_vector_query_with_embedding',
        queryLength: query.length,
        namespace: options?.namespace || this.config.namespace,
        topK: options?.topK || 10,
      });

      // Generate query embedding
      const { embedding, usage } = await this.retryOperation(async () => {
        return embed({
          model: this.embeddingModel,
          value: query,
        });
      });

      // Query using parent class method
      const results = await this.query({
        vector: embedding,
        topK: options?.topK || 10,
        namespace: options?.namespace || this.config.namespace,
        includeMetadata: options?.includeMetadata ?? true,
        includeData: options?.includeData ?? true,
        filter: options?.filter,
      });

      // Filter by threshold if provided
      let filteredResults = results;
      if (options?.threshold !== undefined) {
        filteredResults = results.filter(result => result.score >= (options.threshold ?? 0));
      }

      logInfo('AI embedding query completed', {
        operation: 'ai_vector_query_with_embedding_success',
        resultsFound: filteredResults.length,
        queryTokens: usage?.tokens,
      });

      return filteredResults.map(result => ({
        id: result.id,
        score: result.score,
        content: result.metadata?.content as string,
        metadata: result.metadata,
      }));
    } catch (error) {
      logError('AI embedding query failed', {
        error: error instanceof Error ? error : new Error(String(error)),
        operation: 'ai_vector_query_with_embedding_error',
        query: query.substring(0, 100),
        namespace: options?.namespace || this.config.namespace,
      });

      throw error;
    }
  }

  /**
   * Upsert data using Upstash hosted embeddings (preserves existing functionality)
   * This method maintains compatibility with existing database package usage
   */
  async upsertWithUpstashEmbedding(
    data: Array<{
      id: string;
      content: string;
      metadata?: Dict;
    }>,
    options?: {
      namespace?: string;
      batchSize?: number;
    },
  ): Promise<AIVectorResult> {
    const startTime = Date.now();
    const namespace = options?.namespace || this.config.namespace;

    try {
      if (!data || data.length === 0) {
        throw new Error('No data provided for Upstash embedding');
      }

      logInfo('Starting Upstash hosted embedding upsert', {
        operation: 'ai_vector_upsert_upstash_embedding',
        documentCount: data.length,
        namespace,
      });

      // Format for Upstash Vector with data field (for hosted embeddings)
      const vectorData = data.map(item => ({
        id: item.id,
        data: item.content, // Using data field for Upstash hosted embeddings
        metadata: {
          ...item.metadata,
          content: item.content,
          timestamp: new Date().toISOString(),
          embeddingProvider: 'upstash_hosted',
        },
      }));

      // Use parent class bulk upsert
      const _results = await this.bulkUpsert(vectorData, {
        namespace,
        batchSize: options?.batchSize || 100,
      });

      const processingTime = Date.now() - startTime;

      logInfo('Upstash hosted embedding upsert completed', {
        operation: 'ai_vector_upsert_upstash_embedding_success',
        documentsProcessed: data.length,
        processingTime,
        namespace,
      });

      return {
        success: true,
        count: vectorData.length,
        ids: vectorData.map(item => item.id),
        processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logError('Upstash hosted embedding upsert failed', {
        error: error instanceof Error ? error : new Error(String(error)),
        operation: 'ai_vector_upsert_upstash_embedding_error',
        dataCount: data?.length || 0,
        processingTime,
        namespace,
      });

      throw error;
    }
  }

  /**
   * Query using Upstash hosted embeddings (preserves existing functionality)
   */
  async queryWithUpstashEmbedding(
    query: string,
    options?: {
      topK?: number;
      namespace?: string;
      includeMetadata?: boolean;
      includeData?: boolean;
      filter?: string;
      threshold?: number;
    },
  ): Promise<
    Array<{
      id: string | number;
      score: number;
      content?: string;
      metadata?: Dict;
    }>
  > {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Query cannot be empty');
      }

      logInfo('Starting Upstash hosted embedding query', {
        operation: 'ai_vector_query_upstash_embedding',
        queryLength: query.length,
        namespace: options?.namespace || this.config.namespace,
        topK: options?.topK || 10,
      });

      // Use parent class queryByText method (which uses Upstash hosted embeddings)
      const results = await this.queryByText(query, {
        topK: options?.topK || 10,
        namespace: options?.namespace || this.config.namespace,
        includeMetadata: options?.includeMetadata ?? true,
        includeData: options?.includeData ?? true,
        filter: options?.filter,
      });

      // Filter by threshold if provided
      let filteredResults = results;
      if (options?.threshold !== undefined) {
        filteredResults = results.filter(result => result.score >= (options.threshold ?? 0));
      }

      logInfo('Upstash hosted embedding query completed', {
        operation: 'ai_vector_query_upstash_embedding_success',
        resultsFound: filteredResults.length,
      });

      return filteredResults.map(result => ({
        id: result.id,
        score: result.score,
        content: result.data as string,
        metadata: result.metadata,
      }));
    } catch (error) {
      logError('Upstash hosted embedding query failed', {
        error: error instanceof Error ? error : new Error(String(error)),
        operation: 'ai_vector_query_upstash_embedding_error',
        query: query.substring(0, 100),
        namespace: options?.namespace || this.config.namespace,
      });

      throw error;
    }
  }

  /**
   * Enhanced semantic search with AI embeddings
   * Combines existing semantic search with AI SDK embedding generation
   */
  async semanticSearchWithAI(
    query: string,
    options?: {
      topK?: number;
      namespace?: string;
      threshold?: number;
      useUpstashEmbedding?: boolean;
      includeContent?: boolean;
    },
  ): Promise<
    Array<{
      id: string | number;
      score: number;
      content?: string;
      metadata?: Dict;
    }>
  > {
    const useUpstash = options?.useUpstashEmbedding ?? false;

    if (useUpstash) {
      return this.queryWithUpstashEmbedding(query, {
        topK: options?.topK,
        namespace: options?.namespace,
        threshold: options?.threshold,
        includeData: options?.includeContent,
        includeMetadata: true,
      });
    } else {
      return this.queryWithEmbedding(query, {
        topK: options?.topK,
        namespace: options?.namespace,
        threshold: options?.threshold,
        includeData: options?.includeContent,
        includeMetadata: true,
      });
    }
  }

  /**
   * Batch document processing with embeddings
   * Processes large document sets efficiently with batching and error recovery
   */
  async batchProcessDocuments(
    documents: Array<{
      id: string;
      content: string;
      metadata?: Dict;
    }>,
    options?: {
      namespace?: string;
      batchSize?: number;
      useUpstashEmbedding?: boolean;
      onProgress?: (processed: number, total: number) => void;
    },
  ): Promise<{
    success: boolean;
    totalProcessed: number;
    errors: Array<{ id: string; error: string }>;
    processingTime: number;
  }> {
    const startTime = Date.now();
    const batchSize = options?.batchSize || 50;
    const useUpstash = options?.useUpstashEmbedding ?? false;
    const errors: Array<{ id: string; error: string }> = [];
    let totalProcessed = 0;

    try {
      logInfo('Starting batch document processing', {
        operation: 'ai_vector_batch_process',
        totalDocuments: documents.length,
        batchSize,
        useUpstashEmbedding: useUpstash,
        namespace: options?.namespace || this.config.namespace,
      });

      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);

        try {
          if (useUpstash) {
            await this.upsertWithUpstashEmbedding(batch, {
              namespace: options?.namespace,
            });
          } else {
            await this.upsertWithEmbedding(batch, {
              namespace: options?.namespace,
            });
          }

          totalProcessed += batch.length;
          options?.onProgress?.(totalProcessed, documents.length);
        } catch (error) {
          // Log batch error but continue processing
          const errorMessage = error instanceof Error ? error.message : String(error);
          logError('Batch processing error', {
            error: error instanceof Error ? error : new Error(String(error)),
            operation: 'ai_vector_batch_process_error',
            batchStart: i,
            batchSize: batch.length,
          });

          // Add individual document errors
          batch.forEach(doc => {
            errors.push({ id: doc.id, error: errorMessage });
          });
        }
      }

      const processingTime = Date.now() - startTime;

      logInfo('Batch document processing completed', {
        operation: 'ai_vector_batch_process_complete',
        totalDocuments: documents.length,
        totalProcessed,
        errors: errors.length,
        processingTime,
      });

      return {
        success: errors.length < documents.length,
        totalProcessed,
        errors,
        processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logError('Batch document processing failed', {
        error: error instanceof Error ? error : new Error(String(error)),
        operation: 'ai_vector_batch_process_failed',
        totalDocuments: documents.length,
        processingTime,
      });

      throw error;
    }
  }

  /**
   * Get embedding model information
   */
  getEmbeddingModelInfo(): {
    model: string;
    dimensions: number;
    namespace: string;
  } {
    return {
      model: typeof this.config.embeddingModel === 'string' ? this.config.embeddingModel : 'custom',
      dimensions: this.config.dimensions,
      namespace: this.config.namespace,
    };
  }

  /**
   * Update embedding model configuration
   */
  updateConfig(newConfig: Partial<AIVectorConfig>): void {
    if (newConfig.embeddingModel) {
      if (typeof newConfig.embeddingModel === 'string') {
        this.embeddingModel = openai.embedding(newConfig.embeddingModel);
      } else {
        this.embeddingModel = newConfig.embeddingModel;
      }
      this.config.embeddingModel = newConfig.embeddingModel;
    }

    if (newConfig.namespace !== undefined) {
      this.config.namespace = newConfig.namespace;
    }

    if (newConfig.dimensions !== undefined) {
      this.config.dimensions = newConfig.dimensions;
    }

    if (newConfig.retryConfig) {
      this.config.retryConfig = { ...this.config.retryConfig, ...newConfig.retryConfig };
    }
  }

  /**
   * Retry operation with exponential backoff
   */
  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.config.retryConfig.maxRetries ?? 3,
    baseDelay: number = this.config.retryConfig.baseDelay ?? 1000,
  ): Promise<T> {
    let lastError: Error = new Error('No attempts made');

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
          this.config.retryConfig.maxDelay ?? 30000,
        );

        logInfo('Retrying operation after error', {
          operation: 'ai_vector_retry',
          attempt: attempt + 1,
          maxRetries,
          delay,
          error: lastError.message,
        });

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}

/**
 * Factory function to create AI-enhanced vector operations
 */
export function createAIVectorOperations(config: AIVectorConfig = {}): AIEnhancedVectorOperations {
  return new AIEnhancedVectorOperations(config);
}

/**
 * Factory function with environment-based configuration
 */
export function createAIVectorFromEnv(
  embeddingModel?: AIVectorConfig['embeddingModel'],
  namespace?: string,
): AIEnhancedVectorOperations {
  return new AIEnhancedVectorOperations({
    embeddingModel: embeddingModel || 'text-embedding-3-small',
    namespace: namespace || process.env.UPSTASH_VECTOR_NAMESPACE || '',
  });
}

// Create a default instance for convenience
export const aiVectorOps = createAIVectorFromEnv();

/**
 * Export convenience functions
 */
export const {
  upsertWithEmbedding,
  queryWithEmbedding,
  upsertWithUpstashEmbedding,
  queryWithUpstashEmbedding,
  semanticSearchWithAI,
  batchProcessDocuments,
  getEmbeddingModelInfo,
} = aiVectorOps;
