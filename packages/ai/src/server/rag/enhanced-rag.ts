import type { EmbeddingModel } from 'ai';
import { embed as aiEmbed } from 'ai';
import type { VectorRecord } from '../../shared/types/vector';
import type { VectorDB } from '../vector/types';

/**
 * Enhanced RAG implementation with document chunking and context generation
 * Provides reusable RAG functionality for any AI SDK application
 */

export interface RAGDocumentChunk {
  id: string;
  content: string;
  metadata: {
    title?: string;
    source?: string;
    chunkIndex: number;
    totalChunks: number;
    uploadedAt: string;
    userId?: string;
    [key: string]: any;
  };
}

export interface RAGContext {
  chunks: RAGDocumentChunk[];
  relevanceScores: number[];
  sources: string[];
}

export interface RAGChunkingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  method?: 'fixed' | 'sentence' | 'paragraph';
}

export interface DocumentProcessorConfig {
  defaultChunkSize?: number;
  defaultChunkOverlap?: number;
  defaultMethod?: 'fixed' | 'sentence' | 'paragraph';
}

/**
 * Generic document processing service for RAG
 */
export class DocumentProcessor {
  private config: Required<DocumentProcessorConfig>;

  constructor(config: DocumentProcessorConfig = {}) {
    this.config = {
      defaultChunkSize: config.defaultChunkSize ?? 1000,
      defaultChunkOverlap: config.defaultChunkOverlap ?? 200,
      defaultMethod: config.defaultMethod ?? 'fixed',
    };
  }

  /**
   * Split text into chunks using various strategies
   */
  chunkText(text: string, options: RAGChunkingOptions = {}): string[] {
    const method = options.method ?? this.config.defaultMethod;

    switch (method) {
      case 'sentence':
        return this.chunkBySentence(text, options);
      case 'paragraph':
        return this.chunkByParagraph(text, options);
      case 'fixed':
      default:
        return this.chunkBySize(text, options);
    }
  }

  private chunkBySize(text: string, options: RAGChunkingOptions): string[] {
    const chunkSize = options.chunkSize ?? this.config.defaultChunkSize;
    const overlap = options.chunkOverlap ?? this.config.defaultChunkOverlap;
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      chunks.push(text.slice(start, end));

      if (end === text.length) break;
      start = end - overlap;
    }

