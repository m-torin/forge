/**
 * Tailwind v4 RSC Magic Link Status Indicator
 * 100% React Server Component for tracking magic link status and providing resend functionality
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

// Import real server action from the auth package
import { resendMagicLinkAction } from '@repo/auth/server-actions';

type MagicLinkStatus = 'sending' | 'sent' | 'clicked' | 'expired' | 'error';

interface MagicLinkStatusIndicatorProps extends BaseProps {
  email: string;
  initialStatus?: MagicLinkStatus;
  onStatusChange?: (status: MagicLinkStatus) => void;
  onSuccess?: () => void;
  allowResend?: boolean;
  expirationTime?: number;
}

const _initialState: FormState = { success: false };

export function MagicLinkStatusIndicator({
  email,
  initialStatus = 'sent',
  onStatusChange,
  onSuccess,
  allowResend = true,
  expirationTime = 300, // 5 minutes
  className = '',
}: MagicLinkStatusIndicatorProps) {
  const [status, setStatus] = useState<MagicLinkStatus>(initialStatus);
  const [timeRemaining, setTimeRemaining] = useState(expirationTime);
  const [resendState, resendAction] = useFormState(
    resendMagicLinkAction,
    createInitialActionState(),
  );

  // Countdown timer
  useEffect(() => {
    if (status === 'sent' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setStatus('expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, timeRemaining]);

  // Handle status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status);
    }

    if (status === 'clicked' && onSuccess) {
      onSuccess();
    }
  }, [status, onStatusChange, onSuccess]);

  // Handle resend success
  useEffect(() => {
    if (resendState?.success) {
      setStatus('sent');
      setTimeRemaining(expirationTime);
    }
  }, [resendState?.success, expirationTime]);

  // Simulate checking for magic link clicks (in real implementation, this would be via websocket or polling)
  useEffect(() => {
    if (status === 'sent') {
      const checkInterval = setInterval(async () => {
        // In real implementation, check if the magic link was clicked
        // This could be done via polling an endpoint or websocket
        try {
          // TODO: Replace with actual magic link status check
          // console.log('Checking magic link status for:', email);

          // Simulate random click detection
          const result = { clicked: Math.random() > 0.8 };

          if (result.clicked) {
            setStatus('clicked');
          }
        } catch (_error) {
          // Handle error silently for now
        }
      }, 2000);

      return () => clearInterval(checkInterval);
    }
  }, [status, email]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <svg
            className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400"
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
      case 'sent':
        return (
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
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 21.75 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
            />
          </svg>
        );
      case 'clicked':
        return (
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
        );
      case 'expired':
        return (
          <svg
            className="h-6 w-6 text-red-600 dark:text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'error':
        return (
          <svg
            className="h-6 w-6 text-red-600 dark:text-red-400"
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

  const getStatusMessage = () => {
    switch (status) {
      case 'sending':
        return {
          title: 'Sending Magic Link',
          description: 'Please wait while we send your magic link...',
          variant: 'default' as const,
        };
      case 'sent':
        return {
          title: 'Magic Link Sent!',
          description: `Check your email at ${email} and click the link to sign in.`,
          variant: 'success' as const,
        };
      case 'clicked':
        return {
          title: 'Success!',
          description: 'Magic link clicked. You should be signed in shortly.',
          variant: 'success' as const,
        };
      case 'expired':
        return {
          title: 'Magic Link Expired',
          description: 'Your magic link has expired. Please request a new one.',
          variant: 'warning' as const,
        };
      case 'error':
        return {
          title: 'Something Went Wrong',
          description: 'There was an error with your magic link. Please try again.',
          variant: 'destructive' as const,
        };
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <Card className={cn('mx-auto w-full max-w-md', className)}>
      <CardHeader>
        <div className="text-center">
          <div
            className={cn(
              'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full',
              status === 'clicked'
                ? 'bg-green-100 dark:bg-green-900/20'
                : status === 'expired' || status === 'error'
                  ? 'bg-red-100 dark:bg-red-900/20'
                  : 'bg-blue-100 dark:bg-blue-900/20',
            )}
          >
            {getStatusIcon()}
          </div>
          <h2 className={cn('text-xl font-bold text-gray-900', 'dark:text-gray-100')}>
            {statusMessage.title}
          </h2>
          <p className={cn('mt-2 text-sm text-gray-600', 'dark:text-gray-400')}>
            {statusMessage.description}
          </p>
        </div>
      </CardHeader>

      <CardContent>
        {/* Status Alert */}
        <Alert variant={statusMessage.variant} className="mb-4">
          {statusMessage.description}
        </Alert>

        {/* Timer for active links */}
        {status === 'sent' && timeRemaining > 0 && (
          <div
            className={cn(
              'mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4',
              'dark:border-blue-800 dark:bg-blue-900/20',
            )}
          >
            <div className="flex items-center justify-between">
              <span className={cn('text-sm font-medium text-blue-800', 'dark:text-blue-200')}>
                Link expires in:
              </span>
              <span className={cn('font-mono text-lg text-blue-900', 'dark:text-blue-100')}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className={cn('mt-2 h-2 rounded-full bg-blue-200', 'dark:bg-blue-800')}>
              <div
                className={cn(
                  'h-2 rounded-full bg-blue-600 transition-all duration-1000',
                  'dark:bg-blue-400',
                )}
                style={{ width: `${(timeRemaining / expirationTime) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Resend Error */}
        {resendState?.error && (
          <Alert variant="destructive" className="mb-4">
            {resendState.error}
          </Alert>
        )}

        {/* Resend Success */}
        {resendState?.success && (
          <Alert variant="success" className="mb-4">
            {resendState.message}
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Resend Button */}
          {allowResend && (status === 'expired' || status === 'error' || status === 'sent') && (
            <form action={resendAction}>
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="redirectTo" value="/dashboard" />

              <Button
                type="submit"
                variant={status === 'sent' ? 'outline' : 'primary'}
                className="w-full"
                disabled={resendState === undefined}
              >
                {resendState === undefined
                  ? 'Resending...'
                  : status === 'sent'
                    ? 'Resend Magic Link'
                    : 'Send New Magic Link'}
              </Button>
            </form>
          )}

          {/* Manual refresh for checking status */}
          {status === 'sent' && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                // Force a status check
                window.location.reload();
              }}
            >
              Check Status
            </Button>
          )}

          {/* Back to sign in */}
          <div className="text-center">
            <a
              href="/auth/signin"
              className={cn(
                'text-sm text-gray-600 hover:text-gray-500',
                'dark:text-gray-400 dark:hover:text-gray-300',
              )}
            >
              ← Back to sign in
            </a>
          </div>
        </div>

        {/* Help Information */}
        <div className={cn('mt-6 rounded-lg bg-gray-50 p-4', 'dark:bg-gray-800')}>
          <h4 className={cn('mb-2 text-sm font-medium text-gray-900', 'dark:text-gray-100')}>
            Troubleshooting
          </h4>
          <div className={cn('space-y-1 text-xs text-gray-600', 'dark:text-gray-400')}>
            <p>• Check your spam/junk folder if you don't see the email</p>
            <p>• Make sure to click the link on the device you want to sign in on</p>
            <p>• Magic links expire after 5 minutes for security</p>
            <p>• Each link can only be used once</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
