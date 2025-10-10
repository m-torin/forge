/**
 * Secure Error Handler
 * Sanitizes error messages to prevent information leakage while maintaining debugging capabilities
 */

import { logError as baseLogError, logWarn as baseLogWarn } from '@repo/observability';
import 'server-only';

export interface SecureErrorOptions {
  /** Include detailed errors in development */
  includeStackTrace?: boolean;
  /** Include error codes */
  includeErrorCodes?: boolean;
  /** Custom error messages for specific error types */
  customMessages?: Record<string, string>;
  /** Additional context to log (but not expose) */
  context?: Record<string, unknown>;
}

export interface SecureErrorResult {
  /** Sanitized error message safe for client */
  message: string;
  /** Error code if available */
  code?: string;
  /** HTTP status code */
  status: number;
  /** Whether this is a user-facing error */
  isUserError: boolean;
  /** Request ID for tracking */
  requestId?: string;
}

/**
 * Mapping of internal error patterns to user-friendly messages
 */
const ERROR_MESSAGE_MAP: Record<string, { message: string; status: number; code?: string }> = {
  // Authentication errors
  invalid_credentials: {
    message: 'Invalid email or password',
    status: 401,
    code: 'INVALID_CREDENTIALS',
  },
  account_not_found: { message: 'Account not found', status: 404, code: 'ACCOUNT_NOT_FOUND' },
  account_locked: {
    message: 'Account temporarily locked. Please try again later.',
    status: 423,
    code: 'ACCOUNT_LOCKED',
  },
  email_not_verified: {
    message: 'Please verify your email address',
    status: 403,
    code: 'EMAIL_NOT_VERIFIED',
  },
  session_expired: {
    message: 'Your session has expired. Please sign in again.',
    status: 401,
    code: 'SESSION_EXPIRED',
  },
  insufficient_permissions: {
    message: 'You do not have permission to perform this action',
    status: 403,
    code: 'INSUFFICIENT_PERMISSIONS',
  },

  // Rate limiting
  rate_limit_exceeded: {
    message: 'Too many requests. Please try again later.',
    status: 429,
    code: 'RATE_LIMIT_EXCEEDED',
  },
  signup_rate_limit: {
    message: 'Too many registration attempts. Please try again later.',
    status: 429,
    code: 'SIGNUP_RATE_LIMIT',
  },
  login_rate_limit: {
    message: 'Too many sign-in attempts. Please try again later.',
    status: 429,
    code: 'LOGIN_RATE_LIMIT',
  },

  // Validation errors
  invalid_email: {
    message: 'Please enter a valid email address',
    status: 400,
    code: 'INVALID_EMAIL',
  },
  invalid_password: {
    message: 'Password does not meet requirements',
    status: 400,
    code: 'INVALID_PASSWORD',
  },
  password_too_weak: {
    message: 'Password is too weak. Please choose a stronger password.',
    status: 400,
    code: 'PASSWORD_TOO_WEAK',
  },
  email_already_exists: {
    message: 'An account with this email already exists',
    status: 409,
    code: 'EMAIL_ALREADY_EXISTS',
  },
  invalid_phone: {
    message: 'Please enter a valid phone number',
    status: 400,
    code: 'INVALID_PHONE',
  },

  // OTP/2FA errors
  invalid_otp: { message: 'Invalid verification code', status: 400, code: 'INVALID_OTP' },
  otp_expired: { message: 'Verification code has expired', status: 400, code: 'OTP_EXPIRED' },
  too_many_otp_attempts: {
    message: 'Too many incorrect attempts. Please request a new code.',
    status: 429,
    code: 'TOO_MANY_OTP_ATTEMPTS',
  },

  // Organization errors
  organization_not_found: {
    message: 'Organization not found',
    status: 404,
    code: 'ORGANIZATION_NOT_FOUND',
  },
  not_organization_member: {
    message: 'You are not a member of this organization',
    status: 403,
    code: 'NOT_ORGANIZATION_MEMBER',
  },
  organization_limit_reached: {
    message: 'Organization member limit reached',
    status: 409,
    code: 'ORGANIZATION_LIMIT_REACHED',
  },

  // Generic errors
  invalid_request: { message: 'Invalid request', status: 400, code: 'INVALID_REQUEST' },
  server_error: {
    message: 'An unexpected error occurred. Please try again.',
    status: 500,
    code: 'SERVER_ERROR',
  },
  service_unavailable: {
    message: 'Service temporarily unavailable. Please try again later.',
    status: 503,
    code: 'SERVICE_UNAVAILABLE',
  },
};

