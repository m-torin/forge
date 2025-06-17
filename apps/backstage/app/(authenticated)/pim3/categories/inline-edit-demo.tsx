'use client';

import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconFolder, IconPlus, IconX } from '@tabler/icons-react';
import { type MRT_ColumnDef, type MRT_TableOptions } from 'mantine-react-table';
import { useState } from 'react';

import { DataTable } from '../components/DataTable';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  displayOrder: number;
  children?: Category[];
  parentName?: string;
}

// Sample hierarchical data
const initialData: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    parentId: null,
    description: 'Electronic devices and accessories',
    status: 'PUBLISHED',
    displayOrder: 1,
    children: [
      {
        id: '1-1',
        name: 'Computers',
        slug: 'computers',
        parentId: '1',
        description: 'Desktop and laptop computers',
        status: 'PUBLISHED',
        displayOrder: 1,
        children: [
          {
            id: '1-1-1',
            name: 'Laptops',
            slug: 'laptops',
            parentId: '1-1',
            status: 'PUBLISHED',
            displayOrder: 1,
          },
          {
            id: '1-1-2',
            name: 'Desktops',
            slug: 'desktops',
            parentId: '1-1',
            status: 'PUBLISHED',
            displayOrder: 2,
          },
        ],
      },
      {
        id: '1-2',
        name: 'Mobile Devices',
        slug: 'mobile-devices',
        parentId: '1',
        status: 'PUBLISHED',
        displayOrder: 2,
      },
    ],
  },
  {
    id: '2',
    name: 'Clothing',
    slug: 'clothing',
    parentId: null,
    description: 'Apparel and fashion items',
    status: 'PUBLISHED',
    displayOrder: 2,
    children: [
      {
        id: '2-1',
        name: "Men's Clothing",
        slug: 'mens-clothing',
        parentId: '2',
        status: 'PUBLISHED',
        displayOrder: 1,
      },
      {
        id: '2-2',
        name: "Women's Clothing",
        slug: 'womens-clothing',
        parentId: '2',
        status: 'DRAFT',
        displayOrder: 2,
      },
    ],
  },
];

// Flatten hierarchical data for table display
const flattenCategories = (categories: Category[], parentName = ''): Category[] => {
  const result: Category[] = [];

  const flatten = (cats: Category[], parent = '') => {
    cats.forEach((cat) => {
      const flatCat = { ...cat, parentName: parent };
      result.push(flatCat);
      if (cat.children && cat.children.length > 0) {
        flatten(cat.children, cat.name);
      }
    });
  };

  flatten(categories);
  return result;
};

