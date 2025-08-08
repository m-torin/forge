/**
 * Tests for shared error utilities
 */

import { describe, expect } from 'vitest';

describe('error utilities', () => {
  describe('getErrorMessage', () => {
    test('should extract message from Error instance', async () => {
      const errorsModule = await import('../../src/shared/utils/errors');

      const error = new Error('Test error message');
      const message = errorsModule.getErrorMessage(error);

      expect(message).toBe('Test error message');
    });

    test('should return default message for non-Error values', async () => {
      const errorsModule = await import('../../src/shared/utils/errors');

      const message = errorsModule.getErrorMessage('string error');

      expect(message).toBe('An error occurred');
    });

    test('should return custom default message', async () => {
      const errorsModule = await import('../../src/shared/utils/errors');

      const customDefault = 'Custom default message';
      const message = errorsModule.getErrorMessage(null, customDefault);

      expect(message).toBe(customDefault);
    });

    test('should handle undefined error', async () => {
      const errorsModule = await import('../../src/shared/utils/errors');

      const message = errorsModule.getErrorMessage(undefined);

      expect(message).toBe('An error occurred');
    });

    test('should handle object that is not Error', async () => {
      const errorsModule = await import('../../src/shared/utils/errors');

      const message = errorsModule.getErrorMessage({ notAnError: true });

      expect(message).toBe('An error occurred');
    });

    test('should handle number error', async () => {
      const errorsModule = await import('../../src/shared/utils/errors');

      const message = errorsModule.getErrorMessage(404);

      expect(message).toBe('An error occurred');
    });
  });

  describe('createErrorResponse', () => {
    test('should create error response with Error instance', async () => {
      const errorsModule = await import('../../src/shared/utils/errors');

      const error = new Error('Test error');
      const response = errorsModule.createErrorResponse(error);

      expect(response).toStrictEqual({
        success: false,
        data: null,
        error: 'Test error',
      });
    });

    test('should create error response with non-Error value', async () => {
      const errorsModule = await import('../../src/shared/utils/errors');

      const response = errorsModule.createErrorResponse('string error');

      expect(response).toStrictEqual({
        success: false,
        data: null,
        error: 'Operation failed',
      });
    });

    test('should create error response with custom default message', async () => {
      const errorsModule = await import('../../src/shared/utils/errors');

      const customDefault = 'Custom operation failed';
      const response = errorsModule.createErrorResponse(null, customDefault);

      expect(response).toStrictEqual({
        success: false,
        data: null,
        error: customDefault,
      });
    });

    test('should handle typed error response', async () => {
      const errorsModule = await import('../../src/shared/utils/errors');

      interface UserData {
        id: string;
        name: string;
      }

      const error = new Error('User not found');
      const response = errorsModule.createErrorResponse<UserData>(error);

      expect(response).toStrictEqual({
        success: false,
        data: null,
        error: 'User not found',
      });

      // Type assertion to verify TypeScript types
      expect(response.success).toBeFalsy();
      expect(response.data).toBeNull();
    });

    test('should create error response with undefined error', async () => {
      const errorsModule = await import('../../src/shared/utils/errors');

      const response = errorsModule.createErrorResponse(undefined);

      expect(response).toStrictEqual({
        success: false,
        data: null,
        error: 'Operation failed',
      });
    });
  });

  describe('createSuccessResponse', () => {
    test('should create success response with data', async () => {
      const errorsModule = await import('../../src/shared/utils/errors');

      const data = { id: '1', name: 'Test User' };
      const response = errorsModule.createSuccessResponse(data);

      expect(response).toStrictEqual({
        success: true,
        data: { id: '1', name: 'Test User' },
        error: undefined,
      });
    });

    test('should create success response with null data', async () => {
      const errorsModule = await import('../../src/shared/utils/errors');

      const response = errorsModule.createSuccessResponse(null);

      expect(response).toStrictEqual({
        success: true,
        data: null,
        error: undefined,
      });
    });

    test('should create success response with string data', async () => {
      const errorsModule = await import('../../src/shared/utils/errors');

      const response = errorsModule.createSuccessResponse('success message');

      expect(response).toStrictEqual({
        success: true,
        data: 'success message',
        error: undefined,
      });
    });

    test('should create success response with array data', async () => {
      const errorsModule = await import('../../src/shared/utils/errors');

      const data = [{ id: 1 }, { id: 2 }];
      const response = errorsModule.createSuccessResponse(data);

      expect(response).toStrictEqual({
        success: true,
        data: [{ id: 1 }, { id: 2 }],
        error: undefined,
      });
    });

    test('should create success response with boolean data', async () => {
      const errorsModule = await import('../../src/shared/utils/errors');

      const response = errorsModule.createSuccessResponse(true);

      expect(response).toStrictEqual({
        success: true,
        data: true,
        error: undefined,
      });
    });

    test('should preserve type information', async () => {
      const errorsModule = await import('../../src/shared/utils/errors');

      interface ApiResponse {
        users: Array<{ id: string; name: string }>;
        total: number;
      }

      const data: ApiResponse = {
        users: [{ id: '1', name: 'John' }],
        total: 1,
      };

      const response = errorsModule.createSuccessResponse(data);

      expect(response.success).toBeTruthy();
      expect(response.data.users).toHaveLength(1);
      expect(response.data.total).toBe(1);
      expect(response.error).toBeUndefined();
    });
  });
});