/**
 * Patterns that should never be exposed to clients
 */
const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /key/i,
  /token/i,
  /credential/i,
  /database/i,
  /connection/i,
  /redis/i,
  /prisma/i,
  /env/i,
  /config/i,
  /internal/i,
  /stack trace/i,
  /errno/i,
  /econnrefused/i,
  /getaddrinfo notfound/i,
];

/**
 * Database/ORM error patterns to sanitize
 */
const DATABASE_ERROR_PATTERNS = [
  { pattern: /unique constraint/i, replacement: 'This value is already in use' },
  { pattern: /foreign key constraint/i, replacement: 'Invalid reference' },
  { pattern: /null value.*not null constraint/i, replacement: 'Required field is missing' },
  { pattern: /column.*does not exist/i, replacement: 'Invalid request format' },
  { pattern: /table.*does not exist/i, replacement: 'Service temporarily unavailable' },
  { pattern: /connection.*refused/i, replacement: 'Service temporarily unavailable' },
  { pattern: /timeout/i, replacement: 'Request timed out. Please try again.' },
];

/**
 * Check if error contains sensitive information
 */
function containsSensitiveInfo(message: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Sanitize database error messages
 */
function sanitizeDatabaseError(message: string): string {
  for (const { pattern, replacement } of DATABASE_ERROR_PATTERNS) {
    if (pattern.test(message)) {
      return replacement;
    }
  }
  return 'Database operation failed';
}

/**
 * Determine error type from error message or object
 */
function determineErrorType(error: unknown): string {
  if (typeof error === 'string') {
    // Check for known error patterns
    const lowerMessage = error.toLowerCase();

    if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many')) {
      return 'rate_limit_exceeded';
    }
    if (lowerMessage.includes('invalid email') || lowerMessage.includes('email format')) {
      return 'invalid_email';
    }
    if (lowerMessage.includes('invalid password') || lowerMessage.includes('password')) {
      return 'invalid_password';
    }
    if (lowerMessage.includes('not found')) {
      return 'account_not_found';
    }
    if (lowerMessage.includes('unauthorized') || lowerMessage.includes('invalid credentials')) {
      return 'invalid_credentials';
    }
    if (lowerMessage.includes('forbidden') || lowerMessage.includes('permission')) {
      return 'insufficient_permissions';
    }
    if (lowerMessage.includes('already exists') || lowerMessage.includes('duplicate')) {
      return 'email_already_exists';
    }
  }

  if (error instanceof Error) {
    const errorName = error.name.toLowerCase();
    const errorMessage = error.message.toLowerCase();

    // Handle specific error types
    if (errorName.includes('validation')) {
      return 'invalid_request';
    }
    if (errorName.includes('prisma') || errorName.includes('database')) {
      return 'server_error';
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'service_unavailable';
    }
  }

  return 'server_error';
}

/**
 * Generate a unique request ID for error tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Securely handle and sanitize errors
 */
