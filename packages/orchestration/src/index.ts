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
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowExecutionStatus,
  WorkflowStep,
  WorkflowStepStatus,
  WorkflowContext,
  WorkflowError,
  WorkflowProvider,
} from './shared/types/index';

// Export shared utilities that are environment-agnostic
export { createOrchestrationError, OrchestrationErrorCodes } from './shared/utils/errors';

// Export validation utilities
export { validateWorkflowDefinition, validateWorkflowStep } from './shared/utils/validation';

// Export step factory functionality
export {
  compose,
  createStep,
  createStepWithValidation,
  StepFactory,
  StepRegistry,
  StepTemplates,
  toSimpleStep,
  withStepCircuitBreaker,
  withStepMonitoring,
  withStepRetry,
  withStepTimeout,
} from './shared/factories/index';

// Export workflow utilities
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
  createStepIdentifier,
  formatDuration,
  createTimestamp,
  isValidIdentifier,
  sanitizeIdentifier,
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
  createRateLimiter,
  withRateLimit,
  createRateLimitHeaders,
} from './shared/utils/rate-limit';

// Export additional workflow rate limiter
export { createWorkflowRateLimiter } from './shared/utils/workflow-utilities';

export type { RateLimitConfig, RateLimitResult } from './shared/utils/rate-limit';

// Export providers and workflow engine (server-side only)
export { UpstashWorkflowProvider } from './providers/index';
export { createWorkflowEngine } from './server';
