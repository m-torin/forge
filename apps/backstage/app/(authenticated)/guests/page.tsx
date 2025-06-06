'use client';

import { Container, SimpleGrid, Stack, Avatar, Group, Text, Badge } from '@mantine/core';
import { 
  IconUsers, 
  IconUserPlus, 
  IconUserCheck,
  IconUserX,
  IconBuilding,
  IconKey,
  IconActivity,
  IconCalendar
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { PageHeader } from '../components/page-header';
import { StatsCard } from '../components/stats-card';
import { DataTable } from '../components/data-table';

// Mock data for demo
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    organization: 'Acme Corp',
    role: 'Admin',
    status: 'active',
    lastActive: '2024-01-10T10:30:00',
    createdAt: '2023-12-01T00:00:00',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    organization: 'Tech Solutions',
    role: 'Member',
    status: 'active',
    lastActive: '2024-01-10T09:15:00',
    createdAt: '2023-12-15T00:00:00',
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob.wilson@example.com',
    organization: 'Acme Corp',
    role: 'Viewer',
    status: 'inactive',
    lastActive: '2024-01-05T14:20:00',
    createdAt: '2023-11-20T00:00:00',
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    organization: 'StartupXYZ',
    role: 'Admin',
    status: 'pending',
    lastActive: null,
    createdAt: '2024-01-08T00:00:00',
  },
];

const statsData = [
  {
    title: 'Total Users',
    value: '892',
    icon: IconUsers,
    color: 'blue',
    change: { value: 12 },
  },
  {
    title: 'Active Users',
    value: '756',
    icon: IconUserCheck,
    color: 'green',
    progress: { value: 85, label: 'of total users' },
  },
  {
    title: 'New This Month',
    value: '124',
    icon: IconUserPlus,
    color: 'violet',
    change: { value: 8 },
  },
  {
    title: 'Organizations',
    value: '43',
    icon: IconBuilding,
    color: 'orange',
    change: { value: 3 },
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
      sortable: true,
      render: (value: string, row: any) => (
        <Group gap="sm">
          <Avatar size="sm" radius="xl">
            {value.split(' ').map((n: string) => n[0]).join('')}
          </Avatar>
          <div>
            <Text size="sm" fw={500}>{value}</Text>
            <Text size="xs" c="dimmed">{row.email}</Text>
          </div>
        </Group>
      ),
    },
    {
      key: 'organization',
      label: 'Organization',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value: string) => (
        <Badge variant="light" color={value === 'Admin' ? 'red' : value === 'Member' ? 'blue' : 'gray'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <Badge
          variant="dot"
          color={value === 'active' ? 'green' : value === 'inactive' ? 'gray' : 'yellow'}
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'lastActive',
      label: 'Last Active',
      sortable: true,
      render: (value: string) => {
        if (!value) return <Text size="sm" c="dimmed">Never</Text>;
        const date = new Date(value);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return <Text size="sm">Just now</Text>;
        if (hours < 24) return <Text size="sm">{hours}h ago</Text>;
        const days = Math.floor(hours / 24);
        return <Text size="sm">{days}d ago</Text>;
      },
    },
  ];

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <PageHeader
          title="User Management"
          description="Manage users, organizations, and access permissions"
          badge={{ label: 'Beta', color: 'blue' }}
          actions={{
            primary: {
              label: 'Invite User',
              icon: <IconUserPlus size={16} />,
              onClick: () => console.log('Invite user'),
            },
            secondary: [
              {
                label: 'Export',
                onClick: () => console.log('Export users'),
              },
            ],
          }}
          onRefresh={() => setLoading(true)}
        />

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
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
          data={mockUsers}
          columns={columns}
          loading={loading}
          selectable
          searchPlaceholder="Search users..."
          emptyState={{
            title: 'No users found',
            description: 'Invite your first user to get started',
            icon: IconUsers,
          }}
          actions={{
            onView: (row) => console.log('View user', row),
            onEdit: (row) => console.log('Edit user', row),
            onDelete: (row) => console.log('Delete user', row),
            custom: [
              {
                label: 'Reset Password',
                icon: <IconKey size={14} />,
                onClick: (row) => console.log('Reset password', row),
              },
              {
                label: 'View Activity',
                icon: <IconActivity size={14} />,
                onClick: (row) => console.log('View activity', row),
              },
            ],
          }}
          bulkActions={[
            {
              label: 'Delete',
              color: 'red',
              onClick: (rows) => console.log('Delete users', rows),
            },
            {
              label: 'Export',
              onClick: (rows) => console.log('Export users', rows),
            },
          ]}
          pagination={{
            total: mockUsers.length,
            pageSize: 10,
          }}
        />
      </Stack>
    </Container>
  );
}
