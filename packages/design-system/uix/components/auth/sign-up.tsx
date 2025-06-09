'use client';

import { Alert, Button, Paper, PasswordInput, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';

import { signUp } from '@repo/auth/client';

/**
 * Form data interface for user sign-up.
 */
interface SignUpFormData {
  /** User's email address */
  email: string;
  /** User's full name */
  name: string;
  /** User's password */
  password: string;
}

/**
 * Props for the SignUp component.
 */
interface SignUpProps {
  /** Callback function called on sign-up error */
  onError?: (error: string) => void;
  /** Callback function called on successful sign-up */
  onSuccess?: () => void;
}

/**
 * Sign-up form component with validation and error handling.
 *
 * @param props - Component props
 * @returns Sign-up form with validation and error handling
 *
 * @example
 * ```tsx
 * <SignUp
 *   onSuccess={() => router.push('/welcome')}
 *   onError={(error) => console.error('Sign-up failed:', error)}
 * />
 * ```
 */
export const SignUp = ({ onError, onSuccess }: SignUpProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignUpFormData>({
    validate: {
      name: (value) => {
        if (!value) return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        return null;
      },
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+\.\S+$/.test(value)) return 'Invalid email format';
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        return null;
      },
    },
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  /**
   * Handles form submission for user sign-up.
   *
   * @param values - Validated form data
   */
  const handleSubmit = async (values: SignUpFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await signUp({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper withBorder p="xl" radius="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {error && (
            <Alert color="red" title="Sign up failed">
              {error}
            </Alert>
          )}
          <TextInput
            {...form.getInputProps('name')}
            placeholder="Your name"
            label="Name"
            required
          />
          <TextInput
            {...form.getInputProps('email')}
            placeholder="your@email.com"
            label="Email"
            required
            type="email"
          />
          <PasswordInput
            {...form.getInputProps('password')}
            description="Must be at least 8 characters with uppercase, lowercase, and number"
            placeholder="Create a password"
            label="Password"
            required
          />
          <Button fullWidth loading={isLoading} disabled={!form.isValid()} type="submit">
            Sign up
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};
