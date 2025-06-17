'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  CopyButton,
  Divider,
  Group,
  Image,
  NumberInput,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDebouncedCallback, useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconBarcode,
  IconBox,
  IconBuilding,
  IconCheck,
  IconCopy,
  IconCurrency,
  IconEdit,
  IconExternalLink,
  IconGift,
  IconHistory,
  IconPalette,
  IconPhoto,
  IconRocket,
  IconDeviceFloppy,
  IconShoppingCart,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { InventoryManagement } from '../../components/InventoryManagement';
import { MediaManagement } from '../../components/MediaManagement';
import { PDPManagement } from '../../components/PDPManagement';
import { PriceHistory } from '../../components/PriceHistory';
import { ProductBundling } from '../../components/ProductBundling';
import { ProductLifecycle } from '../../components/ProductLifecycle';
import { ProductVariants } from '../../components/ProductVariants';
import { SupplierProcurement } from '../../components/SupplierProcurement';
import { createProduct, updateProduct } from '../../actions';

import type {
  PdpJoin,
  Product,
  ProductAsset,
  ProductBarcode,
  ScanHistory,
} from '@repo/database/prisma';

interface ExtendedProduct extends Product {
  _count: {
    scanHistory: number;
    soldBy: number;
  };
  barcodes: ProductBarcode[];
  digitalAssets: ProductAsset[];
  scanHistory: (ScanHistory & {
    user: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  })[];
  soldBy: (PdpJoin & {
    brand: {
      id: string;
      name: string;
      type: string;
      baseUrl: string | null;
      slug: string;
      status: string;
    };
  })[];
}

interface ProductDetailClientProps {
  product: ExtendedProduct | null;
  isCreating?: boolean;
}

