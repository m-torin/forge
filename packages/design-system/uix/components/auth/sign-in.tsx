'use client';

import { Alert, Button, Divider, Paper, PasswordInput, Stack, TextInput } from '@mantine/core';
import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-react';
import { useState } from 'react';

import { analytics } from '@repo/analytics-legacy';
import { signIn, signInWithGitHub, signInWithGoogle } from '@repo/auth-new/client';

export const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Track sign-in attempt
    analytics.capture('sign_in_attempted', {
      method: 'email',
    });

    try {
      await signIn.email({
        email,
        password,
      });

      // Track successful sign-in
      analytics.capture('sign_in_completed', {
        method: 'email',
      });

      // Identify user for future analytics
      analytics.identify(email);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      setError(errorMessage);

      // Track sign-in failure
      analytics.capture('sign_in_failed', {
        error: errorMessage,
        method: 'email',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    setIsSocialLoading(provider);
    setError(null);

    // Track social sign-in attempt
    analytics.capture('sign_in_attempted', {
      method: provider,
    });

    try {
      if (provider === 'google') {
        await signInWithGoogle?.({ providerId: 'google' });
      } else {
        await signInWithGitHub?.({ providerId: 'github' });
      }

      // Track successful social sign-in
      analytics.capture('sign_in_completed', {
        method: provider,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : `Failed to sign in with ${provider}`;
      setError(errorMessage);

      // Track social sign-in failure
      analytics.capture('sign_in_failed', {
        error: errorMessage,
        method: provider,
      });
    } finally {
      setIsSocialLoading(null);
    }
  };

  return (
    <Paper withBorder p="xl" radius="md">
      <Stack gap="lg">
        {/* Social Sign-In Buttons */}
        <Stack gap="sm">
          <Button
            fullWidth
            leftSection={<IconBrandGoogle size={20} />}
            loading={isSocialLoading === 'google'}
            onClick={() => handleSocialSignIn('google')}
            disabled={isLoading || isSocialLoading !== null}
            variant="outline"
          >
            Continue with Google
          </Button>

          <Button
            fullWidth
            leftSection={<IconBrandGithub size={20} />}
            loading={isSocialLoading === 'github'}
            onClick={() => handleSocialSignIn('github')}
            disabled={isLoading || isSocialLoading !== null}
            variant="outline"
          >
            Continue with GitHub
          </Button>
        </Stack>

        <Divider labelPosition="center" label="or" />

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit}>
          <Stack>
            {error && (
              <Alert color="red" title="Sign in failed">
                {error}
              </Alert>
            )}
            <TextInput
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder="your@email.com"
              disabled={isSocialLoading !== null}
              label="Email"
              required
              type="email"
              value={email}
            />
            <PasswordInput
              onChange={(e) => setPassword(e.currentTarget.value)}
              placeholder="Your password"
              disabled={isSocialLoading !== null}
              label="Password"
              required
              value={password}
            />
            <Button fullWidth loading={isLoading} disabled={isSocialLoading !== null} type="submit">
              Sign in with Email
            </Button>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
};
