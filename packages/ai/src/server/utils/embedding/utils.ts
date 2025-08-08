import { openai } from '@ai-sdk/openai';
import { cosineSimilarity, embed, embedMany } from 'ai';

// Local types for compatibility
interface EmbeddingResponse {
  embeddings: number[][];
  usage: {
    tokens: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

interface EmbedOptions {
  input: string | string[];
  model?: string;
}

/**
 * Enhanced embedding utility for batch operations
 */
export class EmbeddingManager {
  private defaultModel: any;

  constructor(modelName?: string) {
    this.defaultModel = openai.embedding(modelName ?? 'text-embedding-3-small');
  }

  /**
   * Single embedding using AI SDK
   */
  async embed(text: string, model?: any): Promise<number[]> {
    const result = await embed({
      model: model ?? this.defaultModel,
      value: text,
    });
    return result.embedding;
  }

  /**
   * Batch embedding using AI SDK embedMany
   */
  async embedBatch(texts: string[], model?: any): Promise<number[][]> {
    const result = await embedMany({
      model: model ?? this.defaultModel,
      values: texts,
    });
    return result.embeddings;
  }

  /**
   * Provider-compatible embedding function
   */
  async embedWithProvider(options: EmbedOptions): Promise<EmbeddingResponse> {
    const inputs = Array.isArray(options.input) ? options.input : [options.input];

    const result = await embedMany({
      model: this.defaultModel,
      values: inputs,
    });

    return {
      embeddings: result.embeddings,
      usage: {
        tokens: result.usage?.tokens ?? 0,
        promptTokens: result.usage?.tokens ?? 0, // For embeddings, all tokens are prompt tokens
        completionTokens: 0, // Embeddings don't have completion tokens
        totalTokens: result.usage?.tokens ?? 0,
      },
    };
  }

  /**
   * Calculate similarity between two embeddings
   */
  similarity(embedding1: number[], embedding2: number[]): number {
    return cosineSimilarity(embedding1, embedding2);
  }

  /**
   * Find most similar embedding from a list
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
   * Find top N most similar embeddings
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
}

/**
 * Create a new embedding manager instance
 */
export function createEmbeddingManager(modelName?: string): EmbeddingManager {
  return new EmbeddingManager(modelName);
}

/**
 * Convenience functions that match AI SDK patterns
 */
export const embedding = {
  /**
   * Single embedding - AI SDK compatible
   */
  embed: async (text: string, model?: any): Promise<number[]> => {
    const manager = new EmbeddingManager();
    return manager.embed(text, model);
  },

  /**
   * Batch embedding - AI SDK compatible
   */
  embedMany: async (texts: string[], model?: any): Promise<number[][]> => {
    const manager = new EmbeddingManager();
    return manager.embedBatch(texts, model);
  },

  /**
   * Similarity calculation - AI SDK compatible
   */
  cosineSimilarity: (embedding1: number[], embedding2: number[]): number => {
    return cosineSimilarity(embedding1, embedding2);
  },

  /**
   * Utility functions
   */
  findMostSimilar: (
    queryEmbedding: number[],
    embeddings: number[][],
  ): { index: number; similarity: number } => {
    const manager = new EmbeddingManager();
    return manager.findMostSimilar(queryEmbedding, embeddings);
  },

  findTopSimilar: (
    queryEmbedding: number[],
    embeddings: number[][],
    topN: number = 5,
  ): Array<{ index: number; similarity: number }> => {
    const manager = new EmbeddingManager();
    return manager.findTopSimilar(queryEmbedding, embeddings, topN);
  },
};
