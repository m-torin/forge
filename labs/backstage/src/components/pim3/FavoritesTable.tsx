'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Menu,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
  LoadingOverlay,
  Select,
  TextInput,
  Pagination,
  Modal,
} from '@mantine/core';
import {
  IconTrash,
  IconEye,
  IconPlus,
  IconSearch,
  IconRefresh,
  IconPackage,
  IconCategory,
  IconUser,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import { FavoritesForm } from './FavoritesForm';
import {
  getFavorites,
  deleteFavorite,
  bulkDeleteFavorites,
  getFavoritesAnalytics,
} from '@/actions/pim3/actions';

interface FavoritesTableProps {
  initialData?: any[];
}

export function FavoritesTable({ initialData = [] }: FavoritesTableProps) {
  // State management
  const [favorites, setFavorites] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [selectedFavorites, setSelectedFavorites] = useState<string[]>([]);
  const [selectedFavorite, setSelectedFavorite] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'view' | 'manage'>('create');
  const [favoritesFormOpened, { open: openFavoritesForm, close: closeFavoritesForm }] =
    useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [analytics, setAnalytics] = useState<any>(null);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    userId: '',
    type: '', // 'product' | 'collection' | ''
    page: 1,
    limit: 50,
  });

  // Load favorites data
  const loadFavorites = async (newFilters = filters) => {
    try {
      setLoading(true);
      const result = await getFavorites({
        ...newFilters,
        productId: newFilters.type === 'product' ? undefined : null,
        collectionId: newFilters.type === 'collection' ? undefined : null,
      });

      if (result.success) {
        setFavorites(result.data);
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to load favorites',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load favorites',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load analytics
  const loadAnalytics = async () => {
    try {
      const result = await getFavoritesAnalytics();
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadFavorites();
    loadAnalytics();
  }, []);

  // Handle search and filter changes
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    loadFavorites(newFilters);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    loadFavorites(newFilters);
  };

  // Handle favorite operations
  const handleViewFavorite = (favoriteId: string) => {
    setSelectedFavorite(favoriteId);
    setFormMode('view');
    openFavoritesForm();
  };

  const handleManageUserFavorites = (userId: string) => {
    setSelectedUserId(userId);
    setFormMode('manage');
    openFavoritesForm();
  };

  const handleDeleteFavorite = (favoriteId: string) => {
    setSelectedFavorite(favoriteId);
    openDeleteModal();
  };

  const confirmDeleteFavorite = async () => {
    if (!selectedFavorite) return;

    try {
      const result = await deleteFavorite(selectedFavorite);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Favorite removed successfully',
          color: 'green',
        });
        loadFavorites();
        loadAnalytics();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to remove favorite',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to remove favorite',
        color: 'red',
      });
    } finally {
      closeDeleteModal();
      setSelectedFavorite(null);
    }
  };

  // Handle bulk operations
  const handleBulkDelete = async () => {
    if (selectedFavorites.length === 0) return;

    try {
      const result = await bulkDeleteFavorites(selectedFavorites);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: `Removed ${selectedFavorites.length} favorites`,
          color: 'green',
        });
        setSelectedFavorites([]);
        loadFavorites();
        loadAnalytics();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to remove favorites',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to remove favorites',
        color: 'red',
      });
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <Stack>
      {/* Analytics Cards */}
      {analytics && (
        <Group>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Total Favorites
            </Text>
            <Text size="xl" fw={700}>
              {analytics.totalFavorites}
            </Text>
          </Card>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Product Favorites
            </Text>
            <Text size="xl" fw={700} c="blue">
              {analytics.productFavorites}
            </Text>
          </Card>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Collection Favorites
            </Text>
            <Text size="xl" fw={700} c="green">
              {analytics.collectionFavorites}
            </Text>
          </Card>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Unique Users
            </Text>
            <Text size="xl" fw={700} c="orange">
              {analytics.uniqueUsers}
            </Text>
          </Card>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Avg per User
            </Text>
            <Text size="xl" fw={700} c="grape">
              {analytics.averageFavoritesPerUser}
            </Text>
          </Card>
        </Group>
      )}

      {/* Header and Controls */}
      <Group justify="space-between">
        <Title order={3}>Favorites Management</Title>
        <Group>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              setSelectedFavorite(null);
              setSelectedUserId(null);
              setFormMode('create');
              openFavoritesForm();
            }}
          >
            Add Favorite
          </Button>

          {selectedFavorites.length > 0 && (
            <Menu>
              <Menu.Target>
                <Button variant="light" color="red">
                  Bulk Actions ({selectedFavorites.length})
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={handleBulkDelete}
                >
                  Remove Selected
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Group>

      {/* Filters */}
      <Group>
        <TextInput
          placeholder="Search favorites..."
          leftSection={<IconSearch size={16} />}
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          style={{ flex: 1 }}
        />
        <TextInput
          placeholder="Filter by user ID"
          leftSection={<IconUser size={16} />}
          value={filters.userId}
          onChange={(e) => handleFilterChange('userId', e.target.value)}
        />
        <Select
          placeholder="Filter by type"
          data={[
            { value: '', label: 'All Types' },
            { value: 'product', label: 'Products' },
            { value: 'collection', label: 'Collections' },
          ]}
          value={filters.type}
          onChange={(value) => handleFilterChange('type', value || '')}
        />
        <Button
          variant="light"
          leftSection={<IconRefresh size={16} />}
          onClick={() => loadFavorites()}
        >
          Refresh
        </Button>
      </Group>

      {/* Table */}
      <Card withBorder p={0}>
        <LoadingOverlay visible={loading} />

        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 40 }}>
                <input
                  type="checkbox"
                  checked={selectedFavorites.length === favorites.length && favorites.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFavorites(favorites.map((f) => f.id));
                    } else {
                      setSelectedFavorites([]);
                    }
                  }}
                />
              </Table.Th>
              <Table.Th>User</Table.Th>
              <Table.Th>Item</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Date Added</Table.Th>
              <Table.Th style={{ width: 120 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {favorites.map((favorite) => (
              <Table.Tr key={favorite.id}>
                <Table.Td>
                  <input
                    type="checkbox"
                    checked={selectedFavorites.includes(favorite.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFavorites([...selectedFavorites, favorite.id]);
                      } else {
                        setSelectedFavorites(selectedFavorites.filter((id) => id !== favorite.id));
                      }
                    }}
                  />
                </Table.Td>
                <Table.Td>
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>
                      {favorite.user?.name || 'Unknown User'}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {favorite.user?.email}
                    </Text>
                  </Stack>
                </Table.Td>
                <Table.Td>
                  {favorite.product && (
                    <Stack gap={4}>
                      <Text size="sm" fw={500}>
                        {favorite.product.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        SKU: {favorite.product.sku}
                      </Text>
                      {favorite.product.price && (
                        <Text size="xs" c="dimmed">
                          {formatCurrency(favorite.product.price, favorite.product.currency)}
                        </Text>
                      )}
                    </Stack>
                  )}
                  {favorite.collection && (
                    <Stack gap={4}>
                      <Text size="sm" fw={500}>
                        {favorite.collection.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Type: {favorite.collection.type}
                      </Text>
                    </Stack>
                  )}
                </Table.Td>
                <Table.Td>
                  {favorite.product && (
                    <Badge color="blue" variant="light" leftSection={<IconPackage size={12} />}>
                      Product
                    </Badge>
                  )}
                  {favorite.collection && (
                    <Badge color="green" variant="light" leftSection={<IconCategory size={12} />}>
                      Collection
                    </Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {new Date(favorite.createdAt).toLocaleDateString()}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Tooltip label="View favorite">
                      <ActionIcon variant="light" onClick={() => handleViewFavorite(favorite.id)}>
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Manage user favorites">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => handleManageUserFavorites(favorite.userId)}
                      >
                        <IconUser size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Remove favorite">
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => handleDeleteFavorite(favorite.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {favorites.length === 0 && !loading && (
          <Text ta="center" py="xl" c="dimmed">
            No favorites found. Try adjusting your filters or add a new favorite.
          </Text>
        )}
      </Card>

      {/* Pagination */}
      <Group justify="center">
        <Pagination
          value={filters.page}
          onChange={handlePageChange}
          total={Math.ceil(favorites.length / filters.limit)}
        />
      </Group>

      {/* Favorites Form Modal */}
      <FavoritesForm
        opened={favoritesFormOpened}
        onClose={closeFavoritesForm}
        onSuccess={() => {
          closeFavoritesForm();
          loadFavorites();
          loadAnalytics();
        }}
        favoriteId={selectedFavorite}
        userId={selectedUserId}
        mode={formMode}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Remove Favorite"
        size="sm"
      >
        <Stack>
          <Text>Are you sure you want to remove this favorite? This action cannot be undone.</Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDeleteFavorite}>
              Remove Favorite
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
