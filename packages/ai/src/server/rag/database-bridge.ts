/**
 * RAG Database Bridge Layer
 * Bridges AI package RAG implementations with database package vector operations
 * Provides unified interface while leveraging existing database infrastructure
 */

import {
  AIEnhancedVectorOperations,
  createAIVectorFromEnv,
  type AIVectorConfig,
} from '@repo/database/upstash/ai-enhanced';
import { logDebug, logError, logInfo } from '@repo/observability/server/next';
import type { EmbeddingModel } from 'ai';
import { ragRetry } from './retry-strategies';

/**
 * Configuration for RAG-Database bridge
 */
export interface RAGDatabaseConfig {
  vectorConfig?: AIVectorConfig;
  namespace?: string;
  embeddingModel?: EmbeddingModel<string> | string;
  useUpstashEmbedding?: boolean;
  retryConfig?: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
  };
}

/**
 * RAG Database Bridge - Adapts database vector operations for RAG use cases
 * Provides a clean interface between AI package RAG and database package vectors
 */
export class RAGDatabaseBridge {
  private vectorOps: AIEnhancedVectorOperations;
  private config: Required<RAGDatabaseConfig>;

  constructor(config: RAGDatabaseConfig = {}) {
    // Initialize AI-enhanced vector operations from database package
    this.vectorOps = config.vectorConfig
      ? new AIEnhancedVectorOperations(config.vectorConfig)
      : createAIVectorFromEnv(config.embeddingModel as any, config.namespace);

    this.config = {
      vectorConfig: config.vectorConfig || {},
      namespace: config.namespace || process.env.UPSTASH_VECTOR_NAMESPACE || '',
      embeddingModel: config.embeddingModel || 'text-embedding-3-small',
      useUpstashEmbedding: config.useUpstashEmbedding ?? false,
      retryConfig: {
        maxRetries: config.retryConfig?.maxRetries || 3,
        baseDelay: config.retryConfig?.baseDelay || 1000,
        maxDelay: config.retryConfig?.maxDelay || 8000,
      },
    };

    logDebug('RAG Database Bridge initialized', {
      operation: 'rag_database_bridge_init',
      namespace: this.config.namespace,
      useUpstashEmbedding: this.config.useUpstashEmbedding,
      embeddingModel:
        typeof this.config.embeddingModel === 'string' ? this.config.embeddingModel : 'custom',
    });
  }

  /**
   * Add documents to the vector store
   * Compatible with existing RAG interfaces while using database package
   * Enhanced with retry, circuit breaker, and monitoring
   */
  async addDocuments(
    documents: Array<{
      id: string;
      content: string;
      metadata?: Record<string, any>;
    }>,
    options?: {
      namespace?: string;
      batchSize?: number;
    },
  ): Promise<{
    success: boolean;
    count: number;
    ids: string[];
    processingTime?: number;
  }> {
    try {
      const result = await ragRetry.vector(async () =>
        this.config.useUpstashEmbedding
          ? await this.vectorOps.upsertWithUpstashEmbedding(documents, {
              namespace: options?.namespace || this.config.namespace,
              batchSize: options?.batchSize,
            })
          : await this.vectorOps.upsertWithEmbedding(documents, {
              namespace: options?.namespace || this.config.namespace,
              batchSize: options?.batchSize,
            }),
      );

      logInfo('Documents added to vector store', {
        operation: 'rag_database_bridge_add_documents',
        documentCount: documents.length,
        namespace: options?.namespace || this.config.namespace,
        useUpstashEmbedding: this.config.useUpstashEmbedding,
        processingTime: result.processingTime,
      });

      return result;
    } catch (error) {
      logError('Failed to add documents to vector store', {
        error: error instanceof Error ? error : new Error(String(error)),
        operation: 'rag_database_bridge_add_documents_error',
        documentCount: documents.length,
        namespace: options?.namespace || this.config.namespace,
      });
      throw error;
    }
  }

