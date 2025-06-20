import { describe, expect } from 'vitest';

import {
  createError,
  ErrorCode,
  getErrorMessage,
  getErrorStack,
  isError,
  normalizeError,
} from '../../../shared/utils/error';

describe('error Utilities', () => {
  describe('createError', () => {
    test('should create error with message and code', () => {
      const error = createError('Test error', ErrorCode.INTERNAL_ERROR);

      expect(error).toBeInstanceOf(Error);
      expect((error as Error)?.message || 'Unknown error').toBe('Test error');
      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
    });

    test('should create error with custom code', () => {
      const error = createError('Custom error', 'CUSTOM_CODE' as ErrorCode);

      expect(error.code).toBe('CUSTOM_CODE');
    });

    test('should create error with metadata', () => {
      const error = createError('Error with data', ErrorCode.VALIDATION_ERROR, {
        field: 'email',
        value: 'invalid',
      });

      expect(error.data).toStrictEqual({
        field: 'email',
        value: 'invalid',
      });
    });

    test('should have stack trace', () => {
      const error = createError('Stack test', ErrorCode.INTERNAL_ERROR);

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('Stack test');
    });
  });

  describe('isError', () => {
    test('should return true for Error instances', () => {
      expect(isError(new Error('Test'))).toBeTruthy();
      expect(isError(new TypeError('Test'))).toBeTruthy();
      expect(isError(new RangeError('Test'))).toBeTruthy();
    });

    test('should return true for error-like objects', () => {
      const errorLike = {
        name: 'CustomError',
        message: 'Custom error message',
        stack: 'Error: Custom error message\n    at test.js:1',
      };

      expect(isError(errorLike)).toBeTruthy();
    });

    test('should return false for non-error objects', () => {
      expect(isError(null)).toBeFalsy();
      expect(isError(undefined)).toBeFalsy();
      expect(isError('string')).toBeFalsy();
      expect(isError(123)).toBeFalsy();
      expect(isError({})).toBeFalsy();
      expect(isError({ message: 'Not an error' })).toBeFalsy();
      expect(isError({ name: 'NotError' })).toBeFalsy();
    });
  });

  describe('getErrorMessage', () => {
    test('should get message from Error instance', () => {
      const error = new Error('Test error message');
      expect(getErrorMessage(error)).toBe('Test error message');
    });

    test('should get message from error-like object', () => {
      const errorLike = { message: 'Custom message' };
      expect(getErrorMessage(errorLike)).toBe('Custom message');
    });

    test('should convert string to message', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    test('should convert number to message', () => {
      expect(getErrorMessage(404)).toBe('404');
    });

    test('should handle null and undefined', () => {
      expect(getErrorMessage(null)).toBe('Unknown error');
      expect(getErrorMessage(undefined)).toBe('Unknown error');
    });

    test('should stringify objects', () => {
      const obj = { code: 'ERROR', details: 'Something went wrong' };
      expect(getErrorMessage(obj)).toBe(JSON.stringify(obj));
    });

    test('should handle circular references', () => {
      const circular: any = { prop: 'value' };
      circular.self = circular;

      expect(getErrorMessage(circular)).toBe('[object Object]');
    });
  });

  describe('getErrorStack', () => {
    test('should get stack from Error instance', () => {
      const error = new Error('Test');
      expect(getErrorStack(error)).toBe(error.stack);
    });

    test('should get stack from error-like object', () => {
      const errorLike = {
        stack: 'Error: Test\n    at function (_: any)file.js:10:5)',
      };
      expect(getErrorStack(errorLike)).toBe(errorLike.stack);
    });

    test('should return undefined for non-error objects', () => {
      expect(getErrorStack('string')).toBeUndefined();
      expect(getErrorStack(123)).toBeUndefined();
      expect(getErrorStack({})).toBeUndefined();
      expect(getErrorStack(null)).toBeUndefined();
    });
  });

  describe('normalizeError', () => {
    test('should normalize Error instance', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1';

      const normalized = normalizeError(error);

      expect(normalized).toStrictEqual({
        name: 'Error',
        message: 'Test error',
        stack: error.stack,
      });
    });

    test('should normalize custom error with code', () => {
      const error = createError('Custom error', ErrorCode.VALIDATION_ERROR, {
        field: 'email',
      });

      const normalized = normalizeError(error);

      expect(normalized).toStrictEqual({
        name: 'Error',
        code: ErrorCode.VALIDATION_ERROR,
        data: { field: 'email' },
        message: 'Custom error',
        stack: expect.any(String),
      });
    });

    test('should normalize error-like object', () => {
      const errorLike = {
        name: 'CustomError',
        code: 'CUSTOM_CODE',
        extra: 'data',
        message: 'Custom message',
      };

      const normalized = normalizeError(errorLike);

      expect(normalized).toStrictEqual({
        name: 'CustomError',
        code: 'CUSTOM_CODE',
        extra: 'data',
        message: 'Custom message',
      });
    });

    test('should normalize string error', () => {
      const normalized = normalizeError('String error');

      expect(normalized).toStrictEqual({
        name: 'Error',
        message: 'String error',
      });
    });

    test('should normalize number error', () => {
      const normalized = normalizeError(500);

      expect(normalized).toStrictEqual({
        name: 'Error',
        message: '500',
      });
    });

    test('should normalize object error', () => {
      const obj = { code: 'FAIL', error: 'Something failed' };
      const normalized = normalizeError(obj);

      expect(normalized).toStrictEqual({
        name: 'Error',
        message: JSON.stringify(obj),
        ...obj,
      });
    });

    test('should handle null and undefined', () => {
      expect(normalizeError(null)).toStrictEqual({
        name: 'Error',
        message: 'Unknown error',
      });

      expect(normalizeError(undefined)).toStrictEqual({
        name: 'Error',
        message: 'Unknown error',
      });
    });
  });

  describe('errorCode enum', () => {
    test('should have all expected error codes', () => {
      expect(ErrorCode.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
      expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND');
      expect(ErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED');
      expect(ErrorCode.FORBIDDEN).toBe('FORBIDDEN');
      expect(ErrorCode.RATE_LIMITED).toBe('RATE_LIMITED');
      expect(ErrorCode.PROVIDER_ERROR).toBe('PROVIDER_ERROR');
      expect(ErrorCode.CONFIGURATION_ERROR).toBe('CONFIGURATION_ERROR');
    });
  });
});
