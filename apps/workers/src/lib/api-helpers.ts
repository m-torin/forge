import { NextResponse } from 'next/server';

/**
 * API helper utilities for consistent error handling and response formatting
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    ...(message && { message }),
  });
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  error: string | Error,
  status = 500,
): NextResponse<ApiResponse> {
  const errorMessage = error instanceof Error ? error.message : error;
  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
    },
    { status },
  );
}

/**
 * Create a validation error response
 */
export function createValidationError(message: string): NextResponse<ApiResponse> {
  return createErrorResponse(message, 400);
}

/**
 * Async error handler wrapper for API routes
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
): (...args: T) => Promise<R | NextResponse<ApiResponse>> {
  return async (...args: T) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API Route Error:', error);
      return createErrorResponse(error instanceof Error ? error.message : 'Internal server error');
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
  const missing = fields.filter(field => 
    body?.[field] === undefined || body?.[field] === null || body?.[field] === ''
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
      { success: false, error: `Method ${request.method} not allowed` },
      { status: 405 },
    );
  }
  return null;
}