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
  NumberInput,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconBrandTailwind,
  IconCheck,
  IconFolder,
  IconHash,
  IconLink,
  IconBox,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import {
  createBrandAction,
  updateBrandAction,
  getBrandAction,
  getBrandsAction,
  getProductsAction,
  getCollectionsAction,
  createProductBrandAssociationAction,
  removeProductBrandAssociationAction,
} from '@repo/database/prisma';

import { BrandType, ContentStatus } from '@repo/database/prisma';

interface BrandFormEnhancedProps {
  onClose: () => void;
  onSuccess: () => void;
  opened: boolean;
  brandId?: string | null;
}

export function BrandFormEnhanced({ onClose, onSuccess, opened, brandId }: BrandFormEnhancedProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('basic');

  // Options for selects
  const [parentBrands, setParentBrands] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);

  // Current relationships (for editing)
  const [currentProductIds, setCurrentProductIds] = useState<string[]>([]);

  const isEditing = !!brandId;

  const form = useForm({
    initialValues: {
      // Basic information
      name: '',
      slug: '',
      type: 'OTHER' as BrandType,
      status: 'DRAFT' as ContentStatus,
      baseUrl: '',
      parentId: '',
      displayOrder: 0,

      // Content
      copy: '{}',

      // Relationships
      productIds: [] as string[], // Products sold by this brand
      collectionIds: [] as string[], // Collections associated with this brand
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
      baseUrl: (value) => {
        if (value && value.trim()) {
          try {
            new URL(value);
            return null;
          } catch {
            return 'Invalid URL';
          }
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

  // Load options and brand data
  useEffect(() => {
    if (opened) {
      loadOptions();
      if (isEditing && brandId) {
        loadBrand(brandId);
      } else {
        form.reset();
        setCurrentProductIds([]);
      }
    }
  }, [opened, brandId]);

  const loadOptions = async () => {
    try {
      const [brandsRes, productsRes, collectionsRes] = await Promise.all([
        getBrandsAction({ limit: 100 }),
        getProductsAction({ limit: 100, page: 1 }),
        getCollectionsAction({ limit: 100 }),
      ]);

      // Filter out current brand from parent options
      const parentOptions = (brandsRes.data || []).filter((b: any) => b.id !== brandId);
      setParentBrands(parentOptions);
      setProducts(productsRes.data || []);
      setCollections(collectionsRes.data || []);
    } catch (error) {
      console.error('Failed to load options:', error);
    }
  };

  const loadBrand = async (id: string) => {
    setLoading(true);
    try {
      const brand = await getBrandAction(id);
      if (brand) {
        // Get products sold by this brand
        // Note: This would need to be fetched from PdpJoin relationships
        const productIds = (brand as unknown as any).products?.map((p: any) => p.productId) || [];
        setCurrentProductIds(productIds);

        form.setValues({
          name: brand.name,
          slug: brand.slug,
          type: brand.type,
          status: brand.status,
          baseUrl: brand.baseUrl || '',
          parentId: brand.parentId || '',
          displayOrder: brand.displayOrder || 0,
          copy: JSON.stringify(brand.copy || {}, null, 2),
          productIds: productIds,
          collectionIds: (brand as unknown as any).collections?.map((c: any) => c.id) || [],
        });
      }
    } catch (error) {
      console.error('Failed to load brand:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load brand data',
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
        baseUrl: values.baseUrl || null,
        parentId: values.parentId || null,
        displayOrder: values.displayOrder,
        copy: JSON.parse(values.copy),
      };

      let brandResult;
      if (isEditing && brandId) {
        brandResult = await updateBrandAction(brandId, data);

        // Handle product relationships
        const productsToConnect = values.productIds.filter((id) => !currentProductIds.includes(id));
        const productsToDisconnect = currentProductIds.filter(
          (id) => !values.productIds.includes(id),
        );

        // Connect new products
        for (const productId of productsToConnect) {
          await createProductBrandAssociationAction(productId, brandId);
        }

        // Disconnect removed products
        for (const productId of productsToDisconnect) {
          await removeProductBrandAssociationAction(productId, brandId);
        }
      } else {
        brandResult = await createBrandAction(data);

        // Connect products to new brand
        if (brandResult && values.productIds.length > 0) {
          for (const productId of values.productIds) {
            await createProductBrandAssociationAction(productId, brandResult.id);
          }
        }
      }

      if (brandResult) {
        notifications.show({
          title: 'Success',
          message: `Brand ${isEditing ? 'updated' : 'created'} successfully`,
          color: 'green',
          icon: <IconCheck />,
        });
        onSuccess();
        form.reset();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || `Failed to ${isEditing ? 'update' : 'create'} brand`,
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
          <IconBrandTailwind size={24} />
          <Title order={3}>{isEditing ? 'Edit Brand' : 'Create Brand'}</Title>
        </Group>
      }
    >
      <LoadingOverlay visible={loading} />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="basic" leftSection={<IconBrandTailwind size={16} />}>
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
                label="Brand Name"
                placeholder="Enter brand name"
                required
                {...form.getInputProps('name')}
              />

              <Group grow align="flex-end">
                <TextInput
                  label="Slug"
                  placeholder="brand-slug"
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
                  label="Brand Type"
                  required
                  data={[
                    { value: 'MANUFACTURER', label: 'Manufacturer' },
                    { value: 'RETAILER', label: 'Retailer' },
                    { value: 'DISTRIBUTOR', label: 'Distributor' },
                    { value: 'WHITE_LABEL', label: 'White Label' },
                    { value: 'PRIVATE_LABEL', label: 'Private Label' },
                    { value: 'MARKETPLACE', label: 'Marketplace' },
                    { value: 'DROPSHIPPER', label: 'Dropshipper' },
                    { value: 'AFFILIATE', label: 'Affiliate' },
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

              <TextInput
                label="Brand Website"
                placeholder="https://brand-website.com"
                leftSection={<IconLink size={16} />}
                description="Base URL for the brand's website"
                {...form.getInputProps('baseUrl')}
              />

              <Group grow>
                <Select
                  label="Parent Brand"
                  placeholder="Select parent brand (optional)"
                  description="For sub-brands or brand families"
                  data={parentBrands.map((b) => ({
                    value: b.id,
                    label: `${b.name} (${b.type})`,
                  }))}
                  searchable
                  clearable
                  {...form.getInputProps('parentId')}
                />

                <NumberInput
                  label="Display Order"
                  placeholder="0"
                  description="Order for sorting brands"
                  min={0}
                  {...form.getInputProps('displayOrder')}
                />
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="products" pt="xs">
            <Stack>
              <Text size="sm" c="dimmed">
                Select products that are sold by this brand
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
                Associate collections with this brand
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
                label="Brand Content (JSON)"
                placeholder="Enter brand content as JSON"
                description="Store additional content like descriptions, policies, contact info, etc."
                formatOnBlur
                autosize
                minRows={6}
                maxRows={15}
                validationError="Invalid JSON"
                {...form.getInputProps('copy')}
              />
              <Text size="xs" c="dimmed">
                Suggested fields: description, about, policies, contact, social, shipping, returns
              </Text>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Divider my="md" />

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {isEditing ? 'Updating' : 'Creating'} {form.values.type.toLowerCase().replace('_', ' ')}{' '}
            brand
          </Text>
          <Group>
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {isEditing ? 'Update Brand' : 'Create Brand'}
            </Button>
          </Group>
        </Group>
      </form>
    </Modal>
  );
}
