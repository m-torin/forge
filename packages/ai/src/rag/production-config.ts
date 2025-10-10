/**
 * Production-Ready RAG Configuration Presets
 * Optimized configurations for different deployment scenarios and use cases
 */

import type { ConversationMemoryConfig } from './conversation-memory';
import type { EvaluationConfig } from './evaluation-metrics';
import type { HybridSearchConfig } from './hybrid-search';
import type { ChunkingConfig } from './semantic-chunking';

/**
 * Complete production RAG configuration
 */
export interface ProductionRAGConfig {
  // Core settings
  modelProvider: 'openai' | 'anthropic';
  embeddingModel: string;

  // Search configuration
  hybridSearch: HybridSearchConfig;

  // Document processing
  chunking: ChunkingConfig;

  // Memory and context
  conversationMemory: ConversationMemoryConfig;

  // Performance settings
  performance: {
    maxConcurrentRequests: number;
    requestTimeoutMs: number;
    cacheTTLMs: number;
    enableBatching: boolean;
    batchSize: number;
  };

  // Resilience settings
  resilience: {
    enableCircuitBreaker: boolean;
    enableRetry: boolean;
    enableHealthMonitoring: boolean;
    enableGracefulDegradation: boolean;
  };

  // Evaluation settings
  evaluation?: EvaluationConfig;
}

/**
 * High-performance configuration for enterprise applications
 */
const enterpriseConfig: ProductionRAGConfig = {
  modelProvider: 'openai',
  embeddingModel: 'text-embedding-3-large',

  hybridSearch: {
    vectorWeight: 0.7,
    keywordWeight: 0.3,
    fusionMethod: 'rrf',
    vectorTopK: 50,
    keywordTopK: 50,
    finalTopK: 20,
    phraseBoost: 1.3,
    titleBoost: 1.5,
    recencyBoost: true,
    lengthPenalty: true,
  },

  chunking: {
    strategy: 'semantic_similarity',
    chunkSize: 1000,
    chunkOverlap: 200,
    semanticThreshold: 0.75,
  },

  conversationMemory: {
    maxMessagesInMemory: 200,
    summaryInterval: 20,
    enableEntityExtraction: true,
    embedConversations: true,
  },

  performance: {
    maxConcurrentRequests: 100,
    requestTimeoutMs: 30000,
    cacheTTLMs: 300000, // 5 minutes
    enableBatching: true,
    batchSize: 20,
  },

  resilience: {
    enableCircuitBreaker: true,
    enableRetry: true,
    enableHealthMonitoring: true,
    enableGracefulDegradation: true,
  },

  evaluation: {
    computeRetrievalMetrics: true,
    computeGenerationMetrics: true,
    enableRAGAS: true,
  },
};

/**
 * Balanced configuration for general production use
 */
const productionConfig: ProductionRAGConfig = {
  modelProvider: 'openai',
  embeddingModel: 'text-embedding-3-small',

  hybridSearch: {
    vectorWeight: 0.6,
    keywordWeight: 0.4,
    fusionMethod: 'rrf',
    vectorTopK: 30,
    keywordTopK: 30,
    finalTopK: 10,
    phraseBoost: 1.2,
    titleBoost: 1.4,
    recencyBoost: false,
    lengthPenalty: false,
  },

  chunking: {
    strategy: 'paragraph_based',
    chunkSize: 800,
    chunkOverlap: 150,
  },

  conversationMemory: {
    maxMessagesInMemory: 100,
    summaryInterval: 15,
    enableEntityExtraction: false,
    embedConversations: false,
  },

  performance: {
    maxConcurrentRequests: 50,
    requestTimeoutMs: 15000,
    cacheTTLMs: 180000, // 3 minutes
    enableBatching: true,
    batchSize: 10,
  },

  resilience: {
    enableCircuitBreaker: true,
    enableRetry: true,
    enableHealthMonitoring: true,
    enableGracefulDegradation: true,
  },
};

/**
 * Development configuration for testing and prototyping
 */
const developmentConfig: ProductionRAGConfig = {
  modelProvider: 'openai',
  embeddingModel: 'text-embedding-3-small',

  hybridSearch: {
    vectorWeight: 0.7,
    keywordWeight: 0.3,
    fusionMethod: 'weighted',
    vectorTopK: 10,
    keywordTopK: 10,
    finalTopK: 5,
    phraseBoost: 1.1,
    titleBoost: 1.2,
  },

  chunking: {
    strategy: 'fixed_size',
    chunkSize: 500,
    chunkOverlap: 50,
  },

  conversationMemory: {
    maxMessagesInMemory: 50,
    summaryInterval: 10,
    enableEntityExtraction: false,
    embedConversations: false,
  },

  performance: {
    maxConcurrentRequests: 10,
    requestTimeoutMs: 10000,
    cacheTTLMs: 60000, // 1 minute
    enableBatching: false,
    batchSize: 5,
  },

  resilience: {
    enableCircuitBreaker: false,
    enableRetry: true,
    enableHealthMonitoring: false,
    enableGracefulDegradation: false,
  },
};

/**
 * Lightweight configuration for cost-conscious deployments
 */
