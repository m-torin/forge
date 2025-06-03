/**
 * Example usage of auth components with custom routes
 *
 * This demonstrates how to use the auth components with different route configurations
 * for different applications (e.g., backstage vs web).
 */

import { useRouter } from 'next/navigation';
import { usePathname, useSearchParams } from 'next/navigation';
// Required imports for the examples
import { useState } from 'react';

import { ForgotPasswordForm, ResetPasswordForm, UnifiedSignIn } from './index';

// Example 1: Using custom routes (e.g., for backstage app)
export const BackstageSignIn = () => {
  const router = useRouter();

  return (
    <UnifiedSignIn
      forgotPasswordRoute="/auth/forgot-password"
      // Or use a callback for custom navigation logic
      onForgotPasswordNavigate={() => {
        router.push('/auth/forgot-password');
      }}
    />
  );
};

// Example 2: Using callbacks for modal-based auth
export const ModalBasedAuth = () => {
  const [authMode, setAuthMode] = useState<'signin' | 'forgot' | 'reset'>('signin');

  return (
    <>
      {authMode === 'signin' && (
        <UnifiedSignIn onForgotPasswordNavigate={() => setAuthMode('forgot')} />
      )}

      {authMode === 'forgot' && (
        <ForgotPasswordForm onSignInNavigate={() => setAuthMode('signin')} />
      )}

      {authMode === 'reset' && (
        <ResetPasswordForm
          onForgotPasswordNavigate={() => setAuthMode('forgot')}
          onSignInNavigate={() => setAuthMode('signin')}
          token={getTokenFromUrl()}
        />
      )}
    </>
  );
};

// Example 3: Using default routes (e.g., for web app)
export const DefaultSignIn = () => {
  // Just use the components without any route props
  // They will use the default routes: /sign-in, /forgot-password, /reset-password
  return <UnifiedSignIn />;
};

// Example 4: Backstage app with custom auth routes under /auth/*
export const BackstageAuthExample = () => {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/auth/sign-in') {
    return <UnifiedSignIn forgotPasswordRoute="/auth/forgot-password" />;
  }

  if (pathname === '/auth/forgot-password') {
    return (
      <ForgotPasswordForm resetPasswordRoute="/auth/reset-password" signInRoute="/auth/sign-in" />
    );
  }

  if (pathname === '/auth/reset-password') {
    const token = getTokenFromSearchParams();
    return (
      <ResetPasswordForm
        forgotPasswordRoute="/auth/forgot-password"
        signInRoute="/auth/sign-in"
        token={token}
      />
    );
  }

  return null;
};

// Helper functions
function getTokenFromUrl(): string | null {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get('token');
  }
  return null;
}

function getTokenFromSearchParams(): string | null {
  const searchParams = useSearchParams();
  return searchParams.get('token');
}
