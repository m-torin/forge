'use client';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-react-table/styles.css';

import { ActionIcon, Button, Flex, Menu, Text, TextInput, Tooltip } from '@mantine/core';
import {
  IconDownload,
  IconEdit,
  IconEye,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
} from 'mantine-react-table';
import { useMemo, useState } from 'react';
import { ReactNode } from 'react';

// Generic type for table data
export interface DataTableProps<TData extends Record<string, any>> {
  data: TData[];
  columns: MRT_ColumnDef<TData>[];
  isLoading?: boolean;
  isFetching?: boolean;
  isSaving?: boolean;
  error?: Error | null;

  // Actions
  onAdd?: () => void;
  onEdit?: (row: MRT_Row<TData>) => void;
  onDelete?: (row: MRT_Row<TData>) => void;
  onView?: (row: MRT_Row<TData>) => void;
  onRefresh?: () => void;
  onExport?: () => void;

  // Inline editing
  enableInlineEdit?: boolean;
  editDisplayMode?: 'row' | 'modal' | 'cell' | 'table' | 'custom';
  createDisplayMode?: 'row' | 'modal' | 'custom';
  onCreatingRowSave?: MRT_TableOptions<TData>['onCreatingRowSave'];
  onEditingRowSave?: MRT_TableOptions<TData>['onEditingRowSave'];
  onCreatingRowCancel?: MRT_TableOptions<TData>['onCreatingRowCancel'];
  onEditingRowCancel?: MRT_TableOptions<TData>['onEditingRowCancel'];
  validationErrors?: Record<string, string | undefined>;

  // Bulk actions
  enableBulkActions?: boolean;
  onBulkDelete?: (rows: MRT_Row<TData>[]) => void;
  renderBulkActions?: (rows: MRT_Row<TData>[]) => ReactNode;

  // Table options
  enableRowSelection?: boolean;
  enableColumnOrdering?: boolean;
  enableColumnResizing?: boolean;
  enablePagination?: boolean;
  enableSorting?: boolean;
  enableGlobalFilter?: boolean;
  enableColumnFilters?: boolean;
  enableDensityToggle?: boolean;
  enableFullScreenToggle?: boolean;
  enableColumnVisibility?: boolean;

  // Custom options
  tableTitle?: string;
  emptyStateMessage?: string;
  initialState?: MRT_TableOptions<TData>['initialState'];
  renderTopToolbarCustomActions?: MRT_TableOptions<TData>['renderTopToolbarCustomActions'];
  renderDetailPanel?: MRT_TableOptions<TData>['renderDetailPanel'];
  renderRowActions?: MRT_TableOptions<TData>['renderRowActions'];

  // Additional MRT options
  mantineTableOptions?: MRT_TableOptions<TData>;
}

