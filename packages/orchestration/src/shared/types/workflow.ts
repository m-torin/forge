/**
 * Core workflow type definitions
 */

import { ErrorDetails, EventPayload, Metadata, WorkflowData } from './common';
import { WorkflowError } from './errors';

export interface ListExecutionsOptions {
  /** Pagination cursor */
  cursor?: string;
  endDate?: Date;
  /** Maximum number of results */
  limit?: number;
  /** Filter by date range */
  startDate?: Date;
  /** Filter by status */
  status?: WorkflowExecutionStatus[];
}

export interface ProviderHealth {
  /** Additional health details */
  details?: ErrorDetails;
  /** Response time in milliseconds */
  responseTime: number;
  /** Provider status */
  status: 'degraded' | 'healthy' | 'unhealthy';
  /** When health was checked */
  timestamp: Date;
}
export interface RetryConfig {
  /** Backoff strategy */
  backoff: 'exponential' | 'fixed' | 'linear';
  /** Base delay between retries in milliseconds */
  delay: number;
  /** Jitter to add randomness to delays */
  jitter?: boolean;
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Maximum delay cap for exponential backoff */
  maxDelay?: number;
  /** Conditions that determine if retry should happen */
  retryIf?: (error: WorkflowError) => boolean;
}

interface ScheduleConfig {
  /** Cron expression for schedule */
  cron: string;
  /** Whether schedule is currently active */
  enabled: boolean;
  /** When schedule stops being effective */
  endDate?: Date;
  /** When schedule starts being effective */
  startDate?: Date;
  /** Timezone for schedule evaluation */
  timezone?: string;
}

export interface WorkflowDefinition {
  /** Whether this workflow can be triggered manually */
  allowManualTrigger?: boolean;
  /** Optional description */
  description?: string;
  /** Environment variables for workflow execution */
  env?: Record<string, string>;
  /** Unique identifier for the workflow */
  id: string;
  /** Workflow metadata */
  metadata?: Metadata;
  /** Human-readable name */
  name: string;
  /** Configuration for retry behavior */
  retryConfig?: RetryConfig;
  /** Schedule configuration for periodic execution */
  schedule?: ScheduleConfig;
  /** Steps that make up the workflow */
  steps: WorkflowStep[];
  /** Tags for categorization */
  tags?: string[];
  /** Timeout configuration */
  timeout?: number;
  /** Workflow version for change management */
  version: string;
}

interface WorkflowEngineConfig {
  defaultProvider?: string;
  events?: {
    bus?: EventBus;
    enabled: boolean;
  };
  monitoring?: {
    enabled: boolean;
    metrics?: {
      enabled: boolean;
      interval?: number;
    };
  };
  providers: WorkflowProvider[];
  scheduling?: {
    enabled: boolean;
    service?: SchedulingService;
  };
  stepFactory?: {
    enabled: boolean;
    registry?: StepRegistry;
  };
}

export interface WorkflowExecution {
  /** When execution completed (if finished) */
  completedAt?: Date;
  /** Error information (if failed) */
  error?: WorkflowError;
  /** Unique execution identifier */
  id: string;
  /** Input provided to the workflow */
  input?: WorkflowData;
  /** Execution metadata */
  metadata?: WorkflowExecutionMetadata;
  /** Final output (if completed successfully) */
  output?: WorkflowData;
  /** When execution started */
  startedAt: Date;
  /** Current execution status */
  status: WorkflowExecutionStatus;
  /** Step executions */
  steps: WorkflowStepExecution[];
  /** Workflow definition ID */
  workflowId: string;
}

export interface WorkflowExecutionMetadata {
  /** Additional context data */
  context?: ErrorDetails;
  /** User or system that initiated the execution */
  initiator?: string;
  /** Parent execution ID (for sub-workflows) */
  parentExecutionId?: string;
  /** Tags applied to this execution */
  tags?: string[];
  /** Trigger that started this execution */
  trigger?: WorkflowTrigger;
}

export type { WorkflowError };

export type WorkflowExecutionStatus =
  | 'cancelled'
  | 'completed'
  | 'failed'
  | 'paused'
  | 'pending'
  | 'running'
  | 'skipped'
  | 'timeout';

/**
 * Status of individual workflow steps
 */
export type WorkflowStepStatus =
  | 'cancelled'
  | 'completed'
  | 'failed'
  | 'pending'
  | 'running'
  | 'skipped'
  | 'timeout';

/**
 * Workflow execution context providing access to execution state and utilities
 */
export interface WorkflowContext {
  /** Current execution ID */
  executionId: string;
  /** Input data for the workflow */
  input?: WorkflowData;
  /** Metadata about the execution */
  metadata?: WorkflowExecutionMetadata;
  /** Previous step outputs by step ID */
  stepOutputs: Record<string, unknown>;
  /** Current workflow definition */
  workflow: WorkflowDefinition;
  /** Current workflow ID */
  workflowId: string;
}

