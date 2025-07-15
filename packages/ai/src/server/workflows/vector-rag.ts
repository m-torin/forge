/**
 * Vector RAG Workflow Implementation
 * Comprehensive RAG system with AI SDK integration and advanced features
 */

import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { logError } from '@repo/observability/server/next';
import { embed, embedMany, generateText, streamText } from 'ai';
import type { VectorDB } from '../../shared/types/vector';

export interface RAGWorkflowConfig {
  vectorDB: VectorDB;
  embeddingModel?: string;
  chatModel?: string;
  provider?: 'openai' | 'anthropic';
  namespace?: string;
  topK?: number;
  similarityThreshold?: number;
  maxContextLength?: number;
  enableReranking?: boolean;
  enableCaching?: boolean;
}

export interface RAGContext {
  id: string;
  content: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface RAGResponse {
  answer: string;
  context: RAGContext[];
  sources: string[];
  confidence: number;
  tokensUsed?: number;
}

/**
 * Comprehensive RAG Workflow Class
 */
export class VectorRAGWorkflow {
  private config: Required<RAGWorkflowConfig>;
  private embeddingModel: any;
  private chatModel: any;
  private cache = new Map<string, any>();

  constructor(config: RAGWorkflowConfig) {
    this.config = {
      embeddingModel: 'text-embedding-3-small',
      chatModel: 'gpt-4o',
      provider: 'openai',
      namespace: 'default',
      topK: 5,
      similarityThreshold: 0.7,
      maxContextLength: 4000,
      enableReranking: false,
      enableCaching: true,
      ...config,
    };

    // Initialize models
    this.embeddingModel = openai.embedding(this.config.embeddingModel);

    if (this.config.provider === 'anthropic') {
      this.chatModel = anthropic('claude-3-5-sonnet-20241022');
    } else {
      this.chatModel = openai(this.config.chatModel);
    }
  }

  /**
   * Add documents to the vector database
   */
  async addDocuments(
    documents: Array<{
      id: string;
      content: string;
      metadata?: Record<string, any>;
    }>,
  ): Promise<{ added: number; failed: number; errors: string[] }> {
    const results = { added: 0, failed: 0, errors: [] as string[] };

    try {
      // Generate embeddings for all documents
      const contents = documents.map(doc => doc.content);
      const { embeddings } = await embedMany({
        model: this.embeddingModel,
        values: contents,
      });

      // Prepare vectors for upsert
      const vectors = documents.map((doc, index) => ({
        id: doc.id,
        values: embeddings[index],
        metadata: {
          ...doc.metadata,
          content: doc.content,
          timestamp: new Date().toISOString(),
          source: 'rag-workflow',
        },
      }));

      // Upsert to vector database
      await this.config.vectorDB.upsert(vectors);

      results.added = documents.length;
    } catch (error) {
      results.failed = documents.length;
      results.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return results;
  }

  /**
   * Retrieve relevant context for a query
   */
  async retrieveContext(query: string): Promise<RAGContext[]> {
    const cacheKey = `context:${query}:${this.config.namespace}`;

    if (this.config.enableCaching && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Generate query embedding
      const { embedding } = await embed({
        model: this.embeddingModel,
        value: query,
      });

      // Search vector database
      const searchResults = await this.config.vectorDB.query(embedding, {
        topK: this.config.topK,
        includeMetadata: true,
        includeValues: false,
      });

      // Filter by similarity threshold and format results
      const context = searchResults
        .filter(result => result.score >= this.config.similarityThreshold)
        .map(result => ({
          id: result.id,
          content: result.metadata?.content || '',
          score: result.score,
          metadata: result.metadata,
        }));

      // Apply reranking if enabled
      const finalContext = this.config.enableReranking
        ? await this.rerankContext(query, context)
        : context;

      if (this.config.enableCaching) {
        this.cache.set(cacheKey, finalContext);
      }

      return finalContext;
    } catch (error) {
      logError(
        'Failed to retrieve context',
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'rag_workflow_retrieve_context',
          query: query.slice(0, 100),
          namespace: this.config.namespace,
        },
      );
      return [];
    }
  }

