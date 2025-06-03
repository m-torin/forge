'use client';

import { Badge, Card, Container, Grid, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import {
  IconCalendar,
  IconFileText,
  IconPhoto,
  IconSeo,
  IconSettings,
  IconTemplate,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect } from 'react';

import { useAnalytics, useObservability, useUIAnalytics } from '@repo/observability';

const cmsModules = [
  {
    color: 'blue',
    description: 'Rich text editor for creating and editing content',
    href: '/cms/editor',
    icon: IconFileText,
    stats: { articles: 342, drafts: 28 },
    title: 'Content Editor',
  },
  {
    color: 'green',
    description: 'Manage images, videos, and other media assets',
    href: '/cms/media',
    icon: IconPhoto,
    stats: { videos: 47, images: 1205 },
    title: 'Media Library',
  },
  {
    color: 'violet',
    description: 'Visual page builder with drag-and-drop components',
    href: '/cms/pages',
    icon: IconTemplate,
    stats: { pages: 89, templates: 12 },
    title: 'Page Builder',
  },
  {
    color: 'orange',
    description: 'Search engine optimization and metadata management',
    href: '/cms/seo',
    icon: IconSeo,
    stats: { keywords: 234, optimized: '91%' },
    title: 'SEO Tools',
  },
  {
    color: 'cyan',
    description: 'Content scheduling and publication workflows',
    href: '/cms/publishing',
    icon: IconCalendar,
    stats: { published: 278, scheduled: 15 },
    title: 'Publishing',
  },
  {
    color: 'indigo',
    description: 'Multi-language content management and translation',
    href: '/cms/multilingual',
    icon: IconWorld,
    stats: { languages: 8, translated: '76%' },
    title: 'Multilingual',
  },
  {
    color: 'pink',
    description: 'Content team roles and permission management',
    href: '/cms/roles',
    icon: IconUsers,
    stats: { editors: 12, reviewers: 5 },
    title: 'User Roles',
  },
  {
    color: 'gray',
    description: 'Configure content types, fields, and workflows',
    href: '/cms/configuration',
    icon: IconSettings,
    stats: { types: 15, fields: 67 },
    title: 'CMS Configuration',
  },
];

export default function CMSOverviewPage() {
  const { trackPage } = useAnalytics();
  const { trackView } = useUIAnalytics();
  const { trackEvent } = useObservability();

  useEffect(() => {
    trackPage('cms_overview');
    trackView('cms_dashboard');
    trackEvent({
      action: 'view',
      category: 'cms',
      label: 'overview_page',
    });
  }, [trackPage, trackView, trackEvent]);

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>Content Management System</Title>
          <Text c="dimmed" mt="md" size="lg">
            Create, manage, and publish content across multiple channels
          </Text>
        </div>

        <Grid gutter="lg">
          {cmsModules.map((module) => (
            <Grid.Col key={module.href} span={{ base: 12, lg: 4, sm: 6 }}>
              <Card
                href={module.href as any}
                component={Link}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
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
                  textDecoration: 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                padding="lg"
                radius="md"
              >
                <Stack style={{ height: '100%' }} gap="md">
                  <Group justify="space-between">
                    <ThemeIcon color={module.color} size="xl" variant="light">
                      <module.icon size={28} />
                    </ThemeIcon>
                    {Object.entries(module.stats).map(([key, value]) => (
                      <Badge key={key} color={module.color} size="sm" variant="filled">
                        {value} {key}
                      </Badge>
                    ))}
                  </Group>

                  <div>
                    <Title order={3} mb="xs">
                      {module.title}
                    </Title>
                    <Text c="dimmed" size="sm">
                      {module.description}
                    </Text>
                  </div>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
}
