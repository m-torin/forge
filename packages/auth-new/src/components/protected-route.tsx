/**
 * Protected route component
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../client/hooks';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
  requireOrganization?: boolean;
}

/**
 * Component to protect routes that require authentication
 */
export function ProtectedRoute({ 
  children, 
  redirectTo = '/sign-in', 
  fallback = <div>Loading...</div>,
  requireOrganization = false 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store current URL for redirect after login
      const currentUrl = window.location.pathname + window.location.search;
      const redirectUrl = `${redirectTo}?returnUrl=${encodeURIComponent(currentUrl)}`;
      router.push(redirectUrl);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  // Show loading state
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Not authenticated, will redirect
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // Check organization requirement
  if (requireOrganization && user) {
    // This would need organization context - simplified for now
    // In a real implementation, you'd check for active organization
  }

  // Authenticated, show protected content
  return <>{children}</>;
}

/**
 * HOC version of ProtectedRoute
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}