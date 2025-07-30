/**
 * Client-safe error handling following Vercel AI SDK v5 patterns
 * No server imports - pure TypeScript interfaces and functions
 */

// Re-export shared types from @repo/ai (these are just type definitions)
export type {
  AIErrorCode as ErrorCode,
  AIErrorType as ErrorType,
  ErrorVisibility,
  ErrorSurface as Surface,
} from '@repo/ai';

// App-specific error types
type AppSpecificSurface = 'history' | 'vote' | 'suggestions';
type ExtendedSurface = import('@repo/ai').ErrorSurface | AppSpecificSurface;
type ExtendedErrorCode = `${import('@repo/ai').AIErrorType}:${ExtendedSurface}`;

// Error interface following AI SDK v5 pattern
interface SDKError {
  isSDKError: true;
  type: import('@repo/ai').AIErrorType;
  surface: ExtendedSurface;
  message: string;
  code: ExtendedErrorCode;
  statusCode?: number;
  metadata?: Record<string, any>;
}

/**
 * ChatSDKError class following AI SDK v5 pattern
 * Client-safe implementation without server dependencies
 */
export class ChatSDKError extends Error implements SDKError {
  public readonly isSDKError = true as const;
  public type: import('@repo/ai').AIErrorType;
  public surface: ExtendedSurface;
  public code: ExtendedErrorCode;
  public statusCode?: number;
  public metadata?: Record<string, any>;

  constructor(errorCode: ExtendedErrorCode, message?: string, metadata?: Record<string, any>) {
    const [type, surface] = errorCode.split(':') as [
      import('@repo/ai').AIErrorType,
      ExtendedSurface,
    ];
    const errorMessage = message || getErrorMessage(errorCode);

    super(errorMessage);
    this.name = 'ChatSDKError';
    this.type = type;
    this.surface = surface;
    this.code = errorCode;
    this.metadata = metadata;
    this.statusCode = getStatusCode(type);
  }

  /**
   * Static method following AI SDK v5 pattern for type checking
   */
  static isInstance(error: unknown): error is ChatSDKError {
    return (
      error instanceof ChatSDKError ||
      (error !== null &&
        typeof error === 'object' &&
        'isSDKError' in error &&
        error.isSDKError === true)
    );
  }

  /**
   * Convert error to Response for API routes
   * Simple implementation without server dependencies
   */
  toResponse(): Response {
    return Response.json(
      {
        error: true,
        code: this.code,
        message: this.message,
        ...(this.metadata && { metadata: this.metadata }),
      },
      { status: this.statusCode || 500 },
    );
  }
}

/**
 * Get error message for error code
 */
function getErrorMessage(errorCode: ExtendedErrorCode): string {
  // App-specific error messages
  const messages: Record<string, string> = {
    // Chat-related errors
    'not_found:chat': 'The requested chat was not found.',
    'forbidden:chat': 'You do not have permission to access this chat.',
    'unauthorized:chat': 'You need to sign in to access this chat.',
    'bad_request:chat': 'Invalid chat request. Please try again.',

    // History-related errors
    'not_found:history': 'The requested chat history was not found.',
    'forbidden:history': 'You do not have permission to access this chat history.',
    'unauthorized:history': 'You need to sign in to view chat history.',

    // Vote-related errors
    'bad_request:vote': 'Invalid vote request. Please try again.',
    'forbidden:vote': 'You cannot vote on this message.',
    'unauthorized:vote': 'You need to sign in to vote.',

    // Suggestions-related errors
    'bad_request:suggestions': 'Unable to generate suggestions. Please try again.',
    'rate_limit:suggestions': 'Too many suggestion requests. Please wait a moment.',

    // API-related errors
    'bad_request:api': 'Invalid API request. Please check your parameters.',
    'unauthorized:api': 'Authentication required for this API endpoint.',

    // Generic fallback
    'unknown:unknown': 'Something went wrong. Please try again later.',
  };

  return messages[errorCode] || messages['unknown:unknown'];
}

/**
 * Get HTTP status code for error type
 */
function getStatusCode(type: import('@repo/ai').AIErrorType): number {
  const statusCodes: Record<import('@repo/ai').AIErrorType, number> = {
    bad_request: 400,
    unauthorized: 401,
    forbidden: 403,
    not_found: 404,
    rate_limit: 429,
    quota_exceeded: 429,
    offline: 503,
    model_error: 500,
    tool_error: 500,
    stream_error: 500,
    provider_error: 502,
  };

  return statusCodes[type] || 500;
}

/**
 * Error handler utility following AI SDK v5 pattern
 * Converts unknown errors to user-friendly messages
 */
export function errorHandler(error: unknown): string {
  if (error == null) {
    return 'Unknown error occurred';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (ChatSDKError.isInstance(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

/**
 * Create an SDK error from a response or error object
 */
export function createSDKError(
  response: Response | Error | unknown,
  surface: ExtendedSurface = 'api',
): ChatSDKError {
  // Handle Response objects
  if (response instanceof Response) {
    const statusToType: Record<number, import('@repo/ai').AIErrorType> = {
      400: 'bad_request',
      401: 'unauthorized',
      403: 'forbidden',
      404: 'not_found',
      429: 'rate_limit',
      500: 'model_error',
      502: 'provider_error',
      503: 'offline',
    };

    const type = statusToType[response.status] || 'provider_error';
    const code = `${type}:${surface}` as ExtendedErrorCode;

    return new ChatSDKError(code, response.statusText, {
      status: response.status,
      url: response.url,
    });
  }

  // Handle Error objects
  if (response instanceof Error) {
    const code = `provider_error:${surface}` as ExtendedErrorCode;
    return new ChatSDKError(code, response.message);
  }

  // Handle unknown errors
  const code = `provider_error:${surface}` as ExtendedErrorCode;
  return new ChatSDKError(code, 'An unexpected error occurred');
}

// Extended visibility settings for app-specific surfaces
export const visibilityBySurface: Record<ExtendedSurface, import('@repo/ai').ErrorVisibility> = {
  // Shared surfaces
  database: 'log',
  chat: 'response',
  auth: 'response',
  stream: 'response',
  api: 'response',
  model: 'response',
  tool: 'response',
  provider: 'response',
  document: 'response',
  vector: 'log',
  rag: 'log',
  // App-specific surfaces
  history: 'response',
  vote: 'response',
  suggestions: 'response',
};

// For backward compatibility
export const handleAIProviderError = createSDKError;
export const getMessageByErrorCodeCompat = getErrorMessage;
export const getMessageByErrorCode = getErrorMessage;
