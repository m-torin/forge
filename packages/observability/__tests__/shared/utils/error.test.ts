import { ObservabilityManager } from '@/shared/types/types';
import {
  ErrorCode,
  createError,
  createErrorBoundaryHandler,
  createSafeFunction,
  getErrorMessage,
  getErrorStack,
  isError,
  normalizeError,
  parseAndCaptureError,
  parseError,
  withErrorHandling,
} from '@/shared/utils/error';
import { beforeEach, describe, expect, vi } from 'vitest';

// Mock observability manager
const mockObservabilityManager: ObservabilityManager = {
  addBreadcrumb: vi.fn(),
  captureException: vi.fn().mockResolvedValue(undefined),
  captureMessage: vi.fn().mockResolvedValue(undefined),
  endSession: vi.fn(),
  initialize: vi.fn().mockResolvedValue(undefined),
  log: vi.fn().mockResolvedValue(undefined),
  setContext: vi.fn(),
  setExtra: vi.fn(),
  setTag: vi.fn(),
  setUser: vi.fn(),
  startSession: vi.fn(),
  startSpan: vi.fn(),
  startTransaction: vi.fn(),
};

describe('error utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('errorCode enum', () => {
    test('should contain all expected error codes', () => {
      expect(ErrorCode.CONFIGURATION_ERROR).toBe('CONFIGURATION_ERROR');
      expect(ErrorCode.FORBIDDEN).toBe('FORBIDDEN');
      expect(ErrorCode.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
      expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND');
      expect(ErrorCode.PROVIDER_ERROR).toBe('PROVIDER_ERROR');
      expect(ErrorCode.RATE_LIMITED).toBe('RATE_LIMITED');
      expect(ErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED');
      expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    });
  });

  describe('createError', () => {
    test('should create an error with code', () => {
      const error = createError('Test error', ErrorCode.VALIDATION_ERROR);

      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.data).toBeUndefined();
      expect(error).toBeInstanceOf(Error);
    });

    test('should create an error with code and data', () => {
      const data = { field: 'email', value: 'invalid' };
      const error = createError('Validation failed', ErrorCode.VALIDATION_ERROR, data);

      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.data).toStrictEqual(data);
    });

    test('should create an error with custom string code', () => {
      const error = createError('Custom error', 'CUSTOM_CODE');

      expect(error.message).toBe('Custom error');
      expect(error.code).toBe('CUSTOM_CODE');
    });
  });

  describe('createErrorBoundaryHandler', () => {
    test('should create a handler that captures exceptions', () => {
      const handler = createErrorBoundaryHandler(mockObservabilityManager);
      const error = new Error('Component error');
      const errorInfo = { componentStack: 'at Component\n  at App' };

      handler(error, errorInfo);

      expect(mockObservabilityManager.captureException).toHaveBeenCalledWith(error, {
        extra: {
          componentStack: 'at Component\n  at App',
          errorBoundary: true,
        },
        tags: {
          source: 'error_boundary',
        },
      });
    });

    test('should handle error info without component stack', () => {
      const handler = createErrorBoundaryHandler(mockObservabilityManager);
      const error = new Error('Component error');
      const errorInfo = {};

      handler(error, errorInfo);

      expect(mockObservabilityManager.captureException).toHaveBeenCalledWith(error, {
        extra: {
          errorBoundary: true,
        },
        tags: {
          source: 'error_boundary',
        },
      });
    });
  });

  describe('parseError (alias for getErrorMessage)', () => {
    test('should parse Error objects', () => {
      const error = new Error('Test error');
      const message = parseError(error);

      expect(message).toBe('Test error');
    });

    test('should handle string errors', () => {
      const message = parseError('String error');

      expect(message).toBe('String error');
    });

    test('should handle null/undefined errors', () => {
      const parsedNull = parseError(null);
      const parsedUndefined = parseError(undefined);

      expect(parsedNull).toBe('Unknown error');
      expect(parsedUndefined).toBe('Unknown error');
    });
  });

  describe('getErrorMessage', () => {
    test('should get message from Error objects', () => {
      const error = new Error('Test error');
      const message = getErrorMessage(error);

      expect(message).toBe('Test error');
    });

    test('should handle string inputs', () => {
      const message = getErrorMessage('String error');

      expect(message).toBe('String error');
    });

    test('should handle number inputs', () => {
      const message = getErrorMessage(404);

      expect(message).toBe('404');
    });

    test('should handle object with message property', () => {
      const errorObj = { message: 'Object error' };
      const message = getErrorMessage(errorObj);

      expect(message).toBe('Object error');
    });

    test('should handle null/undefined', () => {
      expect(getErrorMessage(null)).toBe('Unknown error');
      expect(getErrorMessage(undefined)).toBe('Unknown error');
    });

    test('should stringify objects without message', () => {
      const obj = { code: 'ERROR', data: 'test' };
      const message = getErrorMessage(obj);

      expect(message).toContain('ERROR');
      expect(message).toContain('test');
    });
  });

  describe('getErrorStack', () => {
    test('should get stack from Error objects', () => {
      const error = new Error('Test error');
      const stack = getErrorStack(error);

      expect(stack).toBeDefined();
      expect(typeof stack).toBe('string');
      expect(stack).toContain('Test error');
    });

    test('should get stack from error-like objects', () => {
      const errorObj = { stack: 'Custom stack trace' };
      const stack = getErrorStack(errorObj);

      expect(stack).toBe('Custom stack trace');
    });

    test('should return undefined for non-error values', () => {
      expect(getErrorStack('string')).toBeUndefined();
      expect(getErrorStack(123)).toBeUndefined();
      expect(getErrorStack({})).toBeUndefined();
    });
  });

  describe('isError', () => {
    test('should identify Error instances', () => {
      const error = new Error('Test error');
      expect(isError(error)).toBeTruthy();
    });

    test('should identify error-like objects', () => {
      const errorLike = {
        name: 'CustomError',
        message: 'Test error',
        stack: 'Stack trace',
      };
      expect(isError(errorLike)).toBeTruthy();
    });

    test('should reject non-error values', () => {
      expect(isError('string')).toBeFalsy();
      expect(isError(123)).toBeFalsy();
      expect(isError({})).toBeFalsy();
      expect(isError({ message: 'test' })).toBeFalsy(); // missing name and stack
    });
  });

  describe('normalizeError', () => {
    test('should normalize Error objects', () => {
      const error = new Error('Test error');
      const normalized = normalizeError(error);

      expect(normalized.message).toBe('Test error');
      expect(normalized.name).toBe('Error');
      expect(normalized.stack).toBeDefined();
    });

    test('should normalize ExtendedError objects', () => {
      const error = createError('Extended error', ErrorCode.VALIDATION_ERROR, { field: 'email' });
      const normalized = normalizeError(error);

      expect(normalized.message).toBe('Extended error');
      expect(normalized.name).toBe('Error');
      expect(normalized.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(normalized.data).toStrictEqual({ field: 'email' });
    });

    test('should handle string inputs', () => {
      const normalized = normalizeError('String error');

      expect(normalized.message).toBe('String error');
      expect(normalized.name).toBe('Error');
    });

    test('should handle number inputs', () => {
      const normalized = normalizeError(404);

      expect(normalized.message).toBe('404');
      expect(normalized.name).toBe('Error');
    });

    test('should handle null/undefined', () => {
      const normalizedNull = normalizeError(null);
      const normalizedUndefined = normalizeError(undefined);

      expect(normalizedNull.message).toBe('Unknown error');
      expect(normalizedNull.name).toBe('Error');
      expect(normalizedUndefined.message).toBe('Unknown error');
      expect(normalizedUndefined.name).toBe('Error');
    });

    test('should handle object inputs', () => {
      const obj = { message: 'Object error', code: 'CUSTOM' };
      const normalized = normalizeError(obj);

      expect(normalized.message).toBe('Object error');
      expect(normalized.name).toBe('Error');
      expect(normalized.code).toBe('CUSTOM');
    });
  });

  describe('createSafeFunction', () => {
    test('should create a safe version of a function', () => {
      const dangerousFunction = vi.fn(() => {
        throw new Error('Function failed');
      });

      const safeFunction = createSafeFunction(dangerousFunction, mockObservabilityManager);
      const result = safeFunction();

      expect(result).toBeUndefined();
      expect(mockObservabilityManager.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          function: 'spy',
          safeFunction: true,
        }),
      );
    });

    test('should return fallback value on error', () => {
      const dangerousFunction = vi.fn((): string => {
        throw new Error('Function failed');
      });

      const safeFunction = createSafeFunction(
        dangerousFunction,
        mockObservabilityManager,
        'fallback',
      );
      const result = safeFunction();

      expect(result).toBe('fallback');
    });

    test('should return normal result on success', () => {
      const normalFunction = vi.fn(() => 'success');

      const safeFunction = createSafeFunction(normalFunction, mockObservabilityManager);
      const result = safeFunction();

      expect(result).toBe('success');
    });

    test('should handle async functions', async () => {
      const asyncFunction = vi.fn(async (): Promise<string> => {
        throw new Error('Async failed');
      });

      const safeFunction = createSafeFunction(
        asyncFunction,
        mockObservabilityManager,
        Promise.resolve('async fallback'),
      );
      const result = await safeFunction();

      expect(result).toBe('async fallback');
    });
  });

  describe('parseAndCaptureError', () => {
    test('should parse and capture errors', async () => {
      const error = new Error('Test error');
      const message = await parseAndCaptureError(error, mockObservabilityManager);

      expect(message).toBe('Test error');
      expect(mockObservabilityManager.captureException).toHaveBeenCalledWith(error, undefined);
      expect(mockObservabilityManager.log).toHaveBeenCalledWith(
        'error',
        'Parsing error: Test error',
        expect.objectContaining({
          originalError: error,
        }),
      );
    });

    test('should include context when provided', async () => {
      const error = new Error('Test error');
      const context = { function: 'testFunction' };

      await parseAndCaptureError(error, mockObservabilityManager, context);

      expect(mockObservabilityManager.captureException).toHaveBeenCalledWith(error, context);
      expect(mockObservabilityManager.log).toHaveBeenCalledWith(
        'error',
        'Parsing error: Test error',
        expect.objectContaining({
          originalError: error,
          function: 'testFunction',
        }),
      );
    });

    test('should handle non-Error values', async () => {
      const message = await parseAndCaptureError('String error', mockObservabilityManager);

      expect(message).toBe('String error');
      expect(mockObservabilityManager.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        undefined,
      );
    });
  });

  describe('withErrorHandling', () => {
    test('should wrap async functions with error handling', async () => {
      const asyncFunction = vi.fn(async () => {
        throw new Error('Async error');
      });

      const wrappedFunction = withErrorHandling(asyncFunction, mockObservabilityManager);

      await expect(wrappedFunction()).rejects.toThrow('Async error');
      expect(mockObservabilityManager.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          function: 'spy',
        }),
      );
      expect(mockObservabilityManager.log).toHaveBeenCalledWith(
        'error',
        expect.stringContaining('Parsing error:'),
        expect.objectContaining({
          function: 'spy',
        }),
      );
    });

    test('should pass through successful results', async () => {
      const asyncFunction = vi.fn(async () => 'success');

      const wrappedFunction = withErrorHandling(asyncFunction, mockObservabilityManager);
      const result = await wrappedFunction();

      expect(result).toBe('success');
      expect(mockObservabilityManager.captureException).not.toHaveBeenCalled();
      expect(mockObservabilityManager.log).not.toHaveBeenCalled();
    });

    test('should include context when provided', async () => {
      const asyncFunction = vi.fn(async () => {
        throw new Error('Async error');
      });
      const context = { component: 'TestComponent' };

      const wrappedFunction = withErrorHandling(asyncFunction, mockObservabilityManager, context);

      await expect(wrappedFunction()).rejects.toThrow('Async error');
      expect(mockObservabilityManager.log).toHaveBeenCalledWith(
        'error',
        expect.stringContaining('Async error'),
        expect.objectContaining({
          component: 'TestComponent',
        }),
      );
    });
  });
});
