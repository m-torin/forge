import {
  Box,
  Table,
  Checkbox,
  Text,
  TextInput,
  ActionIcon,
  Group,
  Menu,
  Button,
  Pagination,
  Stack,
  Center,
  ThemeIcon,
} from '@mantine/core';
import { IconSearch, IconDotsVertical, IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import type { Icon as TablerIcon } from '@tabler/icons-react';

interface Column<T> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
}

interface Action<T> {
  icon: React.ReactNode;
  label: string;
  onClick: (row: T) => void;
  color?: string;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  actions?: {
    onView?: (row: T) => void;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    custom?: Action<T>[];
  };
  bulkActions?: Array<{
    label: string;
    onClick: (selectedRows: T[]) => void;
    color?: string;
  }>;
  pagination?: {
    pageSize: number;
    total: number;
  };
  emptyState?: {
    icon: TablerIcon;
    title: string;
    description: string;
  };
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  searchPlaceholder = 'Search...',
  selectable = false,
  actions,
  bulkActions,
  pagination,
  emptyState,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const pageSize = pagination?.pageSize || 25;

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Search filter
    if (search) {
      filtered = data.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }

    // Sort
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = (a as any)[sortBy.key];
        const bVal = (b as any)[sortBy.key];

        if (sortBy.direction === 'asc') {
          return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
      });
    }

    return filtered;
  }, [data, search, sortBy]);

  // Paginate
  const paginatedData = processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalPages = Math.ceil(processedData.length / pageSize);

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((row) => row.id)));
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSort = (key: string) => {
    if (!columns.find((col) => col.key === key)?.sortable) return;

    setSortBy((prev) => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const getValue = (row: T, key: string) => {
    const keys = key.split('.');
    let value: any = row;
    for (const k of keys) {
      value = value?.[k];
    }
    return value;
  };

  if (loading) {
    return (
      <Box>
        <Table.ScrollContainer minWidth={500}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                {selectable && <Table.Th style={{ width: 40 }} />}
                {columns.map((column) => (
                  <Table.Th key={column.key}>{column.label}</Table.Th>
                ))}
                {actions && <Table.Th style={{ width: 40 }} />}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {[...Array(5)].map((_, index) => (
                <Table.Tr key={index}>
                  {selectable && (
                    <Table.Td>
                      <Box h={20} bg="gray.1" />
                    </Table.Td>
                  )}
                  {columns.map((column) => (
                    <Table.Td key={column.key}>
                      <Box h={20} bg="gray.1" />
                    </Table.Td>
                  ))}
                  {actions && (
                    <Table.Td>
                      <Box h={20} bg="gray.1" />
                    </Table.Td>
                  )}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Box>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <TextInput
          placeholder={searchPlaceholder}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 300 }}
        />
        {bulkActions && selectedRows.size > 0 && (
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {selectedRows.size} selected
            </Text>
            {bulkActions.map((action, index) => (
              <Button
                key={index}
                size="xs"
                variant="light"
                color={action.color}
                onClick={() => {
                  const selected = Array.from(selectedRows)
                    .map((id) => data.find((row) => row.id === id))
                    .filter(Boolean) as T[];
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

      {processedData.length === 0 && emptyState ? (
        <Center py={60}>
          <Stack align="center" gap="md">
            <ThemeIcon size={60} color="gray" variant="light">
              <emptyState.icon size={30} />
            </ThemeIcon>
            <div style={{ textAlign: 'center' }}>
              <Text fw={500} size="lg">
                {emptyState.title}
              </Text>
              <Text c="dimmed" size="sm">
                {emptyState.description}
              </Text>
            </div>
          </Stack>
        </Center>
      ) : (
        <>
          <Table.ScrollContainer minWidth={500}>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  {selectable && (
                    <Table.Th style={{ width: 40 }}>
                      <Checkbox
                        checked={
                          selectedRows.size === paginatedData.length && paginatedData.length > 0
                        }
                        indeterminate={
                          selectedRows.size > 0 && selectedRows.size < paginatedData.length
                        }
                        onChange={handleSelectAll}
                      />
                    </Table.Th>
                  )}
                  {columns.map((column) => (
                    <Table.Th
                      key={column.key}
                      style={{ cursor: column.sortable ? 'pointer' : 'default' }}
                      onClick={() => handleSort(column.key)}
                    >
                      <Group gap={4}>
                        {column.label}
                        {column.sortable && sortBy?.key === column.key && (
                          <Text size="xs" c="dimmed">
                            {sortBy.direction === 'asc' ? '↑' : '↓'}
                          </Text>
                        )}
                      </Group>
                    </Table.Th>
                  ))}
                  {actions && <Table.Th style={{ width: 40 }} />}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginatedData.map((row) => (
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
                      <Table.Td key={column.key}>
                        {column.render
                          ? column.render(getValue(row, column.key), row)
                          : getValue(row, column.key)}
                      </Table.Td>
                    ))}
                    {actions && (
                      <Table.Td>
                        <Menu position="bottom-end" shadow="md">
                          <Menu.Target>
                            <ActionIcon variant="subtle">
                              <IconDotsVertical size={16} />
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
                                onClick={() => action.onClick(row)}
                                color={action.color}
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
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          {totalPages > 1 && (
            <Group justify="center">
              <Pagination value={currentPage} onChange={setCurrentPage} total={totalPages} />
            </Group>
          )}
        </>
      )}
    </Stack>
  );
}
