'use client';

import { useEffect } from 'react';

import { analytics } from '@repo/analytics';
import { AuthLayout, UnifiedSignUp } from '@repo/design-system/uix';

export default function SignUpPage() {
  useEffect(() => {
    // Track page view
    analytics.capture('page_viewed', {
      app: 'workers',
      page: 'workers-sign-up',
      title: 'Workers Sign Up',
    });
  }, []);

  return (
    <AuthLayout
      alternativeAction={{
        href: '/sign-in',
        linkText: 'Sign in here',
        text: 'Already have a workers account?',
      }}
      subtitle="Create a new account to manage workflows"
      title="Create Workers Account"
    >
      <UnifiedSignUp />
    </AuthLayout>
  );
}
