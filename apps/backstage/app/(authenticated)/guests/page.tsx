'use client';

import { Avatar, Badge, Container, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import {
  IconActivity,
  IconBuilding,
  IconKey,
  IconUserCheck,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { DataTable } from '../components/data-table';
import { PageHeader } from '../components/page-header';
import { StatsCard } from '../components/stats-card';

// Mock data for demo
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    createdAt: '2023-12-01T00:00:00',
    email: 'john.doe@example.com',
    lastActive: '2024-01-10T10:30:00',
    organization: 'Acme Corp',
    role: 'Admin',
    status: 'active',
  },
  {
    id: '2',
    name: 'Jane Smith',
    createdAt: '2023-12-15T00:00:00',
    email: 'jane.smith@example.com',
    lastActive: '2024-01-10T09:15:00',
    organization: 'Tech Solutions',
    role: 'Member',
    status: 'active',
  },
  {
    id: '3',
    name: 'Bob Wilson',
    createdAt: '2023-11-20T00:00:00',
    email: 'bob.wilson@example.com',
    lastActive: '2024-01-05T14:20:00',
    organization: 'Acme Corp',
    role: 'Viewer',
    status: 'inactive',
  },
  {
    id: '4',
    name: 'Alice Brown',
    createdAt: '2024-01-08T00:00:00',
    email: 'alice.brown@example.com',
    lastActive: null,
    organization: 'StartupXYZ',
    role: 'Admin',
    status: 'pending',
  },
];

const statsData = [
  {
    change: { value: 12 },
    color: 'blue',
    icon: IconUsers,
    title: 'Total Users',
    value: '892',
  },
  {
    color: 'green',
    icon: IconUserCheck,
    progress: { label: 'of total users', value: 85 },
    title: 'Active Users',
    value: '756',
  },
  {
    change: { value: 8 },
    color: 'violet',
    icon: IconUserPlus,
    title: 'New This Month',
    value: '124',
  },
  {
    change: { value: 3 },
    color: 'orange',
    icon: IconBuilding,
    title: 'Organizations',
    value: '43',
  },
];

export default function UsersPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (value: string, row: any) => (
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
      key: 'organization',
      label: 'Organization',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => (
        <Badge
          color={value === 'Admin' ? 'red' : value === 'Member' ? 'blue' : 'gray'}
          variant="light"
        >
          {value}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge
          color={value === 'active' ? 'green' : value === 'inactive' ? 'gray' : 'yellow'}
          variant="dot"
        >
          {value}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: 'lastActive',
      label: 'Last Active',
      render: (value: string) => {
        if (!value)
          return (
            <Text c="dimmed" size="sm">
              Never
            </Text>
          );
        const date = new Date(value);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return <Text size="sm">Just now</Text>;
        if (hours < 24) return <Text size="sm">{hours}h ago</Text>;
        const days = Math.floor(hours / 24);
        return <Text size="sm">{days}d ago</Text>;
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
              label: 'Invite User',
              onClick: () => console.log('Invite user'),
            },
            secondary: [
              {
                label: 'Export',
                onClick: () => console.log('Export users'),
              },
            ],
          }}
          description="Manage users, organizations, and access permissions"
          onRefresh={() => setLoading(true)}
          badge={{ color: 'blue', label: 'Beta' }}
          title="User Management"
        />

        <SimpleGrid cols={{ base: 1, lg: 4, sm: 2 }} spacing="lg">
          {statsData.map((stat) => (
            <StatsCard
              key={stat.title}
              {...stat}
              loading={loading}
              onClick={() => console.log(`View ${stat.title}`)}
            />
          ))}
        </SimpleGrid>

        <DataTable
          actions={{
            custom: [
              {
                icon: <IconKey size={14} />,
                label: 'Reset Password',
                onClick: (row) => console.log('Reset password', row),
              },
              {
                icon: <IconActivity size={14} />,
                label: 'View Activity',
                onClick: (row) => console.log('View activity', row),
              },
            ],
            onDelete: (row) => console.log('Delete user', row),
            onEdit: (row) => console.log('Edit user', row),
            onView: (row) => console.log('View user', row),
          }}
          bulkActions={[
            {
              color: 'red',
              label: 'Delete',
              onClick: (rows) => console.log('Delete users', rows),
            },
            {
              label: 'Export',
              onClick: (rows) => console.log('Export users', rows),
            },
          ]}
          columns={columns}
          loading={loading}
          pagination={{
            pageSize: 10,
            total: mockUsers.length,
          }}
          searchPlaceholder="Search users..."
          data={mockUsers}
          emptyState={{
            description: 'Invite your first user to get started',
            icon: IconUsers,
            title: 'No users found',
          }}
          selectable
        />
      </Stack>
    </Container>
  );
}
