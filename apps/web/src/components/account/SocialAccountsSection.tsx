'use client';

import { Card, Title, Stack, Group, Button, Text } from '@mantine/core';
import {
  IconBrandGoogle,
  IconBrandFacebook,
  IconBrandTwitter,
  IconLink,
  IconUnlink,
} from '@tabler/icons-react';
import { useAuth, authClient } from '@repo/auth/client/next';
import type { ExtendedUser } from '@/types/auth';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';

const providerConfig = {
  google: {
    icon: IconBrandGoogle,
    label: 'Google',
    color: 'red',
  },
  facebook: {
    icon: IconBrandFacebook,
    label: 'Facebook',
    color: 'blue',
  },
  twitter: {
    icon: IconBrandTwitter,
    label: 'Twitter',
    color: 'cyan',
  },
} as const;

export function SocialAccountsSection() {
  const { user } = useAuth() as { user: ExtendedUser | null };
  const [linking, setLinking] = useState<string | null>(null);
  const [unlinking, setUnlinking] = useState<string | null>(null);

  if (!user) return null;

  const linkSocialAccount = async (provider: keyof typeof providerConfig) => {
    try {
      setLinking(provider);

      // Use social sign-in with current session to link account
      await authClient.signIn.social({
        provider,
        callbackURL: window.location.pathname,
      });

      notifications.show({
        title: 'Account linked',
        message: `Your ${providerConfig[provider].label} account has been linked successfully.`,
        color: 'green',
      });
    } catch (_error) {
      console.error('Failed to link account:', _error);
      notifications.show({
        title: 'Error',
        message: `Failed to link ${providerConfig[provider].label} account. Please try again.`,
        color: 'red',
      });
    } finally {
      setLinking(null);
    }
  };

  const unlinkSocialAccount = async (provider: keyof typeof providerConfig) => {
    // Check if this is the only auth method
    const hasPassword = user.hasPassword;
    const connectedAccounts =
      user.accounts?.filter((a) => Object.keys(providerConfig).includes(a.provider)).length || 0;

    if (!hasPassword && connectedAccounts <= 1) {
      notifications.show({
        title: 'Cannot unlink',
        message: 'You must have at least one login method. Set a password first before unlinking.',
        color: 'yellow',
      });
      return;
    }

    try {
      setUnlinking(provider);

      const account = user.accounts?.find((a) => a.provider === provider);
      if (!account) return;

      // TODO: unlinkAccount is not yet available in Better Auth client
      notifications.show({
        title: 'Not implemented',
        message: 'Account unlinking is not yet available',
        color: 'yellow',
      });
      return;

      notifications.show({
        title: 'Account unlinked',
        message: `Your ${providerConfig[provider].label} account has been unlinked.`,
        color: 'green',
      });
    } catch (_error) {
      console.error('Failed to unlink account:', _error);
      notifications.show({
        title: 'Error',
        message: `Failed to unlink ${providerConfig[provider].label} account. Please try again.`,
        color: 'red',
      });
    } finally {
      setUnlinking(null);
    }
  };

  return (
    <Card shadow="sm" radius="md" withBorder>
      <Title order={3} mb="md">
        Connected Accounts
      </Title>
      <Text size="sm" color="dimmed" mb="lg">
        Link your social accounts for easier login
      </Text>

      <Stack gap="sm">
        {Object.entries(providerConfig).map(([provider, config]) => {
          const isConnected = user.accounts?.some((a: any) => a.provider === provider);
          const Icon = config.icon;

          return (
            <Group key={provider} justify="space-between" p="sm" className="border rounded-lg">
              <Group>
                <Icon size={24} />
                <div>
                  <Text fw={500}>{config.label}</Text>
                  {isConnected && (
                    <Text size="xs" color="dimmed">
                      Connected
                    </Text>
                  )}
                </div>
              </Group>

              {isConnected ? (
                <Button
                  variant="subtle"
                  color="red"
                  size="sm"
                  leftSection={<IconUnlink size={16} />}
                  onClick={() => unlinkSocialAccount(provider as keyof typeof providerConfig)}
                  loading={unlinking === provider}
                  disabled={unlinking !== null}
                >
                  Unlink
                </Button>
              ) : (
                <Button
                  variant="light"
                  color={config.color}
                  size="sm"
                  leftSection={<IconLink size={16} />}
                  onClick={() => linkSocialAccount(provider as keyof typeof providerConfig)}
                  loading={linking === provider}
                  disabled={linking !== null}
                >
                  Link
                </Button>
              )}
            </Group>
          );
        })}
      </Stack>

      {!(user.hasPassword ?? true) && (
        <Card bg="yellow.1" mt="md" p="md">
          <Group gap="xs">
            <Text size="sm" fw={500}>
              Security tip:
            </Text>
            <Text size="sm">Set a password to ensure you can always access your account.</Text>
          </Group>
        </Card>
      )}
    </Card>
  );
}
