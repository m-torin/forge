'use client';

import { Alert, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { IconCircleCheck, IconCircleX, IconMail, IconRefresh } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { createClientAnalytics, track } from '@repo/analytics/client';
import { sendVerificationEmail, useSession, verifyEmail } from '@repo/auth-new/client';

interface EmailVerificationBannerProps {
  onVerified?: () => void;
}

export function EmailVerificationBanner({ onVerified }: EmailVerificationBannerProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Don't show if no session or email is verified
  if (!session?.user || session.user.emailVerified) {
    return null;
  }

  const handleSendVerification = async () => {
    setIsLoading(true);
    try {
      await sendVerificationEmail?.();
      setEmailSent(true);

      analytics.capture('verification_email_sent', {
        email: session.user.email,
        source: 'verification_banner',
      });

      // Reset the sent state after 60 seconds
      setTimeout(() => setEmailSent(false), 60000);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Alert
      color="yellow"
      icon={<IconMail size={16} />}
      withCloseButton
      title="Verify your email address"
    >
      <Group justify="space-between" wrap="nowrap">
        <Text size="sm">Please verify your email address to access all features.</Text>
        <Button
          loading={isLoading}
          onClick={handleSendVerification}
          disabled={emailSent}
          size="xs"
          variant="light"
        >
          {emailSent ? 'Email Sent' : 'Send Verification Email'}
        </Button>
      </Group>
    </Alert>
  );
}

interface EmailVerificationPageProps {
  onComplete?: () => void;
}

export function EmailVerificationPage({ onComplete }: EmailVerificationPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmailWithToken(token);
    } else {
      setStatus('error');
      setError('No verification token provided');
    }
  }, [searchParams]);

  const verifyEmailWithToken = async (token: string) => {
    try {
      await verifyEmail?.({ token });

      analytics.capture('email_verified', {
        source: 'verification_page',
      });

      setStatus('success');

      // Redirect after 3 seconds
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else {
          router.push('/' as any);
        }
      }, 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to verify email. The link may have expired.';
      setError(errorMessage);
      setStatus('error');

      analytics.capture('email_verification_failed', {
        error: errorMessage,
        source: 'verification_page',
      });
    }
  };

  const handleResendEmail = async () => {
    try {
      await sendVerificationEmail?.();

      analytics.capture('verification_email_resent', {
        source: 'verification_page',
      });

      // Show success message
      setError('A new verification email has been sent. Please check your inbox.');
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    }
  };

  return (
    <Stack align="center" gap="xl" justify="center" mih="50vh">
      {status === 'verifying' && (
        <>
          <IconMail color="var(--mantine-color-blue-6)" size={64} />
          <Title order={2}>Verifying your email...</Title>
          <Text c="dimmed">Please wait while we verify your email address.</Text>
        </>
      )}

      {status === 'success' && (
        <>
          <IconCircleCheck color="var(--mantine-color-green-6)" size={64} />
          <Title order={2}>Email Verified!</Title>
          <Text c="dimmed">Your email has been successfully verified. Redirecting you...</Text>
        </>
      )}

      {status === 'error' && (
        <>
          <IconCircleX color="var(--mantine-color-red-6)" size={64} />
          <Title order={2}>Verification Failed</Title>
          <Text c="dimmed" maw={400} ta="center">
            {error}
          </Text>
          <Group>
            <Button onClick={() => router.push('/' as any)} variant="light">
              Go to Home
            </Button>
            <Button
              leftSection={<IconRefresh size={16} />}
              onClick={handleResendEmail}
              variant="filled"
            >
              Resend Email
            </Button>
          </Group>
        </>
      )}
    </Stack>
  );
}

interface EmailVerificationPromptProps {
  email: string;
  onResend?: () => void;
}

export function EmailVerificationPrompt({ email, onResend }: EmailVerificationPromptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await sendVerificationEmail?.();
      setEmailSent(true);
      onResend?.();

      analytics.capture('verification_email_sent', {
        email,
        source: 'verification_prompt',
      });

      // Reset after 60 seconds
      setTimeout(() => setEmailSent(false), 60000);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card withBorder>
      <Stack align="center" gap="lg">
        <IconMail color="var(--mantine-color-blue-6)" size={48} />

        <div style={{ textAlign: 'center' }}>
          <Title order={3}>Check your email</Title>
          <Text c="dimmed" mt="xs">
            We've sent a verification link to {email}
          </Text>
        </div>

        <Alert color="blue" variant="light" w="100%">
          Click the link in your email to verify your account. The link will expire in 24 hours.
        </Alert>

        <Stack gap="xs" w="100%">
          <Text c="dimmed" size="sm" ta="center">
            Didn't receive the email? Check your spam folder.
          </Text>

          <Button
            fullWidth
            loading={isLoading}
            onClick={handleResend}
            disabled={emailSent}
            variant="light"
          >
            {emailSent ? 'Email Sent' : 'Resend Verification Email'}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
