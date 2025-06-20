'use client';

import {
  Container,
  Stack,
  SimpleGrid,
  Card,
  Text,
  Group,
  ThemeIcon,
  Button,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconUsers,
  IconBuilding,
  IconKey,
  IconChevronRight,
  IconPlus,
  IconSettings,
  IconActivity,
  IconShield,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getUsersAction, getOrganizationsAction, getApiKeysAction } from './actions';

import { PageHeader } from '@/components/pim3/page-header';
import { StatsCard } from '@/components/pim3/stats-card';
import { DashboardSkeleton } from '@/components/pim3/loading';

import type { DashboardStats } from './types';

// Custom hook for dashboard data
const useDashboardData = () => {
  const [state, setState] = useState({
    stats: {
      users: { total: 0, active: 0, banned: 0, admins: 0 },
      companies: { total: 0, totalMembers: 0, pendingInvitations: 0, averageMembers: 0 },
      apiKeys: { total: 0, active: 0, expired: 0, totalRequests: 0 },
    } as DashboardStats,
    loading: true,
  });

  const calculateStats = (users: any[], companies: any[], apiKeys: any[]) => ({
    users: {
      total: users.length,
      active: users.filter((u) => !u.banned).length,
      banned: users.filter((u) => u.banned).length,
      admins: users.filter((u) => ['admin', 'super-admin'].includes(u.role)).length,
    },
    companies: {
      total: companies.length,
      totalMembers: companies.reduce((acc, org) => acc + (org._count?.members || 0), 0),
      pendingInvitations: companies.reduce((acc, org) => acc + (org._count?.invitations || 0), 0),
      averageMembers: companies.length
        ? Math.round(
            companies.reduce((acc, org) => acc + (org._count?.members || 0), 0) / companies.length,
          )
        : 0,
    },
    apiKeys: {
      total: apiKeys.length,
      active: apiKeys.filter(
        (k) => k.enabled && (!k.expiresAt || new Date(k.expiresAt) > new Date()),
      ).length,
      expired: apiKeys.filter((k) => k.expiresAt && new Date(k.expiresAt) < new Date()).length,
      totalRequests: apiKeys.reduce((acc, key) => acc + (key.requestCount || 0), 0),
    },
  });

  const loadData = async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const [usersRes, companiesRes, apiKeysRes] = await Promise.all([
        getUsersAction(),
        getOrganizationsAction(),
        getApiKeysAction(),
      ]);

      const users = usersRes.success ? usersRes.data || [] : [];
      const companies = companiesRes.success ? companiesRes.data || [] : [];
      const apiKeys = apiKeysRes.success ? apiKeysRes.data || [] : [];

      setState({ stats: calculateStats(users, companies, apiKeys), loading: false });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { ...state, refetch: loadData };
};

