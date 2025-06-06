'use client';

import {
  Table,
  ScrollArea,
  TextInput,
  Select,
  Group,
  ActionIcon,
  Text,
  Badge,
  Checkbox,
  Menu,
  Button,
  Skeleton,
  Stack,
  Paper,
  Pagination,
  Center,
} from '@mantine/core';
import {
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconDots,
  IconEdit,
  IconTrash,
  IconEye,
} from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import { EmptyState } from './empty-state';

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  selectable?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyState?: {
    title: string;
    description: string;
    icon: any;
  };
  actions?: {
    onView?: (row: T) => void;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    custom?: Array<{
      label: string;
      icon?: React.ReactNode;
      onClick: (row: T) => void;
      color?: string;
    }>;
  };
  bulkActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedRows: T[]) => void;
    color?: string;
  }>;
  pagination?: {
    total: number;
    pageSize?: number;
  };
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  loading = false,
  selectable = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  emptyState,
  actions,
  bulkActions,
  pagination,
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
          String(value).toLowerCase().includes(search.toLowerCase())
        )
      );
    }
    
    // Sort
    if (sortBy) {
      filtered.sort((a, b) => {
        const aVal = sortBy.includes('.') 
          ? sortBy.split('.').reduce((obj: any, key) => obj?.[key], a)
          : (a as any)[sortBy];
        const bVal = sortBy.includes('.') 
          ? sortBy.split('.').reduce((obj: any, key) => obj?.[key], b)
          : (b as any)[sortBy];
        
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
      setSelectedRows(new Set(paginatedData.map(row => row.id)));
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
        <Paper shadow="xs" radius="md" withBorder>
          <Stack gap={0}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} height={60} />
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
            placeholder={searchPlaceholder}
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
          />
        )}
        
        {bulkActions && selectedRows.size > 0 && (
          <Group>
            <Text size="sm" c="dimmed">
              {selectedRows.size} selected
            </Text>
            {bulkActions.map((action, index) => (
              <Button
                key={index}
                size="sm"
                variant="subtle"
                color={action.color}
                leftSection={action.icon}
                onClick={() => {
                  const selected = paginatedData.filter(row => selectedRows.has(row.id));
                  action.onClick(selected);
                  setSelectedRows(new Set());
                }}
              >
                {action.label}
              </Button>
            ))}
          </Group>
        )}
      </Group>

      <Paper shadow="xs" radius="md" withBorder>
        <ScrollArea>
          <Table horizontalSpacing="md" verticalSpacing="sm" striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                {selectable && (
                  <Table.Th style={{ width: 40 }}>
                    <Checkbox
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      indeterminate={selectedRows.size > 0 && selectedRows.size < paginatedData.length}
                      onChange={handleSelectAll}
                    />
                  </Table.Th>
                )}
                {columns.map((column) => (
                  <Table.Th
                    key={String(column.key)}
                    style={{ width: column.width, cursor: column.sortable ? 'pointer' : 'default' }}
                    onClick={() => column.sortable && handleSort(column.key)}
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
                          title={emptyState.title}
                          description={emptyState.description}
                          icon={emptyState.icon}
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
                          checked={selectedRows.has(row.id)}
                          onChange={() => handleSelectRow(row.id)}
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
                            <ActionIcon variant="subtle" color="gray">
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
                            {actions.custom?.map((action, index) => (
                              <Menu.Item
                                key={index}
                                leftSection={action.icon}
                                color={action.color}
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
          <Group justify="center" p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
            <Pagination
              value={page}
              onChange={setPage}
              total={Math.ceil(filteredData.length / pageSize)}
              size="sm"
            />
          </Group>
        )}
      </Paper>
    </Stack>
  );
}