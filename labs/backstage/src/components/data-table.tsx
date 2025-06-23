'use client';

import {
  ActionIcon,
  Button,
  Center,
  Checkbox,
  Group,
  Menu,
  Pagination,
  Paper,
  ScrollArea,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import {
  IconDots,
  IconEdit,
  IconEye,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
  IconTrash,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';

import { EmptyState } from './empty-state';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: number;
}

interface DataTableProps<T> {
  actions?: {
    onView?: (row: T) => void;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    custom?: {
      label: string;
      icon?: React.ReactNode;
      onClick: (row: T) => void;
      color?: string;
    }[];
  };
  bulkActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedRows: T[]) => void;
    color?: string;
  }[];
  columns: Column<T>[];
  data: T[];
  emptyState?: {
    title: string;
    description: string;
    icon: any;
  };
  loading?: boolean;
  pagination?: {
    total: number;
    pageSize?: number;
  };
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
}

const SKELETON_ROWS = ['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4', 'skeleton-5'];

export function DataTable<T extends { id: string | number }>({
  actions,
  bulkActions,
  columns,
  data,
  emptyState,
  loading = false,
  pagination,
  searchable = true,
  searchPlaceholder = 'Search...',
  selectable = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<keyof T | string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [page, setPage] = useState(1);

  const pageSize = pagination?.pageSize || 10;

  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Search
    if (search) {
      filtered = filtered.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }

    // Sort
    if (sortBy) {
      filtered.sort((a, b) => {
        const sortKey = String(sortBy);
        const aVal = sortKey.includes('.')
          ? sortKey.split('.').reduce((obj: any, key) => obj?.[key], a)
          : (a as any)[sortKey];
        const bVal = sortKey.includes('.')
          ? sortKey.split('.').reduce((obj: any, key) => obj?.[key], b)
          : (b as any)[sortKey];

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, search, sortBy, sortOrder]);

  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, page, pageSize, pagination]);

  const handleSort = (column: keyof T | string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((row) => row.id)));
    }
  };

  const handleSelectRow = (id: string | number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const getValue = (row: T, key: string) => {
    if (key.includes('.')) {
      return key.split('.').reduce((obj: any, k) => obj?.[k], row);
    }
    return (row as any)[key];
  };

  if (loading) {
    return (
      <Stack gap="md">
        <Skeleton height={40} />
        <Paper shadow="xs" withBorder radius="md">
          <Stack gap={0}>
            {SKELETON_ROWS.map((rowId) => (
              <Skeleton key={rowId} height={60} />
            ))}
          </Stack>
        </Paper>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        {searchable && (
          <TextInput
            leftSection={<IconSearch size={16} />}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            style={{ width: 300 }}
            value={search}
          />
        )}

        {bulkActions && selectedRows.size > 0 && (
          <Group>
            <Text c="dimmed" size="sm">
              {selectedRows.size} selected
            </Text>
            {bulkActions.map((action) => (
              <Button
                key={action.label}
                color={action.color}
                leftSection={action.icon}
                onClick={() => {
                  const selected = paginatedData.filter((row) => selectedRows.has(row.id));
                  action.onClick(selected);
                  setSelectedRows(new Set());
                }}
                size="sm"
                variant="subtle"
              >
                {action.label}
              </Button>
            ))}
          </Group>
        )}
      </Group>

      <Paper shadow="xs" withBorder radius="md">
        <ScrollArea>
          <Table highlightOnHover horizontalSpacing="md" striped verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                {selectable && (
                  <Table.Th style={{ width: 40 }}>
                    <Checkbox
                      onChange={handleSelectAll}
                      checked={
                        selectedRows.size === paginatedData.length && paginatedData.length > 0
                      }
                      indeterminate={
                        selectedRows.size > 0 && selectedRows.size < paginatedData.length
                      }
                    />
                  </Table.Th>
                )}
                {columns.map((column) => (
                  <Table.Th
                    key={String(column.key)}
                    onClick={() => column.sortable && handleSort(column.key)}
                    style={{ width: column.width, cursor: column.sortable ? 'pointer' : 'default' }}
                  >
                    <Group gap="xs" wrap="nowrap">
                      <Text fw={500}>{column.label}</Text>
                      {column.sortable && sortBy === column.key && (
                        <ActionIcon size="xs" variant="subtle">
                          {sortOrder === 'asc' ? (
                            <IconSortAscending size={14} />
                          ) : (
                            <IconSortDescending size={14} />
                          )}
                        </ActionIcon>
                      )}
                    </Group>
                  </Table.Th>
                ))}
                {actions && <Table.Th style={{ width: 50 }} />}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedData.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}>
                    <Center py="xl">
                      {emptyState ? (
                        <EmptyState
                          description={emptyState.description}
                          icon={emptyState.icon}
                          title={emptyState.title}
                        />
                      ) : (
                        <Text c="dimmed">No data available</Text>
                      )}
                    </Center>
                  </Table.Td>
                </Table.Tr>
              ) : (
                paginatedData.map((row) => (
                  <Table.Tr key={row.id}>
                    {selectable && (
                      <Table.Td>
                        <Checkbox
                          onChange={() => handleSelectRow(row.id)}
                          checked={selectedRows.has(row.id)}
                        />
                      </Table.Td>
                    )}
                    {columns.map((column) => (
                      <Table.Td key={String(column.key)}>
                        {column.render
                          ? column.render(getValue(row, String(column.key)), row)
                          : getValue(row, String(column.key))}
                      </Table.Td>
                    ))}
                    {actions && (
                      <Table.Td>
                        <Menu position="bottom-end" withinPortal>
                          <Menu.Target>
                            <ActionIcon color="gray" variant="subtle">
                              <IconDots size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            {actions.onView && (
                              <Menu.Item
                                leftSection={<IconEye size={14} />}
                                onClick={() => actions.onView!(row)}
                              >
                                View
                              </Menu.Item>
                            )}
                            {actions.onEdit && (
                              <Menu.Item
                                leftSection={<IconEdit size={14} />}
                                onClick={() => actions.onEdit!(row)}
                              >
                                Edit
                              </Menu.Item>
                            )}
                            {actions.custom?.map((action) => (
                              <Menu.Item
                                key={action.label}
                                color={action.color}
                                leftSection={action.icon}
                                onClick={() => action.onClick(row)}
                              >
                                {action.label}
                              </Menu.Item>
                            ))}
                            {actions.onDelete && (
                              <>
                                <Menu.Divider />
                                <Menu.Item
                                  color="red"
                                  leftSection={<IconTrash size={14} />}
                                  onClick={() => actions.onDelete!(row)}
                                >
                                  Delete
                                </Menu.Item>
                              </>
                            )}
                          </Menu.Dropdown>
                        </Menu>
                      </Table.Td>
                    )}
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {pagination && filteredData.length > pageSize && (
          <Group
            style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}
            justify="center"
            p="md"
          >
            <Pagination
              onChange={setPage}
              total={Math.ceil(filteredData.length / pageSize)}
              size="sm"
              value={page}
            />
          </Group>
        )}
      </Paper>
    </Stack>
  );
}
