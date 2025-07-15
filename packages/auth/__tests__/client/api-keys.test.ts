/**
 * Tests for client API key functionality
 */

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, vi } from 'vitest';

// Mock logger
vi.mock('@/client/utils/logger', () => ({
  logger: {
    warn: vi.fn(),
  },
}));

// Mock server actions
const mockCreateApiKeyAction = vi.fn();
const mockListApiKeysAction = vi.fn();
const mockRevokeApiKeyAction = vi.fn();
const mockUpdateApiKeyAction = vi.fn();
const mockValidateApiKeyAction = vi.fn();

vi.mock('@/server/actions', () => ({
  createApiKeyAction: mockCreateApiKeyAction,
  listApiKeysAction: mockListApiKeysAction,
  revokeApiKeyAction: mockRevokeApiKeyAction,
  updateApiKeyAction: mockUpdateApiKeyAction,
  validateApiKeyAction: mockValidateApiKeyAction,
}));

// Mock shared utilities
vi.mock('@/shared/utils/api-keys', () => ({
  formatPermissionsForDisplay: vi.fn(),
  generateApiKeyName: vi.fn(),
  getTimeUntilExpiration: vi.fn(),
  groupPermissionsByResource: vi.fn(),
  isApiKeyExpired: vi.fn(),
  isValidApiKeyFormat: vi.fn(),
  maskApiKey: vi.fn(),
}));

