'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Menu,
  Modal,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconBan,
  IconDots,
  IconRefresh,
  IconSearch,
  IconUserCheck,
  IconUserCog,
  IconUserPlus,
  IconUserX,
} from '@tabler/icons-react';
import React, { useCallback, useEffect, useState } from 'react';

import {
  banUser,
  impersonateUser,
  listUsers,
  removeUser,
  setUserRole,
  unbanUser,
} from '@repo/auth/client';

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

interface UserListProps {
  onCreateUser?: () => void;
  onUserSelect?: (user: User) => void;
}

export function UserList({ onCreateUser, onUserSelect }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [_statusFilter, _setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    limit: 25,
    page: 1,
    total: 0,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dialogAction, setDialogAction] = useState<'ban' | 'unban' | 'delete' | null>(null);
  const [opened, { close, open }] = useDisclosure(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listUsers({
        limit: pagination.limit,
        page: pagination.page,
        role: roleFilter === 'all' ? undefined : roleFilter,
        search: searchTerm || undefined,
      });

      if (response && !('error' in response)) {
        setUsers(response.users);
        setPagination((prev) => ({
          ...prev,
          total: response.total,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to load users',
        title: 'Error',
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (dialogAction !== null) {
      open();
    }
  }, [dialogAction, open]);

  const _handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setActionLoading(userId);
      await setUserRole({ role: newRole as any, userId });
      notifications.show({
        color: 'green',
        message: 'User role updated successfully',
        title: 'Success',
      });
      await fetchUsers();
    } catch (error) {
      console.error('Failed to update user role:', error);
      notifications.show({ color: 'red', message: 'Failed to update user role', title: 'Error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(selectedUser.id);
      await banUser({
        banReason: 'Administrative action',
        userId: selectedUser.id,
      });
      notifications.show({ color: 'green', message: 'User banned successfully', title: 'Success' });
      await fetchUsers();
    } catch (error) {
      console.error('Failed to ban user:', error);
      notifications.show({ color: 'red', message: 'Failed to ban user', title: 'Error' });
    } finally {
      setActionLoading(null);
      setDialogAction(null);
      setSelectedUser(null);
      close();
    }
  };

  const handleUnbanUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(selectedUser.id);
      await unbanUser({ userId: selectedUser.id });
      notifications.show({
        color: 'green',
        message: 'User unbanned successfully',
        title: 'Success',
      });
      await fetchUsers();
    } catch (error) {
      console.error('Failed to unban user:', error);
      notifications.show({ color: 'red', message: 'Failed to unban user', title: 'Error' });
    } finally {
      setActionLoading(null);
      setDialogAction(null);
      setSelectedUser(null);
      close();
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(selectedUser.id);
      await removeUser({ userId: selectedUser.id });
      notifications.show({
        color: 'green',
        message: 'User deleted successfully',
        title: 'Success',
      });
      await fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      notifications.show({ color: 'red', message: 'Failed to delete user', title: 'Error' });
    } finally {
      setActionLoading(null);
      setDialogAction(null);
      setSelectedUser(null);
      close();
    }
  };

  const handleImpersonate = async (userId: string) => {
    try {
      setActionLoading(userId);
      await impersonateUser({ userId });
      notifications.show({ color: 'green', message: 'Now impersonating user', title: 'Success' });
      // Redirect to main app
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to impersonate user:', error);
      notifications.show({ color: 'red', message: 'Failed to impersonate user', title: 'Error' });
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
      case 'super-admin':
        return 'red';
      case 'moderator':
        return 'blue';
      case 'support':
        return 'cyan';
      default:
        return 'gray';
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (loading) {
    return (
      <Stack gap="md">
        <Skeleton height={40} />
        <Stack gap="xs">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={`skeleton-${i}`} height={60} />
          ))}
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {/* Filters and Search */}
      <Group>
        <TextInput
          leftSection={<IconSearch size={16} />}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by email..."
          flex={1}
          value={searchTerm}
        />
        <Select
          onChange={(value) => setRoleFilter(value || 'all')}
          placeholder="Filter by role"
          data={[
            { label: 'All Roles', value: 'all' },
            { label: 'User', value: 'user' },
            { label: 'Admin', value: 'admin' },
            { label: 'Super Admin', value: 'super-admin' },
            { label: 'Moderator', value: 'moderator' },
            { label: 'Support', value: 'support' },
          ]}
          value={roleFilter}
          w={180}
        />
        <ActionIcon onClick={fetchUsers} disabled={loading} size="lg" variant="default">
          <IconRefresh className={loading ? 'animate-spin' : ''} size={16} />
        </ActionIcon>
        {onCreateUser && (
          <Button leftSection={<IconUserPlus size={16} />} onClick={onCreateUser}>
            Create User
          </Button>
        )}
      </Group>

      {/* Users Table */}
      <Table withColumnBorders withTableBorder striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>User</Table.Th>
            <Table.Th>Role</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Created</Table.Th>
            <Table.Th ta="right">Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((user) => (
            <Table.Tr key={user.id}>
              <Table.Td>
                <Stack gap={2}>
                  <Text fw={500}>{user.name}</Text>
                  <Text c="dimmed" size="sm">
                    {user.email}
                  </Text>
                </Stack>
              </Table.Td>
              <Table.Td>
                <Badge color={getRoleBadgeColor(user.role)}>{user.role}</Badge>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  {user.banned ? (
                    <Badge color="red">Banned</Badge>
                  ) : (
                    <Badge color="gray">Active</Badge>
                  )}
                  {!user.emailVerified && <Badge variant="outline">Unverified</Badge>}
                </Group>
              </Table.Td>
              <Table.Td>{new Date(user.createdAt).toLocaleDateString()}</Table.Td>
              <Table.Td ta="right">
                <Menu width={200} shadow="md">
                  <Menu.Target>
                    <ActionIcon disabled={actionLoading === user.id} size="sm" variant="subtle">
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>Actions</Menu.Label>
                    {onUserSelect && (
                      <Menu.Item
                        leftSection={<IconUserCog size={14} />}
                        onClick={() => onUserSelect(user)}
                      >
                        View Details
                      </Menu.Item>
                    )}
                    <Menu.Item
                      leftSection={<IconUserCheck size={14} />}
                      onClick={() => handleImpersonate(user.id)}
                    >
                      Impersonate
                    </Menu.Item>
                    <Menu.Divider />
                    {user.banned ? (
                      <Menu.Item
                        leftSection={<IconUserCheck size={14} />}
                        onClick={() => {
                          setSelectedUser(user);
                          setDialogAction('unban');
                        }}
                      >
                        Unban User
                      </Menu.Item>
                    ) : (
                      <Menu.Item
                        color="red"
                        leftSection={<IconBan size={14} />}
                        onClick={() => {
                          setSelectedUser(user);
                          setDialogAction('ban');
                        }}
                      >
                        Ban User
                      </Menu.Item>
                    )}
                    <Menu.Item
                      color="red"
                      leftSection={<IconUserX size={14} />}
                      onClick={() => {
                        setSelectedUser(user);
                        setDialogAction('delete');
                      }}
                    >
                      Delete User
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <Group justify="space-between">
          <Text c="dimmed" size="sm">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
            users
          </Text>
          <Group gap="xs">
            <Button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              size="sm"
              variant="default"
            >
              Previous
            </Button>
            <Text fw={500} size="sm">
              Page {pagination.page} of {totalPages}
            </Text>
            <Button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === totalPages}
              size="sm"
              variant="default"
            >
              Next
            </Button>
          </Group>
        </Group>
      )}

      {/* Confirmation Modal */}
      <Modal
        onClose={() => {
          close();
          setDialogAction(null);
          setSelectedUser(null);
        }}
        opened={opened}
        title={
          dialogAction === 'ban'
            ? 'Ban User'
            : dialogAction === 'unban'
              ? 'Unban User'
              : 'Delete User'
        }
      >
        <Stack gap="md">
          <Text>
            {dialogAction === 'ban' &&
              `Are you sure you want to ban ${selectedUser?.email}? They will not be able to sign in.`}
            {dialogAction === 'unban' &&
              `Are you sure you want to unban ${selectedUser?.email}? They will be able to sign in again.`}
            {dialogAction === 'delete' &&
              `Are you sure you want to permanently delete ${selectedUser?.email}? This action cannot be undone.`}
          </Text>
          <Group justify="flex-end">
            <Button
              onClick={() => {
                close();
                setDialogAction(null);
                setSelectedUser(null);
              }}
              variant="subtle"
            >
              Cancel
            </Button>
            <Button
              color={dialogAction === 'unban' ? 'blue' : 'red'}
              onClick={
                dialogAction === 'ban'
                  ? handleBanUser
                  : dialogAction === 'unban'
                    ? handleUnbanUser
                    : handleDeleteUser
              }
            >
              {dialogAction === 'ban' && 'Ban User'}
              {dialogAction === 'unban' && 'Unban User'}
              {dialogAction === 'delete' && 'Delete User'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
