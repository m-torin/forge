'use client';

import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Center,
  Checkbox,
  Group,
  Loader,
  Menu,
  rem,
  ScrollArea,
  Slider,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconCheck,
  IconDots,
  IconEdit,
  IconEye,
  IconGift,
  IconPackage,
  IconPlus,
  IconReceipt,
  IconStar,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';

import {
  formatCurrency,
  showDeleteConfirmModal,
  showErrorNotification,
  showSuccessNotification,
} from '../../utils/pim-helpers';
import {
  bulkUpdateItemPriorities,
  getRegistry,
  markItemPurchased,
  removeRegistryItem,
} from '../actions';

import { PurchaseTrackingModal } from './PurchaseTrackingModal';
import { RegistryItemModal } from './RegistryItemModal';

import type { RegistryWithRelations } from '../actions';

interface RegistryItemManagementProps {
  editable?: boolean;
  registryId: string;
  showAddButton?: boolean;
}

interface ItemRow {
  collection?: {
    id: string;
    name: string;
    copy?: any;
    type: string;
  } | null;
  createdAt: Date;
  id: string;
  notes?: string | null;
  priority: number;
  product?: {
    id: string;
    name: string;
    price?: number | null;
    sku: string;
    status: string;
  } | null;
  purchased: boolean;
  purchases: {
    id: string;
    quantity: number;
    status: string;
    purchaseDate: Date;
    price?: number | null;
    purchaser: {
      id: string;
      name: string;
      email: string;
    };
  }[];
  quantity: number;
}

/**
 * RegistryItemManagement component for comprehensive item management
 */