    return chunks;
  }

  private chunkBySentence(text: string, options: RAGChunkingOptions): string[] {
    const maxChunkSize = options.chunkSize ?? this.config.defaultChunkSize;
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxChunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += ' ' + sentence;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  private chunkByParagraph(text: string, options: RAGChunkingOptions): string[] {
    const maxChunkSize = options.chunkSize ?? this.config.defaultChunkSize;
    const paragraphs = text.split(/\n\n+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = paragraph;
      } else {
        currentChunk += '\n\n' + paragraph;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Process and prepare document for vector storage
   */
  async processDocument(
    title: string,
    content: string,
    embeddingModel: EmbeddingModel<string>,
    options: {
      source?: string;
      userId?: string;
      namespace?: string;
      chunkingOptions?: RAGChunkingOptions;
      metadata?: Record<string, any>;
    } = {},
  ): Promise<{
    chunks: RAGDocumentChunk[];
    embeddings: number[][];
    vectorRecords: VectorRecord[];
  }> {
    const chunks = this.chunkText(content, options.chunkingOptions);
    const uploadedAt = new Date().toISOString();
    const documentChunks: RAGDocumentChunk[] = [];
    const embeddings: number[][] = [];
    const vectorRecords: VectorRecord[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      // Generate embedding
      const { embedding } = await aiEmbed({
        model: embeddingModel,
        value: chunk,
      });

      const chunkId = `${title}_${i}_${Date.now()}`;

      const documentChunk: RAGDocumentChunk = {
        id: chunkId,
        content: chunk,
        metadata: {
          title,
          source: options.source || 'upload',
          chunkIndex: i,
          totalChunks: chunks.length,
          uploadedAt,
          userId: options.userId,
          ...options.metadata,
        },
      };

      const vectorRecord: VectorRecord = {
        id: chunkId,
        values: embedding,
        metadata: {
          ...documentChunk.metadata,
          content: chunk,
          namespace: options.namespace,
        },
      };

      documentChunks.push(documentChunk);
      embeddings.push(embedding);
      vectorRecords.push(vectorRecord);
    }

    return {
      chunks: documentChunks,
      embeddings,
      vectorRecords,
    };
  }
}

export interface RAGServiceConfig {
  defaultTopK?: number;
  defaultThreshold?: number;
  defaultNamespace?: string;
}

/**
 * Generic RAG query service
 */
export class RAGService {
  private config: Required<RAGServiceConfig>;

  constructor(
    private vectorDB: VectorDB,
    private embeddingModel: EmbeddingModel<string>,
    config: RAGServiceConfig = {},
  ) {
    this.config = {
      defaultTopK: config.defaultTopK ?? 5,
      defaultThreshold: config.defaultThreshold ?? 0.7,
      defaultNamespace: config.defaultNamespace ?? 'documents',
    };
  }

  /**
   * Search for relevant context using vector similarity
   */
  async searchContext(
    query: string,
    options: {
      topK?: number;
      threshold?: number;
      namespace?: string;
      filter?: Record<string, any>;
    } = {},
  ): Promise<RAGContext> {
    // Generate query embedding
    const { embedding: queryEmbedding } = await aiEmbed({
      model: this.embeddingModel,
      value: query,
    });

    // Search vector database
    const searchResults = await this.vectorDB.query(queryEmbedding, {
      topK: options.topK ?? this.config.defaultTopK,
      includeMetadata: true,
      filter: options.filter,
    });

    // Filter by similarity threshold
    const threshold = options.threshold ?? this.config.defaultThreshold;
    const relevantResults = searchResults.filter(result => result.score >= threshold);

    // Transform results into chunks
    const chunks: RAGDocumentChunk[] = relevantResults.map(result => ({
      id: result.id,
      content: result.metadata?.content || '',
      metadata: {
        title: result.metadata?.title,
        source: result.metadata?.source,
        chunkIndex: result.metadata?.chunkIndex || 0,
        totalChunks: result.metadata?.totalChunks || 1,
        uploadedAt: result.metadata?.uploadedAt || '',
        userId: result.metadata?.userId,
        ...result.metadata,
      },
    }));

    const relevanceScores = relevantResults.map(result => result.score);
    const sources = [
      ...new Set(chunks.map(chunk => chunk.metadata.title).filter(Boolean) as string[]),
    ];

    return {
      chunks,
      relevanceScores,
      sources,
    };
  }

  /**
   * Generate RAG-enhanced prompt
   */
  createRAGPrompt(query: string, context: RAGContext): string {
    if (context.chunks.length === 0) {
      return '';
    }

    const contextText = context.chunks
      .map((chunk, index) => {
        const source = chunk.metadata.title || 'Unknown';
        const score = context.relevanceScores[index];
        return `[Source: ${source} | Relevance: ${(score * 100).toFixed(1)}%]\n${chunk.content}`;
      })
      .join('\n\n---\n\n');

    return `You have access to the following relevant information to help answer the user's question:

${contextText}

Please use this information to provide a comprehensive and accurate response. If the provided context doesn't contain relevant information for the user's question, you can still provide a helpful response based on your general knowledge, but mention that you don't have specific information about their query in your knowledge base.

Sources consulted: ${context.sources.join(', ')}`;
  }

  /**
   * Get enhanced prompt with RAG context
   */
  async getEnhancedPrompt(
    query: string,
    basePrompt: string,
    options: {
      topK?: number;
      threshold?: number;
      filter?: Record<string, any>;
    } = {},
  ): Promise<{ prompt: string; context: RAGContext }> {
    const context = await this.searchContext(query, options);
    const ragPrompt = this.createRAGPrompt(query, context);

    const enhancedPrompt = ragPrompt ? `${basePrompt}\n\n${ragPrompt}` : basePrompt;

    return {
      prompt: enhancedPrompt,
      context,
    };
  }

  /**
   * Store documents in vector database
   */
  async storeDocuments(
    vectorRecords: VectorRecord[],
  ): Promise<{ success: boolean; count: number }> {
    const result = await this.vectorDB.upsert(vectorRecords);
    return {
      success: result.success,
      count: vectorRecords.length,
    };
  }

  async getStats(): Promise<{
    totalVectors: number;
    namespace: string;
    dimension: number;
  }> {
    // Unused but kept for interface compatibility
    const stats = await this.vectorDB.describe?.();
    return {
      totalVectors: stats?.totalVectorCount || 0,
      namespace: this.config.defaultNamespace || 'default',
      dimension: stats?.dimension || 0,
    };
  }
}

/**
 * Factory function to create a complete RAG system
 */
export function createRAGSystem(
  vectorDB: VectorDB,
  embeddingModel: EmbeddingModel<string>,
  config?: {
    processor?: DocumentProcessorConfig;
    service?: RAGServiceConfig;
  },
) {
  const processor = new DocumentProcessor(config?.processor);
  const service = new RAGService(vectorDB, embeddingModel, config?.service);

  return {
    processor,
    service,

    // Convenience method for end-to-end document processing
    async addDocument(
      title: string,
      content: string,
      options?: Parameters<DocumentProcessor['processDocument']>[3],
    ) {
      const { vectorRecords } = await processor.processDocument(
        title,
        content,
        embeddingModel,
        options,
      );
      return service.storeDocuments(vectorRecords);
    },

    // Convenience method for querying
    async query(query: string, options?: Parameters<RAGService['searchContext']>[1]) {
      return service.searchContext(query, options);
    },

    // Get enhanced prompt
    async enhancePrompt(
      query: string,
      basePrompt: string,
      options?: Parameters<RAGService['getEnhancedPrompt']>[2],
    ) {
      return service.getEnhancedPrompt(query, basePrompt, options);
    },
  };
}

// Export renamed types to avoid conflicts
export type DocumentChunk = RAGDocumentChunk;
export type ChunkingOptions = RAGChunkingOptions;
