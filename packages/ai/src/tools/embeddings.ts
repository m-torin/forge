import { cosineSimilarity, embed, embedMany } from 'ai';
import { models, type EmbeddingModelId } from '../providers/registry';

/**
 * Lightweight embeddings utilities - Maximum DRY
 * Now using centralized registry for all models
 * Even simpler with semantic model names
 */

// DRY helper for single embeddings using registry
export async function embedText(value: string, modelId: EmbeddingModelId = 'rag') {
  return embed({
    model: models.embedding(modelId),
    value,
    maxRetries: 2,
  });
}

// DRY helper for batch embeddings using registry
export async function embedBatch(values: string[], modelId: EmbeddingModelId = 'rag') {
  return embedMany({
    model: models.embedding(modelId),
    values,
    maxParallelCalls: 2,
  });
}

// Convenience function for similarity calculation
export async function calculateSimilarity(
  text1: string,
  text2: string,
  modelId: EmbeddingModelId = 'similarity',
) {
  const [{ embedding: e1 }, { embedding: e2 }] = await Promise.all([
    embedText(text1, modelId),
    embedText(text2, modelId),
  ]);
  return cosineSimilarity(e1, e2);
}

// Export model IDs for convenience
export { type EmbeddingModelId } from '../providers/registry';
