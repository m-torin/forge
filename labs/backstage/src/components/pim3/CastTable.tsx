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
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconDots,
  IconEdit,
  IconEye,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';

import {
  getCast,
  createCast,
  updateCast,
  deleteCast,
  bulkDeleteCast,
  getCastAnalytics,
  bulkUpdateCastFictional,
} from '@/actions/pim3/actions';

interface CastTableProps {
  initialData?: any;
  showFilters?: boolean;
  onCastSelect?: (cast: any) => void;
}

export function CastTable({
  initialData,
  showFilters = true,
  onCastSelect,
}: CastTableProps): JSX.Element {
  const [data, setData] = useState(initialData?.data || []);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(
    initialData?.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 },
  );
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [isFictionalFilter, setIsFictionalFilter] = useState<string>('all');

  // Modals
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);
  const [selectedCast, setSelectedCast] = useState<any>(null);

  // Analytics
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const result = await getCast({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        isFictional:
          isFictionalFilter === 'fictional'
            ? true
            : isFictionalFilter === 'real'
              ? false
              : undefined,
        ...params,
      });

      if (result.success) {
        setData(result.data || []);
        setPagination(result.pagination || pagination);
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to load cast',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load cast',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const result = await getCastAnalytics();
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, isFictionalFilter, pagination.page]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteCast(id);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Cast member deleted successfully',
          color: 'green',
        });
        fetchData();
        fetchAnalytics();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to delete cast member',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete cast member',
        color: 'red',
      });
    }
  };

  const handleBulkFictionalUpdate = async (isFictional: boolean) => {
    try {
      const result = await bulkUpdateCastFictional(selectedItems, isFictional);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: `Cast members updated to ${isFictional ? 'fictional' : 'real'} successfully`,
          color: 'green',
        });
        setSelectedItems([]);
        fetchData();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to update cast members',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update cast members',
        color: 'red',
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      const result = await bulkDeleteCast(selectedItems);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Cast members deleted successfully',
          color: 'green',
        });
        setSelectedItems([]);
        fetchData();
        fetchAnalytics();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to delete cast members',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete cast members',
        color: 'red',
      });
    }
  };

  const getFictionalColor = (isFictional: boolean) => {
    return isFictional ? 'blue' : 'green';
  };

  const handleEdit = (cast: any) => {
    setSelectedCast(cast);
    openEditModal();
  };

  const handleFormSuccess = () => {
    closeCreateModal();
    closeEditModal();
    fetchData();
    fetchAnalytics();
  };

  return (
    <Stack gap="md">
      {/* Header */}
      <Group justify="space-between">
        <Group>
          <Text size="xl" fw={600}>
            Cast Members
          </Text>
          {analytics && (
            <Group gap="xs">
              <Badge variant="light" color="blue">
                {analytics.totalCast} Total
              </Badge>
              <Badge variant="light" color="green">
                {analytics.realCast} Real
              </Badge>
              <Badge variant="light" color="blue">
                {analytics.fictionalCast} Fictional
              </Badge>
            </Group>
          )}
        </Group>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
          Add Cast Member
        </Button>
      </Group>

      {/* Filters */}
      {showFilters && (
        <Card withBorder>
          <Group gap="md">
            <TextInput
              placeholder="Search cast members..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Filter by type"
              data={[
                { value: 'all', label: 'All' },
                { value: 'fictional', label: 'Fictional' },
                { value: 'real', label: 'Real' },
              ]}
              value={isFictionalFilter}
              onChange={(value) => setIsFictionalFilter(value || 'all')}
            />
            <ActionIcon
              variant="light"
              onClick={() => {
                setSearch('');
                setIsFictionalFilter('all');
              }}
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Group>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card withBorder>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {selectedItems.length} item(s) selected
            </Text>
            <Group gap="xs">
              <Button size="xs" variant="light" onClick={() => handleBulkFictionalUpdate(true)}>
                Mark as Fictional
              </Button>
              <Button size="xs" variant="light" onClick={() => handleBulkFictionalUpdate(false)}>
                Mark as Real
              </Button>
              <Button size="xs" variant="light" color="red" onClick={handleBulkDelete}>
                Delete Selected
              </Button>
            </Group>
          </Group>
        </Card>
      )}

      {/* Table */}
      <Card withBorder>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <Checkbox
                  checked={selectedItems.length === data.length && data.length > 0}
                  indeterminate={selectedItems.length > 0 && selectedItems.length < data.length}
                  onChange={(event) => {
                    if (event.currentTarget.checked) {
                      setSelectedItems(data.map((item: any) => item.id));
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                />
              </Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Slug</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Products</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((item: any) => {
              return (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onChange={(event) => {
                        if (event.currentTarget.checked) {
                          setSelectedItems([...selectedItems, item.id]);
                        } else {
                          setSelectedItems(selectedItems.filter((id) => id !== item.id));
                        }
                      }}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <IconUser size={16} />
                      <Text fw={500}>{item.name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {item.slug}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getFictionalColor(item.isFictional)} variant="light">
                      {item.isFictional ? 'Fictional' : 'Real'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{item._count?.products || 0}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="View Details">
                        <ActionIcon variant="light" size="sm" onClick={() => onCastSelect?.(item)}>
                          <IconEye size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Edit">
                        <ActionIcon variant="light" size="sm" onClick={() => handleEdit(item)}>
                          <IconEdit size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Menu>
                        <Menu.Target>
                          <ActionIcon variant="light" size="sm">
                            <IconDots size={14} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            color="red"
                            leftSection={<IconTrash size={14} />}
                            onClick={() => {
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
            <IconUsers size={48} color="gray" />
            <Text c="dimmed">No cast members found</Text>
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
      <Modal
        opened={createModalOpened}
        onClose={closeCreateModal}
        title="Create Cast Member"
        size="lg"
      >
        <SimpleCastForm onSuccess={handleFormSuccess} onCancel={closeCreateModal} />
      </Modal>

      {/* Edit Modal */}
      <Modal opened={editModalOpened} onClose={closeEditModal} title="Edit Cast Member" size="lg">
        {selectedCast && (
          <SimpleCastForm
            initialData={selectedCast}
            onSuccess={handleFormSuccess}
            onCancel={closeEditModal}
          />
        )}
      </Modal>
    </Stack>
  );
}

// Simple cast form component
function SimpleCastForm({
  initialData,
  onSuccess,
  onCancel,
}: {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}): JSX.Element {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    isFictional: initialData?.isFictional ?? true,
    copy: initialData?.copy || {},
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = initialData
        ? await updateCast(initialData.id, formData)
        : await createCast(formData);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: `Cast member ${initialData ? 'updated' : 'created'} successfully`,
          color: 'green',
        });
        onSuccess();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || `Failed to ${initialData ? 'update' : 'create'} cast member`,
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: `Failed to ${initialData ? 'update' : 'create'} cast member`,
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
          placeholder="Enter cast member name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <TextInput
          label="Slug"
          placeholder="cast-member-slug"
          required
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
        />

        <Select
          label="Type"
          data={[
            { value: 'true', label: 'Fictional' },
            { value: 'false', label: 'Real' },
          ]}
          value={formData.isFictional.toString()}
          onChange={(value) => setFormData({ ...formData, isFictional: value === 'true' })}
        />

        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initialData ? 'Update' : 'Create'} Cast Member
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
