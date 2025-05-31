import { NextResponse } from 'next/server';

/**
 * API helper utilities for consistent error handling and response formatting
 */

/**
 * Enhanced logger that JSON stringifies data over 50 characters
 */
export const logger = {
  formatData: (data: any): string => {
    if (!data) return '';
    
    let formatted: string;
    
    if (typeof data === 'string') {
      // If string is over 50 characters, try to parse as JSON first for better formatting
      if (data.length > 50) {
        try {
          const parsed = JSON.parse(data);
          formatted = JSON.stringify(parsed, null, 2);
        } catch {
          formatted = data;
        }
      } else {
        formatted = data;
      }
    } else if (typeof data === 'object') {
      // Always stringify objects with formatting
      formatted = JSON.stringify(data, null, 2);
    } else {
      // Convert other types to string
      formatted = String(data);
      // If over 50 characters, try to format as JSON
      if (formatted.length > 50) {
        try {
          const parsed = JSON.parse(formatted);
          formatted = JSON.stringify(parsed, null, 2);
        } catch {
          // Keep as is if not JSON
        }
      }
    }
    
    return formatted;
  },

  log: (message: string, data?: any) => {
    if (data) {
      console.log(`${message}\n${logger.formatData(data)}`);
    } else {
      console.log(message);
    }
  },

  warn: (message: string, data?: any) => {
    if (data) {
      console.warn(`${message}\n${logger.formatData(data)}`);
    } else {
      console.warn(message);
    }
  },

  error: (message: string, data?: any) => {
    if (data) {
      console.error(`${message}\n${logger.formatData(data)}`);
    } else {
      console.error(message);
    }
  },
};

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
 * Create an error API response
 */
export function createErrorResponse(
  error: string | Error,
  status = 500,
): NextResponse<ApiResponse> {
  const errorMessage = error instanceof Error ? error.message : error;
  return NextResponse.json(
    {
      error: errorMessage,
      success: false,
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
      logger.error('API Route Error:', error);
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
