/**
 * Protected route component
 */

'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

import { useAuth } from './hooks';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  requireOrganization?: boolean;
}

/**
 * Component to protect routes that require authentication
 */
export function ProtectedRoute({
  children,
  fallback = <div>Loading...</div>,
  redirectTo = '/sign-in',
  requireOrganization = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store current URL for redirect after login (defensive for test/SSR)
      const loc = (typeof window !== 'undefined' && (window as any)?.location) || {
        pathname: '/',
        search: '',
      };
      const currentUrl = String(loc.pathname || '/') + String(loc.search || '');
      const redirectUrl = `${redirectTo}?returnUrl=${encodeURIComponent(currentUrl)}`;
      router.push(redirectUrl as any);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  // Show loading state
  if (isLoading) {
    return fallback;
  }

  // Not authenticated, will redirect
  if (!isAuthenticated) {
    return fallback;
  }

  // Check organization requirement
  if (requireOrganization && user) {
    // This would need organization context - simplified for now
    // In a real implementation, you'd check for active organization
  }

  // Authenticated, show protected content
  return children;
}

/**
 * HOC version of ProtectedRoute
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>,
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
