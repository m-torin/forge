'use client';

import { Badge, Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconFolder, IconPlus } from '@tabler/icons-react';
import { type MRT_ColumnDef } from 'mantine-react-table';
import { useMemo } from 'react';

import { DataTableV2 } from '@/components/data-table-v2';

interface TestCategory {
  id: string;
  name: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  productCount: number;
  children?: TestCategory[];
}

// Sample hierarchical data
const sampleData: TestCategory[] = [
  {
    id: '1',
    name: 'Electronics',
    status: 'PUBLISHED',
    productCount: 150,
    children: [
      {
        id: '1-1',
        name: 'Computers',
        status: 'PUBLISHED',
        productCount: 50,
        children: [
          {
            id: '1-1-1',
            name: 'Laptops',
            status: 'PUBLISHED',
            productCount: 30,
          },
          {
            id: '1-1-2',
            name: 'Desktops',
            status: 'PUBLISHED',
            productCount: 20,
          },
        ],
      },
      {
        id: '1-2',
        name: 'Mobile Devices',
        status: 'PUBLISHED',
        productCount: 100,
        children: [
          {
            id: '1-2-1',
            name: 'Smartphones',
            status: 'PUBLISHED',
            productCount: 80,
          },
          {
            id: '1-2-2',
            name: 'Tablets',
            status: 'DRAFT',
            productCount: 20,
          },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Clothing',
    status: 'PUBLISHED',
    productCount: 200,
    children: [
      {
        id: '2-1',
        name: "Men's Clothing",
        status: 'PUBLISHED',
        productCount: 100,
      },
      {
        id: '2-2',
        name: "Women's Clothing",
        status: 'PUBLISHED',
        productCount: 100,
      },
    ],
  },
  {
    id: '3',
    name: 'Home & Garden',
    status: 'DRAFT',
    productCount: 75,
    children: [
      {
        id: '3-1',
        name: 'Furniture',
        status: 'DRAFT',
        productCount: 50,
      },
      {
        id: '3-2',
        name: 'Garden Tools',
        status: 'ARCHIVED',
        productCount: 25,
      },
    ],
  },
];

export default function TestDataTable() {
  const columns = useMemo<MRT_ColumnDef<TestCategory>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Category',
        size: 300,
        Cell: ({ row, cell }) => (
          <Group gap="xs" style={{ paddingLeft: `${row.depth * 20}px` }}>
            <IconFolder size={20} style={{ color: 'var(--mantine-color-blue-6)' }} />
            <Text fw={500}>{cell.getValue<string>()}</Text>
          </Group>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        Cell: ({ cell }) => {
          const status = cell.getValue<string>();
          const color = status === 'PUBLISHED' ? 'green' : status === 'DRAFT' ? 'gray' : 'red';
          return (
            <Badge color={color} variant="light">
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'productCount',
        header: 'Products',
        size: 100,
        Cell: ({ cell }) => <Badge variant="light">{cell.getValue<number>()}</Badge>,
      },
    ],
    [],
  );

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Title order={2}>DataTableV2 Test - Hierarchical Data</Title>
          <Text c="dimmed">Testing Mantine React Table with nested categories</Text>
        </div>
        <Button leftSection={<IconPlus size={18} />}>Add Category</Button>
      </Group>

      <DataTableV2
        columns={columns}
        data={sampleData}
        loading={false}
        enableExpanding
        getSubRows={(row) => row.children}
        paginateExpandedRows={false}
        filterFromLeafRows={true}
        enableRowSelection={false}
        enableColumnActions={false}
        enableColumnFilters={false}
        enablePagination={false}
        initialState={{
          expanded: true,
        }}
        emptyStateMessage="No categories found"
        searchPlaceholder="Search categories..."
        actions={{
          onEdit: (row) => console.log('Edit:', row.name),
          onDelete: (row) => console.log('Delete:', row.name),
          custom: [
            {
              label: 'Add Subcategory',
              icon: <IconPlus size={14} />,
              onClick: (row) => console.log('Add subcategory to:', row.name),
            },
          ],
        }}
      />
    </Stack>
  );
}
