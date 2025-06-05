/**
 * Upstash Workflow Provider Types
 * Type definitions specific to Upstash Workflow implementation
 */

import type { WorkflowContext as BaseWorkflowContext } from '@upstash/workflow';
import type { Client as QStashClient } from '@upstash/qstash';
import type { Redis } from '@upstash/redis';
import type { z } from 'zod';

/**
 * Extended context for Upstash workflows
 */
export interface UpstashWorkflowContext {
  /**
   * QStash client for advanced operations
   */
  qstash?: QStashClient;
  
  /**
   * Redis client for persistence
   */
  redis?: Redis;
  
  /**
   * Custom metadata
   */
  metadata?: Record<string, any>;
  
  /**
   * Workflow context from Upstash
   */
  upstashContext?: BaseWorkflowContext;
}

/**
 * Upstash step configuration
 */
export interface UpstashStepConfig {
  /**
   * Step timeout in milliseconds
   */
  timeout?: number;
  
  /**
   * Number of retries
   */
  retries?: number;
  
  /**
   * Retry backoff configuration
   */
  retryBackoff?: {
    initialInterval?: number;
    maxInterval?: number;
    exponent?: number;
    maxAttempts?: number;
  };
  
  /**
   * Rate limiting
   */
  rateLimit?: {
    limit: number;
    window: string; // e.g., "1m", "1h", "1d"
  };
  
  /**
   * Step dependencies
   */
  dependsOn?: string[];
  
  /**
   * Parallel execution group
   */
  parallelGroup?: string;
}

/**
 * Upstash workflow configuration
 */
export interface UpstashWorkflowConfig {
  /**
   * Workflow timeout
   */
  timeout?: number;
  
  /**
   * Default step configuration
   */
  defaultStepConfig?: UpstashStepConfig;
  
  /**
   * Deduplication configuration
   */
  deduplication?: {
    enabled: boolean;
    key?: string | ((params: any) => string);
    ttl?: number;
  };
  
  /**
   * Event configuration
   */
  events?: {
    onStart?: boolean;
    onComplete?: boolean;
    onFailure?: boolean;
    onStepComplete?: boolean;
    webhookUrl?: string;
  };
  
  /**
   * Scheduling configuration
   */
  scheduling?: {
    cron?: string;
    delay?: number | string;
    timezone?: string;
  };
  
  /**
   * Persistence configuration
   */
  persistence?: {
    enabled: boolean;
    ttl?: number;
    includeStepResults?: boolean;
  };
}

/**
 * Upstash runtime information
 */
export interface UpstashRuntimeInfo {
  /**
   * Workflow run ID
   */
  runId: string;
  
  /**
   * QStash message ID
   */
  messageId?: string;
  
  /**
   * Current attempt number
   */
  attempt: number;
  
  /**
   * Execution environment
   */
  environment: 'production' | 'development' | 'staging';
  
  /**
   * Region where workflow is executing
   */
  region?: string;
  
  /**
   * Execution start time
   */
  startedAt: Date;
}

/**
 * Upstash step result
 */
export interface UpstashStepResult<T = any> {
  /**
   * Step name
   */
  name: string;
  
  /**
   * Execution status
   */
  status: 'success' | 'failure' | 'skipped';
  
  /**
   * Step output
   */
  data?: T;
  
  /**
   * Error information
   */
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
  
  /**
   * Execution duration in milliseconds
   */
  duration: number;
  
  /**
   * Number of retries
   */
  retryCount: number;
  
  /**
   * Timestamp
   */
  timestamp: Date;
}

/**
 * Upstash workflow state
 */
export interface UpstashWorkflowState<T = any> {
  /**
   * Current workflow status
   */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  
  /**
   * Workflow input parameters
   */
  input: T;
  
  /**
   * Current step index
   */
  currentStep: number;
  
  /**
   * Completed steps
   */
  completedSteps: string[];
  
  /**
   * Step results
   */
  stepResults: Record<string, UpstashStepResult>;
  
  /**
   * Global workflow state
   */
  state: Record<string, any>;
  
  /**
   * Error information
   */
  error?: {
    message: string;
    code?: string;
    stepName?: string;
    timestamp: Date;
  };
  
  /**
   * Runtime information
   */
  runtime: UpstashRuntimeInfo;
}

/**
 * Upstash event types
 */
export type UpstashEventType = 
  | 'workflow.started'
  | 'workflow.completed'
  | 'workflow.failed'
  | 'workflow.cancelled'
  | 'step.started'
  | 'step.completed'
  | 'step.failed'
  | 'step.retrying';

/**
 * Upstash event payload
 */
export interface UpstashEvent {
  /**
   * Event type
   */
  type: UpstashEventType;
  
  /**
   * Workflow ID
   */
  workflowId: string;
  
  /**
   * Run ID
   */
  runId: string;
  
  /**
   * Event timestamp
   */
  timestamp: Date;
  
  /**
   * Event data
   */
  data: {
    stepName?: string;
    status?: string;
    error?: any;
    duration?: number;
    attempt?: number;
  };
  
