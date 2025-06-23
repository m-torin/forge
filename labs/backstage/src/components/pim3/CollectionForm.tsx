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
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconBox,
  IconBrandTailwind,
  IconCheck,
  IconDeviceFloppy,
  IconFolder,
  IconHash,
  IconHierarchy,
  IconRefresh,
  IconTag,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { usePimForm } from '@/hooks/pim3/usePimForm';
import { useCollectionValidation } from '@/hooks/pim3/useAsyncValidation';
import { useFormDataLoading } from '@/hooks/pim3/useFormLoading';
import {
  createCollectionWithRelationshipsAction,
  updateCollectionWithRelationshipsAction,
  getCollectionRelationshipsAction,
  findUniqueCollectionAction,
  findManyProductsAction,
  getTaxonomiesAction,
  getBrandsAction,
  getCategoriesAction,
  getCollectionsAction,
  ContentStatus,
  CollectionType,
} from '@repo/database/prisma';

// Enhanced collection schema with comprehensive validation
const collectionFormSchema = z
  .object({
    // Basic identification
    name: z.string().min(1, 'Collection name is required').max(255, 'Name too long'),
    slug: z
      .string()
      .min(1, 'Slug is required')
      .max(100, 'Slug too long')
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    type: z.nativeEnum(CollectionType).default(CollectionType.OTHER),
    status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),

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

    // User association
    userId: z.string().optional().or(z.literal('')),

    // Relationships
    productIds: z.array(z.string()).default([]),
    brandIds: z.array(z.string()).default([]),
    taxonomyIds: z.array(z.string()).default([]),
    categoryIds: z.array(z.string()).default([]),
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
      message: 'Collection cannot be its own parent',
      path: ['parentId'],
    },
  );

type CollectionFormValues = z.infer<typeof collectionFormSchema>;

