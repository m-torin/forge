'use client';

import { ActionIcon, Checkbox, Group, Table, Text } from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useState, memo, useMemo } from 'react';
import type { TableLayoutProps } from '../ModelDataTable';

interface TreeItem {
  id: string;
  children?: TreeItem[];
  [key: string]: any;
}

export interface TreeTableLayoutProps<T extends TreeItem> extends TableLayoutProps<T> {
  getChildren?: (item: T) => T[];
  defaultExpanded?: boolean;
}

export const TreeTableLayout = memo(function TreeTableLayout<T extends TreeItem>({
  data,
  columns,
  selectedItems,
  onSelectionChange,
  getItemId = (item: T) => item.id,
  getChildren = (item: T) => (item.children as T[]) || [],
  defaultExpanded = false,
}: TreeTableLayoutProps<T>) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    defaultExpanded ? new Set(data.map(getItemId)) : new Set(),
  );

  const visibleColumns = columns.filter((col) => !col.hidden);
  const hasSelection = selectedItems !== undefined && onSelectionChange !== undefined;

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const toggleItem = (itemId: string) => {
    if (!onSelectionChange || !selectedItems) return;

    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    onSelectionChange(newSelection);
  };

  const getAllItemIds = useMemo(() => {
    const traverse = (items: T[]): string[] => {
      return items.flatMap((item) => [getItemId(item), ...traverse(getChildren(item))]);
    };
    return traverse(data);
  }, [data, getItemId, getChildren]);

  const toggleAll = () => {
    if (!onSelectionChange || !selectedItems) return;

    if (selectedItems.size === getAllItemIds.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(getAllItemIds));
    }
  };

  const renderRow = (item: T, level = 0): React.ReactNode => {
    const itemId = getItemId(item);
    const children = getChildren(item);
    const hasChildren = children.length > 0;
    const isExpanded = expandedItems.has(itemId);
    const isSelected = selectedItems?.has(itemId) || false;

    return (
      <>
        <Table.Tr key={itemId} bg={isSelected ? 'var(--mantine-color-blue-light)' : undefined}>
          {hasSelection && (
            <Table.Td>
              <Checkbox checked={isSelected} onChange={() => toggleItem(itemId)} />
            </Table.Td>
          )}
          {visibleColumns.map((column, index) => (
            <Table.Td key={column.key}>
              {index === 0 ? (
                <Group gap="xs" wrap="nowrap" style={{ paddingLeft: level * 24 }}>
                  {hasChildren ? (
                    <ActionIcon onClick={() => toggleExpanded(itemId)} size="sm" variant="subtle">
                      {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                    </ActionIcon>
                  ) : (
                    <div style={{ width: 28 }} />
                  )}
                  {column.render ? column.render(item) : (item as any)[column.key]}
                </Group>
              ) : column.render ? (
                column.render(item)
              ) : (
                (item as any)[column.key]
              )}
            </Table.Td>
          ))}
        </Table.Tr>
        {isExpanded && hasChildren && children.map((child) => renderRow(child, level + 1))}
      </>
    );
  };

  if (data.length === 0) {
    return (
      <Table>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td colSpan={visibleColumns.length + (hasSelection ? 1 : 0)}>
              <Text ta="center" py="xl" c="dimmed">
                No items found
              </Text>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    );
  }

  return (
    <Table highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          {hasSelection && (
            <Table.Th style={{ width: 40 }}>
              <Checkbox
                checked={selectedItems.size === getAllItemIds.length && data.length > 0}
                indeterminate={selectedItems.size > 0 && selectedItems.size < getAllItemIds.length}
                onChange={toggleAll}
              />
            </Table.Th>
          )}
          {visibleColumns.map((column) => (
            <Table.Th key={column.key} style={{ width: column.width }}>
              {column.label}
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{data.map((item) => renderRow(item))}</Table.Tbody>
    </Table>
  );
}) as <T extends TreeItem>(props: TreeTableLayoutProps<T>) => React.JSX.Element;
