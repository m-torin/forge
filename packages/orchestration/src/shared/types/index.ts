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
  ExecutionMetadata,
  ExecutionStatus,
  ListExecutionsOptions,
  ProviderHealth,
  RetryConfig,
  StepInput,
  StepOutput,
  StepStatus,
  WorkflowContext,
  WorkflowData,
  WorkflowDefinition,
  WorkflowError,
  WorkflowExecution,
  WorkflowExecutionMetadata,
  WorkflowExecutionStatus,
  WorkflowMetadata,
  WorkflowProvider,
  WorkflowStatus,
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

// Utility functions re-exported for convenience
// These are imported from '../utils' with careful consideration for circular dependencies
export {
  createExecutionContext,
  createScheduleConfig,
  createStepDefinition,
  createWorkflowDefinition,
  deserializeWorkflow,
  isExecutionResult,
  isScheduleConfig,
  isStepDefinition,
  isWorkflowDefinition,
  normalizeStepInput,
  sanitizeExecutionOutput,
  serializeWorkflow,
} from '../utils/workflow-utilities';

// Validation functions removed to prevent circular dependencies
// Import validateWorkflowDefinition directly from '../utils/validation' when needed

// Note: Removed other re-exports from '../utils' and '../factories' to prevent circular dependencies
// Import these directly from their specific modules when needed
