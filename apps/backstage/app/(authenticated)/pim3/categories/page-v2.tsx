'use client';

import {
  ActionIcon,
  Affix,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Drawer,
  Group,
  HoverCard,
  Indicator,
  JsonInput,
  LoadingOverlay,
  NumberInput,
  Paper,
  Progress,
  rem,
  ScrollArea,
  SegmentedControl,
  Select,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Timeline,
  Title,
  Tooltip,
  Transition,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDebouncedValue, useDisclosure, useMediaQuery, useToggle } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconArrowDown,
  IconBrandGoogle,
  IconBulb,
  IconCategory,
  IconCheck,
  IconCode,
  IconCopy,
  IconDeviceFloppy,
  IconDots,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconFolder,
  IconHistory,
  IconInfoCircle,
  IconLock,
  IconLockOpen,
  IconPlus,
  IconRefresh,
  IconTag,
  IconTrash,
  IconWorld,
  IconX,
} from '@tabler/icons-react';
import { type MRT_ColumnDef } from 'mantine-react-table';
import React, { useEffect, useMemo, useState } from 'react';

import { DataTableV2 } from '../../components/data-table-v2';
import {
  createCategory,
  deleteCategory,
  duplicateCategory,
  getCategoryTree,
  updateCategory,
} from './actions';

import { ContentStatus } from '@repo/database/prisma';

interface Category {
  _count?: {
    products: number;
    children: number;
  };
  children: Category[];
  copy?: any;
  createdAt: Date;
  deletedAt?: Date | null;
  deletedById?: string | null;
  description?: string | null;
  displayOrder: number;
  id: string;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  metaTitle?: string | null;
  name: string;
  parentId: string | null;
  slug: string;
  status: ContentStatus;
  updatedAt: Date;
}

interface CategoryFormData {
  copy: string;
  description: string;
  displayOrder: number;
  metaDescription: string;
  metaKeywords: string;
  metaTitle: string;
  name: string;
  parentId: string | null;
  slug: string;
  status: ContentStatus;
}

