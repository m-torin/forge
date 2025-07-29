/**
 * Unified RAG Configuration System
 * Provides a single, comprehensive configuration interface for all RAG implementations
 */

import type { EmbeddingModel } from 'ai';
import type { RAGTelemetryConfig } from './telemetry';

/**
 * Core vector database configuration
 */
export interface VectorDBConfig {
  /** Upstash Vector REST URL */
  url: string;
  /** Upstash Vector REST Token */
  token: string;
  /** Optional namespace for data isolation */
  namespace?: string;
  /** Vector dimensions (default: 1536 for OpenAI embeddings) */
  dimensions?: number;
}

/**
 * Embedding configuration with multiple options
 */
export interface EmbeddingConfig {
  /** Embedding approach */
  type: 'ai_sdk' | 'upstash_hosted';
  /** Model specification - string name or EmbeddingModel instance */
  model?: string | EmbeddingModel<string>;
  /** Specific model name for string-based config */
  modelName?: 'text-embedding-3-small' | 'text-embedding-3-large' | 'text-embedding-ada-002';
  /** Provider registry type */
  registryType?: 'default' | 'large' | 'legacy';
}

/**
 * Document processing and chunking configuration
 */
export interface DocumentConfig {
  /** Chunking strategy */
  chunkingStrategy?: 'fixed' | 'sentence' | 'paragraph' | 'semantic';
  /** Chunk size in characters */
  chunkSize?: number;
  /** Overlap between chunks */
  chunkOverlap?: number;
  /** Maximum chunks per document */
  maxChunks?: number;
}

/**
 * Search and retrieval configuration
 */
export interface RetrievalConfig {
  /** Number of results to retrieve */
  topK?: number;
  /** Minimum similarity threshold */
  similarityThreshold?: number;
  /** Enable relevance scoring */
  enableRelevanceScoring?: boolean;
  /** Rerank results */
  enableReranking?: boolean;
}

/**
 * Generation and LLM configuration
 */
export interface GenerationConfig {
  /** LLM provider */
  provider?: 'openai' | 'anthropic' | 'google' | 'custom';
  /** Model name */
  model?: string;
  /** Generation temperature */
  temperature?: number;
  /** Maximum output tokens */
  maxOutputTokens?: number;
  /** Max tool calling steps */
  maxSteps?: number;
  /** Custom system prompt */
  systemPrompt?: string;
}

/**
 * Middleware and processing configuration
 */
export interface MiddlewareConfig {
  /** Enable AI SDK v5 middleware pattern */
  enableMiddleware?: boolean;
  /** Custom context injection */
  contextInjectionStrategy?: 'prepend' | 'append' | 'replace';
  /** Enable streaming responses */
  enableStreaming?: boolean;
}

/**
 * Unified RAG Configuration
 * Combines all configuration aspects into a single interface
 */
export interface UnifiedRAGConfig {
  /** Vector database settings */
  vectorDB: VectorDBConfig;
  /** Embedding configuration */
  embedding: EmbeddingConfig;
  /** Document processing settings */
  document?: DocumentConfig;
  /** Retrieval settings */
  retrieval?: RetrievalConfig;
  /** Generation settings */
  generation?: GenerationConfig;
  /** Middleware settings */
  middleware?: MiddlewareConfig;
  /** Telemetry and monitoring */
  telemetry?: RAGTelemetryConfig;
  /** Environment-specific overrides */
  environment?: 'development' | 'production';
}

/**
 * Configuration defaults for different environments
 */
