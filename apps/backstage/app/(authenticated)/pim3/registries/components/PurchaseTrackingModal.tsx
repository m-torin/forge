'use client';

import {
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconCalendar,
  IconGift,
  IconPackage,
  IconReceipt,
  IconSearch,
  IconTruck,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import {
  formatCurrency,
  showErrorNotification,
  showSuccessNotification,
} from '../../utils/pim-helpers';
import { getUsersForSelect, recordItemPurchase, updatePurchaseStatus } from '../actions';

import type { PurchaseStatus } from '@repo/database/prisma';

interface PurchaseTrackingModalProps {
  onClose: () => void;
  onSubmit?: () => void;
  opened: boolean;
  purchase?: {
    id: string;
    quantity: number;
    status: PurchaseStatus;
    purchaseDate: Date;
    price?: number | null;
    currency?: string | null;
    transactionId?: string | null;
    orderNumber?: string | null;
    trackingNumber?: string | null;
    trackingUrl?: string | null;
    estimatedDelivery?: Date | null;
    actualDelivery?: Date | null;
    isGift: boolean;
    giftMessage?: string | null;
    notes?: string | null;
    purchaser: {
      id: string;
      name: string;
      email: string;
    };
  };
  registryItem: {
    id: string;
    quantity: number;
    product?: {
      id: string;
      name: string;
      price?: number | null;
      sku: string;
    } | null;
    collection?: {
      id: string;
      name: string;
      type: string;
    } | null;
    registry: {
      id: string;
      title: string;
      type: string;
    };
  };
}

interface UserOption {
  email: string;
  id: string;
  image?: string | null;
  name: string;
}

const PURCHASE_STATUS_OPTIONS: { value: PurchaseStatus; label: string; color: string }[] = [
  { color: 'gray', label: 'Pending', value: 'PENDING' },
  { color: 'blue', label: 'Confirmed', value: 'CONFIRMED' },
  { color: 'orange', label: 'Shipped', value: 'SHIPPED' },
  { color: 'green', label: 'Delivered', value: 'DELIVERED' },
  { color: 'red', label: 'Cancelled', value: 'CANCELLED' },
  { color: 'purple', label: 'Returned', value: 'RETURNED' },
];

/**
 * PurchaseTrackingModal component for recording and tracking purchases
 */
export function PurchaseTrackingModal({
  onClose,
  onSubmit,
  opened,
  purchase,
  registryItem,
}: PurchaseTrackingModalProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [debouncedUserSearch] = useDebouncedValue(userSearch, 300);

  const form = useForm({
    validate: {
      price: (value) => (value !== undefined && value < 0 ? 'Price cannot be negative' : null),
      purchaserId: (value) => (!value ? 'Please select a purchaser' : null),
      quantity: (value) => (value < 1 ? 'Quantity must be at least 1' : null),
    },
    initialValues: {
      actualDelivery: purchase?.actualDelivery ? new Date(purchase.actualDelivery) : null,
      currency: purchase?.currency || 'USD',
      estimatedDelivery: purchase?.estimatedDelivery ? new Date(purchase.estimatedDelivery) : null,
      giftMessage: purchase?.giftMessage || '',
      isGift: purchase?.isGift || false,
      notes: purchase?.notes || '',
      orderNumber: purchase?.orderNumber || '',
      price: purchase?.price || registryItem.product?.price || 0,
      purchaserId: purchase?.purchaser.id || '',
      quantity: purchase?.quantity || 1,
      status: purchase?.status || ('PENDING' as PurchaseStatus),
      trackingNumber: purchase?.trackingNumber || '',
      trackingUrl: purchase?.trackingUrl || '',
      transactionId: purchase?.transactionId || '',
    },
  });

  // Load users for purchaser selection
  const loadUsers = async (search = '') => {
    setLoadingUsers(true);
    try {
      const result = await getUsersForSelect(search);
      if (result.success && result.data) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load initial users
  useEffect(() => {
    if (opened) {
      loadUsers();
    }
  }, [opened]);

  // Debounced search effect
  useEffect(() => {
    if (debouncedUserSearch !== undefined) {
      loadUsers(debouncedUserSearch);
    }
  }, [debouncedUserSearch]);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      if (purchase) {
        // Update existing purchase
        const result = await updatePurchaseStatus(purchase.id, values.status, {
          actualDelivery: values.actualDelivery || undefined,
          estimatedDelivery: values.estimatedDelivery || undefined,
          trackingNumber: values.trackingNumber || undefined,
          trackingUrl: values.trackingUrl || undefined,
        });

        if (result.success) {
          showSuccessNotification('Purchase updated successfully');
          onSubmit?.();
          onClose();
        } else {
          showErrorNotification(result.error || 'Failed to update purchase');
        }
      } else {
        // Record new purchase
        const result = await recordItemPurchase({
          currency: values.currency,
          giftMessage: values.giftMessage || undefined,
          isGift: values.isGift,
          notes: values.notes || undefined,
          orderNumber: values.orderNumber || undefined,
          price: values.price || undefined,
          purchaserId: values.purchaserId,
          quantity: values.quantity,
          registryItemId: registryItem.id,
          status: values.status,
          transactionId: values.transactionId || undefined,
        });

        if (result.success) {
          showSuccessNotification('Purchase recorded successfully');
          onSubmit?.();
          onClose();
          form.reset();
        } else {
          showErrorNotification(result.error || 'Failed to record purchase');
        }
      }
    } catch (error) {
      showErrorNotification('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = users.find((u) => u.id === form.values.purchaserId);
  const statusOption = PURCHASE_STATUS_OPTIONS.find((s) => s.value === form.values.status);

  return (
    <Modal
      onClose={onClose}
      opened={opened}
      scrollAreaComponent={ScrollArea.Autosize}
      size="lg"
      title={
        <Group gap="sm">
          <Badge
            color="blue"
            leftSection={purchase ? <IconTruck size={14} /> : <IconReceipt size={14} />}
          >
            {purchase ? 'Update Purchase' : 'Record Purchase'}
          </Badge>
          <Text fw={600}>{registryItem.registry.title}</Text>
        </Group>
      }
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          {/* Item Information */}
          <Card withBorder bg="gray.0" p="md" radius="md">
            <Title order={5} mb="md">
              Item Information
            </Title>
            <Group>
              <div style={{ flex: 1 }}>
                <Text fw={500} size="sm">
                  {registryItem.product?.name || registryItem.collection?.name}
                </Text>
                <Text c="dimmed" size="xs">
                  {registryItem.product ? 'Product' : 'Collection'}
                  {registryItem.product?.sku && ` • SKU: ${registryItem.product.sku}`}
                </Text>
                <Badge color="blue" mt="xs" size="xs">
                  Needed: {registryItem.quantity}
                </Badge>
              </div>
              {registryItem.product?.price && (
                <div style={{ textAlign: 'right' }}>
                  <Text c="green" fw={500}>
                    {formatCurrency(registryItem.product.price)}
                  </Text>
                  <Text c="dimmed" size="xs">
                    per item
                  </Text>
                </div>
              )}
            </Group>
          </Card>

          {/* Purchaser Selection */}
          {!purchase && (
            <Card withBorder p="md" radius="md">
              <Title order={5} mb="md">
                Purchaser
              </Title>
              <Stack gap="md">
                <TextInput
                  leftSection={<IconSearch size={16} />}
                  onChange={(e) => setUserSearch(e.currentTarget.value)}
                  placeholder="Search users..."
                  value={userSearch}
                />

                <Select
                  placeholder="Select purchaser"
                  clearable
                  data={users.map((user) => ({
                    label: `${user.name} (${user.email})`,
                    value: user.id,
                  }))}
                  searchable
                  {...form.getInputProps('purchaserId')}
                />

                {selectedUser && (
                  <Card withBorder bg="blue.0" p="sm" radius="md">
                    <Group>
                      <Avatar radius="xl" size="sm" src={selectedUser.image}>
                        {selectedUser.name.charAt(0)}
                      </Avatar>
                      <div>
                        <Text fw={500} size="sm">
                          {selectedUser.name}
                        </Text>
                        <Text c="dimmed" size="xs">
                          {selectedUser.email}
                        </Text>
                      </div>
                    </Group>
                  </Card>
                )}
              </Stack>
            </Card>
          )}

          {/* Purchase Details */}
          <Card withBorder p="md" radius="md">
            <Title order={5} mb="md">
              Purchase Details
            </Title>
            <Stack gap="md">
              <Group grow>
                <NumberInput
                  description="How many items were purchased"
                  disabled={!!purchase}
                  label="Quantity"
                  max={registryItem.quantity}
                  min={1}
                  {...form.getInputProps('quantity')}
                />
                <NumberInput
                  description="Purchase price (optional)"
                  leftSection={<Text size="xs">$</Text>}
                  decimalScale={2}
                  disabled={!!purchase}
                  label="Price per item"
                  min={0}
                  {...form.getInputProps('price')}
                />
              </Group>

              <Select
                description="Current purchase status"
                data={PURCHASE_STATUS_OPTIONS.map((option) => ({
                  label: option.label,
                  value: option.value,
                }))}
                label="Status"
                {...form.getInputProps('status')}
              />

              <Group grow>
                <TextInput
                  description="Payment transaction ID"
                  placeholder="txn_12345..."
                  disabled={!!purchase}
                  label="Transaction ID"
                  {...form.getInputProps('transactionId')}
                />
                <TextInput
                  description="Merchant order number"
                  placeholder="ORD-12345"
                  disabled={!!purchase}
                  label="Order Number"
                  {...form.getInputProps('orderNumber')}
                />
              </Group>
            </Stack>
          </Card>

          {/* Shipping Information */}
          <Card withBorder p="md" radius="md">
            <Title order={5} mb="md">
              Shipping & Delivery
            </Title>
            <Stack gap="md">
              <Group grow>
                <TextInput
                  description="Shipping tracking number"
                  leftSection={<IconTruck size={16} />}
                  placeholder="1Z999..."
                  label="Tracking Number"
                  {...form.getInputProps('trackingNumber')}
                />
                <TextInput
                  description="Link to track package"
                  placeholder="https://..."
                  label="Tracking URL"
                  {...form.getInputProps('trackingUrl')}
                />
              </Group>

              <Group grow>
                <DateInput
                  description="Expected delivery date"
                  leftSection={<IconCalendar size={16} />}
                  placeholder="Select date"
                  clearable
                  label="Estimated Delivery"
                  {...form.getInputProps('estimatedDelivery')}
                />
                <DateInput
                  description="Actual delivery date"
                  leftSection={<IconPackage size={16} />}
                  placeholder="Select date"
                  clearable
                  label="Actual Delivery"
                  {...form.getInputProps('actualDelivery')}
                />
              </Group>
            </Stack>
          </Card>

          {/* Gift Information */}
          <Card withBorder p="md" radius="md">
            <Title order={5} mb="md">
              Gift Information
            </Title>
            <Stack gap="md">
              <Switch
                description="Mark this purchase as a gift"
                disabled={!!purchase}
                label="This is a gift"
                {...form.getInputProps('isGift', { type: 'checkbox' })}
              />

              {form.values.isGift && (
                <Textarea
                  description="Optional message from the gift giver"
                  leftSection={<IconGift size={16} />}
                  maxRows={6}
                  minRows={3}
                  placeholder="Happy birthday! Hope you enjoy this..."
                  disabled={!!purchase}
                  label="Gift Message"
                  {...form.getInputProps('giftMessage')}
                />
              )}

              <Textarea
                description="Additional notes about this purchase"
                maxRows={4}
                minRows={2}
                placeholder="Special delivery instructions, etc."
                label="Notes"
                {...form.getInputProps('notes')}
              />
            </Stack>
          </Card>

          {/* Summary */}
          <Card withBorder bg="gray.0" p="md" radius="md">
            <Title order={5} mb="md">
              Purchase Summary
            </Title>
            <Group justify="space-between">
              <div>
                <Text fw={500} size="sm">
                  {registryItem.product?.name || registryItem.collection?.name}
                </Text>
                <Text c="dimmed" size="xs">
                  Quantity: {form.values.quantity}
                  {form.values.isGift && ' • Gift'}
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                {statusOption && (
                  <Badge color={statusOption.color} mb="xs">
                    {statusOption.label}
                  </Badge>
                )}
                {form.values.price && form.values.price > 0 && (
                  <Text c="green" fw={600}>
                    {formatCurrency(form.values.price * form.values.quantity)}
                  </Text>
                )}
              </div>
            </Group>
          </Card>

          {/* Actions */}
          <Group justify="flex-end">
            <Button onClick={onClose} variant="light">
              Cancel
            </Button>
            <Button
              loading={loading}
              disabled={!purchase && !form.values.purchaserId}
              type="submit"
            >
              {purchase ? 'Update Purchase' : 'Record Purchase'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
