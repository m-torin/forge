'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Checkbox,
  Flex,
  Group,
  Menu,
  Pagination,
  ScrollArea,
  Table,
  Text,
  TextInput,
  Stack,
  Box,
  Paper,
  Collapse,
  Grid,
  Title,
  Divider,
  SegmentedControl,
  Container,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconDownload,
  IconEdit,
  IconEye,
  IconPlus,
  IconSearch,
  IconTrash,
  IconLayoutGrid,
  IconLayoutList,
  IconChevronDown,
  IconChevronUp,
  IconDots,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useMediaQuery, useDisclosure } from '@mantine/hooks';

import { notify } from '@repo/notifications/mantine-notifications';
import { downloadFile } from './ExportHandler';
import { DeleteConfirmation } from './DeleteConfirmation';

interface Column {
  key: string;
  label: string;
  render?: (value: any, record: any) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  priority?: 'high' | 'medium' | 'low'; // For responsive hiding
  hiddenBelow?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; // Hide on small screens
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
  loading?: boolean;
  modelKey?: string;
  onDelete?: (id: string) => Promise<void>;
  onBulkDelete?: (ids: string[]) => Promise<void>;
  onExport?: (ids: string[]) => Promise<any[]>;
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  title: string;
  viewHref?: (id: string) => string;
  editHref?: (id: string) => string;
  // Mobile-specific props
  mobileView?: 'cards' | 'list' | 'table';
  enableBulkEdit?: boolean;
  searchPlaceholder?: string;
}

export function ResponsiveDataTable({
  columns,
  createHref,
  data,
  loading = false,
  modelKey,
  onDelete,
  onBulkDelete,
  onExport,
  onPageChange,
  onSearch,
  onSort,
  title,
  viewHref,
  editHref,
  mobileView = 'cards',
  enableBulkEdit = false,
  searchPlaceholder = 'Search...',
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
    const breakpoints = { xs: 576, sm: 768, md: 992, lg: 1200, xl: 1400 };
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
            p={{ base: 'xs', sm: 'md' }}
            withBorder
            style={{
              borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
              backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
            }}
          >
            <Stack gap="xs">
              {/* Card Header */}
              <Group justify="space-between" wrap="nowrap">
                <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
                  {(onBulkDelete || enableBulkEdit) && (
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleSelect(record.id)}
                      aria-label={`Select ${record.name || record.id}`}
                    />
                  )}
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    {primaryColumns.map((col) => (
                      <Text
                        key={col.key}
                        size={col === primaryColumns[0] ? 'sm' : 'xs'}
                        fw={col === primaryColumns[0] ? 600 : 400}
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
                      variant="subtle"
                      size="sm"
                      onClick={() => toggleCardExpansion(record.id)}
                    >
                      {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                    </ActionIcon>
                  )}

                  <Menu position="bottom-end" withinPortal>
                    <Menu.Target>
                      <ActionIcon variant="subtle" size="sm">
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
                                title: 'Confirm Delete',
                                children: (
                                  <DeleteConfirmation
                                    modelKey={modelKey}
                                    recordId={record.id}
                                    recordName={record.name || record.title || record.id}
                                    onConfirm={async () => {
                                      await onDelete(record.id);
                                      modals.closeAll();
                                    }}
                                    onCancel={() => modals.closeAll()}
                                  />
                                ),
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
                      <Text size="xs" c="dimmed">
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
      <Table striped highlightOnHover withTableBorder withColumnBorders={isDesktop}>
        <Table.Thead>
          <Table.Tr>
            {(onBulkDelete || enableBulkEdit) && (
              <Table.Th style={{ width: 40 }}>
                <Checkbox
                  checked={selectedIds.length === data.records.length && data.records.length > 0}
                  indeterminate={selectedIds.length > 0 && selectedIds.length < data.records.length}
                  onChange={handleSelectAll}
                />
              </Table.Th>
            )}
            {visibleColumns.map((column) => (
              <Table.Th
                key={column.key}
                style={{ width: column.width, cursor: column.sortable ? 'pointer' : undefined }}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <Group gap="xs" wrap="nowrap">
                  <Text size="sm" fw={600}>
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
                    checked={selectedIds.includes(record.id)}
                    onChange={() => handleSelect(record.id)}
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
                      variant="subtle"
                      size="sm"
                      onClick={() => router.push(viewHref(record.id))}
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                  )}
                  {editHref && (
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => router.push(editHref(record.id))}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  )}
                  {onDelete && (
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      color="red"
                      onClick={() => {
                        modals.open({
                          title: 'Confirm Delete',
                          children: (
                            <DeleteConfirmation
                              modelKey={modelKey}
                              recordId={record.id}
                              recordName={record.name || record.title || record.id}
                              onConfirm={async () => {
                                await onDelete(record.id);
                                modals.closeAll();
                              }}
                              onCancel={() => modals.closeAll()}
                            />
                          ),
                        });
                      }}
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
          <Group justify="space-between" mb="md" wrap="wrap" gap="xs">
            <Title order={3} size="h4">
              {title}
            </Title>
            {createHref && (
              <Button
                component={Link}
                href={createHref}
                leftSection={<IconPlus size={16} />}
                size={isMobile ? 'xs' : 'sm'}
              >
                {isMobile ? 'Add' : `Add ${title}`}
              </Button>
            )}
          </Group>

          {/* Search and filters */}
          <Group gap="xs" grow preventGrowOverflow={false}>
            <TextInput
              placeholder={searchPlaceholder}
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.currentTarget.value);
                onSearch?.(e.currentTarget.value);
              }}
              size={isMobile ? 'xs' : 'sm'}
              style={{ flex: 1 }}
            />

            {!isMobile && (
              <SegmentedControl
                value={viewMode}
                onChange={(value) => setViewMode(value as any)}
                data={[
                  { value: 'cards', label: <IconLayoutGrid size={16} /> },
                  { value: 'table', label: <IconLayoutList size={16} /> },
                ]}
                size="xs"
                style={{ width: 'auto' }}
              />
            )}
          </Group>
        </Box>

        {/* Bulk actions */}
        {selectedIds.length > 0 && (
          <Paper p="xs" withBorder bg="blue.0">
            <Group justify="space-between" wrap="wrap" gap="xs">
              <Text size="sm" fw={500}>
                {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected
              </Text>
              <Group gap="xs">
                {onExport && (
                  <Button
                    size="xs"
                    variant="subtle"
                    leftSection={<IconDownload size={14} />}
                    onClick={handleExport}
                  >
                    Export
                  </Button>
                )}
                {onBulkDelete && (
                  <Button
                    size="xs"
                    color="red"
                    variant="subtle"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => {
                      modals.openConfirmModal({
                        title: 'Delete selected items',
                        children: (
                          <Text size="sm">
                            Are you sure you want to delete {selectedIds.length} selected items?
                            This action cannot be undone.
                          </Text>
                        ),
                        labels: { confirm: 'Delete', cancel: 'Cancel' },
                        confirmProps: { color: 'red' },
                        onConfirm: handleBulkDelete,
                      });
                    }}
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
            <Text size="sm" c="dimmed">
              Loading...
            </Text>
          </Group>
        ) : data.records.length === 0 ? (
          <Paper p="xl" withBorder style={{ textAlign: 'center' }}>
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
              value={data.page}
              onChange={(page) => onPageChange?.(page)}
              total={Math.ceil(data.total / data.limit)}
              size={isMobile ? 'sm' : 'md'}
              siblings={isMobile ? 0 : 1}
              boundaries={isMobile ? 0 : 1}
            />
          </Group>
        )}
      </Stack>
    </Card>
  );
}
