'use client';

import { Badge, Card, Container, Grid, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import {
  IconApi,
  IconCalendarEvent,
  IconFileImport,
  IconRobot,
  IconSettings,
  IconTags,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { flag, flags } from '@repo/analytics/client';
import { useAnalytics, useObservability, useUIAnalytics } from '@repo/observability';

const workflowCategories = [
  {
    color: 'blue',
    description: 'AI-powered product categorization with training feedback',
    flagKey: 'workflows.product-classification',
    href: '/workflows/product-classification',
    icon: IconRobot,
    stats: { active: 12, pending: 3 },
    title: 'Product Classification',
  },
  {
    color: 'green',
    description: 'Create and manage scheduled workflow executions',
    flagKey: 'workflows.schedules',
    href: '/workflows/schedules',
    icon: IconCalendarEvent,
    stats: { active: 5, scheduled: 8 },
    title: 'Schedule Management',
  },
  {
    color: 'violet',
    description: 'Configure workflow parameters and retry policies',
    flagKey: 'workflows.configuration',
    href: '/workflows/configuration',
    icon: IconSettings,
    stats: { workflows: 15 },
    title: 'Workflow Configuration',
  },
  {
    color: 'orange',
    description: 'Bulk import and process large datasets',
    flagKey: 'workflows.batch-processing',
    href: '/workflows/batch-processing',
    icon: IconFileImport,
    stats: { processing: 1, queued: 2 },
    title: 'Batch Processing',
  },
  {
    color: 'cyan',
    description: 'Chart PDPs, sitemaps, and external system workflows',
    flagKey: 'workflows.integrations',
    href: '/workflows/integrations',
    icon: IconApi,
    stats: { active: 7 },
    title: 'Integrations',
  },
  {
    color: 'grape',
    description: 'Review and approve product classifications',
    flagKey: 'workflows.product-classification', // Shares the same flag as product classification
    href: '/taxonomy-verification',
    icon: IconTags,
    stats: { pending: 24 },
    title: 'Taxonomy Verification',
  },
];

function WorkflowCard({ category }: { category: (typeof workflowCategories)[0] }) {
  const isEnabled = useFlag(category.flagKey);
  const { trackClick, trackView } = useUIAnalytics();
  const { trackEvent } = useObservability();

  useEffect(() => {
    if (isEnabled) {
      trackView('workflow_card', { workflowType: category.title });
    }
  }, [isEnabled, trackView, category.title]);

  const handleClick = () => {
    trackClick('workflow_card', {
      href: category.href,
      workflowType: category.title,
    });
    trackEvent({
      action: 'navigate',
      category: 'workflow',
      label: category.title,
      metadata: { href: category.href },
    });
  };

  // Hide card if feature flag is disabled
  if (!isEnabled) {
    return null;
  }

  return (
    <Grid.Col span={{ base: 12, lg: 4, sm: 6 }}>
      <Card
        href={category.href as any}
        component={Link}
        onClick={handleClick}
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
            <ThemeIcon color={category.color} size="xl" variant="light">
              <category.icon size={28} />
            </ThemeIcon>
            {Object.entries(category.stats).map(([key, value]) => (
              <Badge key={key} color={category.color} variant="filled">
                {value} {key}
              </Badge>
            ))}
          </Group>

          <div>
            <Title order={3} mb="xs">
              {category.title}
            </Title>
            <Text c="dimmed" size="sm">
              {category.description}
            </Text>
          </div>
        </Stack>
      </Card>
    </Grid.Col>
  );
}

export default function WorkflowsOverviewPage() {
  const { trackPage } = useAnalytics();
  const { trackEvent } = useObservability();

  useEffect(() => {
    trackPage('workflows_overview');
    trackEvent({
      action: 'view',
      category: 'workflow',
      label: 'overview_page',
    });
  }, [trackPage, trackEvent]);

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>Workflow Management</Title>
          <Text c="dimmed" mt="md" size="lg">
            Configure, schedule, and manage background workflows
          </Text>
        </div>

        <Grid gutter="lg">
          {workflowCategories.map((category) => (
            <WorkflowCard key={category.href} category={category} />
          ))}
        </Grid>
      </Stack>
    </Container>
  );
}
