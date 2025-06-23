'use client';

import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconBox,
  IconCheck,
  IconMapPin,
  IconPackage,
  IconPlus,
  IconTrendingUp,
} from '@tabler/icons-react';
import { useState } from 'react';
import { z } from 'zod';

import { upsertInventory, adjustInventory, reserveInventory } from '@/actions/pim3/actions';
import { InventoryTransactionType } from '@repo/database/prisma';

const inventoryFormSchema = z.object({
  productId: z.string().optional(),
  variantId: z.string().optional(),
  quantity: z.number().min(0, 'Quantity must be non-negative'),
  reserved: z.number().min(0, 'Reserved must be non-negative').default(0),
  lowStockThreshold: z.number().min(0, 'Threshold must be non-negative').optional(),
  locationId: z.string().optional(),
  locationName: z.string().min(1, 'Location name is required'),
});

const adjustmentFormSchema = z.object({
  inventoryId: z.string().min(1, 'Inventory item is required'),
  adjustment: z.number({ required_error: 'Adjustment is required' }),
  type: z.nativeEnum(InventoryTransactionType),
  notes: z.string().optional(),
  referenceId: z.string().optional(),
  referenceType: z.string().optional(),
});

const reservationFormSchema = z.object({
  inventoryId: z.string().min(1, 'Inventory item is required'),
  quantity: z.number().min(1, 'Quantity must be positive'),
  reserve: z.boolean().default(true),
});

interface InventoryFormProps {
  initialData?: any;
  onSuccess?: () => void;
  mode?: 'create' | 'edit' | 'adjust' | 'reserve';
  productOptions?: Array<{ value: string; label: string }>;
  variantOptions?: Array<{ value: string; label: string }>;
  inventoryOptions?: Array<{ value: string; label: string }>;
}

