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
  Skeleton,
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
import { useEffect, useState, useCallback } from 'react';

import {
  listUsersAction as getUsersAction,
  listOrganizationsAction as getOrganizationsAction,
  listApiKeysAction as getApiKeysAction,
} from '@repo/auth/actions';
import { PageHeader } from '@/components/auth/PageHeader';
import { StatsCard } from '@/components/auth/StatsCard';

import type { DashboardStats } from '@/types/auth';

// Custom hook for dashboard data
const useDashboardData = () => {
  const [state, setState] = useState({
    stats: {
      users: { total: 0, active: 0, banned: 0, admins: 0 },
      organizations: { total: 0, totalMembers: 0, pendingInvitations: 0, averageMembers: 0 },
      apiKeys: { total: 0, active: 0, expired: 0, totalRequests: 0 },
    } as DashboardStats,
    loading: true,
  });

  const calculateStats = (users: any[], organizations: any[], apiKeys: any[]) => ({
    users: {
      total: users.length,
      active: users.filter((u) => !u.banned).length,
      banned: users.filter((u) => u.banned).length,
      admins: users.filter((u) => ['admin', 'super-admin'].includes(u.role)).length,
    },
    organizations: {
      total: organizations.length,
      totalMembers: organizations.reduce((acc, org) => acc + (org._count?.members || 0), 0),
      pendingInvitations: organizations.reduce(
        (acc, org) => acc + (org._count?.invitations || 0),
        0,
      ),
      averageMembers: organizations.length
        ? Math.round(
            organizations.reduce((acc, org) => acc + (org._count?.members || 0), 0) /
              organizations.length,
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

  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const [usersRes, orgsRes, apiKeysRes] = await Promise.all([
        getUsersAction(),
        getOrganizationsAction(),
        getApiKeysAction(),
      ]);

      const users = usersRes.success ? usersRes.data || [] : [];
      const organizations = orgsRes.success ? orgsRes.data || [] : [];
      const apiKeys = apiKeysRes.success ? apiKeysRes.data || [] : [];

      // Log any individual failures for debugging
      if (!usersRes.success) {
        console.error('Dashboard users loading failed:', usersRes);
      }
      if (!orgsRes.success) {
        console.error('Dashboard organizations loading failed:', orgsRes);
      }
      if (!apiKeysRes.success) {
        console.error('Dashboard API keys loading failed:', apiKeysRes);
      }

      setState({ stats: calculateStats(users, organizations, apiKeys), loading: false });
    } catch (error) {
      console.error('Dashboard loading exception:', error);

      const errorMessage =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : `Unexpected error: ${JSON.stringify(error)}`;

      console.error('Dashboard failed to load:', errorMessage);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { ...state, refetch: loadData };
};

export default function AuthDashboardPage() {
  const router = useRouter();
  const { stats, loading, refetch } = useDashboardData();

  const managementSections = [
    {
      title: 'User Management',
      description: 'Manage users, roles, permissions, and authentication',
      icon: IconUsers,
      color: 'blue',
      path: '/users',
      stats: [
        { label: 'Total Users', value: stats.users.total },
        { label: 'Active Users', value: stats.users.active },
        { label: 'Admin Users', value: stats.users.admins },
      ],
      actions: [
        { icon: IconPlus, label: 'Create User', path: '/users/new' },
        { icon: IconShield, label: 'Manage Roles', path: '/users' },
      ],
    },
    {
      title: 'Organization Management',
      description: 'Manage organizations, members, and invitations',
      icon: IconBuilding,
      color: 'green',
      path: '/organizations',
      stats: [
        { label: 'Organizations', value: stats.organizations.total },
        { label: 'Total Members', value: stats.organizations.totalMembers },
        { label: 'Pending Invites', value: stats.organizations.pendingInvitations },
      ],
      actions: [
        { icon: IconPlus, label: 'Create Organization', path: '/organizations/new' },
        { icon: IconUsers, label: 'Manage Members', path: '/organizations' },
      ],
    },
    {
      title: 'API Key Management',
      description: 'Manage API keys, permissions, and service authentication',
      icon: IconKey,
      color: 'orange',
      path: '/api-keys',
      stats: [
        { label: 'Total Keys', value: stats.apiKeys.total },
        { label: 'Active Keys', value: stats.apiKeys.active },
        { label: 'Total Requests', value: stats.apiKeys.totalRequests },
      ],
      actions: [
        { icon: IconPlus, label: 'Create API Key', path: '/api-keys/new' },
        { icon: IconActivity, label: 'View Usage', path: '/api-keys' },
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
      value: stats.organizations.total.toString(),
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
        <Stack gap="xl">
          <Skeleton height={60} />
          <SimpleGrid cols={{ base: 1, lg: 4, sm: 2 }} spacing="lg">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={120} radius="md" />
            ))}
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, lg: 3, md: 2 }} spacing="lg">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={200} radius="md" />
            ))}
          </SimpleGrid>
        </Stack>
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
              label: 'Settings',
              onClick: () => console.log('Settings'),
            },
          }}
          description="Comprehensive dashboard for user, organization, and API key management"
          title="Authentication Management"
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
