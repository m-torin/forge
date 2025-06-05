'use client';

import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  FileInput,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAt,
  IconBrandGithub,
  IconBrandGoogle,
  IconCalendar,
  IconCheck,
  IconDeviceLaptop,
  IconEdit,
  IconLink,
  IconShield,
  IconTrash,
  IconUnlink,
  IconUpload,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { analytics } from '@repo/analytics-legacy';
import { updateUser } from '@repo/auth-new/actions';
import {
  listUserSessions,
  revokeUserSession,
  signInWithGitHub,
  signInWithGoogle,
  signOut,
  useSession,
} from '@repo/auth-new/client';

interface UserSession {
  createdAt: string;
  expiresAt: string;
  id: string;
  ipAddress?: string;
  token?: string;
  updatedAt: string;
  userAgent?: string;
}

interface ApiKey {
  createdAt: string;
  enabled: boolean;
  expiresAt?: string;
  id: string;
  lastUsedAt?: string;
  name: string;
  prefix?: string;
}

interface ConnectedAccount {
  connectedAt: Date;
  email?: string;
  id: string;
  provider: 'google' | 'github' | 'email';
}

interface UserProfileProps {
  onDeleteAccount?: () => void;
  showDangerZone?: boolean;
  showSocialAccounts?: boolean;
}

