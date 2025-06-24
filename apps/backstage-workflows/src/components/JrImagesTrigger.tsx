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
  Switch,
  Divider,
  Badge,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconPhoto, IconSettings } from '@tabler/icons-react';
import { z } from 'zod';
import { triggerJrImagesWorkflowAction } from '@/workflows/jr-images';
import { JrImagesWorkflowInput } from '@/workflows/jr-images/types';

const JrImagesInputSchema = z.object({
  batchSize: z.number().min(10).max(500).optional(),
  compressionQuality: z.number().min(10).max(100).optional(),
  maxWidth: z.number().min(500).max(4000).optional(),
  maxHeight: z.number().min(500).max(4000).optional(),
  retries: z.number().min(0).max(10),
});

type JrImagesFormInput = z.infer<typeof JrImagesInputSchema>;

interface JrImagesTriggerProps {
  onWorkflowTriggered?: (workflowRunId: string) => void;
}

export function JrImagesTrigger({ onWorkflowTriggered }: JrImagesTriggerProps) {
  const [loading, setLoading] = useState(false);
  const [lastTriggeredId, setLastTriggeredId] = useState<string | null>(null);
  const [advancedMode, setAdvancedMode] = useState(false);

  const form = useForm<JrImagesFormInput>({
    validate: zodResolver(JrImagesInputSchema),
    initialValues: {
      batchSize: 100,
      compressionQuality: 85,
      maxWidth: 1600,
      maxHeight: 1600,
      retries: 3,
    },
  });

  const handleSubmit = async (values: JrImagesFormInput) => {
    setLoading(true);

    try {
      const input: JrImagesWorkflowInput = {
        batchSize: values.batchSize,
        compressionQuality: values.compressionQuality,
        maxWidth: values.maxWidth,
        maxHeight: values.maxHeight,
      };

      const result = await triggerJrImagesWorkflowAction(input, { retries: values.retries });

      if (result.success && result.workflowRunId) {
        setLastTriggeredId(result.workflowRunId);

        notifications.show({
          title: 'JR-Images Workflow Started!',
          message: `Image migration workflow triggered with batch size ${values.batchSize || 100}`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });

        // Reset form after successful submission
        form.reset();

        // Notify parent component
        onWorkflowTriggered?.(result.workflowRunId);
      } else {
        throw new Error(result.error || 'Failed to trigger JR-Images workflow');
      }
    } catch (error: any) {
      console.error('Failed to trigger JR-Images workflow:', error);

      notifications.show({
        title: 'Failed to Start JR-Images Workflow',
        message: error.message || 'An unexpected error occurred',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePresets = (preset: 'high-quality' | 'balanced' | 'fast') => {
    switch (preset) {
      case 'high-quality':
        form.setValues({
          batchSize: 50,
          compressionQuality: 95,
          maxWidth: 2400,
          maxHeight: 2400,
          retries: 5,
        });
        break;
      case 'balanced':
        form.setValues({
          batchSize: 100,
          compressionQuality: 85,
          maxWidth: 1600,
          maxHeight: 1600,
          retries: 3,
        });
        break;
      case 'fast':
        form.setValues({
          batchSize: 200,
          compressionQuality: 75,
          maxWidth: 1200,
          maxHeight: 1200,
          retries: 2,
        });
        break;
    }
  };

  return (
    <Paper p="md" withBorder radius="md" pos="relative">
      <LoadingOverlay visible={loading} overlayProps={{ radius: 'sm', blur: 2 }} />

      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <IconPhoto size={20} />
            <Title order={3}>JR-Images Migration Workflow</Title>
            <Badge variant="light" color="green">
              Jolly Roger
            </Badge>
          </Group>
          <Group gap="xs">
            <Button
              variant="light"
              size="xs"
              onClick={() => generatePresets('high-quality')}
              disabled={loading}
            >
              High Quality
            </Button>
            <Button
              variant="light"
              size="xs"
              onClick={() => generatePresets('balanced')}
              disabled={loading}
            >
              Balanced
            </Button>
            <Button
              variant="light"
              size="xs"
              onClick={() => generatePresets('fast')}
              disabled={loading}
            >
              Fast
            </Button>
          </Group>
        </Group>

        <Text size="sm" c="dimmed">
          Process and migrate images from Firestore documents to R2 storage with WebP compression,
          priority handling, and distributed child workflows for scalable processing.
        </Text>

        {lastTriggeredId && (
          <Alert color="blue" title="Last JR-Images Workflow Triggered">
            Workflow ID:{' '}
            <Text component="span" ff="monospace">
              {lastTriggeredId}
            </Text>
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Group grow>
              <NumberInput
                label="Batch Size"
                description="Documents processed per batch (10-500)"
                min={10}
                max={500}
                step={10}
                {...form.getInputProps('batchSize')}
              />
              <NumberInput
                label="Compression Quality"
                description="WebP quality (10-100, higher = better)"
                min={10}
                max={100}
                step={5}
                {...form.getInputProps('compressionQuality')}
              />
            </Group>

            <Divider
              label={
                <Group gap="xs">
                  <IconSettings size={14} />
                  <Text size="sm">Image Processing Options</Text>
                </Group>
              }
              labelPosition="left"
            />

            <Group grow>
              <NumberInput
                label="Max Width"
                description="Maximum width in pixels (500-4000)"
                min={500}
                max={4000}
                step={100}
                {...form.getInputProps('maxWidth')}
              />
              <NumberInput
                label="Max Height"
                description="Maximum height in pixels (500-4000)"
                min={500}
                max={4000}
                step={100}
                {...form.getInputProps('maxHeight')}
              />
            </Group>

            <Switch
              label="Advanced Mode"
              description="Show additional configuration options"
              checked={advancedMode}
              onChange={(event) => setAdvancedMode(event.currentTarget.checked)}
            />

            {advancedMode && (
              <NumberInput
                label="Retries"
                description="Number of retries if the workflow fails"
                min={0}
                max={10}
                {...form.getInputProps('retries')}
              />
            )}

            <Alert color="blue" title="JR-Images Features" variant="light">
              <Stack gap="xs">
                <Text size="sm">
                  • <strong>Priority Processing:</strong> Hero images and featured products get
                  higher priority
                </Text>
                <Text size="sm">
                  • <strong>Child Workflows:</strong> Large document sets are distributed across
                  multiple workflows
                </Text>
                <Text size="sm">
                  • <strong>WebP Conversion:</strong> All images are converted to WebP with
                  customizable quality
                </Text>
                <Text size="sm">
                  • <strong>Smart Sizing:</strong> Images are resized while maintaining aspect ratio
                </Text>
                <Text size="sm">
                  • <strong>Progress Tracking:</strong> Real-time progress updates and comprehensive
                  statistics
                </Text>
                <Text size="sm">
                  • <strong>Resilient Processing:</strong> Partial success handling for documents
                  with mixed results
                </Text>
              </Stack>
            </Alert>

            <Alert color="yellow" title="Processing Information" variant="light">
              <Stack gap="xs">
                <Text size="sm">
                  <strong>Source:</strong> Firestore collection &apos;scraped_products&apos; with
                  unmapped images
                </Text>
                <Text size="sm">
                  <strong>Destination:</strong> R2 storage with organized folder structure
                </Text>
                <Text size="sm">
                  <strong>Processing Rules:</strong> Domain-specific quality and size settings
                </Text>
                <Text size="sm">
                  <strong>Security:</strong> SSRF protection and private IP filtering
                </Text>
              </Stack>
            </Alert>

            <Button
              type="submit"
              leftSection={<IconPhoto size={16} />}
              loading={loading}
              disabled={loading}
              size="md"
            >
              Start JR-Images Migration
            </Button>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}
