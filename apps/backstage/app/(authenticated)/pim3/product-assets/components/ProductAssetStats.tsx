'use client';

import { Badge, Card, Grid, Group, Progress, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconAsset,
  IconCertificate,
  IconFileText,
  IconPhoto,
  IconTrendingUp,
  IconVideo,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { getAssetStats } from '../actions';

interface AssetStatsData {
  assetsByType: Record<string, number>;
  optimizationScore: number;
  recentUploads: number;
  storageUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  totalAssets: number;
  totalSize: number;
}

interface StatCardProps {
  color: string;
  description?: string;
  icon: React.ReactNode;
  title: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  value: string | number;
}

function StatCard({ color, description, icon, title, trend, value }: StatCardProps) {
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
              <Badge color={trend.positive ? 'green' : 'red'} size="sm" variant="light">
                {trend.positive ? '+' : ''}
                {trend.value}%
              </Badge>
            )}
          </Group>
          {description && (
            <Text c="dimmed" mt={4} size="xs">
              {description}
            </Text>
          )}
        </div>
        <ThemeIcon color={color} size="lg" variant="light">
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );
}

export function ProductAssetStats() {
  const [stats, setStats] = useState<AssetStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const result = await getAssetStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load asset stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading || !stats) {
    return (
      <Grid>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid.Col key={i} span={{ base: 12, md: 2, sm: 6 }}>
            <Card withBorder>
              <div style={{ height: 80 }} />
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    );
  }

  return (
    <Stack gap="lg">
      <Grid>
        <Grid.Col span={{ base: 12, md: 2, sm: 6 }}>
          <StatCard
            color="blue"
            icon={<IconAsset size={20} />}
            title="Total Assets"
            trend={{ positive: true, value: 12 }}
            value={stats.totalAssets.toLocaleString()}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 2, sm: 6 }}>
          <StatCard
            color="green"
            description="Product images"
            icon={<IconPhoto size={20} />}
            title="Images"
            value={stats.assetsByType.IMAGE || 0}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 2, sm: 6 }}>
          <StatCard
            color="violet"
            description="Product videos"
            icon={<IconVideo size={20} />}
            title="Videos"
            value={stats.assetsByType.VIDEO || 0}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 2, sm: 6 }}>
          <StatCard
            color="orange"
            description="Manuals & specs"
            icon={<IconFileText size={20} />}
            title="Documents"
            value={
              (stats.assetsByType.DOCUMENT || 0) +
              (stats.assetsByType.MANUAL || 0) +
              (stats.assetsByType.SPECIFICATION || 0)
            }
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 2, sm: 6 }}>
          <StatCard
            color="red"
            description="Quality certs"
            icon={<IconCertificate size={20} />}
            title="Certificates"
            value={stats.assetsByType.CERTIFICATE || 0}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 2, sm: 6 }}>
          <StatCard
            color="teal"
            description="Storage used"
            icon={<IconTrendingUp size={20} />}
            title="Total Size"
            value={formatFileSize(stats.totalSize)}
          />
        </Grid.Col>
      </Grid>

      {/* Storage Usage and Optimization Score */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text fw={500}>Storage Usage</Text>
                <Text c="dimmed" size="sm">
                  {formatFileSize(stats.storageUsage.used)} /{' '}
                  {formatFileSize(stats.storageUsage.total)}
                </Text>
              </Group>
              <Progress
                color={
                  stats.storageUsage.percentage > 80
                    ? 'red'
                    : stats.storageUsage.percentage > 60
                      ? 'yellow'
                      : 'blue'
                }
                size="lg"
                value={stats.storageUsage.percentage}
              />
              <Text c="dimmed" size="xs">
                {stats.storageUsage.percentage.toFixed(1)}% of total storage used
              </Text>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text fw={500}>Optimization Score</Text>
                <Badge
                  color={
                    stats.optimizationScore > 80
                      ? 'green'
                      : stats.optimizationScore > 60
                        ? 'yellow'
                        : 'red'
                  }
                  variant="light"
                >
                  {stats.optimizationScore}%
                </Badge>
              </Group>
              <Progress
                color={
                  stats.optimizationScore > 80
                    ? 'green'
                    : stats.optimizationScore > 60
                      ? 'yellow'
                      : 'red'
                }
                size="lg"
                value={stats.optimizationScore}
              />
              <Text c="dimmed" size="xs">
                Based on file sizes, formats, and metadata completeness
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
