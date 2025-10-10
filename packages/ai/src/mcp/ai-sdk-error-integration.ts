import { logError, logInfo, logWarn } from '@repo/observability/server/next';
import 'server-only';

/**
 * AI SDK v5 Error Integration for MCP
 * Provides standardized error handling patterns that integrate with AI SDK v5 error callbacks
 *
 * Key Features:
 * - onUncaughtError handler integration
 * - Stream error forwarding
 * - Proper error type conformance with AI SDK conventions
 * - Resource cleanup coordination
 * - Error recovery mechanisms
 */

/**
 * AI SDK v5 compatible error types
 * These align with the error types expected by AI SDK callbacks
 */
export type AISDKErrorType =
  | 'connection-error'
  | 'transport-error'
  | 'tool-execution-error'
  | 'timeout-error'
  | 'validation-error'
  | 'resource-exhausted'
  | 'unknown-error';

/**
 * Enhanced error class that conforms to AI SDK v5 error handling patterns
 */
export class AISDKCompatibleMCPError extends Error {
  public readonly errorType: AISDKErrorType;
  public readonly timestamp: Date;
  public readonly recoverable: boolean;
  public readonly metadata: Record<string, any>;

  constructor(
    message: string,
    errorType: AISDKErrorType = 'unknown-error',
    originalError?: Error,
    metadata: Record<string, any> = {},
    recoverable: boolean = false,
  ) {
    super(message);
    this.name = 'AISDKCompatibleMCPError';
    this.errorType = errorType;
    this.timestamp = new Date();
    this.recoverable = recoverable;
    this.metadata = {
      ...metadata,
      originalError: originalError?.message,
      originalStack: originalError?.stack,
    };

    // Maintain stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AISDKCompatibleMCPError);
    }
  }

  /**
   * Convert to AI SDK error format for logging
   */
  toAISDKFormat() {
    return {
      name: this.name,
      message: this.message,
      errorType: this.errorType,
      timestamp: this.timestamp.toISOString(),
      recoverable: this.recoverable,
      metadata: this.metadata,
      stack: this.stack,
    };
  }
}

/**
 * Error handler factory for MCP operations
 * Creates standardized error handlers that integrate with AI SDK v5 patterns
 */
export class MCPErrorHandlerFactory {
  private clientName: string;
  private operationContext: string;

  constructor(clientName: string, operationContext: string = 'mcp-operation') {
    this.clientName = clientName;
    this.operationContext = operationContext;
  }

  /**
   * Create an onUncaughtError handler for AI SDK v5 integration
   */
  createUncaughtErrorHandler(
    cleanupFn: () => Promise<void>,
    options: {
      enableRecovery?: boolean;
      maxRecoveryAttempts?: number;
      logLevel?: 'error' | 'warn' | 'info';
    } = {},
  ): (error: Error) => void {
    const { enableRecovery = false, maxRecoveryAttempts = 1, logLevel = 'error' } = options;
    let recoveryAttempts = 0;

    return (error: Error) => {
      const aiError = this.convertToAISDKError(error);

      // Log the error according to AI SDK patterns
      const logFn = logLevel === 'warn' ? logWarn : logLevel === 'info' ? logInfo : logError;
      logFn(`MCP uncaught error in ${this.operationContext}`, {
        operation: 'mcp_uncaught_error_handler',
        metadata: {
          clientName: this.clientName,
          errorType: aiError.errorType,
          recoverable: aiError.recoverable,
          recoveryAttempts,
          maxRecoveryAttempts,
          ...aiError.metadata,
        },
        error: aiError,
      });

      // Attempt recovery if enabled and error is recoverable
      if (enableRecovery && aiError.recoverable && recoveryAttempts < maxRecoveryAttempts) {
        recoveryAttempts++;
        logInfo(
          `Attempting recovery for MCP error (attempt ${recoveryAttempts}/${maxRecoveryAttempts})`,
          {
            operation: 'mcp_error_recovery_attempt',
            metadata: {
              clientName: this.clientName,
              recoveryAttempt: recoveryAttempts,
              errorType: aiError.errorType,
            },
          },
        );

        // Recovery is handled by not calling cleanup immediately
        // The caller should implement retry logic
        return;
      }

      // Perform cleanup for non-recoverable errors or exhausted recovery attempts
      void (async () => {
        try {
          await cleanupFn();
        } catch (cleanupError) {
          logError(`Failed to cleanup after uncaught error in ${this.operationContext}`, {
            operation: 'mcp_cleanup_after_uncaught_error',
            metadata: {
              clientName: this.clientName,
              originalError: aiError.message,
              cleanupError:
                cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
            },
            error: cleanupError instanceof Error ? cleanupError : new Error(String(cleanupError)),
          });
        }
      })();
    };
  }

