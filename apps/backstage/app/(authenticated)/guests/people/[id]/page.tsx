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
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  createdAt: string;
  lastActive?: string;
  organizations?: Array<{
    id: string;
    name: string;
    role: string;
  }>;
}

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [paramsData, setParamsData] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then(p => setParamsData(p));
  }, [params]);

  useEffect(() => {
    if (paramsData?.id) {
      loadUser();
    }
  }, [paramsData?.id]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${paramsData?.id}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to load user details',
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

  if (loading || !user) {
    return (
      <Container size="lg" py="xl">
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => router.back()}>
            Back to Users
          </Button>
        </Group>

        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Group gap="md">
                <Avatar size="lg" radius="xl">
                  {user.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')}
                </Avatar>
                <div>
                  <Text fw={600} size="xl">
                    {user.name}
                  </Text>
                  <Text c="dimmed" size="sm">
                    {user.email}
                  </Text>
                </div>
              </Group>
              <Group gap="xs">
                <Tooltip label="Edit User">
                  <ActionIcon variant="light" color="blue" size="lg">
                    <IconEdit size={20} />
                  </ActionIcon>
                </Tooltip>
                <Badge
                  color={user.banned ? 'red' : 'green'}
                  variant="dot"
                  size="lg"
                >
                  {user.banned ? 'Banned' : 'Active'}
                </Badge>
              </Group>
            </Group>

            <Divider />

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
              <Card padding="md" radius="md" withBorder>
                <Stack gap="xs">
                  <Group gap="xs">
                    <IconShield size={16} />
                    <Text fw={500} size="sm">Role</Text>
                  </Group>
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
                </Stack>
              </Card>

              <Card padding="md" radius="md" withBorder>
                <Stack gap="xs">
                  <Group gap="xs">
                    <IconCalendar size={16} />
                    <Text fw={500} size="sm">Member Since</Text>
                  </Group>
                  <Text size="sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Text>
                </Stack>
              </Card>

              <Card padding="md" radius="md" withBorder>
                <Stack gap="xs">
                  <Group gap="xs">
                    <IconActivity size={16} />
                    <Text fw={500} size="sm">Last Active</Text>
                  </Group>
                  <Text size="sm">
                    {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                  </Text>
                </Stack>
              </Card>

              <Card padding="md" radius="md" withBorder>
                <Stack gap="xs">
                  <Group gap="xs">
                    <IconBuilding size={16} />
                    <Text fw={500} size="sm">Organizations</Text>
                  </Group>
                  <Text size="sm">
                    {user.organizations && user.organizations.length > 0 
                      ? `${user.organizations.length} organization(s)` 
                      : 'None'}
                  </Text>
                </Stack>
              </Card>
            </SimpleGrid>

            {user.organizations && user.organizations.length > 0 && (
              <>
                <Divider />
                <div>
                  <Text fw={500} mb="md" size="lg">Organizations</Text>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    {user.organizations.map((org) => (
                      <Card key={org.id} padding="md" radius="md" withBorder>
                        <Group justify="space-between">
                          <Text fw={500}>{org.name}</Text>
                          <Badge variant="light">
                            {org.role}
                          </Badge>
                        </Group>
                      </Card>
                    ))}
                  </SimpleGrid>
                </div>
              </>
            )}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}