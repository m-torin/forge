'use client';

import {
  Card,
  Group,
  LoadingOverlay,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconColumns3,
  IconLayoutGrid,
  IconLayoutKanban,
  IconLayoutList,
  IconSearch,
  IconTable,
} from '@tabler/icons-react';
import { type ReactNode, useState, useMemo, useEffect } from 'react';

export type TableLayout = 'flat' | 'tree' | 'grid' | 'kanban' | 'list';

export interface Column<T> {
  key: string;
  label: string;
  width?: number | string;
  sortable?: boolean;
  hidden?: boolean;
  render?: (item: T) => ReactNode;
}

export interface ModelDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  layout?: TableLayout;
  availableLayouts?: TableLayout[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onLayoutChange?: (layout: TableLayout) => void;
  actions?: ReactNode;
  filters?: ReactNode;
  bulkActions?: ReactNode;
  selectedItems?: Set<string>;
  onSelectionChange?: (items: Set<string>) => void;
  getItemId?: (item: T) => string;
  renderLayout?: (props: TableLayoutProps<T>) => ReactNode;
}

export interface TableLayoutProps<T> {
  data: T[];
  columns: Column<T>[];
  selectedItems?: Set<string>;
  onSelectionChange?: (items: Set<string>) => void;
  getItemId?: (item: T) => string;
}

const layoutIcons: Record<TableLayout, ReactNode> = {
  flat: <IconTable size={16} />,
  tree: <IconColumns3 size={16} />,
  grid: <IconLayoutGrid size={16} />,
  kanban: <IconLayoutKanban size={16} />,
  list: <IconLayoutList size={16} />,
};

const layoutLabels: Record<TableLayout, string> = {
  flat: 'Table',
  tree: 'Tree',
  grid: 'Grid',
  kanban: 'Kanban',
  list: 'List',
};

export function ModelDataTable<T>({
  data,
  columns,
  layout = 'flat',
  availableLayouts = ['flat'],
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  onSearch,
  onLayoutChange,
  actions,
  filters,
  bulkActions,
  selectedItems,
  onSelectionChange,
  getItemId = (item: any) => item.id,
  renderLayout,
}: ModelDataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 200);

  // Handle search with useEffect to avoid side effects in render
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearch);
    }
  }, [debouncedSearch, onSearch]);

  // Memoize expensive computations
  const showBulkActions = useMemo(() => {
    return selectedItems ? selectedItems.size > 0 : false;
  }, [selectedItems]);

  const layoutOptions = useMemo(() => {
    return availableLayouts.map((l) => ({
      value: l,
      label: (
        <Group gap={4}>
          {layoutIcons[l]}
          <span>{layoutLabels[l]}</span>
        </Group>
      ),
    }));
  }, [availableLayouts]);

  return (
    <Stack gap="sm">
      {/* Controls Bar */}
      <Card withBorder p="sm">
        <Group justify="space-between">
          <Group gap="sm" style={{ flex: 1 }}>
            {searchable && (
              <TextInput
                leftSection={<IconSearch size={16} />}
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                style={{ flex: 1, maxWidth: 400 }}
              />
            )}
            {filters}
          </Group>

          <Group gap="sm">
            {availableLayouts.length > 1 && (
              <SegmentedControl
                value={layout}
                onChange={(value) => onLayoutChange?.(value as TableLayout)}
                data={layoutOptions}
                size="xs"
              />
            )}
            {actions}
          </Group>
        </Group>

        {/* Bulk Actions Bar */}
        {showBulkActions && bulkActions && selectedItems && (
          <Group mt="sm" p="sm" style={{ backgroundColor: 'var(--mantine-color-blue-light)' }}>
            <Text size="sm" fw={500}>
              {selectedItems.size} selected
            </Text>
            {bulkActions}
          </Group>
        )}
      </Card>

      {/* Table Content */}
      <Card withBorder p={0}>
        <LoadingOverlay visible={loading} zIndex={100} />
        <ScrollArea>
          {renderLayout ? (
            renderLayout({
              data,
              columns,
              selectedItems,
              onSelectionChange,
              getItemId,
            })
          ) : (
            <Text p="md" c="dimmed" ta="center">
              No layout renderer provided
            </Text>
          )}
        </ScrollArea>
      </Card>
    </Stack>
  );
}
