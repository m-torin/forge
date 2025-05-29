import { devLog, getEnvironmentConfig, isDevelopment } from '../dev/development';

import { getQStashHeaders, isDuplicateId, isDuplicateMessage } from './deduplication';

import type { WorkflowContext } from '@upstash/workflow';

/**
 * Enhanced workflow context with common utilities
 */
export interface EnhancedContext<T = any> extends WorkflowContext<T> {
  /** Deduplication helpers */
  dedup: {
    isDuplicateMessage: () => boolean;
    isDuplicateId: (id: string) => boolean;
  };
  /** Development helpers */
  dev: {
    isDevelopment: boolean;
    log: typeof devLog;
  };
  /** Environment configuration */
  envConfig: ReturnType<typeof getEnvironmentConfig>;
  /** QStash headers */
  qstash: ReturnType<typeof getQStashHeaders>;
}

/**
 * Enhance a workflow context with utilities
 */
export function enhanceContext<T>(context: WorkflowContext<T>): EnhancedContext<T> {
  const enhanced = context as EnhancedContext<T>;

  // Add QStash headers
  enhanced.qstash = getQStashHeaders(context);

  // Add environment config
  enhanced.envConfig = getEnvironmentConfig();

  // Add development helpers
  enhanced.dev = {
    isDevelopment: isDevelopment(),
    log: devLog,
  };

  // Add deduplication helpers
  enhanced.dedup = {
    isDuplicateId: (id: string) => isDuplicateId(id),
    isDuplicateMessage: () => isDuplicateMessage(context),
  };

  return enhanced;
}

/**
 * Workflow wrapper that provides enhanced context
 */
export function withEnhancedContext<T>(
  handler: (context: EnhancedContext<T>) => Promise<any>,
): (context: WorkflowContext<T>) => Promise<any> {
  return async (context: WorkflowContext<T>) => {
    const enhanced = enhanceContext(context);
    return handler(enhanced);
  };
}

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
      timestamp: new Date().toISOString(),
      workflowRunId: metadata?.workflowRunId || '',
      ...metadata,
    },
  };
}

/**
 * Workflow error handling utilities
 */
export const workflowError = {
  /**
   * Create a validation error response
   */
  validation: (message: string, field?: string): WorkflowResponse => ({
    error: message,
    metadata: {
      errorType: 'validation',
      timestamp: new Date().toISOString(),
      workflowRunId: '',
      ...(field && { field }),
    },
    status: 'failed',
  }),

  /**
   * Create a not found error response
   */
  notFound: (resource: string, id?: string): WorkflowResponse => ({
    error: `${resource} not found`,
    metadata: {
      errorType: 'not_found',
      resource,
      timestamp: new Date().toISOString(),
      workflowRunId: '',
      ...(id && { id }),
    },
    status: 'failed',
  }),

  /**
   * Create a generic error response
   */
  generic: (error: unknown): WorkflowResponse => ({
    error: error instanceof Error ? error.message : 'Unknown error',
    metadata: {
      errorType: 'generic',
      timestamp: new Date().toISOString(),
      workflowRunId: '',
    },
    status: 'failed',
  }),
};

/**
 * Validate required fields in payload
 */
export function validatePayload<T extends Record<string, any>>(
  payload: T | undefined,
  requiredFields: (keyof T)[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!payload) {
    errors.push('Missing request payload');
    return { valid: false, errors };
  }

  for (const field of requiredFields) {
    if (!payload[field]) {
      errors.push(`Missing required field: ${String(field)}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Safe payload extraction with defaults
 */
export function extractPayload<T extends Record<string, any>>(
  context: WorkflowContext<T>,
  defaults: Partial<T>,
): T {
  return {
    ...defaults,
    ...context.requestPayload,
  } as T;
}
