/**
 * Login Page UI Component
 *
 * Client component with pure Tailwind styling and Mantine form logic
 */

'use client';

import { signInAction } from '#/app/actions/auth';
import type { Locale } from '#/lib/i18n';
import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Checkbox,
  CopyButton,
  PasswordInput,
  Stack,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useClipboard, useDebouncedValue } from '@mantine/hooks';
import { IconArrowLeft, IconBrandNextjs, IconCheck, IconCopy } from '@tabler/icons-react';
import type { Route } from 'next';
import Link from 'next/link';
import React, { useActionState, useState } from 'react';

interface LoginPageUiProps {
  locale: Locale;
  dict: {
    header: { title: string };
    home: { welcome: string };
  };
  redirectTo: string;
  error: string | null;
}

// Form values interface
interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPageUi({ locale, dict, redirectTo, error }: LoginPageUiProps) {
  // Use useActionState for server action integration
  const [state, formAction] = useActionState(signInAction, {
    success: false,
    error: error,
    fields: { email: '', password: '' },
  });

  // Clipboard functionality for demo credentials
  const clipboard = useClipboard({ timeout: 2000 });

  // Demo accounts data
  const demoAccounts = [
    { label: 'User', email: 'demo@example.com', password: 'demo123' },
    { label: 'Admin', email: 'admin@example.com', password: 'admin123' },
    { label: 'User 2', email: 'jane@example.com', password: 'jane123' },
  ];

  // Mantine form for client-side validation
  const form = useForm<LoginFormValues>({
    initialValues: {
      email: state?.fields?.email || '',
      password: '',
      rememberMe: true,
    },
    validate: {
      email: value => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+$/.test(value)) return 'Invalid email format';
        return null;
      },
      password: value => {
        if (!value) return 'Password is required';
        if (value.length < 3) return 'Password must be at least 3 characters';
        return null;
      },
    },
  });

  // Debounced validation for real-time feedback
  const [debouncedEmail] = useDebouncedValue(form.values.email, 300);
  const [_emailValidationError, setEmailValidationError] = useState<string | null>(null);

  // Real-time email validation
  React.useEffect(() => {
    if (debouncedEmail && debouncedEmail !== form.values.email) {
      const validation = form.validateField('email');
      const error = validation.error;
      setEmailValidationError(typeof error === 'string' ? error : null);
    }
  }, [debouncedEmail, form]);

  // Helper function to copy credentials and fill form
  const handleCopyCredentials = (account: (typeof demoAccounts)[0]) => {
    const credentials = `${account.email} / ${account.password}`;
    clipboard.copy(credentials);
    form.setValues({ email: account.email, password: account.password });
  };

  const handleSubmit = (values: LoginFormValues) => {
    // Create FormData for server action
    const formData = new FormData();
    formData.append('email', values.email);
    formData.append('password', values.password);
    formData.append('rememberMe', values.rememberMe ? 'on' : 'off');
    formData.append('redirectTo', redirectTo);

    // Call server action
    formAction(formData);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto w-full max-w-md sm:max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link
            href={`/${locale}` as Route}
            className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-800"
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

          <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or <span className="font-medium text-blue-600">use one of the demo accounts below</span>
          </p>
        </div>

        {/* Demo Account Info */}
        <div className="mb-6">
          <Card withBorder padding="sm" className="harmony-bg-info harmony-border">
            <h3 className="harmony-text-primary mb-2 text-sm font-medium">
              Demo Accounts:
              {clipboard.copied && <span className="ml-2 text-green-600">✓ Copied!</span>}
            </h3>
            <div className="harmony-text-secondary space-y-2 text-xs">
              {demoAccounts.map(account => (
                <div key={account.email} className="flex items-center justify-between">
                  <div>
                    <strong>{account.label}:</strong> {account.email} / {account.password}
                  </div>
                  <CopyButton value={`${account.email} / ${account.password}`} timeout={2000}>
                    {({ copied, copy }) => (
                      <Tooltip
                        label={copied ? 'Copied!' : 'Copy & Fill Form'}
                        withArrow
                        position="right"
                      >
                        <ActionIcon
                          color={copied ? 'teal' : 'gray'}
                          variant="subtle"
                          onClick={() => {
                            copy();
                            handleCopyCredentials(account);
                          }}
                          size="sm"
                        >
                          {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Login Form */}
        <Card withBorder shadow="lg" padding="lg" className="harmony-bg-surface">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              {/* Error Alert */}
              {state?.error && (
                <Alert color="red" variant="light" className="harmony-transition">
                  {state.error}
                </Alert>
              )}

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
                placeholder="Enter your password"
                {...form.getInputProps('password')}
              />

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <Checkbox
                  label="Remember me"
                  {...form.getInputProps('rememberMe', { type: 'checkbox' })}
                />

                <div className="text-sm">
                  <Link
                    href={`/${locale}/forgot-password` as Route}
                    className="harmony-text-primary hover:harmony-text-secondary harmony-transition font-medium"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="filled"
                size="lg"
                fullWidth
                loading={false}
                className="harmony-transition"
              >
                Sign in
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="harmony-border-top w-full" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="harmony-bg-surface harmony-text-muted px-2">
                    New to our platform?
                  </span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <Link
                  href={`/${locale}/signup` as Route}
                  className="harmony-text-primary hover:harmony-text-secondary harmony-transition font-medium"
                >
                  Create an account
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
