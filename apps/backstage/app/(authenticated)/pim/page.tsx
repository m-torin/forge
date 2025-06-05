'use client';

import { Badge, Card, Container, Grid, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import {
  IconChartBar,
  IconDatabase,
  IconFileCheck,
  IconPackage,
  IconSettings,
  IconTags,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { flag, flags } from '@repo/analytics/client';
import { useAnalytics, useObservability, useUIAnalytics } from '@repo/observability';

const pimModules = [
  {
    color: 'blue',
    description: 'Manage product information, attributes, and relationships',
    href: '/pim/catalog',
    icon: IconPackage,
    stats: { products: 1247, variants: 3892 },
    title: 'Product Catalog',
  },
  {
    color: 'green',
    description: 'Create and manage product categories and hierarchies',
    href: '/pim/taxonomy',
    icon: IconTags,
    stats: { categories: 156, levels: 4 },
    title: 'Taxonomy Management',
  },
  {
    color: 'orange',
    description: 'Validate product data quality and completeness',
    href: '/pim/validation',
    icon: IconFileCheck,
    stats: { validated: '87%', errors: 23 },
    title: 'Data Validation',
  },
  {
    color: 'violet',
    description: 'AI-powered automatic product classification',
    href: '/pim/classification',
    icon: IconChartBar,
    stats: { classified: '94%', pending: 156 },
    title: 'Classification Engine',
  },
  {
    color: 'cyan',
    description: 'Manage product data feeds and import sources',
    href: '/pim/sources',
    icon: IconDatabase,
    stats: { active: 8, sources: 12 },
    title: 'Data Sources',
  },
  {
    color: 'gray',
    description: 'Configure PIM settings, attributes, and workflows',
    href: '/pim/configuration',
    icon: IconSettings,
    stats: { attributes: 89, workflows: 5 },
    title: 'PIM Configuration',
  },
];

export default function PIMOverviewPage() {
  const { trackPage } = useAnalytics();
  const { trackView } = useUIAnalytics();
  const { trackEvent } = useObservability();

  // Feature flags
  const [pimEnabled, setPimEnabled] = useState(false);\n\n  useEffect(() => {\n    flag.evaluate('workflows.product-classification', false).then(result => {\n      setPimEnabled(result.value);\n    });\n  }, []);

  useEffect(() => {
    trackPage('pim_overview');
    trackView('pim_dashboard');
    trackEvent({
      action: 'view',
      category: 'pim',
      label: 'overview_page',
      metadata: { pimEnabled },
    });
  }, [trackPage, trackView, trackEvent, pimEnabled]);

  if (!pimEnabled) {
    return (
      <Container py="xl" size="xl">
        <Stack align="center" gap="xl">
          <Title order={1}>PIM System</Title>
          <Text c="dimmed" ta="center">
            Product Information Management is currently disabled.
          </Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>Product Information Management</Title>
          <Text c="dimmed" mt="md" size="lg">
            Comprehensive product data management and classification system
          </Text>
        </div>

        <Grid gutter="lg">
          {pimModules.map((module) => (
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
