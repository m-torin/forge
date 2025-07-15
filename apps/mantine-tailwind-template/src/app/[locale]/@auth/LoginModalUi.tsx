/**
 * Login Modal UI Component
 *
 * Simplified login form for modal display
 */

'use client';

import { signInAction } from '#/app/actions/auth';
import type { Locale } from '#/lib/i18n';
import { Alert, Button, Checkbox, Input, PasswordInput, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useActionState } from 'react';

interface LoginModalUiProps {
  locale: Locale;
  dict: any;
}

// Form values interface
interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginModalUi({ locale, dict }: LoginModalUiProps) {
  // Use useActionState for server action integration
  const [state, formAction] = useActionState(signInAction, {
    success: false,
    error: '',
    fields: { email: '', password: '' },
  });

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

  const handleSubmit = (values: LoginFormValues) => {
    // Create FormData for server action
    const formData = new FormData();
    formData.append('email', values.email);
    formData.append('password', values.password);
    formData.append('rememberMe', values.rememberMe ? 'on' : 'off');
    formData.append('redirectTo', `/${locale}`);

    // Call server action
    (formAction as any)(formData);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        {/* Error Alert */}
        {state?.error && (
          <Alert color="red" variant="light" className="harmony-transition">
            {state.error}
          </Alert>
        )}

        {/* Demo Account Info */}
        <Alert color="blue" variant="light" className="harmony-transition">
          <div className="harmony-text-primary">
            <div>
              <strong>Demo accounts:</strong>
            </div>
            <div className="mt-1 text-sm">User: demo@example.com / demo123</div>
            <div className="text-sm">Admin: admin@example.com / admin123</div>
          </div>
        </Alert>

        {/* Email Input */}
        <Input.Wrapper label={dict.auth?.email || 'Email'} required>
          <Input type="email" placeholder="Enter your email" {...form.getInputProps('email')} />
        </Input.Wrapper>

        {/* Password Input */}
        <PasswordInput
          label={dict.auth?.password || 'Password'}
          placeholder="Enter your password"
          required
          {...form.getInputProps('password')}
        />

        {/* Remember Me */}
        <Checkbox
          label={dict.auth?.rememberMe || 'Remember me'}
          {...form.getInputProps('rememberMe', { type: 'checkbox' })}
        />

        {/* Submit Button */}
        <Button type="submit" fullWidth loading={false}>
          {dict.auth?.signIn || 'Sign in'}
        </Button>
      </Stack>
    </form>
  );
}