export default function GuestsPage() {
  const router = useRouter();
  const { stats, loading, refetch } = useDashboardData();

  const managementSections = [
    {
      title: 'People Management',
      description: 'Manage users, roles, permissions, and authentication',
      icon: IconUsers,
      color: 'blue',
      path: '/guests/people',
      stats: [
        { label: 'Total Users', value: stats.users.total },
        { label: 'Active Users', value: stats.users.active },
        { label: 'Admin Users', value: stats.users.admins },
      ],
      actions: [
        { icon: IconPlus, label: 'Create User', path: '/guests/people/new' },
        { icon: IconShield, label: 'Manage Roles', path: '/guests/people' },
      ],
    },
    {
      title: 'Companies Management',
      description: 'Manage organizations, members, and invitations',
      icon: IconBuilding,
      color: 'green',
      path: '/guests/organizations',
      stats: [
        { label: 'Organizations', value: stats.companies.total },
        { label: 'Total Members', value: stats.companies.totalMembers },
        { label: 'Pending Invites', value: stats.companies.pendingInvitations },
      ],
      actions: [
        { icon: IconPlus, label: 'Create Organization', path: '/guests/organizations/new' },
        { icon: IconUsers, label: 'Manage Members', path: '/guests/organizations' },
      ],
    },
    {
      title: 'API Keys Management',
      description: 'Manage API keys, permissions, and service authentication',
      icon: IconKey,
      color: 'orange',
      path: '/guests/api-keys',
      stats: [
        { label: 'Total Keys', value: stats.apiKeys.total },
        { label: 'Active Keys', value: stats.apiKeys.active },
        { label: 'Total Requests', value: stats.apiKeys.totalRequests },
      ],
      actions: [
        { icon: IconPlus, label: 'Create API Key', path: '/guests/api-keys/new' },
        { icon: IconActivity, label: 'View Usage', path: '/guests/api-keys' },
      ],
    },
  ];

  const overallStats = [
    {
      title: 'Total Users',
      value: stats.users.total.toString(),
      color: 'blue',
      icon: IconUsers,
      change: { value: 12 },
    },
    {
      title: 'Active Organizations',
      value: stats.companies.total.toString(),
      color: 'green',
      icon: IconBuilding,
      change: { value: 8 },
    },
    {
      title: 'API Keys',
      value: stats.apiKeys.total.toString(),
      color: 'orange',
      icon: IconKey,
      change: { value: 5 },
    },
    {
      title: 'Total API Requests',
      value: stats.apiKeys.totalRequests.toLocaleString(),
      color: 'violet',
      icon: IconActivity,
    },
  ];

  if (loading) {
    return (
      <Container py="xl" size="xl">
        <DashboardSkeleton />
      </Container>
    );
  }

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <PageHeader
          actions={{
            primary: {
              icon: <IconSettings size={16} />,
              label: 'System Settings',
              onClick: () => console.log('System settings'),
            },
          }}
          description="Comprehensive management dashboard for users, organizations, and API keys"
          title="System Management Dashboard"
          onRefresh={refetch}
        />

        {/* Overall Statistics */}
        <SimpleGrid cols={{ base: 1, lg: 4, sm: 2 }} spacing="lg">
          {overallStats.map((stat) => (
            <StatsCard key={stat.title} {...stat} loading={false} />
          ))}
        </SimpleGrid>

        {/* Management Sections */}
        <SimpleGrid cols={{ base: 1, lg: 3, md: 2 }} spacing="lg">
          {managementSections.map((section) => (
            <Card key={section.title} shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Group gap="sm">
                    <ThemeIcon color={section.color} size="lg" radius="md">
                      <section.icon size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={600} size="lg">
                        {section.title}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {section.description}
                      </Text>
                    </div>
                  </Group>
                  <ActionIcon
                    variant="light"
                    color={section.color}
                    onClick={() => router.push(section.path as any)}
                  >
                    <IconChevronRight size={16} />
                  </ActionIcon>
                </Group>

                {/* Quick Stats */}
                <SimpleGrid cols={3} spacing="xs">
                  {section.stats.map((stat, index) => (
                    <div key={index} style={{ textAlign: 'center' }}>
                      <Text fw={700} size="lg">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {stat.label}
                      </Text>
                    </div>
                  ))}
                </SimpleGrid>

                {/* Quick Actions */}
                <Group gap="xs">
                  {section.actions.map((action, index) => (
                    <Tooltip key={index} label={action.label}>
                      <ActionIcon
                        variant="light"
                        color={section.color}
                        onClick={() => router.push(action.path as any)}
                        size="sm"
                      >
                        <action.icon size={14} />
                      </ActionIcon>
                    </Tooltip>
                  ))}
                  <Button
                    variant="light"
                    color={section.color}
                    size="xs"
                    rightSection={<IconChevronRight size={14} />}
                    onClick={() => router.push(section.path as any)}
                    style={{ marginLeft: 'auto' }}
                  >
                    Manage
                  </Button>
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
