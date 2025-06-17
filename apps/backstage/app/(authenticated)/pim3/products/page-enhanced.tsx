'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Group, Text, Avatar, Stack, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { DataTable, type MRT_ColumnDef } from '../components/DataTable';
import { ProductFormEnhanced } from '../components/ProductFormEnhanced';
import { ProductRelationshipManager } from '../components/ProductRelationshipManager';
import {
  getProductsWithPIMFilters,
  deleteProduct,
  bulkDeleteProducts,
  bulkUpdateProductStatus,
} from '../actions';
import {
  formatCurrency,
  getStatusColor,
  showErrorNotification,
  showSuccessNotification,
  showDeleteConfirmModal,
} from '../utils/pim-helpers';
import { Product, ProductStatus } from '@repo/database/prisma';

// Define the shape of your product data with relations
interface ProductWithRelations extends Product {
  _count: {
    scanHistory: number;
    soldBy: number;
    children: number;
  };
  barcodes: { id: string; barcode: string; type: string; isPrimary: boolean }[];
  children: Product[];
  parent: Product | null;
  soldBy: {
    id: string;
    brand: {
      id: string;
      name: string;
    };
  }[];
  collections?: { id: string; name: string }[];
  taxonomies?: { id: string; name: string; type: string }[];
}

export default function ProductsEnhancedPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [relationshipProductId, setRelationshipProductId] = useState<string | null>(null);
  const [relationshipProductName, setRelationshipProductName] = useState<string>('');

  // Define columns specific to products
  const columns = useMemo<MRT_ColumnDef<ProductWithRelations>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Product',
        size: 250,
        Cell: ({ row }) => (
          <Group gap="sm">
            {(row.original as any).media?.[0]?.url ? (
              <Avatar src={(row.original as any).media[0].url} size="sm" radius="sm" />
            ) : (
              <Avatar size="sm" radius="sm">
                {row.original.name.charAt(0).toUpperCase()}
              </Avatar>
            )}
            <div>
              <Text size="sm" fw={500}>
                {row.original.name}
              </Text>
              <Text size="xs" c="dimmed">
                SKU: {row.original.sku}
              </Text>
            </div>
          </Group>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        Cell: ({ cell }) => (
          <Badge variant="light" color={getStatusColor(cell.getValue<ProductStatus>())} size="sm">
            {cell.getValue<string>()}
          </Badge>
        ),
        filterVariant: 'multi-select',
        mantineFilterMultiSelectProps: {
          data: [
            { value: 'DRAFT', label: 'Draft' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'ARCHIVED', label: 'Archived' },
            { value: 'DISCONTINUED', label: 'Discontinued' },
          ],
        },
      },
      {
        accessorKey: 'type',
        header: 'Type',
        size: 120,
        filterVariant: 'select',
        mantineFilterSelectProps: {
          data: [
            { value: 'PHYSICAL', label: 'Physical' },
            { value: 'DIGITAL', label: 'Digital' },
            { value: 'SERVICE', label: 'Service' },
            { value: 'SUBSCRIPTION', label: 'Subscription' },
            { value: 'BUNDLE', label: 'Bundle' },
            { value: 'VARIANT', label: 'Variant' },
            { value: 'OTHER', label: 'Other' },
          ],
        },
      },
      {
        accessorKey: 'category',
        header: 'Category',
        size: 150,
      },
      {
        accessorKey: 'brand',
        header: 'Brand',
        size: 120,
        Cell: ({ cell }) => cell.getValue<string>() || '-',
      },
      {
        accessorKey: 'price',
        header: 'Price',
        size: 100,
        Cell: ({ row }) =>
          row.original.price
            ? formatCurrency(row.original.price, row.original.currency || 'USD')
            : '-',
      },
      {
        id: 'relationships',
        header: 'Relationships',
        size: 200,
        Cell: ({ row }) => (
          <Stack gap={4}>
            {row.original.collections && row.original.collections.length > 0 && (
              <Text size="xs">
                <strong>Collections:</strong> {row.original.collections.length}
              </Text>
            )}
            {row.original.taxonomies && row.original.taxonomies.length > 0 && (
              <Text size="xs">
                <strong>Taxonomies:</strong> {row.original.taxonomies.length}
              </Text>
            )}
            {row.original._count.soldBy > 0 && (
              <Text size="xs">
                <strong>Sellers:</strong> {row.original._count.soldBy}
              </Text>
            )}
          </Stack>
        ),
      },
      {
        id: 'metadata',
        header: 'Metadata',
        size: 150,
        Cell: ({ row }) => (
          <Stack gap={4}>
            {row.original.aiGenerated && (
              <Badge size="xs" variant="light" color="violet">
                AI Generated
              </Badge>
            )}
            {row.original.parent && (
              <Text size="xs" c="dimmed">
                Parent: {row.original.parent.name}
              </Text>
            )}
            {row.original._count.children > 0 && (
              <Text size="xs" c="dimmed">
                {row.original._count.children} variants
              </Text>
            )}
          </Stack>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        size: 100,
        Cell: ({ row }) => (
          <Group gap="xs">
            <Button
              size="xs"
              variant="subtle"
              onClick={() => {
                setRelationshipProductId(row.original.id);
                setRelationshipProductName(row.original.name);
              }}
            >
              Relationships
            </Button>
          </Group>
        ),
      },
    ],
    [],
  );

  // Load products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getProductsWithPIMFilters({
        limit: 100,
        showDeleted: false,
      });

      if (result.success && result.data) {
        setProducts(result.data as any);
      } else {
        showErrorNotification('Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      showErrorNotification('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Handle actions
  const handleAdd = () => {
    setEditingProductId(null);
    openForm();
  };

  const handleEdit = useCallback(
    (row: any) => {
      setEditingProductId(row.original.id);
      openForm();
    },
    [openForm],
  );

  const handleDelete = useCallback(
    async (row: any) => {
      showDeleteConfirmModal(`product "${row.original.name}"`, async () => {
        try {
          const result = await deleteProduct(row.original.id);
          if (result.success) {
            showSuccessNotification('Product deleted successfully');
            loadProducts();
          } else {
            showErrorNotification(result.error || 'Failed to delete product');
          }
        } catch (error) {
          showErrorNotification('Failed to delete product');
        }
      });
    },
    [loadProducts],
  );

  const handleView = useCallback(
    (row: any) => {
      router.push(`/pim3/products/${row.original.id}`);
    },
    [router],
  );

  const handleFormSuccess = () => {
    closeForm();
    loadProducts();
  };

  return (
    <>
      <DataTable
        data={products}
        columns={columns}
        isLoading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onRefresh={loadProducts}
        // Enable features
        enableColumnFilters
        enableColumnOrdering
        enableSorting
        enablePagination
        // Custom options
        emptyStateMessage="No products found. Create your first product to get started."
        initialState={{
          pagination: { pageSize: 25, pageIndex: 0 },
          sorting: [{ id: 'updatedAt', desc: true }],
        }}
        // Add create button to toolbar
        renderTopToolbarCustomActions={() => (
          <Button onClick={handleAdd} leftSection={<IconPlus size={16} />}>
            Create Product
          </Button>
        )}
      />

      {/* Product Form Modal */}
      <ProductFormEnhanced
        opened={formOpened}
        onClose={closeForm}
        onSuccess={handleFormSuccess}
        productId={editingProductId}
      />

      {/* Relationship Manager Modal */}
      {relationshipProductId && (
        <ProductRelationshipManager
          productId={relationshipProductId}
          productName={relationshipProductName}
        />
      )}
    </>
  );
}
