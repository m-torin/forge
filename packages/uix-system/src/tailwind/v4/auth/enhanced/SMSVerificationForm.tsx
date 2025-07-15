/**
 * Tailwind v4 RSC SMS Verification Form
 * 100% React Server Component for verifying SMS codes
 */

'use client';

import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { cn } from '../utils/dark-mode';

interface SMSVerificationFormProps extends BaseProps {
  phoneNumber: string;
  title?: string;
  subtitle?: string;
  codeLength?: number;
  resendCooldown?: number; // in seconds
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onResendSuccess?: () => void;
}

const initialState: FormState = { success: false };

// Server action for verifying SMS code
async function verifySMSCodeAction(prevState: any, formData: FormData): Promise<FormState> {
  'use server';

  try {
    const phoneNumber = formData.get('phoneNumber') as string;
    const code = formData.get('code') as string;

    // Validation
    const errors: Record<string, string[]> = {};

    if (!phoneNumber) errors.phoneNumber = ['Phone number is required'];
    if (!code) errors.code = ['Verification code is required'];
    if (code && !/^\d{6}$/.test(code)) {
      errors.code = ['Verification code must be 6 digits'];
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    // Import Better Auth server action
    const { verifySMSCodeAction: authVerifySMS } = await import('@repo/auth/server-actions');

    const result = await authVerifySMS(prevState, formData);

    if (result.success) {
      return {
        success: true,
        message: 'Phone number verified successfully! Your account is now more secure.',
      };
    } else {
      return {
        success: false,
        error: result.error || 'Invalid verification code. Please try again.',
      };
    }
  } catch (error: any) {
    console.error('SMS verification error:', error);

    if (error?.message?.includes('invalid code')) {
      return {
        success: false,
        errors: { code: ['Invalid verification code. Please check and try again.'] },
      };
    }

    if (error?.message?.includes('expired')) {
      return {
        success: false,
        error: 'Verification code has expired. Please request a new code.',
      };
    }

    if (error?.message?.includes('too many attempts')) {
      return {
        success: false,
        error: 'Too many failed attempts. Please wait 15 minutes before trying again.',
      };
    }

    if (error?.message?.includes('already verified')) {
      return {
        success: true,
        message: 'This phone number is already verified!',
      };
    }

    return {
      success: false,
      error: 'An error occurred during verification. Please try again.',
    };
  }
}

// Server action for resending SMS code
async function resendSMSCodeAction(prevState: any, formData: FormData): Promise<FormState> {
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
    const { resendSMSCodeAction: authResendSMS } = await import('@repo/auth/server-actions');

    const result = await authResendSMS(prevState, formData);

    if (result.success) {
      return {
        success: true,
        message: `New verification code sent to ${phoneNumber}!`,
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to resend verification code.',
      };
    }
  } catch (error: any) {
    console.error('SMS resend error:', error);

    if (error?.message?.includes('rate limit')) {
      return {
        success: false,
        error:
          'Please wait before requesting another code. You can request a new code every 60 seconds.',
      };
    }

    if (error?.message?.includes('daily limit')) {
      return {
        success: false,
        error: 'Daily SMS limit reached. Please try again tomorrow or contact support.',
      };
    }

    if (error?.message?.includes('carrier blocked')) {
      return {
        success: false,
        error: 'SMS messages to this number are currently blocked. Please contact support.',
      };
    }

    return {
      success: false,
      error: 'An error occurred while resending the code. Please try again.',
    };
  }
}