describe('client API key functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset NODE_ENV
    process.env.NODE_ENV = 'test';
  });

  describe('helper functions', () => {
    describe('hasPermission', () => {
      test('should return true for any permission check', async () => {
        const apiKeysModule = await import('@/client/api-keys');

        const result = apiKeysModule.hasPermission({ resource: 'api-keys', action: 'read' });

        expect(result).toBeTruthy();
      });

      test('should always return true for client-side permission checks', async () => {
        const apiKeysModule = await import('@/client/api-keys');

        const result1 = apiKeysModule.hasPermission({ resource: 'api-keys', action: 'read' });
        const result2 = apiKeysModule.hasPermission({ resource: 'users', action: 'write' });

        expect(result1).toBeTruthy();
        expect(result2).toBeTruthy();
      });

      test('should handle different permission types', async () => {
        const apiKeysModule = await import('@/client/api-keys');

        const permissionTypes = [
          { resource: 'api-keys', action: 'read' },
          { resource: 'users', action: 'write' },
          { resource: 'admin', action: 'delete' },
        ];

        for (const permission of permissionTypes) {
          const result = apiKeysModule.hasPermission(permission);
          expect(result).toBeTruthy();
        }
      });
    });

    describe('createApiKeyHeaders', () => {
      test('should create proper API key headers', async () => {
        const apiKeysModule = await import('@/client/api-keys');

        const headers = apiKeysModule.createApiKeyHeaders('test-api-key');

        expect(headers).toStrictEqual({
          'x-api-key': 'test-api-key',
        });
      });

      test('should handle empty string', async () => {
        const apiKeysModule = await import('@/client/api-keys');

        const headers = apiKeysModule.createApiKeyHeaders('');

        expect(headers).toStrictEqual({
          'x-api-key': '',
        });
      });
    });

    describe('createBearerHeaders', () => {
      test('should create proper Bearer token headers', async () => {
        const apiKeysModule = await import('@/client/api-keys');

        const headers = apiKeysModule.createBearerHeaders('test-token');

        expect(headers).toStrictEqual({
          authorization: 'Bearer test-token',
        });
      });

      test('should handle empty token', async () => {
        const apiKeysModule = await import('@/client/api-keys');

        const headers = apiKeysModule.createBearerHeaders('');

        expect(headers).toStrictEqual({
          authorization: 'Bearer ',
        });
      });
    });
  });

  describe('useApiKeys hook', () => {
    const mockApiKeys = [
      { id: '1', name: 'Test Key 1', maskedKey: 'sk_test...1234' },
      { id: '2', name: 'Test Key 2', maskedKey: 'sk_test...5678' },
    ];

    beforeEach(() => {
      mockListApiKeysAction.mockResolvedValue({
        success: true,
        keys: mockApiKeys,
      });
    });

    test('should fetch API keys on mount', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      renderHook(() => apiKeysModule.useApiKeys());

      expect(mockListApiKeysAction).toHaveBeenCalledWith();
    });

    test('should provide initial state', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      const { result } = renderHook(() => apiKeysModule.useApiKeys());

      expect(result.current.keys).toStrictEqual([]);
      expect(result.current.loading).toBeTruthy(); // Initially loading is true due to fetchKeys being called
      expect(result.current.error).toBeNull();
      expect(typeof result.current.createKey).toBe('function');
      expect(typeof result.current.revokeKey).toBe('function');
      expect(typeof result.current.updateKey).toBe('function');
      expect(typeof result.current.fetchKeys).toBe('function');
    });

    test('should handle successful key fetching', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      const { result } = renderHook(() => apiKeysModule.useApiKeys());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.keys).toStrictEqual(mockApiKeys);
      expect(result.current.error).toBeNull();
    });

    test('should handle fetch errors', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      mockListApiKeysAction.mockResolvedValue({
        success: false,
        error: 'Fetch failed',
      });

      const { result } = renderHook(() => apiKeysModule.useApiKeys());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.error).toBe('Fetch failed');
    });

    test('should handle create key success', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      mockCreateApiKeyAction.mockResolvedValue({
        success: true,
        key: { id: '3', name: 'New Key' },
      });

      const { result } = renderHook(() => apiKeysModule.useApiKeys());

      await act(async () => {
        const createResult = await result.current.createKey({
          name: 'New Key',
          permissions: ['read'],
        });
        expect(createResult.success).toBeTruthy();
      });

      expect(mockCreateApiKeyAction).toHaveBeenCalledWith({
        name: 'New Key',
        permissions: ['read'],
        expiresAt: undefined,
      });
    });

    test('should handle create key with expiration date', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      mockCreateApiKeyAction.mockResolvedValue({
        success: true,
        key: { id: '3', name: 'New Key' },
      });

      const { result } = renderHook(() => apiKeysModule.useApiKeys());

      const expirationDate = new Date('2024-12-31');

      await act(async () => {
        await result.current.createKey({
          name: 'New Key',
          permissions: ['read'],
          expiresAt: expirationDate,
        });
      });

      expect(mockCreateApiKeyAction).toHaveBeenCalledWith({
        name: 'New Key',
        permissions: ['read'],
        expiresAt: expirationDate.toISOString(),
      });
    });

    test('should handle revoke key success', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      mockRevokeApiKeyAction.mockResolvedValue({ success: true });

      const { result } = renderHook(() => apiKeysModule.useApiKeys());

      // Wait for initial fetch
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        const revokeResult = await result.current.revokeKey('1');
        expect(revokeResult.success).toBeTruthy();
      });

      expect(result.current.keys).toStrictEqual([
        { id: '2', name: 'Test Key 2', maskedKey: 'sk_test...5678' },
      ]);
    });

    test('should handle update key success', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      mockUpdateApiKeyAction.mockResolvedValue({ success: true });

      const { result } = renderHook(() => apiKeysModule.useApiKeys());

      await act(async () => {
        const updateResult = await result.current.updateKey('1', { name: 'Updated Key' });
        expect(updateResult.success).toBeTruthy();
      });

      expect(mockUpdateApiKeyAction).toHaveBeenCalledWith({
        keyId: '1',
        name: 'Updated Key',
      });
    });

    test('should handle action errors gracefully', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      mockCreateApiKeyAction.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => apiKeysModule.useApiKeys());

      await act(async () => {
        const createResult = await result.current.createKey({
          name: 'New Key',
          permissions: ['read'],
        });
        expect(createResult.success).toBeFalsy();
        expect(createResult.error).toBe('Network error');
      });

      expect(result.current.error).toBe('Network error');
    });
  });

  describe('useCreateApiKey hook', () => {
    test('should provide initial state', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      const { result } = renderHook(() => apiKeysModule.useCreateApiKey());

      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
      expect(result.current.result).toBeNull();
      expect(typeof result.current.createKey).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });

    test('should handle successful key creation', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      const mockResult = {
        success: true,
        key: { id: '1', name: 'Test Key', maskedKey: 'sk_test...1234' },
      };

      mockCreateApiKeyAction.mockResolvedValue(mockResult);

      const { result } = renderHook(() => apiKeysModule.useCreateApiKey());

      await act(async () => {
        const createResult = await result.current.createKey({
          name: 'Test Key',
          permissions: ['read'],
        });
        expect(createResult).toStrictEqual(mockResult);
      });

      expect(result.current.result).toStrictEqual(mockResult);
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBeFalsy();
    });

    test('should handle creation errors', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      mockCreateApiKeyAction.mockResolvedValue({
        success: false,
        error: 'Creation failed',
      });

      const { result } = renderHook(() => apiKeysModule.useCreateApiKey());

      await act(async () => {
        await result.current.createKey({
          name: 'Test Key',
          permissions: ['read'],
        });
      });

      expect(result.current.error).toBe('Creation failed');
      expect(result.current.result?.success).toBeFalsy();
    });

    test('should reset state correctly', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      const { result } = renderHook(() => apiKeysModule.useCreateApiKey());

      // Set some state first
      await act(async () => {
        mockCreateApiKeyAction.mockResolvedValue({
          success: false,
          error: 'Test error',
        });
        await result.current.createKey({
          name: 'Test Key',
          permissions: ['read'],
        });
      });

      expect(result.current.error).toBe('Test error');

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
      expect(result.current.result).toBeNull();
    });

    test('should handle network errors', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      mockCreateApiKeyAction.mockRejectedValue(new Error('Network failed'));

      const { result } = renderHook(() => apiKeysModule.useCreateApiKey());

      await act(async () => {
        const createResult = await result.current.createKey({
          name: 'Test Key',
          permissions: ['read'],
        });
        expect(createResult.success).toBeFalsy();
        expect(createResult.error).toBe('Network failed');
      });

      expect(result.current.error).toBe('Network failed');
    });
  });

  describe('useApiKeyValidation hook', () => {
    test('should provide initial state', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      const { result } = renderHook(() => apiKeysModule.useApiKeyValidation());

      expect(result.current.validating).toBeFalsy();
      expect(result.current.validationResult).toBeNull();
      expect(typeof result.current.validateKey).toBe('function');
    });

    test('should handle successful validation', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      mockValidateApiKeyAction.mockResolvedValue({ success: true });

      const { result } = renderHook(() => apiKeysModule.useApiKeyValidation());

      await act(async () => {
        await result.current.validateKey('test-api-key');
      });

      expect(result.current.validationResult).toStrictEqual({ isValid: true });
      expect(result.current.validating).toBeFalsy();
    });

    test('should handle validation failure', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      mockValidateApiKeyAction.mockResolvedValue({
        success: false,
        error: 'Invalid key',
      });

      const { result } = renderHook(() => apiKeysModule.useApiKeyValidation());

      await act(async () => {
        await result.current.validateKey('invalid-key');
      });

      expect(result.current.validationResult).toStrictEqual({
        isValid: false,
        error: 'Invalid key',
      });
    });

    test('should handle validation errors', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      mockValidateApiKeyAction.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => apiKeysModule.useApiKeyValidation());

      await act(async () => {
        await result.current.validateKey('test-key');
      });

      expect(result.current.validationResult).toStrictEqual({
        isValid: false,
        error: 'Network error',
      });
    });

    test('should set validating state during validation', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      // Make the action hang to test loading state
      let resolveAction: (value: any) => void;
      const actionPromise = new Promise(resolve => {
        resolveAction = resolve;
      });
      mockValidateApiKeyAction.mockReturnValue(actionPromise);

      const { result } = renderHook(() => apiKeysModule.useApiKeyValidation());

      // Start validation
      act(() => {
        result.current.validateKey('test-key');
      });

      expect(result.current.validating).toBeTruthy();

      // Resolve the action
      await act(async () => {
        resolveAction!({ success: true });
        await actionPromise;
      });

      expect(result.current.validating).toBeFalsy();
    });
  });

  describe('re-exported utilities', () => {
    test('should re-export shared utilities', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      expect(apiKeysModule.formatPermissionsForDisplay).toBeDefined();
      expect(apiKeysModule.generateApiKeyName).toBeDefined();
      expect(apiKeysModule.getTimeUntilExpiration).toBeDefined();
      expect(apiKeysModule.groupPermissionsByResource).toBeDefined();
      expect(apiKeysModule.isApiKeyExpired).toBeDefined();
      expect(apiKeysModule.isValidApiKeyFormat).toBeDefined();
      expect(apiKeysModule.maskApiKey).toBeDefined();
    });
  });

  describe('edge cases', () => {
    test('should handle undefined dates correctly', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      mockCreateApiKeyAction.mockResolvedValue({ success: true });

      const { result } = renderHook(() => apiKeysModule.useApiKeys());

      await act(async () => {
        await result.current.createKey({
          name: 'Test Key',
          permissions: ['read'],
          expiresAt: undefined,
        });
      });

      expect(mockCreateApiKeyAction).toHaveBeenCalledWith({
        name: 'Test Key',
        permissions: ['read'],
        expiresAt: undefined,
      });
    });

    test('should handle empty key arrays', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      mockListApiKeysAction.mockResolvedValue({
        success: true,
        keys: [],
      });

      const { result } = renderHook(() => apiKeysModule.useApiKeys());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.keys).toStrictEqual([]);
    });

    test('should handle missing error messages', async () => {
      const apiKeysModule = await import('@/client/api-keys');

      mockCreateApiKeyAction.mockResolvedValue({
        success: false,
        // No error message
      });

      const { result } = renderHook(() => apiKeysModule.useCreateApiKey());

      await act(async () => {
        await result.current.createKey({
          name: 'Test Key',
          permissions: ['read'],
        });
      });

      expect(result.current.error).toBe('Failed to create API key');
    });
  });
});
