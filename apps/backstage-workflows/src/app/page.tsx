'use client';

import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Alert,
  Tabs,
  Badge,
  Group,
  SegmentedControl,
} from '@mantine/core';
import { IconInfoCircle, IconRocket, IconChartBar } from '@tabler/icons-react';
import { WorkflowTrigger } from '@/components/WorkflowTrigger';
import { JrSitemapsTrigger } from '@/components/JrSitemapsTrigger';
import { JrImagesTrigger } from '@/components/JrImagesTrigger';
import { SeoGenerationTrigger } from '@/components/SeoGenerationTrigger';
import { WorkflowStatus } from '@/components/WorkflowStatus';

export default function WorkflowsPage() {
  const [activeTab, setActiveTab] = useState<string | null>('trigger');
  const [workflowType, setWorkflowType] = useState<
    'customer-onboarding' | 'jr-sitemaps' | 'jr-images' | 'seo-generation'
  >('customer-onboarding');
  const [lastTriggeredWorkflow, setLastTriggeredWorkflow] = useState<string | null>(null);

  const handleWorkflowTriggered = (workflowRunId: string) => {
    setLastTriggeredWorkflow(workflowRunId);
    // Switch to status tab to show the newly created workflow
    setActiveTab('status');
  };

  return (
    <Container size="xl">
      <Stack gap="lg">
        <Stack gap="md">
          <Group justify="space-between">
            <div>
              <Title order={2}>Workflow Management</Title>
              <Text c="dimmed">
                Upstash Workflow demonstrations with customer onboarding and JR-Sitemaps ETL
              </Text>
            </div>
            <Badge variant="light" color="blue">
              Port 3303
            </Badge>
          </Group>

          <Alert
            icon={<IconInfoCircle size={16} />}
            title="About These Workflows"
            color="blue"
            variant="light"
          >
            <Text size="sm">
              This application demonstrates Upstash Workflow with four different scenarios:
            </Text>
            <Stack gap="xs" mt="xs">
              <Text size="sm">
                <strong>Customer Onboarding:</strong> Email automation with AI message generation
                and time delays
              </Text>
              <Text size="sm">
                <strong>JR-Sitemaps ETL:</strong> Large-scale sitemap processing with distributed
                child workflows and priority handling
              </Text>
              <Text size="sm">
                <strong>JR-Images Migration:</strong> Enterprise image processing with WebP
                conversion, R2 storage, and resilient batch processing
              </Text>
              <Text size="sm">
                <strong>SEO Generation:</strong> AI-powered SEO content creation with LMStudio +
                Claude optimization and strategy-based processing
              </Text>
            </Stack>
          </Alert>
        </Stack>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="trigger" leftSection={<IconRocket size={16} />}>
              Trigger Workflow
            </Tabs.Tab>
            <Tabs.Tab value="status" leftSection={<IconChartBar size={16} />}>
              Monitor Workflows
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="trigger" pt="md">
            <Stack gap="md">
              <SegmentedControl
                value={workflowType}
                onChange={(value) =>
                  setWorkflowType(
                    value as 'customer-onboarding' | 'jr-sitemaps' | 'jr-images' | 'seo-generation',
                  )
                }
                data={[
                  {
                    label: 'Customer Onboarding',
                    value: 'customer-onboarding',
                  },
                  {
                    label: 'JR-Sitemaps ETL',
                    value: 'jr-sitemaps',
                  },
                  {
                    label: 'JR-Images Migration',
                    value: 'jr-images',
                  },
                  {
                    label: 'SEO Generation',
                    value: 'seo-generation',
                  },
                ]}
              />

              {workflowType === 'customer-onboarding' ? (
                <WorkflowTrigger onWorkflowTriggered={handleWorkflowTriggered} />
              ) : workflowType === 'jr-sitemaps' ? (
                <JrSitemapsTrigger onWorkflowTriggered={handleWorkflowTriggered} />
              ) : workflowType === 'jr-images' ? (
                <JrImagesTrigger onWorkflowTriggered={handleWorkflowTriggered} />
              ) : (
                <SeoGenerationTrigger onWorkflowTriggered={handleWorkflowTriggered} />
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="status" pt="md">
            <WorkflowStatus
              workflowRunId={lastTriggeredWorkflow || undefined}
              autoRefresh={true}
              refreshInterval={5000}
            />
          </Tabs.Panel>
        </Tabs>

        <Alert color="yellow" title="Setup Required" variant="light">
          <Stack gap="xs">
            <Text size="sm">
              To use Upstash Workflow, you need to configure the following environment variables:
            </Text>
            <Text size="sm" ff="monospace">
              • QSTASH_TOKEN - Your QStash token from the Upstash Console
              <br />
              • QSTASH_URL - QStash URL (optional, for local development)
              <br />
              • QSTASH_CURRENT_SIGNING_KEY - For webhook verification (optional)
              <br />• QSTASH_NEXT_SIGNING_KEY - For webhook verification (optional)
            </Text>
            <Text size="sm">
              For local development, you can run{' '}
              <Text component="span" ff="monospace">
                npx @upstash/qstash-cli dev
              </Text>{' '}
              to start a local QStash server.
            </Text>
          </Stack>
        </Alert>
      </Stack>
    </Container>
  );
}
