/**
 * Tailwind v4 RSC Reset Password Form
 * 100% React Server Component with server actions
 */

import { useFormState } from 'react-dom';
import { resetPasswordAction } from '../actions';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

interface ResetPasswordFormProps extends BaseProps {
  token: string;
  title?: string;
  subtitle?: string;
  signInHref?: string;
}

const initialState: FormState = { success: false };

export function ResetPasswordForm({
  token,
  className = '',
  title = 'Reset Password',
  subtitle = 'Enter your new password below.',
  signInHref = '/sign-in',
}: ResetPasswordFormProps) {
  const [formState, formAction] = useFormState(resetPasswordAction, createInitialActionState());

  return (
    <Card className={`mx-auto w-full max-w-md p-6 ${className}`}>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
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
          Password reset successfully! You can now sign in with your new password.
        </Alert>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        <Input
          name="password"
          type="password"
          label="New password"
          placeholder="Enter your new password"
          required
          autoComplete="new-password"
          error={formState?.errors?.password?.[0]}
          description="Password must be at least 8 characters with letters, numbers, and symbols"
        />

        <Input
          name="confirmPassword"
          type="password"
          label="Confirm new password"
          placeholder="Confirm your new password"
          required
          autoComplete="new-password"
          error={formState?.errors?.confirmPassword?.[0]}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={formState === undefined}
        >
          Reset Password
        </Button>
      </form>

      <div className="mt-6 text-center">
        <a href={signInHref} className="text-sm text-blue-600 hover:text-blue-500 hover:underline">
          ← Back to sign in
        </a>
      </div>
    </Card>
  );
}
