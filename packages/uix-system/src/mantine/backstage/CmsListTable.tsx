'use client';

import { ActionIcon, Button, Group, Stack, Text, Title, Tooltip } from '@mantine/core';
import { IconEdit, IconEye, IconPlus, IconTrash } from '@tabler/icons-react';
import { MantineReactTable, type MRT_ColumnDef } from 'mantine-react-table';
import { useCallback, useMemo, useState } from 'react';

export interface CmsListTableProps<T extends Record<string, any>> {
  data: T[];
  columns: MRT_ColumnDef<T>[];
  isLoading?: boolean;
  error?: string | null;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
  fetchAction?: () => Promise<any>;
  enableRowSelection?: boolean;
  enableGlobalFilter?: boolean;
  enableColumnFilters?: boolean;
  enableSorting?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  globalFilterPlaceholder?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateActionLabel?: string;
  noResultsTitle?: string;
  noResultsDescription?: string;
  clearFilterButtonLabel?: string;
  createButtonLabel?: string;
  'data-testid'?: string;
}

// Default cell for actions
function ActionsCell({
  row,
  onView,
  onEdit,
  onDelete,
}: {
  row: any;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <Group gap="xs">
      {onView && (
        <Tooltip label="View">
          <ActionIcon size="sm" variant="light" onClick={() => onView(row.original.id)}>
            <IconEye size={16} />
          </ActionIcon>
        </Tooltip>
      )}
      {onEdit && (
        <Tooltip label="Edit">
          <ActionIcon
            size="sm"
            variant="light"
            color="blue"
            onClick={() => onEdit(row.original.id)}
          >
            <IconEdit size={16} />
          </ActionIcon>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip label="Delete">
          <ActionIcon
            size="sm"
            variant="light"
            color="red"
            onClick={() => onDelete(row.original.id)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
}

// Factory function to create a stable actions cell component
function createActionsCellComponent(
  onView?: (id: string) => void,
  onEdit?: (id: string) => void,
  onDelete?: (id: string) => void,
) {
  return function StableActionsCell(props: any) {
    return <ActionsCell row={props.row} onView={onView} onEdit={onEdit} onDelete={onDelete} />;
  };
}

export function CmsListTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  error = null,
  selectedIds = [],
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  onAdd,
  fetchAction: _fetchAction,
  enableRowSelection = true,
  enableGlobalFilter = true,
  enableColumnFilters = true,
  enableSorting = true,
  enablePagination = true,
  pageSize = 25,
  globalFilterPlaceholder = 'Search...',
  emptyStateTitle = 'No items yet',
  emptyStateDescription = 'Get started by creating your first item.',
  emptyStateActionLabel = 'Create First Item',
  noResultsTitle = 'No items found',
  noResultsDescription = 'No items match your search. Try adjusting your search terms or clear the filter.',
  clearFilterButtonLabel = 'Clear Filter',
  createButtonLabel = 'Create New Item',
  'data-testid': testId,
}: CmsListTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState('');

  // Add actions column if any actions are provided
  const tableColumns = useMemo<MRT_ColumnDef<T>[]>(() => {
    const cols = [...columns];

    if (onView || onEdit || onDelete) {
      cols.push({
        id: 'actions',
        header: 'Actions',
        size: 120,
        Cell: createActionsCellComponent(onView, onEdit, onDelete),
      });
    }

    return cols;
  }, [columns, onView, onEdit, onDelete]);

  // Custom empty state component
  const renderEmptyRowsFallback = useCallback(() => {
    const hasFilter = globalFilter && globalFilter.trim().length > 0;

    if (hasFilter) {
      // Show filtered results empty state
      return (
        <Stack align="center" justify="center" py="xl" gap="md">
          <IconPlus size={48} stroke={1.5} style={{ color: 'var(--mantine-color-gray-5)' }} />
          <Stack align="center" gap="xs">
            <Title order={3} c="dimmed">
              {noResultsTitle}
            </Title>
            <Text c="dimmed" size="sm" ta="center" maw={400}>
              {noResultsDescription.replace('%s', globalFilter)}
            </Text>
          </Stack>
          <Group>
            <Button
              variant="light"
              color="gray"
              onClick={() => setGlobalFilter('')}
              data-testid="clear-filter-button"
            >
              {clearFilterButtonLabel}
            </Button>
            {onAdd && (
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={onAdd}
                variant="light"
                data-testid="create-item-button"
              >
                {createButtonLabel}
              </Button>
            )}
          </Group>
        </Stack>
      );
    }

    // Show true empty state
    return (
      <Stack align="center" justify="center" py="xl" gap="md">
        <IconPlus size={48} stroke={1.5} style={{ color: 'var(--mantine-color-gray-5)' }} />
        <Stack align="center" gap="xs">
          <Title order={3} c="dimmed">
            {emptyStateTitle}
          </Title>
          <Text c="dimmed" size="sm" ta="center" maw={400}>
            {emptyStateDescription}
          </Text>
        </Stack>
        {onAdd && (
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={onAdd}
            variant="light"
            data-testid="create-first-item-button"
          >
            {emptyStateActionLabel}
          </Button>
        )}
      </Stack>
    );
  }, [
    globalFilter,
    onAdd,
    emptyStateTitle,
    emptyStateDescription,
    emptyStateActionLabel,
    noResultsTitle,
    noResultsDescription,
    clearFilterButtonLabel,
    createButtonLabel,
  ]);

  return (
    <MantineReactTable
      columns={tableColumns}
      data={data}
      enableRowSelection={enableRowSelection}
      rowCount={data.length}
      onRowSelectionChange={(updater: any) => {
        if (onSelectionChange) {
          const newSelection = typeof updater === 'function' ? updater({}) : updater;
          onSelectionChange(Object.keys(newSelection));
        }
      }}
      state={{
        rowSelection: selectedIds.reduce((acc, id) => ({ ...acc, [id]: true }), {}),
        isLoading,
        showAlertBanner: !!error,
        globalFilter,
      }}
      onGlobalFilterChange={setGlobalFilter}
      enableColumnFilters={enableColumnFilters}
      enableSorting={enableSorting}
      enableGlobalFilter={enableGlobalFilter}
      enablePagination={enablePagination}
      mantinePaperProps={{
        shadow: '0',
        withBorder: true,
        radius: 'md',
      }}
      mantineTableProps={{
        striped: true,
        highlightOnHover: true,
        withTableBorder: true,
        withColumnBorders: false,
      }}
      renderEmptyRowsFallback={renderEmptyRowsFallback}
      data-testid={testId}
      mantineTableContainerProps={{
        'aria-label': 'Data table',
      }}
      mantineTableHeadProps={{
        'aria-label': 'Table header',
      }}
      mantineTableBodyProps={{
        'aria-label': 'Table body',
      }}
      initialState={{
        showGlobalFilter: enableGlobalFilter,
        pagination: {
          pageSize,
          pageIndex: 0,
        },
      }}
      globalFilterFn="contains"
      enableGlobalFilterModes
      positionGlobalFilter="left"
      mantineToolbarAlertBannerProps={
        error
          ? {
              color: 'red',
              title: 'Error loading data',
              children: error,
            }
          : undefined
      }
      mantineSearchTextInputProps={
        {
          placeholder: globalFilterPlaceholder,
          variant: 'filled',
          size: 'sm',
          'aria-label': 'Search items',
          'data-testid': 'search-input',
        } as any
      }
    />
  );
}
