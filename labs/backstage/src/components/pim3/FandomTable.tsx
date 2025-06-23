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
  IconFilter,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSparkles,
  IconTrash,
  IconWorld,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';

import {
  getFandoms,
  createFandom,
  updateFandom,
  deleteFandom,
  bulkUpdateFandomFictional,
  bulkDeleteFandoms,
  getFandomAnalytics,
} from '@/actions/pim3/actions';

interface FandomTableProps {
  initialData?: any;
  showFilters?: boolean;
  onFandomSelect?: (fandom: any) => void;
}

export function FandomTable({ initialData, showFilters = true, onFandomSelect }: FandomTableProps) {
  const [data, setData] = useState(initialData?.data || []);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(
    initialData?.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 },
  );
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'fictional' | 'real'>('all');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'with' | 'without'>('all');

  // Modals
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);
  const [selectedFandom, setSelectedFandom] = useState<any>(null);

  // Analytics
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const result = await getFandoms({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        status: statusFilter || undefined,
        isFictional: typeFilter === 'fictional' ? true : typeFilter === 'real' ? false : undefined,
        hasMedia: mediaFilter === 'with' ? true : mediaFilter === 'without' ? false : undefined,
        ...params,
      });

      if (result.success) {
        setData(result.data || []);
        setPagination(result.pagination || pagination);
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to load fandoms',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load fandoms',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const result = await getFandomAnalytics();
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, statusFilter, typeFilter, mediaFilter, pagination.page]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteFandom(id);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Fandom deleted successfully',
          color: 'green',
        });
        fetchData();
        fetchAnalytics();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to delete fandom',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete fandom',
        color: 'red',
      });
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    try {
      const result = await bulkUpdateFandomFictional(selectedItems, status === 'ACTIVE');
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Fandom status updated successfully',
          color: 'green',
        });
        setSelectedItems([]);
        fetchData();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to update fandom status',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update fandom status',
        color: 'red',
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      const result = await bulkDeleteFandoms(selectedItems);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Fandoms deleted successfully',
          color: 'green',
        });
        setSelectedItems([]);
        fetchData();
        fetchAnalytics();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to delete fandoms',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete fandoms',
        color: 'red',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'INACTIVE':
        return 'gray';
      case 'ARCHIVED':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const handleEdit = (fandom: any) => {
    setSelectedFandom(fandom);
    openEditModal();
  };

  const handleFormSuccess = () => {
    closeEditModal();
    closeCreateModal();
    setSelectedFandom(null);
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
                <IconSparkles size={16} />
                <Text size="sm" c="dimmed">
                  Total Fandoms
                </Text>
              </Group>
              <Text size="xl" fw={700}>
                {analytics.totalFandoms}
              </Text>
            </Stack>
          </Card>
          <Card withBorder flex={1}>
            <Stack gap="xs">
              <Group gap="xs">
                <IconWorld size={16} />
                <Text size="sm" c="dimmed">
                  Active
                </Text>
              </Group>
              <Text size="xl" fw={700} c="green">
                {analytics.activeFandoms}
              </Text>
            </Stack>
          </Card>
          <Card withBorder flex={1}>
            <Stack gap="xs">
              <Group gap="xs">
                <IconBook size={16} />
                <Text size="sm" c="dimmed">
                  With Media
                </Text>
              </Group>
              <Text size="xl" fw={700}>
                {analytics.fandomsWithMedia}
              </Text>
            </Stack>
          </Card>
          <Card withBorder flex={1}>
            <Stack gap="xs">
              <Group gap="xs">
                <IconSparkles size={16} />
                <Text size="sm" c="dimmed">
                  Fictional
                </Text>
              </Group>
              <Text size="xl" fw={700}>
                {analytics.fictionalFandoms}
              </Text>
            </Stack>
          </Card>
        </Group>
      )}

      {/* Header */}
      <Group justify="space-between">
        <Text size="xl" fw={700}>
          Fandom Management
        </Text>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
          Add Fandom
        </Button>
      </Group>

      {/* Filters */}
      {showFilters && (
        <Card withBorder>
          <Group>
            <TextInput
              placeholder="Search fandoms..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Filter by status"
              leftSection={<IconFilter size={16} />}
              data={[
                { value: '', label: 'All Status' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
                { value: 'ARCHIVED', label: 'Archived' },
              ]}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value || '')}
            />
            <Select
              placeholder="Type filter"
              data={[
                { value: 'all', label: 'All Types' },
                { value: 'fictional', label: 'Fictional' },
                { value: 'real', label: 'Real World' },
              ]}
              value={typeFilter}
              onChange={(value) => setTypeFilter(value as any)}
            />
            <Select
              placeholder="Media filter"
              data={[
                { value: 'all', label: 'All Fandoms' },
                { value: 'with', label: 'With Media' },
                { value: 'without', label: 'Without Media' },
              ]}
              value={mediaFilter}
              onChange={(value) => setMediaFilter(value as any)}
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

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card withBorder>
          <Group>
            <Text size="sm" c="dimmed">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </Text>
            <Button size="xs" variant="light" onClick={() => handleBulkStatusUpdate('ACTIVE')}>
              Set Active
            </Button>
            <Button size="xs" variant="light" onClick={() => handleBulkStatusUpdate('INACTIVE')}>
              Set Inactive
            </Button>
            <Button size="xs" variant="light" color="red" onClick={handleBulkDelete}>
              Bulk Delete
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
              <Table.Th>Type</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Media Count</Table.Th>
              <Table.Th>Description</Table.Th>
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
                    cursor: onFandomSelect ? 'pointer' : undefined,
                    backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
                  }}
                  onClick={() => onFandomSelect?.(item)}
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
                    <Badge color={item.isFictional ? 'violet' : 'blue'} size="sm" variant="light">
                      {item.isFictional ? 'Fictional' : 'Real World'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(item.status)} size="sm" variant="light">
                      {item.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {item._count?.media || 0}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed" truncate style={{ maxWidth: 200 }}>
                      {item.description || '-'}
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
                              onFandomSelect?.(item);
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
            <IconSparkles size={48} color="gray" />
            <Text c="dimmed">No fandoms found</Text>
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
      <Modal opened={createModalOpened} onClose={closeCreateModal} title="Create Fandom" size="lg">
        <SimpleFandomForm onSuccess={handleFormSuccess} onCancel={closeCreateModal} />
      </Modal>

      {/* Edit Modal */}
      <Modal opened={editModalOpened} onClose={closeEditModal} title="Edit Fandom" size="lg">
        {selectedFandom && (
          <SimpleFandomForm
            initialData={selectedFandom}
            onSuccess={handleFormSuccess}
            onCancel={closeEditModal}
          />
        )}
      </Modal>
    </Stack>
  );
}

// Simple fandom form component
function SimpleFandomForm({
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
    description: initialData?.description || '',
    isFictional: initialData?.isFictional ?? true,
    status: initialData?.status || 'ACTIVE',
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
      const result = initialData
        ? await updateFandom(initialData.id, formData)
        : await createFandom(formData);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: `Fandom ${initialData ? 'updated' : 'created'} successfully`,
          color: 'green',
        });
        onSuccess();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || `Failed to ${initialData ? 'update' : 'create'} fandom`,
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: `Failed to ${initialData ? 'update' : 'create'} fandom`,
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
          placeholder="Enter fandom name"
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
          placeholder="fandom-slug"
          required
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
        />

        <TextInput
          label="Description"
          placeholder="Brief description of the fandom"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <Group grow>
          <Checkbox
            label="Fictional Universe"
            checked={formData.isFictional}
            onChange={(e) => setFormData({ ...formData, isFictional: e.target.checked })}
          />

          <Select
            label="Status"
            data={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
              { value: 'ARCHIVED', label: 'Archived' },
            ]}
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value || 'ACTIVE' })}
          />
        </Group>

        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initialData ? 'Update' : 'Create'} Fandom
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