export function ProductDetailClient({ product, isCreating = false }: ProductDetailClientProps) {
  const [pdpModalOpened, { open: openPdpModal, close: closePdpModal }] = useDisclosure(false);
  const [mediaModalOpened, { open: openMediaModal, close: closeMediaModal }] = useDisclosure(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Initialize form with product data
  const form = useForm({
    validate: {
      name: (value) => (!value ? 'Product name is required' : null),
      category: (value) => (!value ? 'Category is required' : null),
      description: (value) => {
        if (value && value.length > 5000) return 'Description is too long (max 5000 characters)';
        return null;
      },
      price: (value) => {
        if (value && value <= 0) return 'Price must be greater than 0';
        if (value && value > 999999) return 'Price seems too high';
        return null;
      },
      sku: (value) => {
        if (!value) return 'SKU is required';
        if (!/^[A-Z0-9-]+$/.test(value))
          return 'SKU must contain only uppercase letters, numbers, and hyphens';
        return null;
      },
    },
    validateInputOnBlur: true,
    validateInputOnChange: true,
    initialValues: {
      // Basic product info
      name: product?.name || '',
      type: product?.type || 'PHYSICAL',
      attributes: product?.attributes || {},
      brand: product?.brand || '',
      category: product?.category || '',
      currency: product?.currency || 'USD',
      description: product?.description || '',
      price: product?.price || 0,
      sku: product?.sku || '',
      status: product?.status || 'DRAFT',

      // Empty state for other components - they will manage their own data
      inventory: {
        adjustmentForm: {
          type: 'adjustment',
          locationId: '',
          quantity: 0,
          reason: '',
        },
        locations: [],
        movements: [],
      },

      variants: [],

      purchaseOrderForm: {
        notes: '',
        quantity: 0,
        shippingMethod: '',
        supplierId: '',
      },
      purchaseOrders: [],
      suppliers: [],

      priceHistory: [],
      priceUpdateForm: {
        changeType: 'regular',
        effectiveDate: new Date(),
        newPrice: 0,
        reason: '',
      },
      promotionalForm: {
        name: '',
        type: 'percentage',
        couponCode: '',
        discountAmount: 0,
        discountPercentage: 0,
        endDate: null,
        startDate: null,
      },
      promotions: [],

      bundleForm: {
        name: '',
        type: 'fixed',
        description: '',
        discount: 0,
        productIds: [],
      },
      bundles: [],
      recommendations: [],

      analytics: {
        metrics: {
          averageOrderValue: 0,
          conversionRate: 0,
          customerSatisfaction: 0,
          returnRate: 0,
          revenue: 0,
          reviewRating: 0,
          sales: 0,
          views: 0,
        },
        timeframe: 'monthly',
        trends: {
          inventoryStatus: 'healthy',
          priceOptimization: 'optimal',
          salesTrend: 'stable',
        },
      },
      compliance: [],
      lifecycleStages: [],
      qualityChecks: [],
    },
  });

  // Handle save for both create and update
  const handleSave = async () => {
    const validation = form.validate();
    if (validation.hasErrors) {
      return;
    }

    setIsSaving(true);
    try {
      if (isCreating) {
        // Create new product
        const result = await createProduct({
          name: form.values.name,
          type: form.values.type,
          attributes: form.values.attributes,
          brand: form.values.brand,
          category: form.values.category,
          currency: form.values.currency,
          description: form.values.description,
          price: form.values.price,
          sku: form.values.sku,
          status: form.values.status,
        });

        if (result.success && result.data) {
          notifications.show({
            color: 'green',
            message: 'Product created successfully',
            title: 'Success',
          });
          // Navigate to the newly created product
          router.push(`/pim3/products/${result.data.id}`);
        } else {
          notifications.show({
            color: 'red',
            message: result.error || 'Failed to create product',
            title: 'Error',
          });
        }
      } else if (product) {
        // Update existing product
        const result = await updateProduct(product.id, {
          name: form.values.name,
          type: form.values.type,
          attributes: form.values.attributes,
          brand: form.values.brand,
          category: form.values.category,
          currency: form.values.currency,
          description: form.values.description,
          price: form.values.price,
          sku: form.values.sku,
          status: form.values.status,
        });

        if (result.success) {
          notifications.show({
            color: 'green',
            message: 'Product updated successfully',
            title: 'Success',
          });
          form.resetDirty();
        } else {
          notifications.show({
            color: 'red',
            message: result.error || 'Failed to update product',
            title: 'Error',
          });
        }
      }
    } catch (error) {
      notifications.show({
        color: 'red',
        message: 'An unexpected error occurred',
        title: 'Error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save functionality with debounce (only for existing products)
  const autoSave = useDebouncedCallback(async (values) => {
    try {
      if (isCreating || !product) {
        // For new products, we'll need manual save instead of auto-save
        return;
      }

      const result = await updateProduct(product.id, {
        name: values.name,
        type: values.type,
        attributes: values.attributes,
        brand: values.brand,
        category: values.category,
        currency: values.currency,
        description: values.description,
        price: values.price,
        sku: values.sku,
        status: values.status,
      });

      if (result.success) {
        notifications.show({
          autoClose: 2000,
          color: 'green',
          message: 'Changes saved',
        });
      } else {
        notifications.show({
          color: 'red',
          message: result.error || 'Failed to save changes',
        });
      }
    } catch (error) {
      notifications.show({
        color: 'red',
        message: 'Failed to save changes',
      });
    }
  }, 1000);

  // Auto-save on form changes
  useEffect(() => {
    if (form.isDirty()) {
      autoSave(form.values);
    }
  }, [form.values]);

  const formatCurrency = (price?: number | null, currency?: string | null) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      currency: currency || 'USD',
      style: 'currency',
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'DRAFT':
        return 'blue';
      case 'ARCHIVED':
        return 'gray';
      case 'DISCONTINUED':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Check if any form section has errors
  const getSectionErrors = (fields: string[]) => {
    return fields.some((field) => form.errors[field]);
  };

  const basicInfoErrors = getSectionErrors(['name', 'sku', 'category', 'brand', 'price']);
  const hasAnyErrors = Object.keys(form.errors).length > 0;

  return (
    <div>
      <ScrollArea h="100vh">
        <Stack p="md">
          {/* Header */}
          <Group justify="space-between">
            <div>
              <Group gap="sm">
                <Text fw={700} size="xl">
                  {isCreating ? 'Create New Product' : product?.name}
                </Text>
                {!isCreating && product && (
                  <Badge color={getStatusColor(product.status)} variant="light">
                    {product.status}
                  </Badge>
                )}
                {!isCreating && product?.aiGenerated && (
                  <Badge color="violet" variant="light">
                    AI Generated{' '}
                    {product.aiConfidence ? `(${(product.aiConfidence * 100).toFixed(1)}%)` : ''}
                  </Badge>
                )}
                {form.isDirty() && (
                  <Badge color="yellow" variant="light">
                    {isCreating ? 'Unsaved new product' : 'Unsaved changes'}
                  </Badge>
                )}
                {hasAnyErrors && (
                  <Badge color="red" variant="light">
                    Validation errors
                  </Badge>
                )}
              </Group>
              <Text c="dimmed" size="sm">
                {isCreating
                  ? `SKU: ${form.values.sku || 'Enter SKU'}`
                  : `Product ID: ${product?.id} • SKU: ${form.values.sku || product?.sku}`}
              </Text>
            </div>

            <Group gap="sm">
              <Button onClick={() => form.reset()} disabled={!form.isDirty()} variant="outline">
                Reset
              </Button>
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={handleSave}
                disabled={hasAnyErrors}
                loading={isSaving}
              >
                {isCreating ? 'Create Product' : 'Save Changes'}
              </Button>
            </Group>
          </Group>

          {/* Basic Information */}
          <Card withBorder>
            <Stack>
              <Group justify="space-between">
                <Text fw={600} size="lg">
                  Basic Information
                </Text>
              </Group>

              <SimpleGrid cols={2} spacing="md">
                <TextInput
                  {...form.getInputProps('sku')}
                  description="Stock Keeping Unit"
                  placeholder="PROD-001"
                  rightSection={
                    <CopyButton value={form.values.sku}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? 'Copied' : 'Copy SKU'}>
                          <ActionIcon
                            color={copied ? 'teal' : 'gray'}
                            onClick={copy}
                            size="sm"
                            variant="subtle"
                          >
                            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  }
                  styles={{
                    input: {
                      textTransform: 'uppercase',
                    },
                  }}
                  label="SKU"
                  withAsterisk
                />

                <Select
                  {...form.getInputProps('category')}
                  description="Product category"
                  placeholder="Select category"
                  data={[
                    { label: 'Electronics', value: 'Electronics' },
                    { label: 'Clothing', value: 'Clothing' },
                    { label: 'Home & Garden', value: 'Home & Garden' },
                    { label: 'Sports', value: 'Sports' },
                    { label: 'Books', value: 'Books' },
                  ]}
                  label="Category"
                  searchable
                  withAsterisk
                />

                <TextInput
                  {...form.getInputProps('brand')}
                  description="Product brand or manufacturer"
                  placeholder="Enter brand name"
                  label="Brand"
                />

                <NumberInput
                  {...form.getInputProps('price')}
                  prefix="$"
                  description="Product price"
                  placeholder="0.00"
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                  label="Price"
                  max={999999}
                  min={0}
                  withAsterisk
                />

                <Select
                  {...form.getInputProps('status')}
                  description="Product status"
                  data={[
                    { label: 'Active', value: 'ACTIVE' },
                    { label: 'Draft', value: 'DRAFT' },
                    { label: 'Archived', value: 'ARCHIVED' },
                    { label: 'Discontinued', value: 'DISCONTINUED' },
                  ]}
                  label="Status"
                  withAsterisk
                />

                <Select
                  {...form.getInputProps('type')}
                  description="Physical or digital product"
                  data={[
                    { label: 'Physical', value: 'PHYSICAL' },
                    { label: 'Digital', value: 'DIGITAL' },
                    { label: 'Variant', value: 'VARIANT' },
                    { label: 'Service', value: 'SERVICE' },
                  ]}
                  label="Product Type"
                  withAsterisk
                />
              </SimpleGrid>

              <Divider />

              <Textarea
                {...form.getInputProps('description')}
                autosize
                description={`${form.values.description.length}/5000 characters`}
                maxRows={8}
                minRows={3}
                placeholder="Enter product description"
                rows={4}
                label="Description"
              />

              {!isCreating && product?.attributes && Object.keys(product.attributes).length > 0 && (
                <>
                  <Divider />
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text fw={500}>Attributes</Text>
                      <Text c="dimmed" size="sm">
                        JSON format
                      </Text>
                    </Group>
                    <Textarea
                      error={(() => {
                        try {
                          JSON.parse(JSON.stringify(form.values.attributes));
                          return null;
                        } catch {
                          return 'Invalid JSON format';
                        }
                      })()}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          form.setFieldValue('attributes', parsed);
                        } catch {
                          // Invalid JSON, don't update
                        }
                      }}
                      rows={6}
                      styles={{
                        input: {
                          fontSize: '0.875rem',
                          fontFamily: 'monospace',
                        },
                      }}
                      value={JSON.stringify(form.values.attributes, null, 2)}
                    />
                  </div>
                </>
              )}

              {!isCreating && product && (
                <Group justify="space-between" mt="md">
                  <div>
                    <Text c="dimmed" size="sm">
                      Created
                    </Text>
                    <Text fw={500}>{formatDate(product.createdAt)}</Text>
                  </div>
                  <div>
                    <Text c="dimmed" size="sm">
                      Updated
                    </Text>
                    <Text fw={500}>{formatDate(product.updatedAt)}</Text>
                  </div>
                  {form.isDirty() && (
                    <div>
                      <Text c="dimmed" size="sm">
                        Auto-save
                      </Text>
                      <Text c="green" fw={500} size="sm">
                        Enabled
                      </Text>
                    </div>
                  )}
                </Group>
              )}
            </Stack>
          </Card>

          {/* Advanced Features Tabs - Only show for existing products */}
          {!isCreating && product && (
            <Tabs defaultValue="pdps">
              <Tabs.List>
                <Tabs.Tab
                  leftSection={<IconShoppingCart size={16} />}
                  rightSection={
                    <Badge circle size="xs">
                      {product._count.soldBy}
                    </Badge>
                  }
                  value="pdps"
                >
                  PDPs/Sellers
                </Tabs.Tab>
                <Tabs.Tab leftSection={<IconBox size={16} />} value="inventory">
                  Inventory
                </Tabs.Tab>
                <Tabs.Tab leftSection={<IconPalette size={16} />} value="variants">
                  Variants
                </Tabs.Tab>
                <Tabs.Tab leftSection={<IconBuilding size={16} />} value="suppliers">
                  Suppliers
                </Tabs.Tab>
                <Tabs.Tab leftSection={<IconCurrency size={16} />} value="pricing">
                  Pricing & History
                </Tabs.Tab>
                <Tabs.Tab leftSection={<IconGift size={16} />} value="bundling">
                  Bundles & Recommendations
                </Tabs.Tab>
                <Tabs.Tab leftSection={<IconRocket size={16} />} value="lifecycle">
                  Lifecycle & Advanced
                </Tabs.Tab>
                <Tabs.Tab
                  leftSection={<IconPhoto size={16} />}
                  rightSection={
                    product.digitalAssets.length > 0 && (
                      <Badge circle size="xs">
                        {product.digitalAssets.length}
                      </Badge>
                    )
                  }
                  value="assets"
                >
                  Assets
                </Tabs.Tab>
                <Tabs.Tab
                  leftSection={<IconBarcode size={16} />}
                  rightSection={
                    product.barcodes.length > 0 && (
                      <Badge circle size="xs">
                        {product.barcodes.length}
                      </Badge>
                    )
                  }
                  value="barcodes"
                >
                  Barcodes
                </Tabs.Tab>
                <Tabs.Tab
                  leftSection={<IconHistory size={16} />}
                  rightSection={
                    <Badge circle size="xs">
                      {product._count.scanHistory}
                    </Badge>
                  }
                  value="history"
                >
                  Scan History
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel pt="md" value="pdps">
                <Group justify="space-between" mb="md">
                  <Text fw={500}>Product Detail Pages (PDPs)</Text>
                  <Button
                    leftSection={<IconEdit size={16} />}
                    onClick={openPdpModal}
                    size="sm"
                    variant="outline"
                  >
                    Manage Sellers
                  </Button>
                </Group>

                {product.soldBy.length > 0 ? (
                  <Stack>
                    {product.soldBy.map((pdp) => (
                      <Card key={pdp.id} withBorder>
                        <Group justify="space-between">
                          <div>
                            <Group gap="sm">
                              <Text fw={600}>{pdp.brand.name}</Text>
                              <Badge size="sm" variant="light">
                                {pdp.brand.type}
                              </Badge>
                              <Badge
                                color={pdp.brand.status === 'PUBLISHED' ? 'green' : 'yellow'}
                                size="sm"
                                variant="outline"
                              >
                                {pdp.brand.status}
                              </Badge>
                            </Group>

                            <Text c="dimmed" size="sm">
                              Added {formatDate(pdp.createdAt)}
                            </Text>

                            <Group gap="xs" mt="xs">
                              {pdp.brand.baseUrl && (
                                <>
                                  <Text c="dimmed" size="xs">
                                    Store:
                                  </Text>
                                  <ActionIcon
                                    href={pdp.brand.baseUrl}
                                    component="a"
                                    rel="noopener noreferrer"
                                    size="xs"
                                    target="_blank"
                                    title="Visit store"
                                    variant="subtle"
                                  >
                                    <IconExternalLink size={12} />
                                  </ActionIcon>
                                </>
                              )}
                            </Group>
                          </div>
                          <Group gap="xs">
                            <Text c="dimmed" size="xs">
                              PDP ID: {pdp.id.slice(-8)}
                            </Text>
                            <CopyButton value={pdp.id}>
                              {({ copied, copy }) => (
                                <Tooltip label={copied ? 'Copied' : 'Copy PDP ID'}>
                                  <ActionIcon
                                    color={copied ? 'teal' : 'gray'}
                                    onClick={copy}
                                    size="xs"
                                    variant="subtle"
                                  >
                                    {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                                  </ActionIcon>
                                </Tooltip>
                              )}
                            </CopyButton>
                          </Group>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Stack align="center" py="xl">
                    <Text c="dimmed" ta="center">
                      No sellers/PDPs configured for this product
                    </Text>
                    <Button
                      leftSection={<IconEdit size={16} />}
                      onClick={openPdpModal}
                      variant="light"
                    >
                      Add Sellers
                    </Button>
                  </Stack>
                )}
              </Tabs.Panel>

              <Tabs.Panel pt="md" value="inventory">
                <InventoryManagement
                  onUpdate={() => {}}
                  productId={product.id}
                  productName={product.name}
                />
              </Tabs.Panel>

              <Tabs.Panel pt="md" value="variants">
                <ProductVariants
                  onUpdate={() => {}}
                  productId={product.id}
                  productName={product.name}
                />
              </Tabs.Panel>

              <Tabs.Panel pt="md" value="suppliers">
                <SupplierProcurement
                  onUpdate={() => {}}
                  productId={product.id}
                  productName={product.name}
                />
              </Tabs.Panel>

              <Tabs.Panel pt="md" value="pricing">
                <PriceHistory
                  onUpdate={() => {}}
                  productId={product.id}
                  productName={product.name}
                  currentPrice={product.price || 0}
                />
              </Tabs.Panel>

              <Tabs.Panel pt="md" value="bundling">
                <ProductBundling
                  form={form}
                  onUpdate={() => {}}
                  productId={product.id}
                  productName={product.name}
                />
              </Tabs.Panel>

              <Tabs.Panel pt="md" value="lifecycle">
                <ProductLifecycle
                  onUpdate={() => {}}
                  productId={product.id}
                  productName={product.name}
                />
              </Tabs.Panel>

              <Tabs.Panel pt="md" value="assets">
                <Group justify="space-between" mb="md">
                  <Text fw={500}>Digital Assets</Text>
                  <Button
                    leftSection={<IconEdit size={16} />}
                    onClick={openMediaModal}
                    size="sm"
                    variant="outline"
                  >
                    Manage Media
                  </Button>
                </Group>

                {product.digitalAssets.length > 0 ? (
                  <SimpleGrid cols={2} spacing="md">
                    {product.digitalAssets
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((asset) => (
                        <Card key={asset.id} withBorder>
                          <Stack>
                            {asset.type === 'IMAGE' && (
                              <Image
                                alt={asset.alt || asset.filename}
                                fit="cover"
                                h={120}
                                radius="sm"
                                src={asset.url}
                              />
                            )}
                            <div>
                              <Text fw={500} size="sm">
                                {asset.filename}
                              </Text>
                              <Badge size="xs" variant="light">
                                {asset.type}
                              </Badge>
                              {asset.description && (
                                <Text c="dimmed" mt="xs" size="xs">
                                  {asset.description}
                                </Text>
                              )}
                            </div>
                          </Stack>
                        </Card>
                      ))}
                  </SimpleGrid>
                ) : (
                  <Stack align="center" py="xl">
                    <Text c="dimmed" ta="center">
                      No assets found
                    </Text>
                    <Button
                      leftSection={<IconEdit size={16} />}
                      onClick={openMediaModal}
                      variant="light"
                    >
                      Add Media Assets
                    </Button>
                  </Stack>
                )}
              </Tabs.Panel>

              <Tabs.Panel pt="md" value="barcodes">
                {product.barcodes.length > 0 ? (
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Barcode</Table.Th>
                        <Table.Th>Type</Table.Th>
                        <Table.Th>Primary</Table.Th>
                        <Table.Th>Created</Table.Th>
                        <Table.Th>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {product.barcodes.map((barcode) => (
                        <Table.Tr key={barcode.id}>
                          <Table.Td>
                            <Group gap="xs">
                              <Text ff="monospace">{barcode.barcode}</Text>
                              <CopyButton value={barcode.barcode}>
                                {({ copied, copy }) => (
                                  <Tooltip label={copied ? 'Copied' : 'Copy barcode'}>
                                    <ActionIcon
                                      color={copied ? 'teal' : 'gray'}
                                      onClick={copy}
                                      size="xs"
                                      variant="subtle"
                                    >
                                      {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                                    </ActionIcon>
                                  </Tooltip>
                                )}
                              </CopyButton>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Badge size="sm" variant="light">
                              {barcode.type}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            {barcode.isPrimary && (
                              <Badge color="blue" size="sm">
                                Primary
                              </Badge>
                            )}
                          </Table.Td>
                          <Table.Td>{formatDate(barcode.createdAt)}</Table.Td>
                          <Table.Td>
                            <CopyButton value={barcode.barcode}>
                              {({ copied, copy }) => (
                                <ActionIcon onClick={copy} size="sm" variant="light">
                                  {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                </ActionIcon>
                              )}
                            </CopyButton>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                ) : (
                  <Text c="dimmed" py="xl" ta="center">
                    No barcodes found
                  </Text>
                )}
              </Tabs.Panel>

              <Tabs.Panel pt="md" value="history">
                {product.scanHistory && product.scanHistory.length > 0 ? (
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Barcode</Table.Th>
                        <Table.Th>User</Table.Th>
                        <Table.Th>Platform</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Scanned At</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {product.scanHistory.slice(0, 10).map((scan) => (
                        <Table.Tr key={scan.id}>
                          <Table.Td>
                            <Text ff="monospace" size="sm">
                              {scan.barcode}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            {scan.user ? (
                              <div>
                                <Text size="sm">{scan.user.name}</Text>
                                <Text c="dimmed" size="xs">
                                  {scan.user.email}
                                </Text>
                              </div>
                            ) : (
                              <Text c="dimmed" size="sm">
                                Anonymous
                              </Text>
                            )}
                          </Table.Td>
                          <Table.Td>
                            {scan.platform && (
                              <Badge size="sm" variant="light">
                                {scan.platform}
                              </Badge>
                            )}
                          </Table.Td>
                          <Table.Td>
                            <Badge color={scan.success ? 'green' : 'red'} size="sm" variant="light">
                              {scan.success ? 'Success' : 'Failed'}
                            </Badge>
                          </Table.Td>
                          <Table.Td>{formatDate(scan.scannedAt)}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                ) : (
                  <Text c="dimmed" py="xl" ta="center">
                    No scan history found
                  </Text>
                )}
              </Tabs.Panel>
            </Tabs>
          )}
        </Stack>

        {/* Modals for advanced features */}
        <PDPManagement
          onClose={closePdpModal}
          onUpdate={() => {}}
          opened={pdpModalOpened}
          productId={product?.id || ''}
          productName={product?.name || ''}
        />

        <MediaManagement
          onClose={closeMediaModal}
          onUpdate={() => {}}
          opened={mediaModalOpened}
          productId={product?.id || ''}
          productName={product?.name || ''}
        />
      </ScrollArea>
    </div>
  );
}
