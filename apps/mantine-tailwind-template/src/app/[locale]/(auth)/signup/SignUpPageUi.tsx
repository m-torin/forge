/**
 * Sign Up Page UI Component
 *
 * Client component with pure Tailwind styling and Mantine form logic
 */

'use client';

import { signUpAction } from '#/app/actions/auth';
import type { Locale } from '#/lib/i18n';
import { Alert, Button, Card, PasswordInput, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconBrandNextjs } from '@tabler/icons-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useActionState } from 'react';

interface SignUpPageUiProps {
  locale: Locale;
  dict: {
    header: { title: string };
    home: { welcome: string };
  };
  redirectTo: string;
  error: string | null;
}

// Form values interface
interface SignUpFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpPageUi({ locale, dict, redirectTo, error }: SignUpPageUiProps) {
  // Use useActionState for server action integration
  const [state, formAction] = useActionState(signUpAction, {
    success: false,
    error: error,
    fields: { name: '', email: '', password: '', confirmPassword: '' },
  });

  // Mantine form for client-side validation
  const form = useForm<SignUpFormValues>({
    initialValues: {
      name: state?.fields?.name || '',
      email: state?.fields?.email || '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: value => {
        if (!value) return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        return null;
      },
      email: value => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+$/.test(value)) return 'Invalid email format';
        return null;
      },
      password: value => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) return 'Please confirm your password';
        if (value !== values.password) return 'Passwords do not match';
        return null;
      },
    },
  });

  const handleSubmit = (values: SignUpFormValues) => {
    // Create FormData for server action
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('email', values.email);
    formData.append('password', values.password);
    formData.append('confirmPassword', values.confirmPassword);
    formData.append('redirectTo', redirectTo);

    // Call server action
    formAction(formData);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto w-full max-w-md sm:max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link
            href={`/${locale}` as Route}
            className="mb-4 inline-flex items-center text-green-600 hover:text-green-800"
          >
            <IconArrowLeft size={20} className="mr-2" />
            Back to {dict.header.title}
          </Link>

          <div className="mb-4 flex justify-center">
            <div className="flex items-center">
              <IconBrandNextjs size={32} className="mr-2 text-black" />
              <span className="text-2xl font-bold text-gray-900">{dict.header.title}</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">Join us and start building amazing things</p>
        </div>

        {/* Sign Up Form */}
        <Card withBorder shadow="lg" padding="lg" className="harmony-bg-surface">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              {/* Error Alert */}
              {state?.error && (
                <Alert color="red" variant="light" className="harmony-transition">
                  {state.error}
                </Alert>
              )}

              {/* Name Input */}
              <TextInput
                label="Full Name"
                required
                placeholder="Enter your full name"
                {...form.getInputProps('name')}
              />

              {/* Email Input */}
              <TextInput
                label="Email address"
                type="email"
                required
                placeholder="Enter your email"
                {...form.getInputProps('email')}
              />

              {/* Password Input */}
              <PasswordInput
                label="Password"
                required
                placeholder="Create a password (min. 6 characters)"
                {...form.getInputProps('password')}
              />

              {/* Confirm Password Input */}
              <PasswordInput
                label="Confirm Password"
                required
                placeholder="Confirm your password"
                {...form.getInputProps('confirmPassword')}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="filled"
                size="lg"
                fullWidth
                loading={false}
                className="harmony-transition"
              >
                Create Account
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="harmony-border-top w-full" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="harmony-bg-surface harmony-text-muted px-2">
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <Link
                  href={`/${locale}/login` as Route}
                  className="harmony-text-primary hover:harmony-text-secondary harmony-transition font-medium"
                >
                  Sign in to your account
                </Link>
              </div>
            </Stack>
          </form>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            This is a demo authentication system. No real data is stored.
          </p>
        </div>
      </div>
    </div>
  );
}