interface CollectionFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  opened: boolean;
  collectionId?: string | null;
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export function CollectionForm({ onClose, onSuccess, opened, collectionId }: CollectionFormProps) {
  const [activeTab, setActiveTab] = useState<string | null>('basic');
  const [hierarchyPreview, setHierarchyPreview] = useState<string>('');

  const isEditing = !!collectionId;
  const asyncValidation = useCollectionValidation(collectionId);

  const { options, loading: optionsLoading } = useFormDataLoading({
    products: () => findManyProductsAction({ take: 200 }),
    taxonomies: () => getTaxonomiesAction({ limit: 200 }),
    brands: () => getBrandsAction({ limit: 200 }),
    categories: () => getCategoriesAction({ includeDeleted: false }),
    parentCollections: () =>
      getCollectionsAction({ limit: 200 }).then((res) =>
        (res.data || []).filter((c: any) => c.id !== collectionId),
      ),
  });

  // Auto-save function for drafts
  const autoSaveCollection = async (values: CollectionFormValues) => {
    if (!isEditing) return;

    const transformedValues = (await form.options.transformOnSubmit?.(values)) || values;
    await updateCollectionWithRelationshipsAction({
      where: { id: collectionId! },
      data: transformedValues,
    });
  };

  const form = usePimForm({
    schema: collectionFormSchema,
    initialValues: {
      name: '',
      slug: '',
      type: CollectionType.OTHER,
      status: ContentStatus.DRAFT,
      parentId: '',
      displayOrder: 0,
      copy: '{}',
      description: '',
      userId: '',
      productIds: [],
      brandIds: [],
      taxonomyIds: [],
      categoryIds: [],
    },
    asyncValidation: {
      slug: asyncValidation.slug,
      name: asyncValidation.name,
    },
    autoSave: {
      enabled: isEditing,
      delay: 3000,
      onSave: autoSaveCollection,
    },
    crossFieldValidation: [
      {
        fields: ['type', 'parentId'],
        validator: ({ type, parentId }) => {
          if (type === 'BUNDLE' && !parentId) {
            return 'Bundle collections should have a parent collection';
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
      },
      parentId: (parentId, allValues) => {
        // Generate hierarchy preview
        if (parentId && options.parentCollections) {
          const parent = options.parentCollections.find((c: any) => c.id === parentId);
          if (parent && allValues.name) {
            setHierarchyPreview(`${parent.name} > ${allValues.name}`);
          }
        } else if (allValues.name) {
          setHierarchyPreview(allValues.name);
        } else {
          setHierarchyPreview('');
        }
      },
    },
    persistence: {
      key: `collection-form-${collectionId || 'new'}`,
      enabled: true,
      ttl: 2 * 60 * 60 * 1000, // 2 hours
    },
    transformOnSubmit: async (values) => {
      return {
        ...values,
        parentId: values.parentId || undefined,
        userId: values.userId || undefined,
        copy: JSON.parse(values.copy),
      };
    },
    dirtyTracking: true,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  // Load collection data when editing
  useEffect(() => {
    if (opened && isEditing && collectionId) {
      loadCollectionData(collectionId);
    }
  }, [opened, isEditing, collectionId]);

  const loadCollectionData = async (id: string) => {
    try {
      const [collection, relationships] = await Promise.all([
        findUniqueCollectionAction({ where: { id } }),
        getCollectionRelationshipsAction({ collectionId: id }),
      ]);

      if (collection) {
        form.setValues({
          name: collection.name,
          slug: collection.slug,
          type: collection.type,
          status: collection.status,
          parentId: collection.parentId || '',
          displayOrder: collection.displayOrder || 0,
          copy: JSON.stringify(collection.copy || {}, null, 2),
          description: collection.description || '',
          userId: collection.userId || '',
          productIds: relationships?.products?.map((p: any) => p.id) || [],
          brandIds: relationships?.brands?.map((b: any) => b.id) || [],
          taxonomyIds: relationships?.taxonomies?.map((t: any) => t.id) || [],
          categoryIds: relationships?.categories?.map((c: any) => c.id) || [],
        });
      }
    } catch (error) {
      console.error('Failed to load collection:', error);
    }
  };

  const handleSubmit = form.handleSubmit(async (values: CollectionFormValues) => {
    const action = isEditing
      ? updateCollectionWithRelationshipsAction
      : createCollectionWithRelationshipsAction;
    const payload = isEditing ? { where: { id: collectionId! }, data: values } : { data: values };

    return action(payload);
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <Group>
          <IconFolder size={24} />
          <Title order={3}>{isEditing ? 'Edit Collection' : 'Create Collection'}</Title>
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
            <Tabs.Tab value="basic" leftSection={<IconFolder size={16} />}>
              Basic Info
            </Tabs.Tab>
            <Tabs.Tab value="hierarchy" leftSection={<IconHierarchy size={16} />}>
              Hierarchy
            </Tabs.Tab>
            <Tabs.Tab value="products" leftSection={<IconBox size={16} />}>
              Products ({form.values.productIds.length})
            </Tabs.Tab>
            <Tabs.Tab value="taxonomies" leftSection={<IconTag size={16} />}>
              Taxonomies ({form.values.taxonomyIds.length})
            </Tabs.Tab>
            <Tabs.Tab value="brands" leftSection={<IconBrandTailwind size={16} />}>
              Brands & Categories
            </Tabs.Tab>
            <Tabs.Tab value="content" leftSection={<IconHash size={16} />}>
              Content & Metadata
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Basic Information</Title>

                  <TextInput
                    label="Collection Name"
                    placeholder="Enter collection name"
                    required
                    description="Name will auto-generate slug if slug is empty"
                    {...form.getInputProps('name')}
                  />

                  <Group grow align="flex-end">
                    <TextInput
                      label="Slug"
                      placeholder="collection-slug"
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

                  <Textarea
                    label="Description"
                    placeholder="Collection description"
                    description="Brief description of the collection"
                    minRows={2}
                    maxRows={4}
                    {...form.getInputProps('description')}
                  />
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Collection Settings</Title>

                  <Group grow>
                    <Select
                      label="Type"
                      required
                      description="Collection categorization"
                      data={[
                        { value: 'FEATURED', label: 'Featured' },
                        { value: 'SEASONAL', label: 'Seasonal' },
                        { value: 'THEMATIC', label: 'Thematic' },
                        { value: 'PRODUCT_LINE', label: 'Product Line' },
                        { value: 'BRAND_LINE', label: 'Brand Line' },
                        { value: 'PROMOTIONAL', label: 'Promotional' },
                        { value: 'CURATED', label: 'Curated' },
                        { value: 'TRENDING', label: 'Trending' },
                        { value: 'NEW_ARRIVALS', label: 'New Arrivals' },
                        { value: 'BEST_SELLERS', label: 'Best Sellers' },
                        { value: 'CLEARANCE', label: 'Clearance' },
                        { value: 'LIMITED_EDITION', label: 'Limited Edition' },
                        { value: 'COLLABORATION', label: 'Collaboration' },
                        { value: 'EXCLUSIVE', label: 'Exclusive' },
                        { value: 'BUNDLE', label: 'Bundle' },
                        { value: 'SET', label: 'Set' },
                        { value: 'OTHER', label: 'Other' },
                      ]}
                      {...form.getInputProps('type')}
                    />

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
                  </Group>

                  <NumberInput
                    label="Display Order"
                    placeholder="0"
                    description="Order for sorting collections"
                    min={0}
                    {...form.getInputProps('displayOrder')}
                  />

                  <Select
                    label="User Assignment"
                    placeholder="Assign to user (optional)"
                    description="Associate collection with a specific user"
                    data={
                      options.users?.map((u: any) => ({
                        value: u.id,
                        label: u.name || u.email,
                      })) || []
                    }
                    searchable
                    clearable
                    {...form.getInputProps('userId')}
                  />
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="hierarchy" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Collection Hierarchy</Title>
                  <Text size="sm" c="dimmed">
                    Organize collections in a hierarchical structure
                  </Text>

                  <Select
                    label="Parent Collection"
                    placeholder="Select parent collection (optional)"
                    description="Choose a parent to create a hierarchy"
                    data={
                      options.parentCollections?.map((c: any) => ({
                        value: c.id,
                        label: `${c.name} (${c.type})`,
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
                        <Text size="sm" ff="mono">
                          {hierarchyPreview}
                        </Text>
                        <Badge size="sm" color="blue">
                          Hierarchy Preview
                        </Badge>
                      </Group>
                    </Card>
                  )}

                  {form.values.type === 'BUNDLE' && !form.values.parentId && (
                    <Alert icon={<IconAlertTriangle size={16} />} color="yellow">
                      Bundle collections typically should have a parent collection
                    </Alert>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="products" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Group justify="space-between">
                    <Title order={5}>Product Association</Title>
                    <Badge color="blue" size="sm">
                      {form.values.productIds.length} selected
                    </Badge>
                  </Group>

                  <Text size="sm" c="dimmed">
                    Select products to include in this collection. Products will be automatically
                    linked when the collection is saved.
                  </Text>

                  <MultiSelect
                    label="Products"
                    placeholder="Search and select products by name or SKU"
                    description="Type to search through available products"
                    data={
                      options.products?.map((p: any) => ({
                        value: p.id,
                        label: `${p.name} (${p.sku}) - ${p.status}`,
                        group: p.status,
                      })) || []
                    }
                    searchable
                    clearable
                    limit={50}
                    maxDropdownHeight={300}
                    {...form.getInputProps('productIds')}
                  />

                  <Group>
                    <Text size="xs" c="dimmed">
                      Selected: {form.values.productIds.length} products
                    </Text>
                    {form.values.productIds.length > 0 && (
                      <Button
                        variant="light"
                        size="xs"
                        color="red"
                        leftSection={<IconTrash size={12} />}
                        onClick={() => form.setFieldValue('productIds', [])}
                      >
                        Clear All
                      </Button>
                    )}
                  </Group>
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="taxonomies" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Group justify="space-between">
                    <Title order={5}>Taxonomy Association</Title>
                    <Badge color="green" size="sm">
                      {form.values.taxonomyIds.length} selected
                    </Badge>
                  </Group>

                  <Text size="sm" c="dimmed">
                    Associate taxonomies with this collection for better categorization and
                    filtering.
                  </Text>

                  <MultiSelect
                    label="Taxonomies"
                    placeholder="Select taxonomies by type and name"
                    description="Choose relevant taxonomies for this collection"
                    data={
                      options.taxonomies?.map((t: any) => ({
                        value: t.id,
                        label: `${t.name} - ${t.type}`,
                        group: t.type,
                      })) || []
                    }
                    searchable
                    clearable
                    maxDropdownHeight={300}
                    {...form.getInputProps('taxonomyIds')}
                  />

                  <Group>
                    <Text size="xs" c="dimmed">
                      Selected: {form.values.taxonomyIds.length} taxonomies
                    </Text>
                    {form.values.taxonomyIds.length > 0 && (
                      <Button
                        variant="light"
                        size="xs"
                        color="red"
                        leftSection={<IconTrash size={12} />}
                        onClick={() => form.setFieldValue('taxonomyIds', [])}
                      >
                        Clear All
                      </Button>
                    )}
                  </Group>
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="brands" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Group justify="space-between">
                    <Title order={5}>Brand Association</Title>
                    <Badge color="orange" size="sm">
                      {form.values.brandIds.length} selected
                    </Badge>
                  </Group>

                  <Text size="sm" c="dimmed">
                    Associate brands with this collection to organize by brand relationships.
                  </Text>

                  <MultiSelect
                    label="Brands"
                    placeholder="Select brands by name and type"
                    description="Choose brands relevant to this collection"
                    data={
                      options.brands?.map((b: any) => ({
                        value: b.id,
                        label: `${b.name} (${b.type})`,
                        group: b.type,
                      })) || []
                    }
                    searchable
                    clearable
                    maxDropdownHeight={250}
                    {...form.getInputProps('brandIds')}
                  />

                  <Group>
                    <Text size="xs" c="dimmed">
                      Selected: {form.values.brandIds.length} brands
                    </Text>
                    {form.values.brandIds.length > 0 && (
                      <Button
                        variant="light"
                        size="xs"
                        color="red"
                        leftSection={<IconTrash size={12} />}
                        onClick={() => form.setFieldValue('brandIds', [])}
                      >
                        Clear All
                      </Button>
                    )}
                  </Group>
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Group justify="space-between">
                    <Title order={5}>Category Association</Title>
                    <Badge color="purple" size="sm">
                      {form.values.categoryIds.length} selected
                    </Badge>
                  </Group>

                  <Text size="sm" c="dimmed">
                    Associate product categories with this collection for organizational purposes.
                  </Text>

                  <MultiSelect
                    label="Categories"
                    placeholder="Select product categories"
                    description="Choose categories that relate to this collection"
                    data={
                      options.categories?.map((c: any) => ({
                        value: c.id,
                        label: c.name,
                        group: c.status,
                      })) || []
                    }
                    searchable
                    clearable
                    maxDropdownHeight={250}
                    {...form.getInputProps('categoryIds')}
                  />

                  <Group>
                    <Text size="xs" c="dimmed">
                      Selected: {form.values.categoryIds.length} categories
                    </Text>
                    {form.values.categoryIds.length > 0 && (
                      <Button
                        variant="light"
                        size="xs"
                        color="red"
                        leftSection={<IconTrash size={12} />}
                        onClick={() => form.setFieldValue('categoryIds', [])}
                      >
                        Clear All
                      </Button>
                    )}
                  </Group>
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="content" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Collection Content & Metadata</Title>
                  <Text size="sm" c="dimmed">
                    Store additional content, descriptions, metadata, and configuration for this
                    collection.
                  </Text>

                  <JsonInput
                    label="Collection Content (JSON)"
                    placeholder='{\n  "description": "Collection description",\n  "metadata": {\n    "featured": true,\n    "priority": 1\n  }\n}'
                    description="Store structured content as JSON (descriptions, metadata, configuration, etc.)"
                    formatOnBlur
                    autosize
                    minRows={8}
                    maxRows={20}
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
                              metadata: {
                                type: form.values.type,
                                status: form.values.status,
                                createdAt: new Date().toISOString(),
                              },
                            },
                            null,
                            2,
                          ),
                        )
                      }
                    >
                      Generate Template
                    </Button>
                    <Button
                      variant="light"
                      size="sm"
                      color="red"
                      onClick={() => form.setFieldValue('copy', '{}')}
                    >
                      Reset to Empty
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
              {isEditing ? 'Updating collection' : 'Creating new collection'}
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
                  return; // User cancelled
                }
                onClose();
              }}
            >
              Cancel
            </Button>

            <Button type="submit" loading={form.isSubmitting} leftSection={<IconCheck size={16} />}>
              {isEditing ? 'Update Collection' : 'Create Collection'}
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

        {/* Show server errors */}
        {Object.keys(form.serverErrors).length > 0 && (
          <Alert icon={<IconX size={16} />} color="red" mt="md">
            <Text size="sm" fw={500}>
              Server validation errors:
            </Text>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1rem' }}>
              {Object.entries(form.serverErrors).map(([field, error]) => (
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
