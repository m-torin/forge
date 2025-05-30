/**
 * Standardized result types for consistent operation outcomes
 * Single source of truth for all result interfaces
 */

/**
 * Base interface for all operation results
 */
export interface BaseOperationResult {
  /** Duration of the operation in milliseconds */
  duration?: number;
  /** Whether the operation succeeded */
  success: boolean;
  /** Timestamp when the operation completed */
  timestamp?: number;
}

/**
 * Standard operation result with data and error
 */
export interface OperationResult<T = unknown> extends BaseOperationResult {
  /** The result data if successful */
  data?: T;
  /** Error message if failed */
  error?: string;
  /** Additional metadata about the operation */
  metadata?: Record<string, unknown>;
}

/**
 * Result for batch operations
 */
export interface BatchOperationResult<T = unknown> extends BaseOperationResult {
  /** Number of failed operations */
  failed: number;
  /** Individual results for each operation */
  results: OperationResult<T>[];
  /** Number of successful operations */
  successful: number;
  /** Summary statistics */
  summary?: {
    successRate: number;
    averageDuration?: number;
    errors?: string[];
  };
  /** Total number of operations */
  total: number;
}

/**
 * Result for paginated operations
 */
export interface PaginatedResult<T> extends BaseOperationResult {
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrevious: boolean;
  /** The items in the current page */
  items: T[];
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Total number of pages */
  totalPages: number;
}

/**
 * Result for streaming operations
 */
export interface StreamResult<T> extends BaseOperationResult {
  /** Continuation token for resuming */
  continuationToken?: string;
  /** Whether this is the final chunk */
  isComplete: boolean;
  /** Items received in this chunk */
  items: T[];
  /** Sequence number of this chunk */
  sequence: number;
}

/**
 * Result for validation operations
 */
export interface ValidationResult extends BaseOperationResult {
  /** Validation errors by field */
  errors: Record<string, string[]>;
  /** Whether validation passed */
  isValid: boolean;
  /** Validation warnings by field */
  warnings?: Record<string, string[]>;
}

/**
 * Result for health check operations
 */
export interface HealthCheckResult extends BaseOperationResult {
  /** Individual component statuses */
  components: Record<
    string,
    {
      status: 'healthy' | 'degraded' | 'unhealthy';
      message?: string;
      duration?: number;
    }
  >;
  /** Additional metrics */
  metrics?: Record<string, number>;
  /** Overall status */
  status: 'healthy' | 'degraded' | 'unhealthy';
}

/**
 * Create a successful operation result
 */
export function successResult<T>(
  data: T,
  options?: {
    duration?: number;
    timestamp?: number;
    metadata?: Record<string, unknown>;
  },
): OperationResult<T> {
  return {
    data,
    duration: options?.duration,
    metadata: options?.metadata,
    success: true,
    timestamp: options?.timestamp || Date.now(),
  };
}

/**
 * Create a failed operation result
 */
export function errorResult(
  error: string | Error,
  options?: {
    duration?: number;
    timestamp?: number;
    metadata?: Record<string, unknown>;
  },
): OperationResult<never> {
  return {
    duration: options?.duration,
    error: error instanceof Error ? error.message : error,
    metadata: options?.metadata,
    success: false,
    timestamp: options?.timestamp || Date.now(),
  };
}

/**
 * Create a batch operation result
 */
export function batchResult<T>(
  results: OperationResult<T>[],
  options?: {
    duration?: number;
    timestamp?: number;
  },
): BatchOperationResult<T> {
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const total = results.length;

  const successRate = total > 0 ? (successful / total) * 100 : 0;
  const durations = results.map((r) => r.duration).filter((d): d is number => d !== undefined);
  const averageDuration =
    durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : undefined;

  const errors = results.filter((r) => !r.success && r.error).map((r) => r.error!);

  return {
    duration: options?.duration,
    failed,
    results,
    success: failed === 0,
    successful,
    summary: {
      averageDuration,
      errors: errors.length > 0 ? errors : undefined,
      successRate,
    },
    timestamp: options?.timestamp || Date.now(),
    total,
  };
}

/**
 * Type guards for result types
 */
export function isSuccessResult<T>(
  result: OperationResult<T>,
): result is OperationResult<T> & { success: true; data: T } {
  return result.success === true && result.data !== undefined;
}

export function isErrorResult(
  result: OperationResult<any>,
): result is OperationResult<never> & { success: false; error: string } {
  return result.success === false && result.error !== undefined;
}

export function isBatchResult<T>(result: any): result is BatchOperationResult<T> {
  return (
    result &&
    typeof result === 'object' &&
    'successful' in result &&
    'failed' in result &&
    'total' in result &&
    'results' in result &&
    Array.isArray(result.results)
  );
}

/**
 * Convert various result formats to standard OperationResult
 */
export function normalizeResult<T>(
  result: any,
  options?: {
    successField?: string;
    dataField?: string;
    errorField?: string;
  },
): OperationResult<T> {
  const { dataField = 'data', errorField = 'error', successField = 'success' } = options || {};

  // Already an OperationResult
  if (isSuccessResult(result) || isErrorResult(result)) {
    return result as OperationResult<T>;
  }

  // Has success field
  if (result && typeof result === 'object' && successField in result) {
    return {
      data: result[dataField] as T | undefined,
      duration: result.duration,
      error: result[errorField],
      success: result[successField],
      timestamp: result.timestamp || Date.now(),
    };
  }

  // Assume successful if we have data
  return successResult(result as T);
}

/**
 * Merge multiple results into a batch result
 */
export function mergeResults<T>(results: OperationResult<T>[]): BatchOperationResult<T> {
  return batchResult(results);
}

/**
 * Map a result to a different type
 */
export function mapResult<T, U>(
  result: OperationResult<T>,
  mapper: (data: T) => U,
): OperationResult<U> {
  if (isSuccessResult(result)) {
    return successResult(mapper(result.data), {
      duration: result.duration,
      metadata: result.metadata,
      timestamp: result.timestamp,
    });
  }

  return result as unknown as OperationResult<U>;
}

/**
 * Chain operations on successful results
 */
export async function chainResult<T, U>(
  result: OperationResult<T>,
  operation: (data: T) => Promise<OperationResult<U>>,
): Promise<OperationResult<U>> {
  if (!isSuccessResult(result)) {
    return result as unknown as OperationResult<U>;
  }

  const startTime = Date.now();
  const nextResult = await operation(result.data);

  return {
    ...nextResult,
    duration: (result.duration || 0) + (Date.now() - startTime),
  };
}