export default function CategoriesPageV2() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [drawerOpened, { close: closeDrawer, open: openDrawer }] = useDisclosure(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [showJsonEditor, toggleJsonEditor] = useToggle([false, true]);
  const [validationProgress, setValidationProgress] = useState(0);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Load categories from database
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const tree = await getCategoryTree();
      setCategories(tree || []);
    } catch (error: any) {
      console.error('Failed to load categories:', error);
      setError('Failed to load categories. Please try again.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Form for category editing/creation
  const form = useForm<CategoryFormData>({
    validate: {
      name: (value: any) => (!value ? 'Category name is required' : null),
      displayOrder: (value: any) => {
        if (value < 0) return 'Display order must be positive';
        return null;
      },
      slug: (value: any) => {
        if (!value) return 'Slug is required';
        if (!/^[a-z0-9-]+$/.test(value))
          return 'Slug must contain only lowercase letters, numbers, and hyphens';
        return null;
      },
    },
    initialValues: {
      name: '',
      copy: '{}',
      description: '',
      displayOrder: 0,
      metaDescription: '',
      metaKeywords: '',
      metaTitle: '',
      parentId: null,
      slug: '',
      status: 'DRAFT' as ContentStatus,
    },
  });

  // Calculate validation progress
  useEffect(() => {
    const fields = ['name', 'slug', 'description', 'metaTitle', 'metaDescription'];
    const filledFields = fields.filter(
      (field) => form.values[field as keyof CategoryFormData] !== '',
    );
    setValidationProgress((filledFields.length / fields.length) * 100);
  }, [form.values]);

  // Define columns for DataTableV2
  const columns = useMemo<MRT_ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Category',
        size: 300,
        Cell: ({ row, cell }) => (
          <Group gap="xs" style={{ paddingLeft: `${row.depth * 20}px` }}>
            <IconFolder size={20} style={{ color: 'var(--mantine-color-blue-6)' }} />
            <div>
              <Text fw={500}>{cell.getValue<string>()}</Text>
              <Text c="dimmed" size="xs">
                /{row.original.slug}
              </Text>
            </div>
          </Group>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
        Cell: ({ cell }) => (
          <Badge color={getStatusColor(cell.getValue<ContentStatus>())} variant="light">
            {cell.getValue<string>()}
          </Badge>
        ),
      },
      {
        accessorFn: (row) => row._count?.products || 0,
        header: 'Products',
        size: 100,
        Cell: ({ cell }) => <Badge variant="light">{cell.getValue<number>()}</Badge>,
      },
      {
        accessorKey: 'description',
        header: 'Description',
        Cell: ({ cell }) => (
          <Text c="dimmed" lineClamp={1} size="md">
            {cell.getValue<string>() || 'No description'}
          </Text>
        ),
      },
      {
        accessorKey: 'displayOrder',
        header: 'Order',
        size: 80,
      },
    ],
    [],
  );

  // Get status color
  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return 'green';
      case 'DRAFT':
        return 'gray';
      case 'ARCHIVED':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Open drawer for editing
  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsCreating(false);
    form.setValues({
      name: category.name,
      copy: JSON.stringify(category.copy || {}, null, 2),
      description: category.description || '',
      displayOrder: category.displayOrder,
      metaDescription: category.metaDescription || '',
      metaKeywords: category.metaKeywords || '',
      metaTitle: category.metaTitle || '',
      parentId: category.parentId,
      slug: category.slug,
      status: category.status,
    });
    openDrawer();
  };

  // Open drawer for creating
  const handleCreate = (parentId: string | null = null) => {
    setSelectedCategory(null);
    setIsCreating(true);
    form.reset();
    form.setFieldValue('parentId', parentId);
    form.setFieldValue('status', 'DRAFT');
    openDrawer();
  };

  // Handle delete
  const handleDelete = (category: Category) => {
    modals.openConfirmModal({
      centered: true,
      children: (
        <Stack gap="sm">
          <Text size="md">
            Are you sure you want to delete <strong>{category.name}</strong>?
          </Text>
          {category.children && category.children.length > 0 && (
            <Alert c="yellow" variant="light">
              <Text size="xs">This category has {category.children.length} subcategories.</Text>
            </Alert>
          )}
          {category._count?.products && category._count.products > 0 && (
            <Alert c="red" variant="light">
              <Text size="xs">
                {category._count.products} products are assigned to this category.
              </Text>
            </Alert>
          )}
        </Stack>
      ),
      confirmProps: { color: 'red' },
      labels: { cancel: 'Cancel', confirm: 'Delete' },
      onConfirm: async () => {
        try {
          await deleteCategory(category.id);
          notifications.show({
            color: 'red',
            icon: <IconTrash size={16} />,
            message: 'Category deleted successfully',
          });
          await loadCategories();
        } catch (error: any) {
          notifications.show({
            color: 'red',
            icon: <IconX size={16} />,
            message: 'Failed to delete category',
          });
        }
      },
      title: 'Delete Category',
    });
  };

  // Handle duplicate
  const handleDuplicate = async (category: Category) => {
    try {
      await duplicateCategory(category.id);
      notifications.show({
        color: 'green',
        icon: <IconCheck size={16} />,
        message: 'Category duplicated successfully',
      });
      await loadCategories();
    } catch (error: any) {
      notifications.show({
        color: 'red',
        icon: <IconX size={16} />,
        message: 'Failed to duplicate category',
      });
    }
  };

  // Create sample categories for zero state
  const createSampleCategories = async () => {
    setLoading(true);
    try {
      const sampleCategories = [
        {
          name: 'Electronics',
          slug: 'electronics',
          status: 'PUBLISHED' as ContentStatus,
          description: 'Electronic devices and accessories',
          displayOrder: 1,
        },
        {
          name: 'Clothing',
          slug: 'clothing',
          status: 'PUBLISHED' as ContentStatus,
          description: 'Apparel and fashion items',
          displayOrder: 2,
        },
        {
          name: 'Home & Garden',
          slug: 'home-garden',
          status: 'PUBLISHED' as ContentStatus,
          description: 'Home decor and gardening supplies',
          displayOrder: 3,
        },
      ];

      for (const category of sampleCategories) {
        await createCategory(category);
      }

      notifications.show({
        color: 'green',
        icon: <IconCheck size={16} />,
        message: 'Sample categories created successfully',
      });

      await loadCategories();
    } catch (error: any) {
      notifications.show({
        color: 'red',
        icon: <IconX size={16} />,
        message: 'Failed to create sample categories',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (values: CategoryFormData) => {
    setIsSaving(true);

    try {
      let parsedCopy: Record<string, any> = {};
      try {
        parsedCopy = JSON.parse(values.copy || '{}');
      } catch {
        parsedCopy = {};
      }

      const data = {
        name: values.name,
        copy: parsedCopy,
        description: values.description || undefined,
        displayOrder: values.displayOrder,
        metaDescription: values.metaDescription || undefined,
        metaKeywords: values.metaKeywords || undefined,
        metaTitle: values.metaTitle || undefined,
        parentId: values.parentId || undefined,
        slug: values.slug,
        status: values.status,
      };

      if (isCreating) {
        await createCategory(data);
      } else if (selectedCategory) {
        await updateCategory(selectedCategory.id, data);
      }

      notifications.show({
        id: 'category-save',
        autoClose: 3000,
        color: 'green',
        icon: <IconCheck size={16} />,
        message: isCreating ? 'Category created successfully' : 'Category updated successfully',
      });

      await loadCategories();
      closeDrawer();
      form.reset();
    } catch (error: any) {
      notifications.show({
        id: 'category-error',
        color: 'red',
        icon: <IconX size={16} />,
        message:
          error instanceof Error
            ? (error as Error)?.message || 'Unknown error'
            : 'Failed to save category',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Get all parent categories for select
  const getAllParentCategories = (
    categories: Category[],
    excludeId?: string,
  ): { value: string; label: string }[] => {
    const result: { value: string; label: string }[] = [
      { label: 'No Parent (Top Level)', value: '' },
    ];

    if (!categories || !Array.isArray(categories)) {
      return result;
    }

    const addCategories = (cats: Category[], prefix = '') => {
      if (!cats || !Array.isArray(cats)) return;

      try {
        for (const cat of cats) {
          if (cat && cat.id && cat.name && cat.id !== excludeId) {
            result.push({ label: `${prefix}${cat.name}`, value: cat.id });
            if (cat.children && Array.isArray(cat.children) && cat.children.length > 0) {
              addCategories(cat.children, `${prefix}${cat.name} > `);
            }
          }
        }
      } catch (error: any) {
        console.error('Error processing categories: ', error);
      }
    };

    addCategories(categories);
    return result;
  };

  return (
    <>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Product Categories</Title>
            <Text c="dimmed">Manage your product category hierarchy</Text>
          </div>
          <Button leftSection={<IconPlus size={18} />} onClick={() => handleCreate()}>
            Add Category
          </Button>
        </Group>

        {/* Zero State */}
        {!loading && categories.length === 0 && !error && (
          <Card withBorder={true}>
            <Stack ta="center" gap="md" py="xl">
              <ThemeIcon c="gray" size="xl" variant="light">
                <IconFolder size={30} />
              </ThemeIcon>
              <div>
                <Text fw={500} ta="center">
                  No categories yet
                </Text>
                <Text c="dimmed" mt="xs" size="md" ta="center">
                  Create your first category to get started
                </Text>
              </div>
              <Group>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => handleCreate()}
                  variant="light"
                >
                  Create Category
                </Button>
                <Button
                  leftSection={<IconBulb size={16} />}
                  onClick={createSampleCategories}
                  variant="subtle"
                  c="yellow"
                >
                  Create Sample Categories
                </Button>
              </Group>
            </Stack>
          </Card>
        )}

        {/* Categories Table */}
        {(categories.length > 0 || loading || error) && (
          <DataTableV2
            columns={columns}
            data={categories}
            loading={loading}
            error={error}
            onRefresh={loadCategories}
            enableExpanding
            getSubRows={(row) => row.children}
            paginateExpandedRows={false}
            filterFromLeafRows={true}
            enableRowSelection={false}
            enableColumnActions={false}
            enableColumnFilters={false}
            initialState={{
              expanded: true, // Expand all by default
            }}
            emptyStateMessage="No categories match your search"
            searchPlaceholder="Search categories..."
            actions={{
              onEdit: handleEdit,
              onDelete: handleDelete,
              custom: [
                {
                  label: 'Add Subcategory',
                  icon: <IconPlus size={14} />,
                  onClick: (category) => handleCreate(category.id),
                },
                {
                  label: 'Duplicate',
                  icon: <IconCopy size={14} />,
                  onClick: handleDuplicate,
                },
                {
                  label: 'View Products',
                  icon: <IconEye size={14} />,
                  onClick: (category) => {
                    // TODO: Navigate to products page with category filter
                    console.log('View products for: ', category.name);
                  },
                },
              ],
            }}
          />
        )}
      </Stack>

      {/* Category Edit/Create Drawer - Same as before */}
      <Drawer
        closeButtonProps={{ 'aria-label': 'Close drawer' }}
        lockScroll
        onClose={() => {
          if (form.isDirty() && !isSaving) {
            modals.openConfirmModal({
              children: (
                <Text size="md">
                  You have unsaved changes. Are you sure you want to close without saving?
                </Text>
              ),
              confirmProps: { color: 'red' },
              labels: { cancel: 'Keep Editing', confirm: 'Discard Changes' },
              onConfirm: () => {
                closeDrawer();
                form.reset();
              },
              title: 'Unsaved Changes',
            });
          } else {
            closeDrawer();
            form.reset();
          }
        }}
        opened={drawerOpened}
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        position="right"
        returnFocus
        transitionProps={{ duration: 250, transition: 'slide-left' }}
        trapFocus
        withCloseButton={!isSaving}
        padding="lg"
        size={isMobile ? '100%' : 'xl'}
        title={
          <Group gap="xs">
            <ThemeIcon c="blue" variant="light">
              <IconCategory size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600}>{isCreating ? 'Create Category' : 'Edit Category'}</Text>
              {selectedCategory && (
                <Text c="dimmed" size="xs">
                  ID: {selectedCategory.id}
                </Text>
              )}
            </div>
          </Group>
        }
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <LoadingOverlay
            overlayProps={{ blur: 2, radius: 'sm' }}
            visible={isSaving}
            zIndex={1000}
          />

          {/* Progress indicator */}
          <Box mb="md">
            <Group justify="space-between" mb="xs">
              <Text fw={500} size="md">
                Completion Progress
              </Text>
              <Text c="dimmed" size="xs">
                {Math.round(validationProgress)}%
              </Text>
            </Group>
            <Progress
              color={validationProgress === 100 ? 'green' : 'blue'}
              animated
              radius="xl"
              size="md"
              value={validationProgress}
            />
          </Box>

          {/* Form validation alerts */}
          {form.errors && Object.keys(form.errors).length > 0 && (
            <Alert
              c="red"
              icon={<IconAlertCircle size={16} />}
              mb="md"
              title="Validation Errors"
              variant="light"
            >
              <Text size="md">Please fix the errors below before saving.</Text>
            </Alert>
          )}

          <Tabs onChange={setActiveTab} value={activeTab} variant="pills">
            <Tabs.List grow>
              <Tabs.Tab
                leftSection={<IconEdit size={16} />}
                rightSection={
                  form.errors.name || form.errors.slug ? <Indicator c="red" size={6} /> : null
                }
                value="basic"
              >
                Basic Info
              </Tabs.Tab>
              <Tabs.Tab
                leftSection={<IconBrandGoogle size={16} />}
                rightSection={form.errors.metaDescription ? <Indicator c="red" size={6} /> : null}
                value="seo"
              >
                SEO
              </Tabs.Tab>
              <Tabs.Tab
                leftSection={<IconCode size={16} />}
                rightSection={form.errors.copy ? <Indicator c="red" size={6} /> : null}
                value="advanced"
              >
                Advanced
              </Tabs.Tab>
              <Tabs.Tab leftSection={<IconHistory size={16} />} value="history">
                History
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel pt="md" value="basic">
              <Stack gap="md">
                {/* Basic Information with enhanced inputs */}
                <Text fw={500} size="md">
                  Basic Information
                </Text>

                <TextInput
                  {...form.getInputProps('name')}
                  autoComplete="off"
                  data-autofocus
                  description="This will be displayed throughout the site"
                  placeholder="e.g., Electronics"
                  rightSection={
                    <HoverCard width={200} shadow="md">
                      <HoverCard.Target>
                        <ActionIcon
                          onClick={() => {
                            const slug = generateSlug(form.values.name);
                            form.setFieldValue('slug', slug);
                          }}
                          variant="subtle"
                        >
                          <IconRefresh size={16} />
                        </ActionIcon>
                      </HoverCard.Target>
                      <HoverCard.Dropdown>
                        <Text size="md">
                          Click to auto-generate URL slug from the category name
                        </Text>
                      </HoverCard.Dropdown>
                    </HoverCard>
                  }
                  label="Category Name"
                  withAsterisk
                />

                <TextInput
                  {...form.getInputProps('slug')}
                  description="Used in URLs and breadcrumbs"
                  placeholder="e.g., electronics"
                  label="URL Slug"
                  withAsterisk
                />

                <Select
                  {...form.getInputProps('parentId')}
                  comboboxProps={{
                    dropdownPadding: 10,
                    shadow: 'md',
                    transitionProps: { duration: 200, transition: 'pop' },
                  }}
                  description="Leave empty for top-level category"
                  leftSection={<IconFolder size={16} />}
                  nothingFoundMessage="No categories found"
                  onChange={(value) => form.setFieldValue('parentId', value || null)}
                  placeholder="Select parent category"
                  clearable
                  data={getAllParentCategories(categories, selectedCategory?.id)}
                  label="Parent Category"
                  searchable
                  value={form.values.parentId || ''}
                />

                <Textarea
                  {...form.getInputProps('description')}
                  rightSectionWidth={60}
                  autosize
                  description="Internal description for admin reference"
                  maxRows={5}
                  minRows={2}
                  placeholder="Brief description of this category"
                  rightSection={
                    <Text c="dimmed" size="xs">
                      {form.values.description.length}/500
                    </Text>
                  }
                  rows={3}
                  label="Description"
                  maxLength={500}
                />

                <Group grow>
                  <Select
                    {...form.getInputProps('status')}
                    leftSection={
                      form.values.status === 'PUBLISHED' ? (
                        <IconLockOpen color="var(--mantine-color-green-6)" size={16} />
                      ) : (
                        <IconLock color="var(--mantine-color-gray-6)" size={16} />
                      )
                    }
                    styles={{
                      input: {
                        backgroundColor:
                          form.values.status === 'PUBLISHED'
                            ? 'var(--mantine-color-green-0)'
                            : undefined,
                        fontWeight: 500,
                      },
                    }}
                    data={[
                      { label: 'Draft', value: 'DRAFT' },
                      { label: 'Published', value: 'PUBLISHED' },
                      { label: 'Archived', value: 'ARCHIVED' },
                    ]}
                    label="Status"
                  />

                  <NumberInput
                    {...form.getInputProps('displayOrder')}
                    hideControls={false}
                    clampBehavior="strict"
                    description="Lower numbers appear first"
                    leftSection={<IconArrowDown size={16} />}
                    placeholder="0"
                    stepHoldDelay={500}
                    stepHoldInterval={100}
                    label="Display Order"
                    max={9999}
                    min={0}
                  />
                </Group>
              </Stack>
            </Tabs.Panel>

            {/* SEO Information Tab */}
            <Tabs.Panel pt="md" value="seo">
              <Stack gap="sm">
                <Alert c="blue" icon={<IconBulb size={16} />} mb="md" variant="light">
                  <Text size="md">Optimizing these fields improves search engine visibility</Text>
                </Alert>

                <TextInput
                  {...form.getInputProps('metaTitle')}
                  rightSectionWidth={40}
                  description="Leave empty to use category name (50-60 characters ideal)"
                  leftSection={<IconTag size={16} />}
                  placeholder="Custom page title for SEO"
                  rightSection={
                    form.values.metaTitle && (
                      <Text c={form.values.metaTitle.length > 60 ? 'red' : 'dimmed'} size="xs">
                        {form.values.metaTitle.length}
                      </Text>
                    )
                  }
                  label="Meta Title"
                />

                <Textarea
                  {...form.getInputProps('metaDescription')}
                  autosize
                  description={`${form.values.metaDescription.length}/160 characters`}
                  error={form.errors.metaDescription}
                  maxRows={4}
                  minRows={2}
                  placeholder="Description for search engines"
                  rows={2}
                  styles={{
                    input: {
                      borderColor:
                        form.values.metaDescription.length > 160
                          ? 'var(--mantine-color-yellow-6)'
                          : undefined,
                    },
                  }}
                  label="Meta Description"
                  maxLength={200}
                />

                <TextInput
                  {...form.getInputProps('metaKeywords')}
                  description="Comma-separated keywords (less important for modern SEO)"
                  leftSection={<IconWorld size={16} />}
                  placeholder="keyword1, keyword2, keyword3"
                  label="Meta Keywords"
                />
              </Stack>
            </Tabs.Panel>

            {/* Advanced Tab with JSON editor */}
            <Tabs.Panel pt="md" value="advanced">
              <Stack gap="sm">
                <Group justify="space-between" mb="xs">
                  <Text fw={500}>Additional Content (JSON)</Text>
                  <SegmentedControl
                    onChange={(value) => toggleJsonEditor(value === 'json')}
                    data={[
                      { label: 'Visual', value: 'visual' },
                      { label: 'JSON', value: 'json' },
                    ]}
                    size="xs"
                    value={showJsonEditor ? 'json' : 'visual'}
                  />
                </Group>

                {showJsonEditor ? (
                  <JsonInput
                    {...form.getInputProps('copy')}
                    validationError={form.errors.copy}
                    autosize
                    description="Store additional category data in JSON format"
                    formatOnBlur
                    maxRows={15}
                    minRows={6}
                    placeholder='{ "key": "value" }'
                    styles={{
                      input: {
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace',
                        fontSize: rem(13),
                      },
                    }}
                    label="Custom Content"
                  />
                ) : (
                  <Paper withBorder={true} bg="gray.0" p="md">
                    <Text c="dimmed" size="md" ta="center">
                      Visual editor for JSON content coming soon.
                      <br />
                      Switch to JSON mode to edit directly.
                    </Text>
                  </Paper>
                )}

                <Alert c="gray" icon={<IconInfoCircle size={16} />} variant="light">
                  <Text size="xs">
                    Use this field to store custom attributes, feature flags, or any additional
                    structured data for this category.
                  </Text>
                </Alert>
              </Stack>
            </Tabs.Panel>

            {/* History Tab */}
            <Tabs.Panel pt="md" value="history">
              <Stack gap="sm">
                <Timeline lineWidth={2} active={2} bulletSize={24}>
                  <Timeline.Item bullet={<IconPlus size={12} />} title="Category created">
                    <Text c="dimmed" size="md">
                      Created by John Doe
                    </Text>
                    <Text c="dimmed" mt={4} size="xs">
                      2 days ago
                    </Text>
                  </Timeline.Item>

                  <Timeline.Item bullet={<IconEdit size={12} />} title="Name updated">
                    <Text c="dimmed" size="md">
                      Changed from "Electronic" to "Electronics"
                    </Text>
                    <Text c="dimmed" mt={4} size="xs">
                      Yesterday at 3:45 PM
                    </Text>
                  </Timeline.Item>

                  <Timeline.Item bullet={<IconEye size={12} />} title="Status changed">
                    <Text c="dimmed" size="md">
                      Published by Admin
                    </Text>
                    <Text c="dimmed" mt={4} size="xs">
                      Today at 10:30 AM
                    </Text>
                  </Timeline.Item>

                  <Timeline.Item bullet={<IconDots size={12} />} lineVariant="dashed">
                    <Text c="dimmed" size="md">
                      More history available
                    </Text>
                  </Timeline.Item>
                </Timeline>
              </Stack>
            </Tabs.Panel>
          </Tabs>

          {/* Actions */}
          <Divider my="md" />
          <Group justify="space-between">
            <Button
              onClick={() => {
                if (form.isDirty()) {
                  modals.openConfirmModal({
                    children: 'You have unsaved changes that will be lost.',
                    confirmProps: { color: 'red' },
                    labels: { cancel: 'Keep editing', confirm: 'Discard' },
                    onConfirm: () => {
                      closeDrawer();
                      form.reset();
                    },
                    title: 'Discard changes?',
                  });
                } else {
                  closeDrawer();
                }
              }}
              disabled={isSaving}
              variant="subtle"
            >
              Cancel
            </Button>
            <Group>
              {!isCreating && (
                <Tooltip label="Permanently delete this category">
                  <Button
                    c="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={() => {
                      if (selectedCategory) {
                        handleDelete(selectedCategory);
                        closeDrawer();
                      }
                    }}
                    disabled={isSaving}
                    variant="subtle"
                  >
                    Delete
                  </Button>
                </Tooltip>
              )}
              <Button
                leftSection={
                  isSaving ? null : isCreating ? (
                    <IconPlus size={16} />
                  ) : (
                    <IconDeviceFloppy size={16} />
                  )
                }
                loading={isSaving}
                disabled={!form.isValid() || isSaving}
                gradient={{ deg: 45, from: 'blue', to: 'cyan' }}
                type="submit"
                variant={form.isDirty() ? 'gradient' : 'filled'}
              >
                {isCreating ? 'Create Category' : 'Save Changes'}
              </Button>
            </Group>
          </Group>
        </form>

        {/* Floating helper */}
        <Affix position={{ bottom: 20, right: 20 }}>
          <Transition mounted={drawerOpened && form.isDirty()} transition="slide-up">
            {(transitionStyles) => (
              <Indicator c="yellow" processing style={transitionStyles} size={8}>
                <Tooltip label="You have unsaved changes">
                  <ActionIcon c="yellow" size="lg" variant="light">
                    <IconAlertCircle size={20} />
                  </ActionIcon>
                </Tooltip>
              </Indicator>
            )}
          </Transition>
        </Affix>
      </Drawer>
    </>
  );
}
