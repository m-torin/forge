'use client';

import { ActionIcon, Button, Group, Stack, Text, Title, Tooltip } from '@mantine/core';
import {
  useDebouncedState,
  useDisclosure,
  useInputState,
  useListState,
  useSetState,
} from '@mantine/hooks';
import { IconEdit, IconEye, IconPlus, IconTrash } from '@tabler/icons-react';
import { MantineReactTable, type MRT_ColumnDef } from 'mantine-react-table';
import { useCallback, useEffect, useMemo } from 'react';

export interface CmsBulkEditTableProps<T extends Record<string, any>> {
  data?: T[];
  columns: MRT_ColumnDef<T>[];
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
  fetchAction?: () => Promise<any>;
  error?: string | null;
  enableInlineEdit?: boolean;
  searchDebounceMs?: number;
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

function createActionsCell(
  handleView?: (id: string) => void,
  handleEdit?: (id: string) => void,
  handleDelete?: (id: string) => void,
) {
  return function ActionsWrapper(props: any) {
    return (
      <ActionsCell {...props} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
    );
  };
}

export function CmsBulkEditTable<T extends Record<string, any>>({
  data = [],
  columns,
  selectedIds = [],
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  onAdd,
  fetchAction,
  error: externalError,
  enableInlineEdit = false,
  searchDebounceMs = 300,
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
}: CmsBulkEditTableProps<T>) {
  const [items, itemsHandlers] = useListState<T>(data);
  const [tableState, setTableState] = useSetState({
    error: externalError as string | null,
  });
  const [loading, { open: startLoading, close: stopLoading }] = useDisclosure(false);
  const [isFetching, { open: startFetching, close: stopFetching }] = useDisclosure(false);
  const [globalFilter, setGlobalFilter] = useDebouncedState('', searchDebounceMs);
  const [searchValue, setSearchValue] = useInputState('');

  // Memoized initial state configuration
  const initialState = useMemo(
    () => ({
      showGlobalFilter: true,
      pagination: {
        pageSize,
        pageIndex: 0,
      },
      density: 'md' as const,
      sorting: [
        {
          id: 'name',
          desc: false,
        },
      ],
    }),
    [pageSize],
  );

  const loadData = useCallback(async () => {
    if (!fetchAction) return;

    startLoading();
    startFetching();
    try {
      const result = await fetchAction();
      if (result.success && result.data) {
        itemsHandlers.setState(result.data);
      }
      if (result.error) {
        setTableState({ error: result.error });
      }
    } catch (error) {
      setTableState({
        error: error instanceof Error ? error.message : 'Failed to load data',
      });
    } finally {
      stopLoading();
      stopFetching();
      setTableState({ error: null });
    }
  }, [
    fetchAction,
    itemsHandlers,
    setTableState,
    startLoading,
    startFetching,
    stopLoading,
    stopFetching,
  ]);

  // Load data on mount if fetchAction is provided
  useEffect(() => {
    if (fetchAction) {
      loadData();
    }
  }, [fetchAction, loadData]);

  // Update internal state when external data changes
  useEffect(() => {
    if (data && data.length > 0) {
      itemsHandlers.setState(data);
    }
  }, [data, itemsHandlers]);

  // Add actions column if any actions are provided and inline editing is disabled
  const tableColumns = useMemo<MRT_ColumnDef<T>[]>(() => {
    const cols = [...columns];

    if (!enableInlineEdit && (onView || onEdit || onDelete)) {
      cols.push({
        id: 'actions',
        header: 'Actions',
        size: 120,
        Cell: createActionsCell(onView, onEdit, onDelete),
      });
    }

    return cols;
  }, [columns, onView, onEdit, onDelete, enableInlineEdit]);

  // Custom empty state component
  const renderEmptyRowsFallback = useCallback(() => {
    const hasFilter =
      (globalFilter && globalFilter.trim().length > 0) ||
      (searchValue && searchValue.trim().length > 0);

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
              {noResultsDescription.replace('%s', globalFilter || searchValue || '')}
            </Text>
          </Stack>
          <Group>
            <Button
              variant="light"
              color="gray"
              onClick={() => {
                setGlobalFilter('');
                setSearchValue('');
              }}
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
    searchValue,
    onAdd,
    emptyStateTitle,
    emptyStateDescription,
    emptyStateActionLabel,
    noResultsTitle,
    noResultsDescription,
    clearFilterButtonLabel,
    createButtonLabel,
    setGlobalFilter,
    setSearchValue,
  ]);

  return (
    <MantineReactTable
      columns={tableColumns}
      data={items}
      enableRowSelection
      rowCount={items.length}
      onRowSelectionChange={(updater: any) => {
        if (onSelectionChange) {
          const newSelection = typeof updater === 'function' ? updater({}) : updater;
          onSelectionChange(Object.keys(newSelection));
        }
      }}
      state={{
        rowSelection: selectedIds.reduce((acc, id) => ({ ...acc, [id]: true }), {}),
        isLoading: loading,
        showProgressBars: isFetching,
        showAlertBanner: !!tableState.error,
        globalFilter: globalFilter || searchValue,
      }}
      onGlobalFilterChange={(value: any) => {
        setGlobalFilter(value);
        setSearchValue(value);
      }}
      enableColumnFilters
      enableSorting
      enableGlobalFilter
      enablePagination
      enableRowNumbers
      enableBottomToolbar
      enableTopToolbar
      enableEditing={enableInlineEdit}
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
        'aria-label': 'Bulk edit table',
      }}
      mantineTableHeadProps={{
        'aria-label': 'Table header',
      }}
      mantineTableBodyProps={{
        'aria-label': 'Table body',
      }}
      initialState={initialState}
      globalFilterFn="contains"
      enableGlobalFilterModes
      positionGlobalFilter="left"
      mantineToolbarAlertBannerProps={
        tableState.error
          ? {
              color: 'red',
              title: 'Error loading data',
              children: tableState.error,
            }
          : undefined
      }
      mantineSearchTextInputProps={
        {
          placeholder: globalFilterPlaceholder,
          variant: 'filled',
          size: 'sm',
          'aria-label': 'Search items',
          value: searchValue,
          onChange: setSearchValue,
          'data-testid': 'search-input',
        } as any
      }
    />
  );
}
