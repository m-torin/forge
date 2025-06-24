'use client';

import { useState } from 'react';
import {
  Paper,
  Title,
  Button,
  Stack,
  Group,
  Alert,
  LoadingOverlay,
  Text,
  NumberInput,
  Textarea,
  Switch,
  Divider,
  Badge,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconWorldWww } from '@tabler/icons-react';
import { z } from 'zod';
import { triggerJrSitemapsWorkflowAction } from '@/workflows/jr-sitemaps';
import { JrSitemapsWorkflowInput } from '@/workflows/jr-sitemaps/types';

const JrSitemapsInputSchema = z.object({
  customSitemaps: z.string().optional(),
  batchSize: z.number().min(100).max(5000).optional(),
  skipUnchanged: z.boolean().optional(),
  retries: z.number().min(0).max(10),
});

type JrSitemapsFormInput = z.infer<typeof JrSitemapsInputSchema>;

interface JrSitemapsTriggerProps {
  onWorkflowTriggered?: (workflowRunId: string) => void;
}

export function JrSitemapsTrigger({ onWorkflowTriggered }: JrSitemapsTriggerProps) {
  const [loading, setLoading] = useState(false);
  const [lastTriggeredId, setLastTriggeredId] = useState<string | null>(null);

  const form = useForm<JrSitemapsFormInput>({
    validate: zodResolver(JrSitemapsInputSchema),
    initialValues: {
      customSitemaps: '',
      batchSize: 500,
      skipUnchanged: true,
      retries: 3,
    },
  });

  const handleSubmit = async (values: JrSitemapsFormInput) => {
    setLoading(true);

    try {
      // Parse custom sitemaps if provided
      let customSitemaps: string[] | undefined;
      if (values.customSitemaps?.trim()) {
        customSitemaps = values.customSitemaps
          .split('\n')
          .map((url) => url.trim())
          .filter((url) => url.length > 0);
      }

      const input: JrSitemapsWorkflowInput = {
        customSitemaps,
        batchSize: values.batchSize,
        skipUnchanged: values.skipUnchanged,
      };

      const result = await triggerJrSitemapsWorkflowAction(input, { retries: values.retries });

      if (result.success && result.workflowRunId) {
        setLastTriggeredId(result.workflowRunId);

        notifications.show({
          title: 'JR-Sitemaps Workflow Started!',
          message: `Sitemap processing workflow triggered${customSitemaps ? ` for ${customSitemaps.length} custom sitemaps` : ' for default domains'}`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });

        // Reset form after successful submission
        form.reset();

        // Notify parent component
        onWorkflowTriggered?.(result.workflowRunId);
      } else {
        throw new Error(result.error || 'Failed to trigger JR-Sitemaps workflow');
      }
    } catch (error: any) {
      console.error('Failed to trigger JR-Sitemaps workflow:', error);

      notifications.show({
        title: 'Failed to Start JR-Sitemaps Workflow',
        message: error.message || 'An unexpected error occurred',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSampleSitemaps = () => {
    const sampleSitemaps = [
      'https://www.shopdisney.com/sitemap_index.xml',
      'https://www.disneystore.com/sitemap_index.xml',
      'https://www.shopdisney.com/sitemap-products.xml',
      'https://www.disneystore.com/sitemap-categories.xml',
    ];

    form.setValues({
      customSitemaps: sampleSitemaps.join('\n'),
      batchSize: 500,
      skipUnchanged: true,
      retries: 3,
    });
  };

  return (
    <Paper p="md" withBorder radius="md" pos="relative">
      <LoadingOverlay visible={loading} overlayProps={{ radius: 'sm', blur: 2 }} />

      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <IconWorldWww size={20} />
            <Title order={3}>JR-Sitemaps ETL Workflow</Title>
            <Badge variant="light" color="blue">
              Jolly Roger
            </Badge>
          </Group>
          <Button variant="light" size="xs" onClick={generateSampleSitemaps} disabled={loading}>
            Fill Sample Data
          </Button>
        </Group>

        <Text size="sm" c="dimmed">
          Process sitemaps to extract and store URLs with priority handling, batch processing, and
          child workflow distribution for scalable ETL operations.
        </Text>

        {lastTriggeredId && (
          <Alert color="blue" title="Last JR-Sitemaps Workflow Triggered">
            Workflow ID:{' '}
            <Text component="span" ff="monospace">
              {lastTriggeredId}
            </Text>
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Textarea
              label="Custom Sitemaps (Optional)"
              description="Enter sitemap URLs (one per line). Leave empty to use default domains."
              placeholder={`https://www.shopdisney.com/sitemap_index.xml
https://www.disneystore.com/sitemap_index.xml`}
              rows={4}
              {...form.getInputProps('customSitemaps')}
            />

            <Divider label="Processing Options" labelPosition="left" />

            <Group grow>
              <NumberInput
                label="Batch Size"
                description="URLs processed per batch (100-5000)"
                min={100}
                max={5000}
                step={100}
                {...form.getInputProps('batchSize')}
              />
              <NumberInput
                label="Retries"
                description="Number of retries if the workflow fails"
                min={0}
                max={10}
                {...form.getInputProps('retries')}
              />
            </Group>

            <Switch
              label="Skip Unchanged Sitemaps"
              description="Skip processing sitemaps that haven't changed since last run"
              {...form.getInputProps('skipUnchanged', { type: 'checkbox' })}
            />

            <Alert color="yellow" title="JR-Sitemaps Features" variant="light">
              <Stack gap="xs">
                <Text size="sm">
                  • <strong>Priority Processing:</strong> Disney domains get higher priority and
                  concurrency
                </Text>
                <Text size="sm">
                  • <strong>Child Workflows:</strong> Large sitemap sets are distributed across
                  multiple workflows
                </Text>
                <Text size="sm">
                  • <strong>Deduplication:</strong> URLs are deduplicated using Redis sets with
                  efficient storage
                </Text>
                <Text size="sm">
                  • <strong>Progress Tracking:</strong> Real-time progress updates and comprehensive
                  statistics
                </Text>
              </Stack>
            </Alert>

            <Button
              type="submit"
              leftSection={<IconWorldWww size={16} />}
              loading={loading}
              disabled={loading}
              size="md"
            >
              Start JR-Sitemaps Workflow
            </Button>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}
