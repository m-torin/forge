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
export { createRateLimiter, withRateLimit, createRateLimitHeaders, createRedisFromEnv } from './rate-limit';
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
  createSafeLogger,
  withMaskedErrors,
} from './data-masking';
