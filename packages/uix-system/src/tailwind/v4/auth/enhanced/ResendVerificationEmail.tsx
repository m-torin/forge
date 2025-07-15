/**
 * Tailwind v4 RSC Resend Verification Email
 * 100% React Server Component for resending email verification
 */

import { useFormState } from 'react-dom';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { cn } from '../utils/dark-mode';

interface ResendVerificationEmailProps extends BaseProps {
  userEmail: string;
  title?: string;
  subtitle?: string;
  showRateLimit?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const initialState: FormState = { success: false };

// Server action for resending verification email
async function resendVerificationEmailAction(
  prevState: any,
  formData: FormData,
): Promise<FormState> {
  'use server';

  try {
    const email = formData.get('email') as string;

    if (!email) {
      return {
        success: false,
        errors: { email: ['Email is required'] },
      };
    }

    // Import Better Auth server action
    const { sendVerificationEmailAction } = await import('@repo/auth/server-actions');

    const result = await sendVerificationEmailAction(prevState, formData);

    if (result.success) {
      return {
        success: true,
        message: `New verification email sent to ${email}! Please check your inbox.`,
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to resend verification email.',
      };
    }
  } catch (error: any) {
    console.error('Resend verification email error:', error);

    if (error?.message?.includes('already verified')) {
      return {
        success: true,
        message: 'Your email is already verified!',
      };
    }

    if (error?.message?.includes('rate limit')) {
      return {
        success: false,
        error:
          'Please wait before requesting another verification email. You can request a new email every 60 seconds.',
      };
    }

    if (error?.message?.includes('user not found')) {
      return {
        success: false,
        error: 'No account found with this email address.',
      };
    }

    return {
      success: false,
      error: 'An error occurred while resending the verification email. Please try again.',
    };
  }
}

export function ResendVerificationEmail({
  userEmail,
  title = 'Resend Verification Email',
  subtitle = "Didn't receive the verification email? We can send you another one.",
  showRateLimit = true,
  onSuccess,
  onError,
  className = '',
}: ResendVerificationEmailProps) {
  const [state, action] = useFormState(resendVerificationEmailAction, createInitialActionState());

  // Handle callbacks
  if (state?.success && onSuccess) {
    onSuccess();
  }

  if (state?.error && onError) {
    onError(state.error);
  }

  return (
    <Card className={cn('mx-auto w-full max-w-md', className)}>
      <CardHeader>
        <div className="text-center">
          <div
            className={cn(
              'mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full',
              state?.success
                ? 'bg-green-100 dark:bg-green-900/20'
                : 'bg-blue-100 dark:bg-blue-900/20',
            )}
          >
            {state?.success ? (
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            )}
          </div>
          <h1 className={cn('text-2xl font-bold text-gray-900', 'dark:text-gray-100')}>{title}</h1>
          {subtitle && (
            <p className={cn('mt-2 text-sm text-gray-600', 'dark:text-gray-400')}>{subtitle}</p>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Success State */}
        {state?.success && (
          <div className="space-y-4">
            <Alert variant="success">{state.message}</Alert>

            <div
              className={cn(
                'rounded-lg border border-green-200 bg-green-50 p-4',
                'dark:border-green-800 dark:bg-green-900/20',
              )}
            >
              <div className="flex items-start">
                <svg
                  className="mr-3 mt-0.5 h-5 w-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className={cn('text-sm text-green-800', 'dark:text-green-200')}>
                  <h4 className="mb-1 font-medium">Email sent successfully!</h4>
                  <p className="mb-2">
                    Check your inbox at <strong>{userEmail}</strong>
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-xs">
                    <li>Look for an email from our verification system</li>
                    <li>Click the verification link to confirm your email</li>
                    <li>The link will expire in 24 hours</li>
                    <li>Check your spam folder if you don't see it</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  window.location.href = '/dashboard';
                }}
              >
                Continue to Dashboard
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  window.location.reload();
                }}
              >
                Send Another Email
              </Button>
            </div>
          </div>
        )}

        {/* Form State */}
        {!state?.success && (
          <div className="space-y-4">
            {/* Error Message */}
            {state?.error && <Alert variant="destructive">{state.error}</Alert>}

            {/* Current Email Display */}
            <div className={cn('rounded-lg bg-gray-50 p-4', 'dark:bg-gray-800')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn('text-sm font-medium text-gray-700', 'dark:text-gray-300')}>
                    Email Address
                  </p>
                  <p className={cn('text-lg text-gray-900', 'dark:text-gray-100')}>{userEmail}</p>
                </div>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
                  )}
                >
                  Unverified
                </span>
              </div>
            </div>

            {/* Rate Limit Information */}
            {showRateLimit && (
              <div
                className={cn(
                  'rounded-lg border border-blue-200 bg-blue-50 p-4',
                  'dark:border-blue-800 dark:bg-blue-900/20',
                )}
              >
                <div className="flex items-start">
                  <svg
                    className="mr-3 mt-0.5 h-5 w-5 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className={cn('text-sm text-blue-800', 'dark:text-blue-200')}>
                    <h4 className="mb-1 font-medium">Rate limit information</h4>
                    <ul className="list-inside list-disc space-y-1 text-xs">
                      <li>You can request a new verification email every 60 seconds</li>
                      <li>Maximum of 5 verification emails per hour</li>
                      <li>This helps protect against spam and abuse</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Resend Button */}
            <form action={action}>
              <input type="hidden" name="email" value={userEmail} />
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={state === undefined}
              >
                {state === undefined
                  ? 'Sending Verification Email...'
                  : 'Resend Verification Email'}
              </Button>
            </form>
          </div>
        )}

        {/* Additional Actions */}
        <div className="mt-6 space-y-3">
          {/* Change Email */}
          <div className="text-center">
            <p className={cn('text-sm text-gray-600', 'dark:text-gray-400')}>
              Need to use a different email?{' '}
              <a
                href="/account/settings"
                className={cn(
                  'text-blue-600 hover:text-blue-500',
                  'dark:text-blue-400 dark:hover:text-blue-300',
                )}
              >
                Update your email address
              </a>
            </p>
          </div>

          {/* Back to Sign In */}
          <div className="text-center">
            <a
              href="/auth/signin"
              className={cn(
                'text-sm text-gray-500 hover:text-gray-400',
                'dark:text-gray-500 dark:hover:text-gray-400',
              )}
            >
              ← Back to sign in
            </a>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className={cn('mt-6 rounded-lg bg-gray-50 p-4', 'dark:bg-gray-800')}>
          <h4 className={cn('mb-2 text-sm font-medium text-gray-900', 'dark:text-gray-100')}>
            Still having trouble?
          </h4>
          <div className={cn('space-y-1 text-xs text-gray-600', 'dark:text-gray-400')}>
            <p>• Check your spam/junk folder thoroughly</p>
            <p>• Add our email address to your contacts</p>
            <p>• Try with a different email provider if possible</p>
            <p>• Contact support if the problem persists</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
