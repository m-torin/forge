/**
 * Workflow Provider Interface
 * Defines the contract that all workflow providers must implement
 */

import type { z } from 'zod';

/**
 * Context available to workflow steps
 */
export interface WorkflowContext<TParams = any> {
  /**
   * Unique workflow run ID
   */
  runId: string;
  
  /**
   * Environment the workflow is running in
   */
  env: 'development' | 'production' | 'staging';
  
  /**
   * Initial parameters passed to the workflow
   */
  params: TParams;
  
  /**
   * Metadata about the workflow execution
   */
  metadata: {
    attemptNumber: number;
    startedAt: Date;
    triggeredBy?: string;
    source?: string;
  };
}

/**
 * Step execution result
 */
export interface StepResult<T = any> {
  success: boolean;
  data?: T;
  error?: Error;
  duration?: number;
  retryCount?: number;
}

/**
 * Workflow step definition
 */
export interface WorkflowStep<TInput = any, TOutput = any> {
  /**
   * Unique step name
   */
  name: string;
  
  /**
   * Step execution function
   */
  handler: (input: TInput, context: WorkflowContext) => Promise<TOutput>;
  
  /**
   * Optional step configuration
   */
  config?: {
    retries?: number;
    timeout?: number;
    rateLimit?: {
      requests: number;
      window: string;
    };
    dependencies?: string[];
  };
  
  /**
   * Optional validation schema
   */
  schema?: {
    input?: z.ZodSchema<TInput>;
    output?: z.ZodSchema<TOutput>;
  };
}

/**
 * Workflow definition
 */
export interface WorkflowDefinition<TParams = any, TResult = any> {
  /**
   * Unique workflow ID
   */
  id: string;
  
  /**
   * Human-readable workflow name
   */
  name: string;
  
  /**
   * Workflow description
   */
  description?: string;
  
  /**
   * Workflow version
   */
  version?: string;
  
  /**
   * Workflow steps
   */
  steps: WorkflowStep[];
  
  /**
   * Workflow configuration
   */
  config?: {
    maxDuration?: number;
    maxRetries?: number;
    priority?: 'low' | 'normal' | 'high';
    concurrency?: number;
    deduplication?: {
      key?: string;
      window?: string;
    };
  };
  
  /**
   * Input validation schema
   */
  inputSchema?: z.ZodSchema<TParams>;
  
  /**
   * Output validation schema
   */
  outputSchema?: z.ZodSchema<TResult>;
}

/**
 * Workflow execution options
 */
export interface WorkflowExecutionOptions {
  /**
   * Run ID (defaults to auto-generated)
   */
  runId?: string;
  
  /**
   * Execution delay
   */
  delay?: number | string;
  
  /**
   * Scheduling options
   */
  schedule?: {
    cron?: string;
    interval?: string;
    timezone?: string;
  };
  
  /**
   * Callback URLs
   */
  callbacks?: {
    onSuccess?: string;
    onFailure?: string;
    onProgress?: string;
  };
  
  /**
   * Custom metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Workflow execution result
 */
export interface WorkflowExecutionResult<T = any> {
  /**
   * Unique run ID
   */
  runId: string;
  
  /**
   * Workflow ID
   */
  workflowId: string;
  
  /**
   * Execution status
   */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  
  /**
   * Result data (if completed)
   */
  result?: T;
  
  /**
   * Error information (if failed)
   */
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  
  /**
   * Step results
   */
  steps?: Record<string, StepResult>;
  
  /**
   * Execution timing
   */
  timing: {
    startedAt?: Date;
    completedAt?: Date;
    duration?: number;
  };
}

/**
 * Workflow Provider Interface
 * All workflow providers must implement this interface
 */
export interface WorkflowProvider {
  /**
   * Provider name
   */
  name: string;
  
  /**
   * Provider version
   */
  version: string;
  
  /**
   * Initialize the provider
   */
  initialize(config: any): Promise<void>;
  
  /**
   * Check if provider is available
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * Execute a workflow
   */
  run<TParams = any, TResult = any>(
    workflow: WorkflowDefinition<TParams, TResult>,
    params: TParams,
    options?: WorkflowExecutionOptions
  ): Promise<WorkflowExecutionResult<TResult>>;
  
  /**
   * Create a workflow handler for serving
   */
  serve<TParams = any, TResult = any>(
    workflow: WorkflowDefinition<TParams, TResult>
  ): (req: Request) => Promise<Response>;
  
  /**
   * Get workflow execution status
   */
  getStatus(runId: string): Promise<WorkflowExecutionResult>;
  
  /**
   * Cancel a running workflow
   */
  cancel(runId: string): Promise<boolean>;
  
  /**
   * List workflow executions
   */
  list(options?: {
    workflowId?: string;
    status?: WorkflowExecutionResult['status'];
    limit?: number;
    offset?: number;
  }): Promise<WorkflowExecutionResult[]>;
  
  /**
   * Clean up resources
   */
  cleanup(): Promise<void>;
}

/**
 * Workflow builder interface for fluent API
 */
export interface WorkflowBuilder<TParams = any, TResult = any> {
  step<TInput = any, TOutput = any>(
    name: string,
    handler: WorkflowStep<TInput, TOutput>['handler'],
    config?: WorkflowStep<TInput, TOutput>['config']
  ): WorkflowBuilder<TParams, TResult>;
  
  withConfig(config: WorkflowDefinition['config']): WorkflowBuilder<TParams, TResult>;
  
  withInputSchema(schema: z.ZodSchema<TParams>): WorkflowBuilder<TParams, TResult>;
  
  withOutputSchema(schema: z.ZodSchema<TResult>): WorkflowBuilder<TParams, TResult>;
  
  build(): WorkflowDefinition<TParams, TResult>;
}