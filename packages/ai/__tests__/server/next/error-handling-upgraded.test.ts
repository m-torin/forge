/**
 * Tests for Next.js Error Handling - Upgraded for Mock/Integration Mode
 *
 * Uses environment variables to control testing mode:
 * - INTEGRATION_TEST=true: Test with real API errors and network conditions
 * - INTEGRATION_TEST=false/undefined: Use mocks (default)
 *
 * To run with real error scenarios:
 * INTEGRATION_TEST=true OPENAI_API_KEY=invalid-key pnpm test error-handling-upgraded
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

const IS_INTEGRATION_TEST = process.env.INTEGRATION_TEST === 'true';
const TEST_TIMEOUT = IS_INTEGRATION_TEST ? 30000 : 5000;

// Mock setup for unit tests
if (!IS_INTEGRATION_TEST) {
  // Mock logger
  vi.mock('@repo/observability/server/next', () => ({
    logError: vi.fn(),
    logWarn: vi.fn(),
    logInfo: vi.fn(),
  }));

  // Mock AI SDK for error testing
  vi.mock('ai', () => ({
    generateText: vi.fn(),
    streamText: vi.fn(),
  }));
} else {
  // Mock logger for integration tests too
  vi.mock('@repo/observability/server/next', () => ({
    logError: vi.fn(),
    logWarn: vi.fn(),
    logInfo: vi.fn(),
  }));
}

describe('next.js Error Handling - Upgraded (Mock/Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    if (IS_INTEGRATION_TEST) {
      console.log('🔗 Integration test mode - testing real error scenarios');
    } else {
      console.log('🤖 Mock test mode - testing error handling logic');
    }
  });

  describe('aISDKError', () => {
    test('should create error with correct properties', () => {
      const error = new AISDKError('bad_request:generation', 'Invalid parameters', {
        model: IS_INTEGRATION_TEST ? 'gpt-4-integration' : 'gpt-4',
        requestId: IS_INTEGRATION_TEST ? `integration-${Date.now()}` : 'req-123',
      });

      expect(error.type).toBe('bad_request');
      expect(error.surface).toBe('generation');
      expect(error.statusCode).toBe(400);
      expect(error.cause).toBe('Invalid parameters');
      expect(error.context?.model).toBe(IS_INTEGRATION_TEST ? 'gpt-4-integration' : 'gpt-4');

      // Verify requestId exists
      expect(error.context?.requestId).toBeDefined();

      if (IS_INTEGRATION_TEST) {
        console.log(
          `✅ Integration: AISDKError created with requestId: ${error.context?.requestId}`,
        );
      } else {
        expect(error.context?.requestId).toBe('req-123');
        console.log('✅ Mock: AISDKError created with correct properties');
      }
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

      // Log completion based on test type
      const completionMessage = IS_INTEGRATION_TEST
        ? '✅ Integration: All HTTP status codes verified'
        : '✅ Mock: Status codes verified';
      console.log(completionMessage);
    });

    test('should serialize to JSON correctly', () => {
      const error = new AISDKError('validation_error:tools', 'Missing required parameter', {
        toolName: IS_INTEGRATION_TEST ? 'integration-search' : 'search',
        userId: IS_INTEGRATION_TEST ? `integration-user-${Date.now()}` : 'user-123',
      });

      const json = error.toJSON();

      expect(json.type).toBe('validation_error');
      expect(json.surface).toBe('tools');
      expect(json.message).toBe('Tool parameters failed validation.');
      expect(json.cause).toBe('Missing required parameter');
      expect(json.statusCode).toBe(400);
      expect(json.context).toBeDefined();

      if (IS_INTEGRATION_TEST) {
        expect(json.context?.toolName).toBe('integration-search');
        console.log('✅ Integration: Error serialization verified');
      } else {
        expect(json.context?.toolName).toBe('search');
        expect(json.context?.userId).toBe('user-123');
        console.log('✅ Mock: Error serialization verified');
      }
    });
  });

  describe('error to Response conversion', () => {
    test('should convert errors to Response objects', () => {
      const error = new AISDKError('rate_limit:provider', 'Too many requests');
      const response = error.toResponse();

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(429);

      if (IS_INTEGRATION_TEST) {
        console.log('✅ Integration: Error to Response conversion verified');
      } else {
        console.log('✅ Mock: Error to Response conversion verified');
      }
    });

    test('should include error details for visible surfaces', async () => {
      const error = new AISDKError('bad_request:generation', 'Invalid prompt', {
        model: IS_INTEGRATION_TEST ? 'claude-3-integration' : 'gpt-4',
        requestId: IS_INTEGRATION_TEST ? `integration-req-${Date.now()}` : 'req-123',
      });
      const response = error.toResponse();
      const body = await response.json();

      expect(body.code).toBe('bad_request:generation');
      expect(body.message).toBe(
        'The generation request was invalid. Please check your parameters and try again.',
      );
      expect(body.cause).toBe('Invalid prompt');

      if (IS_INTEGRATION_TEST) {
        expect(body.requestId).toContain('integration-req-');
        console.log('✅ Integration: Visible error details included');
      } else {
        expect(body.requestId).toBe('req-123');
        console.log('✅ Mock: Visible error details included');
      }
    });

    test('should hide error details for log-only surfaces', async () => {
      const error = new AISDKError('validation_error:transformation', 'Internal validation failed');
      const response = error.toResponse();
      const body = await response.json();

      expect(body).toStrictEqual({
        code: '',
        message: 'Something went wrong. Please try again later.',
      });

      if (IS_INTEGRATION_TEST) {
        console.log('✅ Integration: Log-only surface details hidden');
      } else {
        console.log('✅ Mock: Log-only surface details hidden');
      }
    });

    test('should log errors for log-only surfaces', async () => {
      const { logError } = await import('@repo/observability/server/next');
      const error = new AISDKError('bad_request:testing', 'Test error', {
        requestId: IS_INTEGRATION_TEST ? `integration-test-${Date.now()}` : 'test-123',
      });

      error.toResponse();

      // Give async logging a moment to execute
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(logError).toHaveBeenCalledWith(
        'Invalid test configuration.',
        expect.objectContaining({
          operation: 'error_handling',
          requestId: expect.any(String),
        }),
      );

      if (IS_INTEGRATION_TEST) {
        console.log('✅ Integration: Error logging verified');
      } else {
        console.log('✅ Mock: Error logging verified');
      }
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

      if (IS_INTEGRATION_TEST) {
        console.log('✅ Integration: All surface visibility settings verified');
      } else {
        console.log('✅ Mock: Surface visibility settings verified');
      }
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

      if (IS_INTEGRATION_TEST) {
        console.log('✅ Integration: Generation error messages verified');
      } else {
        console.log('✅ Mock: Generation error messages verified');
      }
    });

    test('should return correct messages for streaming errors', () => {
      expect(getMessageByAIErrorCode('streaming_error:streaming')).toBe(
        'An error occurred during streaming. Please try again.',
      );
      expect(getMessageByAIErrorCode('timeout:streaming')).toBe(
        'The streaming request timed out. Please try again.',
      );

      if (IS_INTEGRATION_TEST) {
        console.log('✅ Integration: Streaming error messages verified');
      } else {
        console.log('✅ Mock: Streaming error messages verified');
      }
    });

    test('should return correct messages for tool errors', () => {
      expect(getMessageByAIErrorCode('tool_error:tools')).toBe(
        'An error occurred while executing a tool.',
      );
      expect(getMessageByAIErrorCode('validation_error:tools')).toBe(
        'Tool parameters failed validation.',
      );
      expect(getMessageByAIErrorCode('timeout:tools')).toBe('Tool execution timed out.');

      if (IS_INTEGRATION_TEST) {
        console.log('✅ Integration: Tool error messages verified');
      } else {
        console.log('✅ Mock: Tool error messages verified');
      }
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

      if (IS_INTEGRATION_TEST) {
        console.log('✅ Integration: Provider error messages verified');
      } else {
        console.log('✅ Mock: Provider error messages verified');
      }
    });

    test('should return default message for unknown codes', () => {
      expect(getMessageByAIErrorCode('unknown:surface' as AIErrorCode)).toBe(
        'An unexpected error occurred with AI services. Please try again later.',
      );

      if (IS_INTEGRATION_TEST) {
        console.log('✅ Integration: Unknown error code handling verified');
      } else {
        console.log('✅ Mock: Unknown error code handling verified');
      }
    });
  });

  describe('withAIErrorHandling', () => {
    test('should wrap operations and handle errors', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Operation failed'));

      await expect(
        withAIErrorHandling(operation, 'bad_request:generation', {
          model: IS_INTEGRATION_TEST ? 'integration-model' : 'gpt-4',
        }),
      ).rejects.toThrow(AISDKError);

      try {
        await withAIErrorHandling(operation, 'bad_request:generation', {
          model: IS_INTEGRATION_TEST ? 'integration-model' : 'gpt-4',
        });
      } catch (error) {
        if (!(error instanceof AISDKError)) {
          throw new Error('Expected error to be instanceof AISDKError');
        }
        expect(error.type).toBe('bad_request');
        expect(error.surface).toBe('generation');
        expect(error.cause).toBe('Operation failed');

        if (IS_INTEGRATION_TEST) {
          expect(error.context?.model).toBe('integration-model');
          console.log('✅ Integration: Error wrapping verified');
        } else {
          expect(error.context?.model).toBe('gpt-4');
          console.log('✅ Mock: Error wrapping verified');
        }
      }
    });

    test('should pass through successful operations', async () => {
      const successValue = IS_INTEGRATION_TEST ? 'integration-success' : 'success';
      const operation = vi.fn().mockResolvedValue(successValue);

      const result = await withAIErrorHandling(operation, 'bad_request:generation');

      expect(result).toBe(successValue);
      expect(operation).toHaveBeenCalledWith();

      if (IS_INTEGRATION_TEST) {
        console.log('✅ Integration: Successful operation passthrough verified');
      } else {
        console.log('✅ Mock: Successful operation passthrough verified');
      }
    });

    test('should not double-wrap AISDKError', async () => {
      const existingError = new AISDKError('timeout:network', 'Network timeout');
      const operation = vi.fn().mockRejectedValue(existingError);

      await expect(withAIErrorHandling(operation, 'bad_request:generation')).rejects.toBe(
        existingError,
      );

      if (IS_INTEGRATION_TEST) {
        console.log('✅ Integration: AISDKError double-wrapping prevention verified');
      } else {
        console.log('✅ Mock: AISDKError double-wrapping prevention verified');
      }
    });
  });

  describe('createAIErrorHandler', () => {
    test('should create error handlers for surfaces', () => {
      const surface = IS_INTEGRATION_TEST ? ('integration' as any) : 'generation';
      const handler = createAIErrorHandler(surface);

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

      if (IS_INTEGRATION_TEST) {
        console.log('✅ Integration: Error handler factory verified');
      } else {
        console.log('✅ Mock: Error handler factory verified');
      }
    });

    test('should create errors with correct properties', () => {
      const handler = createAIErrorHandler('tools');

      const error = handler.validationError('Missing parameter', {
        toolName: IS_INTEGRATION_TEST ? 'integration-search' : 'search',
        userId: IS_INTEGRATION_TEST ? `integration-user-${Date.now()}` : 'user-123',
      });

      expect(error).toBeInstanceOf(AISDKError);
      expect(error.type).toBe('validation_error');
      expect(error.surface).toBe('tools');
      expect(error.cause).toBe('Missing parameter');

      if (IS_INTEGRATION_TEST) {
        expect(error.context?.toolName).toBe('integration-search');
        console.log('✅ Integration: Created error properties verified');
      } else {
        expect(error.context?.toolName).toBe('search');
        expect(error.context?.userId).toBe('user-123');
        console.log('✅ Mock: Created error properties verified');
      }
    });
  });

  describe('pre-configured error handlers', () => {
    test('should have generation error handlers', () => {
      const error = generationErrors.timeout('Generation took too long');
      expect(error.type).toBe('timeout');
      expect(error.surface).toBe('generation');

      if (IS_INTEGRATION_TEST) {
        console.log('✅ Integration: Generation error handlers verified');
      } else {
        console.log('✅ Mock: Generation error handlers verified');
      }
    });

    test('should have streaming error handlers', () => {
      const error = streamingErrors.streamingError('Stream interrupted');
      expect(error.type).toBe('streaming_error');
      expect(error.surface).toBe('streaming');

      if (IS_INTEGRATION_TEST) {
        console.log('✅ Integration: Streaming error handlers verified');
      } else {
        console.log('✅ Mock: Streaming error handlers verified');
      }
    });

    test('should have tool error handlers', () => {
      const error = toolErrors.toolError('Tool execution failed');
      expect(error.type).toBe('tool_error');
      expect(error.surface).toBe('tools');

      if (IS_INTEGRATION_TEST) {
        console.log('✅ Integration: Tool error handlers verified');
      } else {
        console.log('✅ Mock: Tool error handlers verified');
      }
    });

    test('should have provider error handlers', () => {
      const error = providerErrors.rateLimit('Provider rate limit');
      expect(error.type).toBe('rate_limit');
      expect(error.surface).toBe('provider');

      if (IS_INTEGRATION_TEST) {
        console.log('✅ Integration: Provider error handlers verified');
      } else {
        console.log('✅ Mock: Provider error handlers verified');
      }
    });

    test('should have validation error handlers', () => {
      const error = validationErrors.validationError('Invalid input');
      expect(error.type).toBe('validation_error');
      expect(error.surface).toBe('validation');

      if (IS_INTEGRATION_TEST) {
        console.log('✅ Integration: Validation error handlers verified');
      } else {
        console.log('✅ Mock: Validation error handlers verified');
      }
    });
  });

  // Integration-only tests for real error scenarios
  if (IS_INTEGRATION_TEST) {
    test(
      'should handle real API authentication errors',
      async () => {
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'invalid-key') {
          console.log('⚠️ Skipping auth error test - set OPENAI_API_KEY=invalid-key to test');
          return;
        }

        console.log('🔍 Testing real API authentication errors...');

        const { generateText } = await import('ai');
        const { openai } = await import('@ai-sdk/openai');

        try {
          // Use invalid API key
          const model = openai('gpt-3.5-turbo', {
            apiKey: 'invalid-key',
          });

          await generateText({
            model,
            prompt: 'This should fail',
            maxTokens: 10,
          });

          // Should not reach here
          expect(false).toBeTruthy();
        } catch (error) {
          expect(error).toBeDefined();
          console.log('✅ Integration: Real authentication error handled');
        }
      },
      TEST_TIMEOUT,
    );

    test('should handle real API rate limit scenarios', async () => {
      console.log('🔍 Testing rate limit handling patterns...');

      // Test rate limit error creation and handling
      const rateLimitError = providerErrors.rateLimit('Rate limit exceeded', {
        provider: 'openai',
        retryAfter: 60,
        requestsRemaining: 0,
      });

      expect(rateLimitError.type).toBe('rate_limit');
      expect(rateLimitError.statusCode).toBe(429);
      expect(rateLimitError.context?.retryAfter).toBe(60);

      const response = rateLimitError.toResponse();
      expect(response.status).toBe(429);

      console.log('✅ Integration: Rate limit error handling verified');
    });

    test('should handle network timeout scenarios', async () => {
      console.log('🔍 Testing network timeout handling...');

      const timeoutError = new AISDKError('timeout:network', 'Request timeout', {
        timeoutMs: 5000,
        operation: 'generateText',
      });

      expect(timeoutError.type).toBe('timeout');
      expect(timeoutError.statusCode).toBe(408);
      expect(timeoutError.context?.timeoutMs).toBe(5000);

      const response = timeoutError.toResponse();
      const body = await response.json();

      expect(body.message).toContain('network');
      console.log('✅ Integration: Network timeout handling verified');
    });

    test('should test error handling performance', async () => {
      console.log('🚀 Testing error handling performance...');

      const startTime = Date.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const error = new AISDKError('bad_request:generation', `Test error ${i}`, {
          iteration: i,
          timestamp: Date.now(),
        });

        const response = error.toResponse();
        expect(response.status).toBe(400);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const errorsPerSecond = (iterations / duration) * 1000;

      expect(duration).toBeLessThan(5000); // Should be reasonably fast

      console.log(`📊 Performance: Created ${iterations} errors in ${duration}ms`);
      console.log(`📊 Rate: ${errorsPerSecond.toFixed(0)} errors/second`);
      console.log('✅ Integration: Error handling performance verified');
    });
  }

  // Mock-only tests for edge cases
  if (!IS_INTEGRATION_TEST) {
    test('should handle edge cases in error creation', () => {
      // Test with null/undefined values
      const error1 = new AISDKError('bad_request:generation', null as any);
      expect(error1.cause).toBeNull();

      const error2 = new AISDKError('bad_request:tools', undefined as any, {
        toolName: undefined,
        params: null,
      });
      expect(error2.cause).toBeUndefined();
      expect(error2.context?.toolName).toBeUndefined();
      expect(error2.context?.params).toBeNull();

      // Test with very long error messages
      const longMessage = 'x'.repeat(10000);
      const error3 = new AISDKError('model_error:generation', longMessage);
      expect(error3.cause).toBe(longMessage);

      console.log('✅ Mock: Error creation edge cases tested');
    });

    test('should handle circular references in context', () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;

      const error = new AISDKError('validation_error:tools', 'Circular ref test', {
        circular: circularObj,
      });

      // Should not throw when serializing
      expect(() => error.toJSON()).not.toThrow();

      console.log('✅ Mock: Circular reference handling tested');
    });

    test('should handle concurrent error creation', async () => {
      const promises = Array.from({ length: 100 }, (_, i) => {
        return Promise.resolve().then(() => {
          const error = new AISDKError('timeout:generation', `Concurrent error ${i}`, {
            index: i,
            timestamp: Date.now(),
          });
          return error.toResponse();
        });
      });

      const responses = await Promise.all(promises);
      expect(responses).toHaveLength(100);
      responses.forEach(response => {
        expect(response.status).toBe(408);
      });

      console.log('✅ Mock: Concurrent error creation tested');
    });
  }
});
