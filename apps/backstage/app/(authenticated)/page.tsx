'use client';

import { 
  Badge, 
  Card, 
  Container, 
  Grid, 
  Group, 
  Stack, 
  Text, 
  ThemeIcon, 
  Title,
  Progress,
  Paper,
  SimpleGrid,
  Skeleton
} from '@mantine/core';
import {
  IconChevronRight,
  IconFileText,
  IconPackage,
  IconRocket,
  IconSettings,
  IconUsers,
  IconActivity,
  IconDatabase,
  IconBrandStripe,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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
    title: 'Active Workflows', 
    value: '24', 
    change: '+12%', 
    icon: IconActivity,
    color: 'blue'
  },
  { 
    title: 'Total Products', 
    value: '3,456', 
    change: '+5%', 
    icon: IconPackage,
    color: 'green'
  },
  { 
    title: 'Active Users', 
    value: '892', 
    change: '+8%', 
    icon: IconUsers,
    color: 'violet'
  },
  { 
    title: 'API Calls Today', 
    value: '12.5k', 
    change: '-2%', 
    icon: IconDatabase,
    color: 'orange'
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
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {statsData.map((stat) => (
            <Paper 
              key={stat.title} 
              shadow="xs" 
              p="md" 
              radius="md"
              withBorder
            >
              {loading ? (
                <Stack gap="xs">
                  <Skeleton height={40} width={40} radius="md" />
                  <Skeleton height={16} width="60%" />
                  <Skeleton height={24} width="40%" />
                </Stack>
              ) : (
                <Stack gap="xs">
                  <ThemeIcon size="lg" radius="md" variant="light" color={stat.color}>
                    <stat.icon size={24} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed" fw={500}>
                    {stat.title}
                  </Text>
                  <Group justify="space-between" align="flex-end">
                    <Text size="xl" fw={700}>
                      {stat.value}
                    </Text>
                    <Badge 
                      size="sm" 
                      variant="light"
                      color={stat.change.startsWith('+') ? 'green' : 'red'}
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
                  component={Link}
                  href={section.href}
                  shadow="sm"
                  withBorder
                  padding="lg"
                  radius="md"
                  styles={{
                    root: {
                      height: '100%',
                      transition: 'all 0.2s ease',
                      textDecoration: 'none',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 'var(--mantine-shadow-md)',
                      },
                    },
                  }}
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
                  component={Link}
                  href={tool.href}
                  shadow="sm"
                  withBorder
                  padding="md"
                  radius="md"
                  styles={{
                    root: {
                      transition: 'all 0.2s ease',
                      textDecoration: 'none',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 'var(--mantine-shadow-sm)',
                      },
                    },
                  }}
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
