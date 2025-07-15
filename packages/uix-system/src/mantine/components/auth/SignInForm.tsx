'use client';

import {
  Alert,
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { z } from 'zod/v4';
import { SocialLoginButtons } from './SocialLoginButtons';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

export interface SignInFormProps {
  onSubmit: (values: SignInFormValues) => Promise<void>;
  onSocialLogin?: (
    provider: 'google' | 'github' | 'microsoft' | 'facebook' | 'discord',
  ) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
  showSocialLogin?: boolean;
  showForgotPassword?: boolean;
  showSignUpLink?: boolean;
  forgotPasswordHref?: string;
  signUpHref?: string;
  title?: string;
  subtitle?: string;
  submitButtonText?: string;
  socialProviders?: Array<'google' | 'github' | 'microsoft' | 'facebook' | 'discord'>;
  initialValues?: Partial<SignInFormValues>;
}

export function SignInForm({
  onSubmit,
  onSocialLogin,
  loading = false,
  error = null,
  onErrorDismiss,
  showSocialLogin = true,
  showForgotPassword = true,
  showSignUpLink = true,
  forgotPasswordHref = '/auth/forgot-password',
  signUpHref = '/auth/signup',
  title = 'Welcome back',
  subtitle = 'Sign in to your account to continue',
  submitButtonText = 'Sign in',
  socialProviders = ['google', 'github'],
  initialValues = {},
}: SignInFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignInFormValues>({
    initialValues: {
      email: '',
      password: '',
      rememberMe: true,
      ...initialValues,
    },
    validate: zod4Resolver(signInSchema),
  });

  const handleSubmit = async (values: SignInFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: (typeof socialProviders)[number]) => {
    if (onSocialLogin) {
      await onSocialLogin(provider);
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <Paper withBorder shadow="md" p={30} radius="md">
      <Title order={2} ta="center" mb="md">
        {title}
      </Title>

      <Text c="dimmed" size="sm" ta="center" mb="lg">
        {subtitle}
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              withCloseButton={!!onErrorDismiss}
              onClose={onErrorDismiss}
            >
              {error}
            </Alert>
          )}

          <TextInput
            label="Email"
            placeholder="your@email.com"
            required
            data-testid="signin-email"
            {...form.getInputProps('email')}
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            data-testid="signin-password"
            {...form.getInputProps('password')}
          />

          <Group justify="space-between">
            <Checkbox
              label="Remember me"
              data-testid="signin-remember"
              {...form.getInputProps('rememberMe', { type: 'checkbox' })}
            />
            {showForgotPassword && (
              <Anchor
                component="a"
                href={forgotPasswordHref}
                size="sm"
                data-testid="forgot-password-link"
              >
                Forgot password?
              </Anchor>
            )}
          </Group>

          <Button fullWidth mt="xl" type="submit" loading={isLoading} data-testid="signin-submit">
            {submitButtonText}
          </Button>
        </Stack>
      </form>

      {showSocialLogin && onSocialLogin && (
        <>
          <Divider label="Or continue with" labelPosition="center" my="lg" />

          <SocialLoginButtons
            onGoogleClick={
              socialProviders.includes('google') ? () => handleSocialLogin('google') : undefined
            }
            onGitHubClick={
              socialProviders.includes('github') ? () => handleSocialLogin('github') : undefined
            }
            onMicrosoftClick={
              socialProviders.includes('microsoft')
                ? () => handleSocialLogin('microsoft')
                : undefined
            }
            onFacebookClick={
              socialProviders.includes('facebook') ? () => handleSocialLogin('facebook') : undefined
            }
            onDiscordClick={
              socialProviders.includes('discord') ? () => handleSocialLogin('discord') : undefined
            }
            loading={isLoading}
          />
        </>
      )}

      {showSignUpLink && (
        <Text c="dimmed" size="sm" ta="center" mt="md">
          Don't have an account?{' '}
          <Anchor href={signUpHref} fw={700} data-testid="signup-link">
            Sign up
          </Anchor>
        </Text>
      )}
    </Paper>
  );
}
