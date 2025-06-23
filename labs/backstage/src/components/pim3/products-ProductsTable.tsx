'use client';

import { Badge, Group, Text, Avatar } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { DataTable, type MRT_ColumnDef } from '@/components/pim3/DataTable';

import { Product } from '@repo/database/prisma';

// Match the type from the existing ProductsTable
interface ProductWithRelations extends Product {
  count: {
    soldBy: number;
    children: number;
  };
  identifiers?: { id: string; upcA?: string | null; ean13?: string | null; asin?: string | null }[];
  children: Product[];
  deletedBy: { id: string; name: string } | null;
  digitalAssets: { id: string; url: string; type: string }[];
  media?: { id: string; url: string; type: string; altText: string | null }[];
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

interface ProductsTableProps {
  initialData?: ProductWithRelations[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function ProductsTable({ initialData: products, isLoading, onRefresh }: ProductsTableProps) {
  const router = useRouter();

  const columns = useMemo<MRT_ColumnDef<ProductWithRelations>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '',
        size: 50,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ row }) => (
          <Avatar
            src={row.original.media?.[0]?.url || undefined}
            alt={row.original.name}
            radius="sm"
            size="md"
          >
            {row.original.name?.charAt(0).toUpperCase()}
          </Avatar>
        ),
      },
      {
        accessorKey: 'sku',
        header: 'SKU',
        size: 120,
      },
      {
        accessorKey: 'name',
        header: 'Product Name',
        size: 250,
        Cell: ({ row }) => (
          <Group gap="xs">
            <Text fw={500}>{row.original.name}</Text>
          </Group>
        ),
      },
      {
        accessorKey: 'brand',
        header: 'Brand',
        size: 150,
        filterVariant: 'select',
      },
      {
        accessorKey: 'category',
        header: 'Category',
        size: 150,
        filterVariant: 'multi-select',
      },
      {
        accessorKey: 'price',
        header: 'Price',
        size: 100,
        Cell: ({ cell }) => (
          <Text fw={500}>
            ${typeof cell.getValue() === 'number' ? cell.getValue<number>().toFixed(2) : '0.00'}
          </Text>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        filterVariant: 'select',
        Cell: ({ cell }) => {
          const status = cell.getValue<string>();
          const color = status === 'active' ? 'green' : status === 'draft' ? 'yellow' : 'red';
          return (
            <Badge color={color} variant="light">
              {status}
            </Badge>
          );
        },
      },
      {
        accessorFn: (row) => row._count.soldBy,
        id: 'soldBy',
        header: 'Sellers',
        size: 100,
        Cell: ({ row }) => {
          const count = row.original._count.soldBy || 0;
          const color = count > 0 ? 'green' : 'gray';
          return (
            <Badge color={color} variant="dot">
              {count}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'updatedAt',
        header: 'Last Updated',
        size: 150,
        Cell: ({ cell }) => {
          const date = cell.getValue<Date>();
          return new Date(date).toLocaleDateString();
        },
      },
    ],
    [],
  );

  const handleAdd = () => {
    router.push('/pim3/products/new');
  };

  const handleView = (row: any) => {
    router.push(`/pim3/products/${row.original.id}` as unknown as any);
  };

  const handleEdit = (row: any) => {
    router.push(`/pim3/products/${row.original.id}/edit` as unknown as any);
  };

  const handleDelete = async (row: any) => {
    if (confirm(`Are you sure you want to delete ${row.original.name}?`)) {
      try {
        // Call your delete API endpoint here
        notifications.show({
          title: 'Product deleted',
          message: `${row.original.name} has been deleted successfully`,
          color: 'green',
        });
        onRefresh?.();
      } catch (error: any) {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete product',
          color: 'red',
        });
      }
    }
  };

  const handleBulkDelete = async (rows: any[]) => {
    if (confirm(`Are you sure you want to delete ${rows.length} products?`)) {
      try {
        // Call your bulk delete API endpoint here
        notifications.show({
          title: 'Products deleted',
          message: `${rows.length} products have been deleted successfully`,
          color: 'green',
        });
        onRefresh?.();
      } catch (error: any) {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete products',
          color: 'red',
        });
      }
    }
  };

  const handleExport = () => {
    // Implement CSV/Excel export
    notifications.show({
      title: 'Export started',
      message: 'Your export will be ready shortly',
      color: 'blue',
    });
  };

  return (
    <DataTable
      data={products || []}
      columns={columns}
      isLoading={isLoading}
      // Actions
      onAdd={handleAdd}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onRefresh={onRefresh}
      onExport={handleExport}
      // Bulk actions
      enableBulkActions
      enableRowSelection
      onBulkDelete={handleBulkDelete}
      // Table options
      enableColumnResizing
      enableColumnOrdering
      enableSorting
      enableGlobalFilter
      enableColumnFilters
      enablePagination
      // Custom options
      tableTitle="Products"
      emptyStateMessage="No products found. Create your first product to get started."
      initialState={{
        pagination: { pageSize: 25, pageIndex: 0 },
        sorting: [{ id: 'updatedAt', desc: true }],
        columnVisibility: {
          inventory: true,
        },
      }}
    />
  );
}
