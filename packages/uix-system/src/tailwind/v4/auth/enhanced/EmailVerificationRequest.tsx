/**
 * Tailwind v4 RSC Email Verification Request
 * 100% React Server Component for requesting email verification
 */

import { useFormState } from 'react-dom';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { cn } from '../utils/dark-mode';

// Import real server action from the auth package
import { requestEmailVerificationAction } from '@repo/auth/server-actions';

interface EmailVerificationRequestProps extends BaseProps {
  userEmail?: string;
  title?: string;
  subtitle?: string;
  autoRequest?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const initialState: FormState = { success: false };

export function EmailVerificationRequest({
  userEmail,
  title = 'Verify Your Email',
  subtitle = 'Please verify your email address to complete your account setup',
  autoRequest = false,
  onSuccess,
  onError,
  className = '',
}: EmailVerificationRequestProps) {
  const [state, action] = useFormState(requestEmailVerificationAction, createInitialActionState());

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
                : 'bg-yellow-100 dark:bg-yellow-900/20',
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
                className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 21.75 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
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
                  <h4 className="mb-1 font-medium">Check your email</h4>
                  <p className="mb-2">We sent a verification link to {userEmail}</p>
                  <ul className="list-inside list-disc space-y-1 text-xs">
                    <li>Click the verification link to confirm your email</li>
                    <li>The link will expire in 24 hours</li>
                    <li>Check your spam folder if you don't see it</li>
                    <li>You can request a new link if needed</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Request Another Link */}
            <form action={action}>
              <input type="hidden" name="email" value={userEmail} />
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                disabled={state === undefined}
              >
                {state === undefined ? 'Sending...' : 'Send Another Verification Email'}
              </Button>
            </form>
          </div>
        )}

        {/* Initial/Error State */}
        {!state?.success && (
          <div className="space-y-4">
            {/* Error Message */}
            {state?.error && <Alert variant="destructive">{state.error}</Alert>}

            {/* Current Email Display */}
            {userEmail && (
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
            )}

            {/* Verification Benefits */}
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
                  <h4 className="mb-1 font-medium">Why verify your email?</h4>
                  <ul className="list-inside list-disc space-y-1 text-xs">
                    <li>Secure your account with password reset capability</li>
                    <li>Receive important security notifications</li>
                    <li>Access all platform features</li>
                    <li>Ensure you receive important updates</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Request Verification Button */}
            <form action={action}>
              <input type="hidden" name="email" value={userEmail} />
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={state === undefined || !userEmail}
              >
                {state === undefined ? 'Sending Verification Email...' : 'Send Verification Email'}
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

          {/* Skip for now */}
          <div className="text-center">
            <button
              type="button"
              className={cn(
                'text-sm text-gray-500 hover:text-gray-400',
                'dark:text-gray-500 dark:hover:text-gray-400',
              )}
              onClick={() => {
                // In real implementation, this might skip verification temporarily
                console.log('Skip verification');
              }}
            >
              I'll verify later
            </button>
          </div>
        </div>

        {/* Help Information */}
        <div className={cn('mt-6 rounded-lg bg-gray-50 p-4', 'dark:bg-gray-800')}>
          <h4 className={cn('mb-2 text-sm font-medium text-gray-900', 'dark:text-gray-100')}>
            Having trouble?
          </h4>
          <div className={cn('space-y-1 text-xs text-gray-600', 'dark:text-gray-400')}>
            <p>• Check your spam/junk folder for the verification email</p>
            <p>• Make sure your email address is spelled correctly</p>
            <p>• Verification links expire after 24 hours</p>
            <p>• Contact support if you continue having issues</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
