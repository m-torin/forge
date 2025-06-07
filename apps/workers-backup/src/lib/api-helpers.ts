import { NextResponse } from 'next/server';

import {
  classifyWorkflowError,
  createWorkflowError,
  withApiErrorHandling,
  WorkflowError,
  WorkflowErrorType,
} from '@repo/orchestration';
// Import the enhanced logger from orchestration observability
import { devLog as logger } from '@repo/orchestration';

/**
 * API helper utilities with integrated observability and enhanced error handling
 */

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    data,
    success: true,
    ...(message && { message }),
  });
}

/**
 * Create an error API response with enhanced error classification
 */
export function createErrorResponse(
  error: string | Error | WorkflowError,
  status?: number,
): NextResponse<ApiResponse> {
  if (error instanceof WorkflowError) {
    return NextResponse.json(
      {
        error: error.message,
        errorType: error.type,
        success: false,
        ...(error.context && { context: error.context }),
      },
      { status: status || getHttpStatusFromWorkflowError(error) },
    );
  }

  const errorMessage = error instanceof Error ? error.message : error;
  const classifiedError = classifyWorkflowError(error);

  return NextResponse.json(
    {
      error: errorMessage,
      errorType: classifiedError,
      success: false,
    },
    { status: status || getHttpStatusFromWorkflowErrorType(classifiedError) },
  );
}

/**
 * Map WorkflowError to appropriate HTTP status code
 */
function getHttpStatusFromWorkflowError(error: WorkflowError): number {
  return getHttpStatusFromWorkflowErrorType(error.type);
}

/**
 * Map WorkflowErrorType to appropriate HTTP status code
 */
function getHttpStatusFromWorkflowErrorType(errorType: WorkflowErrorType): number {
  switch (errorType) {
    case WorkflowErrorType.VALIDATION:
      return 400;
    case WorkflowErrorType.AUTHENTICATION:
      return 401;
    case WorkflowErrorType.PERMISSION:
      return 403;
    case WorkflowErrorType.NOT_FOUND:
      return 404;
    case WorkflowErrorType.CONFLICT:
      return 409;
    case WorkflowErrorType.RATE_LIMIT:
      return 429;
    case WorkflowErrorType.TIMEOUT:
      return 408;
    case WorkflowErrorType.EXTERNAL_API:
    case WorkflowErrorType.UNAVAILABLE:
      return 503;
    default:
      return 500;
  }
}

/**
 * Create a validation error response
 */
export function createValidationError(message: string): NextResponse<ApiResponse> {
  return createErrorResponse(message, 400);
}

/**
 * Enhanced async error handler wrapper for API routes with observability
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  operationName = 'API Operation',
): (...args: T) => Promise<R | NextResponse<ApiResponse>> {
  return async (...args: T) => {
    try {
      return await withApiErrorHandling(() => handler(...args), operationName, {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(`${operationName} failed:`, error);
      return createErrorResponse(error instanceof Error ? error : new Error(String(error)));
    }
  };
}

/**
 * Enhanced error handler specifically for workflow operations
 */
export function withWorkflowErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  workflowName: string,
): (...args: T) => Promise<R | NextResponse<ApiResponse>> {
  return async (...args: T) => {
    try {
      return await handler(...args);
    } catch (error) {
      logger.error(`Workflow ${workflowName} failed:`, error);

      if (error instanceof WorkflowError) {
        return createErrorResponse(error);
      }

      // Create workflow-specific error
      const workflowError = createWorkflowError.internal(
        `Workflow ${workflowName} execution failed`,
        {
          originalError: String(error),
          timestamp: new Date().toISOString(),
          workflowName,
        },
      );

      return createErrorResponse(workflowError);
    }
  };
}

/**
 * Parse JSON body with error handling
 */
export async function parseRequestBody<T = any>(request: Request): Promise<T | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/**
 * Validate required fields in request body
 */
export function validateRequired(
  body: any,
  fields: string[],
): { valid: boolean; missing: string[] } {
  const missing = fields.filter(
    (field) => body?.[field] === undefined || body?.[field] === null || body?.[field] === '',
  );

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Extract URL parameter and validate it's present
 */
export function getRequiredParam(
  params: Record<string, string | string[]>,
  paramName: string,
): string | null {
  const value = params[paramName];
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return null;
}

/**
 * Create standard workflow response
 */
export function createWorkflowResponse(data: {
  workflowRunId?: string;
  status?: string;
  [key: string]: any;
}): NextResponse<ApiResponse> {
  return createSuccessResponse(data);
}

/**
 * Handle common request method validation
 */
export function validateMethod(
  request: Request,
  allowedMethods: string[],
): NextResponse<ApiResponse> | null {
  if (!allowedMethods.includes(request.method)) {
    return NextResponse.json(
      { error: `Method ${request.method} not allowed`, success: false },
      { status: 405 },
    );
  }
  return null;
}
