/**
 * Tailwind v4 RSC Two-Factor Verification
 * 100% React Server Component with server actions
 */

import { useFormState } from 'react-dom';
import { verifyTwoFactorAction } from '../actions';
import type { BaseProps, FormState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

interface TwoFactorVerifyProps extends BaseProps {
  email?: string;
  showBackupCodeOption?: boolean;
}

const _initialState: FormState = { success: false };

type VerifyTwoFactorState =
  | { success: false; errors: { code: string[] } }
  | { success: true; message: string }
  | { success: false; error: string };

const initialVerifyState: VerifyTwoFactorState = { success: false, error: '' };

export function TwoFactorVerify({
  className = '',
  email,
  showBackupCodeOption = true,
}: TwoFactorVerifyProps) {
  const [formState, formAction] = useFormState(verifyTwoFactorAction, initialVerifyState);

  return (
    <Card className={`mx-auto w-full max-w-md p-6 ${className}`}>
      <CardHeader>
        <div className="text-center">
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
                d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
          <p className="mt-2 text-sm text-gray-600">
            {email
              ? `Enter the code from your authenticator app for ${email}`
              : 'Enter the verification code from your authenticator app'}
          </p>
        </div>
      </CardHeader>

      <CardContent>
        {formState?.error && (
          <Alert type="error" className="mb-4">
            {formState.error}
          </Alert>
        )}

        {formState?.success && (
          <Alert type="success" className="mb-4">
            Verification successful! Redirecting...
          </Alert>
        )}

        <form action={formAction} className="space-y-4">
          <Input
            name="code"
            type="text"
            label="Verification Code"
            placeholder="Enter 6-digit code"
            required
            autoComplete="one-time-code"
            error={formState?.errors?.code?.[0]}
            description="Enter the 6-digit code from your authenticator app"
            className="text-center text-lg tracking-widest"
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={formState === undefined}
          >
            Verify Code
          </Button>
        </form>

        {showBackupCodeOption && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button variant="ghost" className="text-sm">
                Use backup code instead
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Don't have access to your authenticator app?{' '}
            <a href="/support" className="text-blue-600 hover:text-blue-500 hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
