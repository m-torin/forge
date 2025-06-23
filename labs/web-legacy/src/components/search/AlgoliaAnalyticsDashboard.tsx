'use client';

import React, { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Grid,
  Badge,
  Group,
  Button,
  Paper,
  Code,
  Alert,
  ThemeIcon,
  Tabs,
  Table,
  RingProgress,
  Select,
  SegmentedControl,
  ActionIcon,
  NumberFormatter,
} from '@mantine/core';
import {
  IconChartLine,
  IconSearch,
  IconClick,
  IconShoppingCart,
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconBrandAlgolia,
  IconCalendar,
  IconFilter,
  IconRefresh,
  IconDownload,
  IconTarget,
  IconClock,
  IconX,
} from '@tabler/icons-react';

// Types for Analytics Dashboard
interface SearchMetrics {
  totalSearches: number;
  totalClicks: number;
  totalConversions: number;
  clickThroughRate: number;
  conversionRate: number;
  averageClickPosition: number;
  noResultsRate: number;
  searchLatency: number;
}

interface PopularQuery {
  query: string;
  count: number;
  ctr: number;
  conversionRate: number;
  noResultsRate: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

interface SearchTrend {
  date: string;
  searches: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversionRate: number;
}

interface UserSegment {
  segment: string;
  users: number;
  searches: number;
  ctr: number;
  conversionRate: number;
  color: string;
}

// Mock analytics data
const mockMetrics: SearchMetrics = {
  totalSearches: 125430,
  totalClicks: 38291,
  totalConversions: 4563,
  clickThroughRate: 30.5,
  conversionRate: 3.64,
  averageClickPosition: 2.8,
  noResultsRate: 2.1,
  searchLatency: 45,
};

const mockPopularQueries: PopularQuery[] = [
  {
    query: 'wireless headphones',
    count: 8234,
    ctr: 45.2,
    conversionRate: 6.8,
    noResultsRate: 0.5,
    trend: 'up',
    trendPercentage: 12.3,
  },
  {
    query: 'laptop',
    count: 6891,
    ctr: 38.7,
    conversionRate: 4.2,
    noResultsRate: 1.2,
    trend: 'down',
    trendPercentage: -3.4,
  },
  {
    query: 'office chair',
    count: 5234,
    ctr: 42.1,
    conversionRate: 5.9,
    noResultsRate: 2.1,
    trend: 'up',
    trendPercentage: 8.7,
  },
  {
    query: 'smartphone',
    count: 4987,
    ctr: 35.4,
    conversionRate: 3.8,
    noResultsRate: 0.8,
    trend: 'stable',
    trendPercentage: 0.2,
  },
  {
    query: 'running shoes',
    count: 4123,
    ctr: 48.9,
    conversionRate: 7.2,
    noResultsRate: 1.8,
    trend: 'up',
    trendPercentage: 15.6,
  },
];

const mockSearchTrends: SearchTrend[] = [
  {
    date: '2024-01-01',
    searches: 4200,
    clicks: 1280,
    conversions: 152,
    ctr: 30.5,
    conversionRate: 3.6,
  },
  {
    date: '2024-01-02',
    searches: 4850,
    clicks: 1510,
    conversions: 180,
    ctr: 31.1,
    conversionRate: 3.7,
  },
  {
    date: '2024-01-03',
    searches: 5120,
    clicks: 1640,
    conversions: 195,
    ctr: 32.0,
    conversionRate: 3.8,
  },
  {
    date: '2024-01-04',
    searches: 4980,
    clicks: 1590,
    conversions: 188,
    ctr: 31.9,
    conversionRate: 3.8,
  },
  {
    date: '2024-01-05',
    searches: 5340,
    clicks: 1720,
    conversions: 210,
    ctr: 32.2,
    conversionRate: 3.9,
  },
  {
    date: '2024-01-06',
    searches: 5890,
    clicks: 1890,
    conversions: 238,
    ctr: 32.1,
    conversionRate: 4.0,
  },
  {
    date: '2024-01-07',
    searches: 6120,
    clicks: 1980,
    conversions: 255,
    ctr: 32.4,
    conversionRate: 4.2,
  },
];

const mockUserSegments: UserSegment[] = [
  {
    segment: 'Mobile Users',
    users: 45280,
    searches: 68430,
    ctr: 28.5,
    conversionRate: 2.8,
    color: 'blue',
  },
  {
    segment: 'Desktop Users',
    users: 28940,
    searches: 42100,
    ctr: 35.2,
    conversionRate: 4.9,
    color: 'green',
  },
  {
    segment: 'Tablet Users',
    users: 8340,
    searches: 14900,
    ctr: 32.1,
    conversionRate: 3.7,
    color: 'purple',
  },
  {
    segment: 'Returning Users',
    users: 32580,
    searches: 58920,
    ctr: 42.8,
    conversionRate: 6.2,
    color: 'orange',
  },
  {
    segment: 'New Users',
    users: 49980,
    searches: 66510,
    ctr: 22.3,
    conversionRate: 1.9,
    color: 'cyan',
  },
];

// Metrics overview cards
function MetricsOverview({ metrics, timeRange }: { metrics: SearchMetrics; timeRange: string }) {
  const metricCards = [
    {
      title: 'Total Searches',
      value: metrics.totalSearches,
      format: 'number',
      icon: IconSearch,
      color: 'blue',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Click-Through Rate',
      value: metrics.clickThroughRate,
      format: 'percentage',
      icon: IconClick,
      color: 'green',
      trend: '+2.1%',
      trendUp: true,
    },
    {
      title: 'Conversion Rate',
      value: metrics.conversionRate,
      format: 'percentage',
      icon: IconShoppingCart,
      color: 'orange',
      trend: '+0.8%',
      trendUp: true,
    },
    {
      title: 'Avg. Click Position',
      value: metrics.averageClickPosition,
      format: 'decimal',
      icon: IconTarget,
      color: 'purple',
      trend: '-0.3',
      trendUp: true,
    },
    {
      title: 'No Results Rate',
      value: metrics.noResultsRate,
      format: 'percentage',
      icon: IconX,
      color: 'red',
      trend: '-0.5%',
      trendUp: true,
    },
    {
      title: 'Search Latency',
      value: metrics.searchLatency,
      format: 'ms',
      icon: IconClock,
      color: 'cyan',
      trend: '-8ms',
      trendUp: true,
    },
  ];

  return (
    <Grid>
      {metricCards.map((metric) => {
        const Icon = metric.icon;
        return (
          <Grid.Col key={metric.title} span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
            <Card shadow="sm" padding="md" radius="sm" withBorder={true} h="100%">
              <Stack gap="xs">
                <Group justify="space-between">
                  <ThemeIcon size="md" variant="light" color={metric.color}>
                    <Icon size={16} />
                  </ThemeIcon>
                  <Badge size="xs" color={metric.trendUp ? 'green' : 'red'} variant="light">
                    {metric.trend}
                  </Badge>
                </Group>

                <div>
                  <Text size="xs" color="dimmed">
                    {metric.title}
                  </Text>
                  <Text size="xl" fw={700}>
                    {metric.format === 'number' && (
                      <NumberFormatter value={metric.value} thousandSeparator />
                    )}
                    {metric.format === 'percentage' && `${metric.value}%`}
                    {metric.format === 'decimal' && metric.value.toFixed(1)}
                    {metric.format === 'ms' && `${metric.value}ms`}
                  </Text>
                </div>
              </Stack>
            </Card>
          </Grid.Col>
        );
      })}
    </Grid>
  );
}

// Popular queries table
function PopularQueriesTable({ queries }: { queries: PopularQuery[] }) {
  return (
    <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
      <Group justify="space-between" mb="md">
        <Title order={4}>Popular Queries</Title>
        <Group>
          <Select
            size="xs"
            value="7d"
            data={[
              { value: '24h', label: 'Last 24h' },
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
            ]}
            style={{ width: 120 }}
          />
          <ActionIcon variant="light" size="md">
            <IconDownload size={14} />
          </ActionIcon>
        </Group>
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Query</Table.Th>
            <Table.Th>Searches</Table.Th>
            <Table.Th>CTR</Table.Th>
            <Table.Th>Conv. Rate</Table.Th>
            <Table.Th>No Results</Table.Th>
            <Table.Th>Trend</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {queries.map((query, index) => (
            <Table.Tr key={query.query}>
              <Table.Td>
                <Group gap="xs">
                  <Badge size="xs" color="gray">
                    {index + 1}
                  </Badge>
                  <Text fw={500}>{query.query}</Text>
                </Group>
              </Table.Td>
              <Table.Td>
                <NumberFormatter value={query.count} thousandSeparator />
              </Table.Td>
              <Table.Td>
                <Badge color="blue" variant="light">
                  {query.ctr.toFixed(1)}%
                </Badge>
              </Table.Td>
              <Table.Td>
                <Badge color="green" variant="light">
                  {query.conversionRate.toFixed(1)}%
                </Badge>
              </Table.Td>
              <Table.Td>
                <Badge color={query.noResultsRate > 5 ? 'red' : 'gray'} variant="light">
                  {query.noResultsRate.toFixed(1)}%
                </Badge>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  {query.trend === 'up' && <IconTrendingUp size={16} color="green" />}
                  {query.trend === 'down' && <IconTrendingDown size={16} color="red" />}
                  {query.trend === 'stable' && (
                    <Text size="xs" color="dimmed">
                      —
                    </Text>
                  )}
                  <Text
                    size="xs"
                    color={
                      query.trend === 'up' ? 'green' : query.trend === 'down' ? 'red' : 'dimmed'
                    }
                  >
                    {query.trend !== 'stable' &&
                      `${query.trendPercentage > 0 ? '+' : ''}${query.trendPercentage.toFixed(1)}%`}
                  </Text>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );
}

// Search trends chart
function SearchTrendsChart({ data }: { data: SearchTrend[] }) {
  const [metric, setMetric] = useState<'searches' | 'ctr' | 'conversionRate'>('searches');

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: metric === 'searches' ? d.searches : metric === 'ctr' ? d.ctr : d.conversionRate,
  }));

  return (
    <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
      <Group justify="space-between" mb="md">
        <Title order={4}>Search Trends</Title>
        <SegmentedControl
          size="xs"
          value={metric}
          onChange={(value) => setMetric(value as any)}
          data={[
            { label: 'Searches', value: 'searches' },
            { label: 'CTR', value: 'ctr' },
            { label: 'Conv. Rate', value: 'conversionRate' },
          ]}
        />
      </Group>

      <div
        style={{
          height: 300,
          padding: '20px',
          background: 'var(--mantine-color-gray-light)',
          borderRadius: 8,
        }}
      >
        <Stack gap="md" ta="center" justify="center" h="100%">
          <IconChartLine size={48} color="var(--mantine-color-blue-6)" />
          <div style={{ textAlign: 'center' }}>
            <Text fw={600} mb="xs">
              {metric === 'searches'
                ? 'Search Trends'
                : metric === 'ctr'
                  ? 'Click-Through Rate Trends'
                  : 'Conversion Rate Trends'}
            </Text>
            <Text size="md" color="dimmed">
              Chart visualization available with @mantine/charts
            </Text>
            <Text size="xs" color="dimmed" mt="xs">
              Install: npm install @mantine/charts recharts
            </Text>
          </div>
        </Stack>
      </div>
    </Card>
  );
}

// User segments overview
function UserSegmentsOverview({ segments }: { segments: UserSegment[] }) {
  const totalUsers = segments.reduce((sum, s) => sum + s.users, 0);
  const totalSearches = segments.reduce((sum, s) => sum + s.searches, 0);

  return (
    <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
      <Title order={4} mb="md">
        User Segments
      </Title>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="sm">
            {segments.map((segment) => (
              <Paper key={segment.segment} p="sm" withBorder={true}>
                <Group justify="space-between" mb="xs">
                  <Group gap="xs">
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: `var(--mantine-color-${segment.color}-6)`,
                      }}
                    />
                    <Text fw={600} size="md">
                      {segment.segment}
                    </Text>
                  </Group>
                  <Badge size="xs" color={segment.color}>
                    {((segment.users / totalUsers) * 100).toFixed(1)}%
                  </Badge>
                </Group>

                <Grid>
                  <Grid.Col span={6}>
                    <Text size="xs" color="dimmed">
                      Users
                    </Text>
                    <Text fw={600}>
                      <NumberFormatter value={segment.users} thousandSeparator />
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="xs" color="dimmed">
                      Searches
                    </Text>
                    <Text fw={600}>
                      <NumberFormatter value={segment.searches} thousandSeparator />
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="xs" color="dimmed">
                      CTR
                    </Text>
                    <Text fw={600} color="blue">
                      {segment.ctr.toFixed(1)}%
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="xs" color="dimmed">
                      Conv. Rate
                    </Text>
                    <Text fw={600} color="green">
                      {segment.conversionRate.toFixed(1)}%
                    </Text>
                  </Grid.Col>
                </Grid>
              </Paper>
            ))}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="md" ta="center">
            <RingProgress
              size={200}
              thickness={20}
              sections={segments.map((s) => ({
                value: (s.users / totalUsers) * 100,
                color: `${s.color}.6`,
                tooltip: `${s.segment}: ${((s.users / totalUsers) * 100).toFixed(1)}%`,
              }))}
              label={
                <div style={{ textAlign: 'center' }}>
                  <Text size="xl" fw={700}>
                    <NumberFormatter value={totalUsers} thousandSeparator />
                  </Text>
                  <Text size="md" color="dimmed">
                    Total Users
                  </Text>
                </div>
              }
            />

