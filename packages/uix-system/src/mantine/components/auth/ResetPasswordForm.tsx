'use client';

import { Alert, Button, Paper, PasswordInput, Progress, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconLock, IconX } from '@tabler/icons-react';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { z } from 'zod/v4';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export interface ResetPasswordFormProps {
  onSubmit: (values: ResetPasswordFormValues) => Promise<void>;
  onSuccess?: () => void;
  loading?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
  token?: string;

  // Customization
  title?: string;
  subtitle?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  confirmPasswordLabel?: string;
  confirmPasswordPlaceholder?: string;
  submitButtonText?: string;
  showPasswordStrength?: boolean;
  showPasswordRequirements?: boolean;
  disabled?: boolean;

  // Layout
  withBorder?: boolean;
  withShadow?: boolean;
  padding?: number | string;
  radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function ResetPasswordForm({
  onSubmit,
  onSuccess,
  loading = false,
  error = null,
  onErrorDismiss,
  token,
  title = 'Reset your password',
  subtitle = 'Enter your new password below',
  passwordLabel = 'New password',
  passwordPlaceholder = 'Create a strong password',
  confirmPasswordLabel = 'Confirm new password',
  confirmPasswordPlaceholder = 'Confirm your password',
  submitButtonText = 'Reset password',
  showPasswordStrength = true,
  showPasswordRequirements = true,
  disabled = false,
  withBorder = true,
  withShadow = true,
  padding = 30,
  radius = 'md',
}: ResetPasswordFormProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const isLoading = loading || internalLoading;
  const currentError = error || internalError;
  const isDisabled = disabled || !token;

  const form = useForm<ResetPasswordFormValues>({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: zodResolver(resetPasswordSchema),
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

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setInternalError('Invalid or missing reset token');
      return;
    }

    setInternalLoading(true);
    setInternalError(null);

    try {
      await onSubmit(values);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred. Please try again.';
      setInternalError(errorMessage);
    } finally {
      setInternalLoading(false);
    }
  };

  const handleErrorDismiss = () => {
    if (onErrorDismiss) {
      onErrorDismiss();
    } else {
      setInternalError(null);
    }
  };

  const renderPasswordRequirements = () => {
    if (!showPasswordRequirements || !form.values.password || passwordStrength >= 100) {
      return null;
    }

    return (
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
    );
  };

  return (
    <Paper
      withBorder={withBorder}
      shadow={withShadow ? 'md' : undefined}
      p={padding}
      radius={radius}
    >
      <Title order={2} ta="center" mb="md">
        {title}
      </Title>

      {subtitle && (
        <Text c="dimmed" size="sm" ta="center" mb="lg">
          {subtitle}
        </Text>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {currentError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              withCloseButton
              onClose={handleErrorDismiss}
            >
              {currentError}
            </Alert>
          )}

          <div>
            <PasswordInput
              label={passwordLabel}
              placeholder={passwordPlaceholder}
              required
              leftSection={<IconLock size={16} />}
              data-testid="reset-password"
              disabled={isDisabled}
              {...form.getInputProps('password')}
            />
            {showPasswordStrength && form.values.password && (
              <Progress value={passwordStrength} color={passwordColor} size="xs" mt={5} />
            )}
            {renderPasswordRequirements()}
          </div>

          <PasswordInput
            label={confirmPasswordLabel}
            placeholder={confirmPasswordPlaceholder}
            required
            leftSection={<IconLock size={16} />}
            data-testid="reset-confirm-password"
            disabled={isDisabled}
            {...form.getInputProps('confirmPassword')}
          />

          <Button
            fullWidth
            mt="xl"
            type="submit"
            loading={isLoading}
            disabled={isDisabled}
            data-testid="reset-password-submit"
          >
            {submitButtonText}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
