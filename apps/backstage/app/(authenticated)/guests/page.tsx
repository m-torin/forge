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
  Badge,
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

import { PageHeader } from '../components/page-header';
import { StatsCard } from '../components/stats-card';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    banned: number;
    admins: number;
  };
  companies: {
    total: number;
    totalMembers: number;
    pendingInvitations: number;
    averageMembers: number;
  };
  apiKeys: {
    total: number;
    active: number;
    expired: number;
    totalRequests: number;
  };
}

export default function GuestsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    users: { total: 0, active: 0, banned: 0, admins: 0 },
    companies: { total: 0, totalMembers: 0, pendingInvitations: 0, averageMembers: 0 },
    apiKeys: { total: 0, active: 0, expired: 0, totalRequests: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      const [usersRes, companiesRes, apiKeysRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/organizations'),
        fetch('/api/admin/api-keys'),
      ]);

      const usersData = usersRes.ok ? await usersRes.json() : { users: [] };
      const companiesData = companiesRes.ok ? await companiesRes.json() : { organizations: [] };
      const apiKeysData = apiKeysRes.ok ? await apiKeysRes.json() : { apiKeys: [] };

      const users = usersData.users || [];
      const companies = companiesData.organizations || [];
      const apiKeys = apiKeysData.apiKeys || [];

      setStats({
        users: {
          total: users.length,
          active: users.filter((u: any) => !u.banned).length,
          banned: users.filter((u: any) => u.banned).length,
          admins: users.filter((u: any) => u.role === 'admin' || u.role === 'super-admin').length,
        },
        companies: {
          total: companies.length,
          totalMembers: companies.reduce((acc: number, org: any) => acc + (org._count?.members || 0), 0),
          pendingInvitations: companies.reduce((acc: number, org: any) => acc + (org._count?.invitations || 0), 0),
          averageMembers: companies.length > 0 
            ? Math.round(companies.reduce((acc: number, org: any) => acc + (org._count?.members || 0), 0) / companies.length)
            : 0,
        },
        apiKeys: {
          total: apiKeys.length,
          active: apiKeys.filter((k: any) => k.enabled && (!k.expiresAt || new Date(k.expiresAt) > new Date())).length,
          expired: apiKeys.filter((k: any) => k.expiresAt && new Date(k.expiresAt) < new Date()).length,
          totalRequests: apiKeys.reduce((acc: number, key: any) => acc + (key.requestCount || 0), 0),
        },
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const managementSections = [
    {
      title: 'People Management',
      description: 'Manage users, roles, permissions, and authentication',
      icon: IconUsers,
      color: 'blue',
      path: '/guests/people',
      stats: [
        { label: 'Total Users', value: stats.users.total.toString() },
        { label: 'Active Users', value: stats.users.active.toString() },
        { label: 'Admin Users', value: stats.users.admins.toString() },
      ],
      actions: [
        { icon: IconPlus, label: 'Create User', onClick: () => router.push('/guests/people/new') },
        { icon: IconShield, label: 'Manage Roles', onClick: () => router.push('/guests/people') },
      ],
    },
    {
      title: 'Companies Management',
      description: 'Manage organizations, members, and invitations',
      icon: IconBuilding,
      color: 'green',
      path: '/guests/organizations',
      stats: [
        { label: 'Organizations', value: stats.companies.total.toString() },
        { label: 'Total Members', value: stats.companies.totalMembers.toString() },
        { label: 'Pending Invites', value: stats.companies.pendingInvitations.toString() },
      ],
      actions: [
        { icon: IconPlus, label: 'Create Organization', onClick: () => router.push('/guests/organizations/new') },
        { icon: IconUsers, label: 'Manage Members', onClick: () => router.push('/guests/organizations') },
      ],
    },
    {
      title: 'API Keys Management',
      description: 'Manage API keys, permissions, and service authentication',
      icon: IconKey,
      color: 'orange',
      path: '/guests/api-keys',
      stats: [
        { label: 'Total Keys', value: stats.apiKeys.total.toString() },
        { label: 'Active Keys', value: stats.apiKeys.active.toString() },
        { label: 'Total Requests', value: stats.apiKeys.totalRequests.toLocaleString() },
      ],
      actions: [
        { icon: IconPlus, label: 'Create API Key', onClick: () => router.push('/guests/api-keys/new') },
        { icon: IconActivity, label: 'View Usage', onClick: () => router.push('/guests/api-keys') },
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
          onRefresh={loadDashboardStats}
        />

        {/* Overall Statistics */}
        <SimpleGrid cols={{ base: 1, lg: 4, sm: 2 }} spacing="lg">
          {overallStats.map((stat) => (
            <StatsCard
              key={stat.title}
              {...stat}
              loading={loading}
            />
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
                    onClick={() => router.push(section.path)}
                  >
                    <IconChevronRight size={16} />
                  </ActionIcon>
                </Group>

                {/* Quick Stats */}
                <SimpleGrid cols={3} spacing="xs">
                  {section.stats.map((stat, index) => (
                    <div key={index} style={{ textAlign: 'center' }}>
                      <Text fw={700} size="lg">
                        {stat.value}
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
                        onClick={action.onClick}
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
                    onClick={() => router.push(section.path)}
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
