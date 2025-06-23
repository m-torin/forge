'use client';

import { Checkbox, Table, Text } from '@mantine/core';
import { memo } from 'react';
import type { TableLayoutProps } from '../ModelDataTable';

export const FlatTableLayout = memo(function FlatTableLayout<T extends { id: string }>({
  data,
  columns,
  selectedItems,
  onSelectionChange,
  getItemId = (item: T) => item.id,
}: TableLayoutProps<T>) {
  const visibleColumns = columns.filter((col) => !col.hidden);
  const hasSelection = selectedItems !== undefined && onSelectionChange !== undefined;

  const toggleAll = () => {
    if (!onSelectionChange || !selectedItems) return;

    if (selectedItems.size === data.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map(getItemId)));
    }
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
                checked={selectedItems.size === data.length && data.length > 0}
                indeterminate={selectedItems.size > 0 && selectedItems.size < data.length}
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
      <Table.Tbody>
        {data.map((item) => {
          const itemId = getItemId(item);
          const isSelected = selectedItems?.has(itemId) || false;

          return (
            <Table.Tr key={itemId} bg={isSelected ? 'var(--mantine-color-blue-light)' : undefined}>
              {hasSelection && (
                <Table.Td>
                  <Checkbox checked={isSelected} onChange={() => toggleItem(itemId)} />
                </Table.Td>
              )}
              {visibleColumns.map((column) => (
                <Table.Td key={column.key}>
                  {column.render ? column.render(item) : (item as any)[column.key]}
                </Table.Td>
              ))}
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}) as <T extends { id: string }>(props: TableLayoutProps<T>) => React.JSX.Element;
