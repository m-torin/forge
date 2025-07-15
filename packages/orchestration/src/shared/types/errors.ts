/**
 * Common error types to break circular dependencies
 */

export interface WorkflowError {
  /** Error code */
  code?: string;
  /** Additional context data */
  context?: Record<string, unknown>;
  /** Original error details */
  details?: unknown;
  /** Human-readable message */
  message: string;
  /** Whether this error is retryable */
  retryable?: boolean;
  /** Source of the error (step ID, provider, etc.) */
  source?: string;
  /** Stack trace */
  stack?: string;
  /** Step ID where error occurred */
  stepId?: string;
  /** When the error occurred */
  timestamp?: Date;
}