const economyConfig: ProductionRAGConfig = {
  modelProvider: 'openai',
  embeddingModel: 'text-embedding-ada-002',

  hybridSearch: {
    vectorWeight: 0.8,
    keywordWeight: 0.2,
    fusionMethod: 'weighted',
    vectorTopK: 15,
    keywordTopK: 15,
    finalTopK: 5,
    phraseBoost: 1.0,
    titleBoost: 1.1,
  },

  chunking: {
    strategy: 'sentence_based',
    chunkSize: 600,
    chunkOverlap: 100,
  },

  conversationMemory: {
    maxMessagesInMemory: 25,
    summaryInterval: 5,
    enableEntityExtraction: false,
    embedConversations: false,
  },

  performance: {
    maxConcurrentRequests: 20,
    requestTimeoutMs: 12000,
    cacheTTLMs: 600000, // 10 minutes
    enableBatching: true,
    batchSize: 15,
  },

  resilience: {
    enableCircuitBreaker: true,
    enableRetry: true,
    enableHealthMonitoring: false,
    enableGracefulDegradation: true,
  },
};

/**
 * Real-time configuration for interactive applications
 */
const realtimeConfig: ProductionRAGConfig = {
  modelProvider: 'openai',
  embeddingModel: 'text-embedding-3-small',

  hybridSearch: {
    vectorWeight: 0.9,
    keywordWeight: 0.1,
    fusionMethod: 'max',
    vectorTopK: 20,
    keywordTopK: 10,
    finalTopK: 8,
    phraseBoost: 1.2,
    titleBoost: 1.3,
    recencyBoost: true,
  },

  chunking: {
    strategy: 'sliding_window',
    chunkSize: 400,
    chunkOverlap: 80,
  },

  conversationMemory: {
    maxMessagesInMemory: 150,
    summaryInterval: 25,
    enableEntityExtraction: true,
    embedConversations: true,
  },

  performance: {
    maxConcurrentRequests: 200,
    requestTimeoutMs: 5000,
    cacheTTLMs: 30000, // 30 seconds
    enableBatching: false,
    batchSize: 5,
  },

  resilience: {
    enableCircuitBreaker: true,
    enableRetry: false, // Fast fail for real-time
    enableHealthMonitoring: true,
    enableGracefulDegradation: true,
  },
};

/**
 * Available production configurations
 */
export const productionConfigs = {
  enterprise: enterpriseConfig,
  production: productionConfig,
  development: developmentConfig,
  economy: economyConfig,
  realtime: realtimeConfig,
} as const;

/**
 * Get production configuration by name
 */
export function getProductionConfig(
  configName: keyof typeof productionConfigs,
): ProductionRAGConfig {
  const config = productionConfigs[configName];
  if (!config) {
    throw new Error(`Unknown production config: ${configName}`);
  }
  return { ...config }; // Return a copy to prevent mutation
}

/**
 * Create custom production configuration by merging presets
 */
export function createCustomProductionConfig(
  baseConfig: keyof typeof productionConfigs,
  overrides: Partial<ProductionRAGConfig>,
): ProductionRAGConfig {
  const base = getProductionConfig(baseConfig);

  return {
    ...base,
    ...overrides,
    hybridSearch: {
      ...base.hybridSearch,
      ...overrides.hybridSearch,
    },
    chunking: {
      ...base.chunking,
      ...overrides.chunking,
    },
    conversationMemory: {
      ...base.conversationMemory,
      ...overrides.conversationMemory,
    },
    performance: {
      ...base.performance,
      ...overrides.performance,
    },
    resilience: {
      ...base.resilience,
      ...overrides.resilience,
    },
    evaluation: overrides.evaluation || base.evaluation,
  };
}

/**
 * Validate production configuration
 */
export function validateProductionConfig(config: ProductionRAGConfig): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Validate hybrid search weights
  const totalWeight =
    (config.hybridSearch.vectorWeight ?? 0.7) + (config.hybridSearch.keywordWeight ?? 0.3);
  if (Math.abs(totalWeight - 1.0) > 0.01) {
    errors.push(`Hybrid search weights must sum to 1.0, got ${totalWeight}`);
  }

  // Validate chunk sizes
  if (config.chunking.chunkSize && config.chunking.chunkSize <= 0) {
    errors.push('Chunk size must be greater than 0');
  }

  if (
    config.chunking.chunkOverlap &&
    config.chunking.chunkSize &&
    config.chunking.chunkOverlap >= config.chunking.chunkSize
  ) {
    warnings.push('Chunk overlap should be smaller than chunk size');
  }

  // Validate performance settings
  if (config.performance.maxConcurrentRequests <= 0) {
    errors.push('Max concurrent requests must be greater than 0');
  }

  if (config.performance.requestTimeoutMs <= 1000) {
    warnings.push('Request timeout is very low, may cause frequent timeouts');
  }

  // Validate memory settings
  if (
    config.conversationMemory.maxMessagesInMemory &&
    config.conversationMemory.maxMessagesInMemory <= 0
  ) {
    errors.push('Max messages in memory must be greater than 0');
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Performance benchmarking configuration
 */
export interface BenchmarkConfig {
  iterations: number;
  concurrency: number;
  warmupRuns: number;
  testQueries: string[];
  evaluateAccuracy: boolean;
  evaluateSpeed: boolean;
  evaluateResourceUsage: boolean;
}

export const defaultBenchmarkConfig: BenchmarkConfig = {
  iterations: 100,
  concurrency: 5,
  warmupRuns: 10,
  testQueries: [
    'What is machine learning?',
    'Explain deep learning neural networks',
    'How does natural language processing work?',
    'What are the applications of computer vision?',
    'Compare supervised and unsupervised learning',
  ],
  evaluateAccuracy: true,
  evaluateSpeed: true,
  evaluateResourceUsage: false,
};
