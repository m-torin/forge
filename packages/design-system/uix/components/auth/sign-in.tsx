'use client';

import { Alert, Button, Divider, Paper, PasswordInput, Stack, TextInput } from '@mantine/core';
import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-react';
import { useState } from 'react';

import { signIn, signInWithGitHub, signInWithGoogle } from '@repo/auth/client';

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

    try {
      await signIn({
        email,
        password,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    setIsSocialLoading(provider);
    setError(null);

    try {
      if (provider === 'google') {
        await signInWithGoogle?.();
      } else {
        await signInWithGitHub?.();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : `Failed to sign in with ${provider}`;
      setError(errorMessage);
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
