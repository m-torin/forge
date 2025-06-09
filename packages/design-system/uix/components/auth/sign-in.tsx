'use client';

import { Alert, Button, Divider, Paper, PasswordInput, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-react';
import { useState } from 'react';

import { signIn, signInWithGitHub, signInWithGoogle } from '@repo/auth/client';

/**
 * Form data interface for sign-in credentials.
 */
interface SignInFormData {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Props for the SignIn component.
 */
interface SignInProps {
  /** Callback function called on sign-in error */
  onError?: (error: string) => void;
  /** Callback function called on successful sign-in */
  onSuccess?: () => void;
}

/**
 * Sign-in form component with email/password and social authentication options.
 *
 * @param props - Component props
 * @returns Sign-in form with validation and error handling
 *
 * @example
 * ```tsx
 * <SignIn
 *   onSuccess={() => router.push('/dashboard')}
 *   onError={(error) => console.error('Sign-in failed:', error)}
 * />
 * ```
 */
export const SignIn = ({ onError, onSuccess }: SignInProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignInFormData>({
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+\.\S+$/.test(value)) return 'Invalid email format';
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return null;
      },
    },
    initialValues: {
      email: '',
      password: '',
    },
  });

  /**
   * Handles form submission for email/password sign-in.
   *
   * @param values - Validated form data
   */
  const handleSubmit = async (values: SignInFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn({
        email: values.email,
        password: values.password,
      });
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles social authentication sign-in.
   *
   * @param provider - The social authentication provider ('google' | 'github')
   */
  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    setIsSocialLoading(provider);
    setError(null);

    try {
      if (provider === 'google') {
        await signInWithGoogle?.();
      } else {
        await signInWithGitHub?.();
      }
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : `Failed to sign in with ${provider}`;
      setError(errorMessage);
      onError?.(errorMessage);
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
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {error && (
              <Alert color="red" title="Sign in failed">
                {error}
              </Alert>
            )}
            <TextInput
              {...form.getInputProps('email')}
              placeholder="your@email.com"
              disabled={isSocialLoading !== null}
              label="Email"
              required
              type="email"
            />
            <PasswordInput
              {...form.getInputProps('password')}
              placeholder="Your password"
              disabled={isSocialLoading !== null}
              label="Password"
              required
            />
            <Button
              fullWidth
              loading={isLoading}
              disabled={isSocialLoading !== null || !form.isValid()}
              type="submit"
            >
              Sign in with Email
            </Button>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
};
