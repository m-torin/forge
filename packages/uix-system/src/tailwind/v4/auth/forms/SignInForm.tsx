/**
 * Tailwind v4 RSC Sign In Form
 * 100% React Server Component with server actions
 */

import { useFormState } from 'react-dom';
import { signInAction, socialLoginAction } from '../actions';
import { SocialLoginButtons } from '../social/SocialLoginButtons';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

interface SignInFormProps extends BaseProps {
  showSocialLogin?: boolean;
  showForgotPassword?: boolean;
  showSignUpLink?: boolean;
  socialProviders?: Array<'google' | 'github' | 'discord' | 'facebook' | 'microsoft'>;
  title?: string;
  subtitle?: string;
  forgotPasswordHref?: string;
  signUpHref?: string;
}

const initialState: FormState = { success: false };

export function SignInForm({
  className = '',
  showSocialLogin = true,
  showForgotPassword = true,
  showSignUpLink = true,
  socialProviders = ['google', 'github'],
  title = 'Sign In',
  subtitle = 'Welcome back! Please sign in to your account.',
  forgotPasswordHref = '/forgot-password',
  signUpHref = '/sign-up',
}: SignInFormProps) {
  const [formState, formAction] = useFormState(signInAction, createInitialActionState());

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
          Sign in successful! Redirecting...
        </Alert>
      )}

      {showSocialLogin && (
        <>
          <SocialLoginButtons
            providers={socialProviders}
            action={formData => {
              const provider = formData.get('provider') as string;
              socialLoginAction({ provider });
            }}
            className="mb-6"
          />

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with email</span>
            </div>
          </div>
        </>
      )}

      <form action={formAction} className="space-y-4">
        <Input
          name="email"
          type="email"
          label="Email address"
          placeholder="Enter your email"
          required
          autoComplete="email"
          error={undefined}
        />

        <Input
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          required
          autoComplete="current-password"
          error={undefined}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="rememberMe"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Remember me</span>
          </label>

          {showForgotPassword && (
            <a
              href={forgotPasswordHref}
              className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
            >
              Forgot password?
            </a>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={formState === undefined} // Form is submitting
        >
          Sign In
        </Button>
      </form>

      {showSignUpLink && (
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a
            href={signUpHref}
            className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
          >
            Sign up
          </a>
        </p>
      )}
    </Card>
  );
}