  /**
   * Query documents from the vector store
   * Returns results in RAG-compatible format
   * Enhanced with retry, circuit breaker, and monitoring
   */
  async queryDocuments(
    query: string,
    options?: {
      topK?: number;
      namespace?: string;
      threshold?: number;
      includeContent?: boolean;
    },
  ): Promise<
    Array<{
      id: string | number;
      score: number;
      content?: string;
      metadata?: Record<string, any>;
    }>
  > {
    try {
      const results = await ragRetry.vector(
        async () =>
          await this.vectorOps.semanticSearchWithAI(query, {
            topK: options?.topK || 5,
            namespace: options?.namespace || this.config.namespace,
            threshold: options?.threshold || 0.7,
            useUpstashEmbedding: this.config.useUpstashEmbedding,
            includeContent: options?.includeContent ?? true,
          }),
      );

      logInfo('Documents queried from vector store', {
        operation: 'rag_database_bridge_query_documents',
        query: query.substring(0, 100),
        resultsFound: results.length,
        namespace: options?.namespace || this.config.namespace,
        topK: options?.topK || 5,
      });

      return results;
    } catch (error) {
      logError('Failed to query documents from vector store', {
        error: error instanceof Error ? error : new Error(String(error)),
        operation: 'rag_database_bridge_query_documents_error',
        query: query.substring(0, 100),
        namespace: options?.namespace || this.config.namespace,
      });
      throw error;
    }
  }

  /**
   * Batch process documents with progress tracking
   * Useful for large document ingestion workflows
   */
  async batchAddDocuments(
    documents: Array<{
      id: string;
      content: string;
      metadata?: Record<string, any>;
    }>,
    options?: {
      namespace?: string;
      batchSize?: number;
      onProgress?: (processed: number, total: number) => void;
      onError?: (error: { id: string; error: string }) => void;
    },
  ): Promise<{
    success: boolean;
    totalProcessed: number;
    errors: Array<{ id: string; error: string }>;
    processingTime: number;
  }> {
    try {
      const result = await this.vectorOps.batchProcessDocuments(documents, {
        namespace: options?.namespace || this.config.namespace,
        batchSize: options?.batchSize || 50,
        useUpstashEmbedding: this.config.useUpstashEmbedding,
        onProgress: options?.onProgress,
      });

      // Notify about individual errors
      if (options?.onError) {
        result.errors.forEach(options.onError);
      }

      logInfo('Batch document processing completed', {
        operation: 'rag_database_bridge_batch_add_documents',
        totalDocuments: documents.length,
        totalProcessed: result.totalProcessed,
        errors: result.errors.length,
        processingTime: result.processingTime,
        namespace: options?.namespace || this.config.namespace,
      });

      return result;
    } catch (error) {
      logError('Batch document processing failed', {
        error: error instanceof Error ? error : new Error(String(error)),
        operation: 'rag_database_bridge_batch_add_documents_error',
        totalDocuments: documents.length,
        namespace: options?.namespace || this.config.namespace,
      });
      throw error;
    }
  }

  /**
   * List all documents in the vector store
   * Essential for hybrid search keyword functionality
   */
  async listAllDocuments(options?: {
    namespace?: string;
    limit?: number;
    startId?: string;
    filters?: Record<string, any>;
  }): Promise<
    Array<{
      id: string | number;
      content: string;
      metadata?: Record<string, any>;
    }>
  > {
    try {
      // Use vector query with a very broad search to get all documents
      // This is a simplified implementation - in production you might use
      // dedicated list operations if available in your vector store
      const results = await this.vectorOps.query({
        vector: new Array(1536).fill(0), // Zero vector to get all documents
        topK: options?.limit || 1000,
        includeMetadata: true,
        includeVectors: false,
        namespace: options?.namespace || this.config.namespace,
        filter: (options?.filters as any) || undefined,
      });

      const documents =
        results?.map(result => ({
          id: result.id || '',
          content: (result.metadata?.content as string) || (result as any).content || '',
          metadata: result.metadata,
        })) || [];

      logInfo('Listed all documents from vector store', {
        operation: 'rag_database_bridge_list_all_documents',
        documentsFound: documents.length,
        namespace: options?.namespace || this.config.namespace,
        limit: options?.limit || 1000,
      });

      return documents.filter(doc => doc.content); // Only return docs with content
    } catch (error) {
      logError('Failed to list all documents from vector store', {
        error: error instanceof Error ? error : new Error(String(error)),
        operation: 'rag_database_bridge_list_all_documents_error',
        namespace: options?.namespace || this.config.namespace,
      });

      // Return empty array on error to prevent hybrid search from failing
      return [];
    }
  }

