/**
 * Tailwind v4 RSC Email Change Verification
 * 100% React Server Component for email address change verification
 */

import { useFormState } from 'react-dom';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

import {
  cancelEmailChangeAction,
  confirmEmailChangeAction,
  initiateEmailChangeAction,
} from './actions';

interface EmailChangeVerificationProps extends BaseProps {
  currentEmail: string;
  pendingEmail?: string;
  title?: string;
  subtitle?: string;
  showCancelButton?: boolean;
  onCancel?: () => void;
  onVerificationComplete?: (newEmail: string) => void;
}

const initialState: FormState = { success: false };

export function EmailChangeVerification({
  currentEmail,
  pendingEmail,
  title = 'Change Email Address',
  subtitle = 'Update your account email address with verification',
  showCancelButton = true,
  onCancel,
  onVerificationComplete,
  className = '',
}: EmailChangeVerificationProps) {
  const [initiateState, initiateAction] = useFormState(
    initiateEmailChangeAction,
    createInitialActionState(),
  );
  const [confirmState, confirmAction] = useFormState(
    confirmEmailChangeAction,
    createInitialActionState(),
  );
  const [cancelState, cancelAction] = useFormState(
    cancelEmailChangeAction,
    createInitialActionState(),
  );

  return (
    <Card className={`mx-auto w-full max-w-lg ${className}`}>
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
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 21.75 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
        </div>
      </CardHeader>

      <CardContent>
        {/* Current Email Display */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Current Email</p>
              <p className="text-lg text-gray-900">{currentEmail}</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
              Verified
            </span>
          </div>
        </div>

        {/* Pending Email Change Status */}
        {pendingEmail && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start">
              <svg
                className="mr-3 mt-0.5 h-5 w-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800">Pending Email Change</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Verification pending for: <strong>{pendingEmail}</strong>
                </p>
                <p className="mt-1 text-xs text-yellow-600">
                  Check your new email address for the verification link
                </p>
              </div>
            </div>

            {/* Cancel Pending Change */}
            <div className="mt-4 flex gap-2">
              <form action={cancelAction} className="inline">
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={cancelState === undefined}
                >
                  Cancel Request
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {(initiateState?.error || confirmState?.error || cancelState?.error) && (
          <Alert variant="destructive" className="mb-4">
            {initiateState?.error || confirmState?.error || cancelState?.error}
          </Alert>
        )}

        {(initiateState?.success || confirmState?.success || cancelState?.success) && (
          <Alert variant="success" className="mb-4">
            {initiateState?.message || confirmState?.message || cancelState?.message}
          </Alert>
        )}

        {/* Email Change Form */}
        {!pendingEmail && (
          <form action={initiateAction} className="space-y-4">
            <Input
              name="newEmail"
              type="email"
              label="New Email Address"
              placeholder="Enter your new email address"
              required
              error={initiateState?.errors?.newEmail?.[0]}
              description="We'll send a verification link to this address"
            />

            <Input
              name="password"
              type="password"
              label="Current Password"
              placeholder="Enter your current password"
              required
              autoComplete="current-password"
              error={initiateState?.errors?.password?.[0]}
              description="Required to verify your identity"
            />

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
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
                <div className="text-sm text-blue-800">
                  <h4 className="mb-1 font-medium">Email Change Process</h4>
                  <ul className="list-inside list-disc space-y-1 text-xs">
                    <li>We'll send a verification link to your new email address</li>
                    <li>Your current email will remain active until verification</li>
                    <li>Click the verification link to complete the change</li>
                    <li>You can cancel the request at any time before verification</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={initiateState === undefined}
              >
                {initiateState === undefined ? 'Sending...' : 'Send Verification Email'}
              </Button>
              {showCancelButton && onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        )}

        {/* Manual Token Entry (for cases where user has token) */}
        {pendingEmail && (
          <div>
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h3 className="mb-3 text-sm font-medium text-gray-900">Have a verification token?</h3>

              <form action={confirmAction} className="space-y-4">
                <Input
                  name="token"
                  type="text"
                  label="Verification Token"
                  placeholder="Enter the token from your email"
                  required
                  error={confirmState?.errors?.token?.[0]}
                  description="Copy and paste the verification token from your email"
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={confirmState === undefined}
                >
                  {confirmState === undefined ? 'Verifying...' : 'Verify Email Change'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Help Information */}
        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <h4 className="mb-2 text-sm font-medium text-gray-900">Need Help?</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <p>• If you don't receive the verification email, check your spam folder</p>
            <p>• Verification links expire after 24 hours for security</p>
            <p>• You can request a new email change if the current one expires</p>
            <p>• Contact support if you have trouble accessing your new email</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
