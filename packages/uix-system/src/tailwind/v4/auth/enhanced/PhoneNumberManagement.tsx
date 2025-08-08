/**
 * Tailwind v4 RSC Phone Number Management
 * 100% React Server Component for managing phone numbers in account settings
 */

import { useFormState } from 'react-dom';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { cn } from '../utils/dark-mode';

interface PhoneNumber {
  id: string;
  phoneNumber: string;
  isVerified: boolean;
  isPrimary: boolean;
  addedAt: string;
  lastUsed?: string;
}

interface PhoneNumberManagementProps extends BaseProps {
  phoneNumbers: PhoneNumber[];
  title?: string;
  subtitle?: string;
  allowMultiple?: boolean;
  maxPhoneNumbers?: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const _initialState: FormState = { success: false };

// Server action for removing phone number
async function removePhoneNumberAction(prevState: any, formData: FormData): Promise<FormState> {
  'use server';

  try {
    const phoneNumberId = formData.get('phoneNumberId') as string;

    if (!phoneNumberId) {
      return {
        success: false,
        errors: { phoneNumberId: ['Phone number ID is required'] },
      };
    }

    // Import Better Auth server action
    const { removePhoneNumberAction: authRemovePhone } = await import('@repo/auth/server-actions');

    const result = await authRemovePhone(prevState, formData);

    if (result.success) {
      return {
        success: true,
        message: 'Phone number removed successfully.',
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to remove phone number.',
      };
    }
  } catch (error: any) {
    // console.error('Remove phone number error:', error);

    if (error?.message?.includes('primary phone')) {
      return {
        success: false,
        error: 'Cannot remove primary phone number. Set another number as primary first.',
      };
    }

    if (error?.message?.includes('last phone')) {
      return {
        success: false,
        error: 'Cannot remove the last phone number. Add another number first.',
      };
    }

    if (error?.message?.includes('not found')) {
      return {
        success: false,
        error: 'Phone number not found.',
      };
    }

    return {
      success: false,
      error: 'An error occurred while removing the phone number.',
    };
  }
}

// Server action for setting primary phone number
async function setPrimaryPhoneAction(prevState: any, formData: FormData): Promise<FormState> {
  'use server';

  try {
    const phoneNumberId = formData.get('phoneNumberId') as string;

    if (!phoneNumberId) {
      return {
        success: false,
        errors: { phoneNumberId: ['Phone number ID is required'] },
      };
    }

    // Import Better Auth server action
    const { setPrimaryPhoneAction: authSetPrimaryPhone } = await import(
      '@repo/auth/server-actions'
    );

    const result = await authSetPrimaryPhone(prevState, formData);

    if (result.success) {
      return {
        success: true,
        message: 'Primary phone number updated successfully.',
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to set primary phone number.',
      };
    }
  } catch (error: any) {
    // console.error('Set primary phone error:', error);

    if (error?.message?.includes('not verified')) {
      return {
        success: false,
        error: 'Cannot set unverified phone number as primary. Please verify it first.',
      };
    }

    if (error?.message?.includes('not found')) {
      return {
        success: false,
        error: 'Phone number not found.',
      };
    }

    return {
      success: false,
      error: 'An error occurred while updating the primary phone number.',
    };
  }
}

// Server action for resending verification
async function resendVerificationAction(prevState: any, formData: FormData): Promise<FormState> {
  'use server';

  try {
    const phoneNumber = formData.get('phoneNumber') as string;

    if (!phoneNumber) {
      return {
        success: false,
        errors: { phoneNumber: ['Phone number is required'] },
      };
    }

    // Import Better Auth server action
    const { resendSMSCodeAction } = await import('@repo/auth/server-actions');

    const result = await resendSMSCodeAction(prevState, formData);

    if (result.success) {
      return {
        success: true,
        message: `Verification code sent to ${phoneNumber}!`,
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to send verification code.',
      };
    }
  } catch (error: any) {
    // console.error('Resend verification error:', error);

    if (error?.message?.includes('rate limit')) {
      return {
        success: false,
        error: 'Please wait before requesting another verification code.',
      };
    }

    return {
      success: false,
      error: 'An error occurred while sending the verification code.',
    };
  }
}

export function PhoneNumberManagement({
  phoneNumbers,
  title = 'Phone Numbers',
  subtitle = 'Manage your phone numbers for account security and recovery',
  allowMultiple = true,
  maxPhoneNumbers = 3,
  onSuccess,
  onError,
  className = '',
}: PhoneNumberManagementProps) {
  const [removeState, removeAction] = useFormState(
    removePhoneNumberAction,
    createInitialActionState(),
  );
  const [primaryState, primaryAction] = useFormState(
    setPrimaryPhoneAction,
    createInitialActionState(),
  );
  const [verifyState, verifyAction] = useFormState(
    resendVerificationAction,
    createInitialActionState(),
  );

  // Handle callbacks
  if (removeState?.success || primaryState?.success || verifyState?.success) {
    if (onSuccess) onSuccess();
  }

  if (removeState?.error && onError) {
    onError(removeState.error);
  }
  if (primaryState?.error && onError) {
    onError(primaryState.error);
  }
  if (verifyState?.error && onError) {
    onError(verifyState.error);
  }

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('+1') && phone.length === 12) {
      return `${phone.slice(0, 2)} (${phone.slice(2, 5)}) ${phone.slice(5, 8)}-${phone.slice(8)}`;
    }
    return phone;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className={cn('mx-auto w-full max-w-2xl', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={cn('text-2xl font-bold text-gray-900', 'dark:text-gray-100')}>
              {title}
            </h1>
            {subtitle && (
              <p className={cn('mt-2 text-sm text-gray-600', 'dark:text-gray-400')}>{subtitle}</p>
            )}
          </div>

          {allowMultiple && phoneNumbers.length < maxPhoneNumbers && (
            <Button
              variant="primary"
              onClick={() => {
                window.location.href = '/account/phone/setup';
              }}
            >
              Add Phone Number
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {removeState?.success && (
          <Alert variant="success" className="mb-4">
            {removeState.message}
          </Alert>
        )}

        {primaryState?.success && (
          <Alert variant="success" className="mb-4">
            {primaryState.message}
          </Alert>
        )}

        {verifyState?.success && (
          <Alert variant="success" className="mb-4">
            {verifyState.message}
          </Alert>
        )}

        {removeState?.error && (
          <Alert variant="destructive" className="mb-4">
            {removeState.error}
          </Alert>
        )}

        {primaryState?.error && (
          <Alert variant="destructive" className="mb-4">
            {primaryState.error}
          </Alert>
        )}

        {verifyState?.error && (
          <Alert variant="destructive" className="mb-4">
            {verifyState.error}
          </Alert>
        )}

        {phoneNumbers.length === 0 ? (
          <div className={cn('rounded-lg bg-gray-50 py-8 text-center', 'dark:bg-gray-800')}>
            <svg
              className="mx-auto mb-4 h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
              />
            </svg>
            <h3 className={cn('mb-2 text-lg font-medium text-gray-900', 'dark:text-gray-100')}>
              No phone numbers added
            </h3>
            <p className={cn('mb-4 text-sm text-gray-600', 'dark:text-gray-400')}>
              Add a phone number to enable SMS-based authentication and account recovery
            </p>
            <Button
              variant="primary"
              onClick={() => {
                window.location.href = '/account/phone/setup';
              }}
            >
              Add Your First Phone Number
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {phoneNumbers.map(phone => (
              <div
                key={phone.id}
                className={cn(
                  'rounded-lg border border-gray-200 p-4',
                  'dark:border-gray-700',
                  phone.isPrimary
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                    : '',
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-3">
                      <p className={cn('text-lg font-medium text-gray-900', 'dark:text-gray-100')}>
                        {formatPhoneNumber(phone.phoneNumber)}
                      </p>

                      <div className="flex items-center space-x-2">
                        {phone.isPrimary && (
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                              'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
                            )}
                          >
                            Primary
                          </span>
                        )}

                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                            phone.isVerified
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
                          )}
                        >
                          {phone.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>

                    <div className={cn('space-y-1 text-sm text-gray-600', 'dark:text-gray-400')}>
                      <p>Added on {formatDate(phone.addedAt)}</p>
                      {phone.lastUsed && <p>Last used {formatDate(phone.lastUsed)}</p>}
                    </div>
                  </div>

                  <div className="ml-4 flex items-center space-x-2">
                    {!phone.isVerified && (
                      <form action={verifyAction}>
                        <input type="hidden" name="phoneNumber" value={phone.phoneNumber} />
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          disabled={verifyState === undefined}
                        >
                          {verifyState === undefined ? 'Sending...' : 'Verify'}
                        </Button>
                      </form>
                    )}

                    {phone.isVerified && !phone.isPrimary && (
                      <form action={primaryAction}>
                        <input type="hidden" name="phoneNumberId" value={phone.id} />
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          disabled={primaryState === undefined}
                        >
                          {primaryState === undefined ? 'Setting...' : 'Set Primary'}
                        </Button>
                      </form>
                    )}

                    {(!phone.isPrimary || phoneNumbers.length > 1) && (
                      <form
                        action={removeAction}
                        onSubmit={e => {
                          if (!confirm('Are you sure you want to remove this phone number?')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="phoneNumberId" value={phone.id} />
                        <Button
                          type="submit"
                          variant="destructive"
                          size="sm"
                          disabled={removeState === undefined}
                        >
                          {removeState === undefined ? 'Removing...' : 'Remove'}
                        </Button>
                      </form>
                    )}
                  </div>
                </div>

                {phone.isVerified && (
                  <div className={cn('mt-3 border-t border-gray-200 pt-3', 'dark:border-gray-700')}>
                    <div className={cn('space-y-1 text-xs text-gray-600', 'dark:text-gray-400')}>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 1l3 3h4a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2h4l3-3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          SMS 2FA
                        </span>
                        <span className="flex items-center">
                          <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1H4v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Account Recovery
                        </span>
                        <span className="flex items-center">
                          <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Security Alerts
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
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
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className={cn('text-sm text-blue-800', 'dark:text-blue-200')}>
              <h4 className="mb-1 font-medium">Phone Number Security</h4>
              <ul className="list-inside list-disc space-y-1 text-xs">
                <li>Your primary phone number is used for critical security notifications</li>
                <li>Verified phone numbers can be used for SMS two-factor authentication</li>
                <li>Phone numbers help secure your account and enable account recovery</li>
                <li>We will never share your phone numbers with third parties</li>
                {allowMultiple && (
                  <li>You can add up to {maxPhoneNumbers} phone numbers to your account</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <a
            href="/account/settings"
            className={cn(
              'text-sm text-gray-600 hover:text-gray-500',
              'dark:text-gray-400 dark:hover:text-gray-300',
            )}
          >
            ← Back to Account Settings
          </a>

          {allowMultiple && phoneNumbers.length < maxPhoneNumbers && (
            <Button
              variant="outline"
              onClick={() => {
                window.location.href = '/account/phone/setup';
              }}
            >
              Add Another Number
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
