'use client';

import { useEffect } from 'react';

import { analytics } from '@repo/analytics-legacy';
import { AuthLayout, ForgotPasswordForm } from '@repo/design-system/uix';

export default function ForgotPasswordPage() {
  useEffect(() => {
    // Track page view
    analytics.capture('page_viewed', {
      app: 'backstage',
      page: 'admin-forgot-password',
      title: 'Admin Forgot Password',
    });
  }, []);

  return (
    <AuthLayout
      alternativeAction={{
        href: '/sign-in',
        linkText: 'Back to sign in',
        text: 'Remember your password?',
      }}
      subtitle="Enter your email address and we'll send you a link to reset your password"
      title="Reset Password"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
