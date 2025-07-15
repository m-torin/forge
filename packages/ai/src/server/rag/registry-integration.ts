/**
 * Integration between RAG system and provider registry
 * Provides convenient helpers for using registry models with RAG
 */

import { logInfo } from '@repo/observability';
import type { EmbeddingModel } from 'ai';
import { createRAGDatabaseBridge, type RAGDatabaseBridge } from './database-bridge';
import { createRAGMiddleware } from './middleware';

// Import the registry helpers (assuming they exist)
// These would come from the provider registry
interface RegistryHelpers {
  embedding: {
    default: () => EmbeddingModel<string>;
    large: () => EmbeddingModel<string>;
    legacy: () => EmbeddingModel<string>;
  };
}

/**
 * Configuration for registry-based RAG setup
 */
export interface RegistryRAGConfig {
  vectorUrl: string;
  vectorToken: string;
  embeddingType?: 'default' | 'large' | 'legacy';
  namespace?: string;
  dimensions?: number;
}

/**
 * Create RAG system using provider registry models
 */
export function createRAGWithRegistry(
  config: RegistryRAGConfig,
  registry: RegistryHelpers,
): RAGDatabaseBridge {
  // Get embedding model from registry
  let embeddingModel: EmbeddingModel<string>;
  switch (config.embeddingType) {
    case 'large':
      embeddingModel = registry.embedding.large();
      break;
    case 'legacy':
      embeddingModel = registry.embedding.legacy();
      break;
    case 'default':
    default:
      embeddingModel = registry.embedding.default();
  }

  return createRAGDatabaseBridge({
    embeddingModel,
    namespace: config.namespace,
    vectorConfig: {
      dimensions: config.dimensions,
      namespace: config.namespace,
    },
  });
}

/**
 * Create RAG middleware using provider registry
 */
export function createRAGMiddlewareWithRegistry(
  config: RegistryRAGConfig & {
    topK?: number;
    useUpstashEmbedding?: boolean;
    similarityThreshold?: number;
  },
  registry: RegistryHelpers,
) {
  const vectorStore = createRAGWithRegistry(config, registry);

  return createRAGMiddleware({
    vectorStore,
    topK: config.topK,
    useUpstashEmbedding: config.useUpstashEmbedding,
    similarityThreshold: config.similarityThreshold,
  });
}

/**
 * Convenience functions for common embedding types
 */
export const ragWithRegistry = {
  /**
   * Create RAG with default embedding model (text-embedding-3-small)
   */
  withDefault: (config: Omit<RegistryRAGConfig, 'embeddingType'>, registry: RegistryHelpers) =>
    createRAGWithRegistry({ ...config, embeddingType: 'default' }, registry),

  /**
   * Create RAG with large embedding model (text-embedding-3-large)
   */
  withLarge: (config: Omit<RegistryRAGConfig, 'embeddingType'>, registry: RegistryHelpers) =>
    createRAGWithRegistry({ ...config, embeddingType: 'large' }, registry),

  /**
   * Create RAG with legacy embedding model (text-embedding-ada-002)
   */
  withLegacy: (config: Omit<RegistryRAGConfig, 'embeddingType'>, registry: RegistryHelpers) =>
    createRAGWithRegistry({ ...config, embeddingType: 'legacy' }, registry),
};

/**
 * Type-safe RAG factory with registry integration
 */
export class RegistryRAGFactory {
  constructor(private registry: RegistryHelpers) {}

  /**
   * Create vector store with specified embedding model
   */
  createVectorStore(config: RegistryRAGConfig): RAGDatabaseBridge {
    return createRAGWithRegistry(config, this.registry);
  }

  /**
   * Create middleware with specified embedding model
   */
  createMiddleware(
    config: RegistryRAGConfig & {
      topK?: number;
      useUpstashEmbedding?: boolean;
      similarityThreshold?: number;
    },
  ) {
    return createRAGMiddlewareWithRegistry(config, this.registry);
  }

  /**
   * Get embedding model from registry
   */
  getEmbeddingModel(type: 'default' | 'large' | 'legacy' = 'default'): EmbeddingModel<string> {
    switch (type) {
      case 'large':
        return this.registry.embedding.large();
      case 'legacy':
        return this.registry.embedding.legacy();
      case 'default':
      default:
        return this.registry.embedding.default();
    }
  }
}

/**
 * Helper function to migrate from simple RAG to registry-based RAG
 */
export function migrateToRegistry(
  existingConfig: {
    vectorUrl: string;
    vectorToken: string;
    namespace?: string;
  },
  registry: RegistryHelpers,
  embeddingType: 'default' | 'large' | 'legacy' = 'default',
): RAGDatabaseBridge {
  logInfo(`Migrating RAG to use registry embedding model: ${embeddingType}`);

  return createRAGWithRegistry(
    {
      ...existingConfig,
      embeddingType,
    },
    registry,
  );
}

/**
 * Usage examples
 */
export const examples = {
  /**
   * Basic registry integration
   */
  basic: `
import { createRAGWithRegistry } from './registry-integration';
import { registry } from '../providers/registry';

// Using the registry helpers
const vectorStore = createRAGWithRegistry({
  vectorUrl: process.env.UPSTASH_VECTOR_REST_URL!,
  vectorToken: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  embeddingType: 'default', // Uses text-embedding-3-small
  namespace: 'my-app',
}, {
  embedding: {
    default: () => registry.textEmbeddingModel('openai:text-embedding-3-small'),
    large: () => registry.textEmbeddingModel('openai:text-embedding-3-large'),
    legacy: () => registry.textEmbeddingModel('openai:text-embedding-ada-002'),
  }
});
  `,

  /**
   * Middleware with registry
   */
  middleware: `
import { createRAGMiddlewareWithRegistry } from './registry-integration';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const ragMiddleware = createRAGMiddlewareWithRegistry({
  vectorUrl: process.env.UPSTASH_VECTOR_REST_URL!,
  vectorToken: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  embeddingType: 'large', // Uses text-embedding-3-large for better quality
  topK: 5,
  similarityThreshold: 0.8,
}, registry);

const result = streamText({
  model: openai('gpt-4o'),
  messages,
  experimental_middlewares: [ragMiddleware],
});
  `,

  /**
   * Factory pattern
   */
  factory: `
import { RegistryRAGFactory } from './registry-integration';

const ragFactory = new RegistryRAGFactory(registry);

// Create different configurations easily
const defaultRAG = ragFactory.createVectorStore({
  vectorUrl: process.env.UPSTASH_VECTOR_REST_URL!,
  vectorToken: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  embeddingType: 'default',
});

const highQualityRAG = ragFactory.createVectorStore({
  vectorUrl: process.env.UPSTASH_VECTOR_REST_URL!,
  vectorToken: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  embeddingType: 'large',
});
  `,
};
