'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Checkbox,
  Group,
  Menu,
  Modal,
  Pagination,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconDots,
  IconEdit,
  IconEye,
  IconMovie,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconWorld,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';

import {
  getSeries,
  createSeries,
  updateSeries,
  deleteSeries,
  getSeriesAnalytics,
} from '@/actions/pim3/actions';

interface SeriesTableProps {
  initialData?: any;
  showFilters?: boolean;
  onSeriesSelect?: (series: any) => void;
}

export function SeriesTable({ initialData, showFilters = true, onSeriesSelect }: SeriesTableProps) {
  const [data, setData] = useState(initialData?.data || []);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(
    initialData?.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 },
  );
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [fandomFilter, setFandomFilter] = useState('');
  const [fictionalFilter, setFictionalFilter] = useState<'all' | 'fictional' | 'real'>('all');

  // Modals
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);
  const [selectedSeries, setSelectedSeries] = useState<any>(null);

  // Analytics
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const result = await getSeries({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        fandomId: fandomFilter || undefined,
        isFictional:
          fictionalFilter === 'fictional' ? true : fictionalFilter === 'real' ? false : undefined,
        ...params,
      });

      if (result.success) {
        setData(result.data || []);
        setPagination(result.pagination || pagination);
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to load series',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load series',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const result = await getSeriesAnalytics();
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, fandomFilter, fictionalFilter, pagination.page]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteSeries(id);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Series deleted successfully',
          color: 'green',
        });
        fetchData();
        fetchAnalytics();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to delete series',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete series',
        color: 'red',
      });
    }
  };

  const handleEdit = (series: any) => {
    setSelectedSeries(series);
    openEditModal();
  };

  const handleFormSuccess = () => {
    closeEditModal();
    closeCreateModal();
    setSelectedSeries(null);
    fetchData();
    fetchAnalytics();
  };

  const allSelected = selectedItems.length === data.length && data.length > 0;
  const indeterminate = selectedItems.length > 0 && !allSelected;

  return (
    <Stack>
      {/* Analytics Cards */}
      {analytics && (
        <Group>
          <Card withBorder flex={1}>
            <Stack gap="xs">
              <Group gap="xs">
                <IconMovie size={16} />
                <Text size="sm" c="dimmed">
                  Total Series
                </Text>
              </Group>
              <Text size="xl" fw={700}>
                {analytics.totalSeries}
              </Text>
            </Stack>
          </Card>
          <Card withBorder flex={1}>
            <Stack gap="xs">
              <Group gap="xs">
                <IconWorld size={16} />
                <Text size="sm" c="dimmed">
                  Fictional
                </Text>
              </Group>
              <Text size="xl" fw={700} c="violet">
                {analytics.fictionalSeries}
              </Text>
            </Stack>
          </Card>
          <Card withBorder flex={1}>
            <Stack gap="xs">
              <Group gap="xs">
                <IconMovie size={16} />
                <Text size="sm" c="dimmed">
                  With Stories
                </Text>
              </Group>
              <Text size="xl" fw={700}>
                {analytics.seriesWithStories}
              </Text>
            </Stack>
          </Card>
          <Card withBorder flex={1}>
            <Stack gap="xs">
              <Group gap="xs">
                <IconMovie size={16} />
                <Text size="sm" c="dimmed">
                  With Products
                </Text>
              </Group>
              <Text size="xl" fw={700}>
                {analytics.seriesWithProducts}
              </Text>
            </Stack>
          </Card>
        </Group>
      )}

      {/* Header */}
      <Group justify="space-between">
        <Text size="xl" fw={700}>
          Series Management
        </Text>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
          Add Series
        </Button>
      </Group>

      {/* Filters */}
      {showFilters && (
        <Card withBorder>
          <Group>
            <TextInput
              placeholder="Search series..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Filter by fandom"
              data={[
                { value: '', label: 'All Fandoms' },
                // TODO: Add dynamic fandom options
              ]}
              value={fandomFilter}
              onChange={(value) => setFandomFilter(value || '')}
            />
            <Select
              placeholder="Fictional filter"
              data={[
                { value: 'all', label: 'All Series' },
                { value: 'fictional', label: 'Fictional' },
                { value: 'real', label: 'Real World' },
              ]}
              value={fictionalFilter}
              onChange={(value) => setFictionalFilter(value as any)}
            />
            <Button
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={() => fetchData()}
              loading={loading}
            >
              Refresh
            </Button>
          </Group>
        </Card>
      )}

      {/* Main Table */}
      <Card withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <Checkbox
                  checked={allSelected}
                  indeterminate={indeterminate}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(data.map((item: any) => item.id));
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                />
              </Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Fandom</Table.Th>
              <Table.Th>Fictional</Table.Th>
              <Table.Th>Stories</Table.Th>
              <Table.Th>Products</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th width={100}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((item: any) => {
              const isSelected = selectedItems.includes(item.id);

              return (
                <Table.Tr
                  key={item.id}
                  style={{
                    cursor: onSeriesSelect ? 'pointer' : undefined,
                    backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
                  }}
                  onClick={() => onSeriesSelect?.(item)}
                >
                  <Table.Td>
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          setSelectedItems([...selectedItems, item.id]);
                        } else {
                          setSelectedItems(selectedItems.filter((id) => id !== item.id));
                        }
                      }}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={2}>
                      <Text fw={500} size="sm">
                        {item.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {item.slug}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    {item.fandom ? (
                      <Text size="sm">{item.fandom.name}</Text>
                    ) : (
                      <Text size="sm" c="dimmed">
                        No fandom
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Badge color={item.isFictional ? 'violet' : 'blue'} size="sm" variant="light">
                      {item.isFictional ? 'Fictional' : 'Real World'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {item._count?.stories || 0}
                    </Text>
                    {item.stories?.length > 0 && (
                      <Text size="xs" c="dimmed">
                        Latest: {item.stories[0].name}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {item._count?.products || 0}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Menu withinPortal>
                        <Menu.Target>
                          <ActionIcon variant="subtle" size="sm">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEye size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSeriesSelect?.(item);
                            }}
                          >
                            View Details
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconEdit size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(item);
                            }}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>

        {data.length === 0 && !loading && (
          <Stack align="center" py="xl">
            <IconMovie size={48} color="gray" />
            <Text c="dimmed">No series found</Text>
          </Stack>
        )}
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Group justify="center">
          <Pagination
            total={pagination.totalPages}
            value={pagination.page}
            onChange={(page) => setPagination({ ...pagination, page })}
          />
        </Group>
      )}

      {/* Create Modal */}
      <Modal opened={createModalOpened} onClose={closeCreateModal} title="Create Series" size="lg">
        <SimpleSeriesForm onSuccess={handleFormSuccess} onCancel={closeCreateModal} />
      </Modal>

      {/* Edit Modal */}
      <Modal opened={editModalOpened} onClose={closeEditModal} title="Edit Series" size="lg">
        {selectedSeries && (
          <SimpleSeriesForm
            initialData={selectedSeries}
            onSuccess={handleFormSuccess}
            onCancel={closeEditModal}
          />
        )}
      </Modal>
    </Stack>
  );
}

