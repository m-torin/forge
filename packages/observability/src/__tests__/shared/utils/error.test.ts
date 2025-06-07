import { describe, expect, it } from 'vitest';

import {
  createError,
  ErrorCode,
  getErrorMessage,
  getErrorStack,
  isError,
  normalizeError,
} from '../../../shared/utils/error';

describe('Error Utilities', () => {
  describe('createError', () => {
    it('should create error with message and code', () => {
      const error = createError('Test error', ErrorCode.INTERNAL_ERROR);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
    });

    it('should create error with custom code', () => {
      const error = createError('Custom error', 'CUSTOM_CODE' as ErrorCode);

      expect(error.code).toBe('CUSTOM_CODE');
    });

    it('should create error with metadata', () => {
      const error = createError('Error with data', ErrorCode.VALIDATION_ERROR, {
        field: 'email',
        value: 'invalid',
      });

      expect(error.data).toEqual({
        field: 'email',
        value: 'invalid',
      });
    });

    it('should have stack trace', () => {
      const error = createError('Stack test', ErrorCode.INTERNAL_ERROR);

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('Stack test');
    });
  });

  describe('isError', () => {
    it('should return true for Error instances', () => {
      expect(isError(new Error('Test'))).toBe(true);
      expect(isError(new TypeError('Test'))).toBe(true);
      expect(isError(new RangeError('Test'))).toBe(true);
    });

    it('should return true for error-like objects', () => {
      const errorLike = {
        name: 'CustomError',
        message: 'Custom error message',
        stack: 'Error: Custom error message\n    at test.js:1',
      };

      expect(isError(errorLike)).toBe(true);
    });

    it('should return false for non-error objects', () => {
      expect(isError(null)).toBe(false);
      expect(isError(undefined)).toBe(false);
      expect(isError('string')).toBe(false);
      expect(isError(123)).toBe(false);
      expect(isError({})).toBe(false);
      expect(isError({ message: 'Not an error' })).toBe(false);
      expect(isError({ name: 'NotError' })).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should get message from Error instance', () => {
      const error = new Error('Test error message');
      expect(getErrorMessage(error)).toBe('Test error message');
    });

    it('should get message from error-like object', () => {
      const errorLike = { message: 'Custom message' };
      expect(getErrorMessage(errorLike)).toBe('Custom message');
    });

    it('should convert string to message', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should convert number to message', () => {
      expect(getErrorMessage(404)).toBe('404');
    });

    it('should handle null and undefined', () => {
      expect(getErrorMessage(null)).toBe('Unknown error');
      expect(getErrorMessage(undefined)).toBe('Unknown error');
    });

    it('should stringify objects', () => {
      const obj = { code: 'ERROR', details: 'Something went wrong' };
      expect(getErrorMessage(obj)).toBe(JSON.stringify(obj));
    });

    it('should handle circular references', () => {
      const circular: any = { prop: 'value' };
      circular.self = circular;

      expect(getErrorMessage(circular)).toBe('[object Object]');
    });
  });

  describe('getErrorStack', () => {
    it('should get stack from Error instance', () => {
      const error = new Error('Test');
      expect(getErrorStack(error)).toBe(error.stack);
    });

    it('should get stack from error-like object', () => {
      const errorLike = {
        stack: 'Error: Test\n    at function (file.js:10:5)',
      };
      expect(getErrorStack(errorLike)).toBe(errorLike.stack);
    });

    it('should return undefined for non-error objects', () => {
      expect(getErrorStack('string')).toBeUndefined();
      expect(getErrorStack(123)).toBeUndefined();
      expect(getErrorStack({})).toBeUndefined();
      expect(getErrorStack(null)).toBeUndefined();
    });
  });

  describe('normalizeError', () => {
    it('should normalize Error instance', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1';

      const normalized = normalizeError(error);

      expect(normalized).toEqual({
        name: 'Error',
        message: 'Test error',
        stack: error.stack,
      });
    });

    it('should normalize custom error with code', () => {
      const error = createError('Custom error', ErrorCode.VALIDATION_ERROR, {
        field: 'email',
      });

      const normalized = normalizeError(error);

      expect(normalized).toEqual({
        name: 'Error',
        code: ErrorCode.VALIDATION_ERROR,
        data: { field: 'email' },
        message: 'Custom error',
        stack: expect.any(String),
      });
    });

    it('should normalize error-like object', () => {
      const errorLike = {
        name: 'CustomError',
        code: 'CUSTOM_CODE',
        extra: 'data',
        message: 'Custom message',
      };

      const normalized = normalizeError(errorLike);

      expect(normalized).toEqual({
        name: 'CustomError',
        code: 'CUSTOM_CODE',
        extra: 'data',
        message: 'Custom message',
      });
    });

    it('should normalize string error', () => {
      const normalized = normalizeError('String error');

      expect(normalized).toEqual({
        name: 'Error',
        message: 'String error',
      });
    });

    it('should normalize number error', () => {
      const normalized = normalizeError(500);

      expect(normalized).toEqual({
        name: 'Error',
        message: '500',
      });
    });

    it('should normalize object error', () => {
      const obj = { code: 'FAIL', error: 'Something failed' };
      const normalized = normalizeError(obj);

      expect(normalized).toEqual({
        name: 'Error',
        message: JSON.stringify(obj),
        ...obj,
      });
    });

    it('should handle null and undefined', () => {
      expect(normalizeError(null)).toEqual({
        name: 'Error',
        message: 'Unknown error',
      });

      expect(normalizeError(undefined)).toEqual({
        name: 'Error',
        message: 'Unknown error',
      });
    });
  });

  describe('ErrorCode enum', () => {
    it('should have all expected error codes', () => {
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
