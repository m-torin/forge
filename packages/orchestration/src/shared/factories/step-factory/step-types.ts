/**
 * Step Factory Type Definitions
 *
 * Core type definitions for the workflow step factory system.
 * Extracted from the monolithic step-factory.ts for better modularity.
 */

import { z } from 'zod/v4';

import { CircuitBreakerOptions } from '../../patterns/index';
import { RetryConfig, WorkflowError } from '../../types/workflow';

// ===== SIMPLE FUNCTION-BASED TYPES =====

// Template literal type for better type safety
export type ErrorCode =
  `${'CIRCUIT_BREAKER' | 'STEP' | 'TIMEOUT' | 'VALIDATION'}_${'EXECUTION' | 'INPUT' | 'OUTPUT' | 'VALIDATION'}_ERROR`;

export type ExecutionId = `exec_${string}`;

// Modern ES2022+ type utilities
type NonEmptyArray<T> = [T, ...T[]];
export type ProgressState = 'cancelled' | 'completed' | 'failed' | 'in_progress' | 'pending';
/**
 * Simple workflow step interface for function-based API
 * Handles 80% of use cases with minimal complexity
 */
export interface SimpleWorkflowStep<TInput = any, TOutput = any> {
  execute(input: TInput): Promise<StepExecutionResult<TOutput>>;
  validate(input: TInput): Promise<ValidationResult>;
}
/**
 * Configuration for step execution behavior
 */
export interface StepExecutionConfig {
  /** Circuit breaker configuration */
  circuitBreakerConfig?: CircuitBreakerOptions;
  /** Concurrency configuration */
  concurrency?: {
    /** Maximum concurrent executions */
    max: number;
    /** Queue limit */
    queueLimit?: number;
  };
  /** Rate limiting configuration */
  rateLimitConfig?: {
    /** Identifier for rate limiting scope */
    identifier?: string;
    /** Maximum requests per window */
    maxRequests: number;
    /** Time window in milliseconds */
    windowMs: number;
  };
  /** Retry configuration */
  retryConfig?: RetryConfig;
  /** Timeout configuration */
  timeout?: {
    /** Execution timeout in milliseconds */
    execution?: number;
    /** Warning threshold in milliseconds */
    warning?: number;
  };
}

/**
 * Context passed to step execution function
 */
export interface StepExecutionContext<TInput = any> {
  /** Abort signal for cancellation */
  readonly abortSignal?: AbortSignal;
  /** Current attempt number */
  attempt: number;
  /** Step execution ID */
  readonly executionId: ExecutionId;
  /** Input data */
  readonly input: TInput;
  /** Execution metadata */
  metadata: ReadonlyMap<string, any>;
  /** Performance monitoring */
  performance: StepPerformanceData;
  /** Context from previous steps */
  readonly previousStepsContext: ReadonlyMap<string, any>;
  /** Progress reporter for async generators */
  reportProgress?: (current: number, total: number, details?: string) => Promise<void>;
  /** Step definition */
  readonly stepDefinition: WorkflowStepDefinition<TInput>;
  /** Workflow execution ID */
  readonly workflowExecutionId: string;
}

/**
 * Function signature for step execution
 */
export type StepExecutionFunction<TInput = any, TOutput = any> = (
  context: StepExecutionContext<TInput>,
) => Promise<StepExecutionResult<TOutput>>;

/**
 * Result of step execution
 */
export interface StepExecutionResult<TOutput = any> {
  /** Context to pass to next steps */
  context?: Record<string, any>;
  /** Error information */
  error?: WorkflowError;
  /** Execution metadata */
  metadata?: Record<string, any>;
  /** Output data */
  output?: TOutput;
  /** Performance data */
  performance: StepPerformanceData;
  /** Whether step should be retried on failure */
  shouldRetry?: boolean;
  /** Whether step was skipped */
  skipped?: boolean;
  /** Execution success status */
  success: boolean;
}

/**
 * Step factory configuration
 */
export interface StepFactoryConfig {
  /** Default execution configuration */
  defaultExecutionConfig?: StepExecutionConfig;
  /** Default validation configuration */
  defaultValidationConfig?: StepValidationConfig;
  /** Whether to enable detailed logging */
  enableDetailedLogging?: boolean;
  /** Whether to enable performance monitoring */
  enablePerformanceMonitoring?: boolean;
  /** Custom error handlers */
  errorHandlers?: Map<string, (error: Error, context: StepExecutionContext) => Promise<void>>;
  /** Callback for step completion */
  onStepComplete?: (stepName: string, duration: number, success: boolean) => void;
}

export type StepId = `step_${string}`;

/**
 * Metadata about a workflow step
 */
export interface StepMetadata {
  /** Author information */
  author?: string;
  /** Step category/tags */
  category?: string;
  /** Creation timestamp */
  createdAt?: Date;
  /** Whether step is deprecated */
  deprecated?: boolean;
  /** Deprecation message */
  deprecationMessage?: string;
  /** Step description */
  description?: string;
  /** Step name */
  name: string;
  /** Step tags for organization */
  tags?: string[];
  /** Step version */
  version: string;
}

/**
 * Performance monitoring data for step execution
 */
export interface StepPerformanceData {
  /** CPU usage data */
  cpuUsage?: {
    after?: NodeJS.CpuUsage;
    readonly before: NodeJS.CpuUsage;
  };
  /** Custom metrics */
  customMetrics?: ReadonlyMap<string, number>;
  /** Duration in milliseconds */
  duration?: number;
  /** Execution end time */
  endTime?: number;
  /** Memory usage data */
  memoryUsage?: {
    after?: NodeJS.MemoryUsage;
    readonly before: NodeJS.MemoryUsage;
    peak?: number;
  };
  /** Progress tracking */
  progress?: {
    current: number;
    details?: string;
    state: ProgressState;
    total: number;
  };
  /** Execution start time */
  readonly startTime: number;
}

/**
 * Validation configuration for step inputs and outputs
 */
export interface StepValidationConfig<TInput = any, TOutput = any> {
  /** Custom validation function */
  customValidation?: (input: TInput) => Promise<ValidationResult> | ValidationResult;
  /** Input validation schema */
  input?: z.ZodSchema<TInput>;
  /** Output validation schema */
  output?: z.ZodSchema<TOutput>;
  /** Whether to validate input */
  validateInput?: boolean;
  /** Whether to validate output */
  validateOutput?: boolean;
}

/**
 * Result of validation operation
 */
export interface ValidationResult {
  /** Additional validation context */
  context?: Record<string, any>;
  /** Validation error messages */
  errors?: string[];
  /** Whether validation passed */
  valid: boolean;
}

/**
 * Complete workflow step definition with all configuration
 */
export interface WorkflowStepDefinition<TInput = any, TOutput = any> {
  /** Cleanup function called after execution */
  cleanup?: (context?: StepExecutionContext<TInput>) => Promise<void> | void;
  /** Condition function to determine if step should execute */
  condition?: (context: Record<string, any>) => boolean | Promise<boolean>;
  /** Dependencies - step IDs that must complete first */
  dependencies?: string[];
  /** Execution function */
  execute: StepExecutionFunction<TInput, TOutput>;
  /** Execution configuration */
  executionConfig?: StepExecutionConfig;
  /** Unique step identifier */
  id: string;
  /** Step metadata */
  metadata: StepMetadata;
  /** Whether step can be skipped on failure */
  optional?: boolean;
  /** Validation configuration */
  validationConfig?: StepValidationConfig<TInput, TOutput>;
}
