'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Checkbox,
  Group,
  Loader,
  Menu,
  Pagination,
  rem,
  ScrollArea,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import {
  IconArchive,
  IconDots,
  IconEdit,
  IconEye,
  IconPlus,
  IconRefresh,
  IconRobot,
  IconSearch,
  IconTrash,
  IconTrashOff,
} from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';

import {
  bulkDeleteProducts,
  bulkRestoreProducts,
  bulkSoftDeleteProducts,
  bulkUpdateAIGenerated,
  bulkUpdateProductStatus,
  deleteProduct,
  getProductsWithPIMFilters,
  restoreProduct,
  softDeleteProduct,
} from '../actions';
import {
  formatCurrency,
  getStatusColor,
  showDeleteConfirmModal,
  showErrorNotification,
  showSuccessNotification,
  sortTableData,
} from '../utils/pim-helpers';
import {
  getSelectAllCheckboxProps,
  setSorting,
  Th,
  toggleAllRows,
  toggleRowSelection,
  useTableForm,
} from '../utils/table-helpers';

import { ProductDetailsDrawer } from './ProductDetailsDrawer';
import { ProductFormModal } from './ProductForm';

import type { Product, ProductStatus, ProductType, User } from '@repo/database/prisma';

interface ProductWithRelations extends Product {
  _count: {
    scanHistory: number;
    soldBy: number;
    children: number;
  };
  barcodes: { id: string; barcode: string; type: string; isPrimary: boolean }[];
  children: Product[];
  // Soft delete tracking
  deletedBy: User | null;
  digitalAssets: { id: string; url: string; type: string }[];
  // Additional metadata we might want to display
  media?: { id: string; url: string; type: string; altText: string | null }[];
  // Parent/child relationships
  parent: Product | null;
  soldBy: {
    id: string;
    brand: {
      id: string;
      name: string;
      slug: string;
      type: string;
      baseUrl: string | null;
      status: string;
    };
  }[];
}

interface ProductTableFilters {
  aiGeneratedFilter: 'all' | 'ai-only' | 'human-only';
  categoryFilter: string;
  page: number;
  parentFilter: 'all' | 'parent-only' | 'child-only' | 'standalone';
  reverseSortDirection: boolean;
  search: string;
  selectedRows: string[];
  // New enhanced filters
  showDeleted: boolean;
  sortBy: string | null;
  statusFilter: ProductStatus | '';
  typeFilter: ProductType | '';
}

/**
 * ProductsTable component for managing product inventory
 * Provides search, filtering, sorting, and bulk operations on products
 */