export const configDefaults = {
  development: {
    document: {
      chunkingStrategy: 'fixed' as const,
      chunkSize: 1000,
      chunkOverlap: 200,
      maxChunks: 100,
    },
    retrieval: {
      topK: 5,
      similarityThreshold: 0.7,
      enableRelevanceScoring: true,
      enableReranking: false,
    },
    generation: {
      provider: 'openai' as const,
      model: 'gpt-4o',
      temperature: 0.1,
      maxOutputTokens: 1000,
      maxSteps: 3,
    },
    middleware: {
      enableMiddleware: true,
      contextInjectionStrategy: 'prepend' as const,
      enableStreaming: true,
    },
    telemetry: {
      enableMetrics: true,
      enablePerformanceTracking: true,
      enableCostTracking: false,
      logLevel: 'info' as const,
    },
  },

  production: {
    document: {
      chunkingStrategy: 'semantic' as const,
      chunkSize: 800,
      chunkOverlap: 150,
      maxChunks: 50,
    },
    retrieval: {
      topK: 3,
      similarityThreshold: 0.8,
      enableRelevanceScoring: true,
      enableReranking: true,
    },
    generation: {
      provider: 'openai' as const,
      model: 'gpt-4o',
      temperature: 0.0,
      maxOutputTokens: 800,
      maxSteps: 2,
    },
    middleware: {
      enableMiddleware: true,
      contextInjectionStrategy: 'prepend' as const,
      enableStreaming: true,
    },
    telemetry: {
      enableMetrics: true,
      enablePerformanceTracking: true,
      enableCostTracking: true,
      logLevel: 'warn' as const,
    },
  },
} as const;

/**
 * Configuration validation and normalization
 */
export class RAGConfigValidator {
  /**
   * Validate and normalize a RAG configuration
   */
  static validate(config: Partial<UnifiedRAGConfig>): UnifiedRAGConfig {
    // Validate required fields
    if (!config.vectorDB?.url || !config.vectorDB?.token) {
      throw new Error('Vector database URL and token are required');
    }

    if (!config.embedding?.type) {
      throw new Error('Embedding type is required');
    }

    // Get environment defaults
    const environment = config.environment || 'development';
    const defaults = configDefaults[environment];

    // Merge with defaults
    const normalizedConfig: UnifiedRAGConfig = {
      vectorDB: {
        dimensions: 1536,
        ...config.vectorDB,
      },
      embedding: {
        modelName: 'text-embedding-3-small',
        ...config.embedding,
      },
      document: {
        ...defaults.document,
        ...config.document,
      },
      retrieval: {
        ...defaults.retrieval,
        ...config.retrieval,
      },
      generation: {
        ...defaults.generation,
        ...config.generation,
      },
      middleware: {
        ...defaults.middleware,
        ...config.middleware,
      },
      telemetry: {
        ...defaults.telemetry,
        ...config.telemetry,
      },
      environment,
    };

    return normalizedConfig;
  }

  /**
   * Create configuration from environment variables
   */
  static fromEnvironment(overrides?: Partial<UnifiedRAGConfig>): UnifiedRAGConfig {
    const vectorUrl = process.env.UPSTASH_VECTOR_REST_URL;
    const vectorToken = process.env.UPSTASH_VECTOR_REST_TOKEN;
    const namespace = process.env.UPSTASH_VECTOR_NAMESPACE;
    const environment = (process.env.NODE_ENV as 'development' | 'production') || 'development';

    if (!vectorUrl || !vectorToken) {
      throw new Error('UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN must be set');
    }

    const baseConfig: Partial<UnifiedRAGConfig> = {
      vectorDB: {
        url: vectorUrl,
        token: vectorToken,
        namespace,
      },
      embedding: {
        type: 'ai_sdk',
        modelName: 'text-embedding-3-small',
      },
      environment,
      ...overrides,
    };

    return this.validate(baseConfig);
  }

