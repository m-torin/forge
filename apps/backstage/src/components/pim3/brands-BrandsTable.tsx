'use client';

import { Avatar, Badge, Group, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { DataTable, type MRT_ColumnDef } from '@/components/pim3/DataTable';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  status: 'active' | 'inactive';
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface BrandsTableProps {
  brands: Brand[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function BrandsTable({ brands, isLoading, onRefresh }: BrandsTableProps) {
  const router = useRouter();

  const columns = useMemo<MRT_ColumnDef<Brand>[]>(
    () => [
      {
        accessorKey: 'logo',
        header: '',
        size: 50,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ row }: any) => (
          <Avatar
            src={row.original.logo || undefined}
            alt={row.original.name}
            radius="sm"
            size="md"
          >
            {row.original.name?.charAt(0).toUpperCase()}
          </Avatar>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Brand Name',
        size: 200,
        Cell: ({ row }: any) => (
          <Group gap="xs">
            <div>
              <Text fw={500}>{row.original.name}</Text>
              <Text size="xs" c="dimmed">
                {row.original.slug}
              </Text>
            </div>
          </Group>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        size: 300,
        Cell: ({ cell }: any) => (
          <Text size="md" lineClamp={2}>
            {(cell.getValue() as string) || '-'}
          </Text>
        ),
      },
      {
        accessorKey: 'website',
        header: 'Website',
        size: 200,
        Cell: ({ cell }) => {
          const website = cell.getValue<string>();
          return website ? (
            <Text
              size="md"
              c="blue"
              component="a"
              href={website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {website.replace(/^https?:\/\//, '')}
            </Text>
          ) : (
            <Text size="md" c="dimmed">
              -
            </Text>
          );
        },
      },
      {
        accessorKey: 'productCount',
        header: 'Products',
        size: 100,
        Cell: ({ cell }: any) => (
          <Badge variant="light" c="gray">
            {cell.getValue() as number}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
        filterVariant: 'select',
        Cell: ({ cell }) => {
          const status = cell.getValue<string>();
          return (
            <Badge color={status === 'active' ? 'green' : 'red'} variant="light">
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        size: 120,
        Cell: ({ cell }) => new Date(cell.getValue<Date>()).toLocaleDateString(),
      },
    ],
    [],
  );

  const handleAdd = () => {
    // TODO: Create /pim3/brands/new route
    console.log('Add new brand');
    // router.push('/pim3/brands/new');
  };

  const handleView = (row: any) => {
    // TODO: Create /pim3/brands/[id] route
    console.log('View brand:', row.original.id);
    // router.push(`/pim3/brands/${row.original.id}`);
  };

  const handleEdit = (row: any) => {
    // TODO: Create /pim3/brands/[id]/edit route
    console.log('Edit brand:', row.original.id);
    // router.push(`/pim3/brands/${row.original.id}/edit`);
  };

  const handleDelete = async (row: any) => {
    if (row.original.productCount > 0) {
      notifications.show({
        title: 'Cannot delete brand',
        message: 'This brand has products associated with it',
        color: 'red',
      });
      return;
    }

    if (confirm(`Are you sure you want to delete ${row.original.name}?`)) {
      try {
        // Call your delete API endpoint here
        notifications.show({
          title: 'Brand deleted',
          message: `${row.original.name} has been deleted successfully`,
          color: 'green',
        });
        onRefresh?.();
      } catch (error: any) {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete brand',
          color: 'red',
        });
      }
    }
  };

  return (
    <DataTable
      data={brands}
      columns={columns}
      isLoading={isLoading}
      // Actions
      onAdd={handleAdd}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onRefresh={onRefresh}
      // Table options
      enableColumnResizing
      enableColumnOrdering
      enableSorting
      enableGlobalFilter
      enableColumnFilters
      enablePagination
      // Custom options
      tableTitle="Brands"
      emptyStateMessage="No brands found. Create your first brand to get started."
      initialState={{
        pagination: { pageSize: 20, pageIndex: 0 },
        sorting: [{ id: 'name', desc: false }],
      }}
    />
  );
}
