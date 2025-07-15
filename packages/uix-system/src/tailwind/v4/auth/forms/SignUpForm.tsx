/**
 * Tailwind v4 RSC Sign Up Form
 * 100% React Server Component with server actions
 */

import { useFormState } from 'react-dom';
import { signUpAction, socialLoginAction } from '../../../../../../auth/src/server-actions';
import { SocialLoginButtons } from '../social/SocialLoginButtons';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

interface SignUpFormProps extends BaseProps {
  showSocialLogin?: boolean;
  showSignInLink?: boolean;
  socialProviders?: Array<'google' | 'github' | 'discord' | 'facebook' | 'microsoft'>;
  title?: string;
  subtitle?: string;
  signInHref?: string;
  requireTerms?: boolean;
  termsHref?: string;
  privacyHref?: string;
}

const initialState: FormState = { success: false };

export function SignUpForm({
  className = '',
  showSocialLogin = true,
  showSignInLink = true,
  socialProviders = ['google', 'github'],
  title = 'Create Account',
  subtitle = 'Get started with your free account today.',
  signInHref = '/sign-in',
  requireTerms = true,
  termsHref = '/terms',
  privacyHref = '/privacy',
}: SignUpFormProps) {
  const [formState, formAction] = useFormState(signUpAction, createInitialActionState());

  return (
    <Card className={`mx-auto w-full max-w-md p-6 ${className}`}>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
      </div>

      {formState?.error && (
        <Alert variant="destructive" className="mb-4">
          {formState.error}
        </Alert>
      )}

      {formState?.success && (
        <Alert variant="success" className="mb-4">
          Account created successfully! Please check your email to verify your account.
        </Alert>
      )}

      {showSocialLogin && (
        <>
          <SocialLoginButtons
            providers={socialProviders}
            action={socialLoginAction}
            className="mb-6"
            mode="signup"
          />

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or create account with email</span>
            </div>
          </div>
        </>
      )}

      <form action={formAction} className="space-y-4">
        <Input
          name="name"
          type="text"
          label="Full name"
          placeholder="John Doe"
          required
          autoComplete="name"
          error={undefined}
        />

        <Input
          name="email"
          type="email"
          label="Email address"
          placeholder="john@example.com"
          required
          autoComplete="email"
          error={undefined}
        />

        <Input
          name="password"
          type="password"
          label="Password"
          placeholder="Create a strong password"
          required
          autoComplete="new-password"
          error={undefined}
          description="Password must be at least 8 characters with letters, numbers, and symbols"
        />

        <Input
          name="confirmPassword"
          type="password"
          label="Confirm password"
          placeholder="Confirm your password"
          required
          autoComplete="new-password"
          error={undefined}
        />

        {requireTerms && (
          <div className="flex items-start">
            <input
              type="checkbox"
              name="acceptTerms"
              id="acceptTerms"
              required
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-700">
              I agree to the{' '}
              <a
                href={termsHref}
                className="text-blue-600 hover:text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href={privacyHref}
                className="text-blue-600 hover:text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
            </label>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={formState === undefined}
        >
          Create Account
        </Button>
      </form>

      {showSignInLink && (
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a
            href={signInHref}
            className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
          >
            Sign in
          </a>
        </p>
      )}
    </Card>
  );
}