  /**
   * Get document count in the vector store
   */
  async getDocumentCount(options?: {
    namespace?: string;
    filters?: Record<string, any>;
  }): Promise<number> {
    try {
      const stats = await (this.vectorOps as any).describeIndexStats();
      const namespaceStats = stats.namespaces?.[options?.namespace || this.config.namespace];
      const count = namespaceStats?.vectorCount || 0;

      logInfo('Retrieved document count from vector store', {
        operation: 'rag_database_bridge_get_document_count',
        count,
        namespace: options?.namespace || this.config.namespace,
      });

      return count;
    } catch (error) {
      logError('Failed to get document count from vector store', {
        error: error instanceof Error ? error : new Error(String(error)),
        operation: 'rag_database_bridge_get_document_count_error',
        namespace: options?.namespace || this.config.namespace,
      });
      return 0;
    }
  }

  /**
   * Get all available namespaces
   */
  async getNamespaces(): Promise<string[]> {
    try {
      const stats = await (this.vectorOps as any).describeIndexStats();
      const namespaces = Object.keys(stats.namespaces || {});

      logInfo('Retrieved namespaces from vector store', {
        operation: 'rag_database_bridge_get_namespaces',
        namespaces: namespaces.length,
        namespaceList: namespaces,
      });

      return namespaces;
    } catch (error) {
      logError('Failed to get namespaces from vector store', {
        error: error instanceof Error ? error : new Error(String(error)),
        operation: 'rag_database_bridge_get_namespaces_error',
      });
      return [];
    }
  }

  /**
   * Get documents by IDs
   * Useful for retrieving specific documents
   */
  async getDocuments(
    ids: string | string[],
    options?: {
      namespace?: string;
      includeVectors?: boolean;
    },
  ): Promise<
    Array<{
      id: string | number;
      content?: string;
      metadata?: Record<string, any>;
      vector?: number[];
    }>
  > {
    try {
      const results = await this.vectorOps.fetch(ids, {
        namespace: options?.namespace || this.config.namespace,
        includeVectors: options?.includeVectors ?? false,
        includeMetadata: true,
        includeData: true,
      });

      const documents = results.map((result: any) => ({
        id: result.id,
        content: (result.metadata?.content as string) || (result.data as string),
        metadata: result.metadata,
        vector: result.vector,
      }));

      logInfo('Documents retrieved by IDs', {
        operation: 'rag_database_bridge_get_documents',
        requestedIds: Array.isArray(ids) ? ids.length : 1,
        foundDocuments: documents.length,
        namespace: options?.namespace || this.config.namespace,
      });

      return documents;
    } catch (error) {
      logError('Failed to retrieve documents by IDs', {
        error: error instanceof Error ? error : new Error(String(error)),
        operation: 'rag_database_bridge_get_documents_error',
        requestedIds: Array.isArray(ids) ? ids.length : 1,
        namespace: options?.namespace || this.config.namespace,
      });
      throw error;
    }
  }

  /**
   * Delete documents from the vector store
   */
  async deleteDocuments(
    ids: string | string[],
    options?: {
      namespace?: string;
    },
  ): Promise<{ deleted: number }> {
    try {
      const result = await this.vectorOps.delete(ids, {
        namespace: options?.namespace || this.config.namespace,
      });

      logInfo('Documents deleted from vector store', {
        operation: 'rag_database_bridge_delete_documents',
        requestedIds: Array.isArray(ids) ? ids.length : 1,
        deletedCount: result.deleted,
        namespace: options?.namespace || this.config.namespace,
      });

      return result;
    } catch (error) {
      logError('Failed to delete documents from vector store', {
        error: error instanceof Error ? error : new Error(String(error)),
        operation: 'rag_database_bridge_delete_documents_error',
        requestedIds: Array.isArray(ids) ? ids.length : 1,
        namespace: options?.namespace || this.config.namespace,
      });
      throw error;
    }
  }

