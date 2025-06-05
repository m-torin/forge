'use client';

import { Alert, Button, Paper, PasswordInput, Stack, TextInput } from '@mantine/core';
import { useState } from 'react';

import { createClientAnalytics, track } from '@repo/analytics/client';
import { signUp } from '@repo/auth-new/client';

export const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Track sign-up attempt
    analytics.capture('sign_up_attempted', {
      method: 'email',
    });

    try {
      await signUp.email({
        name,
        email,
        password,
      });

      // Track successful sign-up
      analytics.capture('sign_up_completed', {
        method: 'email',
      });

      // Identify new user
      analytics.identify(email, {
        name,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
      setError(errorMessage);

      // Track sign-up failure
      analytics.capture('sign_up_failed', {
        error: errorMessage,
        method: 'email',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper withBorder p="xl" radius="md">
      <form onSubmit={handleSubmit}>
        <Stack>
          {error && (
            <Alert color="red" title="Sign up failed">
              {error}
            </Alert>
          )}
          <TextInput
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Your name"
            label="Name"
            required
            value={name}
          />
          <TextInput
            onChange={(e) => setEmail(e.currentTarget.value)}
            placeholder="your@email.com"
            label="Email"
            required
            type="email"
            value={email}
          />
          <PasswordInput
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder="Create a password"
            label="Password"
            required
            value={password}
          />
          <Button fullWidth loading={isLoading} type="submit">
            Sign up
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};
