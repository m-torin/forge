/**
 * Tests for client hooks
 */

import { renderHook } from '@testing-library/react';
import { describe, expect, vi } from 'vitest';

// Mock the auth context
const mockAuthContext = {
  user: { id: '1', name: 'Test User', email: 'test@example.com' },
  session: { id: 'session-1', userId: '1' },
  isAuthenticated: true,
  isLoading: false,
  activeOrganizationId: 'org-1',
  getUserId: vi.fn(() => '1'),
  getSessionId: vi.fn(() => 'session-1'),
  requireAuth: vi.fn(() => ({ userId: '1', sessionId: 'session-1' })),
  canPerformAction: vi.fn(() => true),
  hasRole: vi.fn(() => true),
  belongsToOrganization: vi.fn(() => true),
};

// Mock the auth provider
vi.mock('#/client/auth-provider', () => ({
  useAuthContext: vi.fn(() => mockAuthContext),
}));

// Mock the auth client
const mockAuthClient = {
  useSession: vi.fn(),
};

vi.mock('#/client/client', () => ({
  authClient: mockAuthClient,
}));

// Mock window for auth guard tests
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

describe('client hooks', () => {
  test('should export useAuth as alias for useAuthContext', async () => {
    const hooksModule = await import('#/client/hooks');
    const { useAuthContext } = await import('#/client/auth-provider');

    expect(hooksModule.useAuth).toBe(useAuthContext);
  });

  test('should export useSession from authClient', async () => {
    const hooksModule = await import('#/client/hooks');

    expect(hooksModule.useSession).toBe(mockAuthClient.useSession);
  });

  describe('useUser', () => {
    test('should return user from auth context', async () => {
      const hooksModule = await import('#/client/hooks');

      const { result } = renderHook(() => hooksModule.useUser());

      expect(result.current).toStrictEqual(mockAuthContext.user);
    });
  });

  describe('useIsAuthenticated', () => {
    test('should return isAuthenticated from auth context', async () => {
      const hooksModule = await import('#/client/hooks');

      const { result } = renderHook(() => hooksModule.useIsAuthenticated());

      expect(result.current).toBeTruthy();
    });
  });

  describe('useRequireAuth', () => {
    test('should return requireAuth function from auth context', async () => {
      const hooksModule = await import('#/client/hooks');

      const { result } = renderHook(() => hooksModule.useRequireAuth());

      expect(result.current).toBe(mockAuthContext.requireAuth);
    });
  });

  describe('useAuthGuard', () => {
    test('should return auth state when authenticated', async () => {
      const hooksModule = await import('#/client/hooks');

      const { result } = renderHook(() => hooksModule.useAuthGuard());

      expect(result.current).toStrictEqual({
        isAuthenticated: true,
        isLoading: false,
      });
    });

    test('should redirect when not authenticated and redirectTo is provided', async () => {
      const hooksModule = await import('#/client/hooks');

      // Mock unauthenticated state
      vi.mocked(await import('#/client/auth-provider')).useAuthContext.mockReturnValue({
        ...mockAuthContext,
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      const redirectTo = '/login';
      const { result } = renderHook(() => hooksModule.useAuthGuard(redirectTo));

      expect(result.current).toStrictEqual({
        isAuthenticated: false,
        isLoading: false,
      });

      expect(window.location.href).toBe(redirectTo);
    });

    test('should not redirect when loading', async () => {
      const hooksModule = await import('#/client/hooks');

      // Mock loading state
      vi.mocked(await import('#/client/auth-provider')).useAuthContext.mockReturnValue({
        ...mockAuthContext,
        isAuthenticated: false,
        isLoading: true,
        user: null,
      });

      const originalHref = window.location.href;
      const { result } = renderHook(() => hooksModule.useAuthGuard('/login'));

      expect(result.current).toStrictEqual({
        isAuthenticated: false,
        isLoading: true,
      });

      expect(window.location.href).toBe(originalHref);
    });

    test('should not redirect when no redirectTo is provided', async () => {
      const hooksModule = await import('#/client/hooks');

      // Mock unauthenticated state
      vi.mocked(await import('#/client/auth-provider')).useAuthContext.mockReturnValue({
        ...mockAuthContext,
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      const originalHref = window.location.href;
      const { result } = renderHook(() => hooksModule.useAuthGuard());

      expect(result.current).toStrictEqual({
        isAuthenticated: false,
        isLoading: false,
      });

      expect(window.location.href).toBe(originalHref);
    });

    test('should not redirect when authenticated', async () => {
      const hooksModule = await import('#/client/hooks');

      // Test the normal authenticated flow
      const { result } = renderHook(() => hooksModule.useAuthGuard('/login'));

      expect(result.current).toStrictEqual({
        isAuthenticated: true,
        isLoading: false,
      });
    });
  });
});
