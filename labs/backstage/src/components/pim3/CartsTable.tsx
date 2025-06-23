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
  IconEdit,
  IconTrash,
  IconEye,
  IconPlus,
  IconSearch,
  IconRefresh,
  IconUserCheck,
  IconClock,
  IconCheck,
  IconGift,
  IconHeart,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import { CartForm } from './CartForm';
import {
  getCarts,
  deleteCart,
  bulkUpdateCartStatus,
  getCartAnalytics,
} from '@/actions/pim3/carts/actions';

interface CartsTableProps {
  initialData?: any[];
}

export function CartsTable({ initialData = [] }: CartsTableProps) {
  // State management
  const [carts, setCarts] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [selectedCarts, setSelectedCarts] = useState<string[]>([]);
  const [selectedCart, setSelectedCart] = useState<string | null>(null);
  const [cartFormOpened, { open: openCartForm, close: closeCartForm }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [analytics, setAnalytics] = useState<any>(null);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 50,
  });

  // Load carts data
  const loadCarts = async (newFilters = filters) => {
    try {
      setLoading(true);
      const result = await getCarts(newFilters);

      if (result.success) {
        setCarts(result.data);
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to load carts',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load carts',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load analytics
  const loadAnalytics = async () => {
    try {
      const result = await getCartAnalytics();
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadCarts();
    loadAnalytics();
  }, []);

  // Handle search and filter changes
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    loadCarts(newFilters);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    loadCarts(newFilters);
  };

  // Handle cart operations
  const handleEditCart = (cartId: string) => {
    setSelectedCart(cartId);
    openCartForm();
  };

  const handleDeleteCart = (cartId: string) => {
    setSelectedCart(cartId);
    openDeleteModal();
  };

  const confirmDeleteCart = async () => {
    if (!selectedCart) return;

    try {
      const result = await deleteCart(selectedCart);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Cart deleted successfully',
          color: 'green',
        });
        loadCarts();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to delete cart',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete cart',
        color: 'red',
      });
    } finally {
      closeDeleteModal();
      setSelectedCart(null);
    }
  };

  // Handle bulk operations
  const handleBulkStatusUpdate = async (status: any) => {
    if (selectedCarts.length === 0) return;

    try {
      const result = await bulkUpdateCartStatus(selectedCarts, status);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: `Updated ${selectedCarts.length} carts`,
          color: 'green',
        });
        setSelectedCarts([]);
        loadCarts();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to update carts',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update carts',
        color: 'red',
      });
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'ABANDONED':
        return 'yellow';
      case 'CONVERTED':
        return 'blue';
      case 'EXPIRED':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  // Calculate cart total
  const calculateCartTotal = (cart: any) => {
    return (
      cart.items?.reduce((total: number, item: any) => {
        return total + Number(item.price) * item.quantity;
      }, 0) || 0
    );
  };

  return (
    <Stack>
      {/* Analytics Cards */}
      {analytics && (
        <Group>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Total Carts
            </Text>
            <Text size="xl" fw={700}>
              {analytics.totalCarts}
            </Text>
          </Card>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Active Carts
            </Text>
            <Text size="xl" fw={700} c="green">
              {analytics.activeCarts}
            </Text>
          </Card>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Abandoned Carts
            </Text>
            <Text size="xl" fw={700} c="yellow">
              {analytics.abandonedCarts}
            </Text>
          </Card>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Conversion Rate
            </Text>
            <Text size="xl" fw={700} c="blue">
              {analytics.conversionRate}%
            </Text>
          </Card>
        </Group>
      )}

      {/* Header and Controls */}
      <Group justify="space-between">
        <Title order={3}>Cart Management</Title>
        <Group>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              setSelectedCart(null);
              openCartForm();
            }}
          >
            New Cart
          </Button>

          {selectedCarts.length > 0 && (
            <Menu>
              <Menu.Target>
                <Button variant="light">Bulk Actions ({selectedCarts.length})</Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconCheck size={14} />}
                  onClick={() => handleBulkStatusUpdate('ACTIVE')}
                >
                  Mark as Active
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconClock size={14} />}
                  onClick={() => handleBulkStatusUpdate('ABANDONED')}
                >
                  Mark as Abandoned
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconUserCheck size={14} />}
                  onClick={() => handleBulkStatusUpdate('CONVERTED')}
                >
                  Mark as Converted
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Group>

      {/* Filters */}
      <Group>
        <TextInput
          placeholder="Search carts..."
          leftSection={<IconSearch size={16} />}
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Filter by status"
          data={[
            { value: '', label: 'All Statuses' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'ABANDONED', label: 'Abandoned' },
            { value: 'CONVERTED', label: 'Converted' },
            { value: 'EXPIRED', label: 'Expired' },
          ]}
          value={filters.status}
          onChange={(value) => handleFilterChange('status', value || '')}
        />
        <Button variant="light" leftSection={<IconRefresh size={16} />} onClick={() => loadCarts()}>
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
                  checked={selectedCarts.length === carts.length && carts.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCarts(carts.map((c) => c.id));
                    } else {
                      setSelectedCarts([]);
                    }
                  }}
                />
              </Table.Th>
              <Table.Th>User</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Items</Table.Th>
              <Table.Th>Total Value</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Updated</Table.Th>
              <Table.Th style={{ width: 120 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {carts.map((cart) => (
              <Table.Tr key={cart.id}>
                <Table.Td>
                  <input
                    type="checkbox"
                    checked={selectedCarts.includes(cart.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCarts([...selectedCarts, cart.id]);
                      } else {
                        setSelectedCarts(selectedCarts.filter((id) => id !== cart.id));
                      }
                    }}
                  />
                </Table.Td>
                <Table.Td>
                  <Stack gap={4}>
                    {cart.user ? (
                      <>
                        <Text size="sm" fw={500}>
                          {cart.user.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {cart.user.email}
                        </Text>
                      </>
                    ) : (
                      <Text size="sm" c="dimmed">
                        Guest ({cart.sessionId?.substring(0, 8)}...)
                      </Text>
                    )}
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <Badge color={getStatusColor(cart.status)} variant="light">
                    {cart.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Text size="sm">{cart._count.items} items</Text>
                    {cart.items?.some((item: any) => item.isGift) && (
                      <Tooltip label="Contains gift items">
                        <IconGift size={14} color="orange" />
                      </Tooltip>
                    )}
                    {cart.items?.some((item: any) => item.savedForLater) && (
                      <Tooltip label="Has saved items">
                        <IconHeart size={14} color="red" />
                      </Tooltip>
                    )}
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {formatCurrency(calculateCartTotal(cart), cart.currency)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {new Date(cart.createdAt).toLocaleDateString()}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {new Date(cart.updatedAt).toLocaleDateString()}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Tooltip label="View cart">
                      <ActionIcon variant="light" onClick={() => handleEditCart(cart.id)}>
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Edit cart">
                      <ActionIcon variant="light" onClick={() => handleEditCart(cart.id)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete cart">
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => handleDeleteCart(cart.id)}
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

        {carts.length === 0 && !loading && (
          <Text ta="center" py="xl" c="dimmed">
            No carts found. Try adjusting your filters or create a new cart.
          </Text>
        )}
      </Card>

      {/* Pagination */}
      <Group justify="center">
        <Pagination
          value={filters.page}
          onChange={handlePageChange}
          total={Math.ceil(carts.length / filters.limit)}
        />
      </Group>

      {/* Cart Form Modal */}
      <CartForm
        opened={cartFormOpened}
        onClose={closeCartForm}
        onSuccess={() => {
          closeCartForm();
          loadCarts();
        }}
        cartId={selectedCart}
      />

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Delete Cart" size="sm">
        <Stack>
          <Text>Are you sure you want to delete this cart? This action cannot be undone.</Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDeleteCart}>
              Delete Cart
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
