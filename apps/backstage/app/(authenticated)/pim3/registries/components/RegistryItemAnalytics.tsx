'use client';

import {
  Badge,
  Card,
  Center,
  Group,
  Loader,
  Progress,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { IconPackage, IconShoppingCart, IconStar, IconTrendingUp } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { formatCurrency, showErrorNotification } from '../../utils/pim-helpers';
import { getRegistryItemAnalytics } from '../actions';

interface RegistryItemAnalyticsProps {
  registryId?: string; // If provided, shows analytics for specific registry
}

interface AnalyticsData {
  conversionRate: number;
  itemsByPriority: { priority: number; count: number }[];
  purchaseActivity: {
    month: string;
    purchases: number;
    totalQuantity: number;
    averagePrice: number;
  }[];
  purchasedItems: number;
  topCollections: {
    collectionId: string | null;
    collectionName: string;
    collectionType?: string;
    timesAdded: number;
  }[];
  topProducts: {
    productId: string | null;
    productName: string;
    productSku?: string;
    productPrice?: number | null;
    timesAdded: number;
  }[];
  totalItems: number;
}

/**
 * RegistryItemAnalytics component for detailed item analytics
 */
export function RegistryItemAnalytics({ registryId }: RegistryItemAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const result = await getRegistryItemAnalytics(registryId);
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
  }, [registryId]);

  if (loading) {
    return (
      <Center h={200}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!analytics) {
    return (
      <Text c="dimmed" py="xl" ta="center">
        No analytics data available
      </Text>
    );
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'red';
    if (priority >= 6) return 'orange';
    if (priority >= 4) return 'yellow';
    if (priority >= 2) return 'blue';
    return 'gray';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 8) return 'Very High';
    if (priority >= 6) return 'High';
    if (priority >= 4) return 'Medium';
    if (priority >= 2) return 'Low';
    return 'Very Low';
  };

  return (
    <Stack gap="lg">
      {/* Overview Stats */}
      <Card withBorder p="md" radius="md">
        <Title order={4} mb="md">
          {registryId ? 'Registry Item Analytics' : 'Global Item Analytics'}
        </Title>
        <Group grow>
          <div>
            <Text c="blue" fw={700} size="xl">
              {analytics.totalItems}
            </Text>
            <Text c="dimmed" size="xs">
              Total Items
            </Text>
          </div>
          <div>
            <Text c="green" fw={700} size="xl">
              {analytics.purchasedItems}
            </Text>
            <Text c="dimmed" size="xs">
              Purchased
            </Text>
          </div>
          <div>
            <Text c="orange" fw={700} size="xl">
              {analytics.conversionRate.toFixed(1)}%
            </Text>
            <Text c="dimmed" size="xs">
              Conversion Rate
            </Text>
          </div>
          <div>
            <Text c="purple" fw={700} size="xl">
              {analytics.totalItems - analytics.purchasedItems}
            </Text>
            <Text c="dimmed" size="xs">
              Pending
            </Text>
          </div>
        </Group>

        {/* Conversion Progress */}
        <div style={{ marginTop: '1rem' }}>
          <Group justify="space-between" mb="xs">
            <Text fw={500} size="sm">
              Overall Progress
            </Text>
            <Text c="dimmed" size="sm">
              {analytics.conversionRate.toFixed(1)}%
            </Text>
          </Group>
          <Progress
            color={
              analytics.conversionRate >= 80
                ? 'green'
                : analytics.conversionRate >= 60
                  ? 'orange'
                  : 'red'
            }
            radius="md"
            size="lg"
            value={analytics.conversionRate}
          />
        </div>
      </Card>

      {/* Priority Distribution */}
      <Card withBorder p="md" radius="md">
        <Group gap="md" mb="md">
          <IconStar size={20} />
          <Title order={5}>Priority Distribution</Title>
        </Group>
        <Stack gap="md">
          {analytics.itemsByPriority
            .sort((a, b) => b.priority - a.priority)
            .map((item) => {
              const percentage =
                analytics.totalItems > 0 ? (item.count / analytics.totalItems) * 100 : 0;

              return (
                <div key={item.priority}>
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      <Badge color={getPriorityColor(item.priority)} size="sm">
                        Priority {item.priority}
                      </Badge>
                      <Text c="dimmed" size="sm">
                        ({getPriorityLabel(item.priority)})
                      </Text>
                    </Group>
                    <Text fw={500} size="sm">
                      {item.count} items ({percentage.toFixed(1)}%)
                    </Text>
                  </Group>
                  <Progress
                    color={getPriorityColor(item.priority)}
                    radius="md"
                    size="sm"
                    value={percentage}
                  />
                </div>
              );
            })}
        </Stack>
      </Card>

      <Group grow align="flex-start">
        {/* Top Products */}
        <Card withBorder p="md" radius="md">
          <Group gap="md" mb="md">
            <IconPackage size={20} />
            <Title order={5}>Most Popular Products</Title>
          </Group>

          {analytics.topProducts.length > 0 ? (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Product</Table.Th>
                  <Table.Th>Added</Table.Th>
                  <Table.Th>Price</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {analytics.topProducts.slice(0, 5).map((product, index) => (
                  <Table.Tr key={product.productId || index}>
                    <Table.Td>
                      <div>
                        <Text fw={500} size="sm">
                          {product.productName}
                        </Text>
                        {product.productSku && (
                          <Text c="dimmed" size="xs">
                            SKU: {product.productSku}
                          </Text>
                        )}
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="blue" variant="light">
                        {product.timesAdded}x
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {product.productPrice ? (
                        <Text c="green" fw={500} size="sm">
                          {formatCurrency(product.productPrice)}
                        </Text>
                      ) : (
                        <Text c="dimmed" size="sm">
                          N/A
                        </Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <Text c="dimmed" py="md" size="sm" ta="center">
              No product data available
            </Text>
          )}
        </Card>

        {/* Top Collections */}
        <Card withBorder p="md" radius="md">
          <Group gap="md" mb="md">
            <IconShoppingCart size={20} />
            <Title order={5}>Most Popular Collections</Title>
          </Group>

          {analytics.topCollections.length > 0 ? (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Collection</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Added</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {analytics.topCollections.slice(0, 5).map((collection, index) => (
                  <Table.Tr key={collection.collectionId || index}>
                    <Table.Td>
                      <Text fw={500} size="sm">
                        {collection.collectionName}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="orange" size="xs" variant="light">
                        {collection.collectionType || 'Unknown'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="blue" variant="light">
                        {collection.timesAdded}x
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <Text c="dimmed" py="md" size="sm" ta="center">
              No collection data available
            </Text>
          )}
        </Card>
      </Group>

      {/* Purchase Activity */}
      {analytics.purchaseActivity.length > 0 && (
        <Card withBorder p="md" radius="md">
          <Group gap="md" mb="md">
            <IconTrendingUp size={20} />
            <Title order={5}>Purchase Activity (Last 12 Months)</Title>
          </Group>

          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Month</Table.Th>
                <Table.Th>Purchases</Table.Th>
                <Table.Th>Total Items</Table.Th>
                <Table.Th>Avg. Price</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {analytics.purchaseActivity
                .sort((a, b) => b.month.localeCompare(a.month))
                .slice(0, 6)
                .map((activity) => (
                  <Table.Tr key={activity.month}>
                    <Table.Td>
                      <Text fw={500} size="sm">
                        {new Date(activity.month + '-01').toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="blue" variant="light">
                        {activity.purchases}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500} size="sm">
                        {activity.totalQuantity}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {activity.averagePrice > 0 ? (
                        <Text c="green" fw={500} size="sm">
                          {formatCurrency(activity.averagePrice)}
                        </Text>
                      ) : (
                        <Text c="dimmed" size="sm">
                          N/A
                        </Text>
                      )}
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
