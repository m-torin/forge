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
  Alert,
} from '@mantine/core';
import Link from 'next/link';
import {
  IconActivity,
  IconBan,
  IconBuilding,
  IconKey,
  IconShield,
  IconTrash,
  IconUserCheck,
  IconUserPlus,
  IconUsers,
  IconExclamationTriangle,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';

import { DataTable } from '../../components/data-table';
import { PageHeader } from '../../components/page-header';
import { StatsCard } from '../../components/stats-card';

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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [banModalOpened, { open: openBanModal, close: closeBanModal }] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  const statsData = [
    {
      title: 'Total Users',
      value: users.length.toString(),
      color: 'blue',
      icon: IconUsers,
      change: { value: 12 },
    },
    {
      title: 'Active Users',
      value: users.filter(u => !u.banned).length.toString(),
      color: 'green',
      icon: IconUserCheck,
      progress: { 
        label: 'of total users', 
        value: users.length > 0 ? Math.round((users.filter(u => !u.banned).length / users.length) * 100) : 0 
      },
    },
    {
      title: 'Banned Users',
      value: users.filter(u => u.banned).length.toString(),
      color: 'red',
      icon: IconBan,
    },
    {
      title: 'Admin Users',
      value: users.filter(u => u.role === 'admin' || u.role === 'super-admin').length.toString(),
      color: 'orange',
      icon: IconShield,
    },
  ];

  useEffect(() => {
    loadUsers();
    
    // Listen for refresh events from modals
    const handleRefresh = () => loadUsers();
    window.addEventListener('refreshPeople', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshPeople', handleRefresh);
    };
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to load users',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load users',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'User created successfully',
          color: 'green',
        });
        closeCreateModal();
        setNewUser({ name: '', email: '', password: '', role: 'user' });
        await loadUsers();
      } else {
        const error = await response.json();
        notifications.show({
          title: 'Error',
          message: error.message || 'Failed to create user',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create user',
        color: 'red',
      });
    }
  };

  const handleBanUser = async (userId: string, ban: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${ban ? 'ban' : 'unban'}`, {
        method: 'POST',
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: `User ${ban ? 'banned' : 'unbanned'} successfully`,
          color: 'green',
        });
        await loadUsers();
      } else {
        notifications.show({
          title: 'Error',
          message: `Failed to ${ban ? 'ban' : 'unban'} user`,
          color: 'red',
        });
      }
    } catch (error) {
      console.error(`Failed to ${ban ? 'ban' : 'unban'} user:`, error);
      notifications.show({
        title: 'Error',
        message: `Failed to ${ban ? 'ban' : 'unban'} user`,
        color: 'red',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'User deleted successfully',
          color: 'green',
        });
        await loadUsers();
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete user',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete user',
        color: 'red',
      });
    }
  };

  const handleImpersonateUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/impersonate`, {
        method: 'POST',
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'User impersonation started',
          color: 'green',
        });
        // Redirect to main app or refresh page
        window.location.href = '/';
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to impersonate user',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Failed to impersonate user:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to impersonate user',
        color: 'red',
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
        <Badge
          color={
            value === 'admin' || value === 'super-admin' 
              ? 'red' 
              : value === 'moderator' 
              ? 'orange' 
              : 'blue'
          }
          variant="light"
        >
          {value}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: 'banned',
      label: 'Status',
      render: (value: boolean) => (
        <Badge
          color={value ? 'red' : 'green'}
          variant="dot"
        >
          {value ? 'Banned' : 'Active'}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: 'organizations',
      label: 'Organizations',
      render: (value: User['organizations']) => (
        <Text size="sm">
          {value && value.length > 0 ? `${value.length} org(s)` : 'None'}
        </Text>
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
          onRefresh={loadUsers}
          title="User Management"
        />

        <SimpleGrid cols={{ base: 1, lg: 4, sm: 2 }} spacing="lg">
          {statsData.map((stat) => (
            <StatsCard
              key={stat.title}
              {...stat}
              loading={loading}
            />
          ))}
        </SimpleGrid>

        <DataTable
          actions={{
            custom: [
              {
                icon: <IconShield size={14} />,
                label: 'Impersonate',
                onClick: (row) => handleImpersonateUser(row.id),
                condition: (row) => !row.banned,
              },
              {
                icon: <IconBan size={14} />,
                label: (row) => (row.banned ? 'Unban' : 'Ban'),
                onClick: (row) => handleBanUser(row.id, !row.banned),
                color: (row) => (row.banned ? 'green' : 'red'),
              },
              {
                icon: <IconActivity size={14} />,
                label: 'View Sessions',
                onClick: (row) => console.log('View sessions', row),
              },
            ],
            onDelete: (row) => handleDeleteUser(row.id),
            onEdit: (row) => console.log('Edit user', row),
            onView: (row) => window.open(`/guests/people/${row.id}`, '_blank'),
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
            onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <TextInput
            label="Email"
            placeholder="Enter email address"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
            required
          />
          <TextInput
            label="Password"
            placeholder="Enter password (optional)"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
          />
          <Select
            label="Role"
            placeholder="Select user role"
            value={newUser.role}
            onChange={(value) => setNewUser(prev => ({ ...prev, role: value || 'user' }))}
            data={[
              { value: 'user', label: 'User' },
              { value: 'moderator', label: 'Moderator' },
              { value: 'admin', label: 'Admin' },
              { value: 'super-admin', label: 'Super Admin' },
            ]}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser}
              disabled={!newUser.name || !newUser.email}
            >
              Create User
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}