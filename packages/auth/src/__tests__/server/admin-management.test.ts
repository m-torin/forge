import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  banUser,
  deleteSession,
  deleteUser,
  impersonateUser,
  listApiKeys,
  listSessions,
  listUsers,
  unbanUser,
} from '../../server/admin-management';

// Mock the auth module using vi.hoisted
const { mockListApiKeys, mockSignOut } = vi.hoisted(() => {
  const mockListApiKeys = vi.fn();
  const mockSignOut = vi.fn();

  return { mockListApiKeys, mockSignOut };
});

vi.mock('../../server/auth', () => ({
  auth: {
    api: {
      listApiKeys: mockListApiKeys,
      signOut: mockSignOut,
    },
  },
}));

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

      const result = await listApiKeys();

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

      const result = await listApiKeys();

      expect(result).toEqual({
        error: 'API error',
        success: false,
      });
    });

    it('should handle exceptions', async () => {
      mockListApiKeys.mockRejectedValue(new Error('Network error'));

      const result = await listApiKeys();

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

      const result = await listApiKeys();

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

      const result = await deleteSession();

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

      const result = await deleteSession();

      expect(result).toEqual({
        error: 'Sign out failed',
        success: false,
      });
    });

    it('should throw error when sessionId is provided', async () => {
      const result = await deleteSession('session-123');

      expect(result).toEqual({
        error: 'Session deletion by ID not implemented yet - requires Better Auth admin features',
        success: false,
      });
    });

    it('should handle sign out exceptions', async () => {
      mockSignOut.mockRejectedValue(new Error('Network error'));

      const result = await deleteSession();

      expect(result).toEqual({
        error: 'Network error',
        success: false,
      });
    });
  });

  describe('deleteUser', () => {
    it('should return not implemented error', async () => {
      const result = await deleteUser('user-123');

      expect(result).toEqual({
        error: 'User deletion not implemented yet - requires Better Auth admin features',
        success: false,
      });
    });

    it('should handle missing userId', async () => {
      const result = await deleteUser();

      expect(result).toEqual({
        error: 'User deletion not implemented yet - requires Better Auth admin features',
        success: false,
      });
    });
  });

  describe('listUsers', () => {
    it('should return not implemented error', async () => {
      const result = await listUsers();

      expect(result).toEqual({
        error: 'User listing not implemented yet - requires Better Auth admin features',
        success: false,
      });
    });
  });

  describe('listSessions', () => {
    it('should return not implemented error', async () => {
      const result = await listSessions();

      expect(result).toEqual({
        error: 'Session listing not implemented yet - requires Better Auth admin features',
        success: false,
      });
    });
  });

  describe('impersonateUser', () => {
    it('should return not implemented error', async () => {
      const result = await impersonateUser('user-123');

      expect(result).toEqual({
        error: 'User impersonation not implemented yet - requires Better Auth admin features',
        success: false,
      });
    });
  });

  describe('banUser', () => {
    it('should return not implemented error with reason', async () => {
      const result = await banUser('user-123', 'Violating terms');

      expect(result).toEqual({
        error: 'User banning not implemented yet - requires Better Auth admin features',
        success: false,
      });
    });

    it('should return not implemented error without reason', async () => {
      const result = await banUser('user-123');

      expect(result).toEqual({
        error: 'User banning not implemented yet - requires Better Auth admin features',
        success: false,
      });
    });
  });

  describe('unbanUser', () => {
    it('should return not implemented error', async () => {
      const result = await unbanUser('user-123');

      expect(result).toEqual({
        error: 'User unbanning not implemented yet - requires Better Auth admin features',
        success: false,
      });
    });
  });
});
