'use client';

import { Group, Stack, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { type MRT_ColumnDef, type MRT_TableOptions } from 'mantine-react-table';
import { useState } from 'react';

import { DataTable } from '@/components/pim3/DataTable';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'discontinued';
  category: string;
}

// Sample data
const initialData: Product[] = [
  {
    id: '1',
    name: 'Laptop Pro 15"',
    sku: 'LP-15-001',
    price: 1299.99,
    stock: 45,
    status: 'active',
    category: 'Electronics',
  },
  {
    id: '2',
    name: 'Wireless Mouse',
    sku: 'WM-BT-002',
    price: 29.99,
    stock: 150,
    status: 'active',
    category: 'Accessories',
  },
  {
    id: '3',
    name: 'USB-C Hub',
    sku: 'USB-HUB-003',
    price: 49.99,
    stock: 0,
    status: 'inactive',
    category: 'Accessories',
  },
  {
    id: '4',
    name: 'Mechanical Keyboard',
    sku: 'KB-MECH-004',
    price: 149.99,
    stock: 25,
    status: 'active',
    category: 'Accessories',
  },
  {
    id: '5',
    name: 'Monitor 27"',
    sku: 'MON-27-005',
    price: 399.99,
    stock: 12,
    status: 'discontinued',
    category: 'Electronics',
  },
];

export default function InlineEditExample() {
  const [products, setProducts] = useState<Product[]>(initialData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // Column definitions with inline editing configuration
  const columns: MRT_ColumnDef<Product>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      enableEditing: false,
      size: 80,
    },
    {
      accessorKey: 'name',
      header: 'Product Name',
      mantineEditTextInputProps: {
        required: true,
        error: validationErrors?.name,
        onFocus: () =>
          setValidationErrors({
            ...validationErrors,
            name: undefined,
          }),
      },
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      mantineEditTextInputProps: {
        required: true,
        error: validationErrors?.sku,
        onFocus: () =>
          setValidationErrors({
            ...validationErrors,
            sku: undefined,
          }),
      },
    },
    {
      accessorKey: 'price',
      header: 'Price',
      Cell: ({ cell }) => `$${cell.getValue<number>().toFixed(2)}`,
      mantineEditTextInputProps: {
        type: 'number',
        required: true,
        error: validationErrors?.price,
        onFocus: () =>
          setValidationErrors({
            ...validationErrors,
            price: undefined,
          }),
      },
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      mantineEditTextInputProps: {
        type: 'number',
        required: true,
        error: validationErrors?.stock,
        onFocus: () =>
          setValidationErrors({
            ...validationErrors,
            stock: undefined,
          }),
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      editVariant: 'select',
      mantineEditSelectProps: {
        data: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'discontinued', label: 'Discontinued' },
        ],
        error: validationErrors?.status,
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      editVariant: 'select',
      mantineEditSelectProps: {
        data: ['Electronics', 'Accessories', 'Software', 'Books'],
        error: validationErrors?.category,
      },
    },
  ];

  // Validation function
  const validateProduct = (product: Product) => {
    return {
      name: !product.name ? 'Product name is required' : '',
      sku: !product.sku ? 'SKU is required' : '',
      price: product.price <= 0 ? 'Price must be greater than 0' : '',
      stock: product.stock < 0 ? 'Stock cannot be negative' : '',
    };
  };

  // Handle creating new product
  const handleCreateProduct: MRT_TableOptions<Product>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode,
  }) => {
    const newValidationErrors = validateProduct(values);
    if (Object.values(newValidationErrors).some((error: any) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});

    const newProduct = {
      ...values,
      id: (Math.random() + 1).toString(36).substring(7),
    };

    setProducts([...products, newProduct]);
    notifications.show({
      color: 'green',
      icon: <IconCheck size={16} />,
      message: 'Product created successfully',
    });
    exitCreatingMode();
  };

  // Handle saving product edits
  const handleSaveProduct: MRT_TableOptions<Product>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateProduct(values);
    if (Object.values(newValidationErrors).some((error: any) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});

    setProducts((prevProducts) =>
      prevProducts.map((product: any) => (product.id === values.id ? values : product)),
    );

    notifications.show({
      color: 'green',
      icon: <IconCheck size={16} />,
      message: 'Product updated successfully',
    });
    table.setEditingRow(null);
  };

  // Handle deleting product
  const handleDeleteProduct = (productId: string) => {
    modals.openConfirmModal({
      title: 'Delete Product',
      children: (
        <Text>Are you sure you want to delete this product? This action cannot be undone.</Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        setProducts((prevProducts) =>
          prevProducts.filter((product: any) => product.id !== productId),
        );
        notifications.show({
          color: 'red',
          icon: <IconX size={16} />,
          message: 'Product deleted successfully',
        });
      },
    });
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Title order={2}>Inline Edit Example</Title>
          <Text c="dimmed">Edit products directly in the table</Text>
        </div>
      </Group>

      <DataTable
        columns={columns}
        data={products}
        enableInlineEdit
        editDisplayMode="row"
        createDisplayMode="row"
        onCreatingRowSave={handleCreateProduct}
        onEditingRowSave={handleSaveProduct}
        onCreatingRowCancel={() => setValidationErrors({})}
        onEditingRowCancel={() => setValidationErrors({})}
        validationErrors={validationErrors}
        onDelete={(row) => handleDeleteProduct(row.original.id)}
        enableRowSelection
        enableBulkActions
        onBulkDelete={(rows) => {
          modals.openConfirmModal({
            title: 'Delete Products',
            children: (
              <Text>
                Are you sure you want to delete {rows.length} products? This action cannot be
                undone.
              </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: () => {
              const idsToDelete = rows.map((row) => row.original.id);
              setProducts((prevProducts) =>
                prevProducts.filter((product: any) => !idsToDelete.includes(product.id)),
              );
              notifications.show({
                color: 'red',
                icon: <IconX size={16} />,
                message: `${rows.length} products deleted successfully`,
              });
            },
          });
        }}
      />
    </Stack>
  );
}
