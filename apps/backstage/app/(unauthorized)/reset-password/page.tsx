'use client';

import { Button, Center, Container, Paper, PasswordInput, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { resetPassword } from '@repo/auth/client';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      notifications.show({
        color: 'red',
        message: 'Invalid or missing reset token',
        title: 'Error',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      notifications.show({
        color: 'red',
        message: 'Passwords do not match',
        title: 'Error',
      });
      return;
    }

    if (newPassword.length < 8) {
      notifications.show({
        color: 'red',
        message: 'Password must be at least 8 characters long',
        title: 'Error',
      });
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({
        newPassword,
        token,
      });

      notifications.show({
        color: 'green',
        message: 'Your password has been reset successfully',
        title: 'Success',
      });

      // Redirect to sign in page after successful reset
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to reset password. The link may be expired or invalid.',
        title: 'Error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Stack gap="lg">
        <Title order={2} ta="center">
          Invalid Reset Link
        </Title>
        <Text c="dimmed" ta="center">
          The password reset link is invalid or has expired.
        </Text>
        <Button onClick={() => router.push('/forgot-password')} variant="subtle">
          Request New Reset Link
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Title order={2} ta="center">
          Reset Password
        </Title>
        <Text c="dimmed" size="sm" ta="center">
          Enter your new password below
        </Text>
      </Stack>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <PasswordInput
            onChange={(event) => setNewPassword(event.currentTarget.value)}
            placeholder="Enter new password"
            label="New Password"
            required
            value={newPassword}
          />

          <PasswordInput
            onChange={(event) => setConfirmPassword(event.currentTarget.value)}
            placeholder="Confirm new password"
            label="Confirm Password"
            required
            value={confirmPassword}
          />

          <Button fullWidth loading={isLoading} type="submit">
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>

          <Text c="dimmed" size="sm" ta="center">
            <a href="/sign-in" style={{ color: 'inherit' }}>
              Back to Sign In
            </a>
          </Text>
        </Stack>
      </form>
    </Stack>
  );
}

export default function ResetPasswordPage() {
  return (
    <Center style={{ minHeight: '100vh' }}>
      <Container px="md" size="xs">
        <Paper shadow="md" withBorder p="xl" radius="md">
          <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </Paper>
      </Container>
    </Center>
  );
}
