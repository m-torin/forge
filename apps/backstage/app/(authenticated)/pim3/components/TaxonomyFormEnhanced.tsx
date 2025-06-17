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
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconBox, IconCheck, IconFolder, IconHash, IconTag, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import {
  createTaxonomyAction,
  updateTaxonomyAction,
  getTaxonomyAction,
  getProductsAction,
  getCollectionsAction,
  connectProductToTaxonomiesAction,
  disconnectProductFromTaxonomiesAction,
  connectCollectionToTaxonomiesAction,
  disconnectCollectionFromTaxonomiesAction,
} from '@repo/database/prisma';

import { TaxonomyType, ContentStatus } from '@repo/database/prisma';

interface TaxonomyFormEnhancedProps {
  onClose: () => void;
  onSuccess: () => void;
  opened: boolean;
  taxonomyId?: string | null;
}

export function TaxonomyFormEnhanced({
  onClose,
  onSuccess,
  opened,
  taxonomyId,
}: TaxonomyFormEnhancedProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('basic');

  // Options for selects
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);

  // Current relationships (for editing)
  const [currentProductIds, setCurrentProductIds] = useState<string[]>([]);
  const [currentCollectionIds, setCurrentCollectionIds] = useState<string[]>([]);

  const isEditing = !!taxonomyId;

  const form = useForm({
    initialValues: {
      // Basic information
      name: '',
      slug: '',
      type: 'CATEGORY' as TaxonomyType,
      status: 'DRAFT' as ContentStatus,

      // Content
      copy: '{}',

      // Relationships (many-to-many)
      productIds: [] as string[],
      collectionIds: [] as string[],
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

  // Load options and taxonomy data
  useEffect(() => {
    if (opened) {
      loadOptions();
      if (isEditing && taxonomyId) {
        loadTaxonomy(taxonomyId);
      } else {
        // Reset form for new taxonomy
        form.reset();
        setCurrentProductIds([]);
        setCurrentCollectionIds([]);
      }
    }
  }, [opened, taxonomyId]);

  const loadOptions = async () => {
    try {
      const [productsRes, collectionsRes] = await Promise.all([
        getProductsAction({ limit: 100, page: 1 }),
        getCollectionsAction({ limit: 100 }),
      ]);

      setProducts(productsRes.data || []);
      setCollections(collectionsRes.data || []);
    } catch (error) {
      console.error('Failed to load options:', error);
    }
  };

  const loadTaxonomy = async (id: string) => {
    setLoading(true);
    try {
      const result = await getTaxonomyAction(id);
      if (result && result.success && result.data) {
        const taxonomy = result.data;
        // Get current relationships
        // Note: These would need to be fetched from the actual relationships
        const productIds = (taxonomy as any).products?.map((p: any) => p.id) || [];
        const collectionIds = (taxonomy as any).collections?.map((c: any) => c.id) || [];

        setCurrentProductIds(productIds);
        setCurrentCollectionIds(collectionIds);

        form.setValues({
          name: taxonomy.name,
          slug: taxonomy.slug,
          type: taxonomy.type,
          status: taxonomy.status,
          copy: JSON.stringify(taxonomy.copy || {}, null, 2),
          productIds: productIds,
          collectionIds: collectionIds,
        });
      }
    } catch (error) {
      console.error('Failed to load taxonomy:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load taxonomy data',
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
        copy: JSON.parse(values.copy),
      };

      let taxonomyResult;
      if (isEditing && taxonomyId) {
        taxonomyResult = await updateTaxonomyAction(taxonomyId, data);
      } else {
        taxonomyResult = await createTaxonomyAction(data);
      }

      if (taxonomyResult.success && taxonomyResult.data) {
        const finalTaxonomyId = taxonomyResult.data.id;

        // Handle product relationships
        if (isEditing) {
          // Calculate differences
          const productsToConnect = values.productIds.filter(
            (id) => !currentProductIds.includes(id),
          );
          const productsToDisconnect = currentProductIds.filter(
            (id) => !values.productIds.includes(id),
          );

          // Connect new products
          for (const productId of productsToConnect) {
            await connectProductToTaxonomiesAction(productId, [finalTaxonomyId]);
          }

          // Disconnect removed products
          for (const productId of productsToDisconnect) {
            await disconnectProductFromTaxonomiesAction(productId, [finalTaxonomyId]);
          }

          // Handle collection relationships similarly
          const collectionsToConnect = values.collectionIds.filter(
            (id) => !currentCollectionIds.includes(id),
          );
          const collectionsToDisconnect = currentCollectionIds.filter(
            (id) => !values.collectionIds.includes(id),
          );

          for (const collectionId of collectionsToConnect) {
            await connectCollectionToTaxonomiesAction(collectionId, [finalTaxonomyId]);
          }

          for (const collectionId of collectionsToDisconnect) {
            await disconnectCollectionFromTaxonomiesAction(collectionId, [finalTaxonomyId]);
          }
        } else {
          // For new taxonomies, connect all selected items
          for (const productId of values.productIds) {
            await connectProductToTaxonomiesAction(productId, [finalTaxonomyId]);
          }

          for (const collectionId of values.collectionIds) {
            await connectCollectionToTaxonomiesAction(collectionId, [finalTaxonomyId]);
          }
        }

        notifications.show({
          title: 'Success',
          message: `Taxonomy ${isEditing ? 'updated' : 'created'} successfully`,
          color: 'green',
          icon: <IconCheck />,
        });
        onSuccess();
        form.reset();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || `Failed to ${isEditing ? 'update' : 'create'} taxonomy`,
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
          <IconTag size={24} />
          <Title order={3}>{isEditing ? 'Edit Taxonomy' : 'Create Taxonomy'}</Title>
        </Group>
      }
    >
      <LoadingOverlay visible={loading} />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="basic" leftSection={<IconTag size={16} />}>
              Basic Info
            </Tabs.Tab>
            <Tabs.Tab value="products" leftSection={<IconBox size={16} />}>
              Products
            </Tabs.Tab>
            <Tabs.Tab value="collections" leftSection={<IconFolder size={16} />}>
              Collections
            </Tabs.Tab>
            <Tabs.Tab value="content" leftSection={<IconHash size={16} />}>
              Content
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pt="xs">
            <Stack>
              <TextInput
                label="Taxonomy Name"
                placeholder="Enter taxonomy name"
                required
                {...form.getInputProps('name')}
              />

              <Group grow align="flex-end">
                <TextInput
                  label="Slug"
                  placeholder="taxonomy-slug"
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
                    { value: 'CATEGORY', label: 'Category' },
                    { value: 'TAG', label: 'Tag' },
                    { value: 'ATTRIBUTE', label: 'Attribute' },
                    { value: 'CLASSIFICATION', label: 'Classification' },
                    { value: 'DEPARTMENT', label: 'Department' },
                    { value: 'BRAND_FAMILY', label: 'Brand Family' },
                    { value: 'PRODUCT_LINE', label: 'Product Line' },
                    { value: 'OCCASION', label: 'Occasion' },
                    { value: 'SEASON', label: 'Season' },
                    { value: 'STYLE', label: 'Style' },
                    { value: 'MATERIAL', label: 'Material' },
                    { value: 'COLOR', label: 'Color' },
                    { value: 'SIZE', label: 'Size' },
                    { value: 'FEATURE', label: 'Feature' },
                    { value: 'TARGET_AUDIENCE', label: 'Target Audience' },
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
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="products" pt="xs">
            <Stack>
              <Text size="sm" c="dimmed">
                Associate products with this taxonomy
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

          <Tabs.Panel value="collections" pt="xs">
            <Stack>
              <Text size="sm" c="dimmed">
                Associate collections with this taxonomy
              </Text>
              <MultiSelect
                label="Collections"
                placeholder="Select collections"
                data={collections.map((c) => ({
                  value: c.id,
                  label: `${c.name} (${c.type})`,
                }))}
                searchable
                clearable
                {...form.getInputProps('collectionIds')}
              />
              <Text size="xs" c="dimmed">
                Selected: {form.values.collectionIds.length} collections
              </Text>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="content" pt="xs">
            <Stack>
              <JsonInput
                label="Taxonomy Content (JSON)"
                placeholder="Enter taxonomy content as JSON"
                description="Store additional content like descriptions, metadata, SEO information, etc."
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
            {isEditing ? 'Updating' : 'Creating'} {form.values.type.toLowerCase().replace('_', ' ')}{' '}
            taxonomy
          </Text>
          <Group>
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {isEditing ? 'Update Taxonomy' : 'Create Taxonomy'}
            </Button>
          </Group>
        </Group>
      </form>
    </Modal>
  );
}