// Simple series form component
function SimpleSeriesForm({
  initialData,
  onSuccess,
  onCancel,
}: {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    isFictional: initialData?.isFictional ?? true,
    fandomId: initialData?.fandomId || '',
  });
  const [loading, setLoading] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        fandomId: formData.fandomId || undefined,
      };

      const result = initialData
        ? await updateSeries(initialData.id, submitData)
        : await createSeries(submitData);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: `Series ${initialData ? 'updated' : 'created'} successfully`,
          color: 'green',
        });
        onSuccess();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || `Failed to ${initialData ? 'update' : 'create'} series`,
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: `Failed to ${initialData ? 'update' : 'create'} series`,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput
          label="Name"
          placeholder="Enter series name"
          required
          value={formData.name}
          onChange={(e) => {
            const name = e.target.value;
            setFormData({
              ...formData,
              name,
              slug: formData.slug || generateSlug(name),
            });
          }}
        />

        <TextInput
          label="Slug"
          placeholder="series-slug"
          required
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
        />

        <Select
          label="Fandom"
          placeholder="Select fandom (optional)"
          data={[
            { value: '', label: 'No fandom' },
            // TODO: Add dynamic fandom options
          ]}
          value={formData.fandomId}
          onChange={(value) => setFormData({ ...formData, fandomId: value || '' })}
        />

        <Checkbox
          label="Fictional Series"
          checked={formData.isFictional}
          onChange={(e) => setFormData({ ...formData, isFictional: e.target.checked })}
        />

        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initialData ? 'Update' : 'Create'} Series
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
