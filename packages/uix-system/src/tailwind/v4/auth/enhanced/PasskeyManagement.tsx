/**
 * Tailwind v4 RSC Passkey Management
 * 100% React Server Component for managing WebAuthn passkeys
 */

import { useFormState } from 'react-dom';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { cn } from '../utils/dark-mode';

interface Passkey {
  id: string;
  name: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  deviceType: 'platform' | 'cross-platform' | 'unknown';
  isBackupEligible: boolean;
  isBackedUp: boolean;
  createdAt: string;
  lastUsed?: string;
  userAgent?: string;
}

interface PasskeyManagementProps extends BaseProps {
  passkeys: Passkey[];
  title?: string;
  subtitle?: string;
  maxPasskeys?: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const _initialState: FormState = { success: false };

// Server action for removing passkey
async function removePasskeyAction(prevState: any, formData: FormData): Promise<FormState> {
  'use server';

  try {
    const passkeyId = formData.get('passkeyId') as string;

    if (!passkeyId) {
      return {
        success: false,
        errors: { passkeyId: ['Passkey ID is required'] },
      };
    }

    // Import Better Auth server action
    const { removePasskeyAction: authRemovePasskey } = await import('@repo/auth/server-actions');

    const result = await authRemovePasskey(prevState, formData);

    if (result.success) {
      return {
        success: true,
        message: 'Passkey removed successfully.',
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to remove passkey.',
      };
    }
  } catch (error: any) {
    // console.error('Remove passkey error:', error);

    if (error?.message?.includes('not found')) {
      return {
        success: false,
        error: 'Passkey not found.',
      };
    }

    if (error?.message?.includes('last passkey')) {
      return {
        success: false,
        error: 'Cannot remove the last passkey. Add another authentication method first.',
      };
    }

    return {
      success: false,
      error: 'An error occurred while removing the passkey.',
    };
  }
}

// Server action for renaming passkey
async function renamePasskeyAction(prevState: any, formData: FormData): Promise<FormState> {
  'use server';

  try {
    const passkeyId = formData.get('passkeyId') as string;
    const newName = formData.get('newName') as string;

    if (!passkeyId || !newName) {
      return {
        success: false,
        errors: { newName: ['Passkey name is required'] },
      };
    }

    if (newName.length < 1 || newName.length > 50) {
      return {
        success: false,
        errors: { newName: ['Passkey name must be between 1 and 50 characters'] },
      };
    }

    // Import Better Auth server action
    const { renamePasskeyAction: authRenamePasskey } = await import('@repo/auth/server-actions');

    const result = await authRenamePasskey(prevState, formData);

    if (result.success) {
      return {
        success: true,
        message: 'Passkey renamed successfully.',
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to rename passkey.',
      };
    }
  } catch (error: any) {
    // console.error('Rename passkey error:', error);

    if (error?.message?.includes('not found')) {
      return {
        success: false,
        error: 'Passkey not found.',
      };
    }

    if (error?.message?.includes('duplicate name')) {
      return {
        success: false,
        errors: { newName: ['A passkey with this name already exists'] },
      };
    }

    return {
      success: false,
      error: 'An error occurred while renaming the passkey.',
    };
  }
}

export function PasskeyManagement({
  passkeys,
  title = 'Passkeys',
  subtitle = 'Manage your passkeys for passwordless authentication',
  maxPasskeys = 10,
  onSuccess,
  onError,
  className = '',
}: PasskeyManagementProps) {
  const [removeState, removeAction] = useFormState(removePasskeyAction, createInitialActionState());
  const [renameState, renameAction] = useFormState(renamePasskeyAction, createInitialActionState());

  // Handle callbacks
  if (removeState?.success || renameState?.success) {
    if (onSuccess) onSuccess();
  }

  if (removeState?.error && onError) {
    onError(removeState.error);
  }
  if (renameState?.error && onError) {
    onError(renameState.error);
  }

  // Get device icon based on type
  const getDeviceIcon = (deviceType: Passkey['deviceType'], _isBackupEligible: boolean) => {
    if (deviceType === 'platform') {
      return (
        <svg
          className="h-5 w-5 text-blue-600 dark:text-blue-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    }

    if (deviceType === 'cross-platform') {
      return (
        <svg
          className="h-5 w-5 text-green-600 dark:text-green-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 8v.5c0 .588.082 1.152.231 1.684.16.571.391 1.091.691 1.540.3.45.679.822 1.125 1.096l3.458 2.124a1 1 0 00.99 0l3.458-2.124A4.24 4.24 0 0016 10.5V8a1 1 0 00.504-1.868l-7-4zM6 9a1 1 0 012 0v2a1 1 0 11-2 0V9zm6 0a1 1 0 012 0v2a1 1 0 11-2 0V9z"
            clipRule="evenodd"
          />
        </svg>
      );
    }

    return (
      <svg
        className="h-5 w-5 text-gray-600 dark:text-gray-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1H4v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  // Get device type label
  const getDeviceTypeLabel = (deviceType: Passkey['deviceType'], isBackupEligible: boolean) => {
    switch (deviceType) {
      case 'platform':
        return isBackupEligible ? 'Device (Synced)' : 'Device (Local)';
      case 'cross-platform':
        return 'Security Key';
      default:
        return 'Unknown Device';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Truncate credential ID for display
  const truncateCredentialId = (credentialId: string) => {
    return `${credentialId.slice(0, 8)}...${credentialId.slice(-8)}`;
  };

  return (
    <Card className={cn('mx-auto w-full max-w-4xl', className)}>
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

          {passkeys.length < maxPasskeys && (
            <Button
              variant="primary"
              onClick={() => {
                window.location.href = '/account/passkeys/register';
              }}
            >
              Add Passkey
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

        {renameState?.success && (
          <Alert variant="success" className="mb-4">
            {renameState.message}
          </Alert>
        )}

        {removeState?.error && (
          <Alert variant="destructive" className="mb-4">
            {removeState.error}
          </Alert>
        )}

        {renameState?.error && (
          <Alert variant="destructive" className="mb-4">
            {renameState.error}
          </Alert>
        )}

        <div
          className={cn(
            'mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4',
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
              <h4 className="mb-1 font-medium">About Passkeys</h4>
              <p className="mb-2">
                Passkeys provide secure, passwordless authentication using your device's built-in
                security.
              </p>
              <ul className="list-inside list-disc space-y-1 text-xs">
                <li>
                  <strong>Platform authenticators</strong> use your device's built-in security (Face
                  ID, Touch ID, Windows Hello)
                </li>
                <li>
                  <strong>Security keys</strong> are external devices that you plug in or tap
                </li>
                <li>
                  <strong>Synced passkeys</strong> work across your devices when backed up to
                  iCloud, Google, etc.
                </li>
                <li>Passkeys are more secure than passwords and cannot be phished</li>
              </ul>
            </div>
          </div>
        </div>

        {passkeys.length === 0 ? (
          <div className={cn('rounded-lg bg-gray-50 py-8 text-center', 'dark:bg-gray-800')}>
            <svg
              className="mx-auto mb-4 h-12 w-12 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1H4v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className={cn('mb-2 text-lg font-medium text-gray-900', 'dark:text-gray-100')}>
              No passkeys registered
            </h3>
            <p className={cn('mb-4 text-sm text-gray-600', 'dark:text-gray-400')}>
              Add a passkey to enable secure, passwordless authentication
            </p>
            <Button
              variant="primary"
              onClick={() => {
                window.location.href = '/account/passkeys/register';
              }}
            >
              Register Your First Passkey
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {passkeys.map(passkey => (
              <div
                key={passkey.id}
                className={cn(
                  'rounded-lg border border-gray-200 p-6',
                  'dark:border-gray-700',
                  'transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50',
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-1 items-start space-x-4">
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-full',
                        passkey.deviceType === 'platform'
                          ? 'bg-blue-100 dark:bg-blue-900/20'
                          : passkey.deviceType === 'cross-platform'
                            ? 'bg-green-100 dark:bg-green-900/20'
                            : 'bg-gray-100 dark:bg-gray-800',
                      )}
                    >
                      {getDeviceIcon(passkey.deviceType, passkey.isBackupEligible)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center space-x-3">
                        <h3
                          className={cn(
                            'truncate text-lg font-medium text-gray-900',
                            'dark:text-gray-100',
                          )}
                        >
                          {passkey.name}
                        </h3>

                        <div className="flex items-center space-x-2">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                              passkey.deviceType === 'platform'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
                                : passkey.deviceType === 'cross-platform'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200',
                            )}
                          >
                            {getDeviceTypeLabel(passkey.deviceType, passkey.isBackupEligible)}
                          </span>

                          {passkey.isBackedUp && (
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                                'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
                              )}
                            >
                              Backed Up
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={cn('space-y-2 text-sm text-gray-600', 'dark:text-gray-400')}>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <p>
                              <strong>Created:</strong> {formatDate(passkey.createdAt)}
                            </p>
                            {passkey.lastUsed && (
                              <p>
                                <strong>Last used:</strong> {formatDate(passkey.lastUsed)}
                              </p>
                            )}
                          </div>
                          <div>
                            <p>
                              <strong>Credential ID:</strong>{' '}
                              {truncateCredentialId(passkey.credentialId)}
                            </p>
                            <p>
                              <strong>Sign-in count:</strong> {passkey.counter}
                            </p>
                          </div>
                        </div>

                        {passkey.userAgent && (
                          <div
                            className={cn(
                              'mt-2 rounded bg-gray-50 p-2 text-xs text-gray-500',
                              'dark:bg-gray-800 dark:text-gray-500',
                            )}
                          >
                            <strong>User Agent:</strong> {passkey.userAgent}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newName = prompt('Enter new name for this passkey:', passkey.name);
                        if (newName && newName !== passkey.name) {
                          const form = new FormData();
                          form.append('passkeyId', passkey.id);
                          form.append('newName', newName);
                          renameAction(form);
                        }
                      }}
                      disabled={renameState === undefined}
                    >
                      {renameState === undefined ? 'Renaming...' : 'Rename'}
                    </Button>

                    {passkeys.length > 1 && (
                      <form action={removeAction}>
                        <input type="hidden" name="passkeyId" value={passkey.id} />
                        <Button
                          type="submit"
                          variant="destructive"
                          size="sm"
                          disabled={removeState === undefined}
                          onClick={() => {
                            return confirm(
                              `Are you sure you want to remove the passkey "${passkey.name}"?`,
                            );
                          }}
                        >
                          {removeState === undefined ? 'Removing...' : 'Remove'}
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          className={cn(
            'mt-6 rounded-lg border border-green-200 bg-green-50 p-4',
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
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div className={cn('text-sm text-green-800', 'dark:text-green-200')}>
              <h4 className="mb-1 font-medium">Passkey Security Benefits</h4>
              <ul className="list-inside list-disc space-y-1 text-xs">
                <li>Passkeys are phishing-resistant and cannot be stolen in data breaches</li>
                <li>Each passkey is unique to your account and this website</li>
                <li>Your biometric data never leaves your device</li>
                <li>
                  Passkeys work offline and don't require an internet connection to authenticate
                </li>
                <li>You can have up to {maxPasskeys} passkeys for backup and convenience</li>
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

          {passkeys.length < maxPasskeys && (
            <Button
              variant="outline"
              onClick={() => {
                window.location.href = '/account/passkeys/register';
              }}
            >
              Add Another Passkey
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
