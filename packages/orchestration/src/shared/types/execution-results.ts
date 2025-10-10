/**
 * Enhanced Type Safety with Discriminated Unions for Execution Results
 *
 * Provides comprehensive type safety using discriminated unions (Node 22+ TypeScript 5.8+):
 * - Exhaustive type checking with pattern matching
 * - Immutable result structures with readonly modifiers
 * - Branded types for strong typing
 * - Result type narrowing with type guards
 * - Zero-runtime-cost compile-time safety
 */

import { WorkflowExecutionError } from '../utils/errors';

/**
 * Branded type for unique identification
 */
type Brand<K, T> = K & { readonly __brand: T };

/**
 * Execution ID with branded typing for compile-time safety
 */
export type ExecutionId = Brand<string, 'ExecutionId'>;

/**
 * Step ID with branded typing
 */
export type StepId = Brand<string, 'StepId'>;

/**
 * Workflow ID with branded typing
 */
export type WorkflowId = Brand<string, 'WorkflowId'>;

/**
 * Create branded execution ID
 */
export function createExecutionId(id: string): ExecutionId {
  return id as ExecutionId;
}

/**
 * Create branded step ID
 */
export function createStepId(id: string): StepId {
  return id as StepId;
}

/**
 * Create branded workflow ID
 */
export function createWorkflowId(id: string): WorkflowId {
  return id as WorkflowId;
}

/**
 * Immutable performance metrics
 */
export interface PerformanceMetrics {
  readonly startTime: Date;
  readonly endTime: Date;
  readonly duration: number;
  readonly memoryUsed: number;
  readonly cpuTime?: number;
  readonly waitTime?: number;
}

/**
 * Immutable execution context
 */
export interface ExecutionContext {
  readonly executionId: ExecutionId;
  readonly stepId: StepId;
  readonly workflowId: WorkflowId;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly requestId?: string;
  readonly parentExecutionId?: ExecutionId;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly timestamp: Date;
}

/**
 * Base execution result with common properties
 */
interface BaseExecutionResult {
  readonly executionId: ExecutionId;
  readonly stepId: StepId;
  readonly context: ExecutionContext;
  readonly performance: PerformanceMetrics;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly timestamp: Date;
}

/**
 * Successful execution result
 */
export interface SuccessExecutionResult<TOutput = unknown> extends BaseExecutionResult {
  readonly status: 'success';
  readonly success: true;
  readonly output: TOutput;
  readonly warnings?: ReadonlyArray<{
    readonly code: string;
    readonly message: string;
    readonly details?: Readonly<Record<string, unknown>>;
  }>;
}

/**
 * Failed execution result
 */
export interface FailureExecutionResult extends BaseExecutionResult {
  readonly status: 'failure';
  readonly success: false;
  readonly error: WorkflowExecutionError;
  readonly shouldRetry: boolean;
  readonly retryCount: number;
  readonly partialOutput?: unknown;
  readonly failureReason: 'validation' | 'execution' | 'timeout' | 'system' | 'user';
}

/**
 * Skipped execution result (conditional logic)
 */
export interface SkippedExecutionResult extends BaseExecutionResult {
  readonly status: 'skipped';
  readonly success: true;
  readonly skipReason: 'condition' | 'user' | 'dependency' | 'system';
  readonly skipDetails?: Readonly<Record<string, unknown>>;
}

/**
 * Cancelled execution result (user or system initiated)
 */
export interface CancelledExecutionResult extends BaseExecutionResult {
  readonly status: 'cancelled';
  readonly success: false;
  readonly cancelReason: 'user' | 'timeout' | 'system' | 'dependency';
  readonly cancelledAt: Date;
  readonly cancelledBy?: string;
}

/**
 * Pending execution result (async operations)
 */
export interface PendingExecutionResult extends BaseExecutionResult {
  readonly status: 'pending';
  readonly success: false;
  readonly estimatedCompletion?: Date;
  readonly progressPercentage?: number;
  readonly pendingReason: 'async' | 'queue' | 'dependency' | 'resource';
}

/**
 * Discriminated union for all possible execution results
 * This provides exhaustive type checking and compile-time safety
 */
