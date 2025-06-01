'use client';

import {
  Badge,
  Button,
  Card,
  Code,
  Group,
  JsonInput,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconCheck, IconPlayerPlay } from '@tabler/icons-react';
import { useState } from 'react';

interface WorkflowCardProps {
  isRunning?: boolean;
  onRun: (workflowId: string, payload: any) => void;
  status?: any;
  workflow: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    difficulty: string;
    estimatedTime: string;
    color?: string;
    features: string[];
    defaultPayload: Record<string, any>;
  };
}

export function WorkflowCard({ isRunning, onRun, status, workflow }: WorkflowCardProps) {
  const [payload, setPayload] = useState(JSON.stringify(workflow.defaultPayload, null, 2));

  const handleRun = () => {
    try {
      const parsedPayload = JSON.parse(payload);
      onRun(workflow.id, parsedPayload);
    } catch {
      console.error('Invalid JSON payload');
    }
  };

  return (
    <Card shadow="sm" withBorder h="100%" p="lg" radius="md">
      <Stack gap="md" h="100%">
        <Group justify="space-between">
          <Group>
            <ThemeIcon color={workflow.color || 'blue'} size="lg" variant="light">
              <IconPlayerPlay size={24} />
            </ThemeIcon>
            <div>
              <Title order={3}>{workflow.title}</Title>
              <Text c="dimmed" size="xs">
                {workflow.estimatedTime} • {workflow.difficulty}
              </Text>
            </div>
          </Group>
          {status && (
            <Badge
              color={
                status.status === 'completed'
                  ? 'green'
                  : status.status === 'failed'
                    ? 'red'
                    : 'blue'
              }
              variant={isRunning ? 'dot' : 'filled'}
            >
              {status.status}
            </Badge>
          )}
        </Group>

        <Text c="dimmed" size="sm">
          {workflow.description}
        </Text>

        <Group gap="xs">
          {workflow.tags.map((tag) => (
            <Badge key={tag} size="xs" variant="outline">
              {tag}
            </Badge>
          ))}
        </Group>

        <Stack gap="xs">
          {workflow.features.slice(0, 3).map((feature) => (
            <Group key={feature} gap="xs">
              <ThemeIcon color="teal" size="xs" variant="light">
                <IconCheck size={12} />
              </ThemeIcon>
              <Text size="xs">{feature}</Text>
            </Group>
          ))}
          {workflow.features.length > 3 && (
            <Text c="dimmed" size="xs">
              +{workflow.features.length - 3} more features
            </Text>
          )}
        </Stack>

        <div style={{ marginTop: 'auto' }}>
          <Stack gap="xs">
            <Text fw={500} size="sm">
              Payload
            </Text>
            <JsonInput
              validationError="Invalid JSON"
              autosize
              formatOnBlur
              maxRows={8}
              minRows={4}
              onChange={setPayload}
              styles={{
                input: {
                  fontFamily: 'monospace',
                  fontSize: '12px',
                },
              }}
              value={payload}
            />
          </Stack>
        </div>

        <Group justify="space-between">
          <Badge color={workflow.color || 'blue'} size="sm" variant="light">
            /workflows/{workflow.id}
          </Badge>
          <Button
            leftSection={<IconPlayerPlay size={14} />}
            loading={isRunning}
            onClick={handleRun}
            disabled={isRunning}
            size="xs"
          >
            Run
          </Button>
        </Group>

        {status && (
          <Group gap="xs">
            <Text size="xs">
              ID: <Code>{status.workflowRunId}</Code>
            </Text>
          </Group>
        )}
      </Stack>
    </Card>
  );
}
