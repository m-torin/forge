// Core exports
export { executeAIOperation, executeWithStreaming, getModel } from './operations';
export { messageUtils } from './utils';
// Middleware exports - use observabilityHooks from ai-middleware instead
// export { errorUtils, withRetry, metricsUtils } from '../middleware/ai-middleware';
export {
  chatFragments,
  errorConfigFragments,
  errorFragments,
  lruCacheFragments,
  outputStrategyFragments,
  promptEngineering,
  structuredFragments,
} from './fragments';
// Cache middleware exports
export { createLRUCacheMiddleware, type LRUCacheOptions } from '../tools/lru-cache-middleware';

// Additional utility exports (explicit for tree shaking)
export {
  calculateCost,
  formatUsage,
  generateOperationId,
  isRetryableError,
  mergeConfigs,
  retryWithBackoff,
  validateConfig,
} from './utils';

// Type exports (explicit for tree shaking)
export type {
  AIOperationConfig,
  AIOperationResult,
  AIStreamResult,
  ChatConfig,
  ChatResult,
  FragmentConfig,
  ProviderConfig,
  RAGConfig,
  RetryConfig,
  ToolConfig,
  ToolLifecycle,
} from './types';
