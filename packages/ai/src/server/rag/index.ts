/**
 * Enhanced RAG System with Error Handling & Resilience
 * Complete RAG implementation with circuit breaker, retry logic, health monitoring, and graceful degradation
 */

// Core RAG functionality - selective exports to avoid conflicts
export {
  RAGDatabaseBridge,
  createRAGDatabaseBridge,
  createRAGDatabaseBridgeFromEnv,
  defaultRAGBridge,
  type RAGDatabaseConfig,
} from './database-bridge';

export {
  StructuredRAGService,
  createStructuredRAG,
  quickStructuredRAG,
  ragSchemas,
  type BaseRAGResponse,
  type StructuredRAGConfig,
} from './structured-rag';

export { createRAGMessageProcessor, type MessageProcessingConfig } from './message-processing';

export {
  createRAGMiddleware,
  createRAGMiddlewareFromEnv,
  type RAGMiddlewareConfig,
} from './middleware';

// Selective exports to avoid conflicts
export {
  RegistryRAGFactory,
  createRAGMiddlewareWithRegistry,
  createRAGWithRegistry,
  migrateToRegistry,
  ragWithRegistry,
  type RegistryRAGConfig,
} from './registry-integration';

export {
  RAGTelemetry,
  trackRAGOperation,
  type RAGTelemetryConfig,
  type RAGUsageMetrics,
} from './telemetry';

// Resilience and error handling
export {
  CircuitBreakerOpenError,
  CircuitBreakerRegistry,
  CircuitBreakerState,
  CircuitBreakerTimeoutError,
  RAGCircuitBreaker,
  executeWithCircuitBreaker,
  ragCircuitBreakerRegistry,
  ragCircuitBreakers,
  withCircuitBreaker,
  type CircuitBreakerConfig,
  type CircuitBreakerMetrics,
} from './circuit-breaker';

export {
  EnhancedRetry,
  ErrorType,
  RAGRetryPatterns,
  RetryStrategy,
  defaultRAGRetry,
  ragRetry,
  retryWithCircuitBreaker,
  withRetry,
  type RetryConfig,
  type RetryResult,
} from './enhanced-retry';

export {
  HealthStatus,
  RAGHealthMonitor,
  getRAGHealthMonitor,
  initializeRAGHealthMonitoring,
  monitorRAGOperation,
  recordRAGOperation,
  type ComponentHealth,
  type HealthCheckConfig,
  type RAGMetrics,
} from './health-monitoring';

export {
  DegradationStrategy,
  RAGDegradationManager,
  executeWithGracefulDegradation,
  getRAGDegradationManager,
  initializeRAGDegradation,
  withGracefulDegradation,
  type DegradationConfig,
  type DegradationContext,
  type RAGOperationResult,
} from './graceful-degradation';

// Advanced RAG Features - Streaming and Tools
export {
  ProgressiveContextEnhancer,
  RealTimeRAGConversation,
  createStreamingRAG,
  createStreamingStructuredRAG,
  streamingRAGExamples,
  type StreamingContextResult,
  type StreamingRAGConfig,
} from './streaming-rag';

export {
  createContextualAnswerTool,
  createDefaultRAGTools,
  createDocumentSimilarityTool,
  createKnowledgeSearchTool,
  createKnowledgeStatssTool,
  createRAGToolset,
  ragToolExamples,
  type RAGToolConfig,
} from './rag-tools';

// AI SDK RAG exports
export {
  AISDKRag,
  createAISDKRagFromEnv,
  createRAGChatHandler,
  examples,
  quickRAG,
  ragQuery,
  type RAGChatConfig,
} from './ai-sdk-rag';

// Types are already exported above in the selective exports

// Factory functions and utilities are already exported above

/**
 * Complete RAG setup with all resilience features
 * This is the recommended way to initialize a production-ready RAG system
 */
// Types are already exported in the selective exports above

export interface CompleteRAGConfig {
  // Core configuration
  vectorStore?: import('./database-bridge').RAGDatabaseBridge;
  databaseConfig?: import('./database-bridge').RAGDatabaseConfig;
  languageModel: any; // LanguageModel type

  // Search configuration
  topK?: number;
  useUpstashEmbedding?: boolean;
  similarityThreshold?: number;
  systemPrompt?: string;

  // Resilience configuration
  circuitBreaker?: {
    enabled?: boolean;
    thresholds?: {
      failureThreshold?: number;
      recoveryTimeout?: number;
      timeoutDuration?: number;
    };
  };

  retry?: {
    enabled?: boolean;
    maxRetries?: number;
    baseDelay?: number;
    strategy?: 'exponential_backoff' | 'linear_backoff' | 'fixed_delay' | 'fibonacci' | 'custom';
  };

