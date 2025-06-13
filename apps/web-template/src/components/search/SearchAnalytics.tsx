'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Group,
  Text,
  Badge,
  Progress,
  Stack,
  ThemeIcon,
  SimpleGrid,
  RingProgress,
  Center,
  Paper,
  Title,
  ActionIcon,
  Tooltip,
  Table,
  ScrollArea,
  NumberFormatter,
  Tabs,
} from '@mantine/core';
import {
  IconSearch,
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconClock,
  IconTarget,
  IconEye,
  IconClick,
  IconRefresh,
  IconDownload,
  IconFilter,
  IconChartBar,
  IconPercentage,
} from '@tabler/icons-react';

// Mock analytics data - replace with real Algolia Analytics API
const mockAnalyticsData = {
  overview: {
    totalSearches: 125840,
    totalClicks: 89320,
    clickThroughRate: 71.2,
    averageClickPosition: 2.4,
    noResultsRate: 8.3,
    conversionRate: 12.7,
    averageSessionDuration: 245,
    popularityTrend: 15.2,
  },
  topQueries: [
    { query: 'wireless headphones', searches: 15420, ctr: 78.5, conversion: 15.2 },
    { query: 'smartphone', searches: 12850, ctr: 72.1, conversion: 18.7 },
    { query: 'laptop', searches: 11320, ctr: 69.8, conversion: 22.4 },
    { query: 'running shoes', searches: 9840, ctr: 81.2, conversion: 14.8 },
    { query: 'coffee maker', searches: 8750, ctr: 75.6, conversion: 19.3 },
  ],
  noResultQueries: [
    { query: 'vintage typewriter', searches: 420, trend: 'up' },
    { query: 'holographic display', searches: 380, trend: 'down' },
    { query: 'quantum computer', searches: 310, trend: 'up' },
    { query: 'flying car', searches: 280, trend: 'stable' },
    { query: 'time machine', searches: 150, trend: 'down' },
  ],
  facetUsage: [
    { facet: 'Brand', usage: 89.2, popularValues: ['Apple', 'Samsung', 'Sony'] },
    { facet: 'Price Range', usage: 76.8, popularValues: ['$0-$100', '$100-$500'] },
    { facet: 'Category', usage: 68.4, popularValues: ['Electronics', 'Fashion'] },
    { facet: 'Rating', usage: 54.7, popularValues: ['4+ stars', '5 stars'] },
    { facet: 'Free Shipping', usage: 42.1, popularValues: ['Yes'] },
  ],
  timeSeriesData: {
    searches: [120, 135, 148, 162, 158, 174, 189, 195, 201, 188, 176, 164],
    clicks: [85, 92, 104, 118, 115, 128, 142, 148, 153, 141, 132, 125],
    conversions: [12, 14, 16, 19, 18, 21, 24, 26, 28, 25, 23, 21],
  },
};

