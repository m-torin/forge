'use client';

// SEO Generation Workflow Trigger Component
// AI-powered content generation with strategy selection

import { useState } from 'react';
import {
  Card,
  Title,
  Text,
  Button,
  Stack,
  Group,
  NumberInput,
  Switch,
  Select,
  TextInput,
  Alert,
  Badge,
  Divider,
  Loader,
  ActionIcon,
  Tooltip,
  Grid,
  Paper,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconRocket,
  IconInfoCircle,
  IconSettings,
  IconRefresh,
  IconBrain,
  IconTarget,
  IconEye,
  IconSearch,
  IconChartBar,
  IconClock,
  IconCoins,
} from '@tabler/icons-react';
import { SeoStrategy } from '@/workflows/seo-generation/types';

interface SeoGenerationTriggerProps {
  onWorkflowTriggered?: (workflowRunId: string) => void;
}

export function SeoGenerationTrigger({ onWorkflowTriggered }: SeoGenerationTriggerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      strategy: 'conversion' as SeoStrategy,
      limit: 25,
      onlyMissing: true,
      regenerate: false,
      categoryFilter: '',
      brandFilter: '',
      progressWebhook: '',
      productIds: '',
    },
  });

  const handleTrigger = async (values: typeof form.values) => {
    setIsLoading(true);
    setLastResult(null);

    try {
      const payload = {
        trigger: 'manual' as const,
        seoStrategy: values.strategy,
        limit: values.limit,
        onlyMissing: values.onlyMissing,
        regenerate: values.regenerate,
        categoryFilter: values.categoryFilter || undefined,
        brandFilter: values.brandFilter || undefined,
        progressWebhook: values.progressWebhook || undefined,
        productIds: values.productIds
          ? values.productIds
              .split(',')
              .map((id) => id.trim())
              .filter(Boolean)
          : undefined,
      };

      console.log('Triggering SEO generation workflow', payload);

      const response = await fetch('/api/workflow/seo-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const workflowRunId = result.workflowRunId || `seo-${values.strategy}-${Date.now()}`;

      setLastResult(workflowRunId);
      onWorkflowTriggered?.(workflowRunId);

      notifications.show({
        title: 'SEO Generation Started',
        message: `Workflow ${workflowRunId} triggered successfully with ${values.strategy} strategy`,
        color: 'green',
        icon: <IconRocket size={16} />,
      });
    } catch (error) {
      console.error('Failed to trigger SEO generation workflow:', error);
      notifications.show({
        title: 'SEO Generation Failed',
        message: error instanceof Error ? error.message : 'Failed to start workflow',
        color: 'red',
        icon: <IconInfoCircle size={16} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const strategyInfo = {
    conversion: {
      icon: <IconTarget size={16} />,
      color: 'green',
      description: 'Purchase-focused content with urgency and clear CTAs',
      keywords: 'Buy, Shop, Best Price, Discount',
      tone: 'Persuasive and action-oriented',
    },
    awareness: {
      icon: <IconEye size={16} />,
      color: 'blue',
      description: 'Brand-building content that educates and builds trust',
      keywords: 'Discover, Learn, Premium, Quality',
      tone: 'Educational and authoritative',
    },
    discovery: {
      icon: <IconSearch size={16} />,
      color: 'purple',
      description: 'Problem-solving content for research-phase users',
      keywords: 'Guide, Compare, How-to, Best',
      tone: 'Helpful and informative',
    },
  };

  const selectedStrategyInfo = strategyInfo[form.values.strategy];

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Title order={3}>
              <Group gap="xs">
                <IconBrain size={24} />
                SEO Content Generation
              </Group>
            </Title>
            <Text size="sm" c="dimmed">
              AI-powered SEO content generation with LMStudio + Claude optimization
            </Text>
          </div>
          <Badge variant="light" color="violet">
            AI Workflow
          </Badge>
        </Group>

        <Alert
          icon={<IconInfoCircle size={16} />}
          title="AI-Powered Workflow"
          color="blue"
          variant="light"
        >
          <Text size="sm">
            This workflow uses LMStudio for content generation and Claude Sonnet 4 for optimization.
            Each product generates SEO titles, descriptions, keywords, and structured data.
          </Text>
        </Alert>

        <form onSubmit={form.onSubmit(handleTrigger)}>
          <Stack gap="md">
            {/* Strategy Selection */}
            <Paper withBorder p="md" radius="md">
              <Title order={5} mb="sm">
                <Group gap="xs">
                  <IconSettings size={18} />
                  SEO Strategy
                </Group>
              </Title>

              <Select
                label="Content Strategy"
                description="Choose the SEO approach based on target audience intent"
                {...form.getInputProps('strategy')}
                data={[
                  { value: 'conversion', label: 'Conversion - Purchase Intent' },
                  { value: 'awareness', label: 'Awareness - Brand Building' },
                  { value: 'discovery', label: 'Discovery - Research Phase' },
                ]}
                leftSection={selectedStrategyInfo.icon}
                required
              />

              <Alert
                color={selectedStrategyInfo.color}
                variant="light"
                mt="sm"
                icon={selectedStrategyInfo.icon}
              >
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    {selectedStrategyInfo.description}
                  </Text>
                  <Group gap="md">
                    <Text size="xs">
                      <strong>Keywords:</strong> {selectedStrategyInfo.keywords}
                    </Text>
                    <Text size="xs">
                      <strong>Tone:</strong> {selectedStrategyInfo.tone}
                    </Text>
                  </Group>
                </Stack>
              </Alert>
            </Paper>

            {/* Processing Options */}
            <Paper withBorder p="md" radius="md">
              <Title order={5} mb="sm">
                Processing Options
              </Title>

              <Grid>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Product Limit"
                    description="Max products to process (1-200)"
                    {...form.getInputProps('limit')}
                    min={1}
                    max={200}
                    leftSection={<IconChartBar size={16} />}
                  />
                </Grid.Col>

                <Grid.Col span={6}>
                  <Stack gap="sm" mt="md">
                    <Switch
                      label="Only Missing SEO"
                      description="Process only products without SEO content"
                      {...form.getInputProps('onlyMissing', { type: 'checkbox' })}
                    />

                    <Switch
                      label="Regenerate Existing"
                      description="Overwrite existing SEO content"
                      {...form.getInputProps('regenerate', { type: 'checkbox' })}
                    />
                  </Stack>
                </Grid.Col>
              </Grid>
            </Paper>

            {/* Filters */}
            <Paper withBorder p="md" radius="md">
              <Title order={5} mb="sm">
                Filters (Optional)
              </Title>

              <Grid>
                <Grid.Col span={4}>
                  <TextInput
                    label="Category Filter"
                    description="Filter by category name"
                    placeholder="e.g. Electronics"
                    {...form.getInputProps('categoryFilter')}
                  />
                </Grid.Col>

                <Grid.Col span={4}>
                  <TextInput
                    label="Brand Filter"
                    description="Filter by brand name"
                    placeholder="e.g. Apple"
                    {...form.getInputProps('brandFilter')}
                  />
                </Grid.Col>

                <Grid.Col span={4}>
                  <TextInput
                    label="Product IDs"
                    description="Specific product IDs (comma-separated)"
                    placeholder="prod1, prod2, prod3"
                    {...form.getInputProps('productIds')}
                  />
                </Grid.Col>
              </Grid>
            </Paper>

            {/* Advanced Options */}
            <Paper withBorder p="md" radius="md">
              <Title order={5} mb="sm">
                Advanced Options
              </Title>

              <TextInput
                label="Progress Webhook URL"
                description="Receive progress updates (optional)"
                placeholder="https://your-app.com/webhooks/seo-progress"
                {...form.getInputProps('progressWebhook')}
              />
            </Paper>

            <Divider />

            {/* Cost Information */}
            <Alert icon={<IconCoins size={16} />} color="yellow" variant="light">
              <Group justify="space-between">
                <div>
                  <Text size="sm" fw={500}>
                    Estimated Processing Cost
                  </Text>
                  <Text size="xs" c="dimmed">
                    ~{form.values.limit * 0.01} tokens per product • {form.values.limit} products =
                    ~{(form.values.limit * 0.01 * form.values.limit).toFixed(2)} total tokens
                  </Text>
                </div>
                <Group gap="xs">
                  <IconClock size={16} />
                  <Text size="xs">~{Math.ceil(form.values.limit / 5)} minutes</Text>
                </Group>
              </Group>
            </Alert>

            {/* Trigger Button */}
            <Group justify="space-between">
              <Button
                type="submit"
                size="md"
                loading={isLoading}
                leftSection={isLoading ? <Loader size={16} /> : <IconRocket size={16} />}
                disabled={isLoading}
                color={selectedStrategyInfo.color}
              >
                {isLoading
                  ? 'Generating SEO Content...'
                  : `Start ${form.values.strategy.charAt(0).toUpperCase() + form.values.strategy.slice(1)} SEO Generation`}
              </Button>

              <Group gap="xs">
                <Tooltip label="Reset form to defaults">
                  <ActionIcon variant="subtle" onClick={() => form.reset()} disabled={isLoading}>
                    <IconRefresh size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>

            {/* Last Result */}
            {lastResult && (
              <Alert color="green" variant="light" icon={<IconInfoCircle size={16} />}>
                <Text size="sm">
                  <strong>Workflow Started:</strong> {lastResult}
                </Text>
                <Text size="xs" c="dimmed">
                  Switch to the &quot;Monitor Workflows&quot; tab to track progress
                </Text>
              </Alert>
            )}
          </Stack>
        </form>
      </Stack>
    </Card>
  );
}
