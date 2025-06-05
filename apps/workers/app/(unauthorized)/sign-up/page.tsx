'use client';

import { AuthLayout, UnifiedSignUp } from '@repo/design-system/uix';

export default function SignUpPage() {
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
