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
  NumberInput,
} from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconCategory,
  IconDots,
  IconEdit,
  IconEye,
  IconFolder,
  IconFolderOpen,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';

import {
  getProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  getProductCategoryAnalytics,
} from '@/actions/pim3/actions';

interface ProductCategoryTableProps {
  initialData?: any;
  showFilters?: boolean;
  onCategorySelect?: (category: any) => void;
}

export function ProductCategoryTable({
  initialData,
  showFilters = true,
  onCategorySelect,
}: ProductCategoryTableProps) {
  const [data, setData] = useState(initialData?.data || []);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(
    initialData?.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 },
  );
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [parentFilter, setParentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Analytics
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const result = await getProductCategories({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        parentId: parentFilter || undefined,
        status: statusFilter || undefined,
        ...params,
      });

      if (result.success) {
        setData(result.data || []);
        setPagination(result.pagination || pagination);
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to load product categories',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load product categories',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const result = await getProductCategoryAnalytics();
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, parentFilter, statusFilter, pagination.page]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteProductCategory(id);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Product category deleted successfully',
          color: 'green',
        });
        fetchData();
        fetchAnalytics();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to delete product category',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete product category',
        color: 'red',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'green';
      case 'DRAFT':
        return 'yellow';
      case 'ARCHIVED':
        return 'gray';
      default:
        return 'blue';
    }
  };

  const handleEdit = (category: any) => {
    setSelectedCategory(category);
    openEditModal();
  };

  const handleFormSuccess = () => {
    closeEditModal();
    closeCreateModal();
    setSelectedCategory(null);
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
                <IconCategory size={16} />
                <Text size="sm" c="dimmed">
                  Total Categories
                </Text>
              </Group>
              <Text size="xl" fw={700}>
                {analytics.totalCategories}
              </Text>
            </Stack>
          </Card>
          <Card withBorder flex={1}>
            <Stack gap="xs">
              <Group gap="xs">
                <IconFolder size={16} />
                <Text size="sm" c="dimmed">
                  Root Categories
                </Text>
              </Group>
              <Text size="xl" fw={700} c="blue">
                {analytics.rootCategories}
              </Text>
            </Stack>
          </Card>
          <Card withBorder flex={1}>
            <Stack gap="xs">
              <Group gap="xs">
                <IconFolderOpen size={16} />
                <Text size="sm" c="dimmed">
                  With Products
                </Text>
              </Group>
              <Text size="xl" fw={700}>
                {analytics.categoriesWithProducts}
              </Text>
            </Stack>
          </Card>
          <Card withBorder flex={1}>
            <Stack gap="xs">
              <Group gap="xs">
                <IconCategory size={16} />
                <Text size="sm" c="dimmed">
                  With Collections
                </Text>
              </Group>
              <Text size="xl" fw={700}>
                {analytics.categoriesWithCollections}
              </Text>
            </Stack>
          </Card>
        </Group>
      )}

      {/* Header */}
      <Group justify="space-between">
        <Text size="xl" fw={700}>
          Product Category Management
        </Text>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
          Add Category
        </Button>
      </Group>

      {/* Filters */}
      {showFilters && (
        <Card withBorder>
          <Group>
            <TextInput
              placeholder="Search categories..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Filter by parent"
              data={[
                { value: '', label: 'All Categories' },
                { value: 'null', label: 'Root Categories' },
                // TODO: Add dynamic parent options
              ]}
              value={parentFilter}
              onChange={(value) => setParentFilter(value || '')}
            />
            <Select
              placeholder="Filter by status"
              data={[
                { value: '', label: 'All Statuses' },
                { value: 'PUBLISHED', label: 'Published' },
                { value: 'DRAFT', label: 'Draft' },
                { value: 'ARCHIVED', label: 'Archived' },
              ]}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value || '')}
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
              <Table.Th>Parent</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Order</Table.Th>
              <Table.Th>Products</Table.Th>
              <Table.Th>Collections</Table.Th>
              <Table.Th>Children</Table.Th>
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
                    cursor: onCategorySelect ? 'pointer' : undefined,
                    backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
                  }}
                  onClick={() => onCategorySelect?.(item)}
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
                      <Group gap="xs">
                        {item.parent ? <IconFolder size={14} /> : <IconFolderOpen size={14} />}
                        <Text fw={500} size="sm">
                          {item.name}
                        </Text>
                      </Group>
                      <Text size="xs" c="dimmed">
                        {item.slug}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    {item.parent ? (
                      <Text size="sm">{item.parent.name}</Text>
                    ) : (
                      <Text size="sm" c="dimmed">
                        Root category
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(item.status)} size="sm" variant="light">
                      {item.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{item.displayOrder}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {item._count?.products || 0}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {item._count?.collections || 0}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {item._count?.children || 0}
                    </Text>
                    {item.children?.length > 0 && (
                      <Text size="xs" c="dimmed">
                        Latest: {item.children[0].name}
                      </Text>
                    )}
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
                              onCategorySelect?.(item);
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
            <IconCategory size={48} color="gray" />
            <Text c="dimmed">No product categories found</Text>
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
        title="Create Product Category"
        size="lg"
      >
        <SimpleProductCategoryForm onSuccess={handleFormSuccess} onCancel={closeCreateModal} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title="Edit Product Category"
        size="lg"
      >
        {selectedCategory && (
          <SimpleProductCategoryForm
            initialData={selectedCategory}
            onSuccess={handleFormSuccess}
            onCancel={closeEditModal}
          />
        )}
      </Modal>
    </Stack>
  );
}

// Simple product category form component
function SimpleProductCategoryForm({
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
    status: initialData?.status || 'PUBLISHED',
    parentId: initialData?.parentId || '',
    displayOrder: initialData?.displayOrder || 0,
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
        parentId: formData.parentId || undefined,
      };

      const result = initialData
        ? await updateProductCategory(initialData.id, submitData)
        : await createProductCategory(submitData);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: `Product category ${initialData ? 'updated' : 'created'} successfully`,
          color: 'green',
        });
        onSuccess();
      } else {
        notifications.show({
          title: 'Error',
          message:
            result.error || `Failed to ${initialData ? 'update' : 'create'} product category`,
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: `Failed to ${initialData ? 'update' : 'create'} product category`,
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
          placeholder="Enter category name"
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
          placeholder="category-slug"
          required
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
        />

        <Group grow>
          <Select
            label="Status"
            data={[
              { value: 'PUBLISHED', label: 'Published' },
              { value: 'DRAFT', label: 'Draft' },
              { value: 'ARCHIVED', label: 'Archived' },
            ]}
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value || 'PUBLISHED' })}
          />

          <NumberInput
            label="Display Order"
            min={0}
            value={formData.displayOrder}
            onChange={(value) => setFormData({ ...formData, displayOrder: Number(value) || 0 })}
          />
        </Group>

        <Select
          label="Parent Category"
          placeholder="Select parent category (optional)"
          data={[
            { value: '', label: 'Root category (no parent)' },
            // TODO: Add dynamic parent category options
          ]}
          value={formData.parentId}
          onChange={(value) => setFormData({ ...formData, parentId: value || '' })}
        />

        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initialData ? 'Update' : 'Create'} Category
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
