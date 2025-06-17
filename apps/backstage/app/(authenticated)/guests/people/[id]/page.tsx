'use client';

import {
  Avatar,
  Badge,
  Group,
  Stack,
  Text,
  Card,
  SimpleGrid,
  Divider,
  Button,
  ActionIcon,
  Tooltip,
  Container,
  Alert,
} from '@mantine/core';
import {
  IconShield,
  IconBan,
  IconActivity,
  IconBuilding,
  IconMail,
  IconCalendar,
  IconEdit,
  IconArrowLeft,
  IconInfoCircle,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

import { getUserById } from '@repo/auth/server/next';
import { PageHeader } from '../../../components/page-header';
import type { User } from '../../types';

interface UserPageProps {
  params: Promise<{ id: string }>;
}

export default function UserPage({ params }: UserPageProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [paramsData, setParamsData] = useState<{ id: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    params.then((p) => setParamsData(p));
  }, [params]);

  useEffect(() => {
    if (paramsData?.id) {
      if (paramsData.id === 'new') {
        setLoading(false);
      } else {
        loadUser();
      }
    }
  }, [paramsData?.id]);

  const loadUser = async () => {
    if (!paramsData?.id || paramsData.id === 'new') return;

    setLoading(true);
    try {
      const result = await getUserById(paramsData.id);
      if (result.success && result.data) {
        setUser({
          ...result.data,
          role: (result.data as any).role || 'user',
          banned: (result.data as any).banned || false,
        } as User);
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to load user details',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load user details',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToOrganizations = () => {
    router.push('/guests/organizations');
  };

  const handleNavigateToSignUp = () => {
    // Open sign-up page in new tab
    window.open('/signup', '_blank');
  };

  // Handle "new" case - show user creation guide
  if (paramsData?.id === 'new') {
    return (
      <Container py="xl" size="xl">
        <Stack gap="xl">
          <PageHeader
            title="Add New Users"
            description="Choose how to add new users to your system"
            breadcrumbs={[
              { label: 'Guests', href: '/guests' },
              { label: 'People', href: '/guests/people' },
              { label: 'New' },
            ]}
          />

          <Alert icon={<IconInfoCircle size={20} />} title="User Creation Methods" color="blue">
            For security and proper access control, users should be added through one of the
            following methods:
          </Alert>

          <Stack gap="md">
            <Card padding="md" radius="md" withBorder>
              <Stack gap="sm">
                <Text fw={500}>Method 1: Organization Invitation (Recommended)</Text>
                <Text size="sm" c="dimmed">
                  Invite users to join specific organizations with predefined roles and permissions.
                </Text>
                <Button variant="light" onClick={handleNavigateToOrganizations} fullWidth>
                  Go to Organizations
                </Button>
              </Stack>
            </Card>

            <Card padding="md" radius="md" withBorder>
              <Stack gap="sm">
                <Text fw={500}>Method 2: Self Sign-up</Text>
                <Text size="sm" c="dimmed">
                  Direct users to the sign-up page where they can create their own accounts.
                </Text>
                <Button variant="light" onClick={handleNavigateToSignUp} fullWidth>
                  Open Sign-up Page
                </Button>
              </Stack>
            </Card>
          </Stack>

          <Text size="sm" c="dimmed" ta="center" mt="md">
            Direct user creation by administrators is not supported for security reasons.
          </Text>
        </Stack>
      </Container>
    );
  }

  if (loading || !user) {
    return (
      <Container py="xl" size="xl">
        <Text>Loading...</Text>
      </Container>
    );
  }

  // Handle view mode
  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <PageHeader
          title="User Details"
          description="View user information and activity"
          actions={{
            secondary: [
              {
                icon: <IconShield size={16} />,
                label: 'Impersonate',
                onClick: () => console.log('Impersonate user'),
              },
              {
                icon: <IconBan size={16} />,
                label: user.banned ? 'Unban' : 'Ban',
                onClick: () => console.log('Toggle ban'),
                color: 'red',
              },
            ],
          }}
          breadcrumbs={[
            { label: 'Guests', href: '/guests' },
            { label: 'People', href: '/guests/people' },
            { label: user.name },
          ]}
        />

        <SimpleGrid cols={{ base: 1, lg: 3, sm: 2 }} spacing="lg">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="xs">
              <Group gap="xs">
                <Avatar size="lg" radius="xl">
                  {user.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')}
                </Avatar>
                <div>
                  <Text fw={600} size="lg">
                    {user.name}
                  </Text>
                  <Text c="dimmed" size="sm">
                    {user.email}
                  </Text>
                </div>
              </Group>
              <Divider my="xs" />
              <div>
                <Text size="sm" c="dimmed">
                  Status
                </Text>
                <Badge color={user.banned ? 'red' : 'green'} variant="dot">
                  {user.banned ? 'Banned' : 'Active'}
                </Badge>
              </div>
            </Stack>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="xs">
              <Group gap="xs">
                <IconShield size={16} />
                <Text fw={500} size="sm">
                  Access & Role
                </Text>
              </Group>
              <div>
                <Text size="sm" c="dimmed">
                  Role
                </Text>
                <Badge
                  color={
                    user.role === 'admin' || user.role === 'super-admin'
                      ? 'red'
                      : user.role === 'moderator'
                        ? 'orange'
                        : 'blue'
                  }
                  variant="light"
                >
                  {user.role}
                </Badge>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Organizations
                </Text>
                <Text fw={500}>
                  {user.organizations && user.organizations.length > 0
                    ? `${user.organizations.length} organization(s)`
                    : 'None'}
                </Text>
              </div>
            </Stack>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="xs">
              <Group gap="xs">
                <IconActivity size={16} />
                <Text fw={500} size="sm">
                  Activity
                </Text>
              </Group>
              <div>
                <Text size="sm" c="dimmed">
                  Member Since
                </Text>
                <Text fw={500}>{new Date(user.createdAt).toLocaleDateString()}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Last Active
                </Text>
                <Text fw={500}>
                  {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                </Text>
              </div>
            </Stack>
          </Card>
        </SimpleGrid>

        {user.organizations && user.organizations.length > 0 && (
          <>
            <Divider />
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Text fw={500}>Organizations</Text>
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                  {user.organizations.map((org) => (
                    <Card key={org.id} padding="sm" radius="md" withBorder>
                      <Group justify="space-between">
                        <div>
                          <Text fw={500}>{org.name}</Text>
                          <Text size="xs" c="dimmed">
                            Member since organization creation
                          </Text>
                        </div>
                        <Badge variant="light" size="sm">
                          {org.role}
                        </Badge>
                      </Group>
                    </Card>
                  ))}
                </SimpleGrid>
              </Stack>
            </Card>
          </>
        )}

        <Group>
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.push('/guests/people')}
          >
            Back to People
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
