/**
 * Tests for basic server actions
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Next.js headers
const mockHeaders = vi.fn();
vi.mock('next/headers', () => ({
  headers: mockHeaders,
}));

// Mock shared auth
const mockAuth = {
  api: {
    getSession: vi.fn(),
    signOut: vi.fn(),
  },
};
vi.mock('@/shared/auth', () => ({
  auth: mockAuth,
}));

describe('basic server actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue({});
  });

  describe('getSessionAction', () => {
    it('should return session data on success', async () => {
      const actionsModule = await import('@/server/actions/basic');

      const mockSession = {
        user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
        session: { id: 'session-1', activeOrganizationId: 'org-1' },
      };

      mockAuth.api.getSession.mockResolvedValue(mockSession);

      const result = await actionsModule.getSessionAction();

      expect(result).toEqual({
        data: mockSession,
        success: true,
      });
      expect(mockAuth.api.getSession).toHaveBeenCalledWith({
        headers: {},
      });
    });

    it('should return null data when no session', async () => {
      const actionsModule = await import('@/server/actions/basic');

      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await actionsModule.getSessionAction();

      expect(result).toEqual({
        data: null,
        success: true,
      });
    });

    it('should handle errors gracefully', async () => {
      const actionsModule = await import('@/server/actions/basic');

      const error = new Error('Session fetch failed');
      mockAuth.api.getSession.mockRejectedValue(error);

      const result = await actionsModule.getSessionAction();

      expect(result).toEqual({
        data: null,
        error: 'Session fetch failed',
        success: false,
      });
    });

    it('should handle non-Error exceptions', async () => {
      const actionsModule = await import('@/server/actions/basic');

      mockAuth.api.getSession.mockRejectedValue('String error');

      const result = await actionsModule.getSessionAction();

      expect(result).toEqual({
        data: null,
        error: 'Unknown error',
        success: false,
      });
    });

    it('should pass headers to getSession', async () => {
      const actionsModule = await import('@/server/actions/basic');

      const mockHeadersValue = { 'x-test': 'header' };
      mockHeaders.mockResolvedValue(mockHeadersValue);
      mockAuth.api.getSession.mockResolvedValue(null);

      await actionsModule.getSessionAction();

      expect(mockAuth.api.getSession).toHaveBeenCalledWith({
        headers: mockHeadersValue,
      });
    });
  });

  describe('deleteSessionAction', () => {
    it('should sign out successfully', async () => {
      const actionsModule = await import('@/server/actions/basic');

      mockAuth.api.signOut.mockResolvedValue(undefined);

      const result = await actionsModule.deleteSessionAction();

      expect(result).toEqual({
        data: { message: 'Signed out' },
        success: true,
      });
      expect(mockAuth.api.signOut).toHaveBeenCalledWith({
        headers: {},
      });
    });

    it('should handle sign out errors', async () => {
      const actionsModule = await import('@/server/actions/basic');

      const error = new Error('Sign out failed');
      mockAuth.api.signOut.mockRejectedValue(error);

      const result = await actionsModule.deleteSessionAction();

      expect(result).toEqual({
        data: null,
        error: 'Sign out failed',
        success: false,
      });
    });

    it('should handle non-Error exceptions in sign out', async () => {
      const actionsModule = await import('@/server/actions/basic');

      mockAuth.api.signOut.mockRejectedValue('String error');

      const result = await actionsModule.deleteSessionAction();

      expect(result).toEqual({
        data: null,
        error: 'Unknown error',
        success: false,
      });
    });

    it('should pass headers to signOut', async () => {
      const actionsModule = await import('@/server/actions/basic');

      const mockHeadersValue = { authorization: 'Bearer token' };
      mockHeaders.mockResolvedValue(mockHeadersValue);
      mockAuth.api.signOut.mockResolvedValue(undefined);

      await actionsModule.deleteSessionAction();

      expect(mockAuth.api.signOut).toHaveBeenCalledWith({
        headers: mockHeadersValue,
      });
    });
  });

  describe('getCurrentUserAction', () => {
    it('should return user data when authenticated', async () => {
      const actionsModule = await import('@/server/actions/basic');

      const mockUser = { id: 'user-1', name: 'Test User', email: 'test@example.com' };
      const mockSession = {
        user: mockUser,
        session: { id: 'session-1' },
      };

      mockAuth.api.getSession.mockResolvedValue(mockSession);

      const result = await actionsModule.getCurrentUserAction();

      expect(result).toEqual({
        data: mockUser,
        success: true,
      });
    });

    it('should return error when not authenticated', async () => {
      const actionsModule = await import('@/server/actions/basic');

      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await actionsModule.getCurrentUserAction();

      expect(result).toEqual({
        data: null,
        error: 'Not authenticated',
        success: false,
      });
    });

    it('should return error when session has no user', async () => {
      const actionsModule = await import('@/server/actions/basic');

      const mockSession = {
        user: null,
        session: { id: 'session-1' },
      };

      mockAuth.api.getSession.mockResolvedValue(mockSession);

      const result = await actionsModule.getCurrentUserAction();

      expect(result).toEqual({
        data: null,
        error: 'Not authenticated',
        success: false,
      });
    });

    it('should handle session fetch errors', async () => {
      const actionsModule = await import('@/server/actions/basic');

      const error = new Error('Session error');
      mockAuth.api.getSession.mockRejectedValue(error);

      const result = await actionsModule.getCurrentUserAction();

      expect(result).toEqual({
        data: null,
        error: 'Session error',
        success: false,
      });
    });

    it('should handle undefined user in session', async () => {
      const actionsModule = await import('@/server/actions/basic');

      const mockSession = {
        user: undefined,
        session: { id: 'session-1' },
      };

      mockAuth.api.getSession.mockResolvedValue(mockSession);

      const result = await actionsModule.getCurrentUserAction();

      expect(result).toEqual({
        data: null,
        error: 'Not authenticated',
        success: false,
      });
    });
  });

  describe('edge cases', () => {
    it('should handle headers() throwing error', async () => {
      const actionsModule = await import('@/server/actions/basic');

      mockHeaders.mockRejectedValue(new Error('Headers error'));

      const result = await actionsModule.getSessionAction();

      expect(result).toEqual({
        data: null,
        error: 'Headers error',
        success: false,
      });
    });

    it('should handle async headers properly', async () => {
      const actionsModule = await import('@/server/actions/basic');

      const mockHeadersValue = { 'custom-header': 'value' };
      mockHeaders.mockResolvedValue(mockHeadersValue);
      mockAuth.api.getSession.mockResolvedValue(null);

      await actionsModule.getSessionAction();

      expect(mockHeaders).toHaveBeenCalled();
      expect(mockAuth.api.getSession).toHaveBeenCalledWith({
        headers: mockHeadersValue,
      });
    });

    it('should handle concurrent action calls', async () => {
      const actionsModule = await import('@/server/actions/basic');

      mockAuth.api.getSession.mockResolvedValue(null);
      mockAuth.api.signOut.mockResolvedValue(undefined);

      const [sessionResult, signOutResult, userResult] = await Promise.all([
        actionsModule.getSessionAction(),
        actionsModule.deleteSessionAction(),
        actionsModule.getCurrentUserAction(),
      ]);

      expect(sessionResult.success).toBe(true);
      expect(signOutResult.success).toBe(true);
      expect(userResult.success).toBe(false); // No user when not authenticated
    });
  });
});