  /**
   * Update document metadata
   */
  async updateDocument(
    id: string,
    updates: {
      metadata?: Record<string, any>;
      content?: string;
    },
    options?: {
      namespace?: string;
    },
  ): Promise<string> {
    try {
      const result = await this.vectorOps.update(id, {
        metadata: updates.metadata,
        data: updates.content,
        namespace: options?.namespace || this.config.namespace,
      });

      logInfo('Document updated in vector store', {
        operation: 'rag_database_bridge_update_document',
        documentId: id,
        hasMetadataUpdate: !!updates.metadata,
        hasContentUpdate: !!updates.content,
        namespace: options?.namespace || this.config.namespace,
      });

      return result;
    } catch (error) {
      logError('Failed to update document in vector store', {
        error: error instanceof Error ? error : new Error(String(error)),
        operation: 'rag_database_bridge_update_document_error',
        documentId: id,
        namespace: options?.namespace || this.config.namespace,
      });
      throw error;
    }
  }

  /**
   * Get vector store information
   */
  async getStoreInfo(): Promise<{
    vectorCount: number;
    dimensionCount: number;
    similarity: string;
    embeddingModel: string;
    namespace: string;
  }> {
    try {
      const info = await this.vectorOps.info();
      const embeddingModelInfo = this.vectorOps.getEmbeddingModelInfo();

      const storeInfo = {
        vectorCount: info.vectorCount || 0,
        dimensionCount: info.dimensionCount || embeddingModelInfo.dimensions,
        similarity: info.similarity || 'cosine',
        embeddingModel: embeddingModelInfo.model,
        namespace: embeddingModelInfo.namespace,
      };

      logInfo('Vector store information retrieved', {
        operation: 'rag_database_bridge_get_store_info',
        ...storeInfo,
      });

      return storeInfo;
    } catch (error) {
      logError('Failed to retrieve vector store information', {
        error: error instanceof Error ? error : new Error(String(error)),
        operation: 'rag_database_bridge_get_store_info_error',
      });
      throw error;
    }
  }

  /**
   * List all namespaces in the vector store
   */
  async listNamespaces(): Promise<string[]> {
    try {
      const namespaces = await this.vectorOps.listNamespaces();

      logInfo('Vector store namespaces listed', {
        operation: 'rag_database_bridge_list_namespaces',
        namespaceCount: namespaces.length,
      });

      return namespaces;
    } catch (error) {
      logError('Failed to list vector store namespaces', {
        error: error instanceof Error ? error : new Error(String(error)),
        operation: 'rag_database_bridge_list_namespaces_error',
      });
      throw error;
    }
  }

  /**
   * Find similar documents to a given document
   */
  async findSimilarDocuments(
    referenceId: string,
    options?: {
      topK?: number;
      namespace?: string;
      threshold?: number;
    },
  ): Promise<
    Array<{
      id: string | number;
      score: number;
      metadata?: Record<string, any>;
    }>
  > {
    try {
      const results = await this.vectorOps.findSimilar(referenceId, {
        topK: options?.topK || 5,
        namespace: options?.namespace || this.config.namespace,
        threshold: options?.threshold || 0.7,
      });

      logInfo('Similar documents found', {
        operation: 'rag_database_bridge_find_similar_documents',
        referenceId,
        resultsFound: results.length,
        namespace: options?.namespace || this.config.namespace,
      });

      return results;
    } catch (error) {
      logError('Failed to find similar documents', {
        error: error instanceof Error ? error : new Error(String(error)),
        operation: 'rag_database_bridge_find_similar_documents_error',
        referenceId,
        namespace: options?.namespace || this.config.namespace,
      });
      throw error;
    }
  }

  /**
   * Update bridge configuration
   */
  updateConfig(newConfig: Partial<RAGDatabaseConfig>): void {
    if (newConfig.namespace !== undefined) {
      this.config.namespace = newConfig.namespace;
    }

    if (newConfig.useUpstashEmbedding !== undefined) {
      this.config.useUpstashEmbedding = newConfig.useUpstashEmbedding;
    }

    if (newConfig.embeddingModel !== undefined) {
      this.config.embeddingModel = newConfig.embeddingModel;
    }

    if (newConfig.retryConfig) {
      this.config.retryConfig = { ...this.config.retryConfig, ...newConfig.retryConfig };
    }

    // Update vector operations config if needed
    if (newConfig.vectorConfig || newConfig.embeddingModel) {
      this.vectorOps.updateConfig({
        embeddingModel: newConfig.embeddingModel as any,
        namespace: newConfig.namespace,
        retryConfig: newConfig.retryConfig,
        ...newConfig.vectorConfig,
      });
    }

    logInfo('RAG Database Bridge configuration updated', {
      operation: 'rag_database_bridge_config_update',
      namespace: this.config.namespace,
      useUpstashEmbedding: this.config.useUpstashEmbedding,
    });
  }

