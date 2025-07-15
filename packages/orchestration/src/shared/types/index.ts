/**
 * Shared type definitions for orchestration package
 */

// Common types
export type {
  ErrorDetails,
  EventPayload,
  JsonArray,
  JsonObject,
  JsonValue,
  Metadata,
  OperationContext,
  ScheduleData,
  StepData,
  WorkflowData,
} from './common';

// Saga pattern types
export type {
  SagaContext,
  SagaDefinition,
  SagaExecution,
  SagaExecutionState,
  SagaStep,
} from '../features/saga';

// Reliability pattern types
export type {
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
} from './patterns';

// Provider configuration types
export type {
  AnyProviderConfig,
  CustomProviderConfig,
  ProviderCapabilities,
  ProviderConfig,
  ProviderContext,
  ProviderFeature,
  ProviderHealthReport,
  ProviderMetrics,
  ProviderRegistry,
  RateLimitConfig,
  UpstashQStashConfig,
  UpstashWorkflowConfig,
} from './provider';

// Scheduler types
export type { ScheduleConfig } from './scheduler';

// Core workflow types
export type {
  ListExecutionsOptions,
  ProviderHealth,
  RetryConfig,
  WorkflowContext,
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
} from './workflow';

export interface ScheduledExecution {
  error?: string;
  executionTime: Date;
  id: string;
  result?: unknown;
  scheduleId: string;
  status: 'completed' | 'failed' | 'pending' | 'running';
}