export function ProductsTable() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [productModalOpened, { open: openProductModal, close: closeProductModal }] = useDisclosure(false);
  const [detailsModalOpened, { open: openDetailsModal, close: closeDetailsModal }] = useDisclosure(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);
  const [viewingProduct, setViewingProduct] = useState<ProductWithRelations | null>(null);
  const router = useRouter();

  // Consolidate all filter and table state into a single form
  const form = useTableForm<ProductTableFilters>({
    typeFilter: '',
    aiGeneratedFilter: 'all',
    categoryFilter: '',
    parentFilter: 'all',
    showDeleted: false,
    statusFilter: '',
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getProductsWithPIMFilters({
        typeFilter: form.values.typeFilter || undefined,
        aiGeneratedFilter: form.values.aiGeneratedFilter,
        category: form.values.categoryFilter || undefined,
        limit: 10,
        page: form.values.page,
        parentFilter: form.values.parentFilter,
        search: form.values.search,
        showDeleted: form.values.showDeleted,
        status: (form.values.statusFilter as ProductStatus) || undefined,
      });

      if (result.success && result.data) {
        setProducts(result.data);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
        }
      } else {
        showErrorNotification(result.error || 'Failed to load products');
      }
    } catch (error) {
      showErrorNotification('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [
    form.values.search,
    form.values.statusFilter,
    form.values.categoryFilter,
    form.values.page,
    form.values.showDeleted,
    form.values.aiGeneratedFilter,
    form.values.typeFilter,
    form.values.parentFilter,
  ]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async (id: string) => {
    showDeleteConfirmModal('product', async () => {
      const result = await deleteProduct(id);
      if (result.success) {
        showSuccessNotification('Product deleted successfully');
        loadProducts();
      } else {
        showErrorNotification(result.error || 'Failed to delete product');
      }
    });
  };

  const handleBulkStatusUpdate = async (status: ProductStatus) => {
    if (form.values.selectedRows.length === 0) return;

    const result = await bulkUpdateProductStatus(form.values.selectedRows, status);
    if (result.success) {
      showSuccessNotification(`Updated ${form.values.selectedRows.length} products`);
      form.setFieldValue('selectedRows', []);
      loadProducts();
    } else {
      showErrorNotification(result.error || 'Failed to update products');
    }
  };

  const handleBulkDelete = async () => {
    if (form.values.selectedRows.length === 0) return;

    showDeleteConfirmModal(`${form.values.selectedRows.length} products`, async () => {
      const result = await bulkDeleteProducts(form.values.selectedRows);
      if (result.success) {
        showSuccessNotification(`Deleted ${form.values.selectedRows.length} products`);
        form.setFieldValue('selectedRows', []);
        loadProducts();
      } else {
        showErrorNotification(result.error || 'Failed to delete products');
      }
    });
  };

  const handleBulkSoftDelete = async () => {
    if (form.values.selectedRows.length === 0) return;

    showDeleteConfirmModal(
      `${form.values.selectedRows.length} products (soft delete)`,
      async () => {
        const result = await bulkSoftDeleteProducts(form.values.selectedRows);
        if (result.success) {
          showSuccessNotification(`Soft deleted ${form.values.selectedRows.length} products`);
          form.setFieldValue('selectedRows', []);
          loadProducts();
        } else {
          showErrorNotification(result.error || 'Failed to soft delete products');
        }
      },
    );
  };

  const handleBulkRestore = async () => {
    if (form.values.selectedRows.length === 0) return;

    const result = await bulkRestoreProducts(form.values.selectedRows);
    if (result.success) {
      showSuccessNotification(`Restored ${form.values.selectedRows.length} products`);
      form.setFieldValue('selectedRows', []);
      loadProducts();
    } else {
      showErrorNotification(result.error || 'Failed to restore products');
    }
  };

  const handleBulkUpdateAI = async (aiGenerated: boolean) => {
    if (form.values.selectedRows.length === 0) return;

    const result = await bulkUpdateAIGenerated(form.values.selectedRows, aiGenerated);
    if (result.success) {
      showSuccessNotification(`Updated AI flag for ${form.values.selectedRows.length} products`);
      form.setFieldValue('selectedRows', []);
      loadProducts();
    } else {
      showErrorNotification(result.error || 'Failed to update AI flag');
    }
  };

  const handleRestore = async (id: string) => {
    const result = await restoreProduct(id);
    if (result.success) {
      showSuccessNotification('Product restored successfully');
      loadProducts();
    } else {
      showErrorNotification(result.error || 'Failed to restore product');
    }
  };

  const handleSoftDelete = async (id: string) => {
    showDeleteConfirmModal('product (soft delete)', async () => {
      const result = await softDeleteProduct(id);
      if (result.success) {
        showSuccessNotification('Product soft deleted successfully');
        loadProducts();
      } else {
        showErrorNotification(result.error || 'Failed to soft delete product');
      }
    });
  };

  const sortedData = sortTableData(
    products,
    form.values.sortBy as keyof ProductWithRelations,
    form.values.reverseSortDirection,
  );

  const rows = sortedData.map((product) => {
    const selected = form.values.selectedRows.includes(product.id);
    const isDeleted = !!product.deletedAt;

    return (
      <Table.Tr
        key={product.id}
        opacity={isDeleted ? 0.6 : 1}
        bg={selected ? 'blue.0' : isDeleted ? 'red.0' : undefined}
      >
        <Table.Td>
          <Checkbox
            onChange={(event) => toggleRowSelection(form, product.id, event.currentTarget.checked)}
            checked={selected}
          />
        </Table.Td>
        <Table.Td>
          <Group gap="sm">
            <div>
              <Text fw={500} fz="sm">
                {product.name}
                {isDeleted && (
                  <Badge color="red" ml="xs" size="xs">
                    Deleted
                  </Badge>
                )}
              </Text>
              <Text c="dimmed" fz="xs">
                SKU: {product.sku}
              </Text>
              {product.parent && (
                <Text c="blue" fz="xs">
                  Child of: {product.parent.name}
                </Text>
              )}
              {product._count.children > 0 && (
                <Text c="green" fz="xs">
                  {product._count.children} variants
                </Text>
              )}
            </div>
          </Group>
        </Table.Td>
        <Table.Td>
          <Stack gap={2}>
            <Text size="sm">{product.category}</Text>
            <Badge color="blue" size="xs" variant="light">
              {product.type}
            </Badge>
          </Stack>
        </Table.Td>
        <Table.Td>
          <Badge color={getStatusColor(product.status)} variant="light">
            {product.status}
          </Badge>
        </Table.Td>
        <Table.Td>{product.brand || '-'}</Table.Td>
        <Table.Td>{formatCurrency(product.price, product.currency)}</Table.Td>
        <Table.Td>{product.barcodes.length}</Table.Td>
        <Table.Td>{product.digitalAssets.length}</Table.Td>
        <Table.Td>
          <Group gap="xs">
            <Text fw={500}>{product._count.soldBy}</Text>
            {product.soldBy.length > 0 && (
              <Tooltip
                label={
                  <Stack gap="xs">
                    {product.soldBy.map((pdp) => (
                      <Group key={pdp.id} gap="xs" justify="space-between">
                        <Text size="sm">{pdp.brand.name}</Text>
                        <Group gap="xs">
                          <Text c="green" size="xs">
                            $299.99
                          </Text>
                          <Badge color="green" size="xs" variant="dot">
                            In Stock
                          </Badge>
                        </Group>
                      </Group>
                    ))}
                  </Stack>
                }
                multiline
              >
                <Badge style={{ cursor: 'pointer' }} size="xs" variant="outline">
                  {product.soldBy.length > 2
                    ? `${product.soldBy
                        .slice(0, 2)
                        .map((pdp) => pdp.brand.name)
                        .join(', ')} +${product.soldBy.length - 2}`
                    : product.soldBy.map((pdp) => pdp.brand.name).join(', ')}
                </Badge>
              </Tooltip>
            )}
          </Group>

          {/* Primary seller indicator */}
          {product.soldBy.length > 0 && (
            <Text c="dimmed" mt={2} size="xs">
              Primary: Amazon
            </Text>
          )}
        </Table.Td>
        <Table.Td>
          {product.soldBy.length > 0 ? (
            <Stack gap={2}>
              <Text c="green" fw={500} size="sm">
                $289.99
              </Text>
              <Text c="dimmed" size="xs">
                Walmart
              </Text>
            </Stack>
          ) : (
            <Text c="dimmed" size="sm">
              No prices
            </Text>
          )}
        </Table.Td>
        <Table.Td>{product._count.scanHistory}</Table.Td>
        <Table.Td>
          <Group gap="xs">
            {product.aiGenerated && (
              <Badge color="violet" leftSection={<IconRobot size={12} />} size="xs" variant="light">
                AI Generated
              </Badge>
            )}
            {product.aiSources && product.aiSources.length > 0 && (
              <Tooltip label={`AI Sources: ${product.aiSources.join(', ')}`}>
                <Badge color="gray" size="xs" variant="outline">
                  {product.aiSources.length} sources
                </Badge>
              </Tooltip>
            )}
          </Group>
        </Table.Td>
        <Table.Td>
          {isDeleted && product.deletedBy && (
            <Stack gap={2}>
              <Text c="red" size="xs">
                Deleted by: {product.deletedBy.name}
              </Text>
              <Text c="dimmed" size="xs">
                {new Date(product.deletedAt!).toLocaleDateString()}
              </Text>
            </Stack>
          )}
        </Table.Td>
        <Table.Td>
          <Group gap={0} justify="flex-end">
            <ActionIcon
              color="gray"
              onClick={() => {
                setViewingProduct(product);
                openDetailsModal();
              }}
              variant="subtle"
            >
              <IconEye style={{ width: rem(16), height: rem(16) }} />
            </ActionIcon>
            {!isDeleted && (
              <ActionIcon
                color="gray"
                onClick={() => {
                  router.push(`/pim3/products/${product.id}`);
                }}
                variant="subtle"
              >
                <IconEdit style={{ width: rem(16), height: rem(16) }} />
              </ActionIcon>
            )}
            <Menu position="bottom-end" shadow="sm" withinPortal>
              <Menu.Target>
                <ActionIcon color="gray" variant="subtle">
                  <IconDots style={{ width: rem(16), height: rem(16) }} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                {isDeleted ? (
                  <Menu.Item
                    color="green"
                    leftSection={<IconRefresh style={{ width: rem(14), height: rem(14) }} />}
                    onClick={() => handleRestore(product.id)}
                  >
                    Restore
                  </Menu.Item>
                ) : (
                  <>
                    <Menu.Item
                      leftSection={<IconArchive style={{ width: rem(14), height: rem(14) }} />}
                      onClick={() => handleBulkStatusUpdate('ARCHIVED')}
                    >
                      Archive
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrashOff style={{ width: rem(14), height: rem(14) }} />}
                      onClick={() => handleSoftDelete(product.id)}
                    >
                      Soft Delete
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                      onClick={() => handleDelete(product.id)}
                    >
                      Permanent Delete
                    </Menu.Item>
                  </>
                )}
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Stack>
      <Group justify="space-between">
        <Group wrap="wrap">
          <TextInput
            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} />}
            onChange={(e) => form.setFieldValue('search', e.currentTarget.value)}
            placeholder="Search products..."
            style={{ width: rem(250) }}
            value={form.values.search}
          />
          <Select
            onChange={(value) => form.setFieldValue('statusFilter', value as ProductStatus | '')}
            placeholder="Status"
            style={{ width: rem(120) }}
            clearable
            data={[
              { label: 'All statuses', value: '' },
              { label: 'Draft', value: 'DRAFT' },
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Archived', value: 'ARCHIVED' },
              { label: 'Discontinued', value: 'DISCONTINUED' },
            ]}
            value={form.values.statusFilter}
          />
          <Select
            onChange={(value) => form.setFieldValue('typeFilter', value || '')}
            placeholder="Type"
            style={{ width: rem(120) }}
            clearable
            data={[
              { label: 'All types', value: '' },
              { label: 'Physical', value: 'PHYSICAL' },
              { label: 'Digital', value: 'DIGITAL' },
              { label: 'Service', value: 'SERVICE' },
              { label: 'Subscription', value: 'SUBSCRIPTION' },
              { label: 'Bundle', value: 'BUNDLE' },
              { label: 'Variant', value: 'VARIANT' },
            ]}
            value={form.values.typeFilter}
          />
          <TextInput
            onChange={(e) => form.setFieldValue('categoryFilter', e.currentTarget.value)}
            placeholder="Category"
            style={{ width: rem(120) }}
            value={form.values.categoryFilter}
          />
          <Select
            onChange={(value) => form.setFieldValue('parentFilter', value || 'all')}
            placeholder="Hierarchy"
            style={{ width: rem(120) }}
            data={[
              { label: 'All', value: 'all' },
              { label: 'Parents only', value: 'parent-only' },
              { label: 'Children only', value: 'child-only' },
              { label: 'Standalone', value: 'standalone' },
            ]}
            value={form.values.parentFilter}
          />
          <Select
            onChange={(value) => form.setFieldValue('aiGeneratedFilter', value || 'all')}
            placeholder="AI Content"
            style={{ width: rem(120) }}
            data={[
              { label: 'All content', value: 'all' },
              { label: 'AI generated', value: 'ai-only' },
              { label: 'Human created', value: 'human-only' },
            ]}
            value={form.values.aiGeneratedFilter}
          />
          <Switch
            onChange={(event) => form.setFieldValue('showDeleted', event.currentTarget.checked)}
            checked={form.values.showDeleted}
            label="Show deleted"
            size="sm"
          />
        </Group>
        <Group>
          {form.values.selectedRows.length > 0 && (
            <Group>
              <Text c="dimmed" size="sm">
                {form.values.selectedRows.length} selected
              </Text>
              <Menu position="bottom-end" shadow="sm" withinPortal>
                <Menu.Target>
                  <Button size="sm" variant="light">
                    Bulk Actions
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Update Status</Menu.Label>
                  <Menu.Item onClick={() => handleBulkStatusUpdate('ACTIVE')}>Set Active</Menu.Item>
                  <Menu.Item onClick={() => handleBulkStatusUpdate('ARCHIVED')}>Archive</Menu.Item>
                  <Menu.Item onClick={() => handleBulkStatusUpdate('DISCONTINUED')}>
                    Discontinue
                  </Menu.Item>

                  <Menu.Divider />
                  <Menu.Label>AI Content</Menu.Label>
                  <Menu.Item
                    leftSection={<IconRobot style={{ width: rem(14), height: rem(14) }} />}
                    onClick={() => handleBulkUpdateAI(true)}
                  >
                    Mark as AI Generated
                  </Menu.Item>
                  <Menu.Item onClick={() => handleBulkUpdateAI(false)}>
                    Mark as Human Created
                  </Menu.Item>

                  <Menu.Divider />
                  <Menu.Label>Actions</Menu.Label>
                  {form.values.showDeleted ? (
                    <Menu.Item
                      color="green"
                      leftSection={<IconRefresh style={{ width: rem(14), height: rem(14) }} />}
                      onClick={handleBulkRestore}
                    >
                      Restore Selected
                    </Menu.Item>
                  ) : (
                    <Menu.Item
                      leftSection={<IconTrashOff style={{ width: rem(14), height: rem(14) }} />}
                      onClick={handleBulkSoftDelete}
                    >
                      Soft Delete Selected
                    </Menu.Item>
                  )}
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                    onClick={handleBulkDelete}
                  >
                    Permanent Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          )}
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              router.push('/pim3/products/new');
            }}
          >
            Add Product
          </Button>
        </Group>
      </Group>

      <ScrollArea>
        <Table highlightOnHover striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: rem(40) }}>
                <Checkbox
                  onChange={(event) =>
                    toggleAllRows(
                      form,
                      products.map((p) => p.id),
                      event.currentTarget.checked,
                    )
                  }
                  {...getSelectAllCheckboxProps(form, products.length)}
                />
              </Table.Th>
              <Th
                onSort={() => setSorting(form, 'name')}
                sorted={form.values.sortBy === 'name'}
                reversed={form.values.reverseSortDirection}
              >
                Product & Hierarchy
              </Th>
              <Th
                onSort={() => setSorting(form, 'category')}
                sorted={form.values.sortBy === 'category'}
                reversed={form.values.reverseSortDirection}
              >
                Category & Type
              </Th>
              <Th
                onSort={() => setSorting(form, 'status')}
                sorted={form.values.sortBy === 'status'}
                reversed={form.values.reverseSortDirection}
              >
                Status
              </Th>
              <Th
                onSort={() => setSorting(form, 'brand')}
                sorted={form.values.sortBy === 'brand'}
                reversed={form.values.reverseSortDirection}
              >
                Brand
              </Th>
              <Th
                onSort={() => setSorting(form, 'price')}
                sorted={form.values.sortBy === 'price'}
                reversed={form.values.reverseSortDirection}
              >
                Price
              </Th>
              <Table.Th>Barcodes</Table.Th>
              <Table.Th>Assets</Table.Th>
              <Table.Th>Sellers</Table.Th>
              <Table.Th>Best Price</Table.Th>
              <Table.Th>Scans</Table.Th>
              <Th
                onSort={() => setSorting(form, 'aiGenerated')}
                sorted={form.values.sortBy === 'aiGenerated'}
                reversed={form.values.reverseSortDirection}
              >
                AI Content
              </Th>
              <Th
                onSort={() => setSorting(form, 'deletedAt')}
                sorted={form.values.sortBy === 'deletedAt'}
                reversed={form.values.reverseSortDirection}
              >
                Deletion Info
              </Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={14}>
                  <Center py="xl">
                    <Loader />
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={14}>
                  <Text c="dimmed" fw={500} py="xl" ta="center">
                    No products found
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Pagination
            boundaries={1}
            onChange={(value) => form.setFieldValue('page', value)}
            total={totalPages}
            siblings={1}
            value={form.values.page}
          />
        </Group>
      )}

      <ProductFormModal
        onClose={() => {
          closeProductModal();
          setEditingProduct(null);
        }}
        onSuccess={() => {
          loadProducts();
          closeProductModal();
          setEditingProduct(null);
        }}
        opened={productModalOpened}
        product={editingProduct}
      />

      <ProductDetailsDrawer
        onClose={() => {
          closeDetailsModal();
          setViewingProduct(null);
        }}
        onUpdate={loadProducts}
        opened={detailsModalOpened}
        product={viewingProduct}
      />
    </Stack>
  );
}
