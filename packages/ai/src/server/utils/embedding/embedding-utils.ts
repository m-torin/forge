/**
 * AI SDK v5 Enhanced Embedding Utilities
 * Advanced embedding features with parallel processing and semantic operations
 */

import { openai } from '@ai-sdk/openai';
import type { EmbeddingModel } from 'ai';
import { cosineSimilarity, embed, embedMany } from 'ai';

export interface EnhancedEmbeddingOptions {
  model?: EmbeddingModel<string>;
  maxParallelCalls?: number;
  dimensions?: number;
  maxRetries?: number;
  timeout?: number;
}

/**
 * Enhanced embedding manager with v5 features
 */
export class EnhancedEmbeddingManager {
  private defaultModel: EmbeddingModel<string>;

  constructor(modelName?: string) {
    this.defaultModel = openai.textEmbeddingModel(modelName ?? 'text-embedding-3-small');
  }

  /**
   * Single embedding with v5 options
   */
  async embed(text: string, options?: EnhancedEmbeddingOptions): Promise<number[]> {
    const result = await embed({
      model: options?.model ?? this.defaultModel,
      value: text,
      maxRetries: options?.maxRetries ?? 2,
      ...(options?.timeout && { abortSignal: AbortSignal.timeout(options.timeout) }),
      ...(options?.dimensions && {
        providerOptions: {
          openai: {
            dimensions: options.dimensions,
          },
        },
      }),
    });
    return result.embedding;
  }

  /**
   * Batch embedding with parallel control
   */
  async embedBatch(texts: string[], options?: EnhancedEmbeddingOptions): Promise<number[][]> {
    const result = await embedMany({
      model: options?.model ?? this.defaultModel,
      values: texts,
      maxParallelCalls: options?.maxParallelCalls ?? 5,
      maxRetries: options?.maxRetries ?? 2,
      ...(options?.timeout && { abortSignal: AbortSignal.timeout(options.timeout) }),
      ...(options?.dimensions && {
        providerOptions: {
          openai: {
            dimensions: options.dimensions,
          },
        },
      }),
    });
    return result.embeddings;
  }

  /**
   * Semantic chunking with embedding generation
   */
  async embedWithChunking(
    texts: string[],
    options?: EnhancedEmbeddingOptions & {
      chunkSize?: number;
      overlap?: number;
    },
  ): Promise<{
    embeddings: number[][];
    chunks: string[];
    metadata: Array<{ originalIndex: number; chunkIndex: number }>;
  }> {
    const chunkSize = options?.chunkSize ?? 512;
    const overlap = options?.overlap ?? 50;
    const chunks: string[] = [];
    const metadata: Array<{ originalIndex: number; chunkIndex: number }> = [];

    // Advanced chunking with overlap
    for (let textIndex = 0; textIndex < texts.length; textIndex++) {
      const text = texts[textIndex];

      if (text.length <= chunkSize) {
        chunks.push(text);
        metadata.push({ originalIndex: textIndex, chunkIndex: chunks.length - 1 });
      } else {
        // Split into overlapping chunks
        for (let i = 0; i < text.length; i += chunkSize - overlap) {
          const chunk = text.slice(i, i + chunkSize);
          if (chunk.trim().length > 0) {
            chunks.push(chunk);
            metadata.push({ originalIndex: textIndex, chunkIndex: chunks.length - 1 });
          }
        }
      }
    }

    const embeddings = await this.embedBatch(chunks, options);
    return { embeddings, chunks, metadata };
  }

  /**
   * Similarity calculation
   */
  similarity(embedding1: number[], embedding2: number[]): number {
    return cosineSimilarity(embedding1, embedding2);
  }

  /**
   * Find most similar embedding
   */
  findMostSimilar(
    queryEmbedding: number[],
    embeddings: number[][],
  ): { index: number; similarity: number } {
    let bestIndex = 0;
    let bestSimilarity = -1;

    for (let i = 0; i < embeddings.length; i++) {
      const similarity = this.similarity(queryEmbedding, embeddings[i]);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestIndex = i;
      }
    }

