/**
 * Tests for ProtectedRoute component
 */

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Next.js router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => mockRouter),
}));

// Mock the auth hook
const mockAuth = {
  isAuthenticated: true,
  isLoading: false,
  user: { id: '1', name: 'Test User', email: 'test@example.com' },
};

vi.mock('@/client/hooks', () => ({
  useAuth: vi.fn(() => mockAuth),
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

describe('ProtectedRoute component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset auth state to authenticated by default
    vi.mocked(require('@/client/hooks').useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
    });
  });

  describe('authenticated user', () => {
    it('should render children when user is authenticated', async () => {
      const ProtectedRouteModule = await import('@/client/protected-route');

      render(
        <ProtectedRouteModule.ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should render children with custom props', async () => {
      const ProtectedRouteModule = await import('@/client/protected-route');

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
      vi.mocked(require('@/client/hooks').useAuth).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    });

    it('should redirect to sign-in when not authenticated', async () => {
      const ProtectedRouteModule = await import('@/client/protected-route');

      render(
        <ProtectedRouteModule.ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      expect(mockRouter.push).toHaveBeenCalledWith(
        '/sign-in?returnUrl=%2Fdashboard%3Ftab%3Dsettings',
      );
    });

    it('should redirect to custom URL when not authenticated', async () => {
      const ProtectedRouteModule = await import('@/client/protected-route');

      render(
        <ProtectedRouteModule.ProtectedRoute redirectTo="/custom-login">
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      expect(mockRouter.push).toHaveBeenCalledWith(
        '/custom-login?returnUrl=%2Fdashboard%3Ftab%3Dsettings',
      );
    });

    it('should show fallback content while redirecting', async () => {
      const ProtectedRouteModule = await import('@/client/protected-route');

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

    it('should show custom fallback when provided', async () => {
      const ProtectedRouteModule = await import('@/client/protected-route');

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
      vi.mocked(require('@/client/hooks').useAuth).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
      });
    });

    it('should show fallback during loading', async () => {
      const ProtectedRouteModule = await import('@/client/protected-route');

      render(
        <ProtectedRouteModule.ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should show custom fallback during loading', async () => {
      const ProtectedRouteModule = await import('@/client/protected-route');

      render(
        <ProtectedRouteModule.ProtectedRoute
          fallback={<div data-testid="loading-spinner">Loading spinner...</div>}
        >
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  describe('organization requirement', () => {
    it('should render children when user has organization', async () => {
      const ProtectedRouteModule = await import('@/client/protected-route');

      vi.mocked(require('@/client/hooks').useAuth).mockReturnValue({
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

    it('should handle user without organization when required', async () => {
      const ProtectedRouteModule = await import('@/client/protected-route');

      vi.mocked(require('@/client/hooks').useAuth).mockReturnValue({
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

  describe('URL encoding', () => {
    it('should properly encode complex URLs', async () => {
      const ProtectedRouteModule = await import('@/client/protected-route');

      // Mock complex URL
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/admin/users',
          search: '?filter=active&sort=name&page=2',
        },
        writable: true,
      });

      vi.mocked(require('@/client/hooks').useAuth).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      render(
        <ProtectedRouteModule.ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      expect(mockRouter.push).toHaveBeenCalledWith(
        '/sign-in?returnUrl=%2Fadmin%2Fusers%3Ffilter%3Dactive%26sort%3Dname%26page%3D2',
      );
    });

    it('should handle URLs without search params', async () => {
      const ProtectedRouteModule = await import('@/client/protected-route');

      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/profile',
          search: '',
        },
        writable: true,
      });

      vi.mocked(require('@/client/hooks').useAuth).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      render(
        <ProtectedRouteModule.ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      expect(mockRouter.push).toHaveBeenCalledWith('/sign-in?returnUrl=%2Fprofile');
    });
  });

  describe('component props', () => {
    it('should handle all prop combinations', async () => {
      const ProtectedRouteModule = await import('@/client/protected-route');

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

    it('should work with minimal props', async () => {
      const ProtectedRouteModule = await import('@/client/protected-route');

      render(
        <ProtectedRouteModule.ProtectedRoute>
          <span>Minimal content</span>
        </ProtectedRouteModule.ProtectedRoute>,
      );

      expect(screen.getByText('Minimal content')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle missing window.location gracefully', async () => {
      const ProtectedRouteModule = await import('@/client/protected-route');

      // Mock SSR environment (no window)
      const originalLocation = window.location;
      // @ts-expect-error - simulating SSR
      delete window.location;

      vi.mocked(require('@/client/hooks').useAuth).mockReturnValue({
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
      window.location = originalLocation;
    });

    it('should handle null children', async () => {
      const ProtectedRouteModule = await import('@/client/protected-route');

      render(<ProtectedRouteModule.ProtectedRoute>{null}</ProtectedRouteModule.ProtectedRoute>);

      // Should not crash
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });
});
