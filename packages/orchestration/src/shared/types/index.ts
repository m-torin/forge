/**
 * Shared type definitions for orchestration package
 */

// Core workflow types
export type {
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
  WorkflowTrigger,
} from './workflow';

// Scheduler types
export type { ScheduleConfig } from './scheduler';

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

// Saga pattern types
export type {
  SagaContext,
  SagaDefinition,
  SagaExecution,
  SagaExecutionState,
  SagaStep,
} from '../features/saga';

export interface ScheduledExecution {
  error?: string;
  executionTime: Date;
  id: string;
  result?: unknown;
  scheduleId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}