  /**
   * Convert config to specific implementation configs
   */
  static toImplementationConfigs(config: UnifiedRAGConfig) {
    return {
      // For UpstashAIConfig
      upstashAI: {
        vectorUrl: config.vectorDB.url,
        vectorToken: config.vectorDB.token,
        embeddingModel: config.embedding.modelName,
        namespace: config.vectorDB.namespace,
        dimensions: config.vectorDB.dimensions,
      },

      // For RAGChatConfig
      ragChat: {
        vectorUrl: config.vectorDB.url,
        vectorToken: config.vectorDB.token,
        model: config.generation?.model,
        provider: config.generation?.provider,
        systemPrompt: config.generation?.systemPrompt,
        namespace: config.vectorDB.namespace,
        useUpstashEmbedding: config.embedding.type === 'upstash_hosted',
        maxSteps: config.generation?.maxSteps,
      },

      // For middleware config
      middleware: {
        topK: config.retrieval?.topK,
        useUpstashEmbedding: config.embedding.type === 'upstash_hosted',
        similarityThreshold: config.retrieval?.similarityThreshold,
      },

      // For telemetry config
      telemetry: config.telemetry,
    };
  }
}

/**
 * Configuration builder with fluent API
 */
export class RAGConfigBuilder {
  private config: Partial<UnifiedRAGConfig> = {};

  /**
   * Set vector database configuration
   */
  vectorDB(url: string, token: string, options?: { namespace?: string; dimensions?: number }) {
    this.config.vectorDB = {
      url,
      token,
      namespace: options?.namespace,
      dimensions: options?.dimensions,
    };
    return this;
  }

  /**
   * Set embedding configuration
   */
  embedding(
    type: 'ai_sdk' | 'upstash_hosted',
    modelOrOptions?:
      | string
      | { model?: string | EmbeddingModel<string>; registryType?: 'default' | 'large' | 'legacy' },
  ) {
    if (typeof modelOrOptions === 'string') {
      this.config.embedding = { type, modelName: modelOrOptions as any };
    } else {
      this.config.embedding = { type, ...modelOrOptions };
    }
    return this;
  }

  /**
   * Set document processing configuration
   */
  documents(options: DocumentConfig) {
    this.config.document = options;
    return this;
  }

  /**
   * Set retrieval configuration
   */
  retrieval(options: RetrievalConfig) {
    this.config.retrieval = options;
    return this;
  }

  /**
   * Set generation configuration
   */
  generation(options: GenerationConfig) {
    this.config.generation = options;
    return this;
  }

  /**
   * Set environment
   */
  environment(env: 'development' | 'production') {
    this.config.environment = env;
    return this;
  }

  /**
   * Build and validate the configuration
   */
  build(): UnifiedRAGConfig {
    return RAGConfigValidator.validate(this.config);
  }
}

/**
 * Convenience function to create a config builder
 */
export function ragConfig(): RAGConfigBuilder {
  return new RAGConfigBuilder();
}

/**
 * Usage examples
 */
export const examples = {
  /**
   * Simple configuration
   */
  simple: `
import { ragConfig } from './unified-config';

const config = ragConfig()
  .vectorDB(
    process.env.UPSTASH_VECTOR_REST_URL!,
    process.env.UPSTASH_VECTOR_REST_TOKEN!,
    { namespace: 'my-app' }
  )
  .embedding('ai_sdk', 'text-embedding-3-small')
  .environment('production')
  .build();
  `,

  /**
   * Advanced configuration
   */
  advanced: `
const config = ragConfig()
  .vectorDB(vectorUrl, vectorToken, { namespace: 'advanced-rag' })
  .embedding('ai_sdk', { registryType: 'large' })
  .documents({
    chunkingStrategy: 'semantic',
    chunkSize: 800,
    chunkOverlap: 100,
  })
  .retrieval({
    topK: 3,
    similarityThreshold: 0.85,
    enableReranking: true,
  })
  .generation({
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.1,
  })
  .environment('production')
  .build();
  `,

  /**
   * From environment variables
   */
  fromEnv: `
import { RAGConfigValidator } from './unified-config';

const config = RAGConfigValidator.fromEnvironment({
  retrieval: { topK: 3 },
  generation: { model: 'gpt-4o' },
});
  `,
};
