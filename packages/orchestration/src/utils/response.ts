import { createWorkflowError } from './error-handling';
import { formatTimestamp } from './helpers';

/**
 * Common workflow response types
 */
export interface WorkflowResponse<T = any> {
  data?: T;
  error?: string;
  metadata?: {
    workflowRunId: string;
    duration?: number;
    timestamp: string;
    [key: string]: any;
  };
  status: 'success' | 'skipped' | 'failed';
}

/**
 * Create a standardized workflow response
 */
export function createResponse<T>(
  status: WorkflowResponse['status'],
  data?: T,
  metadata?: Partial<WorkflowResponse['metadata']>,
): WorkflowResponse<T> {
  return {
    status,
    ...(data && { data }),
    metadata: {
      timestamp: formatTimestamp(Date.now()),
      workflowRunId: metadata?.workflowRunId || '',
      ...metadata,
    },
  };
}

/**
 * Workflow error handling utilities using centralized error creation
 */
export const workflowError = {
  /**
   * Create a validation error response
   */
  validation: (message: string, field?: string): WorkflowResponse => {
    const error = createWorkflowError.validation([message]);
    return {
      error: error.message,
      metadata: {
        errorType: 'validation',
        timestamp: formatTimestamp(Date.now()),
        workflowRunId: '',
        ...(field && { field }),
      },
      status: 'failed',
    };
  },

  /**
   * Create a not found error response
   */
  notFound: (resource: string, id?: string): WorkflowResponse => {
    const error = createWorkflowError.notFound(resource);
    return {
      error: error.message,
      metadata: {
        errorType: 'not_found',
        resource,
        timestamp: formatTimestamp(Date.now()),
        workflowRunId: '',
        ...(id && { id }),
      },
      status: 'failed',
    };
  },

  /**
   * Create a generic error response
   */
  generic: (error: unknown): WorkflowResponse => {
    const workflowErr = createWorkflowError.internal(String(error));
    return {
      error: workflowErr.message,
      metadata: {
        errorType: 'generic',
        timestamp: formatTimestamp(Date.now()),
        workflowRunId: '',
      },
      status: 'failed',
    };
  },
};
