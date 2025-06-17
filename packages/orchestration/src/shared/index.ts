/**
 * Shared exports for orchestration package
 */

// Factory exports
export * from './factories/index';

export { defaultStepRegistry, StepRegistry } from './factories/step-registry';

// Feature exports
export * from './features/index';

// Pattern exports
export * from './patterns/index';

// Type exports (excluding RateLimitConfig to avoid conflict)
export type {
  JsonValue,
  JsonObject,
  JsonArray,
  WorkflowData,
  Metadata,
  ErrorDetails,
  OperationContext,
  StepData,
  EventPayload,
  ScheduleData,
  SagaContext,
  SagaDefinition,
  SagaExecution,
  SagaExecutionState,
  SagaStep,
  BatchPattern,
  BulkheadPattern,
  CachePattern,
  CircuitBreakerPattern,
  DeduplicationPattern,
  FallbackPattern,
  MonitoringPattern,
  PatternContext,
  PatternResult,
  RateLimitPattern,
  RetryPattern,
  TimeoutPattern,
  AnyProviderConfig,
  CustomProviderConfig,
  ProviderCapabilities,
  ProviderConfig,
  ProviderContext,
  ProviderFeature,
  ProviderHealthReport,
  ProviderMetrics,
  ProviderRegistry,
  UpstashQStashConfig,
  UpstashWorkflowConfig,
  ScheduleConfig,
  ListExecutionsOptions,
  ProviderHealth,
  RetryConfig,
  WorkflowDefinition,
  WorkflowError,
  WorkflowExecution,
  WorkflowExecutionMetadata,
  WorkflowExecutionStatus,
  WorkflowProvider,
  WorkflowStep,
  WorkflowStepExecution,
  WorkflowStepStatus,
  WorkflowContext,
  WorkflowTrigger,
} from './types/index';

// Utility exports
export * from './utils/index';

// Re-export rate limit types with aliases to resolve conflict
export type { RateLimitConfig as UtilsRateLimitConfig } from './utils/rate-limit';
export type { RateLimitConfig as ProviderRateLimitConfig } from './types/provider';
