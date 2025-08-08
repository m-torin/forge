/**
 * AI SDK v5 Provider Test Utilities
 * Mock provider implementations for testing different AI services
 */

import { MockEmbeddingModelV2 } from 'ai/test';

/**
 * Create a mock embedding model with specified dimensions
 */
export function getMockEmbeddingModel(provider: string, modelName: string, dimensions = 1536) {
  return new MockEmbeddingModelV2({
    modelId: `${provider}:${modelName}`,
    doEmbed: async () => ({
      embeddings: [Array.from({ length: dimensions }, () => 0.1)],
      usage: { tokens: 10 },
    }),
    maxEmbeddingsPerCall: 100,
    supportsParallelCalls: true,
  });
}

/**
 * Mock provider registry for testing
 */
export const mockProviderRegistry = {
  openai: {
    'text-embedding-3-small': () => getMockEmbeddingModel('openai', 'text-embedding-3-small', 1536),
    'text-embedding-3-large': () => getMockEmbeddingModel('openai', 'text-embedding-3-large', 3072),
  },
  google: {
    'text-embedding-004': () => getMockEmbeddingModel('google', 'text-embedding-004', 768),
  },
};