export type ExecutionResult<TOutput = unknown> =
  | SuccessExecutionResult<TOutput>
  | FailureExecutionResult
  | SkippedExecutionResult
  | CancelledExecutionResult
  | PendingExecutionResult;

/**
 * Type guard functions for result type narrowing
 */
export namespace ExecutionResultGuards {
  /**
   * Type guard for success results
   */
  export function isSuccess<T>(result: ExecutionResult<T>): result is SuccessExecutionResult<T> {
    return result.status === 'success';
  }

  /**
   * Type guard for failure results
   */
  export function isFailure<T>(result: ExecutionResult<T>): result is FailureExecutionResult {
    return result.status === 'failure';
  }

  /**
   * Type guard for skipped results
   */
  export function isSkipped<T>(result: ExecutionResult<T>): result is SkippedExecutionResult {
    return result.status === 'skipped';
  }

  /**
   * Type guard for cancelled results
   */
  export function isCancelled<T>(result: ExecutionResult<T>): result is CancelledExecutionResult {
    return result.status === 'cancelled';
  }

  /**
   * Type guard for pending results
   */
  export function isPending<T>(result: ExecutionResult<T>): result is PendingExecutionResult {
    return result.status === 'pending';
  }

  /**
   * Type guard for completed results (success, failure, skipped, cancelled)
   */
  export function isCompleted<T>(
    result: ExecutionResult<T>,
  ): result is Exclude<ExecutionResult<T>, PendingExecutionResult> {
    return result.status !== 'pending';
  }

  /**
   * Type guard for terminal results (success, skipped)
   */
  export function isTerminal<T>(
    result: ExecutionResult<T>,
  ): result is SuccessExecutionResult<T> | SkippedExecutionResult {
    return result.status === 'success' || result.status === 'skipped';
  }

  /**
   * Type guard for error results (failure, cancelled)
   */
  export function isError<T>(
    result: ExecutionResult<T>,
  ): result is FailureExecutionResult | CancelledExecutionResult {
    return result.status === 'failure' || result.status === 'cancelled';
  }
}

/**
 * Workflow execution result aggregating multiple step results
 */
export interface WorkflowExecutionResult<TOutput = unknown> {
  readonly workflowId: WorkflowId;
  readonly executionId: ExecutionId;
  readonly status: 'success' | 'partial_success' | 'failure' | 'cancelled' | 'pending';
  readonly success: boolean;
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly duration?: number;
  readonly output?: TOutput;
  readonly stepResults: ReadonlyArray<ExecutionResult>;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly performance: {
    readonly totalSteps: number;
    readonly successfulSteps: number;
    readonly failedSteps: number;
    readonly skippedSteps: number;
    readonly cancelledSteps: number;
    readonly totalDuration: number;
    readonly averageStepDuration: number;
    readonly memoryPeak: number;
  };
  readonly errors: ReadonlyArray<WorkflowExecutionError>;
  readonly warnings: ReadonlyArray<{
    readonly stepId: StepId;
    readonly code: string;
    readonly message: string;
  }>;
}

/**
 * Result builder for type-safe result construction
 */
export class ExecutionResultBuilder<TOutput = unknown> {
  private baseResult: Omit<BaseExecutionResult, 'status' | 'success'>;

  constructor(
    executionId: ExecutionId,
    stepId: StepId,
    context: ExecutionContext,
    performance: PerformanceMetrics,
    metadata: Readonly<Record<string, unknown>> = {},
  ) {
    this.baseResult = {
      executionId,
      stepId,
      context,
      performance,
      metadata,
      timestamp: new Date(),
    };
  }

  /**
   * Build a success result with proper type safety
   */
  success(
    output: TOutput,
    warnings?: ReadonlyArray<{
      readonly code: string;
      readonly message: string;
      readonly details?: Readonly<Record<string, unknown>>;
    }>,
  ): SuccessExecutionResult<TOutput> {
    return {
      ...this.baseResult,
      status: 'success',
      success: true,
      output,
      warnings,
    };
  }

