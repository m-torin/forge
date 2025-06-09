'use client';

import {
  Badge,
  Card,
  Grid,
  Group,
  Paper,
  Progress,
  RingProgress,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconArrowUpRight,
  IconAsset,
  IconChartBar,
  IconDownload,
  IconEye,
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

interface AssetPerformance {
  conversionRate: number;
  downloads: number;
  filename: string;
  id: string;
  performance: number;
  productName: string;
  type: string;
  views: number;
}

interface AnalyticsData {
  assetPerformance: AssetPerformance[];
  overview: {
    totalViews: number;
    totalDownloads: number;
    avgPerformanceScore: number;
    topPerformingType: string;
  };
  trends: {
    viewsTrend: number;
    downloadsTrend: number;
    performanceTrend: number;
  };
  typeAnalytics: {
    type: string;
    count: number;
    avgViews: number;
    avgDownloads: number;
    performance: number;
  }[];
  usageByPage: {
    page: string;
    views: number;
    percentage: number;
  }[];
}

function StatCard({
  color,
  icon,
  title,
  trend,
  value,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <Card withBorder>
      <Group justify="space-between">
        <div>
          <Text c="dimmed" fw={500} size="sm">
            {title}
          </Text>
          <Group align="baseline" gap="xs">
            <Text fw={700} size="xl">
              {value}
            </Text>
            {trend && (
              <Group gap={4}>
                {trend.positive ? (
                  <IconTrendingUp color="green" size={16} />
                ) : (
                  <IconTrendingDown color="red" size={16} />
                )}
                <Text c={trend.positive ? 'green' : 'red'} fw={500} size="sm">
                  {Math.abs(trend.value)}%
                </Text>
              </Group>
            )}
          </Group>
        </div>
        <ThemeIcon color={color} size="lg" variant="light">
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );
}

function AssetTypeAnalytics({ data }: { data: AnalyticsData['typeAnalytics'] }) {
  const maxViews = Math.max(...data.map((item) => item.avgViews));

  return (
    <Card withBorder>
      <Stack gap="md">
        <Title order={4}>Performance by Asset Type</Title>
        <Stack gap="sm">
          {data.map((item) => (
            <div key={item.type}>
              <Group justify="space-between" mb={4}>
                <Group gap="sm">
                  <Text fw={500} size="sm">
                    {item.type}
                  </Text>
                  <Badge size="xs" variant="light">
                    {item.count} assets
                  </Badge>
                </Group>
                <Group gap="md">
                  <Text c="dimmed" size="xs">
                    {item.avgViews} avg views
                  </Text>
                  <Text c="dimmed" size="xs">
                    {item.performance}% score
                  </Text>
                </Group>
              </Group>
              <Progress
                color={item.performance > 80 ? 'green' : item.performance > 60 ? 'yellow' : 'red'}
                size="sm"
                value={(item.avgViews / maxViews) * 100}
              />
            </div>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}

function TopPerformingAssets({ data }: { data: AssetPerformance[] }) {
  return (
    <Card withBorder>
      <Stack gap="md">
        <Title order={4}>Top Performing Assets</Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Asset</Table.Th>
              <Table.Th>Views</Table.Th>
              <Table.Th>Downloads</Table.Th>
              <Table.Th>Performance</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.slice(0, 10).map((asset) => (
              <Table.Tr key={asset.id}>
                <Table.Td>
                  <div>
                    <Text fw={500} lineClamp={1} size="sm">
                      {asset.filename}
                    </Text>
                    <Text c="dimmed" size="xs">
                      {asset.productName}
                    </Text>
                  </div>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <IconEye color="gray" size={14} />
                    <Text size="sm">{asset.views.toLocaleString()}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <IconDownload color="gray" size={14} />
                    <Text size="sm">{asset.downloads.toLocaleString()}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Progress
                      color={
                        asset.performance > 80 ? 'green' : asset.performance > 60 ? 'yellow' : 'red'
                      }
                      size="sm"
                      value={asset.performance}
                      w={60}
                    />
                    <Text fw={500} size="sm">
                      {asset.performance}%
                    </Text>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Card>
  );
}

function UsageByPageChart({ data }: { data: AnalyticsData['usageByPage'] }) {
  const totalViews = data.reduce((sum, item) => sum + item.views, 0);

  return (
    <Card withBorder>
      <Stack gap="md">
        <Title order={4}>Usage by Page Type</Title>
        <Grid>
          <Grid.Col span={6}>
            <RingProgress
              sections={data.slice(0, 4).map((item, index) => ({
                color: ['blue', 'green', 'yellow', 'red'][index],
                tooltip: `${item.page}: ${item.views} views`,
                value: item.percentage,
              }))}
              label={
                <div style={{ textAlign: 'center' }}>
                  <Text c="dimmed" size="xs">
                    Total Views
                  </Text>
                  <Text fw={700} size="sm">
                    {totalViews.toLocaleString()}
                  </Text>
                </div>
              }
              size={120}
              thickness={8}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              {data.slice(0, 4).map((item, index) => (
                <Group key={item.page} justify="space-between">
                  <Group gap="xs">
                    <div
                      style={{
                        width: 12,
                        backgroundColor: [
                          'var(--mantine-color-blue-6)',
                          'var(--mantine-color-green-6)',
                          'var(--mantine-color-yellow-6)',
                          'var(--mantine-color-red-6)',
                        ][index],
                        borderRadius: 6,
                        height: 12,
                      }}
                    />
                    <Text size="sm">{item.page}</Text>
                  </Group>
                  <Text fw={500} size="sm">
                    {item.percentage.toFixed(1)}%
                  </Text>
                </Group>
              ))}
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Card>
  );
}

export function ProductAssetAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock analytics data - in real implementation, this would come from your analytics service
    setTimeout(() => {
      const mockData: AnalyticsData = {
        typeAnalytics: [
          { type: 'IMAGE', avgDownloads: 12, avgViews: 234, count: 342, performance: 85 },
          { type: 'VIDEO', avgDownloads: 23, avgViews: 456, count: 45, performance: 88 },
          { type: 'DOCUMENT', avgDownloads: 34, avgViews: 145, count: 123, performance: 72 },
          { type: 'MANUAL', avgDownloads: 67, avgViews: 203, count: 89, performance: 79 },
          { type: 'SPECIFICATION', avgDownloads: 45, avgViews: 167, count: 67, performance: 76 },
          { type: 'CERTIFICATE', avgDownloads: 56, avgViews: 98, count: 34, performance: 82 },
        ],
        assetPerformance: [
          {
            id: '1',
            filename: 'hero-product-001.jpg',
            type: 'IMAGE',
            conversionRate: 7.1,
            downloads: 89,
            performance: 92,
            productName: 'Premium Wireless Headphones',
            views: 1250,
          },
          {
            id: '2',
            filename: 'demo-video-001.mp4',
            type: 'VIDEO',
            conversionRate: 4.6,
            downloads: 45,
            performance: 88,
            productName: 'Smart Fitness Tracker',
            views: 980,
          },
          {
            id: '3',
            filename: 'manual-en.pdf',
            type: 'MANUAL',
            conversionRate: 31.0,
            downloads: 234,
            performance: 85,
            productName: 'Professional Camera',
            views: 756,
          },
          {
            id: '4',
            filename: 'certificate-ce.pdf',
            type: 'CERTIFICATE',
            conversionRate: 66.7,
            downloads: 156,
            performance: 82,
            productName: 'Smart Home Hub',
            views: 234,
          },
          {
            id: '5',
            filename: 'specs-technical.pdf',
            type: 'SPECIFICATION',
            conversionRate: 20.0,
            downloads: 89,
            performance: 79,
            productName: 'Industrial Sensor',
            views: 445,
          },
        ],
        overview: {
          avgPerformanceScore: 78,
          topPerformingType: 'IMAGE',
          totalDownloads: 3420,
          totalViews: 45670,
        },
        trends: {
          downloadsTrend: 8.3,
          performanceTrend: -2.1,
          viewsTrend: 12.5,
        },
        usageByPage: [
          { page: 'Product Detail', percentage: 40.7, views: 18567 },
          { page: 'Search Results', percentage: 30.0, views: 13678 },
          { page: 'Category Pages', percentage: 17.3, views: 7890 },
          { page: 'Homepage', percentage: 7.6, views: 3456 },
          { page: 'Other', percentage: 4.6, views: 2079 },
        ],
      };
      setAnalytics(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading || !analytics) {
    return (
      <Stack gap="lg">
        <Grid>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid.Col key={i} span={{ base: 12, md: 3, sm: 6 }}>
              <Card withBorder>
                <div style={{ height: 80 }} />
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      {/* Overview Stats */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 3, sm: 6 }}>
          <StatCard
            color="blue"
            icon={<IconEye size={20} />}
            title="Total Views"
            trend={{
              positive: analytics.trends.viewsTrend > 0,
              value: analytics.trends.viewsTrend,
            }}
            value={analytics.overview.totalViews.toLocaleString()}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 3, sm: 6 }}>
          <StatCard
            color="green"
            icon={<IconDownload size={20} />}
            title="Total Downloads"
            trend={{
              positive: analytics.trends.downloadsTrend > 0,
              value: analytics.trends.downloadsTrend,
            }}
            value={analytics.overview.totalDownloads.toLocaleString()}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 3, sm: 6 }}>
          <StatCard
            color="violet"
            icon={<IconChartBar size={20} />}
            title="Avg Performance"
            trend={{
              positive: analytics.trends.performanceTrend > 0,
              value: Math.abs(analytics.trends.performanceTrend),
            }}
            value={`${analytics.overview.avgPerformanceScore}%`}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 3, sm: 6 }}>
          <StatCard
            color="orange"
            icon={<IconAsset size={20} />}
            title="Top Type"
            value={analytics.overview.topPerformingType}
          />
        </Grid.Col>
      </Grid>

      {/* Charts and Analytics */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <TopPerformingAssets data={analytics.assetPerformance} />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            <UsageByPageChart data={analytics.usageByPage} />
          </Stack>
        </Grid.Col>
      </Grid>

      <AssetTypeAnalytics data={analytics.typeAnalytics} />

      {/* Additional Insights */}
      <Card withBorder>
        <Stack gap="md">
          <Title order={4}>Key Insights</Title>
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <Paper withBorder p="md">
              <Stack gap="xs">
                <Group gap="xs">
                  <IconTrendingUp color="green" size={16} />
                  <Text c="green" fw={500} size="sm">
                    High Engagement
                  </Text>
                </Group>
                <Text size="sm">
                  Video assets show 95% higher engagement rates compared to static images
                </Text>
              </Stack>
            </Paper>

            <Paper withBorder p="md">
              <Stack gap="xs">
                <Group gap="xs">
                  <IconArrowUpRight color="blue" size={16} />
                  <Text c="blue" fw={500} size="sm">
                    Optimization Opportunity
                  </Text>
                </Group>
                <Text size="sm">
                  34 image assets are larger than 5MB and could benefit from compression
                </Text>
              </Stack>
            </Paper>

            <Paper withBorder p="md">
              <Stack gap="xs">
                <Group gap="xs">
                  <IconEye color="violet" size={16} />
                  <Text c="violet" fw={500} size="sm">
                    Popular Content
                  </Text>
                </Group>
                <Text size="sm">
                  Product manuals have the highest download-to-view conversion rate at 31%
                </Text>
              </Stack>
            </Paper>

            <Paper withBorder p="md">
              <Stack gap="xs">
                <Group gap="xs">
                  <IconChartBar color="orange" size={16} />
                  <Text c="orange" fw={500} size="sm">
                    Performance Alert
                  </Text>
                </Group>
                <Text size="sm">
                  12 assets have performance scores below 60% and need attention
                </Text>
              </Stack>
            </Paper>
          </SimpleGrid>
        </Stack>
      </Card>
    </Stack>
  );
}