export function InventoryForm({
  initialData,
  onSuccess,
  mode = 'create',
  productOptions = [],
  variantOptions = [],
  inventoryOptions = [],
}: InventoryFormProps) {
  const [loading, setLoading] = useState(false);

  // Main inventory form
  const inventoryForm = useForm({
    validate: zodResolver(inventoryFormSchema),
    initialValues: {
      productId: initialData?.productId || '',
      variantId: initialData?.variantId || '',
      quantity: initialData?.quantity || 0,
      reserved: initialData?.reserved || 0,
      lowStockThreshold: initialData?.lowStockThreshold || undefined,
      locationId: initialData?.locationId || '',
      locationName: initialData?.locationName || '',
    },
  });

  // Adjustment form
  const adjustmentForm = useForm({
    validate: zodResolver(adjustmentFormSchema),
    initialValues: {
      inventoryId: '',
      adjustment: 0,
      type: InventoryTransactionType.ADJUSTMENT,
      notes: '',
      referenceId: '',
      referenceType: '',
    },
  });

  // Reservation form
  const reservationForm = useForm({
    validate: zodResolver(reservationFormSchema),
    initialValues: {
      inventoryId: '',
      quantity: 1,
      reserve: true,
    },
  });

  const handleInventorySubmit = async (values: typeof inventoryForm.values) => {
    setLoading(true);
    try {
      const result = await upsertInventory(values);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Inventory saved successfully',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
        onSuccess?.(result.data);
        if (mode === 'create') {
          inventoryForm.reset();
        }
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to save inventory',
          color: 'red',
          icon: <IconAlertTriangle size={16} />,
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'An unexpected error occurred',
        color: 'red',
        icon: <IconAlertTriangle size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustmentSubmit = async (values: typeof adjustmentForm.values) => {
    setLoading(true);
    try {
      const result = await adjustInventory(values.inventoryId, {
        adjustment: values.adjustment,
        type: values.type,
        notes: values.notes,
        referenceId: values.referenceId,
        referenceType: values.referenceType,
      });

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Inventory adjusted successfully',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
        onSuccess?.(result.data);
        adjustmentForm.reset();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to adjust inventory',
          color: 'red',
          icon: <IconAlertTriangle size={16} />,
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'An unexpected error occurred',
        color: 'red',
        icon: <IconAlertTriangle size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReservationSubmit = async (values: typeof reservationForm.values) => {
    setLoading(true);
    try {
      const result = await reserveInventory(values.inventoryId, values.quantity, values.reserve);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: `Inventory ${values.reserve ? 'reserved' : 'unreserved'} successfully`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });
        onSuccess?.(result.data);
        reservationForm.reset();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to update reservation',
          color: 'red',
          icon: <IconAlertTriangle size={16} />,
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'An unexpected error occurred',
        color: 'red',
        icon: <IconAlertTriangle size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvailableStock = () => {
    return inventoryForm.values.quantity - inventoryForm.values.reserved;
  };

  const getStockStatus = () => {
    const available = getAvailableStock();
    const threshold = inventoryForm.values.lowStockThreshold;

    if (available <= 0) {
      return { color: 'red', label: 'Out of Stock' };
    } else if (threshold && available <= threshold) {
      return { color: 'orange', label: 'Low Stock' };
    } else {
      return { color: 'green', label: 'In Stock' };
    }
  };

  if (mode === 'adjust') {
    return (
      <Card withBorder>
        <Stack>
          <Group gap="sm">
            <IconTrendingUp size={20} />
            <Text fw={600} size="lg">
              Stock Adjustment
            </Text>
          </Group>

          <form onSubmit={adjustmentForm.onSubmit(handleAdjustmentSubmit)}>
            <Stack>
              <Select
                label="Inventory Item"
                placeholder="Select inventory item"
                data={inventoryOptions}
                searchable
                required
                leftSection={<IconBox size={16} />}
                {...adjustmentForm.getInputProps('inventoryId')}
              />

              <NumberInput
                label="Adjustment Quantity"
                placeholder="Enter adjustment (positive to add, negative to remove)"
                description="Use positive numbers to add stock, negative to remove"
                required
                {...adjustmentForm.getInputProps('adjustment')}
              />

              <Select
                label="Adjustment Type"
                placeholder="Select type"
                data={[
                  { value: 'RESTOCK', label: 'Restock' },
                  { value: 'SALE', label: 'Sale' },
                  { value: 'DAMAGED', label: 'Damaged' },
                  { value: 'LOST', label: 'Lost' },
                  { value: 'RETURNED', label: 'Returned' },
                  { value: 'ADJUSTMENT', label: 'Manual Adjustment' },
                ]}
                required
                {...adjustmentForm.getInputProps('type')}
              />

              <Textarea
                label="Notes"
                placeholder="Explain the reason for this adjustment"
                {...adjustmentForm.getInputProps('notes')}
              />

              <Group>
                <TextInput
                  label="Reference ID"
                  placeholder="Order ID, SKU, etc."
                  flex={1}
                  {...adjustmentForm.getInputProps('referenceId')}
                />
                <TextInput
                  label="Reference Type"
                  placeholder="order, sku, etc."
                  flex={1}
                  {...adjustmentForm.getInputProps('referenceType')}
                />
              </Group>

              <Group justify="flex-end" gap="sm">
                <Button variant="outline" onClick={() => adjustmentForm.reset()} disabled={loading}>
                  Reset
                </Button>
                <Button type="submit" loading={loading} leftSection={<IconTrendingUp size={16} />}>
                  Apply Adjustment
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Card>
    );
  }

  if (mode === 'reserve') {
    return (
      <Card withBorder>
        <Stack>
          <Group gap="sm">
            <IconPackage size={20} />
            <Text fw={600} size="lg">
              Inventory Reservation
            </Text>
          </Group>

          <form onSubmit={reservationForm.onSubmit(handleReservationSubmit)}>
            <Stack>
              <Select
                label="Inventory Item"
                placeholder="Select inventory item"
                data={inventoryOptions}
                searchable
                required
                leftSection={<IconBox size={16} />}
                {...reservationForm.getInputProps('inventoryId')}
              />

              <NumberInput
                label="Quantity"
                placeholder="Enter quantity"
                min={1}
                required
                {...reservationForm.getInputProps('quantity')}
              />

              <Switch
                label="Reserve Stock"
                description="Turn off to unreserve stock instead"
                {...reservationForm.getInputProps('reserve')}
              />

              <Group justify="flex-end" gap="sm">
                <Button
                  variant="outline"
                  onClick={() => reservationForm.reset()}
                  disabled={loading}
                >
                  Reset
                </Button>
                <Button type="submit" loading={loading} leftSection={<IconPackage size={16} />}>
                  {reservationForm.values.reserve ? 'Reserve' : 'Unreserve'} Stock
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Card>
    );
  }

  // Main inventory form (create/edit)
  return (
    <Card withBorder>
      <Stack>
        <Group gap="sm">
          <IconBox size={20} />
          <Text fw={600} size="lg">
            {mode === 'edit' ? 'Edit' : 'Create'} Inventory Item
          </Text>
        </Group>

        <form onSubmit={inventoryForm.onSubmit(handleInventorySubmit)}>
          <Stack>
            {/* Product/Variant Selection */}
            <Group grow>
              <Select
                label="Product"
                placeholder="Select product"
                data={productOptions}
                searchable
                clearable
                leftSection={<IconBox size={16} />}
                {...inventoryForm.getInputProps('productId')}
              />
              <Select
                label="Variant (Optional)"
                placeholder="Select variant"
                data={variantOptions}
                searchable
                clearable
                disabled={!inventoryForm.values.productId}
                {...inventoryForm.getInputProps('variantId')}
              />
            </Group>

            {/* Location Information */}
            <Group grow>
              <TextInput
                label="Location ID (Optional)"
                placeholder="e.g., warehouse-1, store-nyc"
                leftSection={<IconMapPin size={16} />}
                {...inventoryForm.getInputProps('locationId')}
              />
              <TextInput
                label="Location Name"
                placeholder="e.g., Main Warehouse, NYC Store"
                required
                leftSection={<IconMapPin size={16} />}
                {...inventoryForm.getInputProps('locationName')}
              />
            </Group>

            {/* Stock Quantities */}
            <Group grow>
              <NumberInput
                label="Total Quantity"
                placeholder="Enter total stock"
                min={0}
                required
                {...inventoryForm.getInputProps('quantity')}
              />
              <NumberInput
                label="Reserved Quantity"
                placeholder="Enter reserved stock"
                min={0}
                {...inventoryForm.getInputProps('reserved')}
              />
            </Group>

            {/* Available Stock Display */}
            {inventoryForm.values.quantity >= 0 && inventoryForm.values.reserved >= 0 && (
              <Alert color={getStockStatus().color} icon={<IconBox size={16} />}>
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Available Stock: {getAvailableStock()} units</Text>
                    <Text size="sm" c="dimmed">
                      Status:{' '}
                      <Badge color={getStockStatus().color} size="sm">
                        {getStockStatus().label}
                      </Badge>
                    </Text>
                  </div>
                </Group>
              </Alert>
            )}

            {/* Alerts and Thresholds */}
            <NumberInput
              label="Low Stock Threshold (Optional)"
              placeholder="Alert when stock falls below this level"
              min={0}
              description="Set a threshold to receive low stock alerts"
              {...inventoryForm.getInputProps('lowStockThreshold')}
            />

            {/* Warning for low stock */}
            {inventoryForm.values.lowStockThreshold &&
              getAvailableStock() <= inventoryForm.values.lowStockThreshold && (
                <Alert color="orange" icon={<IconAlertTriangle size={16} />}>
                  <Text fw={500}>Low Stock Warning</Text>
                  <Text size="sm">
                    Available stock ({getAvailableStock()}) is at or below the threshold (
                    {inventoryForm.values.lowStockThreshold}).
                  </Text>
                </Alert>
              )}

            <Group justify="flex-end" gap="sm">
              <Button variant="outline" onClick={() => inventoryForm.reset()} disabled={loading}>
                Reset
              </Button>
              <Button
                type="submit"
                loading={loading}
                leftSection={mode === 'edit' ? <IconCheck size={16} /> : <IconPlus size={16} />}
              >
                {mode === 'edit' ? 'Update' : 'Create'} Inventory
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Card>
  );
}
