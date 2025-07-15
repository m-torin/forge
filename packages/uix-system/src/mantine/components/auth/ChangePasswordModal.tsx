'use client';

import {
  Alert,
  Button,
  Checkbox,
  Group,
  Modal,
  PasswordInput,
  Progress,
  Stack,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconLock, IconX } from '@tabler/icons-react';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { z } from 'zod/v4';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    revokeOtherSessions: z.boolean(),
  })
  .refine(data => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export interface ChangePasswordModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: ChangePasswordFormValues) => Promise<void>;
  onSuccess?: () => void;
  loading?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;

  // Customization
  title?: string;
  currentPasswordLabel?: string;
  currentPasswordPlaceholder?: string;
  newPasswordLabel?: string;
  newPasswordPlaceholder?: string;
  confirmPasswordLabel?: string;
  confirmPasswordPlaceholder?: string;
  revokeSessionsLabel?: string;
  revokeSessionsDescription?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  showPasswordStrength?: boolean;
  showPasswordRequirements?: boolean;
  showRevokeSessionsOption?: boolean;
  defaultRevokeOtherSessions?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ChangePasswordModal({
  opened,
  onClose,
  onSubmit,
  onSuccess,
  loading = false,
  error = null,
  onErrorDismiss,
  title = 'Change Password',
  currentPasswordLabel = 'Current password',
  currentPasswordPlaceholder = 'Enter your current password',
  newPasswordLabel = 'New password',
  newPasswordPlaceholder = 'Create a strong password',
  confirmPasswordLabel = 'Confirm new password',
  confirmPasswordPlaceholder = 'Confirm your password',
  revokeSessionsLabel = 'Sign out all other sessions',
  revokeSessionsDescription = 'This will log you out from all other devices',
  submitButtonText = 'Change password',
  cancelButtonText = 'Cancel',
  showPasswordStrength = true,
  showPasswordRequirements = true,
  showRevokeSessionsOption = true,
  defaultRevokeOtherSessions = true,
  size = 'md',
}: ChangePasswordModalProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const isLoading = loading || internalLoading;
  const currentError = error || internalError;

  const form = useForm<ChangePasswordFormValues>({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      revokeOtherSessions: defaultRevokeOtherSessions,
    },
    validate: zodResolver(changePasswordSchema),
  });

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(form.values.newPassword);
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

  const handleSubmit = async (values: ChangePasswordFormValues) => {
    setInternalLoading(true);
    setInternalError(null);

    try {
      await onSubmit(values);
      form.reset();
      onClose();

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

  const handleClose = () => {
    form.reset();
    setInternalError(null);
    onClose();
  };

  const handleErrorDismiss = () => {
    if (onErrorDismiss) {
      onErrorDismiss();
    } else {
      setInternalError(null);
    }
  };

  const renderPasswordRequirements = () => {
    if (!showPasswordRequirements || !form.values.newPassword || passwordStrength >= 100) {
      return null;
    }

    return (
      <Text size="xs" c="dimmed" mt={5}>
        Password requirements:
        {!/[A-Z]/.test(form.values.newPassword) && (
          <Text size="xs" c="red" component="div">
            <IconX size={12} style={{ display: 'inline' }} /> One uppercase letter
          </Text>
        )}
        {!/[a-z]/.test(form.values.newPassword) && (
          <Text size="xs" c="red" component="div">
            <IconX size={12} style={{ display: 'inline' }} /> One lowercase letter
          </Text>
        )}
        {!/[0-9]/.test(form.values.newPassword) && (
          <Text size="xs" c="red" component="div">
            <IconX size={12} style={{ display: 'inline' }} /> One number
          </Text>
        )}
        {form.values.newPassword.length < 8 && (
          <Text size="xs" c="red" component="div">
            <IconX size={12} style={{ display: 'inline' }} /> At least 8 characters
          </Text>
        )}
      </Text>
    );
  };

  return (
    <Modal opened={opened} onClose={handleClose} title={title} size={size}>
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

          <PasswordInput
            label={currentPasswordLabel}
            placeholder={currentPasswordPlaceholder}
            required
            leftSection={<IconLock size={16} />}
            data-testid="current-password"
            {...form.getInputProps('currentPassword')}
          />

          <div>
            <PasswordInput
              label={newPasswordLabel}
              placeholder={newPasswordPlaceholder}
              required
              leftSection={<IconLock size={16} />}
              data-testid="new-password"
              {...form.getInputProps('newPassword')}
            />
            {showPasswordStrength && form.values.newPassword && (
              <Progress value={passwordStrength} color={passwordColor} size="xs" mt={5} />
            )}
            {renderPasswordRequirements()}
          </div>

          <PasswordInput
            label={confirmPasswordLabel}
            placeholder={confirmPasswordPlaceholder}
            required
            leftSection={<IconLock size={16} />}
            data-testid="confirm-new-password"
            {...form.getInputProps('confirmPassword')}
          />

          {showRevokeSessionsOption && (
            <Checkbox
              label={revokeSessionsLabel}
              description={revokeSessionsDescription}
              data-testid="revoke-sessions"
              {...form.getInputProps('revokeOtherSessions', { type: 'checkbox' })}
            />
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
              {cancelButtonText}
            </Button>
            <Button type="submit" loading={isLoading} data-testid="change-password-submit">
              {submitButtonText}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
