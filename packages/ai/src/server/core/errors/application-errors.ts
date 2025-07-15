/**
 * Application-level AI error handling system
 * Provides structured error handling for AI applications with surface-based visibility
 */

import { logError } from '@repo/observability/server/next';
import {
  ApplicationAIError as BaseApplicationAIError,
  handleAIProviderError as baseHandleAIProviderError,
  createErrorRecovery,
  defaultErrorRecovery,
  defaultVisibilityBySurface,
  type AIErrorCode,
  type ErrorRecoveryStrategy,
  type ErrorSurface,
  type ErrorVisibility,
} from '../../../shared/errors';

/**
 * Server-side Application AI error with Response handling
 * Extends the shared base class with server-specific features
 */
export class ServerApplicationAIError extends BaseApplicationAIError {
  /**
   * Convert error to response based on visibility settings
   */
  public toResponse(visibilityOverride?: Record<ErrorSurface, ErrorVisibility>): Response {
    const code: AIErrorCode = `${this.type}:${this.surface}`;
    const visibilitySettings = { ...defaultVisibilityBySurface, ...visibilityOverride };
    const visibility = visibilitySettings[this.surface];

    const { message, cause, statusCode, metadata } = this;

    if (visibility === 'log') {
      logError(`Application error: ${message}`, {
        code,
        cause,
        metadata,
        operation: 'application_error',
        error: this,
      });

      return Response.json(
        {
          code: '',
          message: 'Something went wrong. Please try again later.',
          error: true,
        },
        { status: statusCode },
      );
    }

    if (visibility === 'none') {
      return Response.json({ error: true }, { status: statusCode });
    }

    return Response.json(
      {
        code,
        message,
        cause,
        metadata: this.includeMetadataInResponse() ? metadata : undefined,
        error: true,
      },
      { status: statusCode },
    );
  }

  /**
   * Determine if metadata should be included in response
   */
  private includeMetadataInResponse(): boolean {
    // Don't include metadata for auth/security surfaces
    if (['auth', 'database'].includes(this.surface)) {
      return false;
    }
    return true;
  }
}

// Re-export the shared handler with proper typing
export const handleAIProviderError = baseHandleAIProviderError;

// Re-export shared error recovery types and utilities
export { createErrorRecovery, defaultErrorRecovery, type ErrorRecoveryStrategy };
