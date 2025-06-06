'use client';

import { Anchor, Button, PasswordInput, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import Link from 'next/link';
import { useState } from 'react';

import { signIn, signInWithGitHub, signInWithGoogle } from '@repo/auth/client';

import { AuthForm } from './auth-form';

export interface UnifiedSignInProps {
  /**
   * Route to forgot password page
   * @default '/forgot-password'
   */
  forgotPasswordRoute?: string;
  /**
   * Callback when user wants to navigate to forgot password
   * If provided, will be used instead of forgotPasswordRoute
   */
  onForgotPasswordNavigate?: () => void;
}

export const UnifiedSignIn = ({
  forgotPasswordRoute = '/forgot-password',
  onForgotPasswordNavigate,
}: UnifiedSignInProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // For now, enable all auth methods by default
  // TODO: Integrate with feature flag system when available
  const googleOAuthEnabled = true;
  const githubOAuthEnabled = true;
  const magicLinkEnabled = false;

  const form = useForm({
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email address'),
      password: (value) => (value.length < 1 ? 'Password is required' : null),
    },
    initialValues: {
      email: '',
      password: '',
    },
  });

  const handleEmailSignIn = async (values: typeof form.values) => {
    setIsLoading(true);
    setError(null);

    // TODO: Add analytics tracking when analytics instance is available

    try {
      await signIn({
        email: values.email,
        password: values.password,
      });

      // TODO: Track successful sign-in
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      setError(errorMessage);

      // TODO: Track failed sign-in
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    // Check if provider is enabled
    const isProviderEnabled = provider === 'google' ? googleOAuthEnabled : githubOAuthEnabled;

    if (!isProviderEnabled) {
      setError(`${provider} sign-in is currently unavailable`);
      return;
    }

    setIsSocialLoading(provider);
    setError(null);

    // TODO: Add analytics tracking when analytics instance is available

    try {
      if (provider === 'google') {
        await signInWithGoogle?.();
      } else {
        await signInWithGitHub?.();
      }

      // TODO: Track successful sign-in
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : `Failed to sign in with ${provider}`;
      setError(errorMessage);

      // TODO: Track failed sign-in
    } finally {
      setIsSocialLoading(null);
    }
  };

  // Determine which social options to show based on feature flags
  const availableSocialMethods = {
    github: githubOAuthEnabled,
    google: googleOAuthEnabled,
  };
  const showSocialOptions = googleOAuthEnabled || githubOAuthEnabled;

  return (
    <AuthForm
      availableSocialMethods={availableSocialMethods}
      error={error}
      isLoading={isLoading}
      mode="signin"
      onSocialSignIn={handleSocialSignIn}
      showMagicLink={magicLinkEnabled}
      showSocialOptions={showSocialOptions}
      socialLoading={isSocialLoading}
    >
      <form onSubmit={form.onSubmit(handleEmailSignIn)}>
        <Stack>
          <TextInput
            placeholder="your@email.com"
            disabled={isSocialLoading !== null}
            label="Email address"
            required
            {...form.getInputProps('email')}
          />

          <PasswordInput
            placeholder="Your password"
            disabled={isSocialLoading !== null}
            label="Password"
            required
            {...form.getInputProps('password')}
          />

          <Stack gap="xs">
            <Button
              fullWidth
              loading={isLoading}
              disabled={isSocialLoading !== null}
              size="md"
              type="submit"
            >
              Sign in with Email
            </Button>

            <Text size="sm" ta="center">
              {onForgotPasswordNavigate ? (
                <Anchor
                  component="button"
                  onClick={onForgotPasswordNavigate}
                  c="dimmed"
                  type="button"
                >
                  Forgot your password?
                </Anchor>
              ) : (
                <Anchor href={forgotPasswordRoute as any} component={Link} c="dimmed">
                  Forgot your password?
                </Anchor>
              )}
            </Text>
          </Stack>
        </Stack>
      </form>
    </AuthForm>
  );
};
