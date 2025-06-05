'use client';

import { Alert, Anchor, Button, PasswordInput, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { analytics } from '@repo/analytics-legacy';
import { resetPassword } from '@repo/auth-new/client';

import { AuthForm } from './auth-form';

export interface ResetPasswordFormProps {
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
  /**
   * Callback when user wants to navigate to sign in
   * If provided, will be used instead of signInRoute
   */
  onSignInNavigate?: () => void;
  /**
   * Route to sign in page
   * @default '/sign-in'
   */
  signInRoute?: string;
  token: string | null;
}

export const ResetPasswordForm = ({
  forgotPasswordRoute = '/forgot-password',
  onForgotPasswordNavigate,
  onSignInNavigate,
  signInRoute = '/sign-in',
  token,
}: ResetPasswordFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm({
    validate: {
      confirmPassword: (value, values) =>
        value !== values.password ? 'Passwords do not match' : null,
      password: (value) => {
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        return null;
      },
    },
    initialValues: {
      confirmPassword: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    setIsLoading(true);
    setError(null);

    analytics.capture('password_reset_attempted', {
      hasToken: !!token,
    });

    try {
      await resetPassword({
        newPassword: values.password,
        token,
      });

      setSuccess(true);
      analytics.capture('password_reset_completed');

      // Redirect after success
      setTimeout(() => {
        if (onSignInNavigate) {
          onSignInNavigate();
        } else {
          router.push(signInRoute as any);
        }
      }, 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      setError(errorMessage);

      analytics.capture('password_reset_failed', {
        error: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <AuthForm showMagicLink={false} showSocialOptions={false}>
        <Stack gap="md">
          <Alert color="green" title="Password reset successful">
            Your password has been reset successfully. You can now sign in with your new password.
          </Alert>

          <Text c="dimmed" size="sm" ta="center">
            Redirecting to sign in page in 3 seconds...
          </Text>

          {onSignInNavigate ? (
            <Button fullWidth onClick={onSignInNavigate}>
              Continue to Sign In
            </Button>
          ) : (
            <Button fullWidth href={signInRoute as any} component={Link}>
              Continue to Sign In
            </Button>
          )}
        </Stack>
      </AuthForm>
    );
  }

  // Invalid token state
  if (!token || error === 'Invalid or missing reset token') {
    return (
      <AuthForm showMagicLink={false} showSocialOptions={false}>
        <Stack gap="md">
          <Alert color="red" title="Invalid reset link">
            This password reset link is invalid, expired, or has already been used.
          </Alert>

          <Text c="dimmed" size="sm" ta="center">
            Password reset links expire after 1 hour for security reasons.
          </Text>

          <Stack gap="xs">
            {onForgotPasswordNavigate ? (
              <Button fullWidth onClick={onForgotPasswordNavigate}>
                Request New Reset Link
              </Button>
            ) : (
              <Button fullWidth href={forgotPasswordRoute as any} component={Link}>
                Request New Reset Link
              </Button>
            )}

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
            Choose a strong password for your account.
          </Text>

          <PasswordInput
            description="Must be at least 8 characters with uppercase, lowercase, and number"
            placeholder="Enter your new password"
            label="New password"
            required
            {...form.getInputProps('password')}
          />

          <PasswordInput
            placeholder="Confirm your new password"
            label="Confirm password"
            required
            {...form.getInputProps('confirmPassword')}
          />

          <Stack gap="xs">
            <Button fullWidth loading={isLoading} size="md" type="submit">
              Reset Password
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
