'use client';

import { Alert, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconFingerprint } from '@tabler/icons-react';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { z } from 'zod/v4';

const addPasskeySchema = z.object({
  name: z.string().min(1, 'Passkey name is required'),
});

export type AddPasskeyFormValues = z.infer<typeof addPasskeySchema>;

export interface AddPasskeyModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: AddPasskeyFormValues) => Promise<void>;
  onSuccess?: () => void;
  loading?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;

  // Customization
  title?: string;
  description?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  nameDescription?: string;
  infoText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
}

export function AddPasskeyModal({
  opened,
  onClose,
  onSubmit,
  onSuccess,
  loading = false,
  error = null,
  onErrorDismiss,
  title = 'Add a passkey',
  description = 'Passkeys let you sign in securely with your fingerprint, face, or device lock.',
  submitButtonText = 'Add passkey',
  cancelButtonText = 'Cancel',
  nameLabel = 'Passkey name',
  namePlaceholder = 'e.g., MacBook Pro',
  nameDescription = 'Give this passkey a name to help you identify it later',
  infoText = 'When you click "Add passkey", your browser will ask you to authenticate using your device\'s security features.',
  size = 'md',
  icon = <IconFingerprint size={16} />,
}: AddPasskeyModalProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const isLoading = loading || internalLoading;
  const currentError = error || internalError;

  const form = useForm<AddPasskeyFormValues>({
    initialValues: {
      name: getDefaultPasskeyName(),
    },
    validate: zodResolver(addPasskeySchema),
  });

  function getDefaultPasskeyName() {
    if (typeof navigator === 'undefined') return 'Device';

    const userAgent = navigator.userAgent.toLowerCase();
    const now = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    if (userAgent.includes('mac')) return `MacBook - ${now}`;
    if (userAgent.includes('iphone')) return `iPhone - ${now}`;
    if (userAgent.includes('ipad')) return `iPad - ${now}`;
    if (userAgent.includes('android')) return `Android - ${now}`;
    if (userAgent.includes('windows')) return `Windows - ${now}`;
    return `Device - ${now}`;
  }

  const handleSubmit = async (values: AddPasskeyFormValues) => {
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
      // Handle specific WebAuthn errors
      let errorMessage = 'Failed to add passkey. Please try again.';

      if (err.name === 'NotAllowedError') {
        errorMessage = 'The operation was cancelled or not allowed. Please try again.';
      } else if (err.name === 'InvalidStateError') {
        errorMessage = 'This device may already be registered. Please try a different device.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Passkeys are not supported on this device or browser.';
      } else if (err.message) {
        errorMessage = err.message;
      }

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

  return (
    <Modal opened={opened} onClose={handleClose} title={title} size={size}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {description && (
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          )}

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

          <TextInput
            label={nameLabel}
            placeholder={namePlaceholder}
            description={nameDescription}
            required
            leftSection={icon}
            data-testid="passkey-name"
            {...form.getInputProps('name')}
          />

          {infoText && (
            <Alert icon={<IconFingerprint size={16} />} variant="light">
              <Text size="sm">{infoText}</Text>
            </Alert>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
              {cancelButtonText}
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              leftSection={icon}
              data-testid="add-passkey-submit"
            >
              {submitButtonText}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
