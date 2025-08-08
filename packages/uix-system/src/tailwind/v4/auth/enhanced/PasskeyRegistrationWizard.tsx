/**
 * Tailwind v4 RSC Passkey Registration Wizard
 * 100% React Server Component for step-by-step passkey registration with WebAuthn
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { cn } from '../utils/dark-mode';

type RegistrationStep = 'check-support' | 'name-passkey' | 'create-passkey' | 'success' | 'error';

interface PasskeyRegistrationWizardProps extends BaseProps {
  title?: string;
  subtitle?: string;
  onSuccess?: (passkeyInfo: { id: string; name: string }) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

const _initialState: FormState = { success: false };

// Server action for initiating passkey registration
async function initiatePasskeyRegistrationAction(
  prevState: any,
  formData: FormData,
): Promise<FormState> {
  'use server';

  try {
    const passkeyName = formData.get('passkeyName') as string;

    if (!passkeyName || passkeyName.trim().length === 0) {
      return {
        success: false,
        errors: { passkeyName: ['Passkey name is required'] },
      };
    }

    if (passkeyName.length > 50) {
      return {
        success: false,
        errors: { passkeyName: ['Passkey name must be 50 characters or less'] },
      };
    }

    // Import Better Auth server action
    const { initiatePasskeyRegistrationAction: authInitiatePasskey } = await import(
      '@repo/auth/server-actions'
    );

    const result = await authInitiatePasskey(prevState, formData);

    if (result.success) {
      return {
        success: true,
        message: 'Passkey registration initiated successfully.',
        data: {
          challenge: result.data?.challenge || '',
          passkeyName,
          registrationOptions:
            (result as any).data?.registrationOptions || (result as any).registrationOptions || {},
        },
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to initiate passkey registration.',
      };
    }
  } catch (error: any) {
    // console.error('Passkey registration initiation error:', error);

    if (error?.message?.includes('duplicate name')) {
      return {
        success: false,
        errors: { passkeyName: ['A passkey with this name already exists'] },
      };
    }

    if (error?.message?.includes('limit exceeded')) {
      return {
        success: false,
        error: 'Maximum number of passkeys reached. Please remove an existing passkey first.',
      };
    }

    return {
      success: false,
      error: 'An error occurred while initiating passkey registration.',
    };
  }
}

// Server action for completing passkey registration
async function completePasskeyRegistrationAction(
  prevState: any,
  formData: FormData,
): Promise<FormState> {
  'use server';

  try {
    const challenge = formData.get('challenge') as string;
    const passkeyName = formData.get('passkeyName') as string;
    const credential = formData.get('credential') as string;

    if (!challenge || !passkeyName || !credential) {
      return {
        success: false,
        error: 'Missing required registration data.',
      };
    }

    // Import Better Auth server action
    const { completePasskeyRegistrationAction: authCompletePasskey } = await import(
      '@repo/auth/server-actions'
    );

    const result = await authCompletePasskey(prevState, formData);

    if (result.success) {
      return {
        success: true,
        message: 'Passkey registered successfully!',
        data: {
          passkeyId: (result as any).data?.passkeyId || (result as any).passkeyId || '',
          passkeyName,
        },
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to complete passkey registration.',
      };
    }
  } catch (error: any) {
    // console.error('Passkey registration completion error:', error);

    if (error?.message?.includes('invalid credential')) {
      return {
        success: false,
        error: 'Invalid passkey credential. Please try again.',
      };
    }

    if (error?.message?.includes('already registered')) {
      return {
        success: false,
        error: 'This passkey is already registered to your account.',
      };
    }

    return {
      success: false,
      error: 'An error occurred while completing passkey registration.',
    };
  }
}

export function PasskeyRegistrationWizard({
  title = 'Register New Passkey',
  subtitle = 'Add a new passkey for secure, passwordless authentication',
  onSuccess,
  onError,
  onCancel,
  className = '',
}: PasskeyRegistrationWizardProps) {
  const [step, setStep] = useState<RegistrationStep>('check-support');
  const [passkeyName, setPasskeyName] = useState('');
  const [_isWebAuthnSupported, setIsWebAuthnSupported] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);

  const [initiateState, initiateAction] = useFormState(
    initiatePasskeyRegistrationAction,
    createInitialActionState(),
  );
  const [completeState, completeAction] = useFormState(
    completePasskeyRegistrationAction,
    createInitialActionState(),
  );

  // WebAuthn registration process
  const startWebAuthnRegistration = useCallback(
    async (options: any) => {
      try {
        // Convert challenge and user ID from base64
        const decodedOptions = {
          ...options,
          challenge: Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)),
          user: {
            ...options.user,
            id: Uint8Array.from(atob(options.user.id), c => c.charCodeAt(0)),
          },
        };

        // Create credential
        const credential = (await navigator.credentials.create({
          publicKey: decodedOptions,
        })) as PublicKeyCredential;

        if (!credential) {
          throw new Error('Failed to create credential');
        }

        // Prepare credential data for server
        const credentialData = {
          id: credential.id,
          rawId: Array.from(new Uint8Array(credential.rawId)),
          response: {
            attestationObject: Array.from(
              new Uint8Array(
                (credential.response as AuthenticatorAttestationResponse).attestationObject,
              ),
            ),
            clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
          },
          type: credential.type,
        };

        // Submit to server
        const form = new FormData();
        form.append('challenge', registrationData.challenge);
        form.append('passkeyName', registrationData.passkeyName);
        form.append('credential', JSON.stringify(credentialData));

        completeAction(form);
      } catch (error: any) {
        // console.error('WebAuthn registration error:', error);

        let errorMessage = 'Failed to create passkey. ';

        if (error.name === 'NotSupportedError') {
          errorMessage += "Your device or browser doesn't support this type of passkey.";
        } else if (error.name === 'SecurityError') {
          errorMessage += "Security error occurred. Please ensure you're on a secure connection.";
        } else if (error.name === 'NotAllowedError') {
          errorMessage += 'Passkey creation was cancelled or not allowed.';
        } else if (error.name === 'InvalidStateError') {
          errorMessage += 'This passkey is already registered.';
        } else {
          errorMessage += 'Please try again.';
        }

        setStep('error');
        if (onError) onError(errorMessage);
      }
    },
    [registrationData, completeAction, onError],
  );

  // Check WebAuthn support on component mount
  useEffect(() => {
    const checkSupport = () => {
      if (!window.PublicKeyCredential) {
        setStep('error');
        return;
      }

      setIsWebAuthnSupported(true);
      setStep('name-passkey');
    };

    checkSupport();
  }, []);

  // Handle passkey registration initiation
  useEffect(() => {
    if (initiateState?.success && initiateState?.data) {
      setRegistrationData(initiateState.data);
      setStep('create-passkey');

      // Start WebAuthn registration
      startWebAuthnRegistration(initiateState.data.registrationOptions);
    } else if (initiateState?.error) {
      setStep('error');
      if (onError) onError(initiateState.error);
    }
  }, [initiateState, onError, startWebAuthnRegistration]);

  // Handle passkey registration completion
  useEffect(() => {
    if (completeState?.success && completeState?.data) {
      setStep('success');
      if (onSuccess) {
        onSuccess({
          id: completeState.data.passkeyId,
          name: completeState.data.passkeyName,
        });
      }
    } else if (completeState?.error) {
      setStep('error');
      if (onError) onError(completeState.error);
    }
  }, [completeState, onSuccess, onError]);

  const getStepIcon = () => {
    switch (step) {
      case 'check-support':
        return (
          <svg
            className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      case 'name-passkey':
        return (
          <svg
            className="h-8 w-8 text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
            />
          </svg>
        );
      case 'create-passkey':
        return (
          <svg
            className="h-8 w-8 animate-pulse text-blue-600 dark:text-blue-400"
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
      case 'success':
        return (
          <svg
            className="h-8 w-8 text-green-600 dark:text-green-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'error':
        return (
          <svg
            className="h-8 w-8 text-red-600 dark:text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'check-support':
        return 'Checking Device Compatibility';
      case 'name-passkey':
        return 'Name Your Passkey';
      case 'create-passkey':
        return 'Creating Your Passkey';
      case 'success':
        return 'Passkey Created Successfully!';
      case 'error':
        return 'Registration Failed';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'check-support':
        return 'Verifying that your device supports passkey authentication...';
      case 'name-passkey':
        return 'Give your passkey a memorable name so you can identify it later';
      case 'create-passkey':
        return "Follow your device's prompts to create your passkey";
      case 'success':
        return 'Your new passkey has been registered and is ready to use';
      case 'error':
        return 'Something went wrong during passkey registration';
    }
  };

  return (
    <Card className={cn('mx-auto w-full max-w-md', className)}>
      <CardHeader>
        <div className="text-center">
          <div
            className={cn(
              'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full',
              step === 'success'
                ? 'bg-green-100 dark:bg-green-900/20'
                : step === 'error'
                  ? 'bg-red-100 dark:bg-red-900/20'
                  : 'bg-blue-100 dark:bg-blue-900/20',
            )}
          >
            {getStepIcon()}
          </div>
          <h1 className={cn('text-2xl font-bold text-gray-900', 'dark:text-gray-100')}>{title}</h1>
          {subtitle && (
            <p className={cn('mt-2 text-sm text-gray-600', 'dark:text-gray-400')}>{subtitle}</p>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-center space-x-2">
            {['check-support', 'name-passkey', 'create-passkey', 'success'].map(
              (stepName, index) => (
                <div key={stepName} className="flex items-center">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                      step === stepName
                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                        : ['check-support', 'name-passkey', 'create-passkey', 'success'].indexOf(
                              step,
                            ) > index
                          ? 'bg-green-600 text-white dark:bg-green-500'
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
                    )}
                  >
                    {['check-support', 'name-passkey', 'create-passkey', 'success'].indexOf(step) >
                    index ? (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < 3 && (
                    <div
                      className={cn(
                        'h-0.5 w-12',
                        ['check-support', 'name-passkey', 'create-passkey', 'success'].indexOf(
                          step,
                        ) > index
                          ? 'bg-green-600 dark:bg-green-500'
                          : 'bg-gray-200 dark:bg-gray-700',
                      )}
                    />
                  )}
                </div>
              ),
            )}
          </div>

          <div className="text-center">
            <h2 className={cn('text-lg font-semibold text-gray-900', 'dark:text-gray-100')}>
              {getStepTitle()}
            </h2>
            <p className={cn('text-sm text-gray-600', 'dark:text-gray-400')}>
              {getStepDescription()}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {step === 'check-support' && (
            <div className="py-8 text-center">
              <div className={cn('text-sm text-gray-600', 'dark:text-gray-400')}>
                <p>Please wait while we check if your device supports passkeys...</p>
              </div>
            </div>
          )}

          {step === 'name-passkey' && (
            <form action={initiateAction} className="space-y-4">
              {initiateState?.error && <Alert variant="destructive">{initiateState.error}</Alert>}

              <Input
                name="passkeyName"
                type="text"
                label="Passkey Name"
                placeholder="e.g., My iPhone, Work Laptop, YubiKey"
                value={passkeyName}
                onChange={e => setPasskeyName(e.target.value)}
                required
                maxLength={50}
                error={initiateState?.errors?.passkeyName?.[0]}
                description="Choose a name that helps you identify this passkey"
              />

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
                    <h4 className="mb-1 font-medium">What happens next?</h4>
                    <ul className="list-inside list-disc space-y-1 text-xs">
                      <li>Your device will prompt you to create a passkey</li>
                      <li>You might be asked to use Face ID, Touch ID, or your device PIN</li>
                      <li>The passkey will be securely stored on your device</li>
                      <li>You can use it to sign in without passwords</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={initiateState === undefined || !passkeyName.trim()}
              >
                {initiateState === undefined ? 'Creating...' : 'Create Passkey'}
              </Button>
            </form>
          )}

          {step === 'create-passkey' && (
            <div className="space-y-4 py-8 text-center">
              <div
                className={cn(
                  'rounded-lg border border-yellow-200 bg-yellow-50 p-4',
                  'dark:border-yellow-800 dark:bg-yellow-900/20',
                )}
              >
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
                  <div className={cn('text-sm text-yellow-800', 'dark:text-yellow-200')}>
                    <h4 className="mb-1 font-medium">Complete on your device</h4>
                    <p>
                      Follow the prompts on your device to complete passkey creation. This may
                      include:
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
                      <li>Using your fingerprint or face recognition</li>
                      <li>Entering your device PIN or password</li>
                      <li>Pressing a button on your security key</li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className={cn('text-sm text-gray-600', 'dark:text-gray-400')}>
                Creating passkey for: <strong>{registrationData?.passkeyName}</strong>
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-4">
              <Alert variant="success">{completeState?.message}</Alert>

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
                    <h4 className="mb-1 font-medium">
                      Passkey "{completeState?.data?.passkeyName}" is ready!
                    </h4>
                    <ul className="list-inside list-disc space-y-1 text-xs">
                      <li>You can now use this passkey to sign in</li>
                      <li>No password required - just use your device authentication</li>
                      <li>Your passkey is unique and cannot be phished</li>
                      <li>You can add more passkeys for backup</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    window.location.href = '/account/passkeys';
                  }}
                >
                  View All Passkeys
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  Register Another Passkey
                </Button>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                {initiateState?.error ||
                  completeState?.error ||
                  'An unknown error occurred during passkey registration.'}
              </Alert>

              <div
                className={cn(
                  'rounded-lg border border-red-200 bg-red-50 p-4',
                  'dark:border-red-800 dark:bg-red-900/20',
                )}
              >
                <div className="flex items-start">
                  <svg
                    className="mr-3 mt-0.5 h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className={cn('text-sm text-red-800', 'dark:text-red-200')}>
                    <h4 className="mb-1 font-medium">Troubleshooting tips:</h4>
                    <ul className="list-inside list-disc space-y-1 text-xs">
                      <li>Make sure your device supports passkeys</li>
                      <li>Ensure you're using a supported browser</li>
                      <li>Check that you're on a secure (HTTPS) connection</li>
                      <li>Try using a different browser or device</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setStep('name-passkey');
                    setPasskeyName('');
                    setRegistrationData(null);
                  }}
                >
                  Try Again
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (onCancel) onCancel();
                    else window.location.href = '/account/passkeys';
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {step !== 'success' && step !== 'error' && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                if (onCancel) onCancel();
                else window.location.href = '/account/passkeys';
              }}
              className={cn(
                'text-sm text-gray-600 hover:text-gray-500',
                'dark:text-gray-400 dark:hover:text-gray-300',
              )}
            >
              Cancel Registration
            </button>
          </div>
        )}

        <div className={cn('mt-6 rounded-lg bg-gray-50 p-4', 'dark:bg-gray-800')}>
          <h4 className={cn('mb-2 text-sm font-medium text-gray-900', 'dark:text-gray-100')}>
            Passkey Support
          </h4>
          <div className={cn('space-y-1 text-xs text-gray-600', 'dark:text-gray-400')}>
            <p>
              • <strong>Supported:</strong> Chrome 67+, Firefox 60+, Safari 14+, Edge 18+
            </p>
            <p>
              • <strong>Devices:</strong> iPhone/iPad (iOS 16+), Android (7+), Windows (10+), macOS
              (13+)
            </p>
            <p>
              • <strong>Security Keys:</strong> YubiKey, Google Titan, FIDO2 compatible devices
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