export function SMSVerificationForm({
  phoneNumber,
  title = 'Verify Your Phone Number',
  subtitle = 'Enter the 6-digit code sent to your phone',
  codeLength = 6,
  resendCooldown = 60,
  onSuccess,
  onError,
  onResendSuccess,
  className = '',
}: SMSVerificationFormProps) {
  const [verifyState, verifyAction] = useFormState(verifySMSCodeAction, createInitialActionState());
  const [resendState, resendAction] = useFormState(resendSMSCodeAction, createInitialActionState());
  const [code, setCode] = useState('');
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Start cooldown timer
  useEffect(() => {
    if (resendState?.success) {
      setCooldownRemaining(resendCooldown);
    }
  }, [resendState?.success, resendCooldown]);

  // Cooldown countdown
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setCooldownRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownRemaining]);

  // Auto-submit when code is complete
  useEffect(() => {
    if (code.length === codeLength && /^\d+$/.test(code)) {
      const form = new FormData();
      form.append('phoneNumber', phoneNumber);
      form.append('code', code);
      verifyAction(form);
    }
  }, [code, codeLength, phoneNumber, verifyAction]);

  // Handle callbacks
  if (verifyState?.success && onSuccess) {
    onSuccess();
  }

  if (verifyState?.error && onError) {
    onError(verifyState.error);
  }

  if (resendState?.success && onResendSuccess) {
    onResendSuccess();
  }

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    // Simple formatting for display
    if (phone.startsWith('+1') && phone.length === 12) {
      return `${phone.slice(0, 2)} (${phone.slice(2, 5)}) ${phone.slice(5, 8)}-${phone.slice(8)}`;
    }
    return phone;
  };

  return (
    <Card className={cn('mx-auto w-full max-w-md', className)}>
      <CardHeader>
        <div className="text-center">
          <div
            className={cn(
              'mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full',
              verifyState?.success
                ? 'bg-green-100 dark:bg-green-900/20'
                : 'bg-blue-100 dark:bg-blue-900/20',
            )}
          >
            {verifyState?.success ? (
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
                  d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
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
        {verifyState?.success && (
          <div className="space-y-4">
            <Alert variant="success">{verifyState.message}</Alert>

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
                  <h4 className="mb-1 font-medium">Phone number verified!</h4>
                  <p className="mb-2">
                    Your phone number {formatPhoneNumber(phoneNumber)} is now verified
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-xs">
                    <li>SMS two-factor authentication is now available</li>
                    <li>You can receive security notifications via SMS</li>
                    <li>Phone number can be used for account recovery</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                window.location.href = '/account/settings';
              }}
            >
              Continue to Account Settings
            </Button>
          </div>
        )}

        {/* Form State */}
        {!verifyState?.success && (
          <div className="space-y-4">
            {/* Error Messages */}
            {verifyState?.error && <Alert variant="destructive">{verifyState.error}</Alert>}

            {resendState?.error && <Alert variant="destructive">{resendState.error}</Alert>}

            {resendState?.success && <Alert variant="success">{resendState.message}</Alert>}

            {/* Phone Number Display */}
            <div className={cn('rounded-lg bg-gray-50 p-4', 'dark:bg-gray-800')}>
              <div className="text-center">
                <p className={cn('text-sm font-medium text-gray-700', 'dark:text-gray-300')}>
                  Verification code sent to:
                </p>
                <p className={cn('font-mono text-lg text-gray-900', 'dark:text-gray-100')}>
                  {formatPhoneNumber(phoneNumber)}
                </p>
              </div>
            </div>

            {/* Code Input */}
            <form action={verifyAction} className="space-y-4">
              <input type="hidden" name="phoneNumber" value={phoneNumber} />

              <div className="space-y-2">
                <label
                  className={cn('block text-sm font-medium text-gray-700', 'dark:text-gray-300')}
                >
                  Verification Code
                </label>
                <div className="flex justify-center">
                  <input
                    name="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={codeLength}
                    value={code}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setCode(value);
                    }}
                    className={cn(
                      'w-full px-4 py-3 text-center font-mono text-2xl',
                      'rounded-md border border-gray-300 shadow-sm',
                      'focus:border-blue-500 focus:outline-none focus:ring-blue-500',
                      'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
                      'dark:focus:border-blue-400 dark:focus:ring-blue-400',
                      verifyState?.errors?.code ? 'border-red-500 dark:border-red-400' : '',
                    )}
                    placeholder="000000"
                    autoComplete="one-time-code"
                    required
                  />
                </div>
                {verifyState?.errors?.code && (
                  <p className={cn('text-center text-sm text-red-600', 'dark:text-red-400')}>
                    {verifyState.errors.code[0]}
                  </p>
                )}
                <p className={cn('text-center text-xs text-gray-600', 'dark:text-gray-400')}>
                  Enter the {codeLength}-digit code sent to your phone
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={verifyState === undefined || code.length !== codeLength}
              >
                {verifyState === undefined ? 'Verifying...' : 'Verify Phone Number'}
              </Button>
            </form>

            {/* Resend Code */}
            <div className="space-y-3">
              <div className="text-center">
                <p className={cn('text-sm text-gray-600', 'dark:text-gray-400')}>
                  Didn't receive the code?
                </p>
              </div>

              <form action={resendAction}>
                <input type="hidden" name="phoneNumber" value={phoneNumber} />
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  disabled={resendState === undefined || cooldownRemaining > 0}
                >
                  {resendState === undefined
                    ? 'Resending...'
                    : cooldownRemaining > 0
                      ? `Resend code in ${cooldownRemaining}s`
                      : 'Resend verification code'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Help Information */}
        <div className={cn('mt-6 rounded-lg bg-gray-50 p-4', 'dark:bg-gray-800')}>
          <h4 className={cn('mb-2 text-sm font-medium text-gray-900', 'dark:text-gray-100')}>
            Having trouble?
          </h4>
          <div className={cn('space-y-1 text-xs text-gray-600', 'dark:text-gray-400')}>
            <p>• Make sure your phone can receive SMS messages</p>
            <p>• Check that the phone number is correct</p>
            <p>• Verification codes expire after 10 minutes</p>
            <p>• Contact support if you continue having issues</p>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="mt-6 space-y-3">
          <div className="text-center">
            <a
              href="/account/phone/setup"
              className={cn(
                'text-sm text-gray-600 hover:text-gray-500',
                'dark:text-gray-400 dark:hover:text-gray-300',
              )}
            >
              Use a different phone number
            </a>
          </div>

          <div className="text-center">
            <a
              href="/account/settings"
              className={cn(
                'text-sm text-gray-500 hover:text-gray-400',
                'dark:text-gray-500 dark:hover:text-gray-400',
              )}
            >
              Skip for now and return to settings
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
