// Core utilities with new centralized modules
export * from './id-generation';
export * from './parallel';
export * from './time';
export * from './validation';
// Export specific items from batch-processor to avoid conflicts
export {
  type BatchCallbacks,
  BatchProcessor,
  type BatchConfig as UtilsBatchConfig,
  type BatchProcessingResult as UtilsBatchProcessingResult,
  type BatchResult as UtilsBatchResult,
} from './batch-processor';
// Note: environment utils excluded from client export as they use process.env
// export {
//   env,
//   ENV_CONFIGS,
//   envLog,
//   getApiBaseUrl,
//   getBooleanEnvVar,
//   getDefaultMaxRetries,
//   getDefaultTimeout,
//   getEnvConfig,
//   getEnvironment,
//   getEnvVar,
//   getNumericEnvVar,
//   getRequiredEnvVar,
//   isCacheEnabled,
//   isDevelopment,
//   isFeatureEnabled,
//   isLocalQStash,
//   isProduction,
//   isStrictMode,
//   isTest,
// } from './environment';
export * from './results';

// Export specific items from resilience (includes retry functionality)
export {
  CircuitBreaker,
  // Retry functionality (merged from retry.ts)
  createRetryWrapper,
  DomainRateLimiter,
  RateLimiter,
  RETRY_PRESETS,
  retryOperation,
  retryWithRateLimit,
  type UnifiedRetryConfig,
} from './resilience';

// Export monitoring utilities (includes error handling, observability, and response functionality)
export {
  // Error handling
  classifyError,
  classifyHttpStatus,
  classifyWorkflowError,
  createErrorMessage,
  // Response functionality
  createResponse,
  createWorkflowError,
  createWorkflowMonitor,
  createWorkflowStatusHook,
  createWorkflowStatusStream,
  // Observability
  devLog,
  ERROR_RETRY_CATEGORIES,
  errorHandlers,
  getEnvironmentConfig,
  HTTP_STATUS,
  isAuthenticationError,
  isNetworkError,
  isNotFoundError,
  isPermissionError,
  isRateLimitError,
  isRetryableError,
  isTimeoutError,
  isValidationError,
  RETRY_CONFIGS,
  withApiErrorHandling,
  withRetryErrorHandling,
  withWorkflowErrorHandling,
  WorkflowError,
  workflowError,
  WorkflowErrorType,
  type WorkflowMonitor,
  type WorkflowResponse,
  workflowSuccess,
} from './monitoring';

// Existing utilities
export * from './helpers';
export * from './resource-management';
export * from './types';
export * from './testing';
// Note: ai-integration excluded due to potential server dependencies
// export * from './ai-integration';
export * from './security';
export * from './step-naming';
// Note: product-classification is excluded from main export as it requires server-only database access
// export * from './product-classification';