export default function CategoriesInlineEditDemo() {
  const [categories, setCategories] = useState<Category[]>(initialData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // Flatten categories for table display
  const flatCategories = flattenCategories(categories);

  // Column definitions with inline editing
  const columns: MRT_ColumnDef<Category>[] = [
    {
      accessorKey: 'name',
      header: 'Category Name',
      Cell: ({ row, cell }: any) => (
        <Group
          gap="xs"
          style={{ paddingLeft: `${(row.original.parentId?.split('-').length || 0) * 20}px` }}
        >
          <IconFolder size={18} style={{ color: 'var(--mantine-color-blue-6)' }} />
          <div>
            <Text fw={500}>{cell.getValue() as string}</Text>
            <Text c="dimmed" size="xs">
              /{row.original.slug}
            </Text>
          </div>
        </Group>
      ),
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
      accessorKey: 'slug',
      header: 'URL Slug',
      mantineEditTextInputProps: {
        required: true,
        error: validationErrors?.slug,
        onFocus: () =>
          setValidationErrors({
            ...validationErrors,
            slug: undefined,
          }),
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      editVariant: 'select',
      mantineEditSelectProps: {
        data: [
          { value: 'DRAFT', label: 'Draft' },
          { value: 'PUBLISHED', label: 'Published' },
          { value: 'ARCHIVED', label: 'Archived' },
        ],
      },
      Cell: ({ cell }) => {
        const status = cell.getValue<string>();
        const color = status === 'PUBLISHED' ? 'green' : status === 'DRAFT' ? 'gray' : 'red';
        return (
          <Button variant="light" color={color} size="xs" radius="xl">
            {status}
          </Button>
        );
      },
    },
    {
      accessorKey: 'displayOrder',
      header: 'Order',
      size: 80,
      mantineEditTextInputProps: {
        type: 'number',
        required: true,
        error: validationErrors?.displayOrder,
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      Cell: ({ cell }: any) => (
        <Text c="dimmed" size="md" lineClamp={1}>
          {(cell.getValue() as string) || 'No description'}
        </Text>
      ),
    },
  ];

  // Validation
  const validateCategory = (category: Category) => {
    return {
      name: !category.name ? 'Category name is required' : '',
      slug: !category.slug
        ? 'Slug is required'
        : !/^[a-z0-9-]+$/.test(category.slug)
          ? 'Slug must contain only lowercase letters, numbers, and hyphens'
          : '',
      displayOrder: category.displayOrder < 0 ? 'Display order must be positive' : '',
    };
  };

  // Handle creating new category
  const handleCreateCategory: MRT_TableOptions<Category>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode,
  }) => {
    const newValidationErrors = validateCategory(values);
    if (Object.values(newValidationErrors).some((error: any) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});

    const newCategory = {
      ...values,
      id: (Math.random() + 1).toString(36).substring(7),
      children: [],
    };

    // Add to root level for simplicity
    setCategories([...categories, newCategory]);

    notifications.show({
      color: 'green',
      icon: <IconCheck size={16} />,
      message: 'Category created successfully',
    });
    exitCreatingMode();
  };

  // Handle saving category edits
  const handleSaveCategory: MRT_TableOptions<Category>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateCategory(values);
    if (Object.values(newValidationErrors).some((error: any) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});

    // Update category in the tree structure
    const updateCategoryInTree = (cats: Category[]): Category[] => {
      return cats.map((cat) => {
        if (cat.id === values.id) {
          return { ...cat, ...values };
        }
        if (cat.children) {
          return { ...cat, children: updateCategoryInTree(cat.children) };
        }
        return cat;
      });
    };

    setCategories(updateCategoryInTree(categories));

    notifications.show({
      color: 'green',
      icon: <IconCheck size={16} />,
      message: 'Category updated successfully',
    });
    table.setEditingRow(null);
  };

  // Handle deleting category
  const handleDeleteCategory = (categoryId: string) => {
    modals.openConfirmModal({
      title: 'Delete Category',
      children: (
        <Text>
          Are you sure you want to delete this category? Any subcategories will also be deleted.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        // Remove category from tree
        const removeCategoryFromTree = (cats: Category[]): Category[] => {
          return cats
            .filter((cat) => cat.id !== categoryId)
            .map((cat) => ({
              ...cat,
              children: cat.children ? removeCategoryFromTree(cat.children) : [],
            }));
        };

        setCategories(removeCategoryFromTree(categories));

        notifications.show({
          color: 'red',
          icon: <IconX size={16} />,
          message: 'Category deleted successfully',
        });
      },
    });
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Title order={2}>Categories - Inline Edit Demo</Title>
          <Text c="dimmed">Edit categories directly in the table rows</Text>
        </div>
      </Group>

      <DataTable
        columns={columns}
        data={flatCategories}
        enableInlineEdit
        editDisplayMode="row"
        createDisplayMode="row"
        onCreatingRowSave={handleCreateCategory}
        onEditingRowSave={handleSaveCategory}
        onCreatingRowCancel={() => setValidationErrors({})}
        onEditingRowCancel={() => setValidationErrors({})}
        validationErrors={validationErrors}
        onDelete={(row) => handleDeleteCategory(row.original.id)}
        enableRowSelection={false}
        enablePagination={false}
      />
    </Stack>
  );
}
