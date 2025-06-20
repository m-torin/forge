'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Menu,
  rem,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import {
  IconChevronRight,
  IconCopy,
  IconDots,
  IconEdit,
  IconEye,
  IconHierarchy,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { getTaxonomyTree } from '../taxonomies/actions';
import { getStatusColor, getTaxonomyTypeColor } from '@/utils/pim3/pim-helpers';

import type { Taxonomy, TaxonomyType } from '@repo/database/prisma';

interface HierarchicalTaxonomy extends Taxonomy {
  _count: {
    products: number;
    collections: number;
  };
  children?: HierarchicalTaxonomy[];
}

interface TaxonomyHierarchyViewProps {
  onAddChild: (parentTaxonomy: HierarchicalTaxonomy) => void;
  onDelete: (taxonomyId: string) => void;
  onDuplicate: (taxonomy: HierarchicalTaxonomy) => void;
  onEdit: (taxonomy: HierarchicalTaxonomy) => void;
  onView: (taxonomy: HierarchicalTaxonomy) => void;
  typeFilter?: TaxonomyType;
}

/**
 * Hierarchical tree view for taxonomies
 * Note: This component is ready for when the schema supports hierarchical relationships
 */
export function TaxonomyHierarchyView({
  typeFilter,
  onAddChild,
  onDelete,
  onDuplicate,
  onEdit,
  onView,
}: TaxonomyHierarchyViewProps) {
  const [taxonomies, setTaxonomies] = useState<HierarchicalTaxonomy[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTaxonomyTree();
  }, [typeFilter]);

  const loadTaxonomyTree = async () => {
    setLoading(true);
    try {
      const result = await getTaxonomyTree(typeFilter);
      if (result.success && result.data) {
        setTaxonomies(result.data as HierarchicalTaxonomy[]);
      }
    } catch (error) {
      console.error('Failed to load taxonomy tree:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (taxonomyId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(taxonomyId)) {
      newExpanded.delete(taxonomyId);
    } else {
      newExpanded.add(taxonomyId);
    }
    setExpandedItems(newExpanded);
  };

  const getTotalItems = (taxonomy: HierarchicalTaxonomy) => {
    return taxonomy._count.products + taxonomy._count.collections;
  };

  const renderTaxonomyNode = (taxonomy: HierarchicalTaxonomy, level = 0) => {
    const hasChildren = taxonomy.children && taxonomy.children.length > 0;
    const isExpanded = expandedItems.has(taxonomy.id);
    const totalItems = getTotalItems(taxonomy);

    return (
      <div key={taxonomy.id}>
        <Card
          withBorder
          style={{
            borderLeft: level > 0 ? '3px solid var(--mantine-color-blue-3)' : undefined,
            marginLeft: level * 20,
          }}
          mb="xs"
          p="sm"
        >
          <Group justify="space-between">
            <Group>
              {hasChildren && (
                <ActionIcon onClick={() => toggleExpanded(taxonomy.id)} size="sm" variant="subtle">
                  <IconChevronRight
                    style={{
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                    size={14}
                  />
                </ActionIcon>
              )}

              <div style={{ marginLeft: hasChildren ? 0 : 20 }}>
                <Group gap="sm">
                  <Text fw={500} size="sm">
                    {taxonomy.name}
                  </Text>
                  <Badge color={getTaxonomyTypeColor(taxonomy.type)} size="xs" variant="light">
                    {taxonomy.type}
                  </Badge>
                  <Badge color={getStatusColor(taxonomy.status)} size="xs" variant="light">
                    {taxonomy.status}
                  </Badge>
                </Group>

                <Group gap="xs" mt={4}>
                  <Text c="dimmed" size="xs">
                    /{taxonomy.slug}
                  </Text>
                  {totalItems > 0 && (
                    <Badge size="xs" variant="outline">
                      {totalItems} items
                    </Badge>
                  )}
                </Group>
              </div>
            </Group>

            <Group gap="xs">
              <Tooltip label="Add Child">
                <ActionIcon
                  color="blue"
                  onClick={() => onAddChild(taxonomy)}
                  size="sm"
                  variant="subtle"
                >
                  <IconPlus size={14} />
                </ActionIcon>
              </Tooltip>

              <ActionIcon color="gray" onClick={() => onView(taxonomy)} size="sm" variant="subtle">
                <IconEye size={14} />
              </ActionIcon>

              <ActionIcon color="gray" onClick={() => onEdit(taxonomy)} size="sm" variant="subtle">
                <IconEdit size={14} />
              </ActionIcon>

              <Menu position="bottom-end" shadow="sm" withinPortal>
                <Menu.Target>
                  <ActionIcon color="gray" size="sm" variant="subtle">
                    <IconDots size={14} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconCopy style={{ width: rem(14), height: rem(14) }} />}
                    onClick={() => onDuplicate(taxonomy)}
                  >
                    Duplicate
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                    onClick={() => onDelete(taxonomy.id)}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Card>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div>{taxonomy.children!.map((child) => renderTaxonomyNode(child, level + 1))}</div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Center h={300}>
        <Loader />
      </Center>
    );
  }

  if (taxonomies.length === 0) {
    return (
      <Card withBorder p="xl">
        <Stack align="center">
          <IconHierarchy color="gray" size={48} />
          <Text c="dimmed" ta="center">
            No taxonomies found
          </Text>
          <Text c="dimmed" size="sm" ta="center">
            {typeFilter
              ? `No ${typeFilter.toLowerCase()} taxonomies available`
              : 'Create your first taxonomy to get started'}
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Group>
          <IconHierarchy size={16} />
          <Text fw={500}>Taxonomy Hierarchy</Text>
          <Badge size="sm" variant="outline">
            {taxonomies.length} root {taxonomies.length === 1 ? 'taxonomy' : 'taxonomies'}
          </Badge>
        </Group>

        <Button
          onClick={() => {
            const allIds = new Set<string>();
            const collectIds = (items: HierarchicalTaxonomy[]) => {
              items.forEach((item) => {
                allIds.add(item.id);
                if (item.children) {
                  collectIds(item.children);
                }
              });
            };
            collectIds(taxonomies);
            setExpandedItems(expandedItems.size === allIds.size ? new Set() : allIds);
          }}
          size="xs"
          variant="light"
        >
          {expandedItems.size > 0 ? 'Collapse All' : 'Expand All'}
        </Button>
      </Group>

      <div>{taxonomies.map((taxonomy) => renderTaxonomyNode(taxonomy, 0))}</div>
    </Stack>
  );
}
