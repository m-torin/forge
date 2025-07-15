/**
 * Tailwind v4 RSC Forgot Password Form
 * 100% React Server Component with server actions
 */

import { useFormState } from 'react-dom';
import { forgotPasswordAction } from '../actions';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

interface ForgotPasswordFormProps extends BaseProps {
  title?: string;
  subtitle?: string;
  signInHref?: string;
  showSignInLink?: boolean;
}

const initialState: FormState = { success: false };

export function ForgotPasswordForm({
  className = '',
  title = 'Reset Password',
  subtitle = "Enter your email address and we'll send you a link to reset your password.",
  signInHref = '/sign-in',
  showSignInLink = true,
}: ForgotPasswordFormProps) {
  const [formState, formAction] = useFormState(forgotPasswordAction, createInitialActionState());

  return (
    <Card className={`mx-auto w-full max-w-md p-6 ${className}`}>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <svg
            className="h-6 w-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 5.25a3 3 0 0 1 3 3m0 0a3 3 0 0 1-3 3H12M6.75 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 0H8.25m2.25 0H12m0 0h2.25M12 13.5V9m0 0a3 3 0 1 1 6 0c0 .75-.274 1.433-.722 1.957L12 13.5Z"
            />
          </svg>
        </div>
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
          Password reset email sent! Check your inbox for further instructions.
        </Alert>
      )}

      <form action={formAction} className="space-y-4">
        <Input
          name="email"
          type="email"
          label="Email address"
          placeholder="Enter your email address"
          required
          autoComplete="email"
          error={formState?.errors?.email?.[0]}
          description="We'll send a password reset link to this email"
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={formState === undefined}
        >
          Send Reset Link
        </Button>
      </form>

      {showSignInLink && (
        <div className="mt-6 text-center">
          <a
            href={signInHref}
            className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
          >
            ← Back to sign in
          </a>
        </div>
      )}
    </Card>
  );
}
