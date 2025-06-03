'use client';

import { useEffect } from 'react';

import { analytics } from '@repo/analytics';
import { AuthLayout, UnifiedSignUp } from '@repo/design-system/uix';

export default function SignUpPage() {
  useEffect(() => {
    // Track page view
    analytics.capture('page_viewed', {
      app: 'backstage',
      page: 'admin-sign-up',
      title: 'Admin Sign Up',
    });
  }, []);

  return (
    <AuthLayout
      alternativeAction={{
        href: '/sign-in',
        linkText: 'Sign in here',
        text: 'Already have an admin account?',
      }}
      subtitle="Create a new admin account"
      title="Create Admin Account"
    >
      <UnifiedSignUp />
    </AuthLayout>
  );
}
