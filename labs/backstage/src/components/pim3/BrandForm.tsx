'use client';

import {
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
  Alert,
} from '@mantine/core';
import {
  IconBrandTailwind,
  IconCheck,
  IconDeviceFloppy,
  IconAlertCircle,
  IconRefresh,
  IconLink,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { usePimForm } from '@/hooks/pim3/usePimForm';
import { useBrandValidation } from '@/hooks/pim3/useAsyncValidation';
import { useFormDataLoading } from '@/hooks/pim3/useFormLoading';
import { useFormErrors } from '@/hooks/pim3/useFormErrors';
import {
  createBrandAction,
  updateBrandAction,
  getBrandByIdAction,
  getBrandsAction,
  getProductsAction,
  getCollectionsAction,
  getMediaAction,
} from '@/actions/pim3/actions';
import { BrandType, ContentStatus } from '@repo/database/prisma';

// Brand form schema with validation
const brandFormSchema = z.object({
  name: z.string().min(1, 'Brand name is required').max(255, 'Name too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  type: z.nativeEnum(BrandType).default(BrandType.MANUFACTURER),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.ACTIVE),
  baseUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  parentId: z.string().optional().or(z.literal('')),
  displayOrder: z.number().min(0, 'Display order must be positive').default(0),

  // JSON content
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

  // Relationships
  productIds: z.array(z.string()).default([]),
  collectionIds: z.array(z.string()).default([]),
  mediaIds: z.array(z.string()).default([]),
});

type BrandFormData = z.infer<typeof brandFormSchema>;

interface BrandFormProps {
  onClose: () => void;
  onSuccess: () => void;
  opened: boolean;
  brandId?: string | null;
}

export function BrandForm({ onClose, onSuccess, opened, brandId }: BrandFormProps) {
  const isEditing = !!brandId;

  // Form data loading states
  const { dataStates, isDataLoading, withDataLoading } = useFormDataLoading();

  // Async validation
  const asyncValidation = useBrandValidation(brandId || undefined);

  // Auto-save for draft brands
  const autoSaveBrand = async (values: BrandFormData) => {
    if (isEditing && values.status === 'DRAFT') {
      await updateBrandAction({
        where: { id: brandId },
        data: {
          ...values,
          baseUrl: values.baseUrl || null,
          parentId: values.parentId || null,
          copy: JSON.parse(values.copy),
        },
      });
    }
  };

  // Slug generation from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Form with advanced features
  const form = usePimForm({
    schema: brandFormSchema,
    initialValues: {
      name: '',
      slug: '',
      type: BrandType.MANUFACTURER,
      status: ContentStatus.ACTIVE,
      baseUrl: '',
      parentId: '',
      displayOrder: 0,
      copy: JSON.stringify(
        {
          description: '',
          metaTitle: '',
          metaDescription: '',
          metaKeywords: '',
        },
        null,
        2,
      ),
      productIds: [],
      collectionIds: [],
      mediaIds: [],
    },
    asyncValidation: {
      name: asyncValidation.name,
      slug: asyncValidation.slug,
      parentId: asyncValidation.parentId,
    },
    autoSave: {
      enabled: isEditing,
      delay: 3000,
      onSave: autoSaveBrand,
    },
    transformOnSubmit: async (values) => {
      return {
        ...values,
        baseUrl: values.baseUrl || null,
        parentId: values.parentId || null,
        copy: JSON.parse(values.copy),
      };
    },
    dirtyTracking: true,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  // Error handling
  const errorHandler = useFormErrors(form);

  // Form options data
  const [formData, setFormData] = useState({
    parentBrands: [] as Array<{ value: string; label: string }>,
    products: [] as Array<{ value: string; label: string }>,
    collections: [] as Array<{ value: string; label: string }>,
    media: [] as Array<{ value: string; label: string }>,
  });

  // Auto-generate slug when name changes
  useEffect(() => {
    if (form.values.name && !form.isDirty) {
      const newSlug = generateSlug(form.values.name);
      form.setFieldValue('slug', newSlug);
    }
  }, [form.values.name]);

  // Load form options
  useEffect(() => {
    const loadFormData = withDataLoading('options', async () => {
      const [brands, products, collections, media] = await Promise.all([
        getBrandsAction().then((r) => (r.success ? r.data : [])),
        getProductsAction({ limit: 1000 }).then((r) => (r.success ? r.data : [])),
        getCollectionsAction({ limit: 1000 }).then((r) => (r.success ? r.data : [])),
        getMediaAction({ limit: 1000 }).then((r) => (r.success ? r.data : [])),
      ]);

      setFormData({
        parentBrands: brands
          .filter((b) => b.id !== brandId) // Exclude self from parent options
          .map((b) => ({ value: b.id, label: b.name })),
        products: products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` })),
        collections: collections.map((c) => ({ value: c.id, label: c.name })),
        media: media.map((m) => ({ value: m.id, label: `${m.title || m.filename}` })),
      });
    });

    if (opened) {
      loadFormData();
    }
  }, [opened, brandId, withDataLoading]);

  // Load existing brand data
  useEffect(() => {
    if (isEditing && opened) {
      const loadBrand = withDataLoading('initialData', async () => {
        const result = await getBrandByIdAction(brandId);
        if (result.success && result.data) {
          const brand = result.data;
          form.setValues({
            name: brand.name,
            slug: brand.slug,
            type: brand.type,
            status: brand.status,
            baseUrl: brand.baseUrl || '',
            parentId: brand.parentId || '',
            displayOrder: brand.displayOrder || 0,
            copy: JSON.stringify(brand.copy || {}, null, 2),
            productIds: brand.products?.map((p) => p.productId) || [],
            collectionIds: brand.collections?.map((c) => c.id) || [],
            mediaIds: brand.media?.map((m) => m.id) || [],
          });
          form.markAsSaved();
        }
      });

      loadBrand().catch(errorHandler.handleServerError);
    }
  }, [isEditing, brandId, opened, form, withDataLoading, errorHandler]);

  // Submit handler
  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEditing) {
        const result = await updateBrandAction({
          where: { id: brandId },
          data: values,
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to update brand');
        }

        errorHandler.showSuccess('Brand updated successfully');
      } else {
        const result = await createBrandAction(values);

        if (!result.success) {
          throw new Error(result.error || 'Failed to create brand');
        }

        errorHandler.showSuccess('Brand created successfully');
      }
    } catch (error) {
      errorHandler.handleServerError(error);
      throw error;
    }
  });

  // Handle modal close with unsaved changes warning
  const handleClose = () => {
    if (form.warnUnsavedChanges()) {
      form.reset();
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group>
          <IconBrandTailwind size={20} />
          <Title order={4}>{isEditing ? 'Edit Brand' : 'Create Brand'}</Title>
          {form.isDirty && (
            <Badge color="orange" variant="light">
              Unsaved Changes
            </Badge>
          )}
          {form.isAutoSaving && (
            <Badge color="blue" variant="light">
              <IconDeviceFloppy size={12} />
              Auto-saving...
            </Badge>
          )}
        </Group>
      }
      size="lg"
      overlayProps={{ backgroundOpacity: 0.5 }}
    >
      <LoadingOverlay visible={isDataLoading} />

      {errorHandler.hasNetworkErrors && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          mb="md"
          onClose={errorHandler.clearErrors}
          withCloseButton
        >
          Network error. Please check your connection and try again.
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic">
          <Tabs.List>
            <Tabs.Tab value="basic">Basic Info</Tabs.Tab>
            <Tabs.Tab value="relationships">Relationships</Tabs.Tab>
            <Tabs.Tab value="content">Content</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pt="md">
            <Stack>
              <Group grow>
                <TextInput
                  label="Brand Name"
                  placeholder="Enter brand name"
                  required
                  {...form.getInputProps('name')}
                  onBlur={(e) => {
                    form.validateFieldAsync('name', e.target.value);
                    // Auto-generate slug if it's empty
                    if (!form.values.slug) {
                      form.setFieldValue('slug', generateSlug(e.target.value));
                    }
                  }}
                />
                <TextInput
                  label="Slug"
                  placeholder="brand-slug"
                  required
                  onBlur={(e) => form.validateFieldAsync('slug', e.target.value)}
                  {...form.getInputProps('slug')}
                />
              </Group>

              <Group grow>
                <Select
                  label="Brand Type"
                  data={[
                    { value: 'MANUFACTURER', label: 'Manufacturer' },
                    { value: 'DISTRIBUTOR', label: 'Distributor' },
                    { value: 'RETAILER', label: 'Retailer' },
                    { value: 'PRIVATE_LABEL', label: 'Private Label' },
                  ]}
                  {...form.getInputProps('type')}
                />
                <Select
                  label="Status"
                  data={[
                    { value: 'DRAFT', label: 'Draft' },
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'INACTIVE', label: 'Inactive' },
                    { value: 'ARCHIVED', label: 'Archived' },
                  ]}
                  {...form.getInputProps('status')}
                />
              </Group>

              <Group grow>
                <TextInput
                  label="Website URL"
                  placeholder="https://example.com"
                  leftSection={<IconLink size={16} />}
                  {...form.getInputProps('baseUrl')}
                />
                <NumberInput
                  label="Display Order"
                  placeholder="0"
                  min={0}
                  {...form.getInputProps('displayOrder')}
                />
              </Group>

              <Select
                label="Parent Brand"
                placeholder="Select parent brand (optional)"
                data={formData.parentBrands}
                searchable
                clearable
                onBlur={() => {
                  if (form.values.parentId) {
                    form.validateFieldAsync('parentId', form.values.parentId);
                  }
                }}
                {...form.getInputProps('parentId')}
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="relationships" pt="md">
            <Stack>
              <Card withBorder p="sm">
                <Text size="sm" fw={500} mb="xs">
                  Product Associations
                </Text>
                <Text size="xs" c="dimmed" mb="sm">
                  Select products that belong to this brand. This creates PdpJoin relationships for
                  affiliate tracking.
                </Text>
                <MultiSelect
                  placeholder="Search and select products"
                  data={formData.products}
                  searchable
                  limit={50}
                  {...form.getInputProps('productIds')}
                />
              </Card>

              <Card withBorder p="sm">
                <Text size="sm" fw={500} mb="xs">
                  Collection Associations
                </Text>
                <Text size="xs" c="dimmed" mb="sm">
                  Associate this brand with collections it sponsors or is featured in
                </Text>
                <MultiSelect
                  placeholder="Search and select collections"
                  data={formData.collections}
                  searchable
                  limit={50}
                  {...form.getInputProps('collectionIds')}
                />
              </Card>

              <Card withBorder p="sm">
                <Text size="sm" fw={500} mb="xs">
                  Media Assets
                </Text>
                <Text size="xs" c="dimmed" mb="sm">
                  Associate logos, images, videos and other media with this brand
                </Text>
                <MultiSelect
                  placeholder="Search and select media assets"
                  data={formData.media}
                  searchable
                  limit={50}
                  {...form.getInputProps('mediaIds')}
                />
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="content" pt="md">
            <Stack>
              <Card withBorder p="sm">
                <Text size="sm" fw={500} mb="xs">
                  Brand Content
                </Text>
                <Text size="xs" c="dimmed" mb="sm">
                  Manage brand descriptions, SEO content, and metadata
                </Text>
                <JsonInput
                  label="Content & Metadata"
                  placeholder="Brand content in JSON format"
                  validationError="Invalid JSON format"
                  formatOnBlur
                  autosize
                  minRows={6}
                  description="Include description, metaTitle, metaDescription, metaKeywords"
                  {...form.getInputProps('copy')}
                />
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Divider my="md" />

        <Group justify="space-between">
          <Group>
            {form.isDirty && (
              <Button variant="subtle" leftSection={<IconRefresh size={16} />} onClick={form.reset}>
                Reset Changes
              </Button>
            )}
          </Group>

          <Group>
            <Button variant="subtle" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={form.isSubmitting} leftSection={<IconCheck size={16} />}>
              {isEditing ? 'Update Brand' : 'Create Brand'}
            </Button>
          </Group>
        </Group>
      </form>
    </Modal>
  );
}
