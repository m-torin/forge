'use client';

import {
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconBan,
  IconCalendar,
  IconClock,
  IconDeviceDesktop,
  IconLogout,
  IconMapPin,
  IconUserCheck,
} from '@tabler/icons-react';
import React, { useCallback, useEffect, useState } from 'react';

import {
  banUser,
  listUserSessions,
  revokeUserSession,
  revokeUserSessions,
  setUserRole,
  unbanUser,
} from '@repo/auth-new/client';

import { ChangePasswordDialog } from './change-password-dialog';

interface User {
  banExpires?: string;
  banned: boolean;
  banReason?: string;
  createdAt: string;
  email: string;
  emailVerified: boolean;
  id: string;
  name: string;
  role: string;
}

interface Session {
  createdAt: string;
  expiresAt: string;
  id: string;
  impersonatedBy?: string;
  ipAddress?: string;
  token: string;
  userAgent?: string;
  userId: string;
}

interface UserDetailsProps {
  onUpdate?: () => void;
  user: User;
}

export function UserDetails({ onUpdate, user }: UserDetailsProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('7'); // days
  const [dialogAction, setDialogAction] = useState<'ban' | 'unban' | 'revoke-all' | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const userSessions = await listUserSessions({ userId: user.id });
      setSessions(userSessions);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to load user sessions',
        title: 'Error',
      });
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevokeSession = async (sessionToken: string) => {
    try {
      await revokeUserSession({ sessionToken });
      notifications.show({
        color: 'green',
        message: 'Session revoked successfully',
        title: 'Success',
      });
      await fetchSessions();
    } catch (error) {
      console.error('Failed to revoke session:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to revoke session',
        title: 'Error',
      });
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      await revokeUserSessions({ userId: user.id });
      notifications.show({
        color: 'green',
        message: 'All sessions revoked successfully',
        title: 'Success',
      });
      await fetchSessions();
      setDialogAction(null);
    } catch (error) {
      console.error('Failed to revoke sessions:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to revoke sessions',
        title: 'Error',
      });
    }
  };

  const handleRoleChange = async () => {
    if (selectedRole === user.role) return;

    try {
      await setUserRole({
        role: selectedRole as 'user' | 'support' | 'admin' | 'super-admin' | 'moderator',
        userId: user.id,
      });
      notifications.show({
        color: 'green',
        message: 'User role updated successfully',
        title: 'Success',
      });
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update role:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to update role',
        title: 'Error',
      });
    }
  };

  const handleBanUser = async () => {
    try {
      const banExpiresIn =
        banDuration === 'permanent' ? undefined : parseInt(banDuration) * 24 * 60 * 60;

      await banUser({
        banExpiresIn,
        banReason: banReason || 'Administrative action',
        userId: user.id,
      });
      notifications.show({
        color: 'green',
        message: 'User banned successfully',
        title: 'Success',
      });
      onUpdate?.();
      setDialogAction(null);
    } catch (error) {
      console.error('Failed to ban user:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to ban user',
        title: 'Error',
      });
    }
  };

  const handleUnbanUser = async () => {
    try {
      await unbanUser({ userId: user.id });
      notifications.show({
        color: 'green',
        message: 'User unbanned successfully',
        title: 'Success',
      });
      onUpdate?.();
      setDialogAction(null);
    } catch (error) {
      console.error('Failed to unban user:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to unban user',
        title: 'Error',
      });
    }
  };

  const parseUserAgent = (userAgent?: string) => {
    if (!userAgent) return 'Unknown Device';

    // Simple parsing - in production, use a proper user agent parser
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('Android')) return 'Android';
    return 'Unknown Device';
  };

  return (
    <Stack gap="lg">
      {/* User Information */}
      <Card shadow="sm" p="lg" radius="md">
        <Stack gap="md">
          <div>
            <Title order={4}>User Information</Title>
            <Text c="dimmed" size="sm">
              Basic details about the user account
            </Text>
          </div>
          <Stack gap="sm">
            <Group grow>
              <div>
                <Text c="dimmed" fw={500} size="sm">
                  Name
                </Text>
                <Text size="sm">{user.name}</Text>
              </div>
              <div>
                <Text c="dimmed" fw={500} size="sm">
                  Email
                </Text>
                <Text size="sm">{user.email}</Text>
              </div>
            </Group>
            <Group grow>
              <div>
                <Text c="dimmed" fw={500} size="sm">
                  User ID
                </Text>
                <Text ff="monospace" size="sm">
                  {user.id}
                </Text>
              </div>
              <div>
                <Text c="dimmed" fw={500} size="sm">
                  Created
                </Text>
                <Text size="sm">{new Date(user.createdAt).toLocaleString()}</Text>
              </div>
            </Group>
          </Stack>
          <Stack
            style={{ borderTop: '1px solid var(--mantine-color-gray-2)', paddingTop: '1rem' }}
            gap="sm"
          >
            <div>
              <Text c="dimmed" fw={500} size="sm">
                Email Verification
              </Text>
              <Badge color={user.emailVerified ? 'green' : 'gray'} mt="xs" variant="light">
                {user.emailVerified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
            <div>
              <Text c="dimmed" fw={500} size="sm">
                Account Status
              </Text>
              {user.banned ? (
                <Stack gap="xs" mt="xs">
                  <Badge color="red" variant="light">
                    Banned
                  </Badge>
                  {user.banReason && (
                    <Text c="dimmed" size="sm">
                      Reason: {user.banReason}
                    </Text>
                  )}
                  {user.banExpires && (
                    <Text c="dimmed" size="sm">
                      Expires: {new Date(user.banExpires).toLocaleString()}
                    </Text>
                  )}
                </Stack>
              ) : (
                <Badge color="green" mt="xs" variant="light">
                  Active
                </Badge>
              )}
            </div>
          </Stack>
        </Stack>
      </Card>

      {/* Role Management */}
      <Card shadow="sm" p="lg" radius="md">
        <Stack gap="md">
          <div>
            <Title order={4}>Role Management</Title>
            <Text c="dimmed" size="sm">
              Manage user roles and permissions
            </Text>
          </div>
          <Group align="flex-end">
            <Select
              onChange={(value) => value && setSelectedRole(value)}
              style={{ flex: 1 }}
              data={[
                { label: 'User', value: 'user' },
                { label: 'Admin', value: 'admin' },
                { label: 'Super Admin', value: 'super-admin' },
                { label: 'Moderator', value: 'moderator' },
                { label: 'Support', value: 'support' },
              ]}
              label="User Role"
              value={selectedRole}
            />
            <Button onClick={handleRoleChange} disabled={selectedRole === user.role}>
              Update Role
            </Button>
          </Group>
        </Stack>
      </Card>

      {/* Account Actions */}
      <Card shadow="sm" p="lg" radius="md">
        <Stack gap="md">
          <div>
            <Title order={4}>Account Actions</Title>
            <Text c="dimmed" size="sm">
              Administrative actions for this account
            </Text>
          </div>
          <Group>
            {user.banned ? (
              <Button
                leftSection={<IconUserCheck size={16} />}
                onClick={() => setDialogAction('unban')}
                variant="default"
              >
                Unban User
              </Button>
            ) : (
              <Button
                color="red"
                leftSection={<IconBan size={16} />}
                onClick={() => setDialogAction('ban')}
              >
                Ban User
              </Button>
            )}
            <Button
              leftSection={<IconLogout size={16} />}
              onClick={() => setDialogAction('revoke-all')}
              disabled={sessions.length === 0}
              variant="default"
            >
              Revoke All Sessions
            </Button>
            <ChangePasswordDialog _onSuccess={onUpdate} _userId={user.id} userName={user.name} />
          </Group>
        </Stack>
      </Card>

      {/* Active Sessions */}
      <Card shadow="sm" p="lg" radius="md">
        <Stack gap="md">
          <div>
            <Title order={4}>Active Sessions</Title>
            <Text c="dimmed" size="sm">
              Currently active login sessions for this user
            </Text>
          </div>
          {loading ? (
            <Text c="dimmed" py="md" ta="center">
              Loading sessions...
            </Text>
          ) : sessions.length === 0 ? (
            <Text c="dimmed" py="md" ta="center">
              No active sessions
            </Text>
          ) : (
            <Table highlightOnHover striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Device/Browser</Table.Th>
                  <Table.Th>IP Address</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Expires</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {sessions.map((session) => (
                  <Table.Tr key={session.id}>
                    <Table.Td>
                      <Group gap="xs">
                        <IconDeviceDesktop color="gray" size={16} />
                        <Text size="sm">{parseUserAgent(session.userAgent)}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <IconMapPin color="gray" size={16} />
                        <Text ff="monospace" size="sm">
                          {session.ipAddress || 'Unknown'}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <IconCalendar color="gray" size={16} />
                        <Text size="sm">{new Date(session.createdAt).toLocaleDateString()}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <IconClock color="gray" size={16} />
                        <Text size="sm">{new Date(session.expiresAt).toLocaleDateString()}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      {session.impersonatedBy ? (
                        <Badge color="gray" variant="light">
                          Impersonated
                        </Badge>
                      ) : (
                        <Badge color="green" variant="light">
                          Active
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Button
                        onClick={() => handleRevokeSession(session.token)}
                        size="xs"
                        variant="subtle"
                      >
                        <IconLogout size={16} />
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Card>

      {/* Ban User Modal */}
      <Modal
        onClose={() => setDialogAction(null)}
        opened={dialogAction === 'ban'}
        size="md"
        title="Ban User"
      >
        <Stack gap="md">
          <Text c="dimmed" size="sm">
            Ban this user from accessing the application.
          </Text>
          <Textarea
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="Enter reason for ban..."
            rows={3}
            label="Ban Reason"
            value={banReason}
          />
          <Select
            onChange={(value) => value && setBanDuration(value)}
            data={[
              { label: '1 Day', value: '1' },
              { label: '7 Days', value: '7' },
              { label: '30 Days', value: '30' },
              { label: 'Permanent', value: 'permanent' },
            ]}
            label="Ban Duration"
            value={banDuration}
          />
          <Group justify="flex-end" mt="md">
            <Button onClick={() => setDialogAction(null)} variant="default">
              Cancel
            </Button>
            <Button color="red" onClick={handleBanUser}>
              Ban User
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Unban User Modal */}
      <Modal
        onClose={() => setDialogAction(null)}
        opened={dialogAction === 'unban'}
        size="sm"
        title="Unban User"
      >
        <Stack gap="md">
          <Text c="dimmed" size="sm">
            Allow this user to access the application again.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button onClick={() => setDialogAction(null)} variant="default">
              Cancel
            </Button>
            <Button color="green" onClick={handleUnbanUser}>
              Unban User
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Revoke All Sessions Modal */}
      <Modal
        onClose={() => setDialogAction(null)}
        opened={dialogAction === 'revoke-all'}
        size="sm"
        title="Revoke All Sessions"
      >
        <Stack gap="md">
          <Text c="dimmed" size="sm">
            This will sign out the user from all devices and locations.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button onClick={() => setDialogAction(null)} variant="default">
              Cancel
            </Button>
            <Button color="red" onClick={handleRevokeAllSessions}>
              Revoke All Sessions
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
