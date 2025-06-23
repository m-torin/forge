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
  IconAdjustments,
  IconAlertTriangle,
  IconBox,
  IconDots,
  IconEdit,
  IconEye,
  IconFilter,
  IconMapPin,
  IconPackage,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';

import {
  getInventory,
  getInventoryAnalytics,
  getLowStockAlerts,
  deleteInventory,
  bulkUpdateInventory,
} from '@/actions/pim3/actions';
import { InventoryForm } from './InventoryForm';

interface InventoryTableProps {
  initialData?: any;
  showFilters?: boolean;
  onInventorySelect?: (inventory: any) => void;
}

export function InventoryTable({
  initialData,
  showFilters = true,
  onInventorySelect,
}: InventoryTableProps) {
  const [data, setData] = useState(initialData?.data || []);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(
    initialData?.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 },
  );
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [productFilter, setProductFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Modals
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [adjustModalOpened, { open: openAdjustModal, close: closeAdjustModal }] =
    useDisclosure(false);
  const [reserveModalOpened, { open: openReserveModal, close: closeReserveModal }] =
    useDisclosure(false);
  const [selectedInventory, setSelectedInventory] = useState<any>(null);

  // Analytics
  const [analytics, setAnalytics] = useState<any>(null);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);

  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const result = await getInventory({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        productId: productFilter || undefined,
        locationId: locationFilter || undefined,
        lowStock: stockFilter === 'low' ? true : undefined,
        outOfStock: stockFilter === 'out' ? true : undefined,
        ...params,
      });

      if (result.success) {
        setData(result.data || []);
        setPagination(result.pagination || pagination);
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to load inventory',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load inventory',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [analyticsResult, alertsResult] = await Promise.all([
        getInventoryAnalytics(),
        getLowStockAlerts(),
      ]);

      if (analyticsResult.success) {
        setAnalytics(analyticsResult.data);
      }
      if (alertsResult.success) {
        setLowStockAlerts(alertsResult.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, productFilter, locationFilter, stockFilter, pagination.page]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteInventory(id);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Inventory item deleted successfully',
          color: 'green',
        });
        fetchData();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to delete inventory item',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete inventory item',
        color: 'red',
      });
    }
  };

  const handleBulkUpdate = async (updates: any[]) => {
    try {
      const result = await bulkUpdateInventory(updates);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Inventory updated successfully',
          color: 'green',
        });
        setSelectedItems([]);
        fetchData();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to update inventory',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update inventory',
        color: 'red',
      });
    }
  };

  const getStockStatus = (item: any) => {
    if (item.available <= 0) {
      return { color: 'red', label: 'Out of Stock' };
    } else if (item.lowStockThreshold && item.available <= item.lowStockThreshold) {
      return { color: 'orange', label: 'Low Stock' };
    } else {
      return { color: 'green', label: 'In Stock' };
    }
  };

  const handleEdit = (inventory: any) => {
    setSelectedInventory(inventory);
    openEditModal();
  };

  const handleAdjust = (inventory: any) => {
    setSelectedInventory(inventory);
    openAdjustModal();
  };

  const handleReserve = (inventory: any) => {
    setSelectedInventory(inventory);
    openReserveModal();
  };

  const handleFormSuccess = () => {
    closeEditModal();
    closeAdjustModal();
    closeReserveModal();
    setSelectedInventory(null);
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
                <IconBox size={16} />
                <Text size="sm" c="dimmed">
                  Total Items
                </Text>
              </Group>
              <Text size="xl" fw={700}>
                {analytics.totalItems}
              </Text>
            </Stack>
          </Card>
          <Card withBorder flex={1}>
            <Stack gap="xs">
              <Group gap="xs">
                <IconPackage size={16} />
                <Text size="sm" c="dimmed">
                  Total Stock
                </Text>
              </Group>
              <Text size="xl" fw={700}>
                {analytics.totalStock}
              </Text>
            </Stack>
          </Card>
          <Card withBorder flex={1}>
            <Stack gap="xs">
              <Group gap="xs">
                <IconTrendingDown size={16} />
                <Text size="sm" c="dimmed">
                  Reserved
                </Text>
              </Group>
              <Text size="xl" fw={700}>
                {analytics.totalReserved}
              </Text>
            </Stack>
          </Card>
          <Card withBorder flex={1}>
            <Stack gap="xs">
              <Group gap="xs">
                <IconTrendingUp size={16} />
                <Text size="sm" c="dimmed">
                  Available
                </Text>
              </Group>
              <Text size="xl" fw={700}>
                {analytics.totalAvailable}
              </Text>
            </Stack>
          </Card>
          <Card withBorder flex={1}>
            <Stack gap="xs">
              <Group gap="xs">
                <IconAlertTriangle size={16} />
                <Text size="sm" c="dimmed">
                  Low Stock
                </Text>
              </Group>
              <Text size="xl" fw={700} c="orange">
                {analytics.lowStockItems}
              </Text>
            </Stack>
          </Card>
        </Group>
      )}

      {/* Filters */}
      {showFilters && (
        <Card withBorder>
          <Group>
            <TextInput
              placeholder="Search inventory..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <TextInput
              placeholder="Filter by product ID"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
            />
            <TextInput
              placeholder="Filter by location"
              leftSection={<IconMapPin size={16} />}
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
            <Select
              placeholder="Stock status"
              leftSection={<IconFilter size={16} />}
              data={[
                { value: 'all', label: 'All Stock' },
                { value: 'low', label: 'Low Stock' },
                { value: 'out', label: 'Out of Stock' },
              ]}
              value={stockFilter}
              onChange={(value) => setStockFilter(value as any)}
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
            <Button size="xs" variant="light">
              Bulk Update Threshold
            </Button>
            <Button size="xs" variant="light" color="red">
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
              <Table.Th>Product</Table.Th>
              <Table.Th>Location</Table.Th>
              <Table.Th>Total</Table.Th>
              <Table.Th>Reserved</Table.Th>
              <Table.Th>Available</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Threshold</Table.Th>
              <Table.Th>Last Updated</Table.Th>
              <Table.Th width={100}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((item: any) => {
              const status = getStockStatus(item);
              const isSelected = selectedItems.includes(item.id);

              return (
                <Table.Tr
                  key={item.id}
                  style={{
                    cursor: onInventorySelect ? 'pointer' : undefined,
                    backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
                  }}
                  onClick={() => onInventorySelect?.(item)}
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
                        {item.product?.name || 'Unknown Product'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        SKU: {item.product?.sku || 'N/A'}
                      </Text>
                      {item.variant && (
                        <Text size="xs" c="dimmed">
                          Variant: {item.variant.name}
                        </Text>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={2}>
                      <Text size="sm" fw={500}>
                        {item.locationName || 'Unknown'}
                      </Text>
                      {item.locationId && (
                        <Text size="xs" c="dimmed">
                          ID: {item.locationId}
                        </Text>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={500}>{item.quantity}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text c="blue" fw={500}>
                      {item.reserved}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text c={status.color} fw={500}>
                      {item.available}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={status.color} size="sm" variant="light">
                      {status.label}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {item.lowStockThreshold || '-'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">
                      {new Date(item.updatedAt).toLocaleDateString()}
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
                              onInventorySelect?.(item);
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
                          <Menu.Item
                            leftSection={<IconAdjustments size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdjust(item);
                            }}
                          >
                            Adjust Stock
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconPackage size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReserve(item);
                            }}
                          >
                            Reserve/Unreserve
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
            <IconBox size={48} color="gray" />
            <Text c="dimmed">No inventory items found</Text>
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

      {/* Edit Modal */}
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title="Edit Inventory Item"
        size="lg"
      >
        {selectedInventory && (
          <InventoryForm
            mode="edit"
            initialData={selectedInventory}
            onSuccess={handleFormSuccess}
          />
        )}
      </Modal>

      {/* Adjust Modal */}
      <Modal
        opened={adjustModalOpened}
        onClose={closeAdjustModal}
        title="Adjust Inventory"
        size="lg"
      >
        <InventoryForm
          mode="adjust"
          inventoryOptions={data.map((item: any) => ({
            value: item.id,
            label: `${item.product?.name || 'Unknown'} - ${item.locationName}`,
          }))}
          onSuccess={handleFormSuccess}
        />
      </Modal>

      {/* Reserve Modal */}
      <Modal
        opened={reserveModalOpened}
        onClose={closeReserveModal}
        title="Reserve/Unreserve Inventory"
        size="lg"
      >
        <InventoryForm
          mode="reserve"
          inventoryOptions={data.map((item: any) => ({
            value: item.id,
            label: `${item.product?.name || 'Unknown'} - ${item.locationName} (${item.available} available)`,
          }))}
          onSuccess={handleFormSuccess}
        />
      </Modal>
    </Stack>
  );
}
