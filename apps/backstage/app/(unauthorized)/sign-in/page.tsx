'use client';

import { useEffect } from 'react';

import { analytics } from '@repo/analytics-legacy';
import { AuthLayout, UnifiedSignIn } from '@repo/design-system/uix';

export default function SignInPage() {
  useEffect(() => {
    // Track page view
    analytics.capture('page_viewed', {
      app: 'backstage',
      page: 'admin-sign-in',
      title: 'Admin Sign In',
    });
  }, []);

  return (
    <AuthLayout
      alternativeAction={{
        href: '/sign-up',
        linkText: 'Create admin account',
        text: 'Need an admin account?',
      }}
      subtitle="Sign in to access the admin dashboard"
      title="Backstage Admin"
    >
      <UnifiedSignIn />
    </AuthLayout>
  );
}
