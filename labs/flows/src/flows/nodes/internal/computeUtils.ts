import { nanoid } from 'nanoid';

/**
 * Creates a standardized compute error response
 * @param error - The error that occurred
 * @param partialSuccess - Optional partial success data
 */
export const createComputeError = (
  error: unknown,
  partialSuccess?: {
    eventIds?: string[];
    processedData?: Record<string, any>;
  },
): ComputeResult => ({
  success: {
    eventIds: partialSuccess?.eventIds ?? [],
    timestamp: new Date().toISOString(),
    processedData: partialSuccess?.processedData ?? {},
    status: ComputeStatus.ERROR,
    errors: [
      {
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'COMPUTE_ERROR',
      },
    ],
  },
});

/**
 * Creates a standardized compute success response
 * @param data - The success data
 * @param errors - Optional errors for partial success
 */
export const createComputeSuccess = (
  data: {
    eventIds: string[];
    processedData: Record<string, any>;
  },
  errors?: ComputeError[],
): ComputeResult => ({
  success: {
    eventIds: data.eventIds,
    timestamp: new Date().toISOString(),
    processedData: data.processedData,
    status: errors?.length ? ComputeStatus.PARTIAL : ComputeStatus.SUCCESS,
    ...(errors && { errors }),
  },
});

/** Default prefix for generated event IDs */
const DEFAULT_PREFIX = 'evt';

/**
 * Generates a unique event ID with an optional prefix
 *
 * @param {string} prefix - Optional prefix for the event ID
 * @returns {string} A unique event ID
 *
 * @example
 * const eventId = generateEventId('custom'); // Returns: "custom-abc123..."
 * const defaultId = generateEventId(); // Returns: "evt-abc123..."
 */
export function generateEventId(prefix: string = DEFAULT_PREFIX): string {
  return `${prefix}-${nanoid()}`;
}

/**
 * Represents the possible states of a compute operation
 * @enum {string}
 */
export enum ComputeStatus {
  /** Operation completed successfully */
  SUCCESS = 'success',
  /** Operation failed completely */
  ERROR = 'error',
  /** Operation completed with some failures */
  PARTIAL = 'partial',
}

/**
 * Represents an error that occurred during computation
 */
export type ComputeError = {
  /** Human-readable error message */
  message: string;
  /** Optional error code for programmatic handling */
  code?: string;
};

/**
 * Structure representing the result of a compute operation
 */
export type ComputeResult = {
  success: {
    /** Array of generated event IDs */
    eventIds: string[];
    /** ISO timestamp of when the computation completed */
    timestamp: string;
    /** Processed data keyed by event ID */
    processedData: Record<string, any>;
    /** Final status of the computation */
    status: ComputeStatus;
    /** Array of errors if any occurred */
    errors?: ComputeError[];
  };
};

export type ComputeFunctionType = (
  ...args: any[]
) => Promise<Record<string, any>>;
