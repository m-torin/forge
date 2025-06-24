'use client';

import {
  Avatar,
  Badge,
  Button,
  Container,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Select,
} from '@mantine/core';
import {
  IconActivity,
  IconBan,
  IconShield,
  IconUserCheck,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState, useMemo } from 'react';
import { notifications } from '@mantine/notifications';

import {
  listUsersAction as getUsersAction,
  adminDeleteUserAction as deleteUserAction,
  banUserAction,
  unbanUserAction,
  impersonateUserAction,
} from '@repo/auth/actions';

import { DataTable } from '@/components/auth/DataTable';
import { PageHeader } from '@/components/auth/PageHeader';
import { StatsCard } from '@/components/auth/StatsCard';

import type { User } from '@/types/auth';

// Constants
const USER_ROLES = [
  { value: 'user', label: 'User' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'admin', label: 'Admin' },
  { value: 'super-admin', label: 'Super Admin' },
];

const ROLE_COLORS = {
  'super-admin': 'red',
  admin: 'red',
  moderator: 'orange',
  user: 'blue',
} as const;

// Custom hook for users data
const useUsersData = () => {
  const [state, setState] = useState({
    users: [] as User[],
    loading: true,
  });

  const loadData = async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const result = await getUsersAction();
      if (result.success && result.data) {
        const users = result.data.map((user: any) => ({
          ...user,
          role: user.role || 'user',
          banned: user.banned || false,
        }));
        setState({ users, loading: false });
      } else {
        const errorDetails = result.error
          ? typeof result.error === 'string'
            ? result.error
            : JSON.stringify(result.error, null, 2)
          : 'Unknown error occurred';

        console.error('Failed to load users:', result);

        notifications.show({
          title: 'Failed to load users',
          message: `Error: ${errorDetails}`,
          color: 'red',
          autoClose: false,
        });
        setState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Users loading exception:', error);

      const errorMessage =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : `Unexpected error: ${JSON.stringify(error)}`;

      notifications.show({
        title: 'Users Loading Failed',
        message: errorMessage,
        color: 'red',
        autoClose: false,
      });
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { ...state, refetch: loadData };
};

export default function UsersPage() {
  const { users, loading, refetch } = useUsersData();
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });

  const statsData = useMemo(() => {
    const active = users.filter((u) => !u.banned);
    const banned = users.filter((u) => u.banned);
    const admins = users.filter((u) => ['admin', 'super-admin'].includes(u.role));

    return [
      {
        title: 'Total Users',
        value: users.length.toString(),
        color: 'blue',
        icon: IconUsers,
        change: { value: 12 },
      },
      {
        title: 'Active Users',
        value: active.length.toString(),
        color: 'green',
        icon: IconUserCheck,
        progress: {
          label: 'of total users',
          value: users.length ? Math.round((active.length / users.length) * 100) : 0,
        },
      },
      { title: 'Banned Users', value: banned.length.toString(), color: 'red', icon: IconBan },
      { title: 'Admin Users', value: admins.length.toString(), color: 'orange', icon: IconShield },
    ];
  }, [users]);

  const handleCreateUser = async () => {
    notifications.show({
      title: 'Info',
      message: 'User creation should be done through the sign-up flow or invitation system',
      color: 'blue',
    });
    closeCreateModal();
  };

  const handleBanUser = async (userId: string, ban: boolean) => {
    try {
      const result = ban ? await banUserAction(userId) : await unbanUserAction(userId);
      const action = ban ? 'banned' : 'unbanned';
      const actionVerb = ban ? 'ban' : 'unban';

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: `User ${action} successfully`,
          color: 'green',
        });
        await refetch();
      } else {
        const errorDetails = result.error
          ? typeof result.error === 'string'
            ? result.error
            : JSON.stringify(result.error, null, 2)
          : 'Unknown error occurred';

        console.error(`User ${actionVerb} failed:`, {
          userId,
          action: actionVerb,
          result,
          error: result.error,
        });

        notifications.show({
          title: `Failed to ${actionVerb} user`,
          message: `Error: ${errorDetails}`,
          color: 'red',
          autoClose: false,
        });
      }
    } catch (error) {
      const actionVerb = ban ? 'ban' : 'unban';
      console.error(`User ${actionVerb} exception:`, error);

      const errorMessage =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : `Unexpected error: ${JSON.stringify(error)}`;

      notifications.show({
        title: `User ${actionVerb.charAt(0).toUpperCase() + actionVerb.slice(1)} Failed`,
        message: errorMessage,
        color: 'red',
        autoClose: false,
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const result = await deleteUserAction(userId);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'User deleted successfully',
          color: 'green',
        });
        await refetch();
      } else {
        const errorDetails = result.error
          ? typeof result.error === 'string'
            ? result.error
            : JSON.stringify(result.error, null, 2)
          : 'Unknown error occurred';

        console.error('User deletion failed:', {
          userId,
          result,
          error: result.error,
        });

        notifications.show({
          title: 'Failed to delete user',
          message: `Error: ${errorDetails}`,
          color: 'red',
          autoClose: false,
        });
      }
    } catch (error) {
      console.error('User deletion exception:', error);

      const errorMessage =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : `Unexpected error: ${JSON.stringify(error)}`;

      notifications.show({
        title: 'User Deletion Failed',
        message: errorMessage,
        color: 'red',
        autoClose: false,
      });
    }
  };

  const handleImpersonateUser = async (userId: string) => {
    try {
      const result = await impersonateUserAction(userId);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'User impersonation started',
          color: 'green',
        });
        window.location.href = '/';
      } else {
        const errorDetails = result.error
          ? typeof result.error === 'string'
            ? result.error
            : JSON.stringify(result.error, null, 2)
          : 'Unknown error occurred';

        console.error('User impersonation failed:', {
          userId,
          result,
          error: result.error,
        });

        notifications.show({
          title: 'Failed to impersonate user',
          message: `Error: ${errorDetails}`,
          color: 'red',
          autoClose: false,
        });
      }
    } catch (error) {
      console.error('User impersonation exception:', error);

      const errorMessage =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : `Unexpected error: ${JSON.stringify(error)}`;

      notifications.show({
        title: 'User Impersonation Failed',
        message: errorMessage,
        color: 'red',
        autoClose: false,
      });
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (value: string, row: User) => (
        <Group gap="sm">
          <Avatar radius="xl" size="sm">
            {value
              .split(' ')
              .map((n: string) => n[0])
              .join('')}
          </Avatar>
          <div>
            <Text fw={500} size="sm">
              {value}
            </Text>
            <Text c="dimmed" size="xs">
              {row.email}
            </Text>
          </div>
        </Group>
      ),
      sortable: true,
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => (
        <Badge color={ROLE_COLORS[value as keyof typeof ROLE_COLORS] || 'blue'} variant="light">
          {value}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: 'banned',
      label: 'Status',
      render: (value: boolean) => (
        <Badge color={value ? 'red' : 'green'} variant="dot">
          {value ? 'Banned' : 'Active'}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: 'organizations',
      label: 'Organizations',
      render: (value: User['organizations']) => (
        <Text size="sm">{value && value.length > 0 ? `${value.length} org(s)` : 'None'}</Text>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => {
        const date = new Date(value);
        return <Text size="sm">{date.toLocaleDateString()}</Text>;
      },
      sortable: true,
    },
  ];

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <PageHeader
          actions={{
            primary: {
              icon: <IconUserPlus size={16} />,
              label: 'Create User',
              onClick: openCreateModal,
            },
            secondary: [
              {
                label: 'Export Users',
                onClick: () => console.log('Export users'),
              },
            ],
          }}
          description="Manage user accounts, roles, and permissions"
          onRefresh={refetch}
          title="User Management"
        />

        <SimpleGrid cols={{ base: 1, lg: 4, sm: 2 }} spacing="lg">
          {statsData.map((stat) => (
            <StatsCard key={stat.title} {...stat} loading={loading} />
          ))}
        </SimpleGrid>

        <DataTable
          actions={{
            custom: [
              {
                icon: <IconShield size={14} />,
                label: 'Impersonate',
                onClick: (row) => handleImpersonateUser(row.id),
              },
              {
                icon: <IconBan size={14} />,
                label: 'Ban/Unban',
                onClick: (row) => handleBanUser(row.id, !row.banned),
                color: 'orange',
              },
              {
                icon: <IconActivity size={14} />,
                label: 'View Sessions',
                onClick: (row) => console.log('View sessions', row),
              },
            ],
            onDelete: (row) => handleDeleteUser(row.id),
            onEdit: (row) => console.log('Edit user', row),
            onView: (row) => window.open(`/users/${row.id}`, '_blank'),
          }}
          bulkActions={[
            {
              color: 'red',
              label: 'Ban Selected',
              onClick: (rows) => console.log('Ban users', rows),
            },
            {
              label: 'Export Selected',
              onClick: (rows) => console.log('Export users', rows),
            },
          ]}
          columns={columns}
          loading={loading}
          pagination={{
            pageSize: 25,
            total: users.length,
          }}
          searchPlaceholder="Search users..."
          data={users}
          emptyState={{
            description: 'Create your first user to get started',
            icon: IconUsers,
            title: 'No users found',
          }}
          selectable
        />
      </Stack>

      {/* Create User Modal */}
      <Modal opened={createModalOpened} onClose={closeCreateModal} title="Create New User">
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="Enter user name"
            value={newUser.name}
            onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <TextInput
            label="Email"
            placeholder="Enter email address"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <TextInput
            label="Password"
            placeholder="Enter password (optional)"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
          />
          <Select
            label="Role"
            placeholder="Select user role"
            value={newUser.role}
            onChange={(value) => setNewUser((prev) => ({ ...prev, role: value || 'user' }))}
            data={USER_ROLES}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={!newUser.name || !newUser.email}>
              Create User
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
