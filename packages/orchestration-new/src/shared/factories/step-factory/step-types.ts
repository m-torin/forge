/**
 * Step Factory Type Definitions
 *
 * Core type definitions for the workflow step factory system.
 * Extracted from the monolithic step-factory.ts for better modularity.
 */

import type { z } from 'zod';
import type {
  WorkflowStep as LegacyWorkflowStep,
  WorkflowStepExecution,
  RetryConfig,
  WorkflowError,
} from '../../types/workflow';
import type { CircuitBreakerOptions } from '../../patterns/index';

// ===== SIMPLE FUNCTION-BASED TYPES =====

/**
 * Simple workflow step interface for function-based API
 * Handles 80% of use cases with minimal complexity
 */
export interface SimpleWorkflowStep<TInput = any, TOutput = any> {
  execute(input: TInput): Promise<StepExecutionResult<TOutput>>;
  validate(input: TInput): Promise<ValidationResult>;
}

/**
 * Result from step execution
 */
export interface StepExecutionResult<TOutput = any> {
  success: boolean;
  output?: TOutput;
  error?: WorkflowError;
  performance: StepPerformanceData;
  metadata?: Record<string, any>;
  shouldRetry?: boolean;
}

// Modern ES2022+ type utilities
export type NonEmptyArray<T> = [T, ...T[]];
export type StepId = `step_${string}`;
export type ExecutionId = `exec_${string}`;
export type ProgressState = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

// Template literal type for better type safety
export type ErrorCode =
  `${'STEP' | 'VALIDATION' | 'TIMEOUT' | 'CIRCUIT_BREAKER'}_${'INPUT' | 'OUTPUT' | 'EXECUTION' | 'VALIDATION'}_ERROR`;

/**
 * Configuration for step execution behavior
 */
export interface StepExecutionConfig {
  /** Retry configuration */
  retryConfig?: RetryConfig;
  /** Rate limiting configuration */
  rateLimitConfig?: {
    /** Maximum requests per window */
    maxRequests: number;
    /** Time window in milliseconds */
    windowMs: number;
    /** Identifier for rate limiting scope */
    identifier?: string;
  };
  /** Circuit breaker configuration */
  circuitBreakerConfig?: CircuitBreakerOptions;
  /** Timeout configuration */
  timeout?: {
    /** Execution timeout in milliseconds */
    execution?: number;
    /** Warning threshold in milliseconds */
    warning?: number;
  };
  /** Concurrency configuration */
  concurrency?: {
    /** Maximum concurrent executions */
    max: number;
    /** Queue limit */
    queueLimit?: number;
  };
}

/**
 * Validation configuration for step inputs and outputs
 */
export interface StepValidationConfig<TInput = any, TOutput = any> {
  /** Input validation schema */
  input?: z.ZodSchema<TInput>;
  /** Output validation schema */
  output?: z.ZodSchema<TOutput>;
  /** Whether to validate input */
  validateInput?: boolean;
  /** Whether to validate output */
  validateOutput?: boolean;
  /** Custom validation function */
  customValidation?: (input: TInput) => Promise<ValidationResult> | ValidationResult;
}

/**
 * Result of validation operation
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation error messages */
  errors?: string[];
  /** Additional validation context */
  context?: Record<string, any>;
}

/**
 * Metadata about a workflow step
 */
export interface StepMetadata {
  /** Step name */
  name: string;
  /** Step description */
  description?: string;
  /** Step version */
  version: string;
  /** Step category/tags */
  category?: string;
  /** Step tags for organization */
  tags?: string[];
  /** Author information */
  author?: string;
  /** Creation timestamp */
  createdAt?: Date;
  /** Whether step is deprecated */
  deprecated?: boolean;
  /** Deprecation message */
  deprecationMessage?: string;
}

/**
 * Performance monitoring data for step execution
 */
export interface StepPerformanceData {
  /** Execution start time */
  readonly startTime: number;
  /** Execution end time */
  endTime?: number;
  /** Duration in milliseconds */
  duration?: number;
  /** Memory usage data */
  memoryUsage?: {
    readonly before: NodeJS.MemoryUsage;
    after?: NodeJS.MemoryUsage;
    peak?: number;
  };
  /** CPU usage data */
  cpuUsage?: {
    readonly before: NodeJS.CpuUsage;
    after?: NodeJS.CpuUsage;
  };
  /** Custom metrics */
  customMetrics?: ReadonlyMap<string, number>;
  /** Progress tracking */
  progress?: {
    current: number;
    total: number;
    state: ProgressState;
    details?: string;
  };
}

/**
 * Context passed to step execution function
 */
export interface StepExecutionContext<TInput = any> {
  /** Step execution ID */
  readonly executionId: ExecutionId;
  /** Workflow execution ID */
  readonly workflowExecutionId: string;
  /** Step definition */
  readonly stepDefinition: WorkflowStepDefinition<TInput>;
  /** Current attempt number */
  attempt: number;
  /** Input data */
  readonly input: TInput;
  /** Context from previous steps */
  readonly previousStepsContext: ReadonlyMap<string, any>;
  /** Execution metadata */
  metadata: ReadonlyMap<string, any>;
  /** Performance monitoring */
  performance: StepPerformanceData;
  /** Abort signal for cancellation */
  readonly abortSignal?: AbortSignal;
  /** Progress reporter for async generators */
  reportProgress?: (current: number, total: number, details?: string) => Promise<void>;
}

/**
 * Result of step execution
 */
export interface StepExecutionResult<TOutput = any> {
  /** Execution success status */
  success: boolean;
  /** Output data */
  output?: TOutput;
  /** Error information */
  error?: WorkflowError;
  /** Execution metadata */
  metadata?: Record<string, any>;
  /** Performance data */
  performance: StepPerformanceData;
  /** Whether step should be retried on failure */
  shouldRetry?: boolean;
  /** Context to pass to next steps */
  context?: Record<string, any>;
}

/**
 * Function signature for step execution
 */
export type StepExecutionFunction<TInput = any, TOutput = any> = (
  context: StepExecutionContext<TInput>,
) => Promise<StepExecutionResult<TOutput>>;

/**
 * Complete workflow step definition with all configuration
 */
export interface WorkflowStepDefinition<TInput = any, TOutput = any> {
  /** Unique step identifier */
  id: string;
  /** Step metadata */
  metadata: StepMetadata;
  /** Execution function */
  execute: StepExecutionFunction<TInput, TOutput>;
  /** Execution configuration */
  executionConfig?: StepExecutionConfig;
  /** Validation configuration */
  validationConfig?: StepValidationConfig<TInput, TOutput>;
  /** Dependencies - step IDs that must complete first */
  dependencies?: string[];
  /** Condition function to determine if step should execute */
  condition?: (context: Record<string, any>) => boolean | Promise<boolean>;
  /** Whether step can be skipped on failure */
  optional?: boolean;
  /** Cleanup function called after execution */
  cleanup?: (context: StepExecutionContext<TInput>) => Promise<void> | void;
}

/**
 * Step factory configuration
 */
export interface StepFactoryConfig {
  /** Default execution configuration */
  defaultExecutionConfig?: StepExecutionConfig;
  /** Default validation configuration */
  defaultValidationConfig?: StepValidationConfig;
  /** Whether to enable performance monitoring */
  enablePerformanceMonitoring?: boolean;
  /** Whether to enable detailed logging */
  enableDetailedLogging?: boolean;
  /** Custom error handlers */
  errorHandlers?: Map<string, (error: Error, context: StepExecutionContext) => Promise<void>>;
}