  /**
   * Get current configuration
   */
  getConfig(): RAGDatabaseConfig {
    return { ...this.config };
  }

  /**
   * Get access to underlying vector operations
   * Use this for advanced operations not covered by the bridge
   */
  getVectorOperations(): AIEnhancedVectorOperations {
    return this.vectorOps;
  }
}

/**
 * Factory function to create RAG Database Bridge
 */
export function createRAGDatabaseBridge(config: RAGDatabaseConfig = {}): RAGDatabaseBridge {
  return new RAGDatabaseBridge(config);
}

/**
 * Factory function with environment-based configuration
 */
export function createRAGDatabaseBridgeFromEnv(
  embeddingModel?: EmbeddingModel<string> | string,
  namespace?: string,
): RAGDatabaseBridge {
  return new RAGDatabaseBridge({
    embeddingModel: embeddingModel || process.env.RAG_EMBEDDING_MODEL || 'text-embedding-3-small',
    namespace: namespace || process.env.UPSTASH_VECTOR_NAMESPACE || '',
    useUpstashEmbedding: process.env.RAG_USE_UPSTASH_EMBEDDING === 'true',
  });
}

// Create a default instance for convenience
export const defaultRAGBridge = createRAGDatabaseBridgeFromEnv();

/**
 * Backward compatibility - Adapter class that matches the old UpstashAIVector interface
 * This allows existing RAG code to work without changes while using the database package underneath
 */
export class UpstashAIVectorAdapter {
  private bridge: RAGDatabaseBridge;

  constructor(config: {
    vectorUrl?: string;
    vectorToken?: string;
    embeddingModel?: EmbeddingModel<string> | string;
    namespace?: string;
    dimensions?: number;
  }) {
    this.bridge = new RAGDatabaseBridge({
      embeddingModel: config.embeddingModel,
      namespace: config.namespace,
      vectorConfig: {
        dimensions: config.dimensions,
        namespace: config.namespace,
      },
    });
  }

  /**
   * Legacy method - upsertWithEmbedding
   */
  async upsertWithEmbedding(
    data: Array<{
      id: string;
      content: string;
      metadata?: Record<string, any>;
    }>,
  ) {
    return this.bridge.addDocuments(data);
  }

  /**
   * Legacy method - queryWithEmbedding
   */
  async queryWithEmbedding(query: string, options?: { topK?: number }) {
    return this.bridge.queryDocuments(query, options);
  }

  /**
   * Legacy method - upsertWithUpstashEmbedding
   */
  async upsertWithUpstashEmbedding(
    data: Array<{
      id: string;
      content: string;
      metadata?: Record<string, any>;
    }>,
  ) {
    // Temporarily switch to Upstash embedding
    const originalConfig = this.bridge.getConfig();
    this.bridge.updateConfig({ useUpstashEmbedding: true });

    try {
      const result = await this.bridge.addDocuments(data);
      return result;
    } finally {
      // Restore original config
      this.bridge.updateConfig({ useUpstashEmbedding: originalConfig.useUpstashEmbedding });
    }
  }

  /**
   * Legacy method - queryWithUpstashEmbedding
   */
  async queryWithUpstashEmbedding(query: string, options?: { topK?: number }) {
    // Temporarily switch to Upstash embedding
    const originalConfig = this.bridge.getConfig();
    this.bridge.updateConfig({ useUpstashEmbedding: true });

    try {
      const result = await this.bridge.queryDocuments(query, options);
      return result;
    } finally {
      // Restore original config
      this.bridge.updateConfig({ useUpstashEmbedding: originalConfig.useUpstashEmbedding });
    }
  }
}
