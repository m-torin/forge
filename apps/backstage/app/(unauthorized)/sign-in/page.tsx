'use client';

import {
  Button,
  Center,
  Container,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { signIn } from '@repo/auth/client';

// Add console.log for debugging
console.log('SignInPage component loaded from backstage app');

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result?.error) {
        notifications.show({
          color: 'red',
          message: 'Invalid credentials',
          title: 'Error',
        });
        return;
      }

      notifications.show({
        color: 'green',
        message: 'Signed in successfully',
        title: 'Success',
      });
      router.push(callbackUrl as any);
      router.refresh();
    } catch (error) {
      console.error('Sign in error:', error);
      notifications.show({
        color: 'red',
        message: 'An error occurred during sign in',
        title: 'Error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Title order={2} ta="center">
          Backstage Admin
        </Title>
        <Text c="dimmed" size="sm" ta="center">
          Enter your credentials to sign in to the admin dashboard
        </Text>
      </Stack>

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

          <PasswordInput
            onChange={(event) => setPassword(event.currentTarget.value)}
            placeholder="Your password"
            label="Password"
            required
            value={password}
          />

          <Button fullWidth loading={isLoading} type="submit">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          <Text c="dimmed" size="sm" ta="center">
            <a href="/forgot-password" style={{ color: 'inherit' }}>
              Forgot your password?
            </a>
          </Text>
        </Stack>
      </form>
    </Stack>
  );
}

export default function SignInPage() {
  return (
    <Center style={{ minHeight: '100vh' }}>
      <Container px="md" size="xs">
        <Paper shadow="md" withBorder p="xl" radius="md">
          <Suspense fallback={<div>Loading...</div>}>
            <SignInForm />
          </Suspense>
        </Paper>
      </Container>
    </Center>
  );
}
