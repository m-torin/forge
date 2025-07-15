import { logError } from '@repo/observability/server/next';

export type AIErrorType =
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'rate_limit'
  | 'timeout'
  | 'model_error'
  | 'streaming_error'
  | 'validation_error'
  | 'provider_error'
  | 'tool_error'
  | 'offline';

export type AISurface =
  | 'generation'
  | 'streaming'
  | 'tools'
  | 'provider'
  | 'validation'
  | 'model'
  | 'auth'
  | 'rate_limit'
  | 'network'
  | 'transformation'
  | 'testing';

export type AIErrorCode = `${AIErrorType}:${AISurface}`;

export type ErrorVisibility = 'response' | 'log' | 'none';

export const visibilityByAISurface: Record<AISurface, ErrorVisibility> = {
  generation: 'response',
  streaming: 'response',
  tools: 'response',
  provider: 'log',
  validation: 'response',
  model: 'response',
  auth: 'response',
  rate_limit: 'response',
  network: 'response',
  transformation: 'log',
  testing: 'log',
};

export interface AIErrorContext {
  model?: string;
  provider?: string;
  toolName?: string;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export class AISDKError extends Error {
  public type: AIErrorType;
  public surface: AISurface;
  public statusCode: number;
  public context?: AIErrorContext;

  constructor(errorCode: AIErrorCode, cause?: string, context?: AIErrorContext) {
    super();

    const [type, surface] = errorCode.split(':');

    this.type = type as AIErrorType;
    this.cause = cause;
    this.surface = surface as AISurface;
    this.context = context;
    this.message = getMessageByAIErrorCode(errorCode);
    this.statusCode = getStatusCodeByAIErrorType(this.type);
  }

  public toResponse() {
    const code: AIErrorCode = `${this.type}:${this.surface}`;
    const visibility = visibilityByAISurface[this.surface];

    const { message, cause, statusCode, context } = this;

    if (visibility === 'log') {
      // Use async logging in background (fire and forget)
      this.logErrorInBackground(
        message,
        typeof cause === 'string' ? cause : String(cause),
        code,
        context,
      );

      return Response.json(
        { code: '', message: 'Something went wrong. Please try again later.' },
        { status: statusCode },
      );
    }

    const responseBody: any = { code, message };
    if (cause) responseBody.cause = cause;
    if (context?.requestId) responseBody.requestId = context.requestId;

    return Response.json(responseBody, { status: statusCode });
  }

  private async logErrorInBackground(
    message: string,
    cause: string | undefined,
    code: AIErrorCode,
    context?: AIErrorContext,
  ) {
    try {
      logError(message, {
        operation: 'error_handling',
        requestId: context?.requestId,
        userId: context?.userId,
        error: new Error(cause || 'Unknown error'),
        metadata: {
          code,
          surface: this.surface,
          timestamp: new Date().toISOString(),
          context,
        },
      });
    } catch (loggerError) {
      // Fallback to observability logger if AI logger fails
      logError('Failed to log error via AI logger', {
        originalError: { code, message, cause: cause || 'unknown', context },
        operation: 'ai_error_logging_fallback',
        error: loggerError instanceof Error ? loggerError : new Error(String(loggerError)),
      });
    }
  }

  public toJSON() {
    return {
      type: this.type,
      surface: this.surface,
      message: this.message,
      cause: this.cause,
      statusCode: this.statusCode,
      context: this.context,
    };
  }
}

export function getMessageByAIErrorCode(errorCode: AIErrorCode): string {
  switch (errorCode) {
    // Generation errors
    case 'bad_request:generation':
      return 'The generation request was invalid. Please check your parameters and try again.';
    case 'timeout:generation':
      return 'The generation request timed out. Please try again.';
    case 'model_error:generation':
      return 'The AI model encountered an error during generation.';

    // Streaming errors
    case 'streaming_error:streaming':
      return 'An error occurred during streaming. Please try again.';
    case 'timeout:streaming':
      return 'The streaming request timed out. Please try again.';

    // Tool errors
    case 'tool_error:tools':
      return 'An error occurred while executing a tool.';
    case 'validation_error:tools':
      return 'Tool parameters failed validation.';
    case 'timeout:tools':
      return 'Tool execution timed out.';

    // Provider errors
    case 'provider_error:provider':
      return 'The AI provider encountered an error.';
    case 'rate_limit:provider':
      return 'Rate limit exceeded for the AI provider.';
    case 'unauthorized:provider':
      return 'Unauthorized access to the AI provider.';

    // Model errors
    case 'not_found:model':
      return 'The requested AI model was not found.';
    case 'forbidden:model':
      return 'Access to this AI model is forbidden.';

    // Validation errors
    case 'validation_error:validation':
      return 'Input validation failed. Please check your data.';
    case 'bad_request:validation':
      return 'The request format is invalid.';

    // Auth errors
    case 'unauthorized:auth':
      return 'Authentication required for AI services.';
    case 'forbidden:auth':
      return 'Insufficient permissions for AI services.';

    // Rate limit errors
    case 'rate_limit:rate_limit':
      return 'Rate limit exceeded. Please try again later.';

    // Network errors
    case 'offline:network':
      return 'Network connection failed. Please check your connection.';
    case 'timeout:network':
      return 'Network request timed out.';

    // Transformation errors (logged only)
    case 'validation_error:transformation':
      return 'Message transformation failed validation.';
    case 'bad_request:transformation':
      return 'Invalid data provided for transformation.';

    // Testing errors (logged only)
    case 'validation_error:testing':
      return 'Test validation failed.';
    case 'bad_request:testing':
      return 'Invalid test configuration.';

    default:
      return 'An unexpected error occurred with AI services. Please try again later.';
  }
}

function getStatusCodeByAIErrorType(type: AIErrorType): number {
  switch (type) {
    case 'bad_request':
    case 'validation_error':
      return 400;
    case 'unauthorized':
      return 401;
    case 'forbidden':
      return 403;
    case 'not_found':
      return 404;
    case 'timeout':
      return 408;
    case 'rate_limit':
      return 429;
    case 'model_error':
    case 'streaming_error':
    case 'tool_error':
    case 'provider_error':
      return 500;
    case 'offline':
      return 503;
    default:
      return 500;
  }
}

/**
 * Wraps async AI operations with standardized error handling
 */
export async function withAIErrorHandling<T>(
  operation: () => Promise<T>,
  errorCode: AIErrorCode,
  context?: AIErrorContext,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof AISDKError) {
      throw error;
    }

