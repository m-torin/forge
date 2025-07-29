/**
 * Tests for Next.js error handling
 * Testing error boundaries and error transformations for Next.js integration
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  AIErrorCode,
  AISDKError,
  createAIErrorHandler,
  generationErrors,
  getMessageByAIErrorCode,
  providerErrors,
  streamingErrors,
  toolErrors,
  validationErrors,
  visibilityByAISurface,
  withAIErrorHandling,
} from '../../../src/server/next/error-handling';

// Mock logger
vi.mock('@repo/observability/server/next', () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
  logInfo: vi.fn(),
}));

describe('next.js Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('aISDKError', () => {
    test('should create error with correct properties', () => {
      const error = new AISDKError('bad_request:generation', 'Invalid parameters', {
        model: 'gpt-4',
        requestId: 'req-123',
      });

      expect(error.type).toBe('bad_request');
      expect(error.surface).toBe('generation');
      expect(error.statusCode).toBe(400);
      expect(error.cause).toBe('Invalid parameters');
      expect(error.context?.model).toBe('gpt-4');
      expect(error.context?.requestId).toBe('req-123');
    });

    test('should have correct status codes for error types', () => {
      expect(new AISDKError('bad_request:generation').statusCode).toBe(400);
      expect(new AISDKError('unauthorized:auth').statusCode).toBe(401);
      expect(new AISDKError('forbidden:auth').statusCode).toBe(403);
      expect(new AISDKError('not_found:model').statusCode).toBe(404);
      expect(new AISDKError('timeout:network').statusCode).toBe(408);
      expect(new AISDKError('rate_limit:provider').statusCode).toBe(429);
      expect(new AISDKError('model_error:generation').statusCode).toBe(500);
      expect(new AISDKError('offline:network').statusCode).toBe(503);
    });

    test('should serialize to JSON correctly', () => {
      const error = new AISDKError('validation_error:tools', 'Missing required parameter', {
        toolName: 'search',
        userId: 'user-123',
      });

      const json = error.toJSON();

      expect(json).toStrictEqual({
        type: 'validation_error',
        surface: 'tools',
        message: 'Tool parameters failed validation.',
        cause: 'Missing required parameter',
        statusCode: 400,
        context: {
          toolName: 'search',
          userId: 'user-123',
        },
      });
    });
  });

  describe('error to Response conversion', () => {
    test('should convert errors to Response objects', () => {
      const error = new AISDKError('rate_limit:provider', 'Too many requests');
      const response = error.toResponse();

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(429);
    });

    test('should include error details for visible surfaces', async () => {
      const error = new AISDKError('bad_request:generation', 'Invalid prompt', {
        model: 'gpt-4',
        requestId: 'req-123',
      });
      const response = error.toResponse();
      const body = await response.json();

      expect(body).toStrictEqual({
        code: 'bad_request:generation',
        message: 'The generation request was invalid. Please check your parameters and try again.',
        cause: 'Invalid prompt',
        requestId: 'req-123',
      });
    });

    test('should hide error details for log-only surfaces', async () => {
      const error = new AISDKError('validation_error:transformation', 'Internal validation failed');
      const response = error.toResponse();
      const body = await response.json();

      expect(body).toStrictEqual({
        code: '',
        message: 'Something went wrong. Please try again later.',
      });
    });

    test('should log errors for log-only surfaces', async () => {
      const { logError } = await import('@repo/observability/server/next');
      const error = new AISDKError('bad_request:testing', 'Test error', {
        requestId: 'test-123',
      });

      error.toResponse();

      // Give async logging a moment to execute
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(logError).toHaveBeenCalledWith(
        'Invalid test configuration.',
        expect.objectContaining({
          operation: 'error_handling',
          requestId: 'test-123',
        }),
      );
    });
  });

  describe('visibilityByAISurface', () => {
    test('should have correct visibility settings', () => {
      expect(visibilityByAISurface.generation).toBe('response');
      expect(visibilityByAISurface.streaming).toBe('response');
      expect(visibilityByAISurface.tools).toBe('response');
      expect(visibilityByAISurface.provider).toBe('log');
      expect(visibilityByAISurface.validation).toBe('response');
      expect(visibilityByAISurface.model).toBe('response');
      expect(visibilityByAISurface.auth).toBe('response');
      expect(visibilityByAISurface.rate_limit).toBe('response');
      expect(visibilityByAISurface.network).toBe('response');
      expect(visibilityByAISurface.transformation).toBe('log');
      expect(visibilityByAISurface.testing).toBe('log');
    });
  });

  describe('getMessageByAIErrorCode', () => {
    test('should return correct messages for generation errors', () => {
      expect(getMessageByAIErrorCode('bad_request:generation')).toBe(
        'The generation request was invalid. Please check your parameters and try again.',
      );
      expect(getMessageByAIErrorCode('timeout:generation')).toBe(
        'The generation request timed out. Please try again.',
      );
      expect(getMessageByAIErrorCode('model_error:generation')).toBe(
        'The AI model encountered an error during generation.',
      );
    });

    test('should return correct messages for streaming errors', () => {
      expect(getMessageByAIErrorCode('streaming_error:streaming')).toBe(
        'An error occurred during streaming. Please try again.',
      );
      expect(getMessageByAIErrorCode('timeout:streaming')).toBe(
        'The streaming request timed out. Please try again.',
      );
    });

    test('should return correct messages for tool errors', () => {
      expect(getMessageByAIErrorCode('tool_error:tools')).toBe(
        'An error occurred while executing a tool.',
      );
      expect(getMessageByAIErrorCode('validation_error:tools')).toBe(
        'Tool parameters failed validation.',
      );
      expect(getMessageByAIErrorCode('timeout:tools')).toBe('Tool execution timed out.');
    });

    test('should return correct messages for provider errors', () => {
      expect(getMessageByAIErrorCode('provider_error:provider')).toBe(
        'The AI provider encountered an error.',
      );
      expect(getMessageByAIErrorCode('rate_limit:provider')).toBe(
        'Rate limit exceeded for the AI provider.',
      );
      expect(getMessageByAIErrorCode('unauthorized:provider')).toBe(
        'Unauthorized access to the AI provider.',
      );
    });

    test('should return default message for unknown codes', () => {
      expect(getMessageByAIErrorCode('unknown:surface' as AIErrorCode)).toBe(
        'An unexpected error occurred with AI services. Please try again later.',
      );
    });
  });

  describe('withAIErrorHandling', () => {
    test('should wrap operations and handle errors', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Operation failed'));

      await expect(
        withAIErrorHandling(operation, 'bad_request:generation', { model: 'gpt-4' }),
      ).rejects.toThrow(AISDKError);

      try {
        await withAIErrorHandling(operation, 'bad_request:generation', { model: 'gpt-4' });
      } catch (error) {
        if (!(error instanceof AISDKError)) {
          throw new Error('Expected error to be instanceof AISDKError');
        }
        if (error.type !== 'bad_request') {
          throw new Error(`Expected error type to be 'bad_request', got '${error.type}'`);
        }
        if (error.surface !== 'generation') {
          throw new Error(`Expected error surface to be 'generation', got '${error.surface}'`);
        }
        if (error.cause !== 'Operation failed') {
          throw new Error(`Expected error cause to be 'Operation failed', got '${error.cause}'`);
        }
        if (error.context?.model !== 'gpt-4') {
          throw new Error(
            `Expected error context model to be 'gpt-4', got '${error.context?.model}'`,
          );
        }
      }
    });

    test('should pass through successful operations', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await withAIErrorHandling(operation, 'bad_request:generation');

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledWith();
    });

    test('should not double-wrap AISDKError', async () => {
      const existingError = new AISDKError('timeout:network', 'Network timeout');
      const operation = vi.fn().mockRejectedValue(existingError);

      await expect(withAIErrorHandling(operation, 'bad_request:generation')).rejects.toBe(
        existingError,
      );
    });
  });

  describe('createAIErrorHandler', () => {
    test('should create error handlers for surfaces', () => {
      const handler = createAIErrorHandler('generation');

      expect(handler.badRequest).toBeDefined();
      expect(handler.unauthorized).toBeDefined();
      expect(handler.forbidden).toBeDefined();
      expect(handler.notFound).toBeDefined();
      expect(handler.timeout).toBeDefined();
      expect(handler.rateLimit).toBeDefined();
      expect(handler.validationError).toBeDefined();
      expect(handler.providerError).toBeDefined();
      expect(handler.modelError).toBeDefined();
      expect(handler.streamingError).toBeDefined();
      expect(handler.toolError).toBeDefined();
      expect(handler.offline).toBeDefined();
    });

    test('should create errors with correct properties', () => {
      const handler = createAIErrorHandler('tools');

      const error = handler.validationError('Missing parameter', {
        toolName: 'search',
        userId: 'user-123',
      });

      expect(error).toBeInstanceOf(AISDKError);
      expect(error.type).toBe('validation_error');
      expect(error.surface).toBe('tools');
      expect(error.cause).toBe('Missing parameter');
      expect(error.context?.toolName).toBe('search');
      expect(error.context?.userId).toBe('user-123');
    });
  });

  describe('pre-configured error handlers', () => {
    test('should have generation error handlers', () => {
      const error = generationErrors.timeout('Generation took too long');
      expect(error.type).toBe('timeout');
      expect(error.surface).toBe('generation');
    });

    test('should have streaming error handlers', () => {
      const error = streamingErrors.streamingError('Stream interrupted');
      expect(error.type).toBe('streaming_error');
      expect(error.surface).toBe('streaming');
    });

    test('should have tool error handlers', () => {
      const error = toolErrors.toolError('Tool execution failed');
      expect(error.type).toBe('tool_error');
      expect(error.surface).toBe('tools');
    });

    test('should have provider error handlers', () => {
      const error = providerErrors.rateLimit('Provider rate limit');
      expect(error.type).toBe('rate_limit');
      expect(error.surface).toBe('provider');
    });

    test('should have validation error handlers', () => {
      const error = validationErrors.validationError('Invalid input');
      expect(error.type).toBe('validation_error');
      expect(error.surface).toBe('validation');
    });
  });
});
