/**
 * Shared utilities for orchestration package
 */

// Error utilities
export {
  CircuitBreakerError,
  ConfigurationError,
  createProviderError,
  createWorkflowExecutionError,
  extractErrorDetails,
  isRetryableError,
  OrchestrationError,
  ProviderError,
  RateLimitError,
  TimeoutError,
  WorkflowExecutionError,
  WorkflowValidationError,
} from './errors';

export type { ValidationError } from './errors';

// Manager utilities
export { OrchestrationManager } from './manager';
export type { OrchestrationManagerConfig } from './manager';

// Rate limiting utilities
export { createRateLimiter, withRateLimit, createRateLimitHeaders } from './rate-limit';
export type { RateLimitConfig, RateLimitResult } from './rate-limit';

// Validation utilities
export {
  sanitizeConfig,
  validateEnvironmentVariables,
  validateProviderConfig,
  validateRetryConfig,
  validateScheduleConfig,
  validateWorkflowDefinition,
  validateWorkflowStep,
} from './validation';

// Input validation utilities
export {
  commonSchemas,
  apiSchemas,
  sanitizeInput,
  validateRequestBody,
  validateQueryParams,
  validatePathParams,
  createValidatedHandler,
} from './input-validation';

// Data masking utilities
export {
  maskSensitiveData,
  createMaskedError,
  safeConsole,
  withMaskedErrors,
} from './data-masking';

// Workflow-specific utilities
export {
  CIRCUIT_BREAKER_CONFIGS,
  RATE_LIMITER_CONFIGS,
  processBatch,
  ProgressReporter,
  createErrorAccumulator,
  addError,
  addWarning,
  hasErrors,
  hasCriticalErrors,
  getErrorSummary,
  RETRY_STRATEGIES,
  CommonSchemas,
  withFallback,
  streamProcess,
  createMemoryEfficientProcessor,
  createPartialSuccessResult,
  updateSuccessRate,
  addSuccessfulResult,
  addFailedResult,
  createWorkflowRateLimiter,
  createRateLimiterWithCheck,
  createStepIdentifier,
  formatDuration,
  createTimestamp,
  isValidIdentifier,
  sanitizeIdentifier,
} from './workflow-utilities';

export type {
  BatchProcessingOptions,
  BatchProcessingResult,
  ErrorAccumulator,
  FallbackOptions,
  PartialSuccessResult,
} from './workflow-utilities';
