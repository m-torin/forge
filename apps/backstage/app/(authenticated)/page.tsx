'use client';

import { Badge, Card, Container, Grid, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import {
  IconChevronRight,
  IconFileText,
  IconPackage,
  IconRocket,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';
import { useEffect } from 'react';

import { useAnalytics, useUIAnalytics } from '@repo/observability';

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

export default function HomePage() {
  const { trackPage } = useAnalytics();
  const { trackView } = useUIAnalytics();

  useEffect(() => {
    trackPage('backstage_dashboard');
    trackView('admin_dashboard');
  }, [trackPage, trackView]);

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="md">
            Backstage
          </Title>
          <Text c="dimmed" size="lg">
            Comprehensive management platform for workflows, products, content, and users
          </Text>
        </div>

        {/* Main Sections */}
        <div>
          <Title order={2} mb="lg">
            Core Systems
          </Title>
          <Grid gutter="lg">
            {sections.map((section) => (
              <Grid.Col key={section.href} span={{ base: 12, lg: 3, sm: 6 }}>
                <Card
                  onClick={() => (window.location.href = section.href)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                  shadow="sm"
                  withBorder
                  style={{
                    cursor: 'pointer',
                    height: '100%',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
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
                  onClick={() => (window.location.href = tool.href)}
                  shadow="sm"
                  withBorder
                  style={{ cursor: 'pointer' }}
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