export function handleSecureError(
  error: unknown,
  options: SecureErrorOptions = {},
): SecureErrorResult {
  const {
    includeStackTrace = process.env.NODE_ENV === 'development',
    includeErrorCodes = true,
    customMessages = {},
    context = {},
  } = options;

  const requestId = generateRequestId();
  const errorType = determineErrorType(error);
  const errorMapping = ERROR_MESSAGE_MAP[errorType] || ERROR_MESSAGE_MAP.server_error;

  // Use custom message if provided
  const message = customMessages[errorType] || errorMapping.message;

  let sanitizedMessage = message;
  let actualError: Error | null = null;

  // Extract actual error details for logging
  if (error instanceof Error) {
    actualError = error;

    // In development, include more details if safe
    if (includeStackTrace && !containsSensitiveInfo(error.message)) {
      sanitizedMessage = error.message;
    } else if (containsSensitiveInfo(error.message)) {
      // Sanitize database errors
      if (
        error.message.toLowerCase().includes('database') ||
        error.message.toLowerCase().includes('prisma')
      ) {
        sanitizedMessage = sanitizeDatabaseError(error.message);
      }
    }
  }

  // Log the full error details securely
  const logContext = {
    requestId,
    errorType,
    originalMessage: actualError?.message || String(error),
    stack: actualError?.stack,
    context,
    userAgent: context.userAgent,
    ip: context.ip,
    userId: context.userId,
  };

  if (process.env.NODE_ENV !== 'test') {
    if (errorMapping.status >= 500) {
      baseLogError('Secure error handler: Server error', logContext);
    } else {
      baseLogWarn('Secure error handler: Client error', logContext);
    }
  }

  return {
    message: sanitizedMessage,
    code: includeErrorCodes ? errorMapping.code : undefined,
    status: errorMapping.status,
    isUserError: errorMapping.status < 500,
    requestId,
  };
}

/**
 * Create a secure error response for API endpoints
 */
export function createSecureErrorResponse(
  error: unknown,
  options: SecureErrorOptions = {},
): Response {
  const result = handleSecureError(error, options);

  const responseBody = {
    error: {
      message: result.message,
      ...(result.code && { code: result.code }),
      requestId: result.requestId,
    },
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (result.requestId) {
    headers['X-Request-ID'] = result.requestId;
  }

  return new Response(JSON.stringify(responseBody), {
    status: result.status,
    headers,
  });
}

/**
 * Better Auth error handler that sanitizes errors
 */
export function createBetterAuthErrorHandler() {
  return {
    onError: async (error: unknown, ctx: any): Promise<void> => {
      const secureError = handleSecureError(error, {
        context: {
          path: ctx?.path,
          method: ctx?.method,
          userAgent: ctx?.request?.headers?.get('user-agent'),
          ip:
            ctx?.request?.headers?.get('x-forwarded-for') ||
            ctx?.request?.headers?.get('x-real-ip') ||
            'unknown',
          userId: ctx?.session?.user?.id,
        },
      });

      // Log the secure error for monitoring
      if (process.env.NODE_ENV !== 'test') {
        // Use structured logging for production monitoring
        const errorLog = {
          level: 'error',
          message: '[Better Auth Error]',
          error: {
            message: secureError.message,
            status: secureError.status,
            code: secureError.code,
            requestId: secureError.requestId,
          },
        };
        console.error(JSON.stringify(errorLog));
      }

      // Also report via base observability interface for tests
      try {
        const err = error instanceof Error ? error : new Error(String(error));
        (baseLogError as any)('Better Auth API Error', err as any, {
          path: ctx?.path,
          method: ctx?.method,
        });
      } catch {}
      // Better Auth will handle the error response
    },
  };
}

/**
 * Middleware wrapper for secure error handling
 */
export function withSecureErrorHandling<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  options: SecureErrorOptions = {},
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      const secureError = handleSecureError(error, options);

      // Create a sanitized error to throw
      const sanitizedError = new Error(secureError.message);
      (sanitizedError as any).status = secureError.status;
      (sanitizedError as any).code = secureError.code;
      (sanitizedError as any).requestId = secureError.requestId;

      throw sanitizedError;
    }
  }) as T;
}

/**
 * Pre-configured error handlers for common scenarios
 */
export const SecureErrorHandlers = {
  /** Handler for authentication endpoints */
  auth: (error: unknown, ctx?: any) =>
    handleSecureError(error, {
      context: { ...ctx, sensitive: true },
      customMessages: {
        server_error: 'Authentication service temporarily unavailable',
      },
    }),

  /** Handler for API endpoints */
  api: (error: unknown, ctx?: any) =>
    handleSecureError(error, {
      context: ctx,
      includeErrorCodes: true,
    }),

  /** Handler for public endpoints (minimal info) */
  public: (error: unknown) =>
    handleSecureError(error, {
      includeErrorCodes: false,
      customMessages: {
        server_error: 'Service temporarily unavailable',
        invalid_request: 'Invalid request',
      },
    }),
} as const;
