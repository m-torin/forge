'use client';

import {
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDebouncedValue, useInterval } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconRefresh, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

// Types
interface WorkflowRegistryEntry {
  category: string;
  createdAt: string;
  description: string;
  enabled: boolean;
  id: string;
  name: string;
  tags: string[];
  updatedAt: string;
  version: string;
}

interface WorkflowStats {
  byCategory: Record<string, number>;
  categories: number;
  enabledWorkflows: number;
  popularTags: Array<{ tag: string; count: number }>;
  tags: number;
  totalWorkflows: number;
}

// Constants
const COLORS = {
  category: {
    ai: 'blue',
    analytics: 'indigo',
    catalog: 'violet',
    commerce: 'purple',
    compliance: 'red',
    compute: 'pink',
    content: 'grape',
    data: 'orange',
    ecommerce: 'teal',
    finance: 'green',
    integration: 'cyan',
    inventory: 'yellow',
    marketing: 'lime',
    media: 'blue',
    merchant: 'indigo',
    ml: 'violet',
    monitoring: 'purple',
    pricing: 'pink',
    search: 'grape',
    security: 'red',
    user: 'orange',
  },
} as const;

// Utility
const getColor = (type: keyof typeof COLORS, key: string) =>
  COLORS[type][key as keyof (typeof COLORS)[typeof type]] || 'gray';

// Custom hook for workflow data
const useWorkflowsData = () => {
  const [state, setState] = useState({
    workflows: [] as WorkflowRegistryEntry[],
    stats: null as WorkflowStats | null,
    loading: true,
    lastUpdated: new Date(),
  });

  const fetchData = async () => {
    try {
      const response = await fetch('/api/workflows/registry');
      const data = await response.json();
      setState((prev) => ({
        ...prev,
        workflows: data.workflows,
        stats: data.stats,
        lastUpdated: new Date(),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
      !state.loading &&
        notifications.show({
          title: 'Update Failed',
          message: 'Failed to refresh workflow data',
          color: 'red',
        });
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const interval = useInterval(fetchData, 30000);

  useEffect(() => {
    fetchData();
    interval.start();
    return interval.stop;
  }, []);

  return { ...state, refetch: fetchData };
};

export default function WorkflowsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300);
  const { workflows, stats, loading, lastUpdated, refetch } = useWorkflowsData();

  // Memoized filtered data
  const filteredWorkflows = useMemo(() => {
    const query = debouncedSearchQuery.toLowerCase();
    return workflows.filter(
      (w) =>
        (!query ||
          w.name.toLowerCase().includes(query) ||
          w.description.toLowerCase().includes(query) ||
          w.tags.some((t) => t.toLowerCase().includes(query))) &&
        (!selectedCategory || w.category === selectedCategory) &&
        (!selectedTag || w.tags.includes(selectedTag)),
    );
  }, [workflows, debouncedSearchQuery, selectedCategory, selectedTag]);

  const { categoryOptions, tagOptions } = useMemo(
    () => ({
      categoryOptions: stats
        ? Object.keys(stats.byCategory).map((cat) => ({
            label: `${cat} (${stats.byCategory[cat]})`,
            value: cat,
          }))
        : [],
      tagOptions: stats
        ? stats.popularTags.slice(0, 20).map((tag) => ({
            label: `${tag.tag} (${tag.count})`,
            value: tag.tag,
          }))
        : [],
    }),
    [stats],
  );

  const handleWorkflowClick = (workflow: WorkflowRegistryEntry) =>
    router.push(`/workflows/${workflow.id}`);

  if (loading) {
    return (
      <Container py="xl" size="xl">
        <Text>Loading workflows...</Text>
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container py="xl" size="xl">
        <Text>Failed to load workflows data</Text>
      </Container>
    );
  }

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>All Workflows</Title>
          <Text c="dimmed" mt="md" size="lg">
            Browse and manage all {stats.totalWorkflows} available workflows
          </Text>
        </div>

        {/* Stats Overview */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card shadow="sm" withBorder={true} padding="lg">
              <Text fw={500} size="lg">
                Total Workflows
              </Text>
              <Title order={2}>{stats.totalWorkflows}</Title>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card shadow="sm" withBorder={true} padding="lg">
              <Text fw={500} size="lg">
                Enabled
              </Text>
              <Title order={2}>{stats.enabledWorkflows}</Title>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card shadow="sm" withBorder={true} padding="lg">
              <Text fw={500} size="lg">
                Categories
              </Text>
              <Title order={2}>{stats.categories}</Title>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card shadow="sm" withBorder={true} padding="lg">
              <Text fw={500} size="lg">
                Unique Tags
              </Text>
              <Title order={2}>{stats.tags}</Title>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Filters */}
        <Card shadow="sm" withBorder={true} padding="lg">
          <Stack gap="md">
            <Title order={3}>Filters</Title>
            <Grid>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  placeholder="Search workflows..."
                  leftSection={<IconSearch size={16} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Select
                  placeholder="Filter by category"
                  data={categoryOptions}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  clearable
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Select
                  placeholder="Filter by tag"
                  data={tagOptions}
                  value={selectedTag}
                  onChange={setSelectedTag}
                  clearable
                />
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>

        {/* Workflows Table */}
        <Card shadow="sm" withBorder={true} padding="lg">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>Workflows ({filteredWorkflows.length})</Title>
              <Group>
                <Text size="xs" c="dimmed">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </Text>
                <Badge variant="dot" color="green" size="sm">
                  Auto-refreshing
                </Badge>
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconRefresh size={14} />}
                  onClick={refetch}
                >
                  Refresh
                </Button>
              </Group>
            </Group>

            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Tags</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Version</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredWorkflows.map((workflow) => (
                  <Table.Tr
                    key={workflow.id}
                    onClick={() => handleWorkflowClick(workflow)}
                    style={{
                      cursor: 'pointer',
                      transition: 'background-color 0.1s ease',
                    }}
                  >
                    <Table.Td fw={500}>{workflow.name}</Table.Td>
                    <Table.Td>
                      <Badge color={getColor('category', workflow.category)} variant="light">
                        {workflow.category}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="md" c="dimmed" lineClamp={2}>
                        {workflow.description}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        {workflow.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} size="xs" variant="outline">
                            {tag}
                          </Badge>
                        ))}
                        {workflow.tags.length > 3 && (
                          <Badge size="xs" variant="outline">
                            +{workflow.tags.length - 3}
                          </Badge>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={workflow.enabled ? 'green' : 'gray'} variant="light">
                        {workflow.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="md" c="dimmed">
                        {workflow.version}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {filteredWorkflows.length === 0 && (
              <Text ta="center" c="dimmed" py="xl">
                No workflows found matching your criteria
              </Text>
            )}
          </Stack>
        </Card>

        {/* Popular Tags */}
        <Card shadow="sm" withBorder={true} padding="lg">
          <Stack gap="md">
            <Title order={3}>Popular Tags</Title>
            <Group gap="sm">
              {stats.popularTags.slice(0, 15).map((tag) => (
                <Badge
                  key={tag.tag}
                  variant={selectedTag === tag.tag ? 'filled' : 'light'}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedTag(selectedTag === tag.tag ? null : tag.tag)}
                >
                  {tag.tag} ({tag.count})
                </Badge>
              ))}
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
