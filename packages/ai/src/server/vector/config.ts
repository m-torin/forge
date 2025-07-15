/**
 * Vector database configuration constants and defaults
 * Provides standard configuration for vector operations across AI applications
 */

/**
 * Vector configuration interface
 */
export interface VectorConfig {
  // Embedding configuration
  embedding: {
    dimension: number;
    model: string;
    provider: 'openai' | 'cohere' | 'huggingface' | 'custom';
  };

  // Search configuration
  search: {
    defaultTopK: number;
    maxTopK: number;
    defaultThreshold: number;
    includeMetadata: boolean;
  };

  // Document processing
  chunking: {
    defaultSize: number;
    defaultOverlap: number;
    minSize: number;
    maxSize: number;
  };

  // Namespaces
  namespaces: {
    default: string;
    documents: string;
    chatHistory: string;
    knowledgeBase: string;
    [key: string]: string;
  };

  // Performance
  performance: {
    maxBatchSize: number;
    maxConcurrency: number;
    cacheEnabled: boolean;
    cacheTTL: number; // in seconds
  };
}

/**
 * Default vector configuration
 */
export const DEFAULT_VECTOR_CONFIG: VectorConfig = {
  embedding: {
    dimension: 1536, // OpenAI text-embedding-3-small
    model: 'text-embedding-3-small',
    provider: 'openai',
  },

  search: {
    defaultTopK: 5,
    maxTopK: 100,
    defaultThreshold: 0.7,
    includeMetadata: true,
  },

  chunking: {
    defaultSize: 1000,
    defaultOverlap: 200,
    minSize: 100,
    maxSize: 4000,
  },

  namespaces: {
    default: 'default',
    documents: 'documents',
    chatHistory: 'chat-history',
    knowledgeBase: 'knowledge-base',
  },

  performance: {
    maxBatchSize: 100,
    maxConcurrency: 10,
    cacheEnabled: true,
    cacheTTL: 300, // 5 minutes
  },
};

/**
 * Common embedding model configurations
 */
export const EMBEDDING_MODELS = {
  openai: {
    'text-embedding-3-small': {
      dimension: 1536,
      maxTokens: 8191,
      provider: 'openai' as const,
    },
    'text-embedding-3-large': {
      dimension: 3072,
      maxTokens: 8191,
      provider: 'openai' as const,
    },
    'text-embedding-ada-002': {
      dimension: 1536,
      maxTokens: 8191,
      provider: 'openai' as const,
    },
  },
  cohere: {
    'embed-english-v3.0': {
      dimension: 1024,
      maxTokens: 512,
      provider: 'cohere' as const,
    },
    'embed-multilingual-v3.0': {
      dimension: 1024,
      maxTokens: 512,
      provider: 'cohere' as const,
    },
  },
  huggingface: {
    'sentence-transformers/all-MiniLM-L6-v2': {
      dimension: 384,
      maxTokens: 256,
      provider: 'huggingface' as const,
    },
    'sentence-transformers/all-mpnet-base-v2': {
      dimension: 768,
      maxTokens: 384,
      provider: 'huggingface' as const,
    },
  },
};

/**
 * Create a custom vector configuration
 */
export function createVectorConfig(overrides: Partial<VectorConfig> = {}): VectorConfig {
  return {
    embedding: {
      ...DEFAULT_VECTOR_CONFIG.embedding,
      ...overrides.embedding,
    },
    search: {
      ...DEFAULT_VECTOR_CONFIG.search,
      ...overrides.search,
    },
    chunking: {
      ...DEFAULT_VECTOR_CONFIG.chunking,
      ...overrides.chunking,
    },
    namespaces: {
      ...DEFAULT_VECTOR_CONFIG.namespaces,
      ...overrides.namespaces,
    },
    performance: {
      ...DEFAULT_VECTOR_CONFIG.performance,
      ...overrides.performance,
    },
  };
}