export function RegistryItemManagement({
  editable = true,
  registryId,
  showAddButton = true,
}: RegistryItemManagementProps) {
  const [registry, setRegistry] = useState<RegistryWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemModalOpened, setItemModalOpened] = useState(false);
  const [purchaseModalOpened, setPurchaseModalOpened] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemRow | null>(null);
  const [selectedItemForPurchase, setSelectedItemForPurchase] = useState<ItemRow | null>(null);
  const [priorityEditMode, setPriorityEditMode] = useState(false);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  const priorityForm = useForm({
    initialValues: {
      items: [] as { id: string; priority: number }[],
    },
  });

  const loadRegistry = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getRegistry(registryId);
      if (result.success && result.data) {
        setRegistry(result.data);
        // Initialize priority form
        priorityForm.setFieldValue(
          'items',
          result.data.items.map((item) => ({
            id: item.id,
            priority: item.priority,
          })),
        );
      } else {
        showErrorNotification(result.error || 'Failed to load registry');
      }
    } catch (error) {
      showErrorNotification('Failed to load registry');
    } finally {
      setLoading(false);
    }
  }, [registryId]);

  useEffect(() => {
    loadRegistry();
  }, [loadRegistry]);

  const handleRemoveItem = async (itemId: string) => {
    showDeleteConfirmModal('registry item', async () => {
      setLoadingActions((prev) => ({ ...prev, [itemId]: true }));
      try {
        const result = await removeRegistryItem(itemId);
        if (result.success) {
          showSuccessNotification('Item removed from registry');
          loadRegistry();
        } else {
          showErrorNotification(result.error || 'Failed to remove item');
        }
      } finally {
        setLoadingActions((prev) => ({ ...prev, [itemId]: false }));
      }
    });
  };

  const handleTogglePurchased = async (itemId: string, purchased: boolean) => {
    setLoadingActions((prev) => ({ ...prev, [itemId]: true }));
    try {
      const result = await markItemPurchased(itemId, !purchased);
      if (result.success) {
        showSuccessNotification(
          purchased ? 'Item marked as not purchased' : 'Item marked as purchased',
        );
        loadRegistry();
      } else {
        showErrorNotification(result.error || 'Failed to update purchase status');
      }
    } finally {
      setLoadingActions((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleEditItem = (item: ItemRow) => {
    setEditingItem(item);
    setItemModalOpened(true);
  };

  const handleRecordPurchase = (item: ItemRow) => {
    setSelectedItemForPurchase(item);
    setPurchaseModalOpened(true);
  };

  const handleBulkUpdatePriorities = async () => {
    try {
      const updates = priorityForm.values.items.filter((item) => {
        const originalItem = registry?.items.find((i) => i.id === item.id);
        return originalItem && originalItem.priority !== item.priority;
      });

      if (updates.length === 0) {
        showErrorNotification('No priority changes to save');
        return;
      }

      const result = await bulkUpdateItemPriorities(updates);
      if (result.success) {
        showSuccessNotification(`Updated ${updates.length} item priorities`);
        setPriorityEditMode(false);
        loadRegistry();
      } else {
        showErrorNotification(result.error || 'Failed to update priorities');
      }
    } catch (error) {
      showErrorNotification('Failed to update priorities');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(registry?.items.map((item) => item.id) || []);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, itemId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'red';
    if (priority >= 6) return 'orange';
    if (priority >= 4) return 'yellow';
    if (priority >= 2) return 'blue';
    return 'gray';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'green';
      case 'SHIPPED':
        return 'blue';
      case 'CONFIRMED':
        return 'orange';
      case 'CANCELLED':
        return 'red';
      case 'RETURNED':
        return 'purple';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <Center h={200}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!registry) {
    return (
      <Text c="dimmed" py="xl" ta="center">
        Registry not found
      </Text>
    );
  }

  const totalValue = registry.items
    .filter((item) => item.product?.price)
    .reduce((sum, item) => sum + item.product?.price! * item.quantity, 0);

  const purchasedValue = registry.items
    .filter((item) => item.purchased && item.product?.price)
    .reduce((sum, item) => sum + item.product?.price! * item.quantity, 0);

  const allSelected = selectedItems.length === registry.items.length && registry.items.length > 0;
  const someSelected = selectedItems.length > 0;

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Title order={3}>Registry Items</Title>
          <Text c="dimmed">Manage items in {registry.title}</Text>
        </div>
        {showAddButton && editable && (
          <Group gap="md">
            {priorityEditMode ? (
              <Group gap="xs">
                <Button
                  onClick={() => {
                    setPriorityEditMode(false);
                    // Reset form to original values
                    priorityForm.setFieldValue(
                      'items',
                      registry.items.map((item) => ({
                        id: item.id,
                        priority: item.priority,
                      })),
                    );
                  }}
                  variant="light"
                >
                  Cancel
                </Button>
                <Button onClick={handleBulkUpdatePriorities}>Save Priorities</Button>
              </Group>
            ) : (
              <Button
                leftSection={<IconStar size={16} />}
                onClick={() => setPriorityEditMode(true)}
                disabled={registry.items.length === 0}
                variant="light"
              >
                Edit Priorities
              </Button>
            )}
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                setEditingItem(null);
                setItemModalOpened(true);
              }}
            >
              Add Item
            </Button>
          </Group>
        )}
      </Group>

      {/* Statistics */}
      <Card withBorder p="md" radius="md">
        <Group grow>
          <div>
            <Text c="blue" fw={700} size="lg">
              {registry.items.length}
            </Text>
            <Text c="dimmed" size="xs">
              Total Items
            </Text>
          </div>
          <div>
            <Text c="green" fw={700} size="lg">
              {registry.items.filter((item) => item.purchased).length}
            </Text>
            <Text c="dimmed" size="xs">
              Purchased
            </Text>
          </div>
          <div>
            <Text c="orange" fw={700} size="lg">
              {registry.items.length > 0
                ? (
                    (registry.items.filter((item) => item.purchased).length /
                      registry.items.length) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </Text>
            <Text c="dimmed" size="xs">
              Completion
            </Text>
          </div>
          {totalValue > 0 && (
            <div>
              <Text c="violet" fw={700} size="lg">
                {formatCurrency(totalValue)}
              </Text>
              <Text c="dimmed" size="xs">
                Total Value
              </Text>
            </div>
          )}
        </Group>
      </Card>

      {/* Items Table */}
      <Card withBorder radius="md">
        {registry.items.length > 0 ? (
          <ScrollArea>
            <Table highlightOnHover striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: rem(40) }}>
                    <Checkbox
                      onChange={(e) => handleSelectAll(e.currentTarget.checked)}
                      checked={allSelected}
                      indeterminate={someSelected && !allSelected}
                    />
                  </Table.Th>
                  <Table.Th>Item</Table.Th>
                  <Table.Th>Quantity</Table.Th>
                  <Table.Th>Priority</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Purchases</Table.Th>
                  {editable && <Table.Th>Actions</Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {registry.items.map((item, index) => {
                  const isSelected = selectedItems.includes(item.id);
                  const priorityFormItem = priorityForm.values.items.find((i) => i.id === item.id);

                  return (
                    <Table.Tr
                      key={item.id}
                      bg={isSelected ? 'var(--mantine-color-blue-light)' : undefined}
                    >
                      <Table.Td>
                        <Checkbox
                          onChange={(e) => handleSelectItem(item.id, e.currentTarget.checked)}
                          checked={isSelected}
                        />
                      </Table.Td>

                      <Table.Td>
                        <Group gap="sm">
                          <Avatar radius="md" size="md">
                            {item.product ? <IconPackage size={20} /> : <IconGift size={20} />}
                          </Avatar>
                          <div>
                            <Text fw={500} size="sm">
                              {item.product?.name || item.collection?.name || 'Unknown item'}
                            </Text>
                            {item.product && (
                              <Group gap="xs" mt={2}>
                                <Text c="dimmed" size="xs">
                                  SKU: {item.product.sku}
                                </Text>
                                {item.product.price && (
                                  <Badge color="green" size="xs">
                                    {formatCurrency(item.product.price)}
                                  </Badge>
                                )}
                              </Group>
                            )}
                            {item.collection && (
                              <Badge color="orange" mt={2} size="xs">
                                {item.collection.type}
                              </Badge>
                            )}
                            {item.notes && (
                              <Text c="dimmed" mt={2} size="xs">
                                {item.notes.length > 50
                                  ? `${item.notes.substring(0, 50)}...`
                                  : item.notes}
                              </Text>
                            )}
                          </div>
                        </Group>
                      </Table.Td>

                      <Table.Td>
                        <Badge color="blue" variant="light">
                          {item.quantity}
                        </Badge>
                      </Table.Td>

                      <Table.Td>
                        {priorityEditMode && priorityFormItem ? (
                          <div style={{ width: 120 }}>
                            <Slider
                              color={getPriorityColor(priorityFormItem.priority)}
                              onChange={(value) => {
                                priorityForm.setFieldValue(`items.${index}.priority`, value);
                              }}
                              max={10}
                              min={0}
                              size="sm"
                              step={1}
                              value={priorityFormItem.priority}
                            />
                            <Text mt={2} size="xs" ta="center">
                              {priorityFormItem.priority}/10
                            </Text>
                          </div>
                        ) : (
                          <Badge
                            color={getPriorityColor(item.priority)}
                            leftSection={<IconStar size={12} />}
                            variant="light"
                          >
                            {item.priority}/10
                          </Badge>
                        )}
                      </Table.Td>

                      <Table.Td>
                        <Group gap="xs">
                          <Badge
                            color={item.purchased ? 'green' : 'gray'}
                            leftSection={
                              item.purchased ? <IconCheck size={14} /> : <IconX size={14} />
                            }
                          >
                            {item.purchased ? 'Purchased' : 'Not Purchased'}
                          </Badge>
                        </Group>
                      </Table.Td>

                      <Table.Td>
                        {item.purchases.length > 0 ? (
                          <Stack gap="xs">
                            {item.purchases.slice(0, 2).map((purchase) => (
                              <Group key={purchase.id} gap="xs">
                                <Avatar radius="xl" size="xs">
                                  {purchase.purchaser.name.charAt(0)}
                                </Avatar>
                                <Badge color={getStatusColor(purchase.status)} size="xs">
                                  {purchase.status}
                                </Badge>
                                <Text size="xs">Qty: {purchase.quantity}</Text>
                              </Group>
                            ))}
                            {item.purchases.length > 2 && (
                              <Text c="dimmed" size="xs">
                                +{item.purchases.length - 2} more...
                              </Text>
                            )}
                          </Stack>
                        ) : (
                          <Text c="dimmed" size="xs">
                            No purchases
                          </Text>
                        )}
                      </Table.Td>

                      {editable && (
                        <Table.Td>
                          <Group gap="xs">
                            <Tooltip
                              label={item.purchased ? 'Mark as not purchased' : 'Mark as purchased'}
                            >
                              <ActionIcon
                                color={item.purchased ? 'orange' : 'green'}
                                loading={loadingActions[item.id]}
                                onClick={() => handleTogglePurchased(item.id, item.purchased)}
                                variant="subtle"
                              >
                                {item.purchased ? <IconX size={16} /> : <IconCheck size={16} />}
                              </ActionIcon>
                            </Tooltip>

                            <Menu width={200} shadow="md">
                              <Menu.Target>
                                <ActionIcon
                                  color="gray"
                                  loading={loadingActions[item.id]}
                                  variant="subtle"
                                >
                                  <IconDots size={16} />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item
                                  leftSection={<IconEdit size={14} />}
                                  onClick={() => handleEditItem(item)}
                                >
                                  Edit Item
                                </Menu.Item>
                                <Menu.Item
                                  leftSection={<IconReceipt size={14} />}
                                  onClick={() => handleRecordPurchase(item)}
                                >
                                  Record Purchase
                                </Menu.Item>
                                {item.product && (
                                  <Menu.Item leftSection={<IconEye size={14} />} disabled>
                                    View Product
                                  </Menu.Item>
                                )}
                                <Menu.Divider />
                                <Menu.Item
                                  color="red"
                                  leftSection={<IconTrash size={14} />}
                                  onClick={() => handleRemoveItem(item.id)}
                                >
                                  Remove Item
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </Group>
                        </Table.Td>
                      )}
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        ) : (
          <Center py="xl">
            <Stack align="center" gap="md">
              <IconPackage color="var(--mantine-color-gray-5)" size={48} />
              <div style={{ textAlign: 'center' }}>
                <Text c="dimmed" fw={500}>
                  No items in this registry
                </Text>
                <Text c="dimmed" size="sm">
                  Add products or collections to get started
                </Text>
              </div>
              {showAddButton && editable && (
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => {
                    setEditingItem(null);
                    setItemModalOpened(true);
                  }}
                >
                  Add First Item
                </Button>
              )}
            </Stack>
          </Center>
        )}
      </Card>

      {/* Modals */}
      <RegistryItemModal
        onClose={() => {
          setItemModalOpened(false);
          setEditingItem(null);
        }}
        onSubmit={loadRegistry}
        opened={itemModalOpened}
        item={editingItem}
        registry={registry}
      />

      {selectedItemForPurchase && (
        <PurchaseTrackingModal
          onClose={() => {
            setPurchaseModalOpened(false);
            setSelectedItemForPurchase(null);
          }}
          onSubmit={loadRegistry}
          opened={purchaseModalOpened}
          registryItem={{
            id: selectedItemForPurchase.id,
            collection: selectedItemForPurchase.collection,
            product: selectedItemForPurchase.product,
            quantity: selectedItemForPurchase.quantity,
            registry: {
              id: registry.id,
              type: registry.type,
              title: registry.title,
            },
          }}
        />
      )}
    </Stack>
  );
}
