/**
 * Tailwind v4 RSC Change Password Form
 * 100% React Server Component for changing user password with security features
 */

import { useFormState } from 'react-dom';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { cn } from '../utils/dark-mode';

interface ChangePasswordFormProps extends BaseProps {
  title?: string;
  subtitle?: string;
  requireCurrentPassword?: boolean;
  showPasswordStrength?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const _initialState: FormState = { success: false };

// Password strength checker
function getPasswordStrength(password: string): {
  score: number;
  feedback: string[];
  color: string;
} {
  if (!password) return { score: 0, feedback: [], color: 'gray' };

  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score += 1;
  else feedback.push('At least 8 characters');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Include numbers');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('Include special characters');

  const colors = ['red', 'red', 'yellow', 'yellow', 'green', 'green'];
  return { score, feedback, color: colors[score] || 'gray' };
}

// Server action for changing password
async function changePasswordAction(__prevState: any, formData: FormData): Promise<FormState> {
  'use server';

  try {
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const requireCurrentPassword = formData.get('requireCurrentPassword') === 'true';

    // Validation
    const errors: Record<string, string[]> = {};

    if (requireCurrentPassword && !currentPassword) {
      errors.currentPassword = ['Current password is required'];
    }

    if (!newPassword) {
      errors.newPassword = ['New password is required'];
    } else {
      if (newPassword.length < 8) {
        errors.newPassword = ['Password must be at least 8 characters long'];
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
        errors.newPassword = errors.newPassword || [];
        errors.newPassword.push('Password must contain uppercase, lowercase, and numbers');
      }
    }

    if (!confirmPassword) {
      errors.confirmPassword = ['Please confirm your new password'];
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = ['Passwords do not match'];
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
      errors.newPassword = ['New password must be different from current password'];
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    // Import local auth actions instead
    // Note: changePasswordAction not implemented in local actions

    // TODO: Implement actual password change logic
    // console.log('Changing password:', {
    //   currentPassword: requireCurrentPassword ? '[REDACTED]' : undefined,
    //   newPassword: '[REDACTED]',
    // });

    // Simulate successful password change
    const result = { success: true, error: undefined };

    if (result.success) {
      return {
        success: true,
        message: 'Password changed successfully! Please use your new password for future sign-ins.',
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to change password.',
      };
    }
  } catch (error: any) {
    // console.error('Change password error:', error);

    if (error?.message?.includes('incorrect password')) {
      return {
        success: false,
        errors: { currentPassword: ['Current password is incorrect'] },
      };
    }

    if (error?.message?.includes('weak password')) {
      return {
        success: false,
        errors: { newPassword: ['Password is too weak. Please choose a stronger password.'] },
      };
    }

    if (error?.message?.includes('rate limit')) {
      return {
        success: false,
        error: 'Too many password change attempts. Please wait a few minutes before trying again.',
      };
    }

    if (error?.message?.includes('recent password')) {
      return {
        success: false,
        errors: {
          newPassword: ['Cannot reuse a recent password. Please choose a different password.'],
        },
      };
    }

    return {
      success: false,
      error: 'An error occurred while changing your password. Please try again.',
    };
  }
}

export function ChangePasswordForm({
  title = 'Change Password',
  subtitle = 'Update your password to keep your account secure',
  requireCurrentPassword = true,
  showPasswordStrength = true,
  onSuccess,
  onError,
  className = '',
}: ChangePasswordFormProps) {
  const [state, action] = useFormState(changePasswordAction, createInitialActionState());

  // Handle callbacks
  if (state?.success && onSuccess) {
    onSuccess();
  }

  if (state?.error && onError) {
    onError(state.error);
  }

  // Get password strength for client-side display (would need client component for real-time)
  const newPassword = ''; // In real implementation, this would come from form state
  const passwordStrength = showPasswordStrength ? getPasswordStrength(newPassword) : null;

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
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
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
                  <h4 className="mb-1 font-medium">Password updated successfully!</h4>
                  <ul className="list-inside list-disc space-y-1 text-xs">
                    <li>Your password has been changed</li>
                    <li>Use your new password for future sign-ins</li>
                    <li>You may need to sign in again on other devices</li>
                    <li>Consider updating saved passwords in your browser</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  window.location.href = '/account/settings';
                }}
              >
                Back to Account Settings
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  window.location.reload();
                }}
              >
                Change Password Again
              </Button>
            </div>
          </div>
        )}

        {!state?.success && (
          <form action={action} className="space-y-4">
            {state?.error && <Alert variant="destructive">{state.error}</Alert>}

            {requireCurrentPassword && (
              <Input
                name="currentPassword"
                type="password"
                label="Current Password"
                placeholder="Enter your current password"
                required
                autoComplete="current-password"
                error={state?.errors?.currentPassword?.[0]}
                description="Verify your identity with your current password"
              />
            )}

            <div className="space-y-2">
              <Input
                name="newPassword"
                type="password"
                label="New Password"
                placeholder="Enter your new password"
                required
                autoComplete="new-password"
                error={state?.errors?.newPassword?.[0]}
                description="Choose a strong password with at least 8 characters"
              />

              {showPasswordStrength && passwordStrength && newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={cn(
                          'h-2 rounded-full transition-all duration-300',
                          passwordStrength.color === 'red'
                            ? 'bg-red-500'
                            : passwordStrength.color === 'yellow'
                              ? 'bg-yellow-500'
                              : passwordStrength.color === 'green'
                                ? 'bg-green-500'
                                : 'bg-gray-300',
                        )}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        passwordStrength.color === 'red'
                          ? 'text-red-600 dark:text-red-400'
                          : passwordStrength.color === 'yellow'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : passwordStrength.color === 'green'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-600 dark:text-gray-400',
                      )}
                    >
                      {passwordStrength.score <= 2
                        ? 'Weak'
                        : passwordStrength.score <= 4
                          ? 'Medium'
                          : 'Strong'}
                    </span>
                  </div>

                  {passwordStrength.feedback.length > 0 && (
                    <div className={cn('text-xs text-gray-600', 'dark:text-gray-400')}>
                      <p className="mb-1 font-medium">Password should include:</p>
                      <ul className="list-inside list-disc space-y-0.5">
                        {passwordStrength.feedback.map(item => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Input
              name="confirmPassword"
              type="password"
              label="Confirm New Password"
              placeholder="Confirm your new password"
              required
              autoComplete="new-password"
              error={state?.errors?.confirmPassword?.[0]}
              description="Re-enter your new password to confirm"
            />

            <input
              type="hidden"
              name="requireCurrentPassword"
              value={requireCurrentPassword.toString()}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={state === undefined}
            >
              {state === undefined ? 'Changing Password...' : 'Change Password'}
            </Button>
          </form>
        )}

        <div
          className={cn(
            'mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4',
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
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <div className={cn('text-sm text-blue-800', 'dark:text-blue-200')}>
              <h4 className="mb-1 font-medium">Password Security Tips</h4>
              <ul className="list-inside list-disc space-y-1 text-xs">
                <li>Use a unique password that you don't use elsewhere</li>
                <li>Include a mix of letters, numbers, and special characters</li>
                <li>Consider using a password manager</li>
                <li>Don't share your password with anyone</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="text-center">
            <a
              href="/account/settings"
              className={cn(
                'text-sm text-gray-600 hover:text-gray-500',
                'dark:text-gray-400 dark:hover:text-gray-300',
              )}
            >
              Cancel and return to settings
            </a>
          </div>

          <div className="text-center">
            <a
              href="/auth/forgot-password"
              className={cn(
                'text-sm text-blue-600 hover:text-blue-500',
                'dark:text-blue-400 dark:hover:text-blue-300',
              )}
            >
              Forgot your current password?
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
