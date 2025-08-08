/**
 * Tailwind v4 RSC Passkey Sign-In Interface
 * 100% React Server Component for WebAuthn passkey authentication
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { cn } from '../utils/dark-mode';

type SignInStep = 'check-support' | 'authenticate' | 'success' | 'error';

interface PasskeySignInInterfaceProps extends BaseProps {
  title?: string;
  subtitle?: string;
  redirectTo?: string;
  onSuccess?: (userData: { id: string; email: string }) => void;
  onError?: (error: string) => void;
  onFallback?: () => void;
}

const _initialState: FormState = { success: false };

// Server action for initiating passkey authentication
async function initiatePasskeyAuthAction(prevState: any, formData: FormData): Promise<FormState> {
  'use server';

  try {
    // Import Better Auth server action
    const { initiatePasskeyAuthAction: authInitiatePasskey } = await import(
      '@repo/auth/server-actions'
    );

    const result = await authInitiatePasskey(prevState, formData);

    if (result.success) {
      return {
        success: true,
        message: 'Passkey authentication initiated.',
        data: {
          challenge: (result as any).data?.challenge || (result as any).challenge || '',
          authOptions: (result as any).data?.authOptions || (result as any).authOptions || {},
        },
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to initiate passkey authentication.',
      };
    }
  } catch (error: any) {
    // console.error('Passkey authentication initiation error:', error);

    if (error?.message?.includes('no passkeys')) {
      return {
        success: false,
        error:
          'No passkeys found. Please register a passkey first or use a different sign-in method.',
      };
    }

    if (error?.message?.includes('not supported')) {
      return {
        success: false,
        error: 'Passkey authentication is not supported on this device or browser.',
      };
    }

    return {
      success: false,
      error: 'An error occurred while initiating passkey authentication.',
    };
  }
}

// Server action for completing passkey authentication
async function completePasskeyAuthAction(prevState: any, formData: FormData): Promise<FormState> {
  'use server';

  try {
    const challenge = formData.get('challenge') as string;
    const credential = formData.get('credential') as string;
    const redirectTo = formData.get('redirectTo') as string;

    if (!challenge || !credential) {
      return {
        success: false,
        error: 'Missing required authentication data.',
      };
    }

    // Import Better Auth server action
    const { completePasskeyAuthAction: authCompletePasskey } = await import(
      '@repo/auth/server-actions'
    );

    const result = await authCompletePasskey(prevState, formData);

    if (result.success) {
      return {
        success: true,
        message: 'Successfully signed in with passkey!',
        data: {
          user: (result as any).data?.user || (result as any).user || {},
          redirectTo: redirectTo || '/dashboard',
        },
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to complete passkey authentication.',
      };
    }
  } catch (error: any) {
    // console.error('Passkey authentication completion error:', error);

    if (error?.message?.includes('invalid credential')) {
      return {
        success: false,
        error: 'Invalid passkey credential. Please try again.',
      };
    }

    if (error?.message?.includes('not found')) {
      return {
        success: false,
        error: 'No matching passkey found. Please use a different authentication method.',
      };
    }

    if (error?.message?.includes('expired')) {
      return {
        success: false,
        error: 'Authentication challenge has expired. Please try again.',
      };
    }

    return {
      success: false,
      error: 'An error occurred during passkey authentication.',
    };
  }
}

export function PasskeySignInInterface({
  title = 'Sign in with Passkey',
  subtitle = 'Use your passkey for secure, passwordless authentication',
  redirectTo,
  onSuccess,
  onError,
  onFallback,
  className = '',
}: PasskeySignInInterfaceProps) {
  const [step, setStep] = useState<SignInStep>('check-support');
  const [_isWebAuthnSupported, setIsWebAuthnSupported] = useState(false);
  const [authData, setAuthData] = useState<any>(null);

  const [initiateState, initiateAction] = useFormState(
    initiatePasskeyAuthAction,
    createInitialActionState(),
  );
  const [completeState, completeAction] = useFormState(
    completePasskeyAuthAction,
    createInitialActionState(),
  );

  // WebAuthn authentication process
  const startWebAuthnAuthentication = useCallback(
    async (options: any) => {
      try {
        // Convert challenge from base64
        const decodedOptions = {
          ...options,
          challenge: Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)),
          allowCredentials: options.allowCredentials?.map((cred: any) => ({
            ...cred,
            id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)),
          })),
        };

        // Get credential
        const credential = (await navigator.credentials.get({
          publicKey: decodedOptions,
        })) as PublicKeyCredential;

        if (!credential) {
          throw new Error('No credential received');
        }

        // Prepare credential data for server
        const credentialData = {
          id: credential.id,
          rawId: Array.from(new Uint8Array(credential.rawId)),
          response: {
            authenticatorData: Array.from(
              new Uint8Array(
                (credential.response as AuthenticatorAssertionResponse).authenticatorData,
              ),
            ),
            clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
            signature: Array.from(
              new Uint8Array((credential.response as AuthenticatorAssertionResponse).signature),
            ),
            userHandle: (() => {
              const userHandle = (credential.response as AuthenticatorAssertionResponse).userHandle;
              return userHandle ? Array.from(new Uint8Array(userHandle)) : null;
            })(),
          },
          type: credential.type,
        };

        // Submit to server
        const form = new FormData();
        form.append('challenge', authData.challenge);
        form.append('credential', JSON.stringify(credentialData));
        form.append('redirectTo', redirectTo || '');

        completeAction(form);
      } catch (error: any) {
        // console.error('WebAuthn authentication error:', error);

        let errorMessage = 'Failed to authenticate with passkey. ';

        if (error.name === 'NotSupportedError') {
          errorMessage += "Your device or browser doesn't support this authentication method.";
        } else if (error.name === 'SecurityError') {
          errorMessage += "Security error occurred. Please ensure you're on a secure connection.";
        } else if (error.name === 'NotAllowedError') {
          errorMessage += 'Authentication was cancelled or not allowed.';
        } else if (error.name === 'InvalidStateError') {
          errorMessage += 'No matching passkey found on this device.';
        } else if (error.name === 'UnknownError') {
          errorMessage += 'An unknown error occurred during authentication.';
        } else {
          errorMessage += 'Please try again or use a different sign-in method.';
        }

        setStep('error');
        if (onError) onError(errorMessage);
      }
    },
    [authData, completeAction, redirectTo, onError],
  );

  // Check WebAuthn support on component mount
  useEffect(() => {
    const checkSupport = () => {
      if (!window.PublicKeyCredential) {
        setStep('error');
        return;
      }

      setIsWebAuthnSupported(true);
      // Auto-initiate authentication
      const form = new FormData();
      initiateAction(form);
    };

    checkSupport();
  }, [initiateAction]);

  // Handle authentication initiation
  useEffect(() => {
    if (initiateState?.success && initiateState?.data) {
      setAuthData(initiateState.data);
      setStep('authenticate');

      // Start WebAuthn authentication
      startWebAuthnAuthentication(initiateState.data.authOptions);
    } else if (initiateState?.error) {
      setStep('error');
      if (onError) onError(initiateState.error);
    }
  }, [initiateState, onError, startWebAuthnAuthentication]);

  // Handle authentication completion
  useEffect(() => {
    if (completeState?.success && completeState?.data) {
      setStep('success');
      if (onSuccess && completeState.data.user) {
        onSuccess({
          id: completeState.data.user.id,
          email: completeState.data.user.email,
        });
      }

      // Redirect if specified
      if (completeState.data.redirectTo) {
        setTimeout(() => {
          window.location.href = completeState.data.redirectTo;
        }, 1000);
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
      case 'authenticate':
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
        return 'Checking Device Support';
      case 'authenticate':
        return 'Authenticate with Passkey';
      case 'success':
        return 'Successfully Signed In!';
      case 'error':
        return 'Authentication Failed';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'check-support':
        return 'Verifying passkey support and preparing authentication...';
      case 'authenticate':
        return 'Follow your device prompts to authenticate with your passkey';
      case 'success':
        return 'Welcome back! You have been successfully authenticated.';
      case 'error':
        return 'Something went wrong during passkey authentication';
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
            {['check-support', 'authenticate', 'success'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                    step === stepName
                      ? 'bg-blue-600 text-white dark:bg-blue-500'
                      : ['check-support', 'authenticate', 'success'].indexOf(step) > index
                        ? 'bg-green-600 text-white dark:bg-green-500'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
                  )}
                >
                  {['check-support', 'authenticate', 'success'].indexOf(step) > index ? (
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
                {index < 2 && (
                  <div
                    className={cn(
                      'h-0.5 w-12',
                      ['check-support', 'authenticate', 'success'].indexOf(step) > index
                        ? 'bg-green-600 dark:bg-green-500'
                        : 'bg-gray-200 dark:bg-gray-700',
                    )}
                  />
                )}
              </div>
            ))}
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
                <p>Please wait while we prepare your passkey authentication...</p>
              </div>
            </div>
          )}

          {step === 'authenticate' && (
            <div className="space-y-4 py-8 text-center">
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
                      d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1H4v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className={cn('text-sm text-blue-800', 'dark:text-blue-200')}>
                    <h4 className="mb-1 font-medium">Use your passkey</h4>
                    <p className="mb-2">Follow the prompts on your device to authenticate:</p>
                    <ul className="list-inside list-disc space-y-1 text-xs">
                      <li>Use your fingerprint, face, or device PIN</li>
                      <li>Press the button on your security key</li>
                      <li>Complete the biometric verification</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className={cn('text-sm text-gray-600', 'dark:text-gray-400')}>
                <p>Waiting for passkey authentication...</p>
              </div>
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
                    <h4 className="mb-1 font-medium">Authentication successful!</h4>
                    <ul className="list-inside list-disc space-y-1 text-xs">
                      <li>Your identity has been verified using your passkey</li>
                      <li>You are now signed in securely</li>
                      <li>No password was needed or transmitted</li>
                      <li>Redirecting you to your dashboard...</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  window.location.href = completeState?.data?.redirectTo || '/dashboard';
                }}
              >
                Continue to Dashboard
              </Button>
            </div>
          )}

          {step === 'error' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                {initiateState?.error ||
                  completeState?.error ||
                  'An unknown error occurred during passkey authentication.'}
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
                      <li>Make sure you have passkeys registered on this device</li>
                      <li>Ensure your browser supports WebAuthn</li>
                      <li>Check that you're on a secure (HTTPS) connection</li>
                      <li>Try using a different device or browser</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setStep('check-support');
                    setAuthData(null);
                    // Retry authentication
                    const form = new FormData();
                    initiateAction(form);
                  }}
                >
                  Try Again
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (onFallback) onFallback();
                    else window.location.href = '/auth/signin';
                  }}
                >
                  Use Different Sign-in Method
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
                if (onFallback) onFallback();
                else window.location.href = '/auth/signin';
              }}
              className={cn(
                'text-sm text-gray-600 hover:text-gray-500',
                'dark:text-gray-400 dark:hover:text-gray-300',
              )}
            >
              Use a different sign-in method
            </button>
          </div>
        )}

        <div className={cn('mt-6 rounded-lg bg-gray-50 p-4', 'dark:bg-gray-800')}>
          <h4 className={cn('mb-2 text-sm font-medium text-gray-900', 'dark:text-gray-100')}>
            Passkey Requirements
          </h4>
          <div className={cn('space-y-1 text-xs text-gray-600', 'dark:text-gray-400')}>
            <p>
              • <strong>Browsers:</strong> Chrome 67+, Firefox 60+, Safari 14+, Edge 18+
            </p>
            <p>
              • <strong>Devices:</strong> iPhone/iPad (iOS 16+), Android (7+), Windows (10+), macOS
              (13+)
            </p>
            <p>
              • <strong>Authentication:</strong> Fingerprint, Face ID, PIN, or security key
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
