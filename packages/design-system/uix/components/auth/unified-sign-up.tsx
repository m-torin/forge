'use client';

import { Button, Checkbox, PasswordInput, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';

import { signInWithGitHub, signInWithGoogle, signUp } from '@repo/auth/client';

import { AuthForm } from './auth-form';

export const UnifiedSignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // For now, enable all auth methods by default
  // TODO: Integrate with feature flag system when available
  const googleOAuthEnabled = true;
  const githubOAuthEnabled = true;

  const form = useForm({
    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 characters' : null),
      acceptTerms: (value) => (!value ? 'You must accept the terms of service' : null),
      confirmPassword: (value, values) =>
        value !== values.password ? 'Passwords do not match' : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email address'),
      password: (value) => (value.length < 8 ? 'Password must be at least 8 characters' : null),
    },
    initialValues: {
      name: '',
      acceptTerms: false,
      confirmPassword: '',
      email: '',
      password: '',
    },
  });

  const handleEmailSignUp = async (values: typeof form.values) => {
    setIsLoading(true);
    setError(null);

    // TODO: Add analytics tracking when analytics instance is available

    try {
      await signUp({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      // TODO: Track successful sign-up and identify user
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
      setError(errorMessage);

      // TODO: Track failed sign-up
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: 'google' | 'github') => {
    // Check if provider is enabled
    const isProviderEnabled = provider === 'google' ? googleOAuthEnabled : githubOAuthEnabled;

    if (!isProviderEnabled) {
      setError(`${provider} sign-up is currently unavailable`);
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

      // TODO: Track successful sign-up
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : `Failed to sign up with ${provider}`;
      setError(errorMessage);

      // TODO: Track failed sign-up
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
      mode="signup"
      onSocialSignIn={handleSocialSignUp}
      showMagicLink={false}
      showSocialOptions={showSocialOptions}
      socialLoading={isSocialLoading}
    >
      <form onSubmit={form.onSubmit(handleEmailSignUp)}>
        <Stack>
          <TextInput
            placeholder="John Doe"
            disabled={isSocialLoading !== null}
            label="Full name"
            required
            {...form.getInputProps('name')}
          />

          <TextInput
            placeholder="your@email.com"
            disabled={isSocialLoading !== null}
            label="Email address"
            required
            {...form.getInputProps('email')}
          />

          <PasswordInput
            placeholder="Create a secure password"
            disabled={isSocialLoading !== null}
            label="Password"
            required
            {...form.getInputProps('password')}
          />

          <PasswordInput
            placeholder="Confirm your password"
            disabled={isSocialLoading !== null}
            label="Confirm password"
            required
            {...form.getInputProps('confirmPassword')}
          />

          <Checkbox
            disabled={isSocialLoading !== null}
            label="I accept the Terms of Service and Privacy Policy"
            required
            {...form.getInputProps('acceptTerms', { type: 'checkbox' })}
          />

          <Button
            fullWidth
            loading={isLoading}
            disabled={isSocialLoading !== null}
            size="md"
            type="submit"
          >
            Create Account
          </Button>
        </Stack>
      </form>
    </AuthForm>
  );
};