    const cause = error instanceof Error ? error.message : String(error);
    throw new AISDKError(errorCode, cause, context);
  }
}

/**
 * Creates an error handler for specific AI surfaces
 */
export function createAIErrorHandler(surface: AISurface) {
  return {
    badRequest: (cause?: string, context?: AIErrorContext) =>
      new AISDKError(`bad_request:${surface}`, cause, context),
    unauthorized: (cause?: string, context?: AIErrorContext) =>
      new AISDKError(`unauthorized:${surface}`, cause, context),
    forbidden: (cause?: string, context?: AIErrorContext) =>
      new AISDKError(`forbidden:${surface}`, cause, context),
    notFound: (cause?: string, context?: AIErrorContext) =>
      new AISDKError(`not_found:${surface}`, cause, context),
    timeout: (cause?: string, context?: AIErrorContext) =>
      new AISDKError(`timeout:${surface}`, cause, context),
    rateLimit: (cause?: string, context?: AIErrorContext) =>
      new AISDKError(`rate_limit:${surface}`, cause, context),
    validationError: (cause?: string, context?: AIErrorContext) =>
      new AISDKError(`validation_error:${surface}`, cause, context),
    providerError: (cause?: string, context?: AIErrorContext) =>
      new AISDKError(`provider_error:${surface}`, cause, context),
    modelError: (cause?: string, context?: AIErrorContext) =>
      new AISDKError(`model_error:${surface}`, cause, context),
    streamingError: (cause?: string, context?: AIErrorContext) =>
      new AISDKError(`streaming_error:${surface}`, cause, context),
    toolError: (cause?: string, context?: AIErrorContext) =>
      new AISDKError(`tool_error:${surface}`, cause, context),
    offline: (cause?: string, context?: AIErrorContext) =>
      new AISDKError(`offline:${surface}`, cause, context),
  };
}

// Pre-configured error handlers for common surfaces
export const generationErrors = createAIErrorHandler('generation');
export const streamingErrors = createAIErrorHandler('streaming');
export const toolErrors = createAIErrorHandler('tools');
export const providerErrors = createAIErrorHandler('provider');
export const validationErrors = createAIErrorHandler('validation');
