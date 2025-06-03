'use client';

import { useEffect } from 'react';

import { analytics } from '@repo/analytics';
import { AuthLayout, UnifiedSignIn } from '@repo/design-system/uix';

export default function SignInPage() {
  useEffect(() => {
    // Track page view
    analytics.capture('page_viewed', {
      app: 'workers',
      page: 'workers-sign-in',
      title: 'Workers Sign In',
    });
  }, []);

  return (
    <AuthLayout
      alternativeAction={{
        href: '/sign-up',
        linkText: 'Create account',
        text: 'Need a workers account?',
      }}
      subtitle="Sign in to access the workflow dashboard"
      title="Workers Platform"
    >
      <UnifiedSignIn />
    </AuthLayout>
  );
}
