'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  rem,
  Stack,
  Text,
  Tooltip,
  Tree,
  type TreeNodeData,
} from '@mantine/core';
import { IconEdit, IconEye, IconPlus, IconUsers } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';

import { getProductHierarchy } from '../actions';
import { formatCurrency, getStatusColor, showErrorNotification } from '../utils/pim-helpers';

import type { Product } from '@repo/database/prisma';

interface ProductHierarchyViewProps {
  onAddChild?: (parentId: string) => void;
  onEdit?: (product: Product) => void;
  onView?: (product: Product) => void;
  productId: string;
}

interface ProductWithHierarchy extends Product {
  children?: Product[];
}

/**
 * ProductHierarchyView component for displaying and managing product hierarchies
 * Shows parent products with their child variants in a tree structure
 */
export function ProductHierarchyView({
  onAddChild,
  onEdit,
  onView,
  productId,
}: ProductHierarchyViewProps) {
  const [hierarchyData, setHierarchyData] = useState<ProductWithHierarchy | null>(null);
  const [loading, setLoading] = useState(true);

  const loadHierarchy = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getProductHierarchy(productId);
      if (result.success && result.data) {
        setHierarchyData(result.data);
      } else {
        showErrorNotification(result.error || 'Failed to load product hierarchy');
      }
    } catch (error) {
      showErrorNotification('Failed to load product hierarchy');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadHierarchy();
  }, [loadHierarchy]);

  const buildTreeData = (product: ProductWithHierarchy): TreeNodeData[] => {
    const parentNode: TreeNodeData = {
      children:
        product.children?.map((child) => ({
          label: (
            <Card withBorder mb="xs" ml="md" p="sm">
              <Group justify="space-between">
                <div>
                  <Group gap="xs">
                    <Text fw={500} size="sm">
                      {child.name}
                    </Text>
                    <Badge color="orange" size="xs" variant="light">
                      Variant
                    </Badge>
                    <Badge color={getStatusColor(child.status)} size="xs" variant="light">
                      {child.status}
                    </Badge>
                    {child.aiGenerated && (
                      <Badge color="violet" size="xs" variant="light">
                        AI
                      </Badge>
                    )}
                  </Group>
                  <Text c="dimmed" size="xs">
                    SKU: {child.sku} | Type: {child.type}
                  </Text>
                  <Text c="dimmed" size="xs">
                    {formatCurrency(child.price, child.currency)}
                  </Text>
                </div>
                <Group gap="xs">
                  <ActionIcon
                    color="gray"
                    onClick={() => onView?.(child)}
                    size="sm"
                    variant="subtle"
                  >
                    <IconEye style={{ width: rem(14), height: rem(14) }} />
                  </ActionIcon>
                  <ActionIcon
                    color="blue"
                    onClick={() => onEdit?.(child)}
                    size="sm"
                    variant="subtle"
                  >
                    <IconEdit style={{ width: rem(14), height: rem(14) }} />
                  </ActionIcon>
                </Group>
              </Group>
            </Card>
          ),
          value: child.id,
        })) || [],
      label: (
        <Card withBorder mb="xs" p="sm">
          <Group justify="space-between">
            <div>
              <Group gap="xs">
                <Text fw={600} size="sm">
                  {product.name}
                </Text>
                <Badge color="blue" size="xs" variant="light">
                  Parent
                </Badge>
                <Badge color={getStatusColor(product.status)} size="xs" variant="light">
                  {product.status}
                </Badge>
                {product.aiGenerated && (
                  <Badge color="violet" size="xs" variant="light">
                    AI
                  </Badge>
                )}
              </Group>
              <Text c="dimmed" size="xs">
                SKU: {product.sku} | Type: {product.type}
              </Text>
              <Text c="dimmed" size="xs">
                {formatCurrency(product.price, product.currency)}
              </Text>
            </div>
            <Group gap="xs">
              <ActionIcon color="gray" onClick={() => onView?.(product)} size="sm" variant="subtle">
                <IconEye style={{ width: rem(14), height: rem(14) }} />
              </ActionIcon>
              <ActionIcon color="blue" onClick={() => onEdit?.(product)} size="sm" variant="subtle">
                <IconEdit style={{ width: rem(14), height: rem(14) }} />
              </ActionIcon>
              <Tooltip label="Add variant">
                <ActionIcon
                  color="green"
                  onClick={() => onAddChild?.(product.id)}
                  size="sm"
                  variant="subtle"
                >
                  <IconPlus style={{ width: rem(14), height: rem(14) }} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Card>
      ),
      value: product.id,
    };

    return [parentNode];
  };

  if (loading) {
    return (
      <Card withBorder p="md">
        <Text>Loading hierarchy...</Text>
      </Card>
    );
  }

  if (!hierarchyData) {
    return (
      <Card withBorder p="md">
        <Text c="dimmed">No hierarchy data available</Text>
      </Card>
    );
  }

  const treeData = buildTreeData(hierarchyData);

  return (
    <Stack>
      <Group justify="space-between">
        <Group gap="xs">
          <IconUsers size={20} />
          <Text fw={600} size="lg">
            Product Hierarchy
          </Text>
          <Badge color="blue" variant="light">
            {hierarchyData.children?.length || 0} variants
          </Badge>
        </Group>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => onAddChild?.(hierarchyData.id)}
          size="sm"
          variant="light"
        >
          Add Variant
        </Button>
      </Group>

      <Tree data={treeData} expandedByDefault levelOffset={30} />

      {/* Hierarchy Statistics */}
      <Card withBorder p="sm">
        <Group justify="space-between">
          <Text c="dimmed" size="sm">
            Hierarchy Statistics
          </Text>
          <Group gap="lg">
            <div>
              <Text c="dimmed" size="xs">
                Total Products
              </Text>
              <Text fw={600} size="sm">
                {1 + (hierarchyData.children?.length || 0)}
              </Text>
            </div>
            <div>
              <Text c="dimmed" size="xs">
                Active Variants
              </Text>
              <Text c="green" fw={600} size="sm">
                {hierarchyData.children?.filter((child) => child.status === 'ACTIVE').length || 0}
              </Text>
            </div>
            <div>
              <Text c="dimmed" size="xs">
                Total Value
              </Text>
              <Text fw={600} size="sm">
                {formatCurrency(
                  (hierarchyData.price || 0) +
                    (hierarchyData.children?.reduce((sum, child) => sum + (child.price || 0), 0) ||
                      0),
                  hierarchyData.currency,
                )}
              </Text>
            </div>
          </Group>
        </Group>
      </Card>
    </Stack>
  );
}