// Stat card component
function StatCard({
  title,
  value,
  change,
  icon,
  color = 'blue',
  format = 'number',
}: {
  title: string;
  value: number;
  change?: number;
  icon: React.ReactNode;
  color?: string;
  format?: 'number' | 'percentage' | 'duration';
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${val}%`;
      case 'duration':
        return `${val}s`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <Card padding="lg" radius="sm" withBorder={true}>
      <Group justify="space-between">
        <div>
          <Text c="dimmed" size="md" fw={500}>
            {title}
          </Text>
          <Text fw={700} size="xl" mt={4}>
            {formatValue(value)}
          </Text>
          {change !== undefined && (
            <Group gap={4} mt="xs">
              <ThemeIcon size="md" variant="light" color={change >= 0 ? 'green' : 'red'}>
                {change >= 0 ? <IconTrendingUp size={12} /> : <IconTrendingDown size={12} />}
              </ThemeIcon>
              <Text size="xs" c={change >= 0 ? 'green' : 'red'} fw={500}>
                {change >= 0 ? '+' : ''}
                {change}%
              </Text>
            </Group>
          )}
        </div>
        <ThemeIcon size={60} variant="light" color={color}>
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );
}

// Query performance table
function QueryPerformanceTable({ queries }: { queries: any[] }) {
  const rows = queries.map((query, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Text fw={500} size="md">
          {query.query}
        </Text>
      </Table.Td>
      <Table.Td>
        <NumberFormatter value={query.searches} thousandSeparator />
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Text size="md">{query.ctr}%</Text>
          <Progress
            value={query.ctr}
            size="xs"
            radius="xl"
            color={query.ctr > 70 ? 'green' : query.ctr > 50 ? 'yellow' : 'red'}
            style={{ width: 60 }}
          />
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge
          size="md"
          variant="light"
          color={query.conversion > 20 ? 'green' : query.conversion > 15 ? 'blue' : 'orange'}
        >
          {query.conversion}%
        </Badge>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Query</Table.Th>
            <Table.Th>Searches</Table.Th>
            <Table.Th>CTR</Table.Th>
            <Table.Th>Conversion</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
}

// Facet usage component
function FacetUsageAnalysis({ facets }: { facets: any[] }) {
  return (
    <Stack gap="md">
      {facets.map((facet, index) => (
        <Paper key={index} p="md" radius="sm" withBorder={true}>
          <Group justify="space-between" mb="xs">
            <Text fw={500} size="md">
              {facet.facet}
            </Text>
            <Badge size="md" variant="light">
              {facet.usage}% usage
            </Badge>
          </Group>
          <Progress value={facet.usage} mb="xs" />
          <Group gap="xs">
            <Text size="xs" c="dimmed">
              Popular values:
            </Text>
            {facet.popularValues.map((value: string, i: number) => (
              <Badge key={i} size="xs" variant="dot">
                {value}
              </Badge>
            ))}
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}

// Main analytics dashboard
export default function SearchAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1000);
  };

  const { overview } = mockAnalyticsData;

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Title order={2}>Search Analytics</Title>
          <Text c="dimmed" size="md">
            Monitor search performance and user behavior insights
          </Text>
        </div>
        <Group gap="md">
          <Tooltip label="Refresh data">
            <ActionIcon variant="light" size="lg" onClick={handleRefresh} loading={isLoading}>
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Export data">
            <ActionIcon variant="light" size="lg">
              <IconDownload size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Overview Stats */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        <StatCard
          title="Total Searches"
          value={overview.totalSearches}
          change={overview.popularityTrend}
          icon={<IconSearch size={24} />}
          color="blue"
        />
        <StatCard
          title="Click-Through Rate"
          value={overview.clickThroughRate}
          change={4.2}
          icon={<IconClick size={24} />}
          color="green"
          format="percentage"
        />
        <StatCard
          title="Conversion Rate"
          value={overview.conversionRate}
          change={2.8}
          icon={<IconTarget size={24} />}
          color="orange"
          format="percentage"
        />
        <StatCard
          title="Avg. Session Duration"
          value={overview.averageSessionDuration}
          change={-3.1}
          icon={<IconClock size={24} />}
          color="purple"
          format="duration"
        />
      </SimpleGrid>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="performance" variant="outline">
        <Tabs.List>
          <Tabs.Tab value="performance" leftSection={<IconChartBar size={16} />}>
            Query Performance
          </Tabs.Tab>
          <Tabs.Tab value="facets" leftSection={<IconFilter size={16} />}>
            Facet Usage
          </Tabs.Tab>
          <Tabs.Tab value="issues" leftSection={<IconTrendingDown size={16} />}>
            Search Issues
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="performance" pt="lg">
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            {/* Top Queries */}
            <Card padding="lg" radius="sm" withBorder={true}>
              <Group justify="space-between" mb="md">
                <Text fw={500} size="lg">
                  Top Performing Queries
                </Text>
                <Badge variant="light" color="blue">
                  Last 7 days
                </Badge>
              </Group>
              <QueryPerformanceTable queries={mockAnalyticsData.topQueries} />
            </Card>

            {/* Performance Metrics */}
            <Card padding="lg" radius="sm" withBorder={true}>
              <Text fw={500} size="lg" mb="md">
                Search Quality Metrics
              </Text>
              <Stack gap="lg">
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="md">Average Click Position</Text>
                    <Text size="md" fw={500}>
                      {overview.averageClickPosition}
                    </Text>
                  </Group>
                  <Progress value={(5 - overview.averageClickPosition) * 20} />
                  <Text size="xs" c="dimmed" mt={4}>
                    Lower is better (users find relevant results faster)
                  </Text>
                </div>

                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="md">No Results Rate</Text>
                    <Text size="md" fw={500} c="red">
                      {overview.noResultsRate}%
                    </Text>
                  </Group>
                  <Progress value={overview.noResultsRate} color="red" />
                  <Text size="xs" c="dimmed" mt={4}>
                    Percentage of searches returning no results
                  </Text>
                </div>

                <Center>
                  <RingProgress
                    size={120}
                    thickness={8}
                    sections={[{ value: overview.clickThroughRate, color: 'blue' }]}
                    label={
                      <Center>
                        <div style={{ textAlign: 'center' }}>
                          <Text size="xs" c="dimmed">
                            CTR
                          </Text>
                          <Text fw={700}>{overview.clickThroughRate}%</Text>
                        </div>
                      </Center>
                    }
                  />
                </Center>
              </Stack>
            </Card>
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="facets" pt="lg">
          <Card padding="lg" radius="sm" withBorder={true}>
            <Group justify="space-between" mb="md">
              <Text fw={500} size="lg">
                Facet Usage Analysis
              </Text>
              <Text size="md" c="dimmed">
                How users interact with search filters
              </Text>
            </Group>
            <FacetUsageAnalysis facets={mockAnalyticsData.facetUsage} />
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="issues" pt="lg">
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            {/* No Results Queries */}
            <Card padding="lg" radius="sm" withBorder={true}>
              <Group justify="space-between" mb="md">
                <Text fw={500} size="lg">
                  No Results Queries
                </Text>
                <Badge variant="light" color="red">
                  Needs attention
                </Badge>
              </Group>
              <Stack gap="sm">
                {mockAnalyticsData.noResultQueries.map((query, index) => (
                  <Paper key={index} p="sm" radius="sm" withBorder={true}>
                    <Group justify="space-between">
                      <div>
                        <Text size="md" fw={500}>
                          {query.query}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {query.searches} searches
                        </Text>
                      </div>
                      <ThemeIcon
                        size="md"
                        variant="light"
                        color={
                          query.trend === 'up' ? 'red' : query.trend === 'down' ? 'green' : 'gray'
                        }
                      >
                        {query.trend === 'up' ? (
                          <IconTrendingUp size={12} />
                        ) : query.trend === 'down' ? (
                          <IconTrendingDown size={12} />
                        ) : (
                          <IconPercentage size={12} />
                        )}
                      </ThemeIcon>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </Card>

            {/* Recommendations */}
            <Card padding="lg" radius="sm" withBorder={true}>
              <Text fw={500} size="lg" mb="md">
                Optimization Recommendations
              </Text>
              <Stack gap="md">
                <Paper p="md" radius="sm" bg="blue.0">
                  <Group gap="md">
                    <ThemeIcon size="lg" variant="light" color="blue">
                      <IconTarget size={20} />
                    </ThemeIcon>
                    <div>
                      <Text size="md" fw={500}>
                        Improve No-Results Rate
                      </Text>
                      <Text size="xs" c="dimmed">
                        Add synonyms for "vintage typewriter" and related terms
                      </Text>
                    </div>
                  </Group>
                </Paper>

                <Paper p="md" radius="sm" bg="green.0">
                  <Group gap="md">
                    <ThemeIcon size="lg" variant="light" color="green">
                      <IconTrendingUp size={20} />
                    </ThemeIcon>
                    <div>
                      <Text size="md" fw={500}>
                        Boost Popular Categories
                      </Text>
                      <Text size="xs" c="dimmed">
                        Electronics queries convert 22% higher than average
                      </Text>
                    </div>
                  </Group>
                </Paper>

                <Paper p="md" radius="sm" bg="orange.0">
                  <Group gap="md">
                    <ThemeIcon size="lg" variant="light" color="orange">
                      <IconFilter size={20} />
                    </ThemeIcon>
                    <div>
                      <Text size="md" fw={500}>
                        Optimize Facet Order
                      </Text>
                      <Text size="xs" c="dimmed">
                        Brand filter is used 89% of the time - move to top
                      </Text>
                    </div>
                  </Group>
                </Paper>
              </Stack>
            </Card>
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
