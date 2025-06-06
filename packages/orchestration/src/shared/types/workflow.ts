/**
 * Core workflow type definitions
 */

import type { StepRegistry } from '../factories/step-registry';
// import type { EventBus } from '../features/event-bus';
import type { AdvancedScheduler } from '../features/scheduler';

// Temporary EventBus type until event-bus feature is implemented
type EventBus = any;
// Type alias for backward compatibility
type SchedulingService = AdvancedScheduler;

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
  metadata?: Record<string, any>;
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
  input?: Record<string, any>;
  /** Human-readable name */
  name: string;
  /** Whether this step can be skipped on failure */
  optional?: boolean;
  /** Retry configuration specific to this step */
  retryConfig?: RetryConfig;
  /** Timeout for this step in milliseconds */
  timeout?: number;
}

export interface WorkflowExecution {
  /** When execution completed (if finished) */
  completedAt?: Date;
  /** Error information (if failed) */
  error?: WorkflowError;
  /** Unique execution identifier */
  id: string;
  /** Input provided to the workflow */
  input?: Record<string, any>;
  /** Execution metadata */
  metadata?: WorkflowExecutionMetadata;
  /** Final output (if completed successfully) */
  output?: Record<string, any>;
  /** When execution started */
  startedAt: Date;
  /** Current execution status */
  status: WorkflowExecutionStatus;
  /** Step executions */
  steps: WorkflowStepExecution[];
  /** Workflow definition ID */
  workflowId: string;
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

export interface WorkflowExecutionMetadata {
  /** Additional context data */
  context?: Record<string, any>;
  /** User or system that initiated the execution */
  initiator?: string;
  /** Parent execution ID (for sub-workflows) */
  parentExecutionId?: string;
  /** Tags applied to this execution */
  tags?: string[];
  /** Trigger that started this execution */
  trigger?: WorkflowTrigger;
}

export interface WorkflowError {
  /** Error code */
  code?: string;
  /** Original error details */
  details?: any;
  /** Human-readable message */
  message: string;
  /** Whether this error is retryable */
  retryable?: boolean;
  /** Stack trace */
  stack?: string;
  /** Step ID where error occurred */
  stepId?: string;
  /** When the error occurred */
  timestamp?: Date;
}

export interface RetryConfig {
  /** Backoff strategy */
  backoff: 'fixed' | 'exponential' | 'linear';
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

export interface ScheduleConfig {
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

export interface WorkflowTrigger {
  /** Payload provided by trigger */
  payload?: Record<string, any>;
  /** Source of the trigger */
  source?: string;
  /** When trigger was activated */
  timestamp: Date;
  /** Type of trigger */
  type: 'manual' | 'schedule' | 'webhook' | 'event' | 'api';
}

export type WorkflowExecutionStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'timeout'
  | 'paused'
  | 'skipped';

export interface WorkflowProvider {
  /** Cancel a running execution */
  cancelExecution(executionId: string): Promise<boolean>;
  /** Create a new workflow definition */
  createWorkflow?(definition: WorkflowDefinition): Promise<string>;
  /** Execute a workflow */
  execute(definition: WorkflowDefinition, input?: Record<string, any>): Promise<WorkflowExecution>;
  /** Execute a workflow by ID */
  executeWorkflow?(
    workflowId: string,
    input?: unknown,
    options?: Record<string, unknown>,
  ): Promise<string>;
  /** Get execution status */
  getExecution(executionId: string): Promise<WorkflowExecution | null>;
  /** Get execution status (alternative method name) */
  getExecutionStatus?(executionId: string): Promise<WorkflowExecution | null>;
  /** Get a workflow definition */
  getWorkflow?(workflowId: string): Promise<WorkflowDefinition | null>;
  /** Health check */
  healthCheck(): Promise<ProviderHealth>;
  /** List executions for a workflow */
  listExecutions(workflowId: string, options?: ListExecutionsOptions): Promise<WorkflowExecution[]>;
  /** List workflow definitions */
  listWorkflows?(filter?: { tags?: string[]; status?: string }): Promise<WorkflowDefinition[]>;
  /** Provider identifier */
  name: string;
  /** Schedule a workflow */
  scheduleWorkflow(definition: WorkflowDefinition): Promise<string>;
  /** Unschedule a workflow */
  unscheduleWorkflow(workflowId: string): Promise<boolean>;
  /** Provider version */
  version: string;
}

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
  details?: Record<string, any>;
  /** Response time in milliseconds */
  responseTime: number;
  /** Provider status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** When health was checked */
  timestamp: Date;
}

export interface WorkflowEngineConfig {
  defaultProvider?: string;
  events?: {
    enabled: boolean;
    bus?: EventBus;
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
