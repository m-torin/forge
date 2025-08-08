/**
 * Tailwind v4 RSC Two-Factor Authentication Setup
 * 100% React Server Component with server actions
 */

import { useState, useTransition } from 'react';
import { useFormState } from 'react-dom';
import { enableTwoFactorAction, verifyTwoFactorSetupAction } from '../actions';
import type { BaseProps, FormState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

interface TwoFactorSetupProps extends BaseProps {
  qrCodeUrl?: string;
  secret?: string;
  backupCodes?: string[];
  isEnabled?: boolean;
}

const initialState: FormState = { success: false };

type VerifyState =
  | { success: false; errors: { code: string[] } }
  | { success: true; message: string }
  | { success: false; error: string };

const initialVerifyState: VerifyState = { success: false, error: '' };

export function TwoFactorSetup({
  className = '',
  qrCodeUrl,
  secret,
  backupCodes,
  isEnabled = false,
}: TwoFactorSetupProps) {
  const [isPending, startTransition] = useTransition();
  const [setupState, setSetupState] = useState(initialState);
  const [verifyState, verifyAction] = useFormState(verifyTwoFactorSetupAction, initialVerifyState);

  const handleEnableTwoFactor = async () => {
    startTransition(async () => {
      try {
        const _result = await enableTwoFactorAction();
        setSetupState({ success: true, message: 'Two-factor authentication enabled successfully' });
      } catch (error) {
        setSetupState({
          success: false,
          error:
            error instanceof Error ? error.message : 'Failed to enable two-factor authentication',
        });
      }
    });
  };

  if (isEnabled) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Two-Factor Authentication Enabled
              </h3>
              <p className="text-sm text-gray-500">Your account is protected with 2FA</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Two-factor authentication adds an extra layer of security to your account. When
              enabled, you'll need to enter a code from your authenticator app when signing in.
            </p>
            <Button variant="outline" className="w-full">
              Regenerate Backup Codes
            </Button>
            <Button variant="destructive" className="w-full">
              Disable Two-Factor Authentication
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Setup flow
  if (!qrCodeUrl && !secret) {
    return (
      <Card className={className}>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Enable Two-Factor Authentication</h3>
          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
        </CardHeader>
        <CardContent>
          {setupState?.error && (
            <Alert type="error" className="mb-4">
              {setupState.error}
            </Alert>
          )}

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Two-factor authentication (2FA) adds an extra layer of security to your account.
              You'll need an authenticator app like Google Authenticator, Authy, or 1Password.
            </p>

            <Button
              type="button"
              variant="primary"
              loading={isPending}
              onClick={handleEnableTwoFactor}
            >
              Start Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Verification step
  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-medium text-gray-900">Complete Two-Factor Setup</h3>
        <p className="text-sm text-gray-500">
          Scan the QR code and verify with your authenticator app
        </p>
      </CardHeader>
      <CardContent>
        {verifyState?.error && (
          <Alert type="error" className="mb-4">
            {verifyState.error}
          </Alert>
        )}

        {verifyState?.success && (
          <Alert type="success" className="mb-4">
            Two-factor authentication has been successfully enabled!
          </Alert>
        )}

        <div className="space-y-6">
          <div>
            <h4 className="mb-3 text-sm font-medium text-gray-900">Step 1: Scan QR Code</h4>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="2FA QR Code" className="mx-auto h-48 w-48" />
              ) : (
                <div className="mx-auto flex h-48 w-48 items-center justify-center bg-gray-100">
                  <span className="text-gray-400">QR Code</span>
                </div>
              )}
            </div>

            {secret && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-500">
                  Can't scan? Enter code manually
                </summary>
                <div className="mt-2 rounded border bg-gray-50 p-3">
                  <p className="mb-1 text-xs text-gray-600">Secret key:</p>
                  <code className="break-all font-mono text-sm">{secret}</code>
                </div>
              </details>
            )}
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-gray-900">
              Step 2: Enter Verification Code
            </h4>
            <form action={verifyAction} className="space-y-4">
              <Input
                name="code"
                type="text"
                label="6-digit code"
                placeholder="123456"
                required
                autoComplete="one-time-code"
                error={verifyState?.errors?.code?.[0]}
                description="Enter the 6-digit code from your authenticator app"
              />

              <div className="flex space-x-3">
                <Button type="submit" variant="primary" loading={verifyState === undefined}>
                  Verify & Enable
                </Button>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </div>

          {backupCodes && backupCodes.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-900">Step 3: Save Backup Codes</h4>
              <Alert type="warning" className="mb-3">
                Save these backup codes in a safe place. You can use them to access your account if
                you lose your authenticator device.
              </Alert>
              <div className="rounded-lg border bg-gray-50 p-4">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map(code => (
                    <div key={code} className="rounded border bg-white p-2">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
