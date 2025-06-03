'use client';

import { Alert, Anchor, Button, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import Link from 'next/link';
import { useState } from 'react';

import { analytics } from '@repo/analytics';
import { forgetPassword } from '@repo/auth/client';

import { AuthForm } from './auth-form';

export interface ForgotPasswordFormProps {
  /**
   * Callback when user wants to navigate to sign in
   * If provided, will be used instead of signInRoute
   */
  onSignInNavigate?: () => void;
  /**
   * Route to redirect to after password reset email is sent
   * @default '/reset-password'
   */
  resetPasswordRoute?: string;
  /**
   * Route to sign in page
   * @default '/sign-in'
   */
  signInRoute?: string;
}

export const ForgotPasswordForm = ({
  onSignInNavigate,
  resetPasswordRoute = '/reset-password',
  signInRoute = '/sign-in',
}: ForgotPasswordFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email address'),
    },
    initialValues: {
      email: '',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    setError(null);

    analytics.capture('password_reset_requested', {
      email: values.email,
    });

    try {
      await forgetPassword({
        email: values.email,
        redirectTo: resetPasswordRoute,
      });

      setSuccess(true);
      analytics.capture('password_reset_email_sent', {
        email: values.email,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      setError(errorMessage);

      analytics.capture('password_reset_failed', {
        email: values.email,
        error: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthForm showMagicLink={false} showSocialOptions={false}>
        <Stack gap="md">
          <Alert color="green" title="Reset link sent">
            If an account with that email exists, we've sent you a password reset link. Please check
            your email and follow the instructions.
          </Alert>

          <Text c="dimmed" size="sm" ta="center">
            Didn't receive the email? Check your spam folder or try again with a different email
            address.
          </Text>

          <Stack gap="xs">
            <Button
              fullWidth
              onClick={() => {
                setSuccess(false);
                form.reset();
                setError(null);
              }}
              variant="outline"
            >
              Try different email
            </Button>

            <Text size="sm" ta="center">
              {onSignInNavigate ? (
                <Anchor component="button" onClick={onSignInNavigate} type="button">
                  Back to sign in
                </Anchor>
              ) : (
                <Anchor href={signInRoute as any} component={Link}>
                  Back to sign in
                </Anchor>
              )}
            </Text>
          </Stack>
        </Stack>
      </AuthForm>
    );
  }

  return (
    <AuthForm error={error} isLoading={isLoading} showMagicLink={false} showSocialOptions={false}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Text c="dimmed" mb="md" size="sm" ta="center">
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          <TextInput
            placeholder="your@email.com"
            label="Email address"
            required
            {...form.getInputProps('email')}
          />

          <Stack gap="xs">
            <Button fullWidth loading={isLoading} size="md" type="submit">
              Send Reset Link
            </Button>

            <Text size="sm" ta="center">
              {onSignInNavigate ? (
                <Anchor component="button" onClick={onSignInNavigate} type="button">
                  Back to sign in
                </Anchor>
              ) : (
                <Anchor href={signInRoute as any} component={Link}>
                  Back to sign in
                </Anchor>
              )}
            </Text>
          </Stack>
        </Stack>
      </form>
    </AuthForm>
  );
};
