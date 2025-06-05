'use client';

import { AuthLayout, ForgotPasswordForm } from '@repo/design-system/uix';

export default function ForgotPasswordPage() {
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