  /**
   * Create a stream error handler for AI SDK v5 streaming integration
   */
  createStreamErrorHandler(
    cleanupFn: () => Promise<void>,
    onStreamError?: (error: AISDKCompatibleMCPError) => void,
  ): (error: Error) => void {
    return (error: Error) => {
      const aiError = this.convertToAISDKError(error, 'transport-error');

      logError(`MCP stream error in ${this.operationContext}`, {
        operation: 'mcp_stream_error_handler',
        metadata: {
          clientName: this.clientName,
          errorType: aiError.errorType,
          streamContext: this.operationContext,
          ...aiError.metadata,
        },
        error: aiError,
      });

      // Notify stream error callback if provided
      if (onStreamError) {
        try {
          onStreamError(aiError);
        } catch (callbackError) {
          logError(`Stream error callback failed in ${this.operationContext}`, {
            operation: 'mcp_stream_error_callback_failure',
            metadata: {
              clientName: this.clientName,
              callbackError:
                callbackError instanceof Error ? callbackError.message : String(callbackError),
            },
            error:
              callbackError instanceof Error ? callbackError : new Error(String(callbackError)),
          });
        }
      }

      // Always attempt cleanup for stream errors
      void (async () => {
        try {
          await cleanupFn();
        } catch (cleanupError) {
          logError(`Failed to cleanup after stream error in ${this.operationContext}`, {
            operation: 'mcp_stream_cleanup_error',
            metadata: {
              clientName: this.clientName,
              originalError: aiError.message,
              cleanupError:
                cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
            },
            error: cleanupError instanceof Error ? cleanupError : new Error(String(cleanupError)),
          });
        }
      })();
    };
  }

  /**
   * Create a finish handler for proper AI SDK v5 lifecycle management
   */
  createFinishHandler(
    cleanupFn: () => Promise<void>,
    successCallback?: () => void,
  ): () => Promise<void> {
    return async () => {
      try {
        await cleanupFn();

        logInfo(`MCP operation completed successfully in ${this.operationContext}`, {
          operation: 'mcp_finish_handler_success',
          metadata: {
            clientName: this.clientName,
            operationContext: this.operationContext,
          },
        });

        // Call success callback if provided
        if (successCallback) {
          try {
            successCallback();
          } catch (callbackError) {
            logWarn(`Success callback failed in ${this.operationContext}`, {
              operation: 'mcp_success_callback_failure',
              metadata: {
                clientName: this.clientName,
                callbackError:
                  callbackError instanceof Error ? callbackError.message : String(callbackError),
              },
            });
          }
        }
      } catch (error) {
        const aiError = this.convertToAISDKError(
          error instanceof Error ? error : new Error(String(error)),
        );

        logError(`MCP finish handler failed in ${this.operationContext}`, {
          operation: 'mcp_finish_handler_error',
          metadata: {
            clientName: this.clientName,
            errorType: aiError.errorType,
            ...aiError.metadata,
          },
          error: aiError,
        });

        // Re-throw to maintain AI SDK error handling flow
        throw aiError;
      }
    };
  }

  /**
   * Convert generic error to AI SDK compatible error
   */
  private convertToAISDKError(
    error: Error,
    defaultType: AISDKErrorType = 'unknown-error',
  ): AISDKCompatibleMCPError {
    // Check if already an AI SDK compatible error
    if (error instanceof AISDKCompatibleMCPError) {
      return error;
    }

    // Map common error patterns to AI SDK error types
    let errorType: AISDKErrorType = defaultType;
    let recoverable = false;

    if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      errorType = 'connection-error';
      recoverable = true;
    } else if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
      errorType = 'timeout-error';
      recoverable = true;
    } else if (error.message.includes('transport') || error.message.includes('Transport')) {
      errorType = 'transport-error';
      recoverable = true;
    } else if (error.message.includes('validation') || error.message.includes('invalid')) {
      errorType = 'validation-error';
      recoverable = false;
    } else if (error.message.includes('resource') || error.message.includes('limit')) {
      errorType = 'resource-exhausted';
      recoverable = true;
    } else if (error.message.includes('tool') || error.message.includes('execution')) {
      errorType = 'tool-execution-error';
      recoverable = false;
    }

    return new AISDKCompatibleMCPError(
      error.message,
      errorType,
      error,
      {
        clientName: this.clientName,
        operationContext: this.operationContext,
        originalErrorName: error.name,
      },
      recoverable,
    );
  }
}

/**
 * Utility functions for AI SDK v5 error integration
 */
export const MCPErrorUtils = {
  /**
   * Create a standardized error context for MCP operations
   */
  createErrorContext(clientName: string, operation: string): MCPErrorHandlerFactory {
    return new MCPErrorHandlerFactory(clientName, operation);
  },

  /**
   * Check if an error is recoverable according to AI SDK patterns
   */
  isRecoverableError(error: Error): boolean {
    if (error instanceof AISDKCompatibleMCPError) {
      return error.recoverable;
    }

    // Common recoverable error patterns
    const recoverablePatterns = [
      'ECONNREFUSED',
      'ENOTFOUND',
      'TIMEOUT',
      'timeout',
      'network',
      'temporary',
      'rate limit',
      'throttle',
    ];

    return recoverablePatterns.some(pattern =>
      error.message.toLowerCase().includes(pattern.toLowerCase()),
    );
  },

  /**
   * Extract error metadata for AI SDK logging
   */
  extractErrorMetadata(error: Error): Record<string, any> {
    const metadata: Record<string, any> = {
      errorName: error.name,
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
    };

    if (error instanceof AISDKCompatibleMCPError) {
      metadata.errorType = error.errorType;
      metadata.recoverable = error.recoverable;
      metadata.customMetadata = error.metadata;
    }

    // Extract common error properties
    if ('code' in error) {
      metadata.errorCode = (error as any).code;
    }

    if ('errno' in error) {
      metadata.errno = (error as any).errno;
    }

    if ('syscall' in error) {
      metadata.syscall = (error as any).syscall;
    }

    return metadata;
  },
};
