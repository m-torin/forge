'use client';

import { AuthLayout, UnifiedSignIn } from '@repo/design-system/uix';

export default function SignInPage() {
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
