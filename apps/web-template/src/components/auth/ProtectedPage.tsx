'use client';

import { useAuth } from '@repo/auth/client/next';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { Loader, Center } from '@mantine/core';

interface ProtectedPageProps {
  children: React.ReactNode;
  fallback?: string;
  loadingComponent?: React.ReactNode;
  requireEmailVerification?: boolean;
}

export function ProtectedPage({ 
  children, 
  fallback,
  loadingComponent,
  requireEmailVerification = false
}: ProtectedPageProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || 'en';
  
  useEffect(() => {
    if (!isLoading && !user) {
      const redirectUrl = fallback || `/${locale}/login`;
      // Save current location for return after login
      const currentPath = window.location.pathname;
      const url = new URL(redirectUrl, window.location.origin);
      url.searchParams.set('returnUrl', currentPath);
      router.push(url.toString());
    }
  }, [user, isLoading, router, fallback, locale]);
  
  // Show loading state
  if (isLoading) {
    return loadingComponent || (
      <Center h="50vh">
        <Loader size="lg" />
      </Center>
    );
  }
  
  // Not authenticated
  if (!user) {
    return null;
  }
  
  // Check email verification if required
  if (requireEmailVerification && !user.emailVerified) {
    return (
      <Center h="50vh">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Email Verification Required</h2>
          <p className="text-gray-600">
            Please verify your email address to access this page.
          </p>
        </div>
      </Center>
    );
  }
  
  // Authenticated - render children
  return <>{children}</>;
}