            <Paper p="sm" withBorder={true} style={{ width: '100%' }}>
              <Text size="md" fw={600} mb="xs">
                Segment Performance
              </Text>
              {segments
                .sort((a, b) => b.conversionRate - a.conversionRate)
                .slice(0, 3)
                .map((segment, index) => (
                  <Group key={segment.segment} justify="space-between" mb="xs">
                    <Group gap="xs">
                      <Badge size="xs" color="gray">
                        {index + 1}
                      </Badge>
                      <Text size="xs">{segment.segment}</Text>
                    </Group>
                    <Text size="xs" fw={600} color="green">
                      {segment.conversionRate.toFixed(1)}%
                    </Text>
                  </Group>
                ))}
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </Card>
  );
}

export default function AlgoliaAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  const refreshData = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Group gap="md" mb="md">
            <ThemeIcon size="xl" variant="light" color="blue">
              <IconChartLine />
            </ThemeIcon>
            <div>
              <Title order={1}>Analytics Dashboard</Title>
              <Text size="lg" color="dimmed">
                Monitor search performance and user behavior
              </Text>
            </div>
          </Group>
        </div>

        {/* Introduction */}
        <Alert icon={<IconBrandAlgolia />} title="Search Analytics Overview" color="blue">
          <Stack gap="xs">
            <Text size="md">Track key search metrics to optimize your search experience:</Text>
            <ul>
              <li>Monitor search volume, CTR, and conversion rates</li>
              <li>Identify popular queries and search trends</li>
              <li>Analyze user segments and behavior patterns</li>
              <li>Optimize for better search performance</li>
            </ul>
          </Stack>
        </Alert>

        {/* Controls */}
        <Group justify="space-between">
          <Group>
            <Select
              value={timeRange}
              onChange={(value) => setTimeRange(value || '7d')}
              data={[
                { value: '24h', label: 'Last 24 hours' },
                { value: '7d', label: 'Last 7 days' },
                { value: '30d', label: 'Last 30 days' },
                { value: '90d', label: 'Last 90 days' },
              ]}
              leftSection={<IconCalendar size={16} />}
            />
            <Button
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={refreshData}
              loading={refreshing}
            >
              Refresh
            </Button>
          </Group>
          <Group>
            <Button variant="light" leftSection={<IconDownload size={16} />}>
              Export Data
            </Button>
            <Button variant="light" leftSection={<IconFilter size={16} />}>
              Add Filter
            </Button>
          </Group>
        </Group>

        {/* Metrics Overview */}
        <MetricsOverview metrics={mockMetrics} timeRange={timeRange} />

        {/* Charts and Tables */}
        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<IconChartLine size={16} />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="queries" leftSection={<IconSearch size={16} />}>
              Popular Queries
            </Tabs.Tab>
            <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
              User Segments
            </Tabs.Tab>
            <Tabs.Tab value="implementation" leftSection={<IconBrandAlgolia size={16} />}>
              Implementation
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="xl">
            <Grid>
              <Grid.Col span={12}>
                <SearchTrendsChart data={mockSearchTrends} />
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="queries" pt="xl">
            <PopularQueriesTable queries={mockPopularQueries} />
          </Tabs.Panel>

          <Tabs.Panel value="users" pt="xl">
            <UserSegmentsOverview segments={mockUserSegments} />
          </Tabs.Panel>

          <Tabs.Panel value="implementation" pt="xl">
            <Stack gap="md">
              <Title order={3}>Implementation Guide</Title>

              <Code block>
                {`// 1. Set up Algolia Insights for tracking
import { insights } from '@algolia/insights';

insights('init', {
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  useCookie: true,
});

// 2. Track search events
insights('clickedObjectIDsAfterSearch', {
  index: 'products',
  eventName: 'Product Clicked',
  queryID: 'query-id-from-search-response',
  objectIDs: ['product-123'],
  positions: [1],
});

// 3. Track conversions
insights('convertedObjectIDsAfterSearch', {
  index: 'products',
  eventName: 'Product Purchased',
  queryID: 'query-id-from-search-response',
  objectIDs: ['product-123'],
});

// 4. Fetch analytics data
import { createAnalyticsClient } from '@algolia/client-analytics';

const analyticsClient = createAnalyticsClient({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
});

// Get popular searches
const popularSearches = await analyticsClient.getPopularSearches({
  index: 'products',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  limit: 10,
});

// Get search metrics
const searchMetrics = await analyticsClient.getSearchMetrics({
  index: 'products',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  granularity: 'daily',
});

// Get click analytics
const clickAnalytics = await analyticsClient.getClickAnalytics({
  index: 'products',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
});

// 5. React component with analytics
import { useSearchInsights } from '@algolia/react-instantsearch';

function ProductHit({ hit }) {
  const { sendEvent } = useSearchInsights();
  
  const handleClick = () => {
    sendEvent('click', hit, 'Product Clicked');
  };
  
  const handlePurchase = () => {
    sendEvent('conversion', hit, 'Product Purchased');
  };
  
  return (
    <div onClick={handleClick}>
      <h3>{hit.name}</h3>
      <button onClick={handlePurchase}>Buy Now</button>
    </div>
  );
}

// 6. Custom analytics dashboard
function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [queries, setQueries] = useState([]);
  
  useEffect(() => {
    // Fetch analytics data
    const fetchAnalytics = async () => {
      const [metricsData, queriesData] = await Promise.all([
        analyticsClient.getSearchMetrics({
          index: 'products',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        }),
        analyticsClient.getPopularSearches({
          index: 'products',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          limit: 20,
        }),
      ]);
      
      setMetrics(metricsData);
      setQueries(queriesData.searches);
    };
    
    fetchAnalytics();
  }, []);
  
  return (
    <div>
      {/* Render analytics dashboard */}
    </div>
  );
}`}
              </Code>

              <Alert icon={<IconTarget />} title="Analytics Best Practices" color="green">
                <ul>
                  <li>
                    <strong>Track all interactions:</strong> Clicks, searches, conversions for
                    complete insights
                  </li>
                  <li>
                    <strong>Segment users:</strong> Analyze behavior by device, location, user type
                  </li>
                  <li>
                    <strong>Monitor trends: </strong> Track performance over time to identify
                    patterns
                  </li>
                  <li>
                    <strong>Set up alerts:</strong> Get notified when metrics drop below thresholds
                  </li>
                  <li>
                    <strong>A/B test insights:</strong> Use analytics to validate search
                    optimizations
                  </li>
                </ul>
              </Alert>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
