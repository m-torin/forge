'use client';

import {
  Badge,
  Button,
  Card,
  Divider,
  Group,
  LoadingOverlay,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Alert,
  JsonInput,
  DatePickerInput,
  Textarea,
  Table,
  ActionIcon,
  Checkbox,
  Tabs,
} from '@mantine/core';
import {
  IconPackage,
  IconCheck,
  IconAlertCircle,
  IconRefresh,
  IconPlus,
  IconTrash,
  IconUser,
  IconCreditCard,
  IconTruck,
  IconClipboardList,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { usePimForm } from '@/hooks/pim3/usePimForm';
import { useFormDataLoading } from '@/hooks/pim3/useFormLoading';
import { useFormErrors } from '@/hooks/pim3/useFormErrors';
import { createOrder, updateOrder, getOrder } from '@/actions/pim3/orders/actions';
import { getProductsAction } from '@/actions/pim3/actions';
import { OrderStatus, PaymentStatus } from '@repo/database/prisma';

// Order form schema with validation
const orderFormSchema = z
  .object({
    // Customer info
    userId: z.string().optional().or(z.literal('')),
    guestEmail: z.string().email('Invalid email').optional().or(z.literal('')),
    guestName: z.string().optional().or(z.literal('')),

    // Order status
    status: z.nativeEnum(OrderStatus).default(OrderStatus.PENDING),
    paymentStatus: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),

    // Pricing
    currency: z.string().default('USD'),
    subtotal: z.number().min(0, 'Subtotal must be positive'),
    taxAmount: z.number().min(0, 'Tax amount must be positive'),
    shippingAmount: z.number().min(0, 'Shipping amount must be positive'),
    discountAmount: z.number().min(0, 'Discount amount must be positive').default(0),
    total: z.number().min(0, 'Total must be positive'),

    // Shipping
    shippingMethod: z.string().optional().or(z.literal('')),
    trackingNumber: z.string().optional().or(z.literal('')),
    shippedAt: z.date().optional(),
    deliveredAt: z.date().optional(),

    // Payment
    paymentMethod: z.string().optional().or(z.literal('')),

    // Notes
    customerNotes: z.string().optional().or(z.literal('')),
    internalNotes: z.string().optional().or(z.literal('')),

    // Metadata
    metadata: z
      .string()
      .refine((val) => {
        if (!val) return true;
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      }, 'Must be valid JSON')
      .default('{}'),

    // Order items
    items: z
      .array(
        z.object({
          id: z.string().optional(),
          productId: z.string().min(1, 'Product is required'),
          variantId: z.string().optional(),
          productName: z.string().min(1, 'Product name is required'),
          variantName: z.string().optional(),
          sku: z.string().optional(),
          quantity: z.number().min(1, 'Quantity must be at least 1'),
          price: z.number().min(0, 'Price must be positive'),
          total: z.number().min(0, 'Total must be positive'),
          isGift: z.boolean().default(false),
          giftMessage: z.string().optional(),
          status: z
            .enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'])
            .default('PENDING'),
        }),
      )
      .default([]),
  })
  .refine(
    (data) => {
      // Must have either userId or guest info
      return data.userId || (data.guestEmail && data.guestName);
    },
    {
      message: 'Either User ID or guest information must be provided',
      path: ['userId'],
    },
  );

type OrderFormData = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  onClose: () => void;
  onSuccess: () => void;
  opened: boolean;
  orderId?: string | null;
}

