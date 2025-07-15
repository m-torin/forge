'use client';

import {
  Alert,
  Anchor,
  Button,
  Checkbox,
  Divider,
  Paper,
  PasswordInput,
  Progress,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconLock, IconMail, IconUser, IconX } from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { z } from 'zod/v4';
import { SocialLoginButtons } from './SocialLoginButtons';

const signUpSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine(data => data.acceptTerms === true, {
    message: 'You must accept the terms and conditions',
    path: ['acceptTerms'],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export interface SignUpFormProps {
  onSubmit: (values: SignUpFormValues) => Promise<void>;
  onSocialLogin?: (
    provider: 'google' | 'github' | 'microsoft' | 'facebook' | 'discord',
  ) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
  showSocialLogin?: boolean;
  showSignInLink?: boolean;
  signInHref?: string;
  termsHref?: string;
  title?: string;
  subtitle?: string;
  submitButtonText?: string;
  socialDividerText?: string;
  socialProviders?: Array<'google' | 'github' | 'microsoft' | 'facebook' | 'discord'>;
  initialValues?: Partial<SignUpFormValues>;
  showPasswordStrength?: boolean;
  customPasswordRequirements?: z.ZodString;
}

export function SignUpForm({
  onSubmit,
  onSocialLogin,
  loading = false,
  error = null,
  onErrorDismiss,
  showSocialLogin = true,
  showSignInLink = true,
  signInHref = '/auth/signin',
  termsHref = '/terms',
  title = 'Create an account',
  subtitle = 'Get started with your free account',
  submitButtonText = 'Create account',
  socialDividerText = 'Or sign up with',
  socialProviders = ['google', 'github'],
  initialValues = {},
  showPasswordStrength = true,
}: SignUpFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignUpFormValues>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
      ...initialValues,
    },
    validate: zod4Resolver(signUpSchema),
  });

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(form.values.password);
  const passwordColor =
    passwordStrength === 0
      ? 'gray'
      : passwordStrength <= 25
        ? 'red'
        : passwordStrength <= 50
          ? 'orange'
          : passwordStrength <= 75
            ? 'yellow'
            : 'green';

  const handleSubmit = async (values: SignUpFormValues) => {
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
            label="Full name"
            placeholder="John Doe"
            required
            leftSection={<IconUser size={16} />}
            data-testid="signup-name"
            {...form.getInputProps('name')}
          />

          <TextInput
            label="Email"
            placeholder="your@email.com"
            required
            leftSection={<IconMail size={16} />}
            data-testid="signup-email"
            {...form.getInputProps('email')}
          />

          <div>
            <PasswordInput
              label="Password"
              placeholder="Create a strong password"
              required
              leftSection={<IconLock size={16} />}
              data-testid="signup-password"
              {...form.getInputProps('password')}
            />
            {showPasswordStrength && form.values.password && (
              <Progress value={passwordStrength} color={passwordColor} size="xs" mt={5} />
            )}
            {showPasswordStrength && form.values.password && passwordStrength < 100 && (
              <Text size="xs" c="dimmed" mt={5}>
                Password requirements:
                {!/[A-Z]/.test(form.values.password) && (
                  <Text size="xs" c="red" component="div">
                    <IconX size={12} style={{ display: 'inline' }} /> One uppercase letter
                  </Text>
                )}
                {!/[a-z]/.test(form.values.password) && (
                  <Text size="xs" c="red" component="div">
                    <IconX size={12} style={{ display: 'inline' }} /> One lowercase letter
                  </Text>
                )}
                {!/[0-9]/.test(form.values.password) && (
                  <Text size="xs" c="red" component="div">
                    <IconX size={12} style={{ display: 'inline' }} /> One number
                  </Text>
                )}
                {form.values.password.length < 8 && (
                  <Text size="xs" c="red" component="div">
                    <IconX size={12} style={{ display: 'inline' }} /> At least 8 characters
                  </Text>
                )}
              </Text>
            )}
          </div>

          <PasswordInput
            label="Confirm password"
            placeholder="Confirm your password"
            required
            leftSection={<IconLock size={16} />}
            data-testid="signup-confirm-password"
            {...form.getInputProps('confirmPassword')}
          />

          <Checkbox
            label={
              <Text size="sm">
                I accept the{' '}
                <Anchor href={termsHref} target="_blank">
                  terms and conditions
                </Anchor>
              </Text>
            }
            data-testid="signup-accept-terms"
            {...form.getInputProps('acceptTerms', { type: 'checkbox' })}
          />

          <Button
            fullWidth
            mt="xl"
            type="submit"
            loading={isLoading}
            data-testid="signup-submit"
            disabled={!form.values.acceptTerms}
          >
            {submitButtonText}
          </Button>
        </Stack>
      </form>

      {showSocialLogin && onSocialLogin && (
        <>
          <Divider label={socialDividerText} labelPosition="center" my="lg" />

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

      {showSignInLink && (
        <Text c="dimmed" size="sm" ta="center" mt="md">
          Already have an account?{' '}
          <Anchor href={signInHref} fw={700} data-testid="signin-link">
            Sign in
          </Anchor>
        </Text>
      )}
    </Paper>
  );
}
