'use client';

import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Center,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconDeviceLaptop,
  IconDeviceMobile,
  IconFingerprint,
  IconKey,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';

export interface Passkey {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt?: string;
  deviceType?: 'laptop' | 'mobile' | 'security-key';
}

export interface PasskeyListProps {
  passkeys: Passkey[];
  loading?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
  onAddPasskey?: () => void;
  onDeletePasskey?: (passkey: Passkey) => void;
  onPasskeyAdded?: () => void;
  onPasskeyDeleted?: () => void;

  // Customization
  title?: string;
  subtitle?: string;
  addButtonText?: string;
  emptyStateTitle?: string;
  emptyStateSubtitle?: string;
  infoText?: string;
  showInfoAlert?: boolean;
  showAddButton?: boolean;
}

export function PasskeyList({
  passkeys,
  loading = false,
  error = null,
  onErrorDismiss,
  onAddPasskey,
  onDeletePasskey,
  title = 'Passkeys',
  subtitle = 'Sign in with biometrics, security keys, or device credentials',
  addButtonText = 'Add passkey',
  emptyStateTitle = 'No passkeys configured',
  emptyStateSubtitle = 'Add a passkey for passwordless sign-in',
  infoText = "Passkeys are a secure, passwordless way to sign in using your device's built-in authentication like Face ID, Touch ID, or Windows Hello.",
  showInfoAlert = true,
  showAddButton = true,
}: PasskeyListProps) {
  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'mobile':
        return <IconDeviceMobile size={20} />;
      case 'security-key':
        return <IconKey size={20} />;
      default:
        return <IconDeviceLaptop size={20} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && passkeys.length === 0) {
    return (
      <Card withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={4}>{title}</Title>
          </Group>
          <Text c="dimmed" size="sm">
            Loading passkeys...
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Card withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Title order={4}>{title}</Title>
            <Text size="sm" c="dimmed" mt={4}>
              {subtitle}
            </Text>
          </div>
          {showAddButton && onAddPasskey && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={onAddPasskey}
              size="sm"
              data-testid="add-passkey"
            >
              {addButtonText}
            </Button>
          )}
        </Group>

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

        {passkeys.length === 0 ? (
          <Center py={40}>
            <Stack align="center" gap="md">
              <ThemeIcon size={60} color="gray" variant="light">
                <IconFingerprint size={30} />
              </ThemeIcon>
              <div style={{ textAlign: 'center' }}>
                <Text fw={500}>{emptyStateTitle}</Text>
                <Text c="dimmed" size="sm">
                  {emptyStateSubtitle}
                </Text>
              </div>
            </Stack>
          </Center>
        ) : (
          <Stack gap="xs">
            {passkeys.map(passkey => (
              <Card key={passkey.id} withBorder p="md">
                <Group justify="space-between">
                  <Group>
                    <ThemeIcon size="lg" variant="light">
                      {getDeviceIcon(passkey.deviceType)}
                    </ThemeIcon>
                    <div>
                      <Text fw={500}>{passkey.name}</Text>
                      <Group gap="xs">
                        <Text size="xs" c="dimmed">
                          Added {formatDate(passkey.createdAt)}
                        </Text>
                        {passkey.lastUsedAt && (
                          <>
                            <Text size="xs" c="dimmed">
                              •
                            </Text>
                            <Text size="xs" c="dimmed">
                              Last used {formatDate(passkey.lastUsedAt)}
                            </Text>
                          </>
                        )}
                      </Group>
                    </div>
                  </Group>

                  {onDeletePasskey && (
                    <Tooltip label="Delete passkey">
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => onDeletePasskey(passkey)}
                        data-testid={`delete-passkey-${passkey.id}`}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              </Card>
            ))}
          </Stack>
        )}

        {showInfoAlert && infoText && (
          <Alert icon={<IconFingerprint size={16} />} variant="light">
            <Text size="sm">{infoText}</Text>
          </Alert>
        )}
      </Stack>
    </Card>
  );
}
