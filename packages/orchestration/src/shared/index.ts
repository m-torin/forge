/**
 * Shared exports for orchestration package
 */

// Factory exports
export * from './factories/index';

export { StepRegistry, defaultStepRegistry } from './factories/step-registry';

// Feature exports
export * from './features/index';

// Pattern exports
export * from './patterns/index';

// Type exports (excluding RateLimitConfig to avoid conflict)
export type {
  AnyProviderConfig,
  BatchPattern,
  BulkheadPattern,
  CachePattern,
  CircuitBreakerPattern,
  CustomProviderConfig,
  DeduplicationPattern,
  ErrorDetails,
  EventPayload,
  FallbackPattern,
  JsonArray,
  JsonObject,
  JsonValue,
  ListExecutionsOptions,
  Metadata,
  MonitoringPattern,
  OperationContext,
  PatternContext,
  PatternResult,
  ProviderCapabilities,
  ProviderConfig,
  ProviderContext,
  ProviderFeature,
  ProviderHealth,
  ProviderHealthReport,
  ProviderMetrics,
  ProviderRegistry,
  RateLimitPattern,
  RetryConfig,
  RetryPattern,
  SagaContext,
  SagaDefinition,
  SagaExecution,
  SagaExecutionState,
  SagaStep,
  ScheduleConfig,
  ScheduleData,
  StepData,
  TimeoutPattern,
  UpstashQStashConfig,
  UpstashWorkflowConfig,
  WorkflowContext,
  WorkflowData,
  WorkflowDefinition,
  WorkflowError,
  WorkflowExecution,
  WorkflowExecutionMetadata,
  WorkflowExecutionStatus,
  WorkflowProvider,
  WorkflowStep,
  WorkflowStepExecution,
  WorkflowStepStatus,
  WorkflowTrigger,
} from './types/index';

// Utility exports
export * from './utils/index';

// Re-export rate limit types with aliases to resolve conflict
export type { RateLimitConfig as ProviderRateLimitConfig } from './types/provider';
export type { RateLimitConfig as UtilsRateLimitConfig } from './utils/rate-limit';