  /**
   * Build a failure result with comprehensive error information
   */
  failure(
    error: WorkflowExecutionError,
    shouldRetry: boolean = false,
    retryCount: number = 0,
    failureReason: FailureExecutionResult['failureReason'] = 'execution',
    partialOutput?: unknown,
  ): FailureExecutionResult {
    return {
      ...this.baseResult,
      status: 'failure',
      success: false,
      error,
      shouldRetry,
      retryCount,
      partialOutput,
      failureReason,
    };
  }

  /**
   * Build a skipped result
   */
  skipped(
    skipReason: SkippedExecutionResult['skipReason'],
    skipDetails?: Readonly<Record<string, unknown>>,
  ): SkippedExecutionResult {
    return {
      ...this.baseResult,
      status: 'skipped',
      success: true,
      skipReason,
      skipDetails,
    };
  }

  /**
   * Build a cancelled result
   */
  cancelled(
    cancelReason: CancelledExecutionResult['cancelReason'],
    cancelledBy?: string,
  ): CancelledExecutionResult {
    return {
      ...this.baseResult,
      status: 'cancelled',
      success: false,
      cancelReason,
      cancelledAt: new Date(),
      cancelledBy,
    };
  }

  /**
   * Build a pending result
   */
  pending(
    pendingReason: PendingExecutionResult['pendingReason'],
    estimatedCompletion?: Date,
    progressPercentage?: number,
  ): PendingExecutionResult {
    return {
      ...this.baseResult,
      status: 'pending',
      success: false,
      estimatedCompletion,
      progressPercentage,
      pendingReason,
    };
  }
}

/**
 * Pattern matching utilities for exhaustive handling of execution results
 */
export namespace ExecutionResultMatchers {
  /**
   * Pattern match on execution results with exhaustive checking
   */
  export function match<TOutput, TReturn>(
    result: ExecutionResult<TOutput>,
    handlers: {
      success: (result: SuccessExecutionResult<TOutput>) => TReturn;
      failure: (result: FailureExecutionResult) => TReturn;
      skipped: (result: SkippedExecutionResult) => TReturn;
      cancelled: (result: CancelledExecutionResult) => TReturn;
      pending: (result: PendingExecutionResult) => TReturn;
    },
  ): TReturn {
    switch (result.status) {
      case 'success':
        return handlers.success(result);
      case 'failure':
        return handlers.failure(result);
      case 'skipped':
        return handlers.skipped(result);
      case 'cancelled':
        return handlers.cancelled(result);
      case 'pending':
        return handlers.pending(result);
      default:
        // This should never happen with proper discriminated unions
        const exhaustiveCheck = result;
        throw new Error(`Unhandled result status: ${(exhaustiveCheck as any).status}`);
    }
  }

  /**
   * Simplified pattern matching for common cases
   */
  export function matchSimple<TOutput, TReturn>(
    result: ExecutionResult<TOutput>,
    handlers: {
      success: (output: TOutput) => TReturn;
      error: (error: WorkflowExecutionError) => TReturn;
      other?: () => TReturn;
    },
  ): TReturn {
    if (ExecutionResultGuards.isSuccess(result)) {
      return handlers.success(result.output);
    }

    if (ExecutionResultGuards.isFailure(result)) {
      return handlers.error(result.error);
    }

    if (ExecutionResultGuards.isCancelled(result)) {
      const error = new WorkflowExecutionError(
        `Execution cancelled: ${result.cancelReason}`,
        result.context.workflowId,
        'EXECUTION_CANCELLED',
        false,
        { cancelReason: result.cancelReason, cancelledBy: result.cancelledBy },
      );
      return handlers.error(error);
    }

    if (handlers.other) {
      return handlers.other();
    }

    throw new Error(`Unhandled execution result status: ${result.status}`);
  }

  /**
   * Async pattern matching for results
   */
  export async function matchAsync<TOutput, TReturn>(
    result: ExecutionResult<TOutput>,
    handlers: {
      success: (result: SuccessExecutionResult<TOutput>) => Promise<TReturn>;
      failure: (result: FailureExecutionResult) => Promise<TReturn>;
      skipped: (result: SkippedExecutionResult) => Promise<TReturn>;
      cancelled: (result: CancelledExecutionResult) => Promise<TReturn>;
      pending: (result: PendingExecutionResult) => Promise<TReturn>;
    },
  ): Promise<TReturn> {
    switch (result.status) {
      case 'success':
        return await handlers.success(result);
      case 'failure':
        return await handlers.failure(result);
      case 'skipped':
        return await handlers.skipped(result);
      case 'cancelled':
        return await handlers.cancelled(result);
      case 'pending':
        return await handlers.pending(result);
      default:
        const exhaustiveCheck = result;
        throw new Error(`Unhandled result status: ${(exhaustiveCheck as any).status}`);
    }
  }
}

