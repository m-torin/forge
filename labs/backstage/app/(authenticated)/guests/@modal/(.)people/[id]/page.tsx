'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { Text, Stack, Badge, Group, Avatar, Divider, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

import { ModalWrapper } from '../../modal-wrapper';
import { getUserAction } from '@/actions/guests';
import type { User } from '@/types/guests';

interface UserModalPageProps {
  params: Promise<{ id: string }>;
}

export default function UserModalPage({ params }: UserModalPageProps) {
  const [paramsData, setParamsData] = useState<{ id: string } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    params.then((p) => setParamsData(p));
  }, [params]);

  useEffect(() => {
    if (paramsData) {
      if (paramsData.id === 'new') {
        setLoading(false);
      } else {
        loadUser();
      }
    }
  }, [paramsData]);

  const loadUser = async () => {
    if (!paramsData || paramsData.id === 'new') return;

    setLoading(true);
    try {
      const result = await getUserAction(paramsData.id);
      if (result && !result.error) {
        const userData = result as any;
        setUser({
          ...userData,
          role: userData.role || 'user',
          banned: userData.banned || false,
          createdAt:
            userData.createdAt instanceof Date
              ? userData.createdAt.toISOString()
              : userData.createdAt,
        });
      } else {
        notifications.show({
          title: 'Error',
          message: result?.error || 'Failed to load user',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load user',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle "new" case
  if (paramsData?.id === 'new') {
    return (
      <ModalWrapper title="Add New User">
        <Alert icon={<IconInfoCircle size={20} />} title="User Creation Methods" color="blue">
          Users should be added through the organization invitation system or self sign-up. Direct
          user creation by administrators is not supported for security reasons.
        </Alert>
        <Text size="sm" c="dimmed" ta="center" mt="md">
          Please close this modal and use the organization invitation system.
        </Text>
      </ModalWrapper>
    );
  }

  // Handle view case
  if (loading || !user) {
    return (
      <ModalWrapper title="Loading...">
        <p>Loading user details...</p>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper title="User Details">
      <Stack gap="md">
        <Group gap="md">
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

        <Divider />

        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Status
            </Text>
            <Badge color={user.banned ? 'red' : 'green'} variant="dot">
              {user.banned ? 'Banned' : 'Active'}
            </Badge>
          </Group>

          <Group justify="space-between">
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
          </Group>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Member Since
            </Text>
            <Text size="sm">{new Date(user.createdAt).toLocaleDateString()}</Text>
          </Group>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Organizations
            </Text>
            <Text size="sm">
              {user.organizations && user.organizations.length > 0
                ? `${user.organizations.length} organization(s)`
                : 'None'}
            </Text>
          </Group>
        </Stack>
      </Stack>
    </ModalWrapper>
  );
}
