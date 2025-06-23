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
  IconBook,
  IconDots,
  IconEdit,
  IconEye,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconWorld,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';

import {
  getStories,
  createStory,
  updateStory,
  deleteStory,
  getStoryAnalytics,
} from '@/actions/pim3/actions';

interface StoryTableProps {
  initialData?: any;
  showFilters?: boolean;
  onStorySelect?: (story: any) => void;
}

export function StoryTable({ initialData, showFilters = true, onStorySelect }: StoryTableProps) {
  const [data, setData] = useState(initialData?.data || []);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(
    initialData?.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 },
  );
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [seriesFilter, setSeriesFilter] = useState('');
  const [fictionalFilter, setFictionalFilter] = useState<'all' | 'fictional' | 'real'>('all');

  // Modals
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);

  // Analytics
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const result = await getStories({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        seriesId: seriesFilter || undefined,
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
          message: result.error || 'Failed to load stories',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load stories',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const result = await getStoryAnalytics();
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, seriesFilter, fictionalFilter, pagination.page]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteStory(id);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Story deleted successfully',
          color: 'green',
        });
        fetchData();
        fetchAnalytics();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to delete story',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete story',
        color: 'red',
      });
    }
  };

  const handleEdit = (story: any) => {
    setSelectedStory(story);
    openEditModal();
  };

  const handleFormSuccess = () => {
    closeEditModal();
    closeCreateModal();
    setSelectedStory(null);
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
                <IconBook size={16} />
                <Text size="sm" c="dimmed">
                  Total Stories
                </Text>
              </Group>
              <Text size="xl" fw={700}>
                {analytics.totalStories}
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
                {analytics.fictionalStories}
              </Text>
            </Stack>
          </Card>
          <Card withBorder flex={1}>
            <Stack gap="xs">
              <Group gap="xs">
                <IconBook size={16} />
                <Text size="sm" c="dimmed">
                  With Series
                </Text>
              </Group>
              <Text size="xl" fw={700}>
                {analytics.storiesWithSeries}
              </Text>
            </Stack>
          </Card>
          <Card withBorder flex={1}>
            <Stack gap="xs">
              <Group gap="xs">
                <IconBook size={16} />
                <Text size="sm" c="dimmed">
                  With Products
                </Text>
              </Group>
              <Text size="xl" fw={700}>
                {analytics.storiesWithProducts}
              </Text>
            </Stack>
          </Card>
        </Group>
      )}

      {/* Header */}
      <Group justify="space-between">
        <Text size="xl" fw={700}>
          Story Management
        </Text>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
          Add Story
        </Button>
      </Group>

      {/* Filters */}
      {showFilters && (
        <Card withBorder>
          <Group>
            <TextInput
              placeholder="Search stories..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Filter by series"
              data={[
                { value: '', label: 'All Series' },
                // TODO: Add dynamic series options
              ]}
              value={seriesFilter}
              onChange={(value) => setSeriesFilter(value || '')}
            />
            <Select
              placeholder="Fictional filter"
              data={[
                { value: 'all', label: 'All Stories' },
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
              <Table.Th>Series</Table.Th>
              <Table.Th>Fictional</Table.Th>
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
                    cursor: onStorySelect ? 'pointer' : undefined,
                    backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
                  }}
                  onClick={() => onStorySelect?.(item)}
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
                    {item.series ? (
                      <Text size="sm">{item.series.name}</Text>
                    ) : (
                      <Text size="sm" c="dimmed">
                        No series
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
                              onStorySelect?.(item);
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
            <IconBook size={48} color="gray" />
            <Text c="dimmed">No stories found</Text>
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
      <Modal opened={createModalOpened} onClose={closeCreateModal} title="Create Story" size="lg">
        <SimpleStoryForm onSuccess={handleFormSuccess} onCancel={closeCreateModal} />
      </Modal>

      {/* Edit Modal */}
      <Modal opened={editModalOpened} onClose={closeEditModal} title="Edit Story" size="lg">
        {selectedStory && (
          <SimpleStoryForm
            initialData={selectedStory}
            onSuccess={handleFormSuccess}
            onCancel={closeEditModal}
          />
        )}
      </Modal>
    </Stack>
  );
}

// Simple story form component
function SimpleStoryForm({
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
    seriesId: initialData?.seriesId || '',
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
        seriesId: formData.seriesId || undefined,
      };

      const result = initialData
        ? await updateStory(initialData.id, submitData)
        : await createStory(submitData);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: `Story ${initialData ? 'updated' : 'created'} successfully`,
          color: 'green',
        });
        onSuccess();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || `Failed to ${initialData ? 'update' : 'create'} story`,
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: `Failed to ${initialData ? 'update' : 'create'} story`,
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
          placeholder="Enter story name"
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
          placeholder="story-slug"
          required
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
        />

        <Select
          label="Series"
          placeholder="Select series (optional)"
          data={[
            { value: '', label: 'No series' },
            // TODO: Add dynamic series options
          ]}
          value={formData.seriesId}
          onChange={(value) => setFormData({ ...formData, seriesId: value || '' })}
        />

        <Checkbox
          label="Fictional Story"
          checked={formData.isFictional}
          onChange={(e) => setFormData({ ...formData, isFictional: e.target.checked })}
        />

        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initialData ? 'Update' : 'Create'} Story
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
