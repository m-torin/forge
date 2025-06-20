'use client';

import { Card, Title, Stack, Group, Button, Text, Switch, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { IconShield, IconKey, IconFingerprint, IconDeviceMobile } from '@tabler/icons-react';
import { useAuth, enableTwoFactor, disableTwoFactor, addPasskey } from '@repo/auth/client/next';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import type { ExtendedUser } from '@/types/auth';
import { logger } from '@/lib/logger';

function SecuritySettingsInner() {
  const { user } = useAuth() as { user: ExtendedUser | null };
  const [loading, setLoading] = useState<string | null>(null);

  // Mock states - would come from user settings
  const [twoFactorEnabled, { open: enable2FA, close: disable2FA }] = useDisclosure(false);
  const [passkeysEnabled, { open: enablePasskeys, close: disablePasskeys }] = useDisclosure(false);

  if (!user) return null;

  const handleEnable2FA = async () => {
    try {
      setLoading('2fa');

      // Enable 2FA through Better Auth
      await enableTwoFactor();

      enable2FA();
      notifications.show({
        title: 'Two-factor authentication enabled',
        message: 'Your account is now more secure!',
        color: 'green',
      });
    } catch (_error) {
      console.error('Failed to enable 2FA:', _error);
      notifications.show({
        title: 'Error',
        message: 'Failed to enable two-factor authentication',
        color: 'red',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setLoading('2fa');

      // Disable 2FA through Better Auth
      await disableTwoFactor();

      disable2FA();
      notifications.show({
        title: 'Two-factor authentication disabled',
        message: 'Consider re-enabling for better security',
        color: 'yellow',
      });
    } catch (_error) {
      console.error('Failed to disable 2FA:', _error);
      notifications.show({
        title: 'Error',
        message: 'Failed to disable two-factor authentication',
        color: 'red',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleAddPasskey = async () => {
    try {
      setLoading('passkey');

      // Add passkey through Better Auth
      await addPasskey({ name: 'My Device' });

      enablePasskeys();
      notifications.show({
        title: 'Passkey added',
        message: 'You can now use your device to sign in',
        color: 'green',
      });
    } catch (_error) {
      logger.error('Failed to add passkey', _error);
      notifications.show({
        title: 'Error',
        message: 'Failed to add passkey. Your device may not support this feature.',
        color: 'red',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card shadow="sm" radius="md" withBorder>
      <Title order={3} mb="md">
        Security Settings
      </Title>
      <Text size="sm" color="dimmed" mb="lg">
        Enhance your account security with additional authentication methods
      </Text>

      <Stack gap="md">
        {/* Password Status */}
        <Card withBorder p="md">
          <Group justify="space-between">
            <Group>
              <IconKey size={24} />
              <div>
                <Text fw={500}>Password</Text>
                <Text size="sm" color="dimmed">
                  {(user.hasPassword ?? true) ? 'Password is set' : 'No password set'}
                </Text>
              </div>
            </Group>
            {(user.hasPassword ?? true) ? (
              <Badge color="green">Active</Badge>
            ) : (
              <Button size="sm" variant="light">
                Set password
              </Button>
            )}
          </Group>
        </Card>

        {/* Two-Factor Authentication */}
        <Card withBorder p="md">
          <Group justify="space-between">
            <Group>
              <IconDeviceMobile size={24} />
              <div>
                <Text fw={500}>Two-Factor Authentication</Text>
                <Text size="sm" color="dimmed">
                  Add an extra layer of security
                </Text>
              </div>
            </Group>
            <Switch
              checked={twoFactorEnabled}
              onChange={(e) => (e.currentTarget.checked ? handleEnable2FA() : handleDisable2FA())}
              disabled={loading !== null}
            />
          </Group>
        </Card>

        {/* Passkeys */}
        <Card withBorder p="md">
          <Group justify="space-between">
            <Group>
              <IconFingerprint size={24} />
              <div>
                <Text fw={500}>Passkeys</Text>
                <Text size="sm" color="dimmed">
                  Sign in with your device's biometrics
                </Text>
              </div>
            </Group>
            {passkeysEnabled ? (
              <Badge color="green">Enabled</Badge>
            ) : (
              <Button
                size="sm"
                variant="light"
                onClick={handleAddPasskey}
                loading={loading === 'passkey'}
                disabled={loading !== null}
              >
                Add passkey
              </Button>
            )}
          </Group>
        </Card>

        {/* Security Summary */}
        <Card bg="blue.1" p="md" mt="md">
          <Group gap="xs">
            <IconShield size={20} className="text-blue-600" />
            <Text size="sm" fw={500}>
              Security Score:
            </Text>
            <Text size="sm">
              {(user.hasPassword ?? true) && twoFactorEnabled && passkeysEnabled
                ? 'Excellent'
                : (user.hasPassword ?? true) && (twoFactorEnabled || passkeysEnabled)
                  ? 'Good'
                  : (user.hasPassword ?? true)
                    ? 'Fair'
                    : 'Needs improvement'}
            </Text>
          </Group>
        </Card>
      </Stack>
    </Card>
  );
}

export function SecuritySettings() {
  return (
    <ErrorBoundary
      fallback={
        <Card p="md" withBorder>
          <Stack gap="md" ta="center">
            <IconShield size={48} />
            <Title order={3}>Security Settings Unavailable</Title>
            <Text c="dimmed">
              We're unable to load your security settings right now. Please try refreshing the page.
            </Text>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </Stack>
        </Card>
      }
    >
      <SecuritySettingsInner />
    </ErrorBoundary>
  );
}