/**
 * Validate vector configuration
 */
export function validateVectorConfig(config: VectorConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate embedding
  if (config.embedding.dimension <= 0) {
    errors.push('Embedding dimension must be positive');
  }

  // Validate search
  if (config.search.defaultTopK <= 0 || config.search.defaultTopK > config.search.maxTopK) {
    errors.push('Invalid defaultTopK value');
  }
  if (config.search.defaultThreshold < 0 || config.search.defaultThreshold > 1) {
    errors.push('Threshold must be between 0 and 1');
  }

  // Validate chunking
  if (config.chunking.defaultSize <= 0 || config.chunking.defaultSize > config.chunking.maxSize) {
    errors.push('Invalid chunk size');
  }
  if (
    config.chunking.defaultOverlap < 0 ||
    config.chunking.defaultOverlap >= config.chunking.defaultSize
  ) {
    errors.push('Overlap must be less than chunk size');
  }

  // Validate performance
  if (config.performance.maxBatchSize <= 0) {
    errors.push('Max batch size must be positive');
  }
  if (config.performance.maxConcurrency <= 0) {
    errors.push('Max concurrency must be positive');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get embedding model configuration
 */
export function getEmbeddingModelConfig(modelName: string) {
  // Check all providers
  for (const provider of Object.values(EMBEDDING_MODELS)) {
    if (modelName in provider) {
      return provider[modelName as keyof typeof provider];
    }
  }

  // Return default if not found
  return {
    dimension: DEFAULT_VECTOR_CONFIG.embedding.dimension,
    maxTokens: 8191,
    provider: 'custom' as const,
  };
}

/**
 * Calculate optimal chunk size based on model constraints
 */
export function calculateOptimalChunkSize(
  modelName: string,
  targetOverlapRatio: number = 0.2,
): { chunkSize: number; overlap: number } {
  const modelConfig = getEmbeddingModelConfig(modelName);
  const maxTokens = modelConfig.maxTokens;

  // Rough estimate: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4;

  // Leave some buffer for safety
  const chunkSize = Math.floor(maxChars * 0.8);
  const overlap = Math.floor(chunkSize * targetOverlapRatio);

  return {
    chunkSize: Math.min(chunkSize, DEFAULT_VECTOR_CONFIG.chunking.maxSize),
    overlap: Math.max(overlap, DEFAULT_VECTOR_CONFIG.chunking.defaultOverlap),
  };
}

/**
 * Namespace utilities
 */
export const namespaceUtils = {
  /**
   * Create a user-specific namespace
   */
  userNamespace: (userId: string, base: string = 'documents') => `user:${userId}:${base}`,

  /**
   * Create a project-specific namespace
   */
  projectNamespace: (projectId: string, base: string = 'documents') =>
    `project:${projectId}:${base}`,

  /**
   * Create a timestamped namespace
   */
  timestampedNamespace: (base: string = 'documents') => `${base}:${Date.now()}`,

  /**
   * Parse namespace parts
   */
  parseNamespace: (namespace: string) => {
    const parts = namespace.split(':');
    return {
      type: parts[0],
      id: parts[1],
      base: parts[2] || 'documents',
    };
  },
};

// Export convenience constants for backward compatibility
export const VECTOR_CONFIG = {
  EMBEDDING_DIMENSION: DEFAULT_VECTOR_CONFIG.embedding.dimension,
  DEFAULT_TOP_K: DEFAULT_VECTOR_CONFIG.search.defaultTopK,
  SIMILARITY_THRESHOLD: DEFAULT_VECTOR_CONFIG.search.defaultThreshold,
  CHUNK_SIZE: DEFAULT_VECTOR_CONFIG.chunking.defaultSize,
  CHUNK_OVERLAP: DEFAULT_VECTOR_CONFIG.chunking.defaultOverlap,
  NAMESPACES: DEFAULT_VECTOR_CONFIG.namespaces,
} as const;