export function DataTable<TData extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  isFetching = false,
  isSaving = false,
  error = null,

  // Actions
  onAdd,
  onEdit,
  onDelete,
  onView,
  onRefresh,
  onExport,

  // Inline editing
  enableInlineEdit = false,
  editDisplayMode = 'row',
  createDisplayMode = 'row',
  onCreatingRowSave,
  onEditingRowSave,
  onCreatingRowCancel,
  onEditingRowCancel,
  validationErrors,

  // Bulk actions
  enableBulkActions = false,
  onBulkDelete,
  renderBulkActions,

  // Table options
  enableRowSelection = false,
  enableColumnOrdering = true,
  enableColumnResizing = true,
  enablePagination = true,
  enableSorting = true,
  enableGlobalFilter = true,
  enableColumnFilters = true,
  enableDensityToggle = true,
  enableFullScreenToggle = true,
  enableColumnVisibility = true,

  // Custom options
  tableTitle,
  emptyStateMessage = 'No records found',
  initialState,
  renderTopToolbarCustomActions,
  renderDetailPanel,
  renderRowActions,
  mantineTableOptions,
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState('');

  // Memoize columns with row actions
  const tableColumns = useMemo<MRT_ColumnDef<TData>[]>(() => {
    const cols = [...columns];

    // Add actions column if any actions are provided and inline editing is not enabled
    if (!enableInlineEdit && (onView || onEdit || onDelete)) {
      cols.push({
        id: 'actions',
        header: 'Actions',
        size: 100,
        Cell: ({ row }) => (
          <Flex gap="xs" justify="center">
            {onView && (
              <Tooltip label="View">
                <ActionIcon variant="subtle" c="blue" onClick={() => onView(row)}>
                  <IconEye size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip label="Edit">
                <ActionIcon variant="subtle" c="yellow" onClick={() => onEdit(row)}>
                  <IconEdit size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip label="Delete">
                <ActionIcon variant="subtle" c="red" onClick={() => onDelete(row)}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Flex>
        ),
      });
    }

    return cols;
  }, [columns, onView, onEdit, onDelete, enableInlineEdit]);

  const table = useMantineReactTable<TData>({
    columns: tableColumns,
    data,

    // State
    state: {
      isLoading,
      showAlertBanner: !!error,
      showProgressBars: isFetching,
      globalFilter,
      isSaving,
    },

    // Features
    enableRowSelection,
    enableColumnOrdering,
    enableColumnResizing,
    enablePagination,
    enableSorting,
    enableGlobalFilter,
    enableColumnFilters,
    enableDensityToggle,
    enableFullScreenToggle,
    enableHiding: enableColumnVisibility,
    enableRowActions: enableInlineEdit || !!(onView || onEdit || onDelete),
    enableEditing: enableInlineEdit,

    // Editing options
    editDisplayMode,
    createDisplayMode,
    onCreatingRowSave,
    onEditingRowSave,
    onCreatingRowCancel,
    onEditingRowCancel,

    // Options
    initialState: {
      density: 'xs',
      ...initialState,
    },

    mantineToolbarAlertBannerProps: error
      ? {
          color: 'red',
          title: 'Error',
          children: (error as Error)?.message || 'Unknown error',
        }
      : undefined,

    mantineSearchTextInputProps: {
      placeholder: 'Search all columns...',
      leftSection: <IconSearch size={16} />,
      variant: 'filled',
    },

    // Global filter
    onGlobalFilterChange: setGlobalFilter,

    // Empty state
    renderEmptyRowsFallback: () => (
      <Text ta="center" py="xl" c="dimmed">
        {emptyStateMessage}
      </Text>
    ),

    // Row actions for inline editing
    renderRowActions: enableInlineEdit
      ? renderRowActions ||
        (({ row, table }) => (
          <Flex gap="xs">
            <Tooltip label="Edit">
              <ActionIcon onClick={() => table.setEditingRow(row)}>
                <IconEdit size={16} />
              </ActionIcon>
            </Tooltip>
            {onDelete && (
              <Tooltip label="Delete">
                <ActionIcon c="red" onClick={() => onDelete(row)}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Flex>
        ))
      : undefined,

    // Top toolbar
    renderTopToolbarCustomActions: ({ table }) => (
      <Flex gap="xs">
        {renderTopToolbarCustomActions?.({ table })}

        {enableBulkActions && table.getSelectedRowModel().rows.length > 0 && (
          <>
            {renderBulkActions?.(table.getSelectedRowModel().rows)}
            {onBulkDelete && (
              <Button
                c="red"
                variant="light"
                size="md"
                leftSection={<IconTrash size={16} />}
                onClick={() => onBulkDelete(table.getSelectedRowModel().rows)}
              >
                Delete ({table.getSelectedRowModel().rows.length})
              </Button>
            )}
          </>
        )}

        {onExport && (
          <Tooltip label="Export data">
            <ActionIcon variant="light" c="green" size="lg" onClick={onExport}>
              <IconDownload size={18} />
            </ActionIcon>
          </Tooltip>
        )}

        {onRefresh && (
          <Tooltip label="Refresh data">
            <ActionIcon variant="light" size="lg" onClick={onRefresh}>
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
        )}

        {onAdd && !enableInlineEdit && (
          <Button variant="light" size="md" leftSection={<IconPlus size={16} />} onClick={onAdd}>
            Add New
          </Button>
        )}

        {enableInlineEdit && onCreatingRowSave && (
          <Button
            variant="light"
            size="md"
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              table.setCreatingRow(true);
            }}
          >
            Add New
          </Button>
        )}
      </Flex>
    ),

    // Detail panel
    renderDetailPanel,

    // Additional options
    ...mantineTableOptions,
  });

  return <MantineReactTable table={table} />;
}

// Re-export types for convenience
export type { MRT_ColumnDef, MRT_Row } from 'mantine-react-table';
