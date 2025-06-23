import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the auth module using vi.hoisted
const { mockListApiKeys, mockSignOut } = vi.hoisted(() => {
  const mockListApiKeys = vi.fn();
  const mockSignOut = vi.fn();

  return { mockListApiKeys, mockSignOut };
});

vi.mock('../../src/shared/auth.config', () => ({
  auth: {
    api: {
      listApiKeys: mockListApiKeys,
      signOut: mockSignOut,
    },
  },
}));

// Import after mocking
import {
  deleteUserAction,
  deleteSessionAction,
  listApiKeysAction,
  getApiKeyAction,
} from '../../src/server/admin-management';

describe('Admin Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listApiKeys', () => {
    it('should return API keys successfully', async () => {
      const mockApiKeys = [
        { id: 'key-1', name: 'Test Key 1', createdAt: new Date() },
        { id: 'key-2', name: 'Test Key 2', createdAt: new Date() },
      ];

      mockListApiKeys.mockResolvedValue({
        apiKeys: mockApiKeys,
        success: true,
      });

      const result = await listApiKeysAction();

      expect(result).toEqual({
        data: mockApiKeys,
        success: true,
      });
      expect(mockListApiKeys).toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      mockListApiKeys.mockResolvedValue({
        error: { message: 'API error' },
        success: false,
      });

      const result = await listApiKeysAction();

      expect(result).toEqual({
        error: 'Failed to list API keys',
        success: false,
      });
    });

    it('should handle exceptions', async () => {
      mockListApiKeys.mockRejectedValue(new Error('Network error'));

      const result = await listApiKeysAction();

      expect(result).toEqual({
        error: 'Failed to list API keys',
        success: false,
      });
    });

    it('should return empty array when no API keys exist', async () => {
      mockListApiKeys.mockResolvedValue({
        apiKeys: undefined,
        success: true,
      });

      const result = await listApiKeysAction();

      expect(result).toEqual({
        data: [],
        success: true,
      });
    });
  });

  describe('deleteSession', () => {
    it('should delete current session when no sessionId provided', async () => {
      mockSignOut.mockResolvedValue({
        success: true,
      });

      const result = await deleteSessionAction();

      expect(result).toEqual({
        success: true,
      });
      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should handle sign out errors', async () => {
      mockSignOut.mockResolvedValue({
        error: { message: 'Sign out failed' },
        success: false,
      });

      const result = await deleteSessionAction();

      expect(result).toEqual({
        error: 'Sign out failed',
        success: false,
      });
    });

    it('should handle sign out exceptions', async () => {
      mockSignOut.mockRejectedValue(new Error('Network error'));

      const result = await deleteSessionAction();

      expect(result).toEqual({
        error: 'Network error',
        success: false,
      });
    });
  });

  describe('deleteUser', () => {
    it('should return not implemented error', async () => {
      const result = await deleteUserAction('user-123');

      expect(result).toEqual({
        error: 'Failed to delete user',
        success: false,
      });
    });

    it('should handle missing userId', async () => {
      const result = await deleteUserAction('');

      expect(result).toEqual({
        error: 'Failed to delete user',
        success: false,
      });
    });
  });
});