  /**
   * Workflow state snapshot
   */
  state?: UpstashWorkflowState;
}

/**
 * Upstash persistence adapter
 */
export interface UpstashPersistenceAdapter {
  /**
   * Save workflow state
   */
  save(runId: string, state: UpstashWorkflowState): Promise<void>;
  
  /**
   * Load workflow state
   */
  load(runId: string): Promise<UpstashWorkflowState | null>;
  
  /**
   * Delete workflow state
   */
  delete(runId: string): Promise<void>;
  
  /**
   * List workflow states
   */
  list(options?: {
    workflowId?: string;
    status?: UpstashWorkflowState['status'];
    limit?: number;
    cursor?: string;
  }): Promise<{
    states: UpstashWorkflowState[];
    nextCursor?: string;
  }>;
}

/**
 * Upstash metrics
 */
export interface UpstashMetrics {
  /**
   * Total executions
   */
  totalExecutions: number;
  
  /**
   * Successful executions
   */
  successfulExecutions: number;
  
  /**
   * Failed executions
   */
  failedExecutions: number;
  
  /**
   * Average duration
   */
  averageDuration: number;
  
  /**
   * P95 duration
   */
  p95Duration: number;
  
  /**
   * Active executions
   */
  activeExecutions: number;
  
  /**
   * Retry rate
   */
  retryRate: number;
  
  /**
   * Error rate
   */
  errorRate: number;
}

/**
 * Upstash health check result
 */
export interface UpstashHealthCheck {
  /**
   * Overall health status
   */
  status: 'healthy' | 'degraded' | 'unhealthy';
  
  /**
   * Component health
   */
  components: {
    qstash: {
      status: 'healthy' | 'unhealthy';
      latency?: number;
      error?: string;
    };
    redis?: {
      status: 'healthy' | 'unhealthy';
      latency?: number;
      error?: string;
    };
  };
  
  /**
   * Check timestamp
   */
  timestamp: Date;
}

/**
 * Upstash step builder
 */
export interface UpstashStepBuilder<TInput = any, TOutput = any> {
  /**
   * Set step configuration
   */
  withConfig(config: UpstashStepConfig): UpstashStepBuilder<TInput, TOutput>;
  
  /**
   * Add input validation
   */
  withInputSchema(schema: z.ZodSchema<TInput>): UpstashStepBuilder<TInput, TOutput>;
  
  /**
   * Add output validation
   */
  withOutputSchema(schema: z.ZodSchema<TOutput>): UpstashStepBuilder<TInput, TOutput>;
  
  /**
   * Add step middleware
   */
  withMiddleware(
    middleware: (next: (input: TInput) => Promise<TOutput>) => (input: TInput) => Promise<TOutput>
  ): UpstashStepBuilder<TInput, TOutput>;
  
  /**
   * Build the step
   */
  build(): {
    name: string;
    handler: (input: TInput, context: UpstashWorkflowContext) => Promise<TOutput>;
    config?: UpstashStepConfig;
    schema?: {
      input?: z.ZodSchema<TInput>;
      output?: z.ZodSchema<TOutput>;
    };
  };
}

/**
 * Upstash workflow builder
 */
export interface UpstashWorkflowBuilder<TParams = any, TResult = any> {
  /**
   * Add a workflow step
   */
  step<TInput = any, TOutput = any>(
    name: string,
    handler: (input: TInput, context: UpstashWorkflowContext) => Promise<TOutput>,
    config?: UpstashStepConfig
  ): UpstashWorkflowBuilder<TParams, TResult>;
  
  /**
   * Add parallel steps
   */
  parallel<T = any>(
    steps: Array<{
      name: string;
      handler: (input: any, context: UpstashWorkflowContext) => Promise<T>;
      config?: UpstashStepConfig;
    }>
  ): UpstashWorkflowBuilder<TParams, TResult>;
  
  /**
   * Add conditional step
   */
  conditional<TInput = any, TOutput = any>(
    condition: (input: TInput) => boolean,
    ifTrue: {
      name: string;
      handler: (input: TInput, context: UpstashWorkflowContext) => Promise<TOutput>;
    },
    ifFalse?: {
      name: string;
      handler: (input: TInput, context: UpstashWorkflowContext) => Promise<TOutput>;
    }
  ): UpstashWorkflowBuilder<TParams, TResult>;
  
  /**
   * Set workflow configuration
   */
  withConfig(config: UpstashWorkflowConfig): UpstashWorkflowBuilder<TParams, TResult>;
  
  /**
   * Add workflow hooks
   */
  withHooks(hooks: {
    beforeStart?: (context: UpstashWorkflowContext) => Promise<void>;
    afterComplete?: (result: TResult, context: UpstashWorkflowContext) => Promise<void>;
    onError?: (error: Error, context: UpstashWorkflowContext) => Promise<void>;
  }): UpstashWorkflowBuilder<TParams, TResult>;
  
  /**
   * Build the workflow
   */
  build(): {
    id: string;
    name: string;
    steps: any[];
    config?: UpstashWorkflowConfig;
  };
}