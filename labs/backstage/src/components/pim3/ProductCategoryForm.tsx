'use client';

import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  JsonInput,
  LoadingOverlay,
  Modal,
  MultiSelect,
  NumberInput,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
  Tree,
  TreeNodeData,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconCategory,
  IconCheck,
  IconDeviceFloppy,
  IconFolder,
  IconHierarchy,
  IconRefresh,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { usePimForm } from '@/hooks/pim3/usePimForm';
import { useProductCategoryValidation } from '@/hooks/pim3/useAsyncValidation';
import { useFormDataLoading } from '@/hooks/pim3/useFormLoading';
import {
  createProductCategoryAction,
  updateProductCategoryAction,
  getProductCategoryAction,
  getCategoriesAction,
  getProductCategoryRelationshipsAction,
  ContentStatus,
} from '@repo/database/prisma';

// Enhanced category schema with hierarchical validation
const categoryFormSchema = z
  .object({
    // Basic identification
    name: z.string().min(1, 'Category name is required').max(255, 'Name too long'),
    slug: z
      .string()
      .min(1, 'Slug is required')
      .max(100, 'Slug too long')
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    status: z.nativeEnum(ContentStatus).default(ContentStatus.PUBLISHED),

    // Hierarchy
    parentId: z.string().optional().or(z.literal('')),
    displayOrder: z.number().min(0).default(0),

    // Content
    copy: z
      .string()
      .refine((val) => {
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      }, 'Must be valid JSON')
      .default('{}'),
    description: z.string().optional(),

    // SEO
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.array(z.string()).default([]),
  })
  .refine(
    (data) => {
      // Hierarchical validation: prevent self-reference
      if (data.parentId === data.slug) {
        return false;
      }
      return true;
    },
    {
      message: 'Category cannot be its own parent',
      path: ['parentId'],
    },
  );

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface ProductCategoryFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  opened: boolean;
  categoryId?: string | null;
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Build tree structure for category hierarchy
const buildCategoryTree = (categories: any[], parentId: string | null = null): TreeNodeData[] => {
  return categories
    .filter((cat) => cat.parentId === parentId)
    .map((cat) => ({
      value: cat.id,
      label: `${cat.name} (${cat.status})`,
      children: buildCategoryTree(categories, cat.id),
    }));
};

export function ProductCategoryForm({
  onClose,
  onSuccess,
  opened,
  categoryId,
}: ProductCategoryFormProps) {
  const [activeTab, setActiveTab] = useState<string | null>('basic');
  const [hierarchyPreview, setHierarchyPreview] = useState<string>('');
  const [categoryPath, setCategoryPath] = useState<string[]>([]);

  const isEditing = !!categoryId;
  const asyncValidation = useProductCategoryValidation(categoryId);

  const { options, loading: optionsLoading } = useFormDataLoading({
    parentCategories: () =>
      getCategoriesAction({ includeDeleted: false }).then((res) =>
        (res.data || []).filter((c: any) => c.id !== categoryId),
      ),
    allCategories: () => getCategoriesAction({ includeDeleted: false }),
  });

  // Auto-save function for drafts
  const autoSaveCategory = async (values: CategoryFormValues) => {
    if (!isEditing) return;

    const transformedValues = (await form.options.transformOnSubmit?.(values)) || values;
    await updateProductCategoryAction({
      where: { id: categoryId! },
      data: transformedValues,
    });
  };

  const form = usePimForm({
    schema: categoryFormSchema,
    initialValues: {
      name: '',
      slug: '',
      status: ContentStatus.PUBLISHED,
      parentId: '',
      displayOrder: 0,
      copy: '{}',
      description: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: [],
    },
    asyncValidation: {
      slug: asyncValidation.slug,
      name: asyncValidation.name,
    },
    autoSave: {
      enabled: isEditing,
      delay: 3000,
      onSave: autoSaveCategory,
    },
    crossFieldValidation: [
      {
        fields: ['parentId'],
        validator: ({ parentId }) => {
          // Prevent circular references
          if (parentId && categoryId) {
            const isCircular = checkCircularReference(parentId, categoryId, options.allCategories);
            if (isCircular) {
              return 'This would create a circular reference';
            }
          }
          return null;
        },
        errorField: 'parentId',
      },
    ],
    watchers: {
      name: (name) => {
        if (name && !form.values.slug) {
          form.setFieldValue('slug', generateSlug(name));
        }
        // Auto-generate meta title if empty
        if (name && !form.values.metaTitle) {
          form.setFieldValue('metaTitle', name);
        }
      },
      parentId: (parentId, allValues) => {
        // Generate hierarchy preview and path
        if (parentId && options.parentCategories) {
          const path = buildCategoryPath(parentId, options.allCategories || []);
          setCategoryPath(path);

          if (allValues.name) {
            setHierarchyPreview([...path, allValues.name].join(' > '));
          }
        } else if (allValues.name) {
          setCategoryPath([]);
          setHierarchyPreview(allValues.name);
        } else {
          setCategoryPath([]);
          setHierarchyPreview('');
        }
      },
    },
    persistence: {
      key: `category-form-${categoryId || 'new'}`,
      enabled: true,
      ttl: 2 * 60 * 60 * 1000, // 2 hours
    },
    transformOnSubmit: async (values) => {
      return {
        ...values,
        parentId: values.parentId || undefined,
        copy: JSON.parse(values.copy),
      };
    },
    dirtyTracking: true,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  // Load category data when editing
  useEffect(() => {
    if (opened && isEditing && categoryId) {
      loadCategoryData(categoryId);
    }
  }, [opened, isEditing, categoryId]);

  const loadCategoryData = async (id: string) => {
    try {
      const [category, relationships] = await Promise.all([
        getProductCategoryAction({ categoryId: id }),
        getProductCategoryRelationshipsAction({ categoryId: id }),
      ]);

      if (category) {
        const copyData = (category.copy as any) || {};
        form.setValues({
          name: category.name,
          slug: category.slug,
          status: category.status,
          parentId: category.parentId || '',
          displayOrder: category.displayOrder || 0,
          copy: JSON.stringify(category.copy || {}, null, 2),
          description: copyData.description || '',
          metaTitle: copyData.metaTitle || '',
          metaDescription: copyData.metaDescription || '',
          metaKeywords: copyData.metaKeywords || [],
        });
      }
    } catch (error) {
      console.error('Failed to load category:', error);
    }
  };

  const handleSubmit = form.handleSubmit(async (values: CategoryFormValues) => {
    const action = isEditing ? updateProductCategoryAction : createProductCategoryAction;
    const payload = isEditing ? { where: { id: categoryId! }, data: values } : { data: values };

    return action(payload);
  });

  // Helper functions
  const checkCircularReference = (
    parentId: string,
    currentId: string,
    categories: any[],
  ): boolean => {
    const parent = categories.find((c) => c.id === parentId);
    if (!parent) return false;
    if (parent.id === currentId) return true;
    if (parent.parentId) {
      return checkCircularReference(parent.parentId, currentId, categories);
    }
    return false;
  };

  const buildCategoryPath = (categoryId: string, categories: any[]): string[] => {
    const path: string[] = [];
    let current = categories.find((c) => c.id === categoryId);

    while (current) {
      path.unshift(current.name);
      current = current.parentId ? categories.find((c) => c.id === current.parentId) : null;
    }

    return path;
  };

  const categoryTreeData = buildCategoryTree(options.allCategories || []);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <Group>
          <IconCategory size={24} />
          <Title order={3}>{isEditing ? 'Edit Category' : 'Create Category'}</Title>
          {form.isDirty && (
            <Badge color="yellow" size="sm">
              Unsaved Changes
            </Badge>
          )}
          {form.isAutoSaving && (
            <Badge color="blue" size="sm">
              Auto-saving...
            </Badge>
          )}
        </Group>
      }
    >
      <LoadingOverlay visible={form.isSubmitting || optionsLoading} />

      {/* Auto-save status */}
      {isEditing && (
        <Alert icon={<IconDeviceFloppy size={16} />} color="blue" variant="light" mb="md">
          <Group justify="space-between">
            <Text size="sm">Auto-save enabled</Text>
            {form.isDirty ? (
              <Badge color="yellow" size="sm">
                Changes pending
              </Badge>
            ) : (
              <Badge color="green" size="sm">
                Saved
              </Badge>
            )}
          </Group>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="basic" leftSection={<IconCategory size={16} />}>
              Basic Info
            </Tabs.Tab>
            <Tabs.Tab value="hierarchy" leftSection={<IconHierarchy size={16} />}>
              Hierarchy & Structure
            </Tabs.Tab>
            <Tabs.Tab value="seo" leftSection={<IconFolder size={16} />}>
              SEO & Metadata
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Category Information</Title>

                  <TextInput
                    label="Category Name"
                    placeholder="Enter category name"
                    required
                    description="Name will auto-generate slug if slug is empty"
                    {...form.getInputProps('name')}
                  />

                  <Group grow align="flex-end">
                    <TextInput
                      label="Slug"
                      placeholder="category-slug"
                      required
                      description="URL-friendly identifier (auto-generated from name)"
                      {...form.getInputProps('slug')}
                    />
                    <Button
                      variant="light"
                      onClick={() => form.setFieldValue('slug', generateSlug(form.values.name))}
                      disabled={!form.values.name}
                    >
                      <IconRefresh size={16} />
                    </Button>
                  </Group>

                  <TextInput
                    label="Description"
                    placeholder="Brief category description"
                    description="Used for category listings and tooltips"
                    {...form.getInputProps('description')}
                  />
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Category Settings</Title>

                  <Group grow>
                    <Select
                      label="Status"
                      required
                      description="Publication status"
                      data={[
                        { value: 'DRAFT', label: 'Draft' },
                        { value: 'PUBLISHED', label: 'Published' },
                        { value: 'ARCHIVED', label: 'Archived' },
                      ]}
                      {...form.getInputProps('status')}
                    />

                    <NumberInput
                      label="Display Order"
                      placeholder="0"
                      description="Order for sorting categories"
                      min={0}
                      {...form.getInputProps('displayOrder')}
                    />
                  </Group>
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="hierarchy" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Category Hierarchy</Title>
                  <Text size="sm" c="dimmed">
                    Organize categories in a hierarchical structure. Categories can have
                    parent-child relationships.
                  </Text>

                  <Select
                    label="Parent Category"
                    placeholder="Select parent category (optional)"
                    description="Choose a parent to create a hierarchy"
                    data={
                      options.parentCategories?.map((c: any) => ({
                        value: c.id,
                        label: `${c.name} (${c.status})`,
                      })) || []
                    }
                    searchable
                    clearable
                    {...form.getInputProps('parentId')}
                  />

                  {/* Hierarchy preview */}
                  {hierarchyPreview && (
                    <Card withBorder p="sm" bg="blue.0">
                      <Group>
                        <IconHierarchy size={16} />
                        <div>
                          <Text size="sm" fw={500}>
                            Category Path:
                          </Text>
                          <Text size="sm" ff="mono">
                            {hierarchyPreview}
                          </Text>
                        </div>
                        <Badge size="sm" color="blue">
                          Level {categoryPath.length + 1}
                        </Badge>
                      </Group>
                    </Card>
                  )}
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Category Tree View</Title>
                  <Text size="sm" c="dimmed">
                    Visual representation of the entire category hierarchy
                  </Text>

                  {categoryTreeData.length > 0 ? (
                    <Tree data={categoryTreeData} levelOffset={24} expandedState={{}} />
                  ) : (
                    <Alert icon={<IconFolder size={16} />} color="gray">
                      No categories created yet. This will be the first!
                    </Alert>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="seo" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>SEO Metadata</Title>
                  <Text size="sm" c="dimmed">
                    Optimize category pages for search engines
                  </Text>

                  <TextInput
                    label="Meta Title"
                    placeholder="Category title for search results"
                    description="Defaults to category name if left empty"
                    {...form.getInputProps('metaTitle')}
                  />

                  <TextInput
                    label="Meta Description"
                    placeholder="Brief description for search results"
                    description="155-160 characters recommended"
                    {...form.getInputProps('metaDescription')}
                  />

                  <MultiSelect
                    label="Meta Keywords"
                    placeholder="Add keywords"
                    description="Relevant keywords for this category"
                    data={form.values.metaKeywords}
                    searchable
                    creatable
                    clearable
                    {...form.getInputProps('metaKeywords')}
                  />
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Additional Content</Title>

                  <JsonInput
                    label="Category Metadata (JSON)"
                    placeholder='{\n  "icon": "shopping-cart",\n  "color": "#3B82F6",\n  "featured": true\n}'
                    description="Store additional metadata as JSON"
                    formatOnBlur
                    autosize
                    minRows={6}
                    maxRows={15}
                    validationError="Invalid JSON format"
                    {...form.getInputProps('copy')}
                  />

                  <Group>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() =>
                        form.setFieldValue(
                          'copy',
                          JSON.stringify(
                            {
                              description: form.values.description || '',
                              metaTitle: form.values.metaTitle || '',
                              metaDescription: form.values.metaDescription || '',
                              metaKeywords: form.values.metaKeywords || [],
                              icon: '',
                              color: '',
                              featured: false,
                            },
                            null,
                            2,
                          ),
                        )
                      }
                    >
                      Generate Template
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Divider my="md" />

        <Group justify="space-between">
          <Group>
            <Text size="sm" c="dimmed">
              {isEditing ? 'Updating category' : 'Creating new category'}
            </Text>
            {form.isDirty && (
              <Badge color="yellow" size="sm">
                Unsaved changes
              </Badge>
            )}
          </Group>

          <Group>
            <Button
              variant="light"
              onClick={() => {
                if (form.isDirty && !form.warnUnsavedChanges()) {
                  return;
                }
                onClose();
              }}
            >
              Cancel
            </Button>

            <Button type="submit" loading={form.isSubmitting} leftSection={<IconCheck size={16} />}>
              {isEditing ? 'Update Category' : 'Create Category'}
            </Button>
          </Group>
        </Group>

        {/* Show validation errors */}
        {Object.keys(form.errors).length > 0 && (
          <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light" mt="md">
            <Text size="sm" fw={500}>
              Please fix the following errors:
            </Text>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1rem' }}>
              {Object.entries(form.errors).map(([field, error]) => (
                <li key={field}>
                  <Text size="sm">
                    {field}: {error}
                  </Text>
                </li>
              ))}
            </ul>
          </Alert>
        )}
      </form>
    </Modal>
  );
}
