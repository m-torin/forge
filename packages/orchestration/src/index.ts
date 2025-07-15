/**
 * Orchestration Package - Main exports
 * This package provides workflow orchestration capabilities using various providers
 *
 * For environment-specific imports, use:
 * - @repo/orchestration/client - Client-side only
 * - @repo/orchestration/server - Server-side only
 * - @repo/orchestration/client/next - Next.js client features
 * - @repo/orchestration/server/next - Next.js server features
 */

// Only export core shared types that are needed across all environments
export type {
  WorkflowContext,
  WorkflowDefinition,
  WorkflowError,
  WorkflowExecution,
  WorkflowExecutionStatus,
  WorkflowProvider,
  WorkflowStep,
  WorkflowStepStatus,
} from './shared/types/index';

// Export shared utilities that are environment-agnostic
export { OrchestrationErrorCodes, createOrchestrationError } from './shared/utils/errors';

// Export validation utilities
export { validateWorkflowDefinition, validateWorkflowStep } from './shared/utils/validation';

// Export step factory functionality
export {
  StepFactory,
  StepRegistry,
  StepTemplates,
  compose,
  createStep,
  createStepWithValidation,
  toSimpleStep,
  withStepCircuitBreaker,
  withStepMonitoring,
  withStepRetry,
  withStepTimeout,
} from './shared/factories/index';

// Export workflow utilities
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
  createStepIdentifier,
  createTimestamp,
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
} from './shared/utils/workflow-utilities';

export type {
  BatchProcessingOptions,
  BatchProcessingResult,
  ErrorAccumulator,
  FallbackOptions,
  PartialSuccessResult,
} from './shared/utils/workflow-utilities';

// Export rate limiting utilities
export {
  createRateLimitHeaders,
  createRateLimiter,
  withRateLimit,
} from './shared/utils/rate-limit';

// Export additional workflow rate limiter
export { createWorkflowRateLimiter } from './shared/utils/workflow-utilities';

export type { RateLimitConfig, RateLimitResult } from './shared/utils/rate-limit';

// Export providers and workflow engine (server-side only)
export { UpstashWorkflowProvider } from './providers/index';
export { createWorkflowEngine } from './server';