export function UserProfile({
  onDeleteAccount,
  showDangerZone = true,
  showSocialAccounts = true,
}: UserProfileProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteModalOpened, { close: closeDeleteModal, open: openDeleteModal }] =
    useDisclosure(false);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);

  const form = useForm({
    validate: {
      name: (value) => (!value?.trim() ? 'Name is required' : null),
    },
    initialValues: {
      name: '',
      image: null as File | null,
    },
  });

  useEffect(() => {
    if (session?.user) {
      form.setValues({
        name: session.user.name || '',
        image: null,
      });
    }
  }, [session?.user]);

  const handleUpdateProfile = async (values: typeof form.values) => {
    if (!session?.user) return;

    setIsUpdating(true);
    try {
      let imageUrl = session.user.image;

      // If there's a new image, upload it
      if (values.image) {
        // In a real app, you'd upload to a storage service
        // For now, we'll just use a data URL
        const reader = new FileReader();
        imageUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(values.image!);
        });
      }

      await updateUser({
        name: values.name,
      });

      analytics.capture('profile_updated', {
        source: 'user_profile',
        userId: session.user.id,
      });

      notifications.show({
        color: 'green',
        icon: <IconCheck size={16} />,
        message: 'Your profile has been updated successfully',
        title: 'Profile updated',
      });

      router.refresh();
    } catch (error) {
      console.error('Failed to update profile:', error);
      notifications.show({
        color: 'red',
        icon: <IconX size={16} />,
        message: 'Failed to update your profile. Please try again.',
        title: 'Update failed',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    // In a real app, you'd call an API to delete the account
    await signOut();
    onDeleteAccount?.();
    router.push('/' as any);
  };

  const handleConnectGoogle = async () => {
    try {
      await signInWithGoogle?.({ providerId: 'google' });

      analytics.capture('social_account_connected', {
        provider: 'google',
        source: 'user_profile',
        userId: session?.user?.id,
      });

      // In a real app, you'd refresh the connected accounts list
      setConnectedAccounts([
        ...connectedAccounts,
        {
          id: Math.random().toString(),
          provider: 'google',
          connectedAt: new Date(),
        },
      ]);

      notifications.show({
        color: 'green',
        icon: <IconCheck size={16} />,
        message: 'Google account connected successfully',
        title: 'Account connected',
      });
    } catch (error) {
      console.error('Failed to connect Google account:', error);
      notifications.show({
        color: 'red',
        icon: <IconX size={16} />,
        message: 'Failed to connect Google account',
        title: 'Connection failed',
      });
    }
  };

  const handleConnectGitHub = async () => {
    try {
      await signInWithGitHub?.({ providerId: 'github' });

      analytics.capture('social_account_connected', {
        provider: 'github',
        source: 'user_profile',
        userId: session?.user?.id,
      });

      // In a real app, you'd refresh the connected accounts list
      setConnectedAccounts([
        ...connectedAccounts,
        {
          id: Math.random().toString(),
          provider: 'github',
          connectedAt: new Date(),
        },
      ]);

      notifications.show({
        color: 'green',
        icon: <IconCheck size={16} />,
        message: 'GitHub account connected successfully',
        title: 'Account connected',
      });
    } catch (error) {
      console.error('Failed to connect GitHub account:', error);
      notifications.show({
        color: 'red',
        icon: <IconX size={16} />,
        message: 'Failed to connect GitHub account',
        title: 'Connection failed',
      });
    }
  };

  const handleDisconnectAccount = async (provider: string) => {
    try {
      // In a real app, you'd call an API to disconnect the account
      setConnectedAccounts(connectedAccounts.filter((acc) => acc.provider !== provider));

      analytics.capture('social_account_disconnected', {
        provider,
        source: 'user_profile',
        userId: session?.user?.id,
      });

      notifications.show({
        color: 'green',
        icon: <IconCheck size={16} />,
        message: `${provider} account disconnected successfully`,
        title: 'Account disconnected',
      });
    } catch (error) {
      console.error(`Failed to disconnect ${provider} account:`, error);
      notifications.show({
        color: 'red',
        icon: <IconX size={16} />,
        message: `Failed to disconnect ${provider} account`,
        title: 'Disconnection failed',
      });
    }
  };

  if (isPending) {
    return (
      <Container py="xl" size="sm">
        <Text>Loading profile...</Text>
      </Container>
    );
  }

  if (!session?.user) {
    return (
      <Container py="xl" size="sm">
        <Alert color="red">You must be signed in to view your profile.</Alert>
      </Container>
    );
  }

  return (
    <Container py="xl" size="sm">
      <Title order={2} mb="xl">
        Profile Settings
      </Title>

      <form onSubmit={form.onSubmit(handleUpdateProfile)}>
        <Card withBorder p="xl">
          <Stack>
            <Group align="flex-start">
              <Avatar radius="md" size={80} src={session.user.image || undefined}>
                {session.user.name?.[0]?.toUpperCase() || 'U'}
              </Avatar>

              <Stack style={{ flex: 1 }}>
                <TextInput
                  leftSection={<IconUser size={16} />}
                  placeholder="Enter your name"
                  label="Name"
                  {...form.getInputProps('name')}
                />

                <FileInput
                  leftSection={<IconUpload size={16} />}
                  placeholder="Choose image"
                  accept="image/*"
                  label="Profile Image"
                  {...form.getInputProps('image')}
                />
              </Stack>
            </Group>

            <Divider />

            <Stack gap="xs">
              <Group gap="xs">
                <IconAt color="var(--mantine-color-dimmed)" size={16} />
                <Text c="dimmed" size="sm">
                  Email
                </Text>
              </Group>
              <Group justify="space-between">
                <Text>{session.user.email}</Text>
                {session.user.emailVerified ? (
                  <Badge color="green" size="sm" variant="light">
                    Verified
                  </Badge>
                ) : (
                  <Badge color="yellow" size="sm" variant="light">
                    Unverified
                  </Badge>
                )}
              </Group>
            </Stack>

            <Stack gap="xs">
              <Group gap="xs">
                <IconCalendar color="var(--mantine-color-dimmed)" size={16} />
                <Text c="dimmed" size="sm">
                  Member Since
                </Text>
              </Group>
              <Text>
                {new Date(session.user.createdAt).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </Stack>

            <Group justify="flex-end">
              <Button leftSection={<IconEdit size={16} />} loading={isUpdating} type="submit">
                Update Profile
              </Button>
            </Group>
          </Stack>
        </Card>
      </form>

      {showSocialAccounts && (
        <>
          <Title order={3} mb="md" mt="xl">
            Connected Accounts
          </Title>

          <Card withBorder p="lg">
            <Stack>
              <Text c="dimmed" size="sm">
                Connect your social accounts for easier sign-in
              </Text>

              <Stack gap="sm">
                <SocialAccountButton
                  provider="google"
                  isConnected={connectedAccounts.some((acc) => acc.provider === 'google')}
                  onConnect={handleConnectGoogle}
                  onDisconnect={() => handleDisconnectAccount('google')}
                />

                <SocialAccountButton
                  provider="github"
                  isConnected={connectedAccounts.some((acc) => acc.provider === 'github')}
                  onConnect={handleConnectGitHub}
                  onDisconnect={() => handleDisconnectAccount('github')}
                />
              </Stack>
            </Stack>
          </Card>
        </>
      )}

      {showDangerZone && (
        <>
          <Title order={3} mb="md" mt="xl">
            Danger Zone
          </Title>

          <Card withBorder style={{ borderColor: 'var(--mantine-color-red-6)' }} p="lg">
            <Stack>
              <div>
                <Text fw={500} mb={4}>
                  Delete Account
                </Text>
                <Text c="dimmed" size="sm">
                  Permanently delete your account and all associated data. This action cannot be
                  undone.
                </Text>
              </div>

              <Button
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={openDeleteModal}
                variant="outline"
              >
                Delete Account
              </Button>
            </Stack>
          </Card>
        </>
      )}

      <Modal onClose={closeDeleteModal} opened={deleteModalOpened} title="Delete Account">
        <Stack>
          <Alert color="red" icon={<IconTrash size={16} />}>
            Are you sure you want to delete your account? This action cannot be undone and all your
            data will be permanently deleted.
          </Alert>

          <Group justify="flex-end">
            <Button onClick={closeDeleteModal} variant="subtle">
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

interface SessionManagementProps {
  onSessionRevoked?: () => void;
}

export function SessionManagement({ onSessionRevoked }: SessionManagementProps) {
  const { data: currentSession } = useSession();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const sessionList = await listUserSessions?.();
      setSessions(sessionList || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      await revokeUserSession?.({ sessionId });
      setSessions(sessions.filter((s) => s.id !== sessionId));

      analytics.capture('session_revoked', {
        sessionId,
        source: 'session_management',
      });

      onSessionRevoked?.();

      // If revoking current session, sign out
      if (sessionId === currentSession?.session?.id) {
        await signOut();
      }
    } catch (error) {
      console.error('Failed to revoke session:', error);
    } finally {
      setRevokingId(null);
    }
  };

  if (isLoading) {
    return <Text c="dimmed">Loading sessions...</Text>;
  }

  if (sessions.length === 0) {
    return (
      <Text c="dimmed" py="md" ta="center">
        No active sessions found
      </Text>
    );
  }

  return (
    <Stack>
      <Title order={3}>Active Sessions</Title>
      <Text c="dimmed" size="sm">
        These are the devices currently signed in to your account.
      </Text>

      <Stack gap="sm">
        {sessions.map((session) => {
          const isCurrent = session.id === currentSession?.session?.id;
          const isExpired = new Date(session.expiresAt) < new Date();

          return (
            <Card key={session.id} withBorder p="sm">
              <Group justify="space-between">
                <Group>
                  <IconDeviceLaptop size={20} />
                  <div>
                    <Group gap="xs">
                      <Text fw={500}>{session.userAgent || 'Unknown Device'}</Text>
                      {isCurrent && (
                        <Badge color="green" size="sm" variant="light">
                          Current
                        </Badge>
                      )}
                      {isExpired && (
                        <Badge color="red" size="sm" variant="light">
                          Expired
                        </Badge>
                      )}
                    </Group>
                    <Text c="dimmed" size="sm">
                      {session.ipAddress || 'Unknown location'} •{' '}
                      {new Date(session.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                </Group>

                {!isCurrent && (
                  <ActionIcon
                    color="red"
                    loading={revokingId === session.id}
                    onClick={() => handleRevokeSession(session.id)}
                    variant="subtle"
                  >
                    <IconX size={16} />
                  </ActionIcon>
                )}
              </Group>
            </Card>
          );
        })}
      </Stack>

      <Alert color="blue" icon={<IconShield size={16} />} variant="light">
        If you notice any unfamiliar devices, revoke their access immediately and change your
        password.
      </Alert>
    </Stack>
  );
}

interface SocialAccountButtonProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  provider: 'google' | 'github';
}

function SocialAccountButton({
  provider,
  isConnected,
  onConnect,
  onDisconnect,
}: SocialAccountButtonProps) {
  const getProviderDetails = () => {
    switch (provider) {
      case 'google':
        return {
          name: 'Google',
          color: 'red',
          icon: <IconBrandGoogle size={20} />,
        };
      case 'github':
        return {
          name: 'GitHub',
          color: 'dark',
          icon: <IconBrandGithub size={20} />,
        };
      default:
        return {
          name: provider,
          color: 'gray',
          icon: <IconLink size={20} />,
        };
    }
  };

  const { name, color, icon } = getProviderDetails();

  return (
    <Card withBorder p="sm">
      <Group justify="space-between">
        <Group>
          {icon}
          <div>
            <Text fw={500}>{name}</Text>
            <Text c="dimmed" size="sm">
              {isConnected ? 'Connected' : 'Not connected'}
            </Text>
          </div>
        </Group>

        <Button
          color={isConnected ? 'red' : (color as any)}
          leftSection={isConnected ? <IconUnlink size={16} /> : <IconLink size={16} />}
          onClick={isConnected ? onDisconnect : onConnect}
          size="sm"
          variant={isConnected ? 'outline' : 'filled'}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </Button>
      </Group>
    </Card>
  );
}
