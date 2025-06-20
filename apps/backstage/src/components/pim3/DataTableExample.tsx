'use client';

import { Box, Text, Badge, Group, Stack, SimpleGrid, Paper, Title } from '@mantine/core';
import { DataTable, type MRT_ColumnDef } from './DataTable';
import { useMemo } from 'react';

// Example with custom filters and detail panel
interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  createdAt: Date;
}

// Mock data
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    items: [
      { name: 'Product A', quantity: 2, price: 29.99 },
      { name: 'Product B', quantity: 1, price: 49.99 },
    ],
    total: 109.97,
    status: 'shipped',
    paymentMethod: 'Credit Card',
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
    },
    createdAt: new Date('2024-01-15'),
  },
  // Add more mock data as needed
];

export function DataTableExample() {
  const columns = useMemo<MRT_ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: 'orderNumber',
        header: 'Order #',
        size: 120,
        mantineTableBodyCellProps: {
          style: { fontWeight: 600 },
        },
      },
      {
        accessorKey: 'customer.name',
        header: 'Customer',
        size: 180,
        Cell: ({ row }) => (
          <Stack gap={0}>
            <Text size="md" fw={500}>
              {row.original.customer.name}
            </Text>
            <Text size="xs" c="dimmed">
              {row.original.customer.email}
            </Text>
          </Stack>
        ),
      },
      {
        accessorKey: 'total',
        header: 'Total',
        size: 120,
        filterVariant: 'range',
        Cell: ({ cell }) => (
          <Text fw={600} c="green.7">
            ${(cell.getValue() as number).toFixed(2)}
          </Text>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 130,
        filterVariant: 'select',
        mantineFilterSelectProps: {
          data: [
            { value: 'pending', label: 'Pending' },
            { value: 'processing', label: 'Processing' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
          ],
        },
        Cell: ({ cell }) => {
          const status = cell.getValue() as string;
          const statusColors: Record<string, string> = {
            pending: 'yellow',
            processing: 'blue',
            shipped: 'cyan',
            delivered: 'green',
            cancelled: 'red',
          };
          return (
            <Badge color={statusColors[status]} variant="light">
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'paymentMethod',
        header: 'Payment',
        size: 150,
        filterVariant: 'multi-select',
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        size: 120,
        filterVariant: 'date-range',
        Cell: ({ cell }) => new Date(cell.getValue() as Date).toLocaleDateString(),
      },
    ],
    [],
  );

  return (
    <Box p="md">
      <Title order={3} mb="lg">
        Advanced DataTable Example
      </Title>

      <DataTable
        data={mockOrders}
        columns={columns}
        // Enable all features
        enableRowSelection
        enableColumnOrdering
        enableColumnResizing
        enablePagination
        enableSorting
        enableGlobalFilter
        enableColumnFilters
        enableDensityToggle
        enableFullScreenToggle
        enableColumnVisibility
        enableBulkActions
        // Custom detail panel
        renderDetailPanel={({ row }) => (
          <Paper p="md" withBorder={true}>
            <SimpleGrid cols={2} spacing="md">
              <Box>
                <Title order={5} mb="sm">
                  Order Items
                </Title>
                <Stack gap="xs">
                  {row.original.items.map((item: any, index) => (
                    <Group key={index} justify="space-between">
                      <Text size="md">
                        {item.name} x{item.quantity}
                      </Text>
                      <Text size="md" fw={500}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </Box>

              <Box>
                <Title order={5} mb="sm">
                  Shipping Address
                </Title>
                <Text size="md">
                  {row.original.shippingAddress.street}
                  <br />
                  {row.original.shippingAddress.city}, {row.original.shippingAddress.state}{' '}
                  {row.original.shippingAddress.zip}
                </Text>
              </Box>
            </SimpleGrid>
          </Paper>
        )}
        // Initial state
        initialState={{
          showColumnFilters: true,
          showGlobalFilter: true,
          density: 'xs',
        }}
        // Custom messages
        emptyStateMessage="No orders found matching your criteria"
      />
    </Box>
  );
}