    return { index: bestIndex, similarity: bestSimilarity };
  }

  /**
   * Find top N similar embeddings
   */
  findTopSimilar(
    queryEmbedding: number[],
    embeddings: number[][],
    topN: number = 5,
  ): Array<{ index: number; similarity: number }> {
    const similarities = embeddings.map((embedding, index) => ({
      index,
      similarity: this.similarity(queryEmbedding, embedding),
    }));

    return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, topN);
  }

  /**
   * Compute similarity matrix for all embeddings
   */
  computeSimilarityMatrix(embeddings: number[][]): number[][] {
    const matrix: number[][] = [];

    for (let i = 0; i < embeddings.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < embeddings.length; j++) {
        matrix[i][j] = this.similarity(embeddings[i], embeddings[j]);
      }
    }

    return matrix;
  }

  /**
   * Find clusters using cosine similarity threshold
   */
  findClusters(embeddings: number[][], threshold: number = 0.8): number[][] {
    const clusters: number[][] = [];
    const visited = new Set<number>();

    for (let i = 0; i < embeddings.length; i++) {
      if (visited.has(i)) continue;

      const cluster = [i];
      visited.add(i);

      for (let j = i + 1; j < embeddings.length; j++) {
        if (visited.has(j)) continue;

        const similarity = this.similarity(embeddings[i], embeddings[j]);
        if (similarity >= threshold) {
          cluster.push(j);
          visited.add(j);
        }
      }

      clusters.push(cluster);
    }

    return clusters;
  }

  /**
   * Advanced semantic search with reranking
   */
  async semanticSearch(
    query: string,
    documents: string[],
    options?: EnhancedEmbeddingOptions & {
      topK?: number;
      threshold?: number;
      rerank?: boolean;
    },
  ): Promise<Array<{ index: number; document: string; similarity: number; score?: number }>> {
    const topK = options?.topK ?? 10;
    const threshold = options?.threshold ?? 0.5;

    // Generate embeddings
    const [queryEmbedding, docEmbeddings] = await Promise.all([
      this.embed(query, options),
      this.embedBatch(documents, options),
    ]);

    // Find similar documents
    let results = this.findTopSimilar(queryEmbedding, docEmbeddings, topK)
      .filter(result => result.similarity >= threshold)
      .map(result => ({
        ...result,
        document: documents[result.index],
      }));

    // Optional reranking based on keyword overlap
    if (options?.rerank) {
      const queryWords = new Set(
        query
          .toLowerCase()
          .split(/\W+/)
          .filter(word => word.length > 2),
      );

      results = results
        .map(result => {
          const docWords = new Set(
            result.document
              .toLowerCase()
              .split(/\W+/)
              .filter(word => word.length > 2),
          );

          const overlap = [...queryWords].filter(word => docWords.has(word)).length;
          const keywordScore = overlap / Math.max(queryWords.size, 1);
          const combinedScore = result.similarity * 0.7 + keywordScore * 0.3;

          return {
            ...result,
            score: combinedScore,
          };
        })
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }

    return results;
  }
}

/**
 * High-level embedding operations
 */
export const embeddingUtils = {
  /**
   * Quick semantic search
   */
  async search(
    query: string,
    documents: string[],
    options?: {
      topK?: number;
      threshold?: number;
      model?: EmbeddingModel<string>;
      maxParallelCalls?: number;
    },
  ): Promise<Array<{ document: string; similarity: number; index: number }>> {
    const manager = new EnhancedEmbeddingManager();
    const results = await manager.semanticSearch(query, documents, options);
    return results.map(({ document, similarity, index }) => ({ document, similarity, index }));
  },

  /**
   * Document clustering
   */
  async cluster(
    documents: string[],
    options?: {
      threshold?: number;
      model?: EmbeddingModel<string>;
      maxParallelCalls?: number;
    },
  ): Promise<
    Array<{
      cluster: number;
      documents: Array<{ index: number; text: string; similarity?: number }>;
    }>
  > {
    const manager = new EnhancedEmbeddingManager();
    const embeddings = await manager.embedBatch(documents, options);
    const clusters = manager.findClusters(embeddings, options?.threshold ?? 0.8);

    return clusters.map((cluster, clusterIndex) => ({
      cluster: clusterIndex,
      documents: cluster.map(docIndex => ({
        index: docIndex,
        text: documents[docIndex],
      })),
    }));
  },

  /**
   * Duplicate detection
   */
  async findDuplicates(
    documents: string[],
    options?: {
      threshold?: number;
      model?: EmbeddingModel<string>;
      maxParallelCalls?: number;
    },
  ): Promise<Array<{ original: number; duplicate: number; similarity: number }>> {
    const manager = new EnhancedEmbeddingManager();
    const embeddings = await manager.embedBatch(documents, options);
    const threshold = options?.threshold ?? 0.95;
    const duplicates = [];

    for (let i = 0; i < embeddings.length; i++) {
      for (let j = i + 1; j < embeddings.length; j++) {
        const similarity = manager.similarity(embeddings[i], embeddings[j]);
        if (similarity >= threshold) {
          duplicates.push({ original: i, duplicate: j, similarity });
        }
      }
    }

    return duplicates;
  },

  /**
   * Content recommendation based on similarity
   */
  async recommend(
    sourceText: string,
    candidateTexts: string[],
    options?: {
      topK?: number;
      excludeOriginal?: boolean;
      model?: EmbeddingModel<string>;
      maxParallelCalls?: number;
    },
  ): Promise<Array<{ text: string; similarity: number; index: number }>> {
    const manager = new EnhancedEmbeddingManager();
    const allTexts = [sourceText, ...candidateTexts];
    const embeddings = await manager.embedBatch(allTexts, options);

    const sourceEmbedding = embeddings[0];
    const candidateEmbeddings = embeddings.slice(1);

    const similarities = manager.findTopSimilar(
      sourceEmbedding,
      candidateEmbeddings,
      options?.topK ?? 5,
    );

    return similarities.map(({ index, similarity }) => ({
      text: candidateTexts[index],
      similarity,
      index,
    }));
  },

  /**
   * Batch processing with progress tracking
   */
  async batchProcess(
    documents: string[],
    batchSize: number = 100,
    options?: EnhancedEmbeddingOptions,
    onProgress?: (processed: number, total: number) => void,
  ): Promise<number[][]> {
    const manager = new EnhancedEmbeddingManager();
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const batchEmbeddings = await manager.embedBatch(batch, options);
      allEmbeddings.push(...batchEmbeddings);

      if (onProgress) {
        onProgress(Math.min(i + batchSize, documents.length), documents.length);
      }
    }

    return allEmbeddings;
  },
} as const;

/**
 * Factory function
 */
export function createEnhancedEmbeddingManager(modelName?: string): EnhancedEmbeddingManager {
  return new EnhancedEmbeddingManager(modelName);
}