export interface WorkflowProvider {
  /** Cancel a running execution */
  cancelExecution(executionId: string): Promise<boolean>;
  /** Create a new workflow definition */
  createWorkflow?(definition: WorkflowDefinition): Promise<string>;
  /** Execute a workflow */
  execute(definition: WorkflowDefinition, input?: WorkflowData): Promise<WorkflowExecution>;
  /** Execute a workflow by ID */
  executeWorkflow?(
    workflowId: string,
    input?: unknown,
    options?: Record<string, unknown>,
  ): Promise<string>;
  /** Get execution status */
  getExecution(executionId: string): Promise<null | WorkflowExecution>;
  /** Get execution status (alternative method name) */
  getExecutionStatus?(executionId: string): Promise<null | WorkflowExecution>;
  /** Get a workflow definition */
  getWorkflow?(workflowId: string): Promise<null | WorkflowDefinition>;
  /** Health check */
  healthCheck(): Promise<ProviderHealth>;
  /** List executions for a workflow */
  listExecutions(workflowId: string, options?: ListExecutionsOptions): Promise<WorkflowExecution[]>;
  /** List workflow definitions */
  listWorkflows?(filter?: { status?: string; tags?: string[] }): Promise<WorkflowDefinition[]>;
  /** Provider identifier */
  name: string;
  /** Schedule a workflow */
  scheduleWorkflow(definition: WorkflowDefinition): Promise<string>;
  /** Unschedule a workflow */
  unscheduleWorkflow(workflowId: string): Promise<boolean>;
  /** Provider version */
  version: string;
  /** Cleanup resources (optional) */
  cleanup?(): Promise<void>;
}

export interface WorkflowStep {
  /** The action/function to execute */
  action: string;
  /** Condition to determine if step should execute */
  condition?: string;
  /** Dependencies - steps that must complete before this one */
  dependsOn?: string[];
  /** Unique identifier within the workflow */
  id: string;
  /** Input parameters for the step */
  input?: WorkflowData;
  /** Human-readable name */
  name: string;
  /** Whether this step can be skipped on failure */
  optional?: boolean;
  /** Retry configuration specific to this step */
  retryConfig?: RetryConfig;
  /** Timeout for this step in milliseconds */
  timeout?: number;
}

export interface WorkflowStepExecution {
  /** Number of retry attempts */
  attempts?: number;
  /** When step completed */
  completedAt?: Date;
  /** Duration in milliseconds */
  duration?: number;
  /** Error if step failed */
  error?: WorkflowError;
  /** Input provided to the step */
  input?: unknown;
  /** Step name */
  name?: string;
  /** Step output */
  output?: unknown;
  /** Number of retry attempts */
  retryCount?: number;
  /** When step started */
  startedAt?: Date;
  /** Execution status */
  status: WorkflowExecutionStatus;
  /** Step identifier */
  stepId: string;
  /** Step name (alternative field) */
  stepName?: string;
}

interface WorkflowTrigger {
  /** Payload provided by trigger */
  payload?: EventPayload;
  /** Source of the trigger */
  source?: string;
  /** When trigger was activated */
  timestamp: Date;
  /** Type of trigger */
  type: 'api' | 'event' | 'manual' | 'schedule' | 'webhook';
}

// Temporary EventBus type until event-bus feature is implemented
/**
 * Event bus interface for workflow events
 */
interface EventBus {
  emit(event: string, data: EventPayload): void;
  on(event: string, handler: (data: EventPayload) => void): void;
  off(event: string, handler: (data: EventPayload) => void): void;
}

// Type alias for backward compatibility (defined locally to avoid circular import)
interface SchedulingService {
  listSchedules(): Promise<ScheduleConfig[]>;
  scheduleWorkflow(workflowId: string, schedule: ScheduleConfig): Promise<string>;
  unscheduleWorkflow(scheduleId: string): Promise<boolean>;
}

// import { EventBus } from '../features/event-bus';
// Define minimal StepRegistry interface to avoid circular dependencies
interface StepRegistry {
  get(id: string): WorkflowDefinition | null;
  list(): WorkflowStep[];
  register(id: string, step: WorkflowStep): void;
}

// ===== MISSING TYPES FOR TESTS =====

export interface StepInput {
  [key: string]: unknown;
}

export interface StepOutput {
  [key: string]: unknown;
}

export interface WorkflowMetadata {
  [key: string]: unknown;
}

export interface ExecutionMetadata {
  [key: string]: unknown;
}

export interface WorkflowStatus {
  status: string;
}

export interface StepStatus {
  status: string;
}

export interface ExecutionStatus {
  status: string;
}

// Re-export WorkflowData from common for direct access
export type { WorkflowData } from './common';