  healthMonitoring?: {
    enabled?: boolean;
    interval?: number;
    thresholds?: {
      responseTime?: number;
      errorRate?: number;
    };
  };

  gracefulDegradation?: {
    enabled?: boolean;
    strategies?: (
      | 'cache_fallback'
      | 'simplified_search'
      | 'no_rag'
      | 'cached_responses'
      | 'reduced_context'
      | 'alternative_embedding'
      | 'fail_fast'
    )[];
    fallbackCache?: {
      enabled?: boolean;
      ttl?: number;
    };
  };
}

/**
 * Create a complete RAG system with all resilience features enabled
 */
export function createCompleteRAG(config: CompleteRAGConfig) {
  // Import functions to avoid issues with export conflicts
  const { createRAGDatabaseBridge } = require('./database-bridge');
  const { createStructuredRAG } = require('./structured-rag');
  const { createRAGMiddleware } = require('./middleware');
  const { initializeRAGHealthMonitoring, getRAGHealthMonitor } = require('./health-monitoring');
  const { initializeRAGDegradation, getRAGDegradationManager } = require('./graceful-degradation');
  const { ragCircuitBreakerRegistry } = require('./circuit-breaker');

  // Initialize vector store
  const vectorStore =
    config.vectorStore ||
    createRAGDatabaseBridge({
      ...config.databaseConfig,
      useUpstashEmbedding: config.useUpstashEmbedding,
    });

  // Initialize health monitoring
  if (config.healthMonitoring?.enabled !== false) {
    initializeRAGHealthMonitoring(vectorStore, {
      interval: config.healthMonitoring?.interval,
      thresholds: config.healthMonitoring?.thresholds,
    });
  }

  // Initialize graceful degradation
  if (config.gracefulDegradation?.enabled !== false) {
    initializeRAGDegradation(vectorStore, {
      enabled: true,
      strategies: config.gracefulDegradation?.strategies,
      fallbackCache: config.gracefulDegradation?.fallbackCache,
    });
  }

  // Create structured RAG service
  const ragService = createStructuredRAG({
    vectorStore,
    languageModel: config.languageModel,
    topK: config.topK,
    useUpstashEmbedding: config.useUpstashEmbedding,
    similarityThreshold: config.similarityThreshold,
    systemPrompt: config.systemPrompt,
  });

  // Create middleware
  const ragMiddleware = createRAGMiddleware({
    vectorStore,
    topK: config.topK,
    useUpstashEmbedding: config.useUpstashEmbedding,
    similarityThreshold: config.similarityThreshold,
  });

  return {
    service: ragService,
    middleware: ragMiddleware,
    vectorStore,

    // Monitoring and management functions
    getHealthStatus: () => getRAGHealthMonitor()?.getHealthSummary(),
    getMetrics: () => getRAGHealthMonitor()?.getMetrics(),
    getDegradationStatus: () => getRAGDegradationManager()?.getDegradationStatus(),
    resetCircuitBreakers: () => ragCircuitBreakerRegistry.resetAll(),

    // Convenience methods
    generateQA: (query: string) => ragService.generateQA(query),
    generateAnalysis: (query: string) => ragService.generateAnalysis(query),
    generateComparison: (query: string) => ragService.generateComparison(query),
    generateSummary: (query: string) => ragService.generateSummary(query),
    extractFacts: (query: string) => ragService.extractFacts(query),
  };
}

/**
 * Production-ready RAG setup with sensible defaults
 */
export function createProductionRAG(
  config: Omit<
    CompleteRAGConfig,
    'circuitBreaker' | 'retry' | 'healthMonitoring' | 'gracefulDegradation'
  >,
) {
  return createCompleteRAG({
    ...config,
    // Enable all resilience features with production defaults
    circuitBreaker: {
      enabled: true,
      thresholds: {
        failureThreshold: 5,
        recoveryTimeout: 60000, // 1 minute
        timeoutDuration: 30000, // 30 seconds
      },
    },
    retry: {
      enabled: true,
      maxRetries: 3,
      baseDelay: 1000,
      strategy: 'exponential_backoff',
    },
    healthMonitoring: {
      enabled: true,
      interval: 60000, // 1 minute
      thresholds: {
        responseTime: 5000, // 5 seconds
        errorRate: 0.1, // 10%
      },
    },
    gracefulDegradation: {
      enabled: true,
      strategies: ['cache_fallback', 'simplified_search', 'reduced_context', 'no_rag'],
      fallbackCache: {
        enabled: true,
        ttl: 300000, // 5 minutes
      },
    },
  });
}
