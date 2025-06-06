'use client';

import { formatDuration, workflowService } from '@/lib';
import { type WorkflowDefinition } from '@/types';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  IconCode,
  IconEye,
  IconFilter,
  IconPlay,
  IconSearch,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('grid');

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      const result = await workflowService.executeWorkflow(
        workflowId,
        {}, // Empty input for demo
        { type: 'manual', payload: {}, triggeredBy: 'user' },
      );
      console.log('Workflow executed:', result);
    } catch (error) {
      console.error('Failed to execute workflow:', error);
    }
  };

  // Get unique categories and tags
  const categories = useMemo(() => {
    const cats = new Set<string>();
    workflows.forEach((w) => {
      if (w.category) cats.add(w.category);
    });
    return Array.from(cats).sort();
  }, [workflows]);

  const tags = useMemo(() => {
    const allTags = new Set<string>();
    workflows.forEach((w) => {
      w.tags?.forEach((tag) => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  }, [workflows]);

  // Filter workflows
  const filteredWorkflows = useMemo(() => {
    return workflows.filter((workflow) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          workflow.name.toLowerCase().includes(query) ||
          workflow.description.toLowerCase().includes(query) ||
          workflow.id.toLowerCase().includes(query) ||
          workflow.tags?.some((tag) => tag.toLowerCase().includes(query));

        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && workflow.category !== selectedCategory) {
        return false;
      }

      // Tag filter
      if (selectedTag !== 'all' && !workflow.tags?.includes(selectedTag)) {
        return false;
      }

      return true;
    });
  }, [workflows, searchQuery, selectedCategory, selectedTag]);

  const getCategoryColor = (category: string) => {
    const colors = {
      ai: 'purple',
      email: 'green',
      general: 'gray',
      payments: 'blue',
    };
    return colors[category as keyof typeof colors] || 'gray';
  };

  const WorkflowCard = ({ workflow }: { workflow: WorkflowDefinition }) => (
    <Card withBorder h="100%" padding="lg" radius="md">
      <Stack h="100%" justify="space-between">
        <div>
          <Group justify="space-between" mb="xs">
            <Badge color={getCategoryColor(workflow.category || 'general')} variant="light">
              {workflow.category || 'general'}
            </Badge>
            <Text c="dimmed" size="xs">
              v{workflow.version}
            </Text>
          </Group>

          <Title order={4} mb="xs">
            {workflow.name}
          </Title>

          <Text c="dimmed" lineClamp={3} mb="sm" size="sm">
            {workflow.description}
          </Text>

          <Group gap="xs" mb="sm">
            <Badge color="orange" size="xs" variant="outline">
              {formatDuration(workflow.timeout || 0)} timeout
            </Badge>
            <Badge color="blue" size="xs" variant="outline">
              {workflow.retries || 0} retries
            </Badge>
            {workflow.concurrency && (
              <Badge color="teal" size="xs" variant="outline">
                {workflow.concurrency} concurrent
              </Badge>
            )}
          </Group>

          {workflow.tags && workflow.tags.length > 0 && (
            <Group gap="xs" mb="sm">
              {workflow.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} size="xs" variant="outline">
                  {tag}
                </Badge>
              ))}
              {workflow.tags.length > 3 && (
                <Badge c="dimmed" size="xs" variant="outline">
                  +{workflow.tags.length - 3}
                </Badge>
              )}
            </Group>
          )}

          <Text c="dimmed" size="xs">
            Author: {workflow.author || 'Unknown'}
          </Text>
        </div>

        <Group justify="space-between">
          <Button
            leftSection={<IconPlay size={14} />}
            onClick={() => executeWorkflow(workflow.id)}
            size="sm"
            variant="light"
          >
            Execute
          </Button>
          <Group gap="xs">
            <ActionIcon
              href={`/workflows/${workflow.id}`}
              component={Link}
              size="sm"
              variant="subtle"
            >
              <IconEye size={16} />
            </ActionIcon>
            <ActionIcon
              href={`vscode://file${workflow.filePath}`}
              component="a"
              size="sm"
              title="Open in VS Code"
              variant="subtle"
            >
              <IconCode size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Stack>
    </Card>
  );

  const WorkflowListItem = ({ workflow }: { workflow: WorkflowDefinition }) => (
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between">
        <Group>
          <Badge color={getCategoryColor(workflow.category || 'general')} variant="light">
            {workflow.category || 'general'}
          </Badge>
          <div>
            <Text fw={500}>{workflow.name}</Text>
            <Text c="dimmed" size="sm">
              {workflow.description}
            </Text>
          </div>
        </Group>

        <Group>
          <Text c="dimmed" size="xs">
            v{workflow.version}
          </Text>
          <Button
            leftSection={<IconPlay size={14} />}
            onClick={() => executeWorkflow(workflow.id)}
            size="sm"
            variant="light"
          >
            Execute
          </Button>
          <ActionIcon
            href={`/workflows/${workflow.id}`}
            component={Link}
            size="sm"
            variant="subtle"
          >
            <IconEye size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={1} mb="xs" size="h1">
            Workflows
          </Title>
          <Text c="dimmed" size="lg">
            Manage and execute your workflows
          </Text>
        </div>

        {/* Filters */}
        <Card withBorder padding="lg" radius="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                leftSection={<IconSearch size={16} />}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workflows..."
                value={searchQuery}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                leftSection={<IconFilter size={16} />}
                onChange={(value) => setSelectedCategory(value || 'all')}
                placeholder="Filter by category"
                data={[
                  { label: 'All Categories', value: 'all' },
                  ...categories.map((cat) => ({ label: cat, value: cat })),
                ]}
                value={selectedCategory}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                leftSection={<IconFilter size={16} />}
                onChange={(value) => setSelectedTag(value || 'all')}
                placeholder="Filter by tag"
                data={[
                  { label: 'All Tags', value: 'all' },
                  ...tags.map((tag) => ({ label: tag, value: tag })),
                ]}
                value={selectedTag}
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Results Summary */}
        <Group justify="space-between">
          <Text c="dimmed" size="sm">
            Showing {filteredWorkflows.length} of {workflows.length} workflows
          </Text>
          <Button loading={loading} onClick={loadWorkflows} size="sm" variant="light">
            Refresh
          </Button>
        </Group>

        {/* Workflows Display */}
        <Tabs onChange={setActiveTab} value={activeTab}>
          <Tabs.List>
            <Tabs.Tab value="grid">Grid View</Tabs.Tab>
            <Tabs.Tab value="list">List View</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel pt="lg" value="grid">
            {loading ? (
              <Card withBorder padding="lg" radius="md">
                <Text c="dimmed" ta="center">
                  Loading workflows...
                </Text>
              </Card>
            ) : filteredWorkflows.length === 0 ? (
              <Card withBorder padding="lg" radius="md">
                <Text c="dimmed" ta="center">
                  {workflows.length === 0
                    ? 'No workflows found. Create some workflows in the /workflows directory.'
                    : 'No workflows match your current filters.'}
                </Text>
              </Card>
            ) : (
              <Grid>
                {filteredWorkflows.map((workflow) => (
                  <Grid.Col key={workflow.id} span={{ base: 12, lg: 4, md: 6 }}>
                    <WorkflowCard workflow={workflow} />
                  </Grid.Col>
                ))}
              </Grid>
            )}
          </Tabs.Panel>

          <Tabs.Panel pt="lg" value="list">
            {loading ? (
              <Card withBorder padding="lg" radius="md">
                <Text c="dimmed" ta="center">
                  Loading workflows...
                </Text>
              </Card>
            ) : filteredWorkflows.length === 0 ? (
              <Card withBorder padding="lg" radius="md">
                <Text c="dimmed" ta="center">
                  {workflows.length === 0
                    ? 'No workflows found. Create some workflows in the /workflows directory.'
                    : 'No workflows match your current filters.'}
                </Text>
              </Card>
            ) : (
              <Stack gap="md">
                {filteredWorkflows.map((workflow) => (
                  <WorkflowListItem key={workflow.id} workflow={workflow} />
                ))}
              </Stack>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