/**
 * Utility functions for working with execution results
 */
export namespace ExecutionResultUtils {
  /**
   * Extract output from result with type safety
   */
  export function extractOutput<T>(result: ExecutionResult<T>): T | undefined {
    if (ExecutionResultGuards.isSuccess(result)) {
      return result.output;
    }
    if (ExecutionResultGuards.isFailure(result) && result.partialOutput !== undefined) {
      return result.partialOutput as T;
    }
    return undefined;
  }

  /**
   * Get error from result with type safety
   */
  export function extractError<T>(result: ExecutionResult<T>): WorkflowExecutionError | undefined {
    if (ExecutionResultGuards.isFailure(result)) {
      return result.error;
    }
    if (ExecutionResultGuards.isCancelled(result)) {
      return new WorkflowExecutionError(
        `Execution cancelled: ${result.cancelReason}`,
        result.context.workflowId,
        'EXECUTION_CANCELLED',
        false,
        { cancelReason: result.cancelReason },
      );
    }
    return undefined;
  }

  /**
   * Check if result can be retried
   */
  export function canRetry<T>(result: ExecutionResult<T>): boolean {
    return ExecutionResultGuards.isFailure(result) && result.shouldRetry;
  }

  /**
   * Get human-readable status message
   */
  export function getStatusMessage<T>(result: ExecutionResult<T>): string {
    return ExecutionResultMatchers.match(result, {
      success: r =>
        `Completed successfully${r.warnings?.length ? ` with ${r.warnings.length} warning(s)` : ''}`,
      failure: r => `Failed: ${r.error.message} (${r.failureReason})`,
      skipped: r => `Skipped: ${r.skipReason}`,
      cancelled: r => `Cancelled: ${r.cancelReason}${r.cancelledBy ? ` by ${r.cancelledBy}` : ''}`,
      pending: r =>
        `Pending: ${r.pendingReason}${r.progressPercentage ? ` (${r.progressPercentage}%)` : ''}`,
    });
  }

  /**
   * Convert legacy StepExecutionResult to new ExecutionResult
   */
  export function fromLegacyResult<T>(
    legacyResult: {
      success: boolean;
      output?: T;
      error?: WorkflowExecutionError;
      skipped?: boolean;
      shouldRetry?: boolean;
      context?: Record<string, any>;
      metadata?: Record<string, any>;
      performance: any;
    },
    executionId: ExecutionId,
    stepId: StepId,
    context: ExecutionContext,
  ): ExecutionResult<T> {
    const builder = new ExecutionResultBuilder<T>(
      executionId,
      stepId,
      context,
      legacyResult.performance,
      legacyResult.metadata || {},
    );

    if (legacyResult.skipped) {
      return builder.skipped('condition');
    }

    if (legacyResult.success && legacyResult.output !== undefined) {
      return builder.success(legacyResult.output);
    }

    if (!legacyResult.success && legacyResult.error) {
      return builder.failure(legacyResult.error, legacyResult.shouldRetry || false, 0, 'execution');
    }

    // Fallback for incomplete legacy results
    return builder.failure(
      new WorkflowExecutionError('Unknown execution state', context.workflowId, 'UNKNOWN_STATE'),
      false,
      0,
      'system',
    );
  }
}

/**
 * Export legacy compatible types for backward compatibility
 */ /**
 * Create execution result builder
 */
export function createExecutionResultBuilder<T>(
  executionId: ExecutionId,
  stepId: StepId,
  context: ExecutionContext,
  performance: PerformanceMetrics,
  metadata?: Readonly<Record<string, unknown>>,
): ExecutionResultBuilder<T> {
  return new ExecutionResultBuilder<T>(executionId, stepId, context, performance, metadata);
}
