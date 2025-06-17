'use client';

import {
  Button,
  Card,
  Divider,
  Group,
  JsonInput,
  LoadingOverlay,
  Modal,
  MultiSelect,
  Select,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconBox,
  IconBrandTailwind,
  IconCategory,
  IconCheck,
  IconFolder,
  IconHash,
  IconTag,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import {
  createCollectionAction,
  updateCollectionAction,
  getCollectionAction,
  getProductsAction,
  getTaxonomiesAction,
  getBrandsAction,
  getCategoriesAction,
  getCollectionsAction,
} from '@repo/database/prisma';

import { CollectionType, ContentStatus } from '@repo/database/prisma';

interface CollectionFormEnhancedProps {
  onClose: () => void;
  onSuccess: () => void;
  opened: boolean;
  collectionId?: string | null;
}

export function CollectionFormEnhanced({
  onClose,
  onSuccess,
  opened,
  collectionId,
}: CollectionFormEnhancedProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('basic');

  // Options for selects
  const [products, setProducts] = useState<any[]>([]);
  const [taxonomies, setTaxonomies] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [parentCollections, setParentCollections] = useState<any[]>([]);

  const isEditing = !!collectionId;

  const form = useForm({
    initialValues: {
      // Basic information
      name: '',
      slug: '',
      type: 'OTHER' as CollectionType,
      status: 'DRAFT' as ContentStatus,
      parentId: '',

      // Content
      copy: '{}',

      // Relationships (many-to-many)
      productIds: [] as string[],
      taxonomyIds: [] as string[],
      brandIds: [] as string[],
      categoryIds: [] as string[],
    },

    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      slug: (value) => {
        if (!value) return 'Slug is required';
        if (!/^[a-z0-9-]+$/.test(value)) {
          return 'Slug must contain only lowercase letters, numbers, and hyphens';
        }
        return null;
      },
      copy: (value) => {
        try {
          JSON.parse(value);
          return null;
        } catch {
          return 'Copy must be valid JSON';
        }
      },
    },
  });

  // Load options and collection data
  useEffect(() => {
    if (opened) {
      loadOptions();
      if (isEditing && collectionId) {
        loadCollection(collectionId);
      }
    }
  }, [opened, collectionId]);

  const loadOptions = async () => {
    try {
      const [productsRes, taxonomiesRes, brandsRes, categoriesRes, collectionsRes] =
        await Promise.all([
          getProductsAction({ limit: 100, page: 1 }),
          getTaxonomiesAction({ status: 'PUBLISHED' }),
          getBrandsAction({}),
          getCategoriesAction({ includeDeleted: false }),
          getCollectionsAction({ limit: 100 }),
        ]);

      setProducts(productsRes.data || []);
      setTaxonomies(taxonomiesRes.data || []);
      setBrands(brandsRes.data || []);
      setCategories(categoriesRes.data || []);

      // Filter out current collection from parent options
      const parentOptions = (collectionsRes.data || []).filter((c: any) => c.id !== collectionId);
      setParentCollections(parentOptions);
    } catch (error) {
      console.error('Failed to load options:', error);
    }
  };

  const loadCollection = async (id: string) => {
    setLoading(true);
    try {
      const collection = await getCollectionAction(id);
      if (collection) {
        // Note: The current API doesn't return all relationships
        // In a real implementation, you'd need to fetch these separately
        form.setValues({
          name: collection.name,
          slug: collection.slug,
          type: collection.type,
          status: collection.status,
          parentId: collection.parentId || '',
          copy: JSON.stringify(collection.copy || {}, null, 2),

          // These would need to be loaded from the actual relationships
          productIds: [],
          taxonomyIds: [],
          brandIds: [],
          categoryIds: [],
        });
      }
    } catch (error) {
      console.error('Failed to load collection:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load collection data',
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    try {
      const data = {
        name: values.name,
        slug: values.slug,
        type: values.type,
        status: values.status,
        parentId: values.parentId || null,
        copy: JSON.parse(values.copy),

        // Note: The current createCollectionAction doesn't support relationships
        // In a real implementation, you'd need to handle these separately
        // using connect operations after creation
      };

      let result;
      if (isEditing && collectionId) {
        result = await updateCollectionAction(collectionId, data);
      } else {
        result = await createCollectionAction(data);
      }

      if (result) {
        // After creating/updating, we'd need to manage relationships
        // This would require additional API calls to connect products, taxonomies, etc.

        notifications.show({
          title: 'Success',
          message: `Collection ${isEditing ? 'updated' : 'created'} successfully`,
          color: 'green',
          icon: <IconCheck />,
        });
        onSuccess();
        form.reset();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || `Failed to ${isEditing ? 'update' : 'create'} collection`,
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    const slug = form.values.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    form.setFieldValue('slug', slug);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <Group>
          <IconFolder size={24} />
          <Title order={3}>{isEditing ? 'Edit Collection' : 'Create Collection'}</Title>
        </Group>
      }
    >
      <LoadingOverlay visible={loading} />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="basic" leftSection={<IconFolder size={16} />}>
              Basic Info
            </Tabs.Tab>
            <Tabs.Tab value="products" leftSection={<IconBox size={16} />}>
              Products
            </Tabs.Tab>
            <Tabs.Tab value="taxonomies" leftSection={<IconTag size={16} />}>
              Taxonomies
            </Tabs.Tab>
            <Tabs.Tab value="brands" leftSection={<IconBrandTailwind size={16} />}>
              Brands & Categories
            </Tabs.Tab>
            <Tabs.Tab value="content" leftSection={<IconHash size={16} />}>
              Content
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pt="xs">
            <Stack>
              <TextInput
                label="Collection Name"
                placeholder="Enter collection name"
                required
                {...form.getInputProps('name')}
              />

              <Group grow align="flex-end">
                <TextInput
                  label="Slug"
                  placeholder="collection-slug"
                  required
                  description="URL-friendly identifier"
                  {...form.getInputProps('slug')}
                />
                <Button variant="light" onClick={generateSlug}>
                  Generate from name
                </Button>
              </Group>

              <Group grow>
                <Select
                  label="Type"
                  required
                  data={[
                    { value: 'FEATURED', label: 'Featured' },
                    { value: 'SEASONAL', label: 'Seasonal' },
                    { value: 'PROMOTIONAL', label: 'Promotional' },
                    { value: 'BRAND', label: 'Brand Collection' },
                    { value: 'CATEGORY', label: 'Category Collection' },
                    { value: 'CURATED', label: 'Curated' },
                    { value: 'TRENDING', label: 'Trending' },
                    { value: 'NEW_ARRIVALS', label: 'New Arrivals' },
                    { value: 'BEST_SELLERS', label: 'Best Sellers' },
                    { value: 'OTHER', label: 'Other' },
                  ]}
                  {...form.getInputProps('type')}
                />

                <Select
                  label="Status"
                  required
                  data={[
                    { value: 'DRAFT', label: 'Draft' },
                    { value: 'PUBLISHED', label: 'Published' },
                    { value: 'ARCHIVED', label: 'Archived' },
                  ]}
                  {...form.getInputProps('status')}
                />
              </Group>

              <Select
                label="Parent Collection"
                placeholder="Select parent collection (optional)"
                description="Organize collections in a hierarchy"
                data={parentCollections.map((c) => ({
                  value: c.id,
                  label: `${c.name} (${c.type})`,
                }))}
                searchable
                clearable
                {...form.getInputProps('parentId')}
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="products" pt="xs">
            <Stack>
              <Text size="sm" c="dimmed">
                Select products to include in this collection
              </Text>
              <MultiSelect
                label="Products"
                placeholder="Search and select products"
                data={products.map((p: any) => ({
                  value: p.id,
                  label: `${p.name} (${p.sku})`,
                }))}
                searchable
                clearable
                limit={20}
                {...form.getInputProps('productIds')}
              />
              <Text size="xs" c="dimmed">
                Selected: {form.values.productIds.length} products
              </Text>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="taxonomies" pt="xs">
            <Stack>
              <Text size="sm" c="dimmed">
                Associate taxonomies with this collection
              </Text>
              <MultiSelect
                label="Taxonomies"
                placeholder="Select taxonomies"
                data={taxonomies.map((t) => ({
                  value: t.id,
                  label: `${t.name} (${t.type})`,
                }))}
                searchable
                clearable
                {...form.getInputProps('taxonomyIds')}
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="brands" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Brands</Title>
                  <Text size="sm" c="dimmed">
                    Associate brands with this collection
                  </Text>
                  <MultiSelect
                    placeholder="Select brands"
                    data={brands.map((b) => ({
                      value: b.id,
                      label: `${b.name} (${b.type})`,
                    }))}
                    searchable
                    clearable
                    {...form.getInputProps('brandIds')}
                  />
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Categories</Title>
                  <Text size="sm" c="dimmed">
                    Associate categories with this collection
                  </Text>
                  <MultiSelect
                    placeholder="Select categories"
                    data={categories.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                    searchable
                    clearable
                    {...form.getInputProps('categoryIds')}
                  />
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="content" pt="xs">
            <Stack>
              <JsonInput
                label="Collection Content (JSON)"
                placeholder="Enter collection content as JSON"
                description="Store additional content like descriptions, metadata, etc."
                formatOnBlur
                autosize
                minRows={6}
                maxRows={15}
                validationError="Invalid JSON"
                {...form.getInputProps('copy')}
              />
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Divider my="md" />

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {isEditing ? 'Updating collection' : 'Creating new collection'}
          </Text>
          <Group>
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {isEditing ? 'Update Collection' : 'Create Collection'}
            </Button>
          </Group>
        </Group>
      </form>
    </Modal>
  );
}
