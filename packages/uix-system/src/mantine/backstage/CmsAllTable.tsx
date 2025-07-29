'use client';

import {
  ActionIcon,
  Button,
  Checkbox,
  Group,
  LoadingOverlay,
  ScrollArea,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import cx from 'clsx';
import { useState } from 'react';

export interface CmsTableItem {
  id: string;
  name: string;
  slug: string;
  [key: string]: any;
}

export interface AdditionalColumn<T = CmsTableItem> {
  id?: string;
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

export interface CmsAllTableProps<T extends CmsTableItem = CmsTableItem> {
  data: T[];
  additionalColumns?: AdditionalColumn<T>[];
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateActionLabel?: string;
  onEmptyStateAction?: () => void;
  onDelete?: (id: string) => void | Promise<void>;
  onBulkDelete?: (ids: string[]) => void | Promise<void>;
  onEdit?: (id: string) => void;
  isLoading?: boolean;
  showSkeleton?: boolean;
  skeletonRows?: number;
  'data-testid'?: string;
}

// Helper function to get nested property values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Helper function to format values for display
function formatValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'string' && !isNaN(Date.parse(value))) {
    // Check if it's a date string
    const date = new Date(value);
    if (date.getFullYear() > 1900) return date.toLocaleDateString();
  }
  return value.toString();
}

export function CmsAllTable<T extends CmsTableItem = CmsTableItem>({
  data,
  additionalColumns = [],
  emptyStateTitle = 'No items found',
  emptyStateDescription = 'There are no items to display.',
  emptyStateActionLabel,
  onEmptyStateAction,
  onDelete,
  onBulkDelete,
  onEdit,
  isLoading = false,
  showSkeleton = false,
  skeletonRows = 5,
  'data-testid': testId = 'cms-all-table',
}: CmsAllTableProps<T>) {
  const [selection, setSelection] = useState<string[]>([]);

  const toggleRow = (id: string) =>
    setSelection(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id],
    );

  const toggleAll = () =>
    setSelection(current => (current.length === data.length ? [] : data.map(item => item.id)));

  // Create skeleton rows for loading state
  const skeletonRowElements = showSkeleton
    ? Array.from({ length: skeletonRows }, (_, index) => (
        <Table.Tr key={`skeleton-${index}`}>
          <Table.Td>
            <Skeleton height={20} width={20} />
          </Table.Td>
          <Table.Td>
            <Skeleton height={20} width="60%" />
          </Table.Td>
          <Table.Td>
            <Skeleton height={20} width="40%" />
          </Table.Td>
          {additionalColumns.map((col, colIndex) => (
            <Table.Td key={col?.id || `skeleton-col-${colIndex}`}>
              <Skeleton height={20} width="50%" />
            </Table.Td>
          ))}
          {(onEdit || onDelete) && (
            <Table.Td>
              <Group gap="xs" justify="flex-end">
                <Skeleton height={28} width={28} />
                <Skeleton height={28} width={28} />
              </Group>
            </Table.Td>
          )}
        </Table.Tr>
      ))
    : [];

  const hasActions = onEdit || onDelete;

  const rows = data.map(item => {
    const selected = selection.includes(item.id);
    return (
      <Table.Tr key={item.id} className={cx({ 'bg-blue-50': selected })}>
        <Table.Td>
          <Checkbox checked={selection.includes(item.id)} onChange={() => toggleRow(item.id)} />
        </Table.Td>
        <Table.Td>
          <Group gap="sm">
            <Text
              size="sm"
              fw={500}
              style={{ cursor: onEdit ? 'pointer' : 'default' }}
              onClick={onEdit ? () => onEdit(item.id) : undefined}
            >
              {item.name}
            </Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Text size="sm" c="dimmed">
            {item.slug}
          </Text>
        </Table.Td>
        {additionalColumns.map(column => (
          <Table.Td key={column.key}>
            <Text size="sm">{formatValue(getNestedValue(item, column.key))}</Text>
          </Table.Td>
        ))}
        {hasActions && (
          <Table.Td>
            <Group gap="xs" justify="flex-end">
              {onEdit && (
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  onClick={() => onEdit(item.id)}
                  title="Edit"
                >
                  <IconEdit size={16} />
                </ActionIcon>
              )}
              {onDelete && (
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => onDelete(item.id)}
                  title="Delete"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              )}
            </Group>
          </Table.Td>
        )}
      </Table.Tr>
    );
  });

  // Show empty state if no data and not loading
  if (data.length === 0 && !showSkeleton) {
    return (
      <Stack align="center" justify="center" p="xl" data-testid={`${testId}-empty-state`}>
        <Title order={3} c="dimmed">
          {emptyStateTitle}
        </Title>
        <Text c="dimmed" ta="center" maw={400}>
          {emptyStateDescription}
        </Text>
        {emptyStateActionLabel && onEmptyStateAction && (
          <Button onClick={onEmptyStateAction} variant="light">
            {emptyStateActionLabel}
          </Button>
        )}
      </Stack>
    );
  }

  const minWidth = 700 + additionalColumns.length * 150;

  return (
    <Stack gap="md" pos="relative">
      <LoadingOverlay visible={isLoading} />

      {selection.length > 0 && onBulkDelete && (
        <Group justify="space-between" px="md">
          <Text size="sm" c="dimmed">
            {selection.length} item{selection.length > 1 ? 's' : ''} selected
          </Text>
          <Button
            color="red"
            variant="light"
            size="sm"
            onClick={() => onBulkDelete(selection)}
            leftSection={<IconTrash size={16} />}
          >
            Delete Selected
          </Button>
        </Group>
      )}

      <ScrollArea data-testid={testId}>
        <Table miw={minWidth} verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={40}>
                <Checkbox
                  onChange={toggleAll}
                  checked={selection.length === data.length}
                  indeterminate={selection.length > 0 && selection.length !== data.length}
                  disabled={showSkeleton}
                />
              </Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Slug</Table.Th>
              {additionalColumns.map(column => (
                <Table.Th key={column.key}>{column.header}</Table.Th>
              ))}
              {hasActions && <Table.Th w={100}>Actions</Table.Th>}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{showSkeleton ? skeletonRowElements : rows}</Table.Tbody>
        </Table>
      </ScrollArea>
    </Stack>
  );
}
