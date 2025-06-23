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
} from '@mantine/core';
import {
  IconShoppingCart,
  IconCheck,
  IconDeviceFloppy,
  IconAlertCircle,
  IconRefresh,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { usePimForm } from '@/hooks/pim3/usePimForm';
import { useFormDataLoading } from '@/hooks/pim3/useFormLoading';
import { useFormErrors } from '@/hooks/pim3/useFormErrors';
import { createCart, updateCart, getCart, removeCartItem } from '@/actions/pim3/carts/actions';
import { getProductsAction } from '@/actions/pim3/actions';
import { CartStatus } from '@repo/database/prisma';

// Cart form schema with validation
const cartFormSchema = z
  .object({
    userId: z.string().optional().or(z.literal('')),
    sessionId: z.string().optional().or(z.literal('')),
    status: z.nativeEnum(CartStatus).default(CartStatus.ACTIVE),
    currency: z.string().default('USD'),
    notes: z.string().optional().or(z.literal('')),
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
    expiresAt: z.date().optional(),

    // Cart items
    items: z
      .array(
        z.object({
          id: z.string().optional(),
          productId: z.string().min(1, 'Product is required'),
          variantId: z.string().optional(),
          quantity: z.number().min(1, 'Quantity must be at least 1'),
          price: z.number().min(0, 'Price must be positive'),
          isGift: z.boolean().default(false),
          giftMessage: z.string().optional(),
          savedForLater: z.boolean().default(false),
        }),
      )
      .default([]),
  })
  .refine(
    (data) => {
      // Must have either userId or sessionId
      return data.userId || data.sessionId;
    },
    {
      message: 'Either User ID or Session ID must be provided',
      path: ['userId'],
    },
  );

type CartFormData = z.infer<typeof cartFormSchema>;

interface CartFormProps {
  onClose: () => void;
  onSuccess: () => void;
  opened: boolean;
  cartId?: string | null;
}

export function CartForm({ onClose, onSuccess, opened, cartId }: CartFormProps) {
  const isEditing = !!cartId;

  // Form data loading states
  const { dataStates, isDataLoading, withDataLoading } = useFormDataLoading();

  // Auto-save for active carts
  const autoSaveCart = async (values: CartFormData) => {
    if (isEditing && values.status === 'ACTIVE') {
      await updateCart(cartId, {
        ...values,
        userId: values.userId || undefined,
        sessionId: values.sessionId || undefined,
        notes: values.notes || undefined,
        metadata: values.metadata ? JSON.parse(values.metadata) : undefined,
      });
    }
  };

  // Enhanced form with cart management features
  const form = usePimForm({
    schema: cartFormSchema,
    initialValues: {
      userId: '',
      sessionId: '',
      status: CartStatus.ACTIVE,
      currency: 'USD',
      notes: '',
      metadata: JSON.stringify(
        {
          source: 'admin',
          tags: [],
        },
        null,
        2,
      ),
      expiresAt: undefined,
      items: [],
    },
    autoSave: {
      enabled: isEditing,
      delay: 3000,
      onSave: autoSaveCart,
    },
    transformOnSubmit: async (values) => {
      return {
        ...values,
        userId: values.userId || undefined,
        sessionId: values.sessionId || undefined,
        notes: values.notes || undefined,
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
    products: [] as Array<{ value: string; label: string; price?: number }>,
    users: [] as Array<{ value: string; label: string }>,
  });

  // Load form options
  useEffect(() => {
    const loadFormData = withDataLoading('options', async () => {
      const [products] = await Promise.all([
        getProductsAction({ limit: 1000 }).then((r) => (r.success ? r.data : [])),
        // Note: Add user loading when needed
      ]);

      setFormData({
        products: products.map((p) => ({
          value: p.id,
          label: `${p.name} (${p.sku})`,
          price: p.price ? Number(p.price) : 0,
        })),
        users: [], // Populate when user management is available
      });
    });

    if (opened) {
      loadFormData();
    }
  }, [opened, withDataLoading]);

  // Load existing cart data
  useEffect(() => {
    if (isEditing && opened) {
      const loadCart = withDataLoading('initialData', async () => {
        const result = await getCart(cartId);
        if (result.success && result.data) {
          const cart = result.data;
          form.setValues({
            userId: cart.userId || '',
            sessionId: cart.sessionId || '',
            status: cart.status,
            currency: cart.currency,
            notes: cart.notes || '',
            metadata: JSON.stringify(cart.metadata || {}, null, 2),
            expiresAt: cart.expiresAt ? new Date(cart.expiresAt) : undefined,
            items: cart.items.map((item) => ({
              id: item.id,
              productId: item.productId || '',
              variantId: item.variantId || undefined,
              quantity: item.quantity,
              price: Number(item.price),
              isGift: item.isGift,
              giftMessage: item.giftMessage || undefined,
              savedForLater: item.savedForLater,
            })),
          });
          form.markAsSaved();
        }
      });

      loadCart().catch(errorHandler.handleServerError);
    }
  }, [isEditing, cartId, opened, form, withDataLoading, errorHandler]);

  // Submit handler
  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEditing) {
        const result = await updateCart(cartId, values);

        if (!result.success) {
          throw new Error(result.error || 'Failed to update cart');
        }

        errorHandler.showSuccess('Cart updated successfully');
      } else {
        const result = await createCart(values);

        if (!result.success) {
          throw new Error(result.error || 'Failed to create cart');
        }

        errorHandler.showSuccess('Cart created successfully');
      }
    } catch (error) {
      errorHandler.handleServerError(error);
      throw error;
    }
  });

  // Cart item management
  const addItem = () => {
    form.addArrayItem('items', {
      productId: '',
      quantity: 1,
      price: 0,
      isGift: false,
      savedForLater: false,
    });
  };

  const removeItem = (index: number) => {
    const item = form.values.items[index];
    if (item.id && isEditing) {
      // Remove from database if editing
      removeCartItem(item.id).then(() => {
        form.removeArrayItem('items', index);
      });
    } else {
      form.removeArrayItem('items', index);
    }
  };

  const updateItemPrice = (index: number, productId: string) => {
    const product = formData.products.find((p) => p.value === productId);
    if (product && product.price) {
      form.setFieldValue(`items.${index}.price`, product.price);
    }
  };

  const calculateCartTotal = () => {
    return form.values.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
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
          <IconShoppingCart size={20} />
          <Title order={4}>{isEditing ? 'Edit Cart' : 'Create Cart'}</Title>
          {form.isDirty && (
            <Badge color="orange" variant="light">
              Unsaved Changes
            </Badge>
          )}
          {form.isAutoSaving && (
            <Badge color="blue" variant="light">
              <IconDeviceFloppy size={12} />
              Auto-saving...
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
        <Stack>
          {/* Cart Basic Info */}
          <Card withBorder p="sm">
            <Stack>
              <Title order={5}>Cart Information</Title>

              <Group grow>
                <TextInput
                  label="User ID"
                  placeholder="Enter user ID (optional)"
                  {...form.getInputProps('userId')}
                />
                <TextInput
                  label="Session ID"
                  placeholder="Enter session ID (optional)"
                  {...form.getInputProps('sessionId')}
                />
              </Group>

              <Group grow>
                <Select
                  label="Status"
                  data={[
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'ABANDONED', label: 'Abandoned' },
                    { value: 'CONVERTED', label: 'Converted' },
                    { value: 'EXPIRED', label: 'Expired' },
                  ]}
                  {...form.getInputProps('status')}
                />
                <TextInput label="Currency" placeholder="USD" {...form.getInputProps('currency')} />
              </Group>

              <DatePickerInput
                label="Expires At"
                placeholder="Select expiration date (optional)"
                {...form.getInputProps('expiresAt')}
              />

              <Textarea
                label="Notes"
                placeholder="Cart notes or comments"
                {...form.getInputProps('notes')}
              />
            </Stack>
          </Card>

          {/* Cart Items */}
          <Card withBorder p="sm">
            <Stack>
              <Group justify="space-between">
                <Title order={5}>Cart Items</Title>
                <Group>
                  <Badge variant="light">Total: ${calculateCartTotal().toFixed(2)}</Badge>
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
                      <Table.Th>Quantity</Table.Th>
                      <Table.Th>Price</Table.Th>
                      <Table.Th>Total</Table.Th>
                      <Table.Th>Gift</Table.Th>
                      <Table.Th>Saved</Table.Th>
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
                            {...form.getInputProps(`items.${index}.productId`)}
                            onChange={(value) => {
                              form.setFieldValue(`items.${index}.productId`, value || '');
                              if (value) {
                                updateItemPrice(index, value);
                              }
                            }}
                          />
                        </Table.Td>
                        <Table.Td>
                          <NumberInput
                            min={1}
                            {...form.getInputProps(`items.${index}.quantity`)}
                            style={{ width: 80 }}
                          />
                        </Table.Td>
                        <Table.Td>
                          <NumberInput
                            min={0}
                            step={0.01}
                            {...form.getInputProps(`items.${index}.price`)}
                            style={{ width: 100 }}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={500}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Checkbox
                            {...form.getInputProps(`items.${index}.isGift`, { type: 'checkbox' })}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Checkbox
                            {...form.getInputProps(`items.${index}.savedForLater`, {
                              type: 'checkbox',
                            })}
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
                  No items in cart. Click "Add Item" to get started.
                </Text>
              )}
            </Stack>
          </Card>

          {/* Metadata */}
          <Card withBorder p="sm">
            <Stack>
              <Title order={5}>Cart Metadata</Title>
              <Text size="xs" c="dimmed">
                Additional cart data in JSON format
              </Text>
              <JsonInput
                placeholder="Cart metadata in JSON format"
                validationError="Invalid JSON format"
                formatOnBlur
                autosize
                minRows={4}
                {...form.getInputProps('metadata')}
              />
            </Stack>
          </Card>
        </Stack>

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
              {isEditing ? 'Update Cart' : 'Create Cart'}
            </Button>
          </Group>
        </Group>
      </form>
    </Modal>
  );
}
