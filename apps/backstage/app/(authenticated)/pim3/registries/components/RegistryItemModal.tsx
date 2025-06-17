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
  Slider,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconGift,
  IconHeart,
  IconPackage,
  IconSearch,
  IconShoppingCart,
  IconStar,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import {
  formatCurrency,
  showErrorNotification,
  showSuccessNotification,
} from '../../utils/pim-helpers';
import {
  addRegistryItem,
  getCollectionsForSelect,
  getProductsForSelect,
  updateRegistryItem,
} from '../actions';

import type { RegistryWithRelations } from '../actions';

interface RegistryItemModalProps {
  item?: {
    id: string;
    quantity: number;
    priority: number;
    notes?: string | null;
    productId?: string | null;
    collectionId?: string | null;
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
  };
  onClose: () => void;
  onSubmit?: () => void;
  opened: boolean;
  registry: RegistryWithRelations;
}

interface ProductOption {
  currency?: string | null;
  description?: string | null;
  id: string;
  name: string;
  price?: number | null;
  sku: string;
}

interface CollectionOption {
  _count: {
    products: number;
  };
  copy?: any;
  id: string;
  name: string;
  slug: string;
  type: string;
}

/**
 * RegistryItemModal component for adding/editing registry items
 */
export function RegistryItemModal({
  item,
  onClose,
  onSubmit,
  opened,
  registry,
}: RegistryItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [itemType, setItemType] = useState<'product' | 'collection'>('product');
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [collectionSearch, setCollectionSearch] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCollections, setLoadingCollections] = useState(false);

  const [debouncedProductSearch] = useDebouncedValue(productSearch, 300);
  const [debouncedCollectionSearch] = useDebouncedValue(collectionSearch, 300);

  const form = useForm({
    validate: {
      priority: (value) => (value < 0 || value > 10 ? 'Priority must be between 0 and 10' : null),
      quantity: (value) => (value < 1 ? 'Quantity must be at least 1' : null),
    },
    initialValues: {
      collectionId: item?.collectionId || '',
      notes: item?.notes || '',
      priority: item?.priority || 5,
      productId: item?.productId || '',
      quantity: item?.quantity || 1,
    },
  });

  // Determine item type from existing item
  useEffect(() => {
    if (item) {
      if (item.productId) {
        setItemType('product');
      } else if (item.collectionId) {
        setItemType('collection');
      }
    }
  }, [item]);

  // Load products
  const loadProducts = async (search = '') => {
    setLoadingProducts(true);
    try {
      const result = await getProductsForSelect(search);
      if (result.success && result.data) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Load collections
  const loadCollections = async (search = '') => {
    setLoadingCollections(true);
    try {
      const result = await getCollectionsForSelect(search);
      if (result.success && result.data) {
        setCollections(result.data);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoadingCollections(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (opened) {
      loadProducts();
      loadCollections();
    }
  }, [opened]);

  // Debounced search effects
  useEffect(() => {
    if (debouncedProductSearch !== undefined) {
      loadProducts(debouncedProductSearch);
    }
  }, [debouncedProductSearch]);

  useEffect(() => {
    if (debouncedCollectionSearch !== undefined) {
      loadCollections(debouncedCollectionSearch);
    }
  }, [debouncedCollectionSearch]);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const data = {
        collectionId: itemType === 'collection' ? values.collectionId || undefined : undefined,
        notes: values.notes || undefined,
        priority: values.priority,
        productId: itemType === 'product' ? values.productId || undefined : undefined,
        quantity: values.quantity,
        registryId: registry.id,
      };

      const result = item ? await updateRegistryItem(item.id, data) : await addRegistryItem(data);

      if (result.success) {
        showSuccessNotification(
          item ? 'Registry item updated successfully' : 'Item added to registry successfully',
        );
        onSubmit?.();
        onClose();
        form.reset();
      } else {
        showErrorNotification(result.error || 'Failed to save registry item');
      }
    } catch (error) {
      showErrorNotification('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === form.values.productId);
  const selectedCollection = collections.find((c) => c.id === form.values.collectionId);

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'red';
    if (priority >= 6) return 'orange';
    if (priority >= 4) return 'yellow';
    if (priority >= 2) return 'blue';
    return 'gray';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 8) return 'Very High';
    if (priority >= 6) return 'High';
    if (priority >= 4) return 'Medium';
    if (priority >= 2) return 'Low';
    return 'Very Low';
  };

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
            leftSection={item ? <IconHeart size={14} /> : <IconShoppingCart size={14} />}
          >
            {item ? 'Edit Item' : 'Add Item'}
          </Badge>
          <Text fw={600}>{registry.title}</Text>
        </Group>
      }
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          {/* Item Type Selection */}
          <Card withBorder p="md" radius="md">
            <Title order={5} mb="md">
              Item Type
            </Title>
            <Group gap="md">
              <Button
                leftSection={<IconPackage size={16} />}
                onClick={() => {
                  setItemType('product');
                  form.setFieldValue('collectionId', '');
                }}
                disabled={!!item}
                variant={itemType === 'product' ? 'filled' : 'light'}
              >
                Product
              </Button>
              <Button
                leftSection={<IconGift size={16} />}
                onClick={() => {
                  setItemType('collection');
                  form.setFieldValue('productId', '');
                }}
                disabled={!!item}
                variant={itemType === 'collection' ? 'filled' : 'light'}
              >
                Collection
              </Button>
            </Group>
          </Card>

          {/* Product/Collection Selection */}
          {itemType === 'product' ? (
            <Card withBorder p="md" radius="md">
              <Title order={5} mb="md">
                Select Product
              </Title>
              <Stack gap="md">
                <TextInput
                  leftSection={<IconSearch size={16} />}
                  onChange={(e) => setProductSearch(e.currentTarget.value)}
                  placeholder="Search products..."
                  value={productSearch}
                />

                <Select
                  placeholder="Choose a product"
                  clearable
                  data={products.map((product) => ({
                    label: `${product.name} (${product.sku})${product.price ? ` - ${formatCurrency(product.price)}` : ''}`,
                    value: product.id,
                  }))}
                  searchable
                  {...form.getInputProps('productId')}
                />

                {selectedProduct && (
                  <Card withBorder bg="blue.0" p="sm" radius="md">
                    <Group>
                      <Avatar radius="md" size="md">
                        <IconPackage size={20} />
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <Text fw={500} size="sm">
                          {selectedProduct.name}
                        </Text>
                        <Text c="dimmed" size="xs">
                          SKU: {selectedProduct.sku}
                        </Text>
                        {selectedProduct.price && (
                          <Badge color="green" size="xs">
                            {formatCurrency(selectedProduct.price)}
                          </Badge>
                        )}
                      </div>
                    </Group>
                    {selectedProduct.description && (
                      <Text c="dimmed" mt="xs" size="xs">
                        {selectedProduct.description.length > 100
                          ? `${selectedProduct.description.substring(0, 100)}...`
                          : selectedProduct.description}
                      </Text>
                    )}
                  </Card>
                )}
              </Stack>
            </Card>
          ) : (
            <Card withBorder p="md" radius="md">
              <Title order={5} mb="md">
                Select Collection
              </Title>
              <Stack gap="md">
                <TextInput
                  leftSection={<IconSearch size={16} />}
                  onChange={(e) => setCollectionSearch(e.currentTarget.value)}
                  placeholder="Search collections..."
                  value={collectionSearch}
                />

                <Select
                  placeholder="Choose a collection"
                  clearable
                  data={collections.map((collection) => ({
                    label: `${collection.name} (${collection._count.products} products)`,
                    value: collection.id,
                  }))}
                  searchable
                  {...form.getInputProps('collectionId')}
                />

                {selectedCollection && (
                  <Card withBorder bg="orange.0" p="sm" radius="md">
                    <Group>
                      <Avatar radius="md" size="md">
                        <IconGift size={20} />
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <Text fw={500} size="sm">
                          {selectedCollection.name}
                        </Text>
                        <Group gap="xs">
                          <Badge color="orange" size="xs">
                            {selectedCollection.type}
                          </Badge>
                          <Badge color="blue" size="xs">
                            {selectedCollection._count.products} products
                          </Badge>
                        </Group>
                      </div>
                    </Group>
                  </Card>
                )}
              </Stack>
            </Card>
          )}

          {/* Item Details */}
          <Card withBorder p="md" radius="md">
            <Title order={5} mb="md">
              Item Details
            </Title>
            <Stack gap="md">
              <NumberInput
                description="How many items are needed"
                label="Quantity"
                max={999}
                min={1}
                {...form.getInputProps('quantity')}
              />

              <div>
                <Text fw={500} mb="xs" size="sm">
                  Priority ({form.values.priority}/10)
                </Text>
                <Text c="dimmed" mb="md" size="xs">
                  Set the importance level for this item
                </Text>
                <Slider
                  color={getPriorityColor(form.values.priority)}
                  marks={[
                    { label: '0', value: 0 },
                    { label: '2', value: 2 },
                    { label: '4', value: 4 },
                    { label: '6', value: 6 },
                    { label: '8', value: 8 },
                    { label: '10', value: 10 },
                  ]}
                  max={10}
                  min={0}
                  step={1}
                  {...form.getInputProps('priority')}
                />
                <Group justify="space-between" mt="xs">
                  <Badge
                    color={getPriorityColor(form.values.priority)}
                    leftSection={<IconStar size={12} />}
                    size="sm"
                  >
                    {getPriorityLabel(form.values.priority)}
                  </Badge>
                  <Text c="dimmed" size="xs">
                    Priority: {form.values.priority}
                  </Text>
                </Group>
              </div>

              <Textarea
                description="Add any special notes or preferences"
                maxRows={6}
                minRows={3}
                placeholder="Optional notes about this item..."
                label="Notes"
                {...form.getInputProps('notes')}
              />
            </Stack>
          </Card>

          {/* Summary */}
          {(selectedProduct || selectedCollection) && (
            <Card withBorder bg="gray.0" p="md" radius="md">
              <Title order={5} mb="md">
                Summary
              </Title>
              <Group justify="space-between">
                <div>
                  <Text fw={500} size="sm">
                    {selectedProduct?.name || selectedCollection?.name}
                  </Text>
                  <Text c="dimmed" size="xs">
                    {itemType === 'product' ? 'Product' : 'Collection'}
                  </Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text fw={500} size="sm">
                    Qty: {form.values.quantity}
                  </Text>
                  <Badge color={getPriorityColor(form.values.priority)} size="xs">
                    Priority: {form.values.priority}
                  </Badge>
                </div>
              </Group>
              {selectedProduct?.price && (
                <Group justify="space-between" mt="xs">
                  <Text c="dimmed" size="xs">
                    Total Value:
                  </Text>
                  <Text c="green" fw={600} size="sm">
                    {formatCurrency(selectedProduct.price * form.values.quantity)}
                  </Text>
                </Group>
              )}
            </Card>
          )}

          {/* Actions */}
          <Group justify="flex-end">
            <Button onClick={onClose} variant="light">
              Cancel
            </Button>
            <Button
              loading={loading}
              disabled={itemType === 'product' ? !form.values.productId : !form.values.collectionId}
              type="submit"
            >
              {item ? 'Update Item' : 'Add Item'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
