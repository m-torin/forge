'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import { analytics } from '@repo/analytics';
import { AuthLayout, ResetPasswordForm } from '@repo/design-system/uix';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    // Track page view
    analytics.capture('page_viewed', {
      app: 'workers',
      hasToken: !!token,
      page: 'workers-reset-password',
      title: 'Workers Reset Password',
    });
  }, [token]);

  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      alternativeAction={{
        href: '/sign-in',
        linkText: 'Back to sign in',
        text: 'Remember your password?',
      }}
      subtitle="Enter your new password below"
      title="Reset Password"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </AuthLayout>
  );
}
