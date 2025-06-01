'use client';

import { Alert, Badge, Button, Card, Chip, Grid, Group, Stack, Text } from '@mantine/core';
import { IconFilter } from '@tabler/icons-react';
import { useState } from 'react';

import { runWorkflow } from '../actions';

import { WorkflowCard } from './workflow-card';

interface WorkflowGridProps {
  workflows: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    difficulty: string;
    estimatedTime: string;
    color?: string;
    features: string[];
    defaultPayload: Record<string, any>;
  }[];
}

export function WorkflowGrid({ workflows }: WorkflowGridProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [runningWorkflows, setRunningWorkflows] = useState<Record<string, boolean>>({});
  const [workflowStatus, setWorkflowStatus] = useState<Record<string, any>>({});

  // Get all unique tags
  const allTags = Array.from(new Set(workflows.flatMap((w) => w.tags))).sort();

  // Filter workflows by tags
  const filteredWorkflows = workflows.filter((workflow) => {
    if (selectedTags.length === 0) return true;
    return workflow.tags.some((tag) => selectedTags.includes(tag));
  });

  const handleRun = async (workflowId: string, payload: any) => {
    setRunningWorkflows((prev) => ({ ...prev, [workflowId]: true }));

    try {
      const result = await runWorkflow(workflowId, payload);

      if (result.success) {
        setWorkflowStatus((prev) => ({
          ...prev,
          [workflowId]: {
            status: 'running',
            workflowRunId: result.workflowRunId,
          },
        }));
      } else {
        setWorkflowStatus((prev) => ({
          ...prev,
          [workflowId]: {
            error: result.error,
            status: 'failed',
          },
        }));
      }
    } catch {
      setWorkflowStatus((prev) => ({
        ...prev,
        [workflowId]: {
          error: 'Failed to trigger workflow',
          status: 'failed',
        },
      }));
    } finally {
      setRunningWorkflows((prev) => ({ ...prev, [workflowId]: false }));
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Group>
          <Badge size="sm" variant="light">
            {filteredWorkflows.length} of {workflows.length} workflows
          </Badge>
        </Group>
        <Button
          leftSection={<IconFilter size={16} />}
          onClick={() => setFilterExpanded(!filterExpanded)}
          size="xs"
          variant="subtle"
        >
          {filterExpanded ? 'Hide' : 'Show'} Filters
        </Button>
      </Group>

      {filterExpanded && (
        <Card shadow="sm" withBorder p="md" radius="md">
          <div>
            <Group justify="space-between" mb="xs">
              <Text fw={500} size="sm">
                Filter by Tags
              </Text>
              {selectedTags.length > 0 && (
                <Button onClick={() => setSelectedTags([])} size="xs" variant="subtle">
                  Clear all
                </Button>
              )}
            </Group>
            <Chip.Group onChange={setSelectedTags} multiple value={selectedTags}>
              <Group gap="xs">
                {allTags.map((tag) => (
                  <Chip key={tag} size="sm" value={tag}>
                    {tag}
                  </Chip>
                ))}
              </Group>
            </Chip.Group>
          </div>
        </Card>
      )}

      {filteredWorkflows.length === 0 ? (
        <Alert color="gray" title="No workflows found">
          No workflows match your current filters. Try adjusting your selection.
        </Alert>
      ) : (
        <Grid>
          {filteredWorkflows.map((workflow) => (
            <Grid.Col key={workflow.id} span={{ base: 12, md: 6 }}>
              <WorkflowCard
                onRun={handleRun}
                workflow={workflow}
                isRunning={runningWorkflows[workflow.id]}
                status={workflowStatus[workflow.id]}
              />
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Stack>
  );
}
