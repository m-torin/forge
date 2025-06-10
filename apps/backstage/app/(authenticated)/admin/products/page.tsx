import { Skeleton, Stack, Text, Title } from '@mantine/core';
import { Badge } from '@mantine/core';
import { formatDistanceToNow } from 'date-fns';
import { Suspense } from 'react';

import { bulkDeleteRecords, deleteRecord, exportRecords, listRecords } from '../actions';
import { DataTable } from '../components/DataTable';

interface PageProps {
  searchParams: Promise<{ page?: string; limit?: string }>;
}

async function ProductsTable({ searchParams }: PageProps) {
  const searchParamsData = await searchParams;
  const page = Number(searchParamsData.page) || 1;
  const limit = Number(searchParamsData.limit) || 20;

  const data = await listRecords('product', {
    include: {
      _count: {
        select: {
          assets: true,
          barcodes: true,
          scans: true,
        },
      },
      assets: true,
      barcodes: true,
    },
    limit,
    orderBy: { createdAt: 'desc' },
    page,
  });

  const columns = [
    {
      width: '25%',
      key: 'name',
      label: 'Name',
    },
    {
      width: '15%',
      key: 'brand',
      label: 'Brand',
    },
    {
      width: '10%',
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge
          color={
            value === 'ACTIVE'
              ? 'green'
              : value === 'DRAFT'
                ? 'yellow'
                : value === 'ARCHIVED'
                  ? 'gray'
                  : 'red'
          }
          variant="light"
        >
          {value}
        </Badge>
      ),
    },
    {
      width: '10%',
      key: 'price',
      label: 'Price',
      render: (value: number, record: any) =>
        value ? `${record.currency} ${value.toFixed(2)}` : '-',
    },
    {
      width: '15%',
      key: '_count',
      label: 'Stats',
      render: (_: any, record: any) => (
        <Stack gap={4}>
          <Text size="xs">
            {record._count.barcodes} barcodes, {record._count.assets} assets
          </Text>
          <Text c="dimmed" size="xs">
            {record._count.scans} scans
          </Text>
        </Stack>
      ),
    },
    {
      width: '15%',
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => (
        <Text c="dimmed" size="sm">
          {formatDistanceToNow(new Date(value), { addSuffix: true })}
        </Text>
      ),
    },
  ];

  return (
    <DataTable
      createHref="/admin/products/new"
      editHref={(id) => `/admin/products/${id}/edit`}
      viewHref={(id) => `/admin/products/${id}`}
      columns={columns}
      modelKey="product"
      modelName="Product"
      onBulkDelete={async (ids) => {
        'use server';
        await bulkDeleteRecords('product', ids);
      }}
      onDelete={async (id) => {
        'use server';
        await deleteRecord('product', id);
      }}
      onExport={async (format) => {
        'use server';
        return await exportRecords('product', format);
      }}
      data={data}
      searchKeys={['name', 'brand', 'sku']}
    />
  );
}

export default function ProductsPage({ searchParams }: PageProps) {
  return (
    <Stack gap="lg">
      <div>
        <Title order={1}>Products</Title>
        <Text c="dimmed" mt="xs">
          Manage your product catalog
        </Text>
      </div>

      <Suspense fallback={<Skeleton height={400} />}>
        <ProductsTable searchParams={searchParams} />
      </Suspense>
    </Stack>
  );
}
