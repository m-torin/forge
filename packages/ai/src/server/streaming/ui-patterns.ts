import { createUIMessageStream, type UIMessageStreamWriter } from 'ai';

export interface StandardUIMessageStreamOptions {
  execute: (options: { writer: UIMessageStreamWriter }) => void | Promise<void>;
  onError?: (error: unknown) => string;
  enableStandardErrorHandling?: boolean;
}

/**
 * Standard error messages for AI SDK v5 errors
 */
export const standardErrorMessages = {
  NoSuchToolError: 'The model tried to call an unknown tool.',
  InvalidToolArgumentsError: 'The model called a tool with invalid arguments.',
  ToolExecutionError: 'An error occurred during tool execution.',
  APICallError: 'Failed to connect to the AI provider.',
  InvalidResponseDataError: 'Received invalid response from the AI provider.',
  LoadAPIKeyError: 'Failed to load API key.',
  UnsupportedFunctionalityError: 'The requested functionality is not supported.',
  default: 'An unexpected error occurred.',
} as const;

/**
 * Standard error handler for AI SDK v5 errors
 */
export function handleAIStreamError(error: unknown): string {
  if (error && typeof error === 'object' && 'name' in error) {
    const errorName = error.name as keyof typeof standardErrorMessages;
    if (errorName in standardErrorMessages) {
      return standardErrorMessages[errorName];
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return standardErrorMessages.default;
}

/**
 * Creates a UI message stream with standardized error handling
 * and common patterns for AI SDK v5
 */
export function createStandardUIMessageStream(options: StandardUIMessageStreamOptions) {
  const { enableStandardErrorHandling = true, onError, execute } = options;

  return createUIMessageStream({
    execute,
    onError: enableStandardErrorHandling
      ? error => {
          // Call custom error handler if provided
          if (onError) {
            const customResult = onError(error);
            if (customResult !== undefined) {
              return customResult;
            }
          }
          // Fall back to standard error handling
          return handleAIStreamError(error);
        }
      : onError,
  });
}

/**
 * Creates a UI message stream with retry capabilities
 */
export function createRetryableUIMessageStream(
  options: StandardUIMessageStreamOptions & {
    maxRetries?: number;
    retryDelay?: number;
  },
) {
  const { maxRetries = 3, retryDelay = 1000, execute, ...restOptions } = options;

  return createStandardUIMessageStream({
    ...restOptions,
    execute: async ({ writer }) => {
      let lastError: unknown;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await execute({ writer });
        } catch (error) {
          lastError = error;

          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          }
        }
      }

      throw lastError;
    },
  });
}