  /**
   * Generate answer using retrieved context
   */
  async generateAnswer(query: string, context: RAGContext[]): Promise<RAGResponse> {
    try {
      // Prepare context for the prompt
      const contextText = context
        .map(ctx => `[Source: ${ctx.id}]\n${ctx.content}`)
        .join('\n\n')
        .slice(0, this.config.maxContextLength);

      const prompt = `Based on the following context, answer the user's question. If the context doesn't contain enough information to answer the question, say so clearly.

Context:
${contextText}

Question: ${query}

Answer:`;

      const result = await generateText({
        model: this.chatModel,
        prompt,
        maxTokens: 1000,
        temperature: 0.1,
      });

      // Extract sources from context
      const sources = context.map(ctx => ctx.id);

      // Calculate confidence based on context scores
      const avgScore =
        context.length > 0 ? context.reduce((sum, ctx) => sum + ctx.score, 0) / context.length : 0;

      return {
        answer: result.text,
        context,
        sources,
        confidence: avgScore,
        tokensUsed: result.usage?.totalTokens,
      };
    } catch (error) {
      throw new Error(
        `Failed to generate answer: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Streaming RAG chat
   */
  async *streamChat(query: string): AsyncGenerator<{
    type: 'context' | 'answer' | 'done';
    data: any;
  }> {
    try {
      // First, retrieve context
      const context = await this.retrieveContext(query);
      yield { type: 'context', data: context };

      // Prepare context for streaming
      const contextText = context
        .map(ctx => `[Source: ${ctx.id}]\n${ctx.content}`)
        .join('\n\n')
        .slice(0, this.config.maxContextLength);

      const prompt = `Based on the following context, answer the user's question. If the context doesn't contain enough information to answer the question, say so clearly.

Context:
${contextText}

Question: ${query}

Answer:`;

      // Stream the response
      const result = await streamText({
        model: this.chatModel,
        prompt,
        maxTokens: 1000,
        temperature: 0.1,
      });

      for await (const delta of result.textStream) {
        yield { type: 'answer', data: delta };
      }

      yield {
        type: 'done',
        data: {
          context,
          sources: context.map(ctx => ctx.id),
          confidence:
            context.length > 0
              ? context.reduce((sum, ctx) => sum + ctx.score, 0) / context.length
              : 0,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to stream chat: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Full RAG pipeline
   */
  async query(question: string): Promise<RAGResponse> {
    const context = await this.retrieveContext(question);
    return await this.generateAnswer(question, context);
  }

  /**
   * Batch RAG queries
   */
  async batchQuery(questions: string[]): Promise<RAGResponse[]> {
    const results = await Promise.all(
      questions.map(async question => {
        try {
          return await this.query(question);
        } catch (error) {
          return {
            answer: `Error processing question: ${error instanceof Error ? error.message : 'Unknown error'}`,
            context: [],
            sources: [],
            confidence: 0,
          };
        }
      }),
    );

    return results;
  }

  /**
   * Update existing document
   */
  async updateDocument(
    id: string,
    content: string,
    metadata?: Record<string, any>,
  ): Promise<boolean> {
    try {
      const { embedding } = await embed({
        model: this.embeddingModel,
        value: content,
      });

      await this.config.vectorDB.upsert([
        {
          id,
          values: embedding,
          metadata: {
            ...metadata,
            content,
            timestamp: new Date().toISOString(),
            updated: true,
          },
        },
      ]);

      // Clear cache for this document
      if (this.config.enableCaching) {
        for (const [key] of this.cache.entries()) {
          if (key.includes(id)) {
            this.cache.delete(key);
          }
        }
      }

      return true;
    } catch (error) {
      logError(
        'Failed to update document',
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'rag_workflow_update_document',
          documentId: id,
          namespace: this.config.namespace,
        },
      );
      return false;
    }
  }

  /**
   * Delete document from vector database
   */
  async deleteDocument(id: string): Promise<boolean> {
    try {
      await this.config.vectorDB.delete([id]);

      // Clear related cache entries
      if (this.config.enableCaching) {
        for (const [key] of this.cache.entries()) {
          if (key.includes(id)) {
            this.cache.delete(key);
          }
        }
      }

      return true;
    } catch (error) {
      logError(
        'Failed to delete document',
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'rag_workflow_delete_document',
          documentId: id,
          namespace: this.config.namespace,
        },
      );
      return false;
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    totalVectors: number;
    namespace: string;
    dimension: number;
    cacheSize: number;
  }> {
    try {
      const info = await this.config.vectorDB.describe?.();

      return {
        totalVectors: info?.totalVectorCount || 0,
        namespace: this.config.namespace,
        dimension: info?.dimension || 0,
        cacheSize: this.cache.size,
      };
    } catch (_error) {
      return {
        totalVectors: 0,
        namespace: this.config.namespace,
        dimension: 0,
        cacheSize: this.cache.size,
      };
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Private method for reranking context (placeholder)
   */
  private async rerankContext(query: string, context: RAGContext[]): Promise<RAGContext[]> {
    // Simple reranking based on query similarity
    // In production, you might use a dedicated reranking model
    return context.sort((a, b) => {
      const aRelevance = this.calculateRelevance(query, a.content);
      const bRelevance = this.calculateRelevance(query, b.content);
      return bRelevance - aRelevance;
    });
  }

  /**
   * Simple relevance calculation (placeholder)
   */
  private calculateRelevance(query: string, content: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentWords = content.toLowerCase().split(/\s+/);

    let matches = 0;
    queryWords.forEach(word => {
      if (contentWords.includes(word)) {
        matches++;
      }
    });

    return matches / queryWords.length;
  }
}

/**
 * Factory function for creating RAG workflow
 */
export function createRAGWorkflow(config: RAGWorkflowConfig): VectorRAGWorkflow {
  return new VectorRAGWorkflow(config);
}

/**
 * Quick RAG setup for common use cases
 */
export async function quickRAG(
  vectorDB: VectorDB,
  query: string,
  options: {
    namespace?: string;
    topK?: number;
    embeddingModel?: string;
    chatModel?: string;
  } = {},
): Promise<RAGResponse> {
  const workflow = createRAGWorkflow({
    vectorDB,
    ...options,
  });

  return await workflow.query(query);
}
