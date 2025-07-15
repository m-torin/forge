'use client';

import { Alert, Anchor, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconArrowLeft, IconCheck, IconMail } from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { z } from 'zod/v4';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export interface ForgotPasswordFormProps {
  onSubmit: (values: ForgotPasswordFormValues) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
  onSuccess?: () => void;
  onRetry?: () => void;
  showBackLink?: boolean;
  signInHref?: string;
  title?: string;
  subtitle?: string;
  submitButtonText?: string;
  successTitle?: string;
  successMessage?: string;
  initialValues?: Partial<ForgotPasswordFormValues>;
}

export function ForgotPasswordForm({
  onSubmit,
  loading = false,
  error = null,
  onErrorDismiss,
  onSuccess,
  onRetry,
  showBackLink = true,
  signInHref = '/auth/signin',
  title = 'Forgot your password?',
  subtitle = "Enter your email address and we'll send you a link to reset your password.",
  submitButtonText = 'Send reset link',
  successTitle = 'Check your email',
  successMessage = "We've sent password reset instructions to your email",
  initialValues = {},
}: ForgotPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const form = useForm<ForgotPasswordFormValues>({
    initialValues: {
      email: '',
      ...initialValues,
    },
    validate: zod4Resolver(forgotPasswordSchema),
  });

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      setSubmittedEmail(values.email);
      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSuccess(false);
    form.reset();
    if (onRetry) {
      onRetry();
    }
  };

  const isLoading = loading || isSubmitting;

  if (success) {
    return (
      <Paper withBorder shadow="md" p={30} radius="md">
        <Stack align="center" gap="md">
          <IconCheck size={50} color="var(--mantine-color-green-6)" />

          <Title order={2} ta="center">
            {successTitle}
          </Title>

          <Text c="dimmed" size="sm" ta="center" maw={300}>
            {successMessage} {submittedEmail && `to ${submittedEmail}`}
          </Text>

          <Text size="xs" c="dimmed" ta="center">
            Didn't receive the email? Check your spam folder or{' '}
            <Anchor component="button" onClick={handleRetry}>
              try again
            </Anchor>
          </Text>

          {showBackLink && (
            <Anchor href={signInHref} size="sm" mt="md">
              <IconArrowLeft size={14} style={{ marginRight: 5 }} />
              Back to sign in
            </Anchor>
          )}
        </Stack>
      </Paper>
    );
  }

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
            label="Email address"
            placeholder="your@email.com"
            required
            leftSection={<IconMail size={16} />}
            data-testid="forgot-password-email"
            {...form.getInputProps('email')}
          />

          <Button
            fullWidth
            mt="md"
            type="submit"
            loading={isLoading}
            data-testid="forgot-password-submit"
          >
            {submitButtonText}
          </Button>
        </Stack>
      </form>

      {showBackLink && (
        <Text c="dimmed" size="sm" ta="center" mt="md">
          Remember your password?{' '}
          <Anchor href={signInHref} fw={700} data-testid="signin-link">
            Sign in
          </Anchor>
        </Text>
      )}
    </Paper>
  );
}
