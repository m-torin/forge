/**
 * Shared utilities for orchestration package
 */

// Error utilities
export {
  CircuitBreakerError,
  ConfigurationError,
  OrchestrationError,
  OrchestrationErrorCodes,
  ProviderError,
  RateLimitError,
  TimeoutError,
  WorkflowExecutionError,
  WorkflowValidationError,
  createOrchestrationError,
  createProviderError,
  createWorkflowExecutionError,
  extractErrorDetails,
  isRetryableError,
} from './errors';

export type { ValidationError } from './errors';

// Manager utilities
export { OrchestrationManager } from './manager';
export type { OrchestrationManagerConfig } from './manager';

// Rate limiting utilities
export { createRateLimitHeaders, createRateLimiter, withRateLimit } from './rate-limit';
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
  apiSchemas,
  commonSchemas,
  createValidatedHandler,
  sanitizeInput,
  validatePathParams,
  validateQueryParams,
  validateRequestBody,
} from './input-validation';

// Data masking utilities
export {
  createMaskedError,
  maskSensitiveData,
  safeConsole,
  _withMaskedErrors as withMaskedErrors,
} from './data-masking';

// Workflow-specific utilities
export {
  CIRCUIT_BREAKER_CONFIGS,
  CommonSchemas,
  ProgressReporter,
  RATE_LIMITER_CONFIGS,
  RETRY_STRATEGIES,
  addError,
  addFailedResult,
  addSuccessfulResult,
  addWarning,
  createErrorAccumulator,
  createMemoryEfficientProcessor,
  createPartialSuccessResult,
  createRateLimiterWithCheck,
  createStepIdentifier,
  createTimestamp,
  createWorkflowRateLimiter,
  formatDuration,
  getErrorSummary,
  hasCriticalErrors,
  hasErrors,
  isValidIdentifier,
  processBatch,
  sanitizeIdentifier,
  streamProcess,
  updateSuccessRate,
  withFallback,
} from './workflow-utilities';

export type {
  BatchProcessingOptions,
  BatchProcessingResult,
  ErrorAccumulator,
  FallbackOptions,
  PartialSuccessResult,
} from './workflow-utilities';
