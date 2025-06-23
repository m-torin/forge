'use client';

import { Alert, Button, Group } from '@mantine/core';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useAuth, authClient } from '@repo/auth/client/next';

function EmailVerificationBannerInner() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Don't show if no user or already verified
  if (!user || user.emailVerified) return null;

  const resendVerificationEmail = async () => {
    try {
      setSending(true);

      // Call Better Auth to resend verification email
      await authClient.sendVerificationEmail({
        email: user.email,
      });

      setSent(true);
      notifications.show({
        title: 'Verification email sent',
        message: 'Please check your email inbox and spam folder.',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (_error) {
      console.error('Failed to resend verification email:', _error);
      notifications.show({
        title: 'Error',
        message: 'Failed to send verification email. Please try again.',
        color: 'red',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Alert
      icon={<IconAlertCircle />}
      title="Verify your email"
      color="yellow"
      withCloseButton={false}
      className="mb-4"
    >
      <Group justify="space-between" align="center">
        <div>
          <p className="mb-1">Please check your email to verify your account.</p>
          <p className="text-sm opacity-80">
            Verification helps protect your account and enables all features.
          </p>
        </div>
        <Button
          size="sm"
          variant="subtle"
          onClick={resendVerificationEmail}
          loading={sending}
          disabled={sent}
        >
          {sent ? 'Email sent' : 'Resend email'}
        </Button>
      </Group>
    </Alert>
  );
}

export function EmailVerificationBanner() {
  return (
    <ErrorBoundary fallback={null}>
      <EmailVerificationBannerInner />
    </ErrorBoundary>
  );
}
