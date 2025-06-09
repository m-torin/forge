'use client';

import {
  Badge,
  Card,
  Center,
  Group,
  Loader,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconCalendar,
  IconGift,
  IconHeart,
  IconShoppingBag,
  IconShoppingCart,
  IconTrendingUp,
  IconUsers,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { showErrorNotification } from '../../utils/pim-helpers';
import { getRegistryAnalytics } from '../actions';

import type { RegistryAnalytics } from '../actions';

/**
 * RegistryAnalyticsDashboard component showing registry insights and metrics
 */
export function RegistryAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<RegistryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const result = await getRegistryAnalytics();
        if (result.success && result.data) {
          setAnalytics(result.data);
        } else {
          showErrorNotification(result.error || 'Failed to load analytics');
        }
      } catch (error) {
        showErrorNotification('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <Center h={200}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!analytics) {
    return (
      <Center h={200}>
        <Text c="dimmed">Failed to load analytics data</Text>
      </Center>
    );
  }

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString();

  return (
    <Stack gap="lg">
      <Title order={3}>Registry Analytics</Title>

      {/* Key Metrics */}
      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        <Card shadow="sm" withBorder radius="md">
          <Group justify="space-between">
            <div>
              <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                Total Registries
              </Text>
              <Text fw={700} size="xl">
                {formatNumber(analytics.totalRegistries)}
              </Text>
            </div>
            <ThemeIcon color="blue" radius="md" size="lg">
              <IconGift size={18} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card shadow="sm" withBorder radius="md">
          <Group justify="space-between">
            <div>
              <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                Active Registries
              </Text>
              <Text fw={700} size="xl">
                {formatNumber(analytics.activeRegistries)}
              </Text>
              <Text c="dimmed" size="xs">
                {analytics.totalRegistries > 0 &&
                  formatPercentage((analytics.activeRegistries / analytics.totalRegistries) * 100)}
              </Text>
            </div>
            <ThemeIcon color="green" radius="md" size="lg">
              <IconTrendingUp size={18} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card shadow="sm" withBorder radius="md">
          <Group justify="space-between">
            <div>
              <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                Total Items
              </Text>
              <Text fw={700} size="xl">
                {formatNumber(analytics.totalItems)}
              </Text>
            </div>
            <ThemeIcon color="orange" radius="md" size="lg">
              <IconShoppingBag size={18} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card shadow="sm" withBorder radius="md">
          <Group justify="space-between">
            <div>
              <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                Conversion Rate
              </Text>
              <Text fw={700} size="xl">
                {formatPercentage(analytics.conversionRate)}
              </Text>
              <Text c="dimmed" size="xs">
                {formatNumber(analytics.purchasedItems)} / {formatNumber(analytics.totalItems)}
              </Text>
            </div>
            <ThemeIcon color="grape" radius="md" size="lg">
              <IconShoppingCart size={18} />
            </ThemeIcon>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Registry Types Distribution */}
      <Card shadow="sm" withBorder radius="md">
        <Title order={4} mb="md">
          Registry Types Distribution
        </Title>
        <SimpleGrid cols={{ base: 2, lg: 7, sm: 3 }}>
          {Object.entries(analytics.registriesByType).map(([type, count]) => (
            <div key={type}>
              <Group justify="space-between" mb={4}>
                <Text fw={500} size="sm">
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </Text>
                <Text fw={700} size="sm">
                  {count}
                </Text>
              </Group>
              <Progress
                color={
                  type === 'WISHLIST'
                    ? 'pink'
                    : type === 'GIFT'
                      ? 'blue'
                      : type === 'WEDDING'
                        ? 'grape'
                        : type === 'BABY'
                          ? 'cyan'
                          : type === 'BIRTHDAY'
                            ? 'orange'
                            : type === 'HOLIDAY'
                              ? 'green'
                              : 'gray'
                }
                size="sm"
                value={
                  analytics.totalRegistries > 0 ? (count / analytics.totalRegistries) * 100 : 0
                }
              />
            </div>
          ))}
        </SimpleGrid>
      </Card>

      {/* User Engagement Metrics */}
      <Card shadow="sm" withBorder radius="md">
        <Title order={4} mb="md">
          User Engagement
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <div>
            <Group gap="xs" mb={4}>
              <IconShoppingBag size={16} />
              <Text fw={500} size="sm">
                Avg Items per Registry
              </Text>
            </Group>
            <Text c="blue" fw={700} size="xl">
              {analytics.userEngagement.averageItemsPerRegistry.toFixed(1)}
            </Text>
          </div>

          <div>
            <Group gap="xs" mb={4}>
              <IconUsers size={16} />
              <Text fw={500} size="sm">
                Avg Registries per User
              </Text>
            </Group>
            <Text c="green" fw={700} size="xl">
              {analytics.userEngagement.averageRegistriesPerUser.toFixed(1)}
            </Text>
          </div>

          <div>
            <Group gap="xs" mb={4}>
              <IconHeart size={16} />
              <Text fw={500} size="sm">
                Public Registries
              </Text>
            </Group>
            <Text c="orange" fw={700} size="xl">
              {formatPercentage(analytics.userEngagement.publicRegistriesPercentage)}
            </Text>
          </div>
        </SimpleGrid>
      </Card>

      {/* Top Products */}
      {analytics.topProducts.length > 0 && (
        <Card shadow="sm" withBorder radius="md">
          <Title order={4} mb="md">
            Most Popular Products in Registries
          </Title>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Product</Table.Th>
                <Table.Th>Times Added</Table.Th>
                <Table.Th>Times Purchased</Table.Th>
                <Table.Th>Conversion Rate</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {analytics.topProducts.slice(0, 10).map((product) => (
                <Table.Tr key={product.productId}>
                  <Table.Td>
                    <Text fw={500}>{product.productName}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color="blue" variant="light">
                      {product.timesAdded}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color="green" variant="light">
                      {product.timesPurchased}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Progress
                        color={
                          product.conversionRate >= 50
                            ? 'green'
                            : product.conversionRate >= 25
                              ? 'orange'
                              : 'red'
                        }
                        style={{ flex: 1 }}
                        size="sm"
                        value={product.conversionRate}
                      />
                      <Text fw={500} size="xs">
                        {formatPercentage(product.conversionRate)}
                      </Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      {/* Monthly Activity */}
      {analytics.monthlyActivity.length > 0 && (
        <Card shadow="sm" withBorder radius="md">
          <Title order={4} mb="md">
            Monthly Registry Activity
          </Title>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Month</Table.Th>
                <Table.Th>Registries Created</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {analytics.monthlyActivity.slice(-6).map((month) => (
                <Table.Tr key={month.month}>
                  <Table.Td>
                    <Group gap="xs">
                      <IconCalendar size={14} />
                      <Text fw={500}>{month.month}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge color="blue" variant="light">
                      {month.registriesCreated}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}
    </Stack>
  );
}
