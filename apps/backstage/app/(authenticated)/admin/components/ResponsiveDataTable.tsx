'use client';

import {
  ActionIcon,
  Box,
  Button,
  Card,
  Checkbox,
  Collapse,
  Divider,
  Grid,
  Group,
  Menu,
  Pagination,
  Paper,
  ScrollArea,
  SegmentedControl,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import {
  IconChevronDown,
  IconChevronUp,
  IconDots,
  IconDownload,
  IconEdit,
  IconEye,
  IconLayoutGrid,
  IconLayoutList,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { notify } from '@repo/notifications/mantine-notifications';

import { DeleteConfirmation } from './DeleteConfirmation';
import { downloadFile } from './ExportHandler';

interface Column {
  hiddenBelow?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; // Hide on small screens
  key: string;
  label: string;
  priority?: 'high' | 'medium' | 'low'; // For responsive hiding
  render?: (value: any, record: any) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
}

interface ResponsiveDataTableProps {
  columns: Column[];
  createHref?: string;
  data: {
    records: any[];
    total: number;
    page: number;
    limit: number;
  };
  editHref?: (id: string) => string;
  enableBulkEdit?: boolean;
  loading?: boolean;
  // Mobile-specific props
  mobileView?: 'cards' | 'list' | 'table';
  modelKey?: string;
  onBulkDelete?: (ids: string[]) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onExport?: (ids: string[]) => Promise<any[]>;
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  searchPlaceholder?: string;
  title: string;
  viewHref?: (id: string) => string;
}

export function ResponsiveDataTable({
  columns,
  createHref,
  data,
  editHref,
  enableBulkEdit = false,
  loading = false,
  mobileView = 'cards',
  modelKey,
  onBulkDelete,
  onDelete,
  onExport,
  onPageChange,
  onSearch,
  onSort,
  searchPlaceholder = 'Search...',
  title,
  viewHref,
}: ResponsiveDataTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'table'>(mobileView);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  // Auto-switch to cards on mobile
  const effectiveView = isMobile ? 'cards' : viewMode;

  // Filter columns based on screen size
  const visibleColumns = columns.filter((col) => {
    if (!col.hiddenBelow) return true;
    const breakpoints = { lg: 1200, md: 992, sm: 768, xl: 1400, xs: 576 };
    const screenWidth = window.innerWidth;
    return screenWidth >= (breakpoints[col.hiddenBelow] || 0);
  });

  // High priority columns for mobile card view
  const primaryColumns = columns.filter((col) => col.priority === 'high' || !col.priority);
  const secondaryColumns = columns.filter(
    (col) => col.priority === 'medium' || col.priority === 'low',
  );

  const handleSelectAll = () => {
    if (selectedIds.length === data.records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.records.map((record) => record.id));
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSort = (key: string) => {
    if (!onSort) return;

    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    onSort(key, sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleBulkDelete = async () => {
    if (!onBulkDelete || selectedIds.length === 0) return;

    startTransition(async () => {
      try {
        await onBulkDelete(selectedIds);
        setSelectedIds([]);
        notify.success('Selected records deleted successfully');
      } catch (error) {
        notify.error('Failed to delete records');
      }
    });
  };

  const handleExport = async () => {
    if (!onExport) return;

    try {
      const exportData = await onExport(selectedIds);
      downloadFile(exportData, `${title.toLowerCase()}-export`);
      notify.success('Export completed successfully');
    } catch (error) {
      notify.error('Failed to export data');
    }
  };

  const toggleCardExpansion = (id: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Render mobile card view
  const renderCardView = () => (
    <Stack gap="md">
      {data.records.map((record) => {
        const isExpanded = expandedCards.has(record.id);
        const isSelected = selectedIds.includes(record.id);

        return (
          <Paper
            key={record.id}
            shadow="xs"
            withBorder
            style={{
              backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
              borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
            }}
            p={{ base: 'xs', sm: 'md' }}
          >
            <Stack gap="xs">
              {/* Card Header */}
              <Group justify="space-between" wrap="nowrap">
                <Group style={{ minWidth: 0, flex: 1 }} gap="xs">
                  {(onBulkDelete || enableBulkEdit) && (
                    <Checkbox
                      onChange={() => handleSelect(record.id)}
                      aria-label={`Select ${record.name || record.id}`}
                      checked={isSelected}
                    />
                  )}
                  <Box style={{ minWidth: 0, flex: 1 }}>
                    {primaryColumns.map((col) => (
                      <Text
                        key={col.key}
                        fw={col === primaryColumns[0] ? 600 : 400}
                        size={col === primaryColumns[0] ? 'sm' : 'xs'}
                        truncate
                      >
                        {col.render ? col.render(record[col.key], record) : record[col.key]}
                      </Text>
                    ))}
                  </Box>
                </Group>

                <Group gap={4} wrap="nowrap">
                  {secondaryColumns.length > 0 && (
                    <ActionIcon
                      onClick={() => toggleCardExpansion(record.id)}
                      size="sm"
                      variant="subtle"
                    >
                      {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                    </ActionIcon>
                  )}

                  <Menu position="bottom-end" withinPortal>
                    <Menu.Target>
                      <ActionIcon size="sm" variant="subtle">
                        <IconDots size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {viewHref && (
                        <Menu.Item
                          leftSection={<IconEye size={14} />}
                          onClick={() => router.push(viewHref(record.id))}
                        >
                          View
                        </Menu.Item>
                      )}
                      {editHref && (
                        <Menu.Item
                          leftSection={<IconEdit size={14} />}
                          onClick={() => router.push(editHref(record.id))}
                        >
                          Edit
                        </Menu.Item>
                      )}
                      {onDelete && (
                        <>
                          <Menu.Divider />
                          <Menu.Item
                            color="red"
                            leftSection={<IconTrash size={14} />}
                            onClick={() => {
                              modals.open({
                                children: (
                                  <DeleteConfirmation
                                    modelKey={modelKey}
                                    onCancel={() => modals.closeAll()}
                                    onConfirm={async () => {
                                      await onDelete(record.id);
                                      modals.closeAll();
                                    }}
                                    recordId={record.id}
                                    recordName={record.name || record.title || record.id}
                                  />
                                ),
                                title: 'Confirm Delete',
                              });
                            }}
                          >
                            Delete
                          </Menu.Item>
                        </>
                      )}
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Group>

              {/* Expandable content */}
              <Collapse in={isExpanded}>
                <Divider my="xs" />
                <Grid gutter="xs">
                  {secondaryColumns.map((col) => (
                    <Grid.Col key={col.key} span={{ base: 12, xs: 6 }}>
                      <Text c="dimmed" size="xs">
                        {col.label}
                      </Text>
                      <Text size="sm">
                        {col.render ? col.render(record[col.key], record) : record[col.key] || '—'}
                      </Text>
                    </Grid.Col>
                  ))}
                </Grid>
              </Collapse>
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );

  // Render desktop table view
  const renderTableView = () => (
    <ScrollArea>
      <Table highlightOnHover withColumnBorders={isDesktop} withTableBorder striped>
        <Table.Thead>
          <Table.Tr>
            {(onBulkDelete || enableBulkEdit) && (
              <Table.Th style={{ width: 40 }}>
                <Checkbox
                  onChange={handleSelectAll}
                  checked={selectedIds.length === data.records.length && data.records.length > 0}
                  indeterminate={selectedIds.length > 0 && selectedIds.length < data.records.length}
                />
              </Table.Th>
            )}
            {visibleColumns.map((column) => (
              <Table.Th
                key={column.key}
                onClick={() => column.sortable && handleSort(column.key)}
                style={{ width: column.width, cursor: column.sortable ? 'pointer' : undefined }}
              >
                <Group gap="xs" wrap="nowrap">
                  <Text fw={600} size="sm">
                    {column.label}
                  </Text>
                  {column.sortable && sortKey === column.key && (
                    <ActionIcon size="xs" variant="subtle">
                      {sortDirection === 'asc' ? (
                        <IconChevronUp size={14} />
                      ) : (
                        <IconChevronDown size={14} />
                      )}
                    </ActionIcon>
                  )}
                </Group>
              </Table.Th>
            ))}
            <Table.Th style={{ width: 100 }}>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.records.map((record) => (
            <Table.Tr key={record.id}>
              {(onBulkDelete || enableBulkEdit) && (
                <Table.Td>
                  <Checkbox
                    onChange={() => handleSelect(record.id)}
                    checked={selectedIds.includes(record.id)}
                  />
                </Table.Td>
              )}
              {visibleColumns.map((column) => (
                <Table.Td key={column.key}>
                  {column.render ? column.render(record[column.key], record) : record[column.key]}
                </Table.Td>
              ))}
              <Table.Td>
                <Group gap={4} wrap="nowrap">
                  {viewHref && (
                    <ActionIcon
                      onClick={() => router.push(viewHref(record.id))}
                      size="sm"
                      variant="subtle"
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                  )}
                  {editHref && (
                    <ActionIcon
                      onClick={() => router.push(editHref(record.id))}
                      size="sm"
                      variant="subtle"
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  )}
                  {onDelete && (
                    <ActionIcon
                      color="red"
                      onClick={() => {
                        modals.open({
                          children: (
                            <DeleteConfirmation
                              modelKey={modelKey}
                              onCancel={() => modals.closeAll()}
                              onConfirm={async () => {
                                await onDelete(record.id);
                                modals.closeAll();
                              }}
                              recordId={record.id}
                              recordName={record.name || record.title || record.id}
                            />
                          ),
                          title: 'Confirm Delete',
                        });
                      }}
                      size="sm"
                      variant="subtle"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  )}
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );

  return (
    <Card withBorder>
      <Stack gap="md">
        {/* Header */}
        <Box>
          <Group gap="xs" justify="space-between" mb="md" wrap="wrap">
            <Title order={3} size="h4">
              {title}
            </Title>
            {createHref && (
              <Button
                href={createHref}
                component={Link}
                leftSection={<IconPlus size={16} />}
                size={isMobile ? 'xs' : 'sm'}
              >
                {isMobile ? 'Add' : `Add ${title}`}
              </Button>
            )}
          </Group>

          {/* Search and filters */}
          <Group grow preventGrowOverflow={false} gap="xs">
            <TextInput
              leftSection={<IconSearch size={16} />}
              onChange={(e) => {
                setSearchQuery(e.currentTarget.value);
                onSearch?.(e.currentTarget.value);
              }}
              placeholder={searchPlaceholder}
              style={{ flex: 1 }}
              size={isMobile ? 'xs' : 'sm'}
              value={searchQuery}
            />

            {!isMobile && (
              <SegmentedControl
                onChange={(value) => setViewMode(value as any)}
                style={{ width: 'auto' }}
                data={[
                  { label: <IconLayoutGrid size={16} />, value: 'cards' },
                  { label: <IconLayoutList size={16} />, value: 'table' },
                ]}
                size="xs"
                value={viewMode}
              />
            )}
          </Group>
        </Box>

        {/* Bulk actions */}
        {selectedIds.length > 0 && (
          <Paper withBorder bg="blue.0" p="xs">
            <Group gap="xs" justify="space-between" wrap="wrap">
              <Text fw={500} size="sm">
                {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected
              </Text>
              <Group gap="xs">
                {onExport && (
                  <Button
                    leftSection={<IconDownload size={14} />}
                    onClick={handleExport}
                    size="xs"
                    variant="subtle"
                  >
                    Export
                  </Button>
                )}
                {onBulkDelete && (
                  <Button
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => {
                      modals.openConfirmModal({
                        children: (
                          <Text size="sm">
                            Are you sure you want to delete {selectedIds.length} selected items?
                            This action cannot be undone.
                          </Text>
                        ),
                        confirmProps: { color: 'red' },
                        labels: { cancel: 'Cancel', confirm: 'Delete' },
                        onConfirm: handleBulkDelete,
                        title: 'Delete selected items',
                      });
                    }}
                    size="xs"
                    variant="subtle"
                  >
                    Delete
                  </Button>
                )}
              </Group>
            </Group>
          </Paper>
        )}

        {/* Data display */}
        {loading ? (
          <Group justify="center" py="xl">
            <Text c="dimmed" size="sm">
              Loading...
            </Text>
          </Group>
        ) : data.records.length === 0 ? (
          <Paper withBorder style={{ textAlign: 'center' }} p="xl">
            <Text c="dimmed">No records found</Text>
          </Paper>
        ) : effectiveView === 'cards' ? (
          renderCardView()
        ) : (
          renderTableView()
        )}

        {/* Pagination */}
        {data.total > data.limit && (
          <Group justify="center" mt="md">
            <Pagination
              boundaries={isMobile ? 0 : 1}
              onChange={(page) => onPageChange?.(page)}
              total={Math.ceil(data.total / data.limit)}
              siblings={isMobile ? 0 : 1}
              size={isMobile ? 'sm' : 'md'}
              value={data.page}
            />
          </Group>
        )}
      </Stack>
    </Card>
  );
}
