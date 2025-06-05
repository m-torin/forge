'use client';

import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import {
  IconCheck,
  IconDeviceLaptop,
  IconDeviceMobile,
  IconFingerprint,
  IconKey,
  IconTrash,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { createClientAnalytics, track } from '@repo/analytics/client';
import { addPasskey, deletePasskey, listPasskeys, signInWithPasskey } from '@repo/auth-new/client';

interface Passkey {
  createdAt: string;
  deviceType?: string;
  id: string;
  lastUsedAt?: string;
  name?: string;
}

interface PasskeySetupProps {
  onCancel?: () => void;
  onComplete?: () => void;
}

export function PasskeySetup({ onCancel, onComplete }: PasskeySetupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    validate: {
      name: (value) => (value.length < 3 ? 'Name must be at least 3 characters' : null),
    },
    initialValues: {
      name: '',
    },
  });

  const handleSetup = async (values: typeof form.values) => {
    setIsLoading(true);
    setError(null);
    try {
      // Add the passkey
      await addPasskey?.({ name: values.name });

      analytics.capture('passkey_added', {
        source: 'passkey_setup_component',
      });

      setSuccess(true);
      setTimeout(() => {
        onComplete?.();
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to add passkey. Make sure your device supports passkeys.';
      setError(errorMessage);
      analytics.capture('passkey_setup_failed', {
        error: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Stack align="center" py="xl">
        <IconCheck color="var(--mantine-color-green-6)" size={48} />
        <Title order={3}>Passkey Added Successfully!</Title>
        <Text c="dimmed">You can now use your passkey to sign in.</Text>
      </Stack>
    );
  }

  return (
    <form onSubmit={form.onSubmit(handleSetup)}>
      <Stack>
        <Alert color="blue" icon={<IconFingerprint size={16} />}>
          Passkeys let you sign in with your device's biometric authentication (fingerprint, face
          recognition) or PIN. They're more secure than passwords and can't be phished.
        </Alert>

        <TextInput
          description="Give this passkey a name to identify it later"
          placeholder="e.g., MacBook Pro, iPhone 15"
          label="Passkey Name"
          required
          {...form.getInputProps('name')}
        />

        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}

        <Group justify="flex-end">
          {onCancel && (
            <Button onClick={onCancel} variant="subtle">
              Cancel
            </Button>
          )}
          <Button leftSection={<IconKey size={16} />} loading={isLoading} type="submit">
            Add Passkey
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

interface PasskeyListProps {
  refreshTrigger?: number;
}

export function PasskeyList({ refreshTrigger = 0 }: PasskeyListProps) {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadPasskeys();
  }, [refreshTrigger]);

  const loadPasskeys = async () => {
    setIsLoading(true);
    try {
      const passkeyList = await listPasskeys?.();
      setPasskeys(passkeyList || []);
    } catch (error) {
      console.error('Failed to load passkeys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (passkeyId: string) => {
    setDeletingId(passkeyId);
    try {
      await deletePasskey?.({ passkeyId });
      setPasskeys(passkeys.filter((pk) => pk.id !== passkeyId));

      analytics.capture('passkey_removed', {
        passkeyId,
        source: 'passkey_list_component',
      });
    } catch (error) {
      console.error('Failed to delete passkey:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
    if (deviceType?.toLowerCase().includes('mobile')) {
      return <IconDeviceMobile size={20} />;
    }
    return <IconDeviceLaptop size={20} />;
  };

  if (isLoading) {
    return <Text c="dimmed">Loading passkeys...</Text>;
  }

  if (passkeys.length === 0) {
    return (
      <Text c="dimmed" py="md" ta="center">
        No passkeys configured
      </Text>
    );
  }

  return (
    <Stack gap="sm">
      {passkeys.map((passkey) => (
        <Card key={passkey.id} withBorder p="sm">
          <Group justify="space-between">
            <Group>
              {getDeviceIcon(passkey.deviceType)}
              <div>
                <Text fw={500}>{passkey.name || 'Unnamed Passkey'}</Text>
                <Text c="dimmed" size="sm">
                  Added {new Date(passkey.createdAt).toLocaleDateString()}
                  {passkey.lastUsedAt &&
                    ` • Last used ${new Date(passkey.lastUsedAt).toLocaleDateString()}`}
                </Text>
              </div>
            </Group>
            <ActionIcon
              color="red"
              loading={deletingId === passkey.id}
              onClick={() => handleDelete(passkey.id)}
              variant="subtle"
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}

interface PasskeyManagerProps {
  onPasskeyAdded?: () => void;
}

export function PasskeyManager({ onPasskeyAdded }: PasskeyManagerProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [opened, { close, open }] = useDisclosure(false);

  const handleComplete = () => {
    close();
    setRefreshTrigger((prev) => prev + 1);
    onPasskeyAdded?.();
  };

  return (
    <>
      <Stack>
        <Group justify="space-between">
          <div>
            <Title order={4}>Passkeys</Title>
            <Text c="dimmed" size="sm">
              Use biometric authentication or security keys to sign in
            </Text>
          </div>
          <Button leftSection={<IconKey size={16} />} onClick={open} variant="light">
            Add Passkey
          </Button>
        </Group>

        <PasskeyList refreshTrigger={refreshTrigger} />
      </Stack>

      <Modal onClose={close} opened={opened} title="Add Passkey">
        <PasskeySetup onCancel={close} onComplete={handleComplete} />
      </Modal>
    </>
  );
}

interface PasskeySignInButtonProps {
  fullWidth?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export function PasskeySignInButton({
  fullWidth = true,
  onError,
  onSuccess,
}: PasskeySignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithPasskey?.();

      analytics.capture('sign_in_completed', {
        method: 'passkey',
        source: 'passkey_signin_button',
      });

      onSuccess?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to sign in');
      onError?.(err);

      analytics.capture('sign_in_failed', {
        error: err.message,
        method: 'passkey',
        source: 'passkey_signin_button',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      fullWidth={fullWidth}
      leftSection={<IconFingerprint size={16} />}
      loading={isLoading}
      onClick={handleSignIn}
      variant="light"
    >
      Sign in with Passkey
    </Button>
  );
}
