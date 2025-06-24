import type { RAGConfig, RAGDocument, RAGPipeline, RAGResponse, RAGContext } from './types';
import type { CompletionOptions } from '../../shared/types';
import { createUpstashVectorDB } from '../vector/upstash-vector';
import { createVectorUtils } from '../vector/utils';
import { createEmbeddingManager } from '../embedding/utils';
import { createTextChunker, createSemanticChunker } from '../document/chunking';
import { ServerAIManager } from '../manager';

/**
 * Full-featured RAG pipeline with Upstash Vector
 */
export class UpstashRAGPipeline implements RAGPipeline {
  private vectorDB: any;
  private vectorUtils: any;
  private embedder: any;
  private chunker: any;
  private aiManager!: ServerAIManager;
  private config: Required<RAGConfig>;

  constructor(config: RAGConfig = {}) {
    // Set defaults
    this.config = {
      vectorDB: {
        url: config.vectorDB?.url ?? process.env.UPSTASH_VECTOR_REST_URL ?? '',
        token: config.vectorDB?.token ?? process.env.UPSTASH_VECTOR_REST_TOKEN ?? '',
        namespace: config.vectorDB?.namespace ?? process.env.UPSTASH_VECTOR_NAMESPACE,
      },
      embedding: {
        model: config.embedding?.model ?? 'text-embedding-3-small',
        provider: config.embedding?.provider ?? 'openai',
      },
      chunking: {
        chunkSize: config.chunking?.chunkSize ?? 1000,
        chunkOverlap: config.chunking?.chunkOverlap ?? 200,
        semantic: config.chunking?.semantic ?? true,
      },
      retrieval: {
        topK: config.retrieval?.topK ?? 5,
        similarityThreshold: config.retrieval?.similarityThreshold ?? 0.7,
        includeMetadata: config.retrieval?.includeMetadata ?? true,
      },
      generation: {
        provider: config.generation?.provider ?? 'openai',
        model: config.generation?.model ?? 'gpt-4-turbo',
        temperature: config.generation?.temperature ?? 0.1,
        maxTokens: config.generation?.maxTokens ?? 1000,
      },
    };

    this.initializeComponents();
  }

  private initializeComponents(): void {
    // Initialize vector database
    this.vectorDB = createUpstashVectorDB(this.config.vectorDB);
    if (!this.vectorDB) {
      throw new Error('Failed to initialize Upstash Vector DB. Check your credentials.');
    }

    // Initialize vector utilities
    this.vectorUtils = createVectorUtils(this.vectorDB, this.config.embedding.model);

    // Initialize embedding manager
    this.embedder = createEmbeddingManager(this.config.embedding.model);

    // Initialize chunker
    if (this.config.chunking.semantic) {
      this.chunker = createSemanticChunker({
        chunkSize: this.config.chunking.chunkSize,
        chunkOverlap: this.config.chunking.chunkOverlap,
      });
    } else {
      this.chunker = createTextChunker({
        chunkSize: this.config.chunking.chunkSize,
        chunkOverlap: this.config.chunking.chunkOverlap,
      });
    }

    // Initialize AI manager
    this.aiManager = new ServerAIManager({});
  }

  private async initializeAIManager(): Promise<void> {
    if (!this.aiManager) {
      this.aiManager = new ServerAIManager({});
    }
  }

  async addDocuments(documents: RAGDocument[]): Promise<void> {
    // Convert to internal document format
    const internalDocs = documents.map((doc) => ({
      id: doc.id,
      content: doc.content,
      metadata: doc.metadata,
      source: doc.source,
    }));

    // Chunk documents
    const chunks = this.chunker.chunkDocuments(internalDocs);

    // Store in vector database with embeddings
    const textsToStore = chunks.map((chunk: any) => ({
      id: chunk.id,
      content: chunk.content,
      metadata: {
        ...chunk.metadata,
        parentDocumentId: chunk.parentDocumentId,
        chunkIndex: chunk.chunkIndex,
        source: chunk.source,
      },
    }));

    await this.vectorUtils.storeTexts(textsToStore);
  }

  async removeDocuments(ids: string[]): Promise<void> {
    // Find all chunk IDs for the given document IDs
    const stats = await this.vectorDB.describe();
    if (stats.totalVectorCount === 0) {
      return; // No documents to remove
    }

    // For simplicity, we'll delete by exact IDs
    // In a production system, you'd want to query for all chunks of these documents first
    const chunkIds = ids.flatMap((id) =>
      // Generate likely chunk IDs based on naming pattern
      Array.from({ length: 100 }, (_, i) => `${id}_chunk_${i}`),
    );

    try {
      await this.vectorDB.delete(chunkIds);
    } catch (error) {
      // Ignore errors for non-existent chunks
      // eslint-disable-next-line no-console
      console.warn('Some chunks could not be deleted:', error);
    }
  }

  async query(query: string, options: Partial<CompletionOptions> = {}): Promise<RAGResponse> {
    const startTime = Date.now();

    // Step 1: Retrieve relevant chunks
    const searchResults = await this.vectorUtils.searchSimilar(query, {
      topK: this.config.retrieval.topK,
      includeContent: true,
      filter: options.filter,
    });

    const searchTime = Date.now() - startTime;

    // Filter by similarity threshold
    const filteredResults = searchResults.filter(
      (result: any) => result.score >= (this.config.retrieval.similarityThreshold ?? 0.7),
    );

    // Step 2: Build context
    const context: RAGContext = {
      query,
      retrievedChunks: filteredResults,
      totalResults: filteredResults.length,
      searchTime,
    };

    // Step 3: Generate response with context
    const contextText = filteredResults
      .map((result: any, index: number) => `[${index + 1}] ${result.content}`)
      .join('\n\n');

    const systemPrompt = `You are a helpful assistant that answers questions based on the provided context. Use the context below to answer the user's question. If the context doesn't contain enough information to answer the question, say so clearly.

Context:
${contextText}`;

    const completionOptions: CompletionOptions = {
      prompt: query,
      systemPrompt,
      model: options.model ?? this.config.generation.model,
      temperature: options.temperature ?? this.config.generation.temperature,
      maxTokens: options.maxTokens ?? this.config.generation.maxTokens,
    };

    const response = await this.aiManager.complete(completionOptions);

    // Step 4: Build RAG response with metadata
    const sources = [
      ...new Set(filteredResults.map((r: any) => r.metadata?.source).filter(Boolean)),
    ] as string[];
    const avgSimilarity =
      filteredResults.length > 0
        ? filteredResults.reduce((sum: number, r: any) => sum + r.score, 0) / filteredResults.length
        : 0;

    return {
      ...response,
      context,
      retrievalMetadata: {
        totalDocuments: filteredResults.length,
        avgSimilarity,
        sources,
      },
    };
  }

  async getStats(): Promise<{ totalDocuments: number; dimension: number }> {
    const stats = await this.vectorUtils.getStats();
    return {
      totalDocuments: stats.totalDocuments,
      dimension: stats.dimension,
    };
  }
}

/**
 * Create a RAG pipeline with Upstash Vector
 */
export function createRAGPipeline(config?: RAGConfig): UpstashRAGPipeline {
  return new UpstashRAGPipeline(config);
}
