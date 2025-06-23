'use client';

import {
  ActionIcon,
  Box,
  Button,
  Center,
  LoadingOverlay,
  Menu,
  Paper,
  Stack,
  Text,
} from '@mantine/core';
import {
  IconChevronDown,
  IconChevronRight,
  IconDots,
  IconEdit,
  IconEye,
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
import { useMemo } from 'react';

interface DataTableV2Props<TData extends Record<string, any>> {
  columns: MRT_ColumnDef<TData>[];
  data: TData[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  actions?: {
    onView?: (row: TData) => void;
    onEdit?: (row: TData) => void;
    onDelete?: (row: TData) => void;
    custom?: {
      label: string;
      icon?: React.ReactNode;
      onClick: (row: TData) => void;
      color?: string;
    }[];
  };
  // Hierarchy support
  enableExpanding?: boolean;
  getSubRows?: (row: TData) => TData[] | undefined;
  paginateExpandedRows?: boolean;
  filterFromLeafRows?: boolean;
  // Initial state
  initialState?: MRT_TableOptions<TData>['initialState'];
  // Other MRT options
  enableRowSelection?: boolean;
  enablePagination?: boolean;
  enableGlobalFilter?: boolean;
  enableColumnActions?: boolean;
  enableColumnFilters?: boolean;
  enableSorting?: boolean;
  // Custom props
  emptyStateMessage?: string;
  searchPlaceholder?: string;
  tableProps?: Omit<MRT_TableOptions<TData>, 'columns' | 'data'>;
}

export function DataTableV2<TData extends Record<string, any>>({
  columns: userColumns,
  data,
  loading = false,
  error = null,
  onRefresh,
  actions,
  // Hierarchy
  enableExpanding = false,
  getSubRows,
  paginateExpandedRows = false,
  filterFromLeafRows = true,
  // Initial state
  initialState,
  // Other options
  enableRowSelection = false,
  enablePagination = true,
  enableGlobalFilter = true,
  enableColumnActions = false,
  enableColumnFilters = false,
  enableSorting = true,
  // Custom
  emptyStateMessage = 'No data available',
  searchPlaceholder = 'Search...',
  tableProps = {},
}: DataTableV2Props<TData>) {
  // Add actions column if needed
  const columns = useMemo(() => {
    const cols = [...userColumns];

    if (actions) {
      cols.push({
        id: 'actions',
        header: '',
        size: 60,
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }: { row: MRT_Row<TData> }) => (
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon c="gray" variant="subtle">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {actions.onView && (
                <Menu.Item
                  leftSection={<IconEye size={14} />}
                  onClick={() => actions.onView!(row.original)}
                >
                  View
                </Menu.Item>
              )}
              {actions.onEdit && (
                <Menu.Item
                  leftSection={<IconEdit size={14} />}
                  onClick={() => actions.onEdit!(row.original)}
                >
                  Edit
                </Menu.Item>
              )}
              {actions.custom?.map((action) => (
                <Menu.Item
                  key={action.label}
                  color={action.color}
                  leftSection={action.icon}
                  onClick={() => action.onClick(row.original)}
                >
                  {action.label}
                </Menu.Item>
              ))}
              {actions.onDelete && (
                <>
                  <Menu.Divider />
                  <Menu.Item
                    c="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => actions.onDelete!(row.original)}
                  >
                    Delete
                  </Menu.Item>
                </>
              )}
            </Menu.Dropdown>
          </Menu>
        ),
      });
    }

    return cols;
  }, [userColumns, actions]);

  const table = useMantineReactTable({
    columns,
    data,
    // Hierarchy support
    enableExpanding,
    getSubRows: enableExpanding ? getSubRows : undefined,
    paginateExpandedRows,
    filterFromLeafRows,
    // Features
    enableRowSelection,
    enablePagination,
    enableGlobalFilter,
    enableColumnActions,
    enableColumnFilters,
    enableSorting,
    // UI customization
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    positionActionsColumn: 'last',
    positionGlobalFilter: 'left',
    mantineSearchTextInputProps: {
      placeholder: searchPlaceholder,
      leftSection: <IconSearch size={16} />,
      style: { minWidth: '300px' },
    },
    mantinePaperProps: {
      shadow: 'xs',
      withBorder: true,
      radius: 'md',
    },
    mantineTableProps: {
      highlightOnHover: true,
      striped: true,
      verticalSpacing: 'sm',
    },
    mantineExpandButtonProps: ({ row }) => ({
      children: row.getIsExpanded() ? (
        <IconChevronDown size={14} />
      ) : (
        <IconChevronRight size={14} />
      ),
    }),
    renderEmptyRowsFallback: () => (
      <Center py="xl">
        <Text c="dimmed">{emptyStateMessage}</Text>
      </Center>
    ),
    state: {
      isLoading: loading,
      showProgressBars: loading,
    },
    initialState: {
      density: 'md',
      ...initialState,
    },
    ...tableProps,
  });

  if (error) {
    return (
      <Paper shadow="xs" withBorder={true} radius="sm" p="md">
        <Stack ta="center" gap="md">
          <Text c="red" fw={500}>
            Error loading data
          </Text>
          <Text c="dimmed" size="md">
            {error}
          </Text>
          {onRefresh && (
            <Button onClick={onRefresh} variant="light" size="md">
              Try Again
            </Button>
          )}
        </Stack>
      </Paper>
    );
  }

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} />
      <MantineReactTable table={table} />
    </Box>
  );
}
