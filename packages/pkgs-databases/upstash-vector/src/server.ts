/**
 * Server-side Upstash Vector client with AI embeddings integration
 */

import { Index } from '@upstash/vector';
import { mergeConfig, validateConfig } from './config';
import type {
  AIModelConfig,
  AIProvider,
  ClusteringOptions,
  ClusteringResult,
  DocumentChunk,
  EmbeddingResult,
  HybridSearchOptions,
  SimilarityResult,
  SimilaritySearchOptions,
  UpstashVectorConfig,
  VectorAnalytics,
  VectorClient,
  VectorIndexStats,
  VectorQuery,
  VectorRecord,
  VectorResult,
} from './types';

/**
 * Enhanced Vector client with AI embeddings and advanced search
 */
class UpstashVectorClient implements VectorClient {
  public index: Index;
  private config: UpstashVectorConfig;
  private embeddingProviders = new Map<string, any>();

  constructor(config: Partial<UpstashVectorConfig> = {}) {
    this.config = mergeConfig(config);
    this.index = new Index(this.config);
  }

  /**
   * Configure AI embedding provider
   */
  configureEmbeddingProvider(provider: AIProvider, config: AIModelConfig): void {
    switch (provider) {
      case 'openai':
        this.configureOpenAI(config);
        break;
      case 'anthropic':
        this.configureAnthropic(config);
        break;
      case 'cohere':
        this.configureCohere(config);
        break;
      case 'huggingface':
        this.configureHuggingFace(config);
        break;
      case 'custom':
        this.configureCustomProvider(config);
        break;
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  /**
   * Configure OpenAI embeddings
   */
  private async configureOpenAI(config: AIModelConfig): Promise<void> {
    try {
      const { openai } = await import('ai');
      const { embed, embedMany } = await import('ai');

      this.embeddingProviders.set('openai', {
        embed: async (text: string) => {
          const { embedding } = await embed({
            model: openai.embedding(config.model || 'text-embedding-3-small'),
            value: text,
          });
          return embedding;
        },
        embedMany: async (texts: string[]) => {
          const { embeddings } = await embedMany({
            model: openai.embedding(config.model || 'text-embedding-3-small'),
            values: texts,
          });
          return embeddings;
        },
      });
    } catch (error) {
      throw new Error(`Failed to configure OpenAI: ${error}. Make sure 'ai' package is installed.`);
    }
  }

  /**
   * Configure Anthropic embeddings (placeholder - Anthropic doesn't provide embeddings yet)
   */
  private configureAnthropic(config: AIModelConfig): void {
    throw new Error('Anthropic embeddings not yet supported. Use OpenAI or Cohere instead.');
  }

  /**
   * Configure Cohere embeddings
   */
  private async configureCohere(config: AIModelConfig): Promise<void> {
    try {
      const { cohere } = await import('ai');
      const { embed, embedMany } = await import('ai');

      this.embeddingProviders.set('cohere', {
        embed: async (text: string) => {
          const { embedding } = await embed({
            model: cohere.embedding(config.model || 'embed-english-v3.0'),
            value: text,
          });
          return embedding;
        },
        embedMany: async (texts: string[]) => {
          const { embeddings } = await embedMany({
            model: cohere.embedding(config.model || 'embed-english-v3.0'),
            values: texts,
          });
          return embeddings;
        },
      });
    } catch (error) {
      throw new Error(`Failed to configure Cohere: ${error}. Make sure 'ai' package is installed.`);
    }
  }

  /**
   * Configure HuggingFace embeddings
   */
  private configureHuggingFace(config: AIModelConfig): void {
    this.embeddingProviders.set('huggingface', {
      embed: async (text: string) => {
        const response = await fetch(
          `${config.baseURL || 'https://api-inference.huggingface.co'}/pipeline/feature-extraction/${config.model}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: text }),
          },
        );

        if (!response.ok) {
          throw new Error(`HuggingFace API error: ${response.statusText}`);
        }

        return await response.json();
      },
      embedMany: async (texts: string[]) => {
        const embeddings = [];
        for (const text of texts) {
          const embedding = await this.embeddingProviders.get('huggingface').embed(text);
          embeddings.push(embedding);
        }
        return embeddings;
      },
    });
  }

  /**
   * Configure custom embedding provider
   */
  private configureCustomProvider(config: AIModelConfig): void {
    if (!config.baseURL) {
      throw new Error('Custom provider requires baseURL');
    }

    this.embeddingProviders.set('custom', {
      embed: async (text: string) => {
        const response = await fetch(config.baseURL!, {
          method: 'POST',
          headers: {
            Authorization: config.apiKey ? `Bearer ${config.apiKey}` : '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, model: config.model }),
        });

        if (!response.ok) {
          throw new Error(`Custom provider API error: ${response.statusText}`);
        }

        const result = await response.json();
        return result.embedding || result.data || result;
      },
      embedMany: async (texts: string[]) => {
        const response = await fetch(config.baseURL!, {
          method: 'POST',
          headers: {
            Authorization: config.apiKey ? `Bearer ${config.apiKey}` : '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ texts, model: config.model }),
        });

        if (!response.ok) {
          throw new Error(`Custom provider API error: ${response.statusText}`);
        }

        const result = await response.json();
        return result.embeddings || result.data || result;
      },
    });
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbedding(
    text: string | string[],
    provider: AIProvider = 'openai',
  ): Promise<EmbeddingResult> {
    const embeddingProvider = this.embeddingProviders.get(provider);
    if (!embeddingProvider) {
      throw new Error(
        `Embedding provider '${provider}' not configured. Call configureEmbeddingProvider() first.`,
      );
    }

    try {
      if (Array.isArray(text)) {
        const embeddings = await embeddingProvider.embedMany(text);
        return {
          embeddings,
          model: provider,
          dimensions: embeddings[0]?.length || 0,
        };
      } else {
        const embedding = await embeddingProvider.embed(text);
        return {
          embeddings: [embedding],
          model: provider,
          dimensions: embedding.length,
        };
      }
    } catch (error) {
      throw new Error(`Failed to generate embeddings: ${error}`);
    }
  }

  // Implement VectorClient interface

  async upsert<T extends Record<string, any> = Record<string, any>>(
    vectors: VectorRecord<T>[],
  ): Promise<void> {
    const formattedVectors = vectors.map(v => ({
      id: v.id,
      vector: v.vector,
      metadata: v.metadata,
      data: v.data,
    }));

    await this.index.upsert(formattedVectors);
  }

  async query<T extends Record<string, any> = Record<string, any>>(
    options: VectorQuery,
  ): Promise<SimilarityResult<T>[]> {
    const queryOptions: any = {
      topK: options.topK || 10,
      includeVectors: options.includeVectors || false,
      includeMetadata: options.includeMetadata !== false,
      includeData: options.includeData !== false,
    };

    if (options.filter) {
      queryOptions.filter = options.filter;
    }

    if (options.namespace) {
      queryOptions.namespace = options.namespace;
    }

    let queryVector = options.vector;

    // If data is provided instead of vector, generate embedding
    if (options.data && !options.vector) {
      const embedding = await this.generateEmbedding(options.data);
      queryVector = embedding.embeddings[0];
    }

    if (!queryVector) {
      throw new Error('Either vector or data must be provided for query');
    }

    const results = await this.index.query({
      vector: queryVector,
      ...queryOptions,
    });

    return (
      results.matches?.map(match => ({
        id: match.id,
        score: match.score,
        vector: match.vector,
        metadata: match.metadata as T,
        data: match.data,
      })) || []
    );
  }

  async fetch<T extends Record<string, any> = Record<string, any>>(
    ids: string[],
    namespace?: string,
  ): Promise<VectorRecord<T>[]> {
    const options: any = { ids };
    if (namespace) options.namespace = namespace;

    const results = await this.index.fetch(options);

    return Object.entries(results.vectors || {}).map(([id, vector]) => ({
      id,
      vector: (vector as any).vector || [],
      metadata: (vector as any).metadata as T,
      data: (vector as any).data,
    }));
  }

  async delete(ids: string[], namespace?: string): Promise<void> {
    const options: any = { ids };
    if (namespace) options.namespace = namespace;

    await this.index.delete(options);
  }

  async similaritySearch<T extends Record<string, any> = Record<string, any>>(
    vector: number[],
    options: SimilaritySearchOptions = {},
  ): Promise<SimilarityResult<T>[]> {
    return this.query({
      vector,
      topK: options.topK,
      filter: options.filter,
      includeVectors: options.includeVectors,
      includeMetadata: options.includeMetadata,
      includeData: options.includeData,
      namespace: options.namespace,
    });
  }

  async semanticSearch<T extends Record<string, any> = Record<string, any>>(
    text: string,
    options: SimilaritySearchOptions = {},
  ): Promise<SimilarityResult<T>[]> {
    return this.query({
      data: text,
      topK: options.topK,
      filter: options.filter,
      includeVectors: options.includeVectors,
      includeMetadata: options.includeMetadata,
      includeData: options.includeData,
      namespace: options.namespace,
    });
  }

  async hybridSearch<T extends Record<string, any> = Record<string, any>>(
    query: string,
    options: HybridSearchOptions = {},
  ): Promise<SimilarityResult<T>[]> {
    // For now, implement basic semantic search
    // In a full implementation, this would combine vector and keyword search
    const vectorResults = await this.semanticSearch<T>(query, options);

    // Apply keyword boosting if specified
    if (options.keywords && options.keywords.length > 0) {
      const keywordWeight = options.keywordWeight || 0.3;

      vectorResults.forEach(result => {
        if (result.data || result.metadata) {
          const content =
            `${result.data || ''} ${JSON.stringify(result.metadata || {})}`.toLowerCase();
          const keywordMatches = options.keywords!.filter(keyword =>
            content.includes(keyword.toLowerCase()),
          ).length;

          // Boost score based on keyword matches
          if (keywordMatches > 0) {
            result.score =
              result.score * (1 - keywordWeight) +
              keywordWeight * (keywordMatches / options.keywords!.length);
          }
        }
      });

      // Re-sort by adjusted score
      vectorResults.sort((a, b) => b.score - a.score);
    }

    return vectorResults;
  }

  async info(): Promise<VectorIndexStats> {
    const info = await this.index.info();

    return {
      vectorCount: info.vectorCount || 0,
      pendingVectorCount: info.pendingVectorCount || 0,
      indexSize: info.indexSize || 0,
      dimension: info.dimension || 0,
      similarityFunction: info.similarityFunction || 'cosine',
      namespaces: info.namespaces || {},
    };
  }

  async reset(): Promise<void> {
    await this.index.reset();
  }

  async listNamespaces(): Promise<any[]> {
    const info = await this.info();
    return Object.entries(info.namespaces).map(([name, stats]) => ({
      name,
      vectorCount: stats.vectorCount,
      ...stats,
    }));
  }

  async getAnalytics(): Promise<VectorAnalytics> {
    const info = await this.info();

    // Basic analytics - in a full implementation, this would gather more detailed metrics
    return {
      totalVectors: info.vectorCount,
      averageQueryTime: 0, // Would need to track this
      popularQueries: [], // Would need to implement query tracking
      dimensionStats: {
        min: 0,
        max: info.dimension,
        avg: info.dimension / 2,
        std: 0,
      },
    };
  }

  async cluster(options: ClusteringOptions): Promise<ClusteringResult> {
    // This is a placeholder - clustering would typically be implemented server-side
    throw new Error('Clustering not yet implemented. This would require server-side processing.');
  }

  /**
   * Chunk document into smaller pieces for vector storage
   */
  chunkDocument(
    content: string,
    options: {
      chunkSize?: number;
      chunkOverlap?: number;
      documentId?: string;
      metadata?: Record<string, any>;
    } = {},
  ): DocumentChunk[] {
    const {
      chunkSize = 1000,
      chunkOverlap = 200,
      documentId = `doc_${Date.now()}`,
      metadata = {},
    } = options;

    const chunks: DocumentChunk[] = [];
    let startIndex = 0;
    let chunkIndex = 0;

    while (startIndex < content.length) {
      const endIndex = Math.min(startIndex + chunkSize, content.length);
      const chunkContent = content.slice(startIndex, endIndex);

      chunks.push({
        id: `${documentId}_chunk_${chunkIndex}`,
        content: chunkContent,
        metadata: {
          documentId,
          chunkIndex,
          startChar: startIndex,
          endChar: endIndex,
          ...metadata,
        },
      });

      startIndex = endIndex - chunkOverlap;
      chunkIndex++;

      // Prevent infinite loop
      if (startIndex >= endIndex) break;
    }

    return chunks;
  }

  /**
   * Index document chunks with embeddings
   */
  async indexDocument(
    document: string | DocumentChunk[],
    options: {
      documentId?: string;
      metadata?: Record<string, any>;
      chunkSize?: number;
      chunkOverlap?: number;
      provider?: AIProvider;
      namespace?: string;
    } = {},
  ): Promise<void> {
    const { documentId = `doc_${Date.now()}`, provider = 'openai', namespace } = options;

    let chunks: DocumentChunk[];

    if (typeof document === 'string') {
      chunks = this.chunkDocument(document, {
        documentId,
        chunkSize: options.chunkSize,
        chunkOverlap: options.chunkOverlap,
        metadata: options.metadata,
      });
    } else {
      chunks = document;
    }

    // Generate embeddings for all chunks
    const texts = chunks.map(chunk => chunk.content);
    const embeddings = await this.generateEmbedding(texts, provider);

    // Create vector records
    const vectors: VectorRecord[] = chunks.map((chunk, index) => ({
      id: chunk.id,
      vector: embeddings.embeddings[index],
      metadata: chunk.metadata,
      data: chunk.content,
    }));

    // Upsert in batches
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await this.upsert(batch);
    }
  }
}

/**
 * Create vector client instance
 */
export function createVectorClient(config?: Partial<UpstashVectorConfig>): UpstashVectorClient {
  return new UpstashVectorClient(config);
}

/**
 * Safe vector operation wrapper
 */
export async function safeVectorOperation<T>(
  operation: () => Promise<T>,
): Promise<VectorResult<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

// Default client
let defaultClient: UpstashVectorClient | null = null;

/**
 * Get or create default vector client
 */
export function getVectorClient(config?: Partial<UpstashVectorConfig>): UpstashVectorClient {
  if (!defaultClient || config) {
    defaultClient = createVectorClient(config);
  }
  return defaultClient;
}

/**
 * Default vector client instance
 */
export const vector = getVectorClient();

// Re-export types and utilities
export { mergeConfig, validateConfig };
export type {
  AIModelConfig,
  AIProvider,
  DocumentChunk,
  EmbeddingResult,
  SimilarityResult,
  UpstashVectorConfig,
  VectorClient,
  VectorRecord,
  VectorResult,
};
