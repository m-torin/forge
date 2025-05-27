'use client';

import { Button, Center, Container, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { forgetPassword } from '@repo/auth/client';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await forgetPassword({
        email,
        redirectTo: '/reset-password',
      });

      setIsSuccess(true);
      notifications.show({
        color: 'green',
        message: 'If an account exists with this email, you will receive a password reset link.',
        title: 'Email Sent',
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      notifications.show({
        color: 'red',
        message: 'An error occurred. Please try again.',
        title: 'Error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Center style={{ minHeight: '100vh' }}>
      <Container px="md" size="xs">
        <Paper shadow="md" withBorder p="xl" radius="md">
          <Stack gap="lg">
            <Stack gap="xs">
              <Title order={2} ta="center">
                Forgot Password
              </Title>
              <Text c="dimmed" size="sm" ta="center">
                Enter your email address and we'll send you a link to reset your password.
              </Text>
            </Stack>

            {!isSuccess ? (
              <form onSubmit={handleSubmit}>
                <Stack gap="md">
                  <TextInput
                    onChange={(event) => setEmail(event.currentTarget.value)}
                    placeholder="admin@example.com"
                    label="Email"
                    required
                    type="email"
                    value={email}
                  />

                  <Button fullWidth loading={isLoading} type="submit">
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>

                  <Text c="dimmed" size="sm" ta="center">
                    <a href="/sign-in" style={{ color: 'inherit' }}>
                      Back to Sign In
                    </a>
                  </Text>
                </Stack>
              </form>
            ) : (
              <Stack gap="md">
                <Text c="green" ta="center">
                  Check your email! If an account exists with the email address you provided, you
                  will receive a password reset link.
                </Text>
                <Button onClick={() => router.push('/sign-in')} variant="subtle">
                  Back to Sign In
                </Button>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Container>
    </Center>
  );
}
