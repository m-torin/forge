'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Center,
  Checkbox,
  Group,
  Loader,
  Menu,
  Modal,
  MultiSelect,
  Pagination,
  rem,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import {
  IconArchive,
  IconCalendar,
  IconChartBar,
  IconCopy,
  IconDots,
  IconDownload,
  IconEdit,
  IconEye,
  IconFileTypeCsv,
  IconFileText,
  IconFilter,
  IconPackage,
  IconPlus,
  IconSearch,
  IconTag,
  IconTrash,
} from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';

import {
  bulkDeleteTaxonomies,
  bulkUpdateTaxonomyStatus,
  deleteTaxonomy,
  duplicateTaxonomy,
  exportTaxonomies,
  getTaxonomies,
  getTaxonomyStats,
  searchTaxonomies,
} from '../taxonomies/actions';
import {
  getStatusColor,
  getTaxonomyTypeColor,
  showDeleteConfirmModal,
  showErrorNotification,
  showSuccessNotification,
  sortTableData,
} from '../utils/pim-helpers';
import {
  getSelectAllCheckboxProps,
  setSorting,
  Th,
  toggleAllRows,
  toggleRowSelection,
  useTableForm,
} from '../utils/table-helpers';

import { TaxonomyBulkAssignModal } from './TaxonomyBulkAssignModal';
import { TaxonomyDetailsDrawer } from './TaxonomyDetailsDrawer';
import { TaxonomyFormModal } from './TaxonomyForm';
import { TaxonomyHierarchyView } from './TaxonomyHierarchyView';

import type { ContentStatus, Media, Taxonomy, TaxonomyType } from '@repo/database/prisma';

interface TaxonomyWithRelations extends Taxonomy {
  _count: {
    products: number;
    collections: number;
  };
  media: Pick<Media, 'id' | 'url' | 'type' | 'altText'>[];
}

interface TaxonomyTableFilters {
  page: number;
  reverseSortDirection: boolean;
  search: string;
  selectedRows: string[];
  sortBy: string | null;
  statusFilter: ContentStatus | '';
  typeFilter: TaxonomyType | '';
}

/**
 * TaxonomiesTable component for managing taxonomies
 * Provides search, filtering, sorting, and bulk operations on taxonomies
 */
