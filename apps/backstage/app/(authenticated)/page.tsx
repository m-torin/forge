'use client';

import {
  Badge,
  Card,
  Container,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconActivity,
  IconChevronRight,
  IconDatabase,
  IconFileText,
  IconPackage,
  IconRocket,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const sections = [
  {
    color: 'blue',
    description: 'Background job processing and workflow automation',
    features: ['Product Classification', 'Scheduled Jobs', 'Integrations', 'Monitoring'],
    href: '/workflows',
    icon: IconRocket,
    title: 'Workflows',
  },
  {
    color: 'green',
    description: 'Product Information Management and taxonomy',
    features: ['Product Catalog', 'Taxonomy Management', 'Data Validation', 'Classification'],
    href: '/pim',
    icon: IconPackage,
    title: 'PIM',
  },
  {
    color: 'violet',
    description: 'Content creation and management system',
    features: ['Content Editor', 'Media Library', 'Publishing', 'SEO Tools'],
    href: '/cms',
    icon: IconFileText,
    title: 'CMS',
  },
  {
    color: 'orange',
    description: 'User management and access control',
    features: ['User Management', 'Organizations', 'API Keys', 'Roles & Permissions'],
    href: '/guests',
    icon: IconUsers,
    title: 'Guests',
  },
];

const adminTools = [
  {
    description: 'Manage feature toggles and experimental functionality',
    href: '/feature-flags',
    title: 'Feature Flags',
  },
  {
    description: 'Configure system-wide settings and preferences',
    href: '/settings',
    title: 'System Settings',
  },
];

const statsData = [
  {
    change: '+12%',
    color: 'blue',
    icon: IconActivity,
    title: 'Active Workflows',
    value: '24',
  },
  {
    change: '+5%',
    color: 'green',
    icon: IconPackage,
    title: 'Total Products',
    value: '3,456',
  },
  {
    change: '+8%',
    color: 'violet',
    icon: IconUsers,
    title: 'Active Users',
    value: '892',
  },
  {
    change: '-2%',
    color: 'orange',
    icon: IconDatabase,
    title: 'API Calls Today',
    value: '12.5k',
  },
];

export default function HomePage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Page Viewed', { page: 'backstage_dashboard' });
    console.log('Track Event', {
      action: 'view',
      category: 'admin_dashboard',
      label: 'backstage_home',
    });

    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="md">
            Welcome back!
          </Title>
          <Text c="dimmed" size="lg">
            Here's what's happening with your platform today
          </Text>
        </div>

        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 1, lg: 4, sm: 2 }} spacing="lg">
          {statsData.map((stat) => (
            <Paper key={stat.title} shadow="xs" withBorder p="md" radius="md">
              {loading ? (
                <Stack gap="xs">
                  <Skeleton width={40} height={40} radius="md" />
                  <Skeleton width="60%" height={16} />
                  <Skeleton width="40%" height={24} />
                </Stack>
              ) : (
                <Stack gap="xs">
                  <ThemeIcon color={stat.color} radius="md" size="lg" variant="light">
                    <stat.icon size={24} />
                  </ThemeIcon>
                  <Text c="dimmed" fw={500} size="sm">
                    {stat.title}
                  </Text>
                  <Group align="flex-end" justify="space-between">
                    <Text fw={700} size="xl">
                      {stat.value}
                    </Text>
                    <Badge
                      color={stat.change.startsWith('+') ? 'green' : 'red'}
                      size="sm"
                      variant="light"
                    >
                      {stat.change}
                    </Badge>
                  </Group>
                </Stack>
              )}
            </Paper>
          ))}
        </SimpleGrid>

        {/* Main Sections */}
        <div>
          <Title order={2} mb="lg">
            Core Systems
          </Title>
          <Grid gutter="lg">
            {sections.map((section) => (
              <Grid.Col key={section.href} span={{ base: 12, lg: 3, sm: 6 }}>
                <Card
                  href={section.href as any}
                  component={Link}
                  shadow="sm"
                  withBorder
                  styles={{
                    root: {
                      '&:hover': {
                        boxShadow: 'var(--mantine-shadow-md)',
                        transform: 'translateY(-4px)',
                      },
                      height: '100%',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                    },
                  }}
                  padding="lg"
                  radius="md"
                >
                  <Stack style={{ height: '100%' }} gap="md">
                    <Group align="flex-start" justify="space-between">
                      <ThemeIcon color={section.color} size="xl" variant="light">
                        <section.icon size={28} />
                      </ThemeIcon>
                      <IconChevronRight color="var(--mantine-color-dimmed)" size={20} />
                    </Group>

                    <div>
                      <Title order={3} mb="xs">
                        {section.title}
                      </Title>
                      <Text c="dimmed" mb="md" size="sm">
                        {section.description}
                      </Text>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                      <Stack gap="xs">
                        {section.features.map((feature) => (
                          <Group key={feature} gap="xs">
                            <Badge color={section.color} size="sm" variant="dot">
                              {feature}
                            </Badge>
                          </Group>
                        ))}
                      </Stack>
                    </div>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </div>

        {/* Admin Tools */}
        <div>
          <Title order={2} mb="lg">
            Administration
          </Title>
          <Grid gutter="md">
            {adminTools.map((tool) => (
              <Grid.Col key={tool.href} span={{ base: 12, sm: 6 }}>
                <Card
                  href={tool.href as any}
                  component={Link}
                  shadow="sm"
                  withBorder
                  styles={{
                    root: {
                      '&:hover': {
                        boxShadow: 'var(--mantine-shadow-sm)',
                        transform: 'translateY(-2px)',
                      },
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                    },
                  }}
                  padding="md"
                  radius="md"
                >
                  <Group justify="space-between">
                    <div>
                      <Text fw={500} mb="xs" size="sm">
                        {tool.title}
                      </Text>
                      <Text c="dimmed" size="xs">
                        {tool.description}
                      </Text>
                    </div>
                    <ThemeIcon color="gray" size="sm" variant="light">
                      <IconSettings size={16} />
                    </ThemeIcon>
                  </Group>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </div>
      </Stack>
    </Container>
  );
}