export function OrderForm({ onClose, onSuccess, opened, orderId }: OrderFormProps) {
  const isEditing = !!orderId;

  // Form data loading states
  const { dataStates, isDataLoading, withDataLoading } = useFormDataLoading();

  // Enhanced form with order management features
  const form = usePimForm({
    schema: orderFormSchema,
    initialValues: {
      userId: '',
      guestEmail: '',
      guestName: '',
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      currency: 'USD',
      subtotal: 0,
      taxAmount: 0,
      shippingAmount: 0,
      discountAmount: 0,
      total: 0,
      shippingMethod: '',
      trackingNumber: '',
      shippedAt: undefined,
      deliveredAt: undefined,
      paymentMethod: '',
      customerNotes: '',
      internalNotes: '',
      metadata: JSON.stringify(
        {
          source: 'admin',
          channel: 'web',
        },
        null,
        2,
      ),
      items: [],
    },
    transformOnSubmit: async (values) => {
      return {
        ...values,
        userId: values.userId || undefined,
        guestEmail: values.guestEmail || undefined,
        guestName: values.guestName || undefined,
        shippingMethod: values.shippingMethod || undefined,
        trackingNumber: values.trackingNumber || undefined,
        paymentMethod: values.paymentMethod || undefined,
        customerNotes: values.customerNotes || undefined,
        internalNotes: values.internalNotes || undefined,
        metadata: values.metadata ? JSON.parse(values.metadata) : undefined,
      };
    },
    dirtyTracking: true,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  // Error handling
  const errorHandler = useFormErrors(form);

  // Form options data
  const [formData, setFormData] = useState({
    products: [] as Array<{
      value: string;
      label: string;
      price?: number;
      sku?: string;
      name?: string;
    }>,
  });

  // Load form options
  useEffect(() => {
    const loadFormData = withDataLoading('options', async () => {
      const [products] = await Promise.all([
        getProductsAction({ limit: 1000 }).then((r) => (r.success ? r.data : [])),
      ]);

      setFormData({
        products: products.map((p) => ({
          value: p.id,
          label: `${p.name} (${p.sku})`,
          price: p.price ? Number(p.price) : 0,
          sku: p.sku,
          name: p.name,
        })),
      });
    });

    if (opened) {
      loadFormData();
    }
  }, [opened, withDataLoading]);

  // Load existing order data
  useEffect(() => {
    if (isEditing && opened) {
      const loadOrder = withDataLoading('initialData', async () => {
        const result = await getOrder(orderId);
        if (result.success && result.data) {
          const order = result.data;
          form.setValues({
            userId: order.userId || '',
            guestEmail: order.guestEmail || '',
            guestName: order.guestName || '',
            status: order.status,
            paymentStatus: order.paymentStatus,
            currency: order.currency,
            subtotal: Number(order.subtotal),
            taxAmount: Number(order.taxAmount),
            shippingAmount: Number(order.shippingAmount),
            discountAmount: Number(order.discountAmount),
            total: Number(order.total),
            shippingMethod: order.shippingMethod || '',
            trackingNumber: order.trackingNumber || '',
            shippedAt: order.shippedAt ? new Date(order.shippedAt) : undefined,
            deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : undefined,
            paymentMethod: order.paymentMethod || '',
            customerNotes: order.customerNotes || '',
            internalNotes: order.internalNotes || '',
            metadata: JSON.stringify(order.metadata || {}, null, 2),
            items: order.items.map((item) => ({
              id: item.id,
              productId: item.productId || '',
              variantId: item.variantId || undefined,
              productName: item.productName,
              variantName: item.variantName || undefined,
              sku: item.sku || undefined,
              quantity: item.quantity,
              price: Number(item.price),
              total: Number(item.total),
              isGift: item.isGift,
              giftMessage: item.giftMessage || undefined,
              status: item.status,
            })),
          });
          form.markAsSaved();
        }
      });

      loadOrder().catch(errorHandler.handleServerError);
    }
  }, [isEditing, orderId, opened, form, withDataLoading, errorHandler]);

  // Submit handler
  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEditing) {
        const result = await updateOrder(orderId, values);

        if (!result.success) {
          throw new Error(result.error || 'Failed to update order');
        }

        errorHandler.showSuccess('Order updated successfully');
      } else {
        const result = await createOrder(values);

        if (!result.success) {
          throw new Error(result.error || 'Failed to create order');
        }

        errorHandler.showSuccess('Order created successfully');
      }
    } catch (error) {
      errorHandler.handleServerError(error);
      throw error;
    }
  });

  // Order item management
  const addItem = () => {
    form.addArrayItem('items', {
      productId: '',
      productName: '',
      quantity: 1,
      price: 0,
      total: 0,
      isGift: false,
      status: 'PENDING',
    });
  };

  const removeItem = (index: number) => {
    form.removeArrayItem('items', index);
    calculateOrderTotals();
  };

  const updateItemProduct = (index: number, productId: string) => {
    const product = formData.products.find((p) => p.value === productId);
    if (product) {
      form.setFieldValue(`items.${index}.productId`, productId);
      form.setFieldValue(`items.${index}.productName`, product.name || '');
      form.setFieldValue(`items.${index}.sku`, product.sku || '');
      if (product.price) {
        form.setFieldValue(`items.${index}.price`, product.price);
        updateItemTotal(index);
      }
    }
  };

  const updateItemTotal = (index: number) => {
    const item = form.values.items[index];
    const total = item.price * item.quantity;
    form.setFieldValue(`items.${index}.total`, total);
    calculateOrderTotals();
  };

  const calculateOrderTotals = () => {
    const subtotal = form.values.items.reduce((sum, item) => sum + item.total, 0);
    form.setFieldValue('subtotal', subtotal);

    const total =
      subtotal + form.values.taxAmount + form.values.shippingAmount - form.values.discountAmount;
    form.setFieldValue('total', Math.max(0, total));
  };

  // Handle modal close with unsaved changes warning
  const handleClose = () => {
    if (form.warnUnsavedChanges()) {
      form.reset();
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group>
          <IconPackage size={20} />
          <Title order={4}>{isEditing ? 'Edit Order' : 'Create Order'}</Title>
          {form.isDirty && (
            <Badge color="orange" variant="light">
              Unsaved Changes
            </Badge>
          )}
        </Group>
      }
      size="xl"
      overlayProps={{ backgroundOpacity: 0.5 }}
    >
      <LoadingOverlay visible={isDataLoading} />

      {errorHandler.hasNetworkErrors && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          mb="md"
          onClose={errorHandler.clearErrors}
          withCloseButton
        >
          Network error. Please check your connection and try again.
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="customer">
          <Tabs.List>
            <Tabs.Tab value="customer" leftSection={<IconUser size={16} />}>
              Customer
            </Tabs.Tab>
            <Tabs.Tab value="items" leftSection={<IconClipboardList size={16} />}>
              Items ({form.values.items.length})
            </Tabs.Tab>
            <Tabs.Tab value="payment" leftSection={<IconCreditCard size={16} />}>
              Payment
            </Tabs.Tab>
            <Tabs.Tab value="shipping" leftSection={<IconTruck size={16} />}>
              Shipping
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="customer" pt="md">
            <Stack>
              <Card withBorder p="sm">
                <Title order={5} mb="sm">
                  Customer Information
                </Title>

                <TextInput
                  label="User ID"
                  placeholder="Enter user ID (optional)"
                  {...form.getInputProps('userId')}
                />

                <Divider my="sm" label="OR" labelPosition="center" />

                <Group grow>
                  <TextInput
                    label="Guest Email"
                    placeholder="guest@example.com"
                    {...form.getInputProps('guestEmail')}
                  />
                  <TextInput
                    label="Guest Name"
                    placeholder="Guest Name"
                    {...form.getInputProps('guestName')}
                  />
                </Group>

                <Group grow>
                  <Select
                    label="Order Status"
                    data={[
                      { value: 'PENDING', label: 'Pending' },
                      { value: 'PROCESSING', label: 'Processing' },
                      { value: 'SHIPPED', label: 'Shipped' },
                      { value: 'DELIVERED', label: 'Delivered' },
                      { value: 'CANCELLED', label: 'Cancelled' },
                      { value: 'RETURNED', label: 'Returned' },
                    ]}
                    {...form.getInputProps('status')}
                  />
                  <TextInput
                    label="Currency"
                    placeholder="USD"
                    {...form.getInputProps('currency')}
                  />
                </Group>

                <Textarea
                  label="Customer Notes"
                  placeholder="Notes from customer"
                  {...form.getInputProps('customerNotes')}
                />

                <Textarea
                  label="Internal Notes"
                  placeholder="Internal notes for staff"
                  {...form.getInputProps('internalNotes')}
                />
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="items" pt="md">
            <Stack>
              <Group justify="space-between">
                <Title order={5}>Order Items</Title>
                <Group>
                  <Badge variant="light">Subtotal: ${form.values.subtotal.toFixed(2)}</Badge>
                  <Button
                    variant="light"
                    size="sm"
                    leftSection={<IconPlus size={16} />}
                    onClick={addItem}
                  >
                    Add Item
                  </Button>
                </Group>
              </Group>

              {form.values.items.length > 0 ? (
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Product</Table.Th>
                      <Table.Th>SKU</Table.Th>
                      <Table.Th>Qty</Table.Th>
                      <Table.Th>Price</Table.Th>
                      <Table.Th>Total</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Gift</Table.Th>
                      <Table.Th style={{ width: 80 }}>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {form.values.items.map((item, index) => (
                      <Table.Tr key={index}>
                        <Table.Td>
                          <Select
                            placeholder="Select product"
                            data={formData.products}
                            searchable
                            value={item.productId}
                            onChange={(value) => {
                              if (value) {
                                updateItemProduct(index, value);
                              }
                            }}
                          />
                        </Table.Td>
                        <Table.Td>
                          <TextInput
                            placeholder="SKU"
                            {...form.getInputProps(`items.${index}.sku`)}
                            style={{ width: 100 }}
                          />
                        </Table.Td>
                        <Table.Td>
                          <NumberInput
                            min={1}
                            {...form.getInputProps(`items.${index}.quantity`)}
                            onChange={(value) => {
                              form.setFieldValue(`items.${index}.quantity`, Number(value) || 1);
                              updateItemTotal(index);
                            }}
                            style={{ width: 80 }}
                          />
                        </Table.Td>
                        <Table.Td>
                          <NumberInput
                            min={0}
                            step={0.01}
                            {...form.getInputProps(`items.${index}.price`)}
                            onChange={(value) => {
                              form.setFieldValue(`items.${index}.price`, Number(value) || 0);
                              updateItemTotal(index);
                            }}
                            style={{ width: 100 }}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={500}>
                            ${item.total.toFixed(2)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Select
                            data={[
                              { value: 'PENDING', label: 'Pending' },
                              { value: 'PROCESSING', label: 'Processing' },
                              { value: 'SHIPPED', label: 'Shipped' },
                              { value: 'DELIVERED', label: 'Delivered' },
                              { value: 'CANCELLED', label: 'Cancelled' },
                            ]}
                            {...form.getInputProps(`items.${index}.status`)}
                            style={{ width: 120 }}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Checkbox
                            {...form.getInputProps(`items.${index}.isGift`, { type: 'checkbox' })}
                          />
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon color="red" variant="light" onClick={() => removeItem(index)}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              ) : (
                <Text c="dimmed" ta="center" py="md">
                  No items in order. Click "Add Item" to get started.
                </Text>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="payment" pt="md">
            <Stack>
              <Card withBorder p="sm">
                <Title order={5} mb="sm">
                  Payment Information
                </Title>

                <Group grow>
                  <Select
                    label="Payment Status"
                    data={[
                      { value: 'PENDING', label: 'Pending' },
                      { value: 'PROCESSING', label: 'Processing' },
                      { value: 'PAID', label: 'Paid' },
                      { value: 'FAILED', label: 'Failed' },
                      { value: 'CANCELLED', label: 'Cancelled' },
                      { value: 'REFUNDED', label: 'Refunded' },
                    ]}
                    {...form.getInputProps('paymentStatus')}
                  />
                  <TextInput
                    label="Payment Method"
                    placeholder="e.g., Credit Card, PayPal"
                    {...form.getInputProps('paymentMethod')}
                  />
                </Group>

                <Group grow>
                  <NumberInput
                    label="Subtotal"
                    min={0}
                    step={0.01}
                    {...form.getInputProps('subtotal')}
                    onChange={(value) => {
                      form.setFieldValue('subtotal', Number(value) || 0);
                      calculateOrderTotals();
                    }}
                  />
                  <NumberInput
                    label="Tax Amount"
                    min={0}
                    step={0.01}
                    {...form.getInputProps('taxAmount')}
                    onChange={(value) => {
                      form.setFieldValue('taxAmount', Number(value) || 0);
                      calculateOrderTotals();
                    }}
                  />
                </Group>

                <Group grow>
                  <NumberInput
                    label="Shipping Amount"
                    min={0}
                    step={0.01}
                    {...form.getInputProps('shippingAmount')}
                    onChange={(value) => {
                      form.setFieldValue('shippingAmount', Number(value) || 0);
                      calculateOrderTotals();
                    }}
                  />
                  <NumberInput
                    label="Discount Amount"
                    min={0}
                    step={0.01}
                    {...form.getInputProps('discountAmount')}
                    onChange={(value) => {
                      form.setFieldValue('discountAmount', Number(value) || 0);
                      calculateOrderTotals();
                    }}
                  />
                </Group>

                <NumberInput
                  label="Total"
                  min={0}
                  step={0.01}
                  {...form.getInputProps('total')}
                  styles={{
                    input: {
                      fontWeight: 700,
                      fontSize: '1.1em',
                    },
                  }}
                />
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="shipping" pt="md">
            <Stack>
              <Card withBorder p="sm">
                <Title order={5} mb="sm">
                  Shipping Information
                </Title>

                <Group grow>
                  <TextInput
                    label="Shipping Method"
                    placeholder="e.g., Standard, Express, Overnight"
                    {...form.getInputProps('shippingMethod')}
                  />
                  <TextInput
                    label="Tracking Number"
                    placeholder="Enter tracking number"
                    {...form.getInputProps('trackingNumber')}
                  />
                </Group>

                <Group grow>
                  <DatePickerInput
                    label="Shipped At"
                    placeholder="Select shipped date"
                    {...form.getInputProps('shippedAt')}
                  />
                  <DatePickerInput
                    label="Delivered At"
                    placeholder="Select delivered date"
                    {...form.getInputProps('deliveredAt')}
                  />
                </Group>

                <JsonInput
                  label="Order Metadata"
                  placeholder="Order metadata in JSON format"
                  validationError="Invalid JSON format"
                  formatOnBlur
                  autosize
                  minRows={4}
                  {...form.getInputProps('metadata')}
                />
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Divider my="md" />

        <Group justify="space-between">
          <Group>
            {form.isDirty && (
              <Button variant="subtle" leftSection={<IconRefresh size={16} />} onClick={form.reset}>
                Reset Changes
              </Button>
            )}
          </Group>

          <Group>
            <Button variant="subtle" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={form.isSubmitting} leftSection={<IconCheck size={16} />}>
              {isEditing ? 'Update Order' : 'Create Order'}
            </Button>
          </Group>
        </Group>
      </form>
    </Modal>
  );
}