export function TaxonomiesTable() {
  const [taxonomies, setTaxonomies] = useState<TaxonomyWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [taxonomyModalOpened, setTaxonomyModalOpened] = useState(false);
  const [detailsModalOpened, setDetailsModalOpened] = useState(false);
  const [editingTaxonomy, setEditingTaxonomy] = useState<TaxonomyWithRelations | null>(null);
  const [viewingTaxonomy, setViewingTaxonomy] = useState<TaxonomyWithRelations | null>(null);
  const [duplicateMode, setDuplicateMode] = useState(false);
  const [statsModalOpened, setStatsModalOpened] = useState(false);
  const [advancedFiltersOpened, setAdvancedFiltersOpened] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'table' | 'hierarchy'>('table');
  const [bulkAssignModalOpened, setBulkAssignModalOpened] = useState(false);
  const [bulkAssignType, setBulkAssignType] = useState<'products' | 'collections'>('products');
  const [advancedFilters, setAdvancedFilters] = useState({
    types: [] as TaxonomyType[],
    createdAfter: '',
    createdBefore: '',
    hasCollections: undefined as boolean | undefined,
    hasMedia: undefined as boolean | undefined,
    hasProducts: undefined as boolean | undefined,
    statuses: [] as ContentStatus[],
  });
  const [exportLoading, setExportLoading] = useState(false);

  // Consolidate all filter and table state into a single form
  const form = useTableForm<TaxonomyTableFilters>({
    typeFilter: '',
    statusFilter: '',
  });

  const loadTaxonomies = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTaxonomies({
        type: (form.values.typeFilter as TaxonomyType) || undefined,
        limit: 10,
        page: form.values.page,
        search: form.values.search,
        status: (form.values.statusFilter as ContentStatus) || undefined,
      });

      if (result.success && result.data) {
        setTaxonomies(result.data);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
        }
      } else {
        showErrorNotification('Failed to load taxonomies');
      }
    } catch (error) {
      showErrorNotification('Failed to load taxonomies');
    } finally {
      setLoading(false);
    }
  }, [form.values.search, form.values.statusFilter, form.values.typeFilter, form.values.page]);

  useEffect(() => {
    loadTaxonomies();
  }, [loadTaxonomies]);

  const handleDelete = async (id: string) => {
    showDeleteConfirmModal('taxonomy', async () => {
      const result = await deleteTaxonomy(id);
      if (result.success) {
        showSuccessNotification('Taxonomy deleted successfully');
        loadTaxonomies();
      } else {
        showErrorNotification(result.error || 'Failed to delete taxonomy');
      }
    });
  };

  const handleBulkStatusUpdate = async (status: ContentStatus) => {
    if (form.values.selectedRows.length === 0) return;

    const result = await bulkUpdateTaxonomyStatus(form.values.selectedRows, status);
    if (result.success) {
      showSuccessNotification(`Updated ${form.values.selectedRows.length} taxonomies`);
      form.setFieldValue('selectedRows', []);
      loadTaxonomies();
    } else {
      showErrorNotification(result.error || 'Failed to update taxonomies');
    }
  };

  const handleBulkDelete = async () => {
    if (form.values.selectedRows.length === 0) return;

    showDeleteConfirmModal(`${form.values.selectedRows.length} taxonomies`, async () => {
      const result = await bulkDeleteTaxonomies(form.values.selectedRows);
      if (result.success) {
        showSuccessNotification(`Deleted ${form.values.selectedRows.length} taxonomies`);
        form.setFieldValue('selectedRows', []);
        loadTaxonomies();
      } else {
        showErrorNotification(result.error || 'Failed to delete taxonomies');
      }
    });
  };

  const handleDuplicate = async (taxonomy: TaxonomyWithRelations) => {
    const result = await duplicateTaxonomy(taxonomy.id);
    if (result.success) {
      showSuccessNotification('Taxonomy duplicated successfully');
      loadTaxonomies();
    } else {
      showErrorNotification(result.error || 'Failed to duplicate taxonomy');
    }
  };

  const loadStats = useCallback(async () => {
    try {
      const result = await getTaxonomyStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      showErrorNotification('Failed to load taxonomy statistics');
    }
  }, []);

  const handleExport = async (format: 'csv' | 'json') => {
    setExportLoading(true);
    try {
      const result = await exportTaxonomies(format, {
        type: (form.values.typeFilter as TaxonomyType) || undefined,
        includeDeleted: false,
        status: (form.values.statusFilter as ContentStatus) || undefined,
      });

      if (result.success && result.data) {
        if (format === 'json') {
          const blob = new Blob([JSON.stringify(result.data, null, 2)], {
            type: 'application/json',
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `taxonomies-export-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          // CSV format
          const headers = result.data.headers.join(',');
          const rows = result.data.csvData.map((row: any) =>
            Object.values(row)
              .map((value) =>
                typeof value === 'string' && value.includes(',')
                  ? `"${value.replace(/"/g, '""')}"`
                  : value,
              )
              .join(','),
          );
          const csvContent = [headers, ...rows].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `taxonomies-export-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }

        showSuccessNotification(`Taxonomies exported as ${format.toUpperCase()}`);
      } else {
        showErrorNotification(
          result.error || `Failed to export taxonomies as ${format.toUpperCase()}`,
        );
      }
    } catch (error) {
      showErrorNotification(`Failed to export taxonomies as ${format.toUpperCase()}`);
    } finally {
      setExportLoading(false);
    }
  };

  const applyAdvancedFilters = async () => {
    try {
      const result = await searchTaxonomies({
        types: advancedFilters.types.length > 0 ? advancedFilters.types : undefined,
        createdAfter: advancedFilters.createdAfter
          ? new Date(advancedFilters.createdAfter)
          : undefined,
        createdBefore: advancedFilters.createdBefore
          ? new Date(advancedFilters.createdBefore)
          : undefined,
        hasCollections: advancedFilters.hasCollections,
        hasMedia: advancedFilters.hasMedia,
        hasProducts: advancedFilters.hasProducts,
        limit: 10,
        page: form.values.page,
        query: form.values.search,
        statuses: advancedFilters.statuses.length > 0 ? advancedFilters.statuses : undefined,
      });

      if (result.success && result.data) {
        setTaxonomies(result.data);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
        }
        setAdvancedFiltersOpened(false);
        showSuccessNotification('Advanced filters applied');
      } else {
        showErrorNotification(result.error || 'Failed to apply advanced filters');
      }
    } catch (error) {
      showErrorNotification('Failed to apply advanced filters');
    }
  };

  useEffect(() => {
    if (statsModalOpened) {
      loadStats();
    }
  }, [statsModalOpened, loadStats]);

  const sortedData = sortTableData(
    taxonomies,
    form.values.sortBy as keyof TaxonomyWithRelations,
    form.values.reverseSortDirection,
  );

  const getTotalItems = (taxonomy: TaxonomyWithRelations) => {
    return taxonomy._count.products + taxonomy._count.collections;
  };

  const rows = sortedData.map((taxonomy) => {
    const selected = form.values.selectedRows.includes(taxonomy.id);
    const totalItems = getTotalItems(taxonomy);

    return (
      <Table.Tr key={taxonomy.id} bg={selected ? 'blue.0' : undefined}>
        <Table.Td>
          <Checkbox
            onChange={(event) => toggleRowSelection(form, taxonomy.id, event.currentTarget.checked)}
            checked={selected}
          />
        </Table.Td>
        <Table.Td>
          <Group gap="sm">
            <div>
              <Text fw={500} fz="sm">
                {taxonomy.name}
              </Text>
              <Text c="dimmed" fz="xs">
                /{taxonomy.slug}
              </Text>
            </div>
          </Group>
        </Table.Td>
        <Table.Td>
          <Badge color={getTaxonomyTypeColor(taxonomy.type)} variant="light">
            {taxonomy.type}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Badge color={getStatusColor(taxonomy.status)} variant="light">
            {taxonomy.status}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Group gap="xs">
            <Tooltip label="Products">
              <Badge color="blue" variant="outline">
                {taxonomy._count.products} products
              </Badge>
            </Tooltip>
            {taxonomy._count.collections > 0 && (
              <Tooltip label="Collections">
                <Badge color="purple" variant="outline">
                  {taxonomy._count.collections} collections
                </Badge>
              </Tooltip>
            )}
          </Group>
        </Table.Td>
        <Table.Td>
          <Text fw={500}>{totalItems}</Text>
        </Table.Td>
        <Table.Td>
          {taxonomy.media && taxonomy.media.length > 0 ? (
            <Badge color="green" variant="dot">
              Has media
            </Badge>
          ) : (
            <Text c="dimmed" size="sm">
              No media
            </Text>
          )}
        </Table.Td>
        <Table.Td>
          <Group gap={0} justify="flex-end">
            <ActionIcon
              color="gray"
              onClick={() => {
                setViewingTaxonomy(taxonomy);
                setDetailsModalOpened(true);
              }}
              variant="subtle"
            >
              <IconEye style={{ width: rem(16), height: rem(16) }} />
            </ActionIcon>
            <ActionIcon
              color="gray"
              onClick={() => {
                setEditingTaxonomy(taxonomy);
                setTaxonomyModalOpened(true);
              }}
              variant="subtle"
            >
              <IconEdit style={{ width: rem(16), height: rem(16) }} />
            </ActionIcon>
            <Menu position="bottom-end" shadow="sm" withinPortal>
              <Menu.Target>
                <ActionIcon color="gray" variant="subtle">
                  <IconDots style={{ width: rem(16), height: rem(16) }} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconCopy style={{ width: rem(14), height: rem(14) }} />}
                  onClick={() => handleDuplicate(taxonomy)}
                >
                  Duplicate
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconArchive style={{ width: rem(14), height: rem(14) }} />}
                  onClick={() => handleBulkStatusUpdate('ARCHIVED')}
                >
                  Archive
                </Menu.Item>
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                  onClick={() => handleDelete(taxonomy.id)}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Stack>
      <Group justify="space-between">
        <Group>
          <TextInput
            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} />}
            onChange={(e) => form.setFieldValue('search', e.currentTarget.value)}
            placeholder="Search taxonomies..."
            style={{ width: rem(250) }}
            value={form.values.search}
          />
          <Select
            onChange={(value) => form.setFieldValue('statusFilter', value as ContentStatus | '')}
            placeholder="Filter by status"
            style={{ width: rem(150) }}
            clearable
            data={[
              { label: 'All statuses', value: '' },
              { label: 'Draft', value: 'DRAFT' },
              { label: 'Published', value: 'PUBLISHED' },
              { label: 'Archived', value: 'ARCHIVED' },
            ]}
            value={form.values.statusFilter}
          />
          <Select
            onChange={(value) => form.setFieldValue('typeFilter', value as TaxonomyType | '')}
            placeholder="Filter by type"
            style={{ width: rem(150) }}
            clearable
            data={[
              { label: 'All types', value: '' },
              { label: 'Category', value: 'CATEGORY' },
              { label: 'Tag', value: 'TAG' },
              { label: 'Attribute', value: 'ATTRIBUTE' },
              { label: 'Department', value: 'DEPARTMENT' },
              { label: 'Collection', value: 'COLLECTION' },
              { label: 'Other', value: 'OTHER' },
            ]}
            value={form.values.typeFilter}
          />
        </Group>
        <Group>
          {form.values.selectedRows.length > 0 && (
            <Group>
              <Text c="dimmed" size="sm">
                {form.values.selectedRows.length} selected
              </Text>
              <Menu position="bottom-end" shadow="sm" withinPortal>
                <Menu.Target>
                  <Button size="sm" variant="light">
                    Bulk Actions
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Update Status</Menu.Label>
                  <Menu.Item onClick={() => handleBulkStatusUpdate('PUBLISHED')}>
                    Set Published
                  </Menu.Item>
                  <Menu.Item onClick={() => handleBulkStatusUpdate('DRAFT')}>Set Draft</Menu.Item>
                  <Menu.Item onClick={() => handleBulkStatusUpdate('ARCHIVED')}>Archive</Menu.Item>
                  <Menu.Divider />
                  <Menu.Label>Assignments</Menu.Label>
                  <Menu.Item
                    leftSection={<IconPackage style={{ width: rem(14), height: rem(14) }} />}
                    onClick={() => {
                      setBulkAssignType('products');
                      setBulkAssignModalOpened(true);
                    }}
                  >
                    Assign to Products
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconTag style={{ width: rem(14), height: rem(14) }} />}
                    onClick={() => {
                      setBulkAssignType('collections');
                      setBulkAssignModalOpened(true);
                    }}
                  >
                    Assign to Collections
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                    onClick={handleBulkDelete}
                  >
                    Delete Selected
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          )}

          <Group>
            <Menu position="bottom-end" shadow="sm" withinPortal>
              <Menu.Target>
                <Button
                  leftSection={<IconDownload size={16} />}
                  loading={exportLoading}
                  size="sm"
                  variant="light"
                >
                  Export
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconFileTypeCsv size={14} />}
                  onClick={() => handleExport('csv')}
                >
                  Export as CSV
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconFileText size={14} />}
                  onClick={() => handleExport('json')}
                >
                  Export as JSON
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Button
              leftSection={<IconChartBar size={16} />}
              onClick={() => setStatsModalOpened(true)}
              size="sm"
              variant="light"
            >
              Statistics
            </Button>

            <Button
              leftSection={<IconFilter size={16} />}
              onClick={() => setAdvancedFiltersOpened(true)}
              size="sm"
              variant="light"
            >
              Advanced Filters
            </Button>

            <Switch
              description="Note: Hierarchical relationships will be fully functional when schema is updated"
              onChange={(event) => setViewMode(event.currentTarget.checked ? 'hierarchy' : 'table')}
              checked={viewMode === 'hierarchy'}
              label="Hierarchy View"
            />

            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                setEditingTaxonomy(null);
                setDuplicateMode(false);
                setTaxonomyModalOpened(true);
              }}
            >
              Add Taxonomy
            </Button>
          </Group>
        </Group>
      </Group>

      {viewMode === 'hierarchy' ? (
        <TaxonomyHierarchyView
          onAddChild={(parentTaxonomy) => {
            // Set up form to create child taxonomy
            setEditingTaxonomy(null);
            setDuplicateMode(false);
            setTaxonomyModalOpened(true);
            // Note: Parent would be set in form when hierarchical support is added
          }}
          onDelete={handleDelete}
          onDuplicate={(taxonomy) => handleDuplicate(taxonomy as TaxonomyWithRelations)}
          onEdit={(taxonomy) => {
            setEditingTaxonomy(taxonomy as TaxonomyWithRelations);
            setDuplicateMode(false);
            setTaxonomyModalOpened(true);
          }}
          onView={(taxonomy) => {
            setViewingTaxonomy(taxonomy as TaxonomyWithRelations);
            setDetailsModalOpened(true);
          }}
          typeFilter={(form.values.typeFilter as TaxonomyType) || undefined}
        />
      ) : (
        <ScrollArea>
          <Table highlightOnHover striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: rem(40) }}>
                  <Checkbox
                    onChange={(event) =>
                      toggleAllRows(
                        form,
                        taxonomies.map((t) => t.id),
                        event.currentTarget.checked,
                      )
                    }
                    {...getSelectAllCheckboxProps(form, taxonomies.length)}
                  />
                </Table.Th>
                <Th
                  onSort={() => setSorting(form, 'name')}
                  sorted={form.values.sortBy === 'name'}
                  reversed={form.values.reverseSortDirection}
                >
                  Name / Slug
                </Th>
                <Th
                  onSort={() => setSorting(form, 'type')}
                  sorted={form.values.sortBy === 'type'}
                  reversed={form.values.reverseSortDirection}
                >
                  Type
                </Th>
                <Th
                  onSort={() => setSorting(form, 'status')}
                  sorted={form.values.sortBy === 'status'}
                  reversed={form.values.reverseSortDirection}
                >
                  Status
                </Th>
                <Table.Th>Content</Table.Th>
                <Table.Th>Total Items</Table.Th>
                <Table.Th>Media</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                <Table.Tr>
                  <Table.Td colSpan={8}>
                    <Center py="xl">
                      <Loader />
                    </Center>
                  </Table.Td>
                </Table.Tr>
              ) : rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={8}>
                    <Text c="dimmed" fw={500} py="xl" ta="center">
                      No taxonomies found
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      )}

      {totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Pagination
            boundaries={1}
            onChange={(value) => form.setFieldValue('page', value)}
            total={totalPages}
            siblings={1}
            value={form.values.page}
          />
        </Group>
      )}

      <TaxonomyFormModal
        duplicateMode={duplicateMode}
        onClose={() => {
          setTaxonomyModalOpened(false);
          setEditingTaxonomy(null);
          setDuplicateMode(false);
        }}
        onSuccess={() => {
          loadTaxonomies();
          setTaxonomyModalOpened(false);
          setEditingTaxonomy(null);
          setDuplicateMode(false);
        }}
        opened={taxonomyModalOpened}
        taxonomy={editingTaxonomy}
      />

      <TaxonomyDetailsDrawer
        onClose={() => {
          setDetailsModalOpened(false);
          setViewingTaxonomy(null);
        }}
        onUpdate={loadTaxonomies}
        opened={detailsModalOpened}
        taxonomy={viewingTaxonomy}
      />

      {/* Statistics Modal */}
      <Modal
        onClose={() => setStatsModalOpened(false)}
        opened={statsModalOpened}
        size="lg"
        title="Taxonomy Statistics"
      >
        {stats ? (
          <Stack>
            <SimpleGrid cols={2}>
              <Card withBorder p="md">
                <Stack align="center">
                  <Text fw={700} size="xl">
                    {stats.total}
                  </Text>
                  <Text c="dimmed" size="sm">
                    Total Taxonomies
                  </Text>
                </Stack>
              </Card>
              <Card withBorder p="md">
                <Stack align="center">
                  <Text c="green" fw={700} size="xl">
                    {stats.published}
                  </Text>
                  <Text c="dimmed" size="sm">
                    Published
                  </Text>
                </Stack>
              </Card>
              <Card withBorder p="md">
                <Stack align="center">
                  <Text c="orange" fw={700} size="xl">
                    {stats.draft}
                  </Text>
                  <Text c="dimmed" size="sm">
                    Draft
                  </Text>
                </Stack>
              </Card>
              <Card withBorder p="md">
                <Stack align="center">
                  <Text c="blue" fw={700} size="xl">
                    {stats.recent}
                  </Text>
                  <Text c="dimmed" size="sm">
                    Recent (7 days)
                  </Text>
                </Stack>
              </Card>
            </SimpleGrid>

            <Card withBorder p="md">
              <Text fw={500} mb="md">
                By Type
              </Text>
              <Stack gap="sm">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <Group key={type} justify="space-between">
                    <Badge color={getTaxonomyTypeColor(type as any)} variant="light">
                      {type}
                    </Badge>
                    <Text fw={500}>{count as number}</Text>
                  </Group>
                ))}
              </Stack>
            </Card>
          </Stack>
        ) : (
          <Center h={200}>
            <Loader />
          </Center>
        )}
      </Modal>

      {/* Advanced Filters Modal */}
      <Modal
        onClose={() => setAdvancedFiltersOpened(false)}
        opened={advancedFiltersOpened}
        size="lg"
        title="Advanced Taxonomy Filters"
      >
        <Text c="dimmed" mb="md" size="sm">
          Use advanced filters to search taxonomies with specific criteria.
        </Text>
        <Stack>
          <MultiSelect
            onChange={(value) =>
              setAdvancedFilters((prev) => ({ ...prev, types: value as TaxonomyType[] }))
            }
            placeholder="Select types to filter by"
            data={[
              { label: 'Category', value: 'CATEGORY' },
              { label: 'Tag', value: 'TAG' },
              { label: 'Attribute', value: 'ATTRIBUTE' },
              { label: 'Department', value: 'DEPARTMENT' },
              { label: 'Collection', value: 'COLLECTION' },
              { label: 'Other', value: 'OTHER' },
            ]}
            label="Taxonomy Types"
            value={advancedFilters.types}
          />

          <MultiSelect
            onChange={(value) =>
              setAdvancedFilters((prev) => ({ ...prev, statuses: value as ContentStatus[] }))
            }
            placeholder="Select statuses to filter by"
            data={[
              { label: 'Draft', value: 'DRAFT' },
              { label: 'Published', value: 'PUBLISHED' },
              { label: 'Archived', value: 'ARCHIVED' },
            ]}
            label="Status"
            value={advancedFilters.statuses}
          />

          <Group grow>
            <Switch
              onChange={(event) =>
                setAdvancedFilters((prev) => ({
                  ...prev,
                  hasMedia: event.currentTarget.checked ? true : undefined,
                }))
              }
              checked={advancedFilters.hasMedia === true}
              label="Has Media"
            />
            <Switch
              onChange={(event) =>
                setAdvancedFilters((prev) => ({
                  ...prev,
                  hasProducts: event.currentTarget.checked ? true : undefined,
                }))
              }
              checked={advancedFilters.hasProducts === true}
              label="Has Products"
            />
            <Switch
              onChange={(event) =>
                setAdvancedFilters((prev) => ({
                  ...prev,
                  hasCollections: event.currentTarget.checked ? true : undefined,
                }))
              }
              checked={advancedFilters.hasCollections === true}
              label="Has Collections"
            />
          </Group>

          <Group grow>
            <TextInput
              description="Filter taxonomies created after this date"
              leftSection={<IconCalendar size={16} />}
              onChange={(event) =>
                setAdvancedFilters((prev) => ({
                  ...prev,
                  createdAfter: event.currentTarget.value,
                }))
              }
              placeholder="YYYY-MM-DD"
              label="Created After"
              type="date"
              value={advancedFilters.createdAfter}
            />
            <TextInput
              description="Filter taxonomies created before this date"
              leftSection={<IconCalendar size={16} />}
              onChange={(event) =>
                setAdvancedFilters((prev) => ({
                  ...prev,
                  createdBefore: event.currentTarget.value,
                }))
              }
              placeholder="YYYY-MM-DD"
              label="Created Before"
              type="date"
              value={advancedFilters.createdBefore}
            />
          </Group>

          <Group justify="space-between" mt="md">
            <Button
              onClick={() => {
                setAdvancedFilters({
                  types: [],
                  createdAfter: '',
                  createdBefore: '',
                  hasCollections: undefined,
                  hasMedia: undefined,
                  hasProducts: undefined,
                  statuses: [],
                });
              }}
              variant="subtle"
            >
              Clear Filters
            </Button>
            <Group>
              <Button onClick={() => setAdvancedFiltersOpened(false)} variant="subtle">
                Cancel
              </Button>
              <Button onClick={applyAdvancedFilters}>Apply Filters</Button>
            </Group>
          </Group>
        </Stack>
      </Modal>

      {/* Bulk Assignment Modal */}
      <TaxonomyBulkAssignModal
        onClose={() => setBulkAssignModalOpened(false)}
        opened={bulkAssignModalOpened}
        selectedTaxonomyIds={form.values.selectedRows}
        taxonomyCount={form.values.selectedRows.length}
      />
    </Stack>
  );
}
