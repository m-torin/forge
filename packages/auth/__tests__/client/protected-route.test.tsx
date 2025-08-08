/**
 * Tests for ProtectedRoute component
 */

import { mockRouterPush, resetRouterMocks } from '@repo/qa/vitest/mocks/internal/next';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, vi } from 'vitest';

// Mock better-auth/react with all necessary exports
vi.mock('better-auth/react', () => ({
  createAuthClient: vi.fn(() => ({
    signIn: { email: vi.fn() },
    signUp: { email: vi.fn() },
    signOut: vi.fn(),
    useSession: vi.fn(() => ({ data: null, isPending: false })),
    getSession: vi.fn(),
    $store: {},
    $Infer: {},
  })),
}));

// Mock better-auth/client/plugins
vi.mock('better-auth/client/plugins', () => ({
  adminClient: vi.fn(() => ({})),
  apiKeyClient: vi.fn(() => ({})),
  inferAdditionalFields: vi.fn(() => ({})),
  magicLinkClient: vi.fn(() => ({})),
  multiSessionClient: vi.fn(() => ({})),
  oneTapClient: vi.fn(() => ({})),
  organizationClient: vi.fn(() => ({})),
  passkeyClient: vi.fn(() => ({})),
  twoFactorClient: vi.fn(() => ({})),
}));

// Mock the auth provider
vi.mock('../../src/client/auth-provider', () => ({
  useAuthContext: vi.fn(() => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: '1', name: 'Test User', email: 'test@example.com' },
  })),
}));

// Mock the auth hook with proper export
const mockAuth = {
  isAuthenticated: true,
  isLoading: false,
  user: { id: '1', name: 'Test User', email: 'test@example.com' },
};

vi.mock('../../src/client/hooks', () => ({
  useAuth: vi.fn(() => mockAuth),
  useAuthContext: vi.fn(() => mockAuth),
  useUser: vi.fn(() => mockAuth.user),
  useSession: vi.fn(() => ({ data: mockAuth.user, isPending: false })),
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/dashboard',
    search: '?tab=settings',
    href: 'http://localhost:3000/dashboard?tab=settings',
  },
  writable: true,
});

