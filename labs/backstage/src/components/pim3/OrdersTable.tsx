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
  IconEye,
  IconPlus,
  IconSearch,
  IconRefresh,
  IconTruck,
  IconCheck,
  IconX,
  IconGift,
  IconCreditCard,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import { OrderForm } from './OrderForm';
import {
  getOrders,
  cancelOrder,
  bulkUpdateOrderStatus,
  bulkUpdatePaymentStatus,
  getOrderAnalytics,
} from '@/actions/pim3/actions';

interface OrdersTableProps {
  initialData?: any[];
}

export function OrdersTable({ initialData = [] }: OrdersTableProps) {
  // State management
  const [orders, setOrders] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orderFormOpened, { open: openOrderForm, close: closeOrderForm }] = useDisclosure(false);
  const [cancelModalOpened, { open: openCancelModal, close: closeCancelModal }] =
    useDisclosure(false);
  const [analytics, setAnalytics] = useState<any>(null);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    paymentStatus: '',
    page: 1,
    limit: 50,
  });

  // Load orders data
  const loadOrders = async (newFilters = filters) => {
    try {
      setLoading(true);
      const result = await getOrders(newFilters);

      if (result.success) {
        setOrders(result.data);
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to load orders',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load orders',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load analytics
  const loadAnalytics = async () => {
    try {
      const result = await getOrderAnalytics();
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadOrders();
    loadAnalytics();
  }, []);

  // Handle search and filter changes
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    loadOrders(newFilters);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    loadOrders(newFilters);
  };

  // Handle order operations
  const handleEditOrder = (orderId: string) => {
    setSelectedOrder(orderId);
    openOrderForm();
  };

  const handleCancelOrder = (orderId: string) => {
    setSelectedOrder(orderId);
    openCancelModal();
  };

  const confirmCancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      const result = await cancelOrder(selectedOrder, 'Cancelled from admin panel');

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Order cancelled successfully',
          color: 'green',
        });
        loadOrders();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to cancel order',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to cancel order',
        color: 'red',
      });
    } finally {
      closeCancelModal();
      setSelectedOrder(null);
    }
  };

  // Handle bulk operations
  const handleBulkStatusUpdate = async (status: any) => {
    if (selectedOrders.length === 0) return;

    try {
      const result = await bulkUpdateOrderStatus(selectedOrders, status);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: `Updated ${selectedOrders.length} orders`,
          color: 'green',
        });
        setSelectedOrders([]);
        loadOrders();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to update orders',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update orders',
        color: 'red',
      });
    }
  };

  const handleBulkPaymentUpdate = async (paymentStatus: any) => {
    if (selectedOrders.length === 0) return;

    try {
      const result = await bulkUpdatePaymentStatus(selectedOrders, paymentStatus);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: `Updated payment status for ${selectedOrders.length} orders`,
          color: 'green',
        });
        setSelectedOrders([]);
        loadOrders();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to update payment status',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update payment status',
        color: 'red',
      });
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'yellow';
      case 'PROCESSING':
        return 'blue';
      case 'SHIPPED':
        return 'orange';
      case 'DELIVERED':
        return 'green';
      case 'CANCELLED':
        return 'red';
      case 'RETURNED':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'yellow';
      case 'PROCESSING':
        return 'blue';
      case 'PAID':
        return 'green';
      case 'FAILED':
        return 'red';
      case 'CANCELLED':
        return 'gray';
      case 'REFUNDED':
        return 'orange';
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

  return (
    <Stack>
      {/* Analytics Cards */}
      {analytics && (
        <Group>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Total Orders
            </Text>
            <Text size="xl" fw={700}>
              {analytics.totalOrders}
            </Text>
          </Card>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Total Revenue
            </Text>
            <Text size="xl" fw={700} c="green">
              {formatCurrency(analytics.totalRevenue)}
            </Text>
          </Card>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Avg Order Value
            </Text>
            <Text size="xl" fw={700} c="blue">
              {formatCurrency(analytics.averageOrderValue)}
            </Text>
          </Card>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Fulfillment Rate
            </Text>
            <Text size="xl" fw={700} c="orange">
              {analytics.fulfillmentRate}%
            </Text>
          </Card>
        </Group>
      )}

      {/* Header and Controls */}
      <Group justify="space-between">
        <Title order={3}>Order Management</Title>
        <Group>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              setSelectedOrder(null);
              openOrderForm();
            }}
          >
            New Order
          </Button>

          {selectedOrders.length > 0 && (
            <Menu>
              <Menu.Target>
                <Button variant="light">Bulk Actions ({selectedOrders.length})</Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Order Status</Menu.Label>
                <Menu.Item
                  leftSection={<IconCheck size={14} />}
                  onClick={() => handleBulkStatusUpdate('PROCESSING')}
                >
                  Mark as Processing
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconTruck size={14} />}
                  onClick={() => handleBulkStatusUpdate('SHIPPED')}
                >
                  Mark as Shipped
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconCheck size={14} />}
                  onClick={() => handleBulkStatusUpdate('DELIVERED')}
                >
                  Mark as Delivered
                </Menu.Item>
                <Menu.Divider />
                <Menu.Label>Payment Status</Menu.Label>
                <Menu.Item
                  leftSection={<IconCreditCard size={14} />}
                  onClick={() => handleBulkPaymentUpdate('PAID')}
                >
                  Mark as Paid
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconX size={14} />}
                  onClick={() => handleBulkPaymentUpdate('FAILED')}
                >
                  Mark as Failed
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Group>

      {/* Filters */}
      <Group>
        <TextInput
          placeholder="Search orders..."
          leftSection={<IconSearch size={16} />}
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Filter by status"
          data={[
            { value: '', label: 'All Statuses' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'PROCESSING', label: 'Processing' },
            { value: 'SHIPPED', label: 'Shipped' },
            { value: 'DELIVERED', label: 'Delivered' },
            { value: 'CANCELLED', label: 'Cancelled' },
            { value: 'RETURNED', label: 'Returned' },
          ]}
          value={filters.status}
          onChange={(value) => handleFilterChange('status', value || '')}
        />
        <Select
          placeholder="Payment status"
          data={[
            { value: '', label: 'All Payment Statuses' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'PAID', label: 'Paid' },
            { value: 'FAILED', label: 'Failed' },
            { value: 'REFUNDED', label: 'Refunded' },
          ]}
          value={filters.paymentStatus}
          onChange={(value) => handleFilterChange('paymentStatus', value || '')}
        />
        <Button
          variant="light"
          leftSection={<IconRefresh size={16} />}
          onClick={() => loadOrders()}
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
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedOrders(orders.map((o) => o.id));
                    } else {
                      setSelectedOrders([]);
                    }
                  }}
                />
              </Table.Th>
              <Table.Th>Order #</Table.Th>
              <Table.Th>Customer</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Payment</Table.Th>
              <Table.Th>Items</Table.Th>
              <Table.Th>Total</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th style={{ width: 120 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {orders.map((order) => (
              <Table.Tr key={order.id}>
                <Table.Td>
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders([...selectedOrders, order.id]);
                      } else {
                        setSelectedOrders(selectedOrders.filter((id) => id !== order.id));
                      }
                    }}
                  />
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {order.orderNumber}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Stack gap={4}>
                    {order.user ? (
                      <>
                        <Text size="sm" fw={500}>
                          {order.user.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {order.user.email}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text size="sm" fw={500}>
                          {order.guestName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {order.guestEmail}
                        </Text>
                      </>
                    )}
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <Badge color={getStatusColor(order.status)} variant="light">
                    {order.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color={getPaymentStatusColor(order.paymentStatus)} variant="light">
                    {order.paymentStatus}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Text size="sm">{order._count.items} items</Text>
                    {order.items?.some((item: any) => item.isGift) && (
                      <Tooltip label="Contains gift items">
                        <IconGift size={14} color="orange" />
                      </Tooltip>
                    )}
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {formatCurrency(Number(order.total), order.currency)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Tooltip label="View order">
                      <ActionIcon variant="light" onClick={() => handleEditOrder(order.id)}>
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Edit order">
                      <ActionIcon variant="light" onClick={() => handleEditOrder(order.id)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Tooltip>
                    {order.status !== 'CANCELLED' && (
                      <Tooltip label="Cancel order">
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          <IconX size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {orders.length === 0 && !loading && (
          <Text ta="center" py="xl" c="dimmed">
            No orders found. Try adjusting your filters or create a new order.
          </Text>
        )}
      </Card>

      {/* Pagination */}
      <Group justify="center">
        <Pagination
          value={filters.page}
          onChange={handlePageChange}
          total={Math.ceil(orders.length / filters.limit)}
        />
      </Group>

      {/* Order Form Modal */}
      <OrderForm
        opened={orderFormOpened}
        onClose={closeOrderForm}
        onSuccess={() => {
          closeOrderForm();
          loadOrders();
        }}
        orderId={selectedOrder}
      />

      {/* Cancel Confirmation Modal */}
      <Modal opened={cancelModalOpened} onClose={closeCancelModal} title="Cancel Order" size="sm">
        <Stack>
          <Text>Are you sure you want to cancel this order? This action cannot be undone.</Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeCancelModal}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmCancelOrder}>
              Cancel Order
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
