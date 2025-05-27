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

import { signUp } from '@repo/auth/client';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signUp.email({
        name,
        email,
        password,
      });

      if (result?.error) {
        notifications.show({
          color: 'red',
          message: result.error || 'Failed to create account',
          title: 'Error',
        });
        return;
      }

      notifications.show({
        color: 'green',
        message: 'Account created successfully',
        title: 'Success',
      });
      router.push(callbackUrl as any);
      router.refresh();
    } catch (error) {
      console.error('Sign up error:', error);
      notifications.show({
        color: 'red',
        message: 'An error occurred during sign up',
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
          Create Admin Account
        </Title>
        <Text c="dimmed" size="sm" ta="center">
          Sign up for a new admin account
        </Text>
      </Stack>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            onChange={(event) => setName(event.currentTarget.value)}
            placeholder="Your name"
            label="Name"
            required
            value={name}
          />

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
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}

export default function SignUpPage() {
  return (
    <Center style={{ minHeight: '100vh' }}>
      <Container px="md" size="xs">
        <Paper shadow="md" withBorder p="xl" radius="md">
          <Suspense fallback={<div>Loading...</div>}>
            <SignUpForm />
          </Suspense>
        </Paper>
      </Container>
    </Center>
  );
}