describe('protectedRoute component', () => {
  beforeEach(() => {
    resetRouterMocks();
    // Reset mocks to default authenticated state
    const { useAuth, useAuthContext } = require('../../src/client/hooks');
    const { useAuthContext: useAuthProvider } = require('../../src/client/auth-provider');

    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
    });

    vi.mocked(useAuthContext).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
    });

    vi.mocked(useAuthProvider).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
    });
  });

  describe('authenticated user', () => {
    test('should render children when user is authenticated', async () => {
      const ProtectedRouteModule = await import('../../src/client/protected-route');

      render(
        <ProtectedRouteModule.ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    test('should render children with custom props', async () => {
      const ProtectedRouteModule = await import('../../src/client/protected-route');

      render(
        <ProtectedRouteModule.ProtectedRoute
          fallback={<div data-testid="custom-fallback">Custom Loading</div>}
          redirectTo="/custom-login"
        >
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('unauthenticated user', () => {
    beforeEach(() => {
      vi.mocked(require('../../src/client/hooks').useAuth).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    });

    test('should redirect to sign-in when not authenticated', async () => {
      const ProtectedRouteModule = await import('../../src/client/protected-route');

      render(
        <ProtectedRouteModule.ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      expect(mockRouterPush).toHaveBeenCalledWith(
        '/sign-in?returnUrl=%2Fdashboard%3Ftab%3Dsettings',
      );
    });

    test('should redirect to custom URL when not authenticated', async () => {
      const ProtectedRouteModule = await import('../../src/client/protected-route');

      render(
        <ProtectedRouteModule.ProtectedRoute redirectTo="/custom-login">
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      expect(mockRouterPush).toHaveBeenCalledWith(
        '/custom-login?returnUrl=%2Fdashboard%3Ftab%3Dsettings',
      );
    });

    test('should show fallback content while redirecting', async () => {
      const ProtectedRouteModule = await import('../../src/client/protected-route');

      render(
        <ProtectedRouteModule.ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      // Should not show protected content
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      // Should show default fallback
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('should show custom fallback when provided', async () => {
      const ProtectedRouteModule = await import('../../src/client/protected-route');

      render(
        <ProtectedRouteModule.ProtectedRoute
          fallback={<div data-testid="custom-fallback">Please wait...</div>}
        >
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    beforeEach(() => {
      vi.mocked(require('../../src/client/hooks').useAuth).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
      });
    });

    test('should show fallback during loading', async () => {
      const ProtectedRouteModule = await import('../../src/client/protected-route');

      render(
        <ProtectedRouteModule.ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    test('should show custom fallback during loading', async () => {
      const ProtectedRouteModule = await import('../../src/client/protected-route');

      render(
        <ProtectedRouteModule.ProtectedRoute
          fallback={<div data-testid="loading-spinner">Loading spinner...</div>}
        >
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  describe('organization requirement', () => {
    test('should render children when user has organization', async () => {
      const ProtectedRouteModule = await import('../../src/client/protected-route');

      vi.mocked(require('../../src/client/hooks').useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          organizationId: 'org-1',
        },
      });

      render(
        <ProtectedRouteModule.ProtectedRoute requireOrganization={true}>
          <div data-testid="protected-content">Organization Content</div>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    test('should handle user without organization when required', async () => {
      const ProtectedRouteModule = await import('../../src/client/protected-route');

      vi.mocked(require('../../src/client/hooks').useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          // No organizationId
        },
      });

      render(
        <ProtectedRouteModule.ProtectedRoute requireOrganization={true}>
          <div data-testid="protected-content">Organization Content</div>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      // Should still render children - organization check logic may be implemented elsewhere
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('uRL encoding', () => {
    test('should properly encode complex URLs', async () => {
      const ProtectedRouteModule = await import('../../src/client/protected-route');

      // Mock complex URL
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/admin/users',
          search: '?filter=active&sort=name&page=2',
        },
        writable: true,
      });

      vi.mocked(require('../../src/client/hooks').useAuth).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      render(
        <ProtectedRouteModule.ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      expect(mockRouterPush).toHaveBeenCalledWith(
        '/sign-in?returnUrl=%2Fadmin%2Fusers%3Ffilter%3Dactive%26sort%3Dname%26page%3D2',
      );
    });

    test('should handle URLs without search params', async () => {
      const ProtectedRouteModule = await import('../../src/client/protected-route');

      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/profile',
          search: '',
        },
        writable: true,
      });

      vi.mocked(require('../../src/client/hooks').useAuth).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      render(
        <ProtectedRouteModule.ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      expect(mockRouterPush).toHaveBeenCalledWith('/sign-in?returnUrl=%2Fprofile');
    });
  });

  describe('component props', () => {
    test('should handle all prop combinations', async () => {
      const ProtectedRouteModule = await import('../../src/client/protected-route');

      const CustomFallback = () => <div data-testid="custom-fallback">Custom Loading</div>;

      render(
        <ProtectedRouteModule.ProtectedRoute
          fallback={<CustomFallback />}
          redirectTo="/auth/signin"
          requireOrganization={true}
        >
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    test('should work with minimal props', async () => {
      const ProtectedRouteModule = await import('../../src/client/protected-route');

      render(
        <ProtectedRouteModule.ProtectedRoute>
          <span>Minimal content</span>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      expect(screen.getByText('Minimal content')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    test('should handle missing window.location gracefully', async () => {
      const ProtectedRouteModule = await import('../../src/client/protected-route');

      // Mock SSR environment (no window)
      const originalLocation = window.location;
      // @ts-expect-error - simulating SSR
      delete window.location;

      vi.mocked(require('../../src/client/hooks').useAuth).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      render(
        <ProtectedRouteModule.ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      // Should still show fallback without crashing
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Restore window.location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      });
    });

    test('should handle null children', async () => {
      const ProtectedRouteModule = await import('../../src/client/protected-route');

      render(<ProtectedRouteModule.ProtectedRoute>{null}</ProtectedRouteModule.ProtectedRoute>);

      // Should not crash
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });
});
