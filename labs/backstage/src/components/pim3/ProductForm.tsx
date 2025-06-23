'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Divider,
  Group,
  JsonInput,
  LoadingOverlay,
  Modal,
  MultiSelect,
  NumberInput,
  Select,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import {
  IconBarcode,
  IconBox,
  IconCategory,
  IconCheck,
  IconFileText,
  IconHash,
  IconPlus,
  IconTrash,
  IconRefresh,
  IconDeviceFloppy,
  IconAlertTriangle,
  IconGripVertical,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { usePimForm } from '@/hooks/pim3/usePimForm';
import { useProductValidation } from '@/hooks/pim3/useAsyncValidation';
import { useFormDataLoading } from '@/hooks/pim3/useFormLoading';
import { useFormErrors } from '@/hooks/pim3/useFormErrors';
import {
  createProductWithRelationshipsAction,
  updateProductWithRelationshipsAction,
  getProductRelationshipsAction,
  getCollectionsAction,
  getTaxonomiesAction,
  getBrandsAction,
  getCategoriesAction,
  getProductAction,
  ProductStatus,
  ProductType,
} from '@repo/database/prisma';

// Enhanced product schema with comprehensive validation
const productFormSchema = z
  .object({
    // Basic identification
    name: z.string().min(1, 'Product name is required').max(255, 'Name too long'),
    sku: z.string().min(1, 'SKU is required').max(100, 'SKU too long'),
    slug: z
      .string()
      .min(1, 'Slug is required')
      .max(100, 'Slug too long')
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    category: z.string().min(1, 'Category is required'),
    status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
    type: z.nativeEnum(ProductType).default(ProductType.PHYSICAL),

    // Pricing
    price: z.number().min(0, 'Price must be positive').optional(),
    currency: z.string().default('USD'),
    variantPrice: z.number().min(0).optional(),
    compareAtPrice: z.number().min(0).optional(),

    // Brand and hierarchy
    brand: z.string().optional(),
    parentId: z.string().optional().or(z.literal('')),
    displayOrder: z.number().min(0).default(0),
    isDefault: z.boolean().default(false),

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
    attributes: z
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
    physicalProperties: z
      .string()
      .refine((val) => {
        if (!val) return true;
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      }, 'Must be valid JSON')
      .optional(),

    // AI metadata
    aiGenerated: z.boolean().default(false),
    aiConfidence: z.number().min(0).max(1).optional(),
    aiSources: z.array(z.string()).default([]),

    // Relationships
    collectionIds: z.array(z.string()).default([]),
    taxonomyIds: z.array(z.string()).default([]),
    brandIds: z.array(z.string()).default([]),
    categoryIds: z.array(z.string()).default([]),
    fandomIds: z.array(z.string()).default([]),
    seriesIds: z.array(z.string()).default([]),
    storyIds: z.array(z.string()).default([]),
    locationIds: z.array(z.string()).default([]),
    castIds: z.array(z.string()).default([]),

    // Dynamic arrays
    identifiers: z
      .array(
        z.object({
          type: z.enum([
            'UPC_A',
            'UPC_E',
            'EAN_13',
            'EAN_8',
            'ISBN_10',
            'ISBN_13',
            'ASIN',
            'TCIN',
            'DPCI',
            'OTHER',
          ]),
          value: z.string().min(1, 'Identifier value is required'),
          isPrimary: z.boolean().default(false),
        }),
      )
      .default([]),

    variants: z
      .array(
        z.object({
          name: z.string().min(1, 'Variant name required'),
          sku: z.string().min(1, 'Variant SKU required'),
          price: z.number().min(0, 'Price must be positive'),
          variantPrice: z.number().min(0).optional(),
          compareAtPrice: z.number().min(0).optional(),
          displayOrder: z.number().min(0).default(0),
          isDefault: z.boolean().default(false),
          attributes: z.record(z.any()).default({}),
        }),
      )
      .default([]),
  })
  .refine(
    (data) => {
      // Cross-field validation: compare price must be higher than price
      if (data.compareAtPrice && data.price && data.compareAtPrice <= data.price) {
        return false;
      }
      return true;
    },
    {
      message: 'Compare price must be higher than regular price',
      path: ['compareAtPrice'],
    },
  )
  .refine(
    (data) => {
      // Variant-specific validation
      if (data.type === 'VARIANT' && !data.parentId) {
        return false;
      }
      return true;
    },
    {
      message: 'Variant products must have a parent product',
      path: ['parentId'],
    },
  );

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  onClose: () => void;
  onSuccess: () => void;
  opened: boolean;
  productId?: string | null;
}

export function ProductForm({ onClose, onSuccess, opened, productId }: ProductFormProps) {
  const isEditing = !!productId;
  const [activeTab, setActiveTab] = useState<string | null>('basic');

  // Form data loading
  const { isDataLoading, withDataLoading } = useFormDataLoading();

  // Async validation
  const asyncValidation = useProductValidation(productId);

  // Auto-save for draft products
  const autoSaveProduct = async (values: ProductFormData) => {
    if (isEditing && values.status === 'DRAFT') {
      await updateProductWithRelationshipsAction(productId!, {
        ...values,
        parentId: values.parentId || undefined,
        copy: JSON.parse(values.copy),
        attributes: JSON.parse(values.attributes),
        physicalProperties: values.physicalProperties
          ? JSON.parse(values.physicalProperties)
          : undefined,
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

  // Enhanced form with comprehensive features
  const form = usePimForm({
    schema: productFormSchema,
    initialValues: {
      name: '',
      sku: '',
      slug: '',
      category: '',
      status: ProductStatus.DRAFT,
      type: ProductType.PHYSICAL,
      price: undefined,
      currency: 'USD',
      variantPrice: undefined,
      compareAtPrice: undefined,
      brand: '',
      parentId: '',
      displayOrder: 0,
      isDefault: false,
      copy: JSON.stringify(
        {
          description: '',
          metaTitle: '',
          metaDescription: '',
          specifications: {},
        },
        null,
        2,
      ),
      attributes: JSON.stringify({}, null, 2),
      physicalProperties: '',
      aiGenerated: false,
      aiConfidence: undefined,
      aiSources: [],
      collectionIds: [],
      taxonomyIds: [],
      brandIds: [],
      categoryIds: [],
      fandomIds: [],
      seriesIds: [],
      storyIds: [],
      locationIds: [],
      castIds: [],
      identifiers: [],
      variants: [],
    },
    asyncValidation: {
      sku: asyncValidation.sku,
      slug: asyncValidation.slug,
      name: asyncValidation.name,
    },
    autoSave: {
      enabled: isEditing,
      delay: 3000,
      onSave: autoSaveProduct,
    },
    crossFieldValidation: [
      {
        fields: ['price', 'compareAtPrice'],
        validator: ({ price, compareAtPrice }) => {
          if (compareAtPrice && price && compareAtPrice <= price) {
            return 'Compare price must be higher than regular price';
          }
          return null;
        },
        errorField: 'compareAtPrice',
      },
      {
        fields: ['type', 'parentId'],
        validator: ({ type, parentId }) => {
          if (type === 'VARIANT' && !parentId) {
            return 'Variant products must have a parent product';
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
      type: (type, allValues) => {
        // Clear incompatible fields when type changes
        if (type !== 'VARIANT' && allValues.parentId) {
          form.setFieldValue('parentId', '');
        }
        if (type === 'PHYSICAL' && allValues.variants.length > 0) {
          form.setFieldValue('variants', []);
        }
      },
    },
    conditionalFields: {
      variantPrice: {
        condition: (values) => values.type === 'VARIANT',
      },
      compareAtPrice: {
        condition: (values) => values.status === 'ACTIVE',
      },
      parentId: {
        condition: (values) => values.type === 'VARIANT',
      },
      variants: {
        condition: (values) => values.type === 'BUNDLE' || values.type === 'VARIANT',
      },
      physicalProperties: {
        condition: (values) => values.type === 'PHYSICAL',
      },
    },
    persistence: {
      key: `product-form-${productId || 'new'}`,
      enabled: true,
      ttl: 2 * 60 * 60 * 1000, // 2 hours
    },
    transformOnSubmit: async (values) => {
      return {
        ...values,
        parentId: values.parentId || undefined,
        copy: JSON.parse(values.copy),
        attributes: JSON.parse(values.attributes),
        physicalProperties: values.physicalProperties
          ? JSON.parse(values.physicalProperties)
          : undefined,
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
    collections: [] as Array<{ value: string; label: string }>,
    taxonomies: [] as Array<{ value: string; label: string }>,
    brands: [] as Array<{ value: string; label: string }>,
    categories: [] as Array<{ value: string; label: string }>,
    parentProducts: [] as Array<{ value: string; label: string }>,
    fandoms: [] as Array<{ value: string; label: string }>,
    series: [] as Array<{ value: string; label: string }>,
    stories: [] as Array<{ value: string; label: string }>,
    locations: [] as Array<{ value: string; label: string }>,
    casts: [] as Array<{ value: string; label: string }>,
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
      const [collectionsRes, taxonomiesRes, brandsRes, categoriesRes] = await Promise.all([
        getCollectionsAction({}),
        getTaxonomiesAction({}),
        getBrandsAction({}),
        getCategoriesAction({ includeDeleted: false }),
      ]);

      setFormData({
        collections: (collectionsRes.data || []).map((c: any) => ({
          value: c.id,
          label: `${c.name} (${c.type})`,
        })),
        taxonomies: (taxonomiesRes.data || []).map((t: any) => ({
          value: t.id,
          label: `${t.name} (${t.type})`,
        })),
        brands: (brandsRes.data || []).map((b: any) => ({
          value: b.id,
          label: `${b.name} (${b.type})`,
        })),
        categories: (categoriesRes.data || []).map((c: any) => ({ value: c.id, label: c.name })),
        parentProducts: [], // Load separately for variants
        fandoms: [],
        series: [],
        stories: [],
        locations: [],
        casts: [],
      });
    });

    if (opened) {
      loadFormData();
    }
  }, [opened, withDataLoading]);

  // Load existing product data
  useEffect(() => {
    if (isEditing && opened && productId) {
      const loadProduct = withDataLoading('initialData', async () => {
        const productData = await getProductAction({ where: { id: productId } });
        if (productData) {
          // Load relationships
          const relationships = await getProductRelationshipsAction(productId);

          form.setValues({
            name: productData.name,
            sku: productData.sku,
            slug: productData.slug,
            category: productData.category,
            status: productData.status,
            type: productData.type,
            price: productData.price || undefined,
            currency: productData.currency || 'USD',
            variantPrice: productData.variantPrice ? Number(productData.variantPrice) : undefined,
            compareAtPrice: productData.compareAtPrice
              ? Number(productData.compareAtPrice)
              : undefined,
            brand: productData.brand || '',
            parentId: productData.parentId || '',
            displayOrder: productData.displayOrder || 0,
            isDefault: productData.isDefault || false,
            copy: JSON.stringify(productData.copy || {}, null, 2),
            attributes: JSON.stringify(productData.attributes || {}, null, 2),
            physicalProperties: productData.physicalProperties
              ? JSON.stringify(productData.physicalProperties, null, 2)
              : '',
            aiGenerated: productData.aiGenerated || false,
            aiConfidence: productData.aiConfidence || undefined,
            aiSources: productData.aiSources || [],

            // Relationships from loaded data
            collectionIds: relationships?.success
              ? (relationships.data?.collections || []).map((c: any) => c.id)
              : [],
            taxonomyIds: relationships?.success
              ? (relationships.data?.taxonomies || []).map((t: any) => t.id)
              : [],
            brandIds: relationships?.success
              ? (relationships.data?.brands || []).map((b: any) => b.id)
              : [],
            categoryIds: (productData.categories || []).map((c: any) => c.id),
            fandomIds: (productData.fandoms || []).map((f: any) => f.id),
            seriesIds: (productData.series || []).map((s: any) => s.id),
            storyIds: (productData.stories || []).map((s: any) => s.id),
            locationIds: (productData.locations || []).map((l: any) => l.id),
            castIds: (productData.casts || []).map((c: any) => c.id),

            // Load identifiers and variants from relationships
            identifiers: (productData.identifiers || []).map((id: any) => ({
              type: id.type || 'OTHER',
              value: id.value || '',
              isPrimary: id.isPrimary || false,
            })),
            variants: (productData.children || [])
              .filter((c: any) => c.type === 'VARIANT')
              .map((v: any) => ({
                name: v.name,
                sku: v.sku,
                price: v.price || 0,
                variantPrice: v.variantPrice ? Number(v.variantPrice) : undefined,
                compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
                displayOrder: v.displayOrder || 0,
                isDefault: v.isDefault || false,
                attributes: v.attributes || {},
              })),
          });
          form.markAsSaved();
        }
      });

      loadProduct().catch(errorHandler.handleServerError);
    }
  }, [isEditing, productId, opened, form, withDataLoading, errorHandler]);

  // Submit handler
  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const data = {
        ...values,
        // Relationships
        collectionIds: values.collectionIds,
        taxonomyIds: values.taxonomyIds,
        brandIds: values.brandIds,
        categoryIds: values.categoryIds,
        fandomIds: values.fandomIds,
        seriesIds: values.seriesIds,
        storyIds: values.storyIds,
        locationIds: values.locationIds,
        castIds: values.castIds,

        // Nested creates (only for new products)
        identifiers: !isEditing ? values.identifiers : undefined,
        variants: !isEditing ? values.variants : undefined,
      };

      let result;
      if (isEditing && productId) {
        result = await updateProductWithRelationshipsAction(productId, data);
      } else {
        result = await createProductWithRelationshipsAction(data);
      }

      if (result?.success) {
        errorHandler.showSuccess(`Product ${isEditing ? 'updated' : 'created'} successfully`);
      } else {
        throw new Error(result?.error || `Failed to ${isEditing ? 'update' : 'create'} product`);
      }
    } catch (error) {
      errorHandler.handleServerError(error);
      throw error;
    }
  });

  // Array management helpers
  const addIdentifier = () => {
    form.addArrayItem('identifiers', {
      type: 'UPC_A',
      value: '',
      isPrimary: form.values.identifiers.length === 0,
    });
  };

  const removeIdentifier = (index: number) => {
    form.removeArrayItem('identifiers', index);
  };

  const addVariant = () => {
    form.addArrayItem('variants', {
      name: '',
      sku: '',
      price: 0,
      variantPrice: undefined,
      compareAtPrice: undefined,
      displayOrder: form.values.variants.length,
      isDefault: form.values.variants.length === 0,
      attributes: {},
    });
  };

  const removeVariant = (index: number) => {
    form.removeArrayItem('variants', index);
  };

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
      size="xl"
      title={
        <Group>
          <IconBox size={20} />
          <Title order={4}>{isEditing ? 'Edit Product' : 'Create Product'}</Title>
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
          {form.hasPersistedData() && (
            <Badge color="cyan" variant="light">
              Draft Available
            </Badge>
          )}
        </Group>
      }
      overlayProps={{ backgroundOpacity: 0.5 }}
    >
      <LoadingOverlay visible={isDataLoading} />

      {form.hasPersistedData() && (
        <Alert color="blue" mb="md">
          <Group justify="space-between">
            <Text size="sm">Draft data found from previous session</Text>
            <Button size="xs" variant="light" onClick={form.clearPersistedData}>
              Clear Draft
            </Button>
          </Group>
        </Alert>
      )}

      {form.isDirty && (
        <Alert color="orange" mb="md">
          You have unsaved changes.
        </Alert>
      )}

      {errorHandler.hasNetworkErrors && (
        <Alert
          icon={<IconAlertTriangle size={16} />}
          color="red"
          mb="md"
          onClose={errorHandler.clearErrors}
          withCloseButton
        >
          Network error. Please check your connection and try again.
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="basic" leftSection={<IconFileText size={16} />}>
              Basic Info
            </Tabs.Tab>
            <Tabs.Tab value="relationships" leftSection={<IconCategory size={16} />}>
              Relationships
            </Tabs.Tab>
            <Tabs.Tab value="barcodes" leftSection={<IconBarcode size={16} />}>
              Barcodes
            </Tabs.Tab>
            <Tabs.Tab value="attributes" leftSection={<IconHash size={16} />}>
              Attributes
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pt="xs">
            <Stack>
              <Group grow>
                <TextInput
                  label="Product Name"
                  placeholder="Enter product name"
                  required
                  {...form.getInputProps('name')}
                  onBlur={(e) => {
                    form.validateFieldAsync('name', e.target.value);
                    if (!form.values.slug) {
                      form.setFieldValue('slug', generateSlug(e.target.value));
                    }
                  }}
                />
                <TextInput
                  label="SKU"
                  placeholder="Enter unique SKU"
                  required
                  {...form.getInputProps('sku')}
                  onBlur={(e) => form.validateFieldAsync('sku', e.target.value)}
                />
              </Group>

              <TextInput
                label="Slug"
                placeholder="product-slug"
                required
                description="URL-friendly identifier (auto-generated from name)"
                {...form.getInputProps('slug')}
                onBlur={(e) => form.validateFieldAsync('slug', e.target.value)}
              />

              <Textarea
                label="Description"
                placeholder="Enter product description"
                description="This will be stored in the copy.description field"
                minRows={3}
                value={(() => {
                  try {
                    const copy = JSON.parse(form.values.copy);
                    return copy.description || '';
                  } catch {
                    return '';
                  }
                })()}
                onChange={(e) => {
                  try {
                    const copy = JSON.parse(form.values.copy);
                    copy.description = e.target.value;
                    form.setFieldValue('copy', JSON.stringify(copy, null, 2));
                  } catch {
                    // Handle invalid JSON
                  }
                }}
              />

              <Group grow>
                <Select
                  label="Category"
                  placeholder="Select category"
                  required
                  data={formData.categories}
                  searchable
                  {...form.getInputProps('category')}
                />
                <Select
                  label="Status"
                  required
                  data={[
                    { value: 'DRAFT', label: 'Draft' },
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'ARCHIVED', label: 'Archived' },
                    { value: 'DISCONTINUED', label: 'Discontinued' },
                  ]}
                  {...form.getInputProps('status')}
                />
              </Group>

              <Group grow>
                <Select
                  label="Product Type"
                  required
                  data={[
                    { value: 'PHYSICAL', label: 'Physical' },
                    { value: 'DIGITAL', label: 'Digital' },
                    { value: 'SERVICE', label: 'Service' },
                    { value: 'SUBSCRIPTION', label: 'Subscription' },
                    { value: 'BUNDLE', label: 'Bundle' },
                    { value: 'VARIANT', label: 'Variant' },
                    { value: 'OTHER', label: 'Other' },
                  ]}
                  {...form.getInputProps('type')}
                />
                <TextInput
                  label="Brand"
                  placeholder="Enter brand name"
                  {...form.getInputProps('brand')}
                />
              </Group>

              <Group grow>
                <NumberInput
                  label="Price"
                  placeholder="0.00"
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                  {...form.getInputProps('price')}
                />
                {form.isFieldVisible('variantPrice') && (
                  <NumberInput
                    label="Variant Price"
                    placeholder="0.00"
                    decimalScale={2}
                    fixedDecimalScale
                    allowNegative={false}
                    description="Specific price for this variant"
                    {...form.getInputProps('variantPrice')}
                  />
                )}
                {form.isFieldVisible('compareAtPrice') && (
                  <NumberInput
                    label="Compare Price"
                    placeholder="0.00"
                    decimalScale={2}
                    fixedDecimalScale
                    allowNegative={false}
                    description="Must be higher than regular price"
                    {...form.getInputProps('compareAtPrice')}
                  />
                )}
                <Select
                  label="Currency"
                  data={[
                    { value: 'USD', label: 'USD' },
                    { value: 'EUR', label: 'EUR' },
                    { value: 'GBP', label: 'GBP' },
                    { value: 'CAD', label: 'CAD' },
                  ]}
                  {...form.getInputProps('currency')}
                />
              </Group>

              {form.isFieldVisible('parentId') && (
                <Select
                  label="Parent Product"
                  placeholder="Select parent product"
                  description="Required for variant products"
                  data={formData.parentProducts}
                  searchable
                  clearable
                  required={form.values.type === 'VARIANT'}
                  {...form.getInputProps('parentId')}
                />
              )}

              <Group grow>
                <NumberInput
                  label="Display Order"
                  placeholder="0"
                  min={0}
                  description="Order for sorting products"
                  {...form.getInputProps('displayOrder')}
                />
                <Switch
                  label="Default Variant"
                  description="Mark as the default option"
                  {...form.getInputProps('isDefault', { type: 'checkbox' })}
                />
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="relationships" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Collections</Title>
                  <MultiSelect
                    placeholder="Select collections"
                    data={formData.collections}
                    searchable
                    clearable
                    limit={20}
                    {...form.getInputProps('collectionIds')}
                  />
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Taxonomies</Title>
                  <MultiSelect
                    placeholder="Select taxonomies"
                    data={formData.taxonomies}
                    searchable
                    clearable
                    limit={20}
                    {...form.getInputProps('taxonomyIds')}
                  />
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Brands/Sellers</Title>
                  <Text size="sm" c="dimmed">
                    Select brands that sell this product
                  </Text>
                  <MultiSelect
                    placeholder="Select brands"
                    data={formData.brands}
                    searchable
                    clearable
                    limit={20}
                    {...form.getInputProps('brandIds')}
                  />
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Categories</Title>
                  <MultiSelect
                    placeholder="Select product categories"
                    data={formData.categories}
                    searchable
                    clearable
                    limit={20}
                    {...form.getInputProps('categoryIds')}
                  />
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Content Associations</Title>
                  <Text size="sm" c="dimmed">
                    Associate with fandoms, series, stories, locations, and cast
                  </Text>
                  <Group grow>
                    <MultiSelect
                      label="Fandoms"
                      placeholder="Select fandoms"
                      data={formData.fandoms}
                      searchable
                      clearable
                      {...form.getInputProps('fandomIds')}
                    />
                    <MultiSelect
                      label="Series"
                      placeholder="Select series"
                      data={formData.series}
                      searchable
                      clearable
                      {...form.getInputProps('seriesIds')}
                    />
                  </Group>
                  <Group grow>
                    <MultiSelect
                      label="Stories"
                      placeholder="Select stories"
                      data={formData.stories}
                      searchable
                      clearable
                      {...form.getInputProps('storyIds')}
                    />
                    <MultiSelect
                      label="Locations"
                      placeholder="Select locations"
                      data={formData.locations}
                      searchable
                      clearable
                      {...form.getInputProps('locationIds')}
                    />
                  </Group>
                  <MultiSelect
                    label="Cast"
                    placeholder="Select cast members"
                    data={formData.casts}
                    searchable
                    clearable
                    {...form.getInputProps('castIds')}
                  />
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="barcodes" pt="xs">
            <Stack>
              <Group justify="space-between">
                <Title order={5}>Product Identifiers</Title>
                <Button
                  variant="light"
                  size="sm"
                  leftSection={<IconPlus size={16} />}
                  onClick={addIdentifier}
                  disabled={isEditing}
                >
                  Add Identifier
                </Button>
              </Group>

              {isEditing && (
                <Text size="sm" c="dimmed">
                  Identifiers can only be managed after product creation
                </Text>
              )}

              {!isEditing && form.values.identifiers.length > 0 && (
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Type</Table.Th>
                      <Table.Th>Value</Table.Th>
                      <Table.Th>Primary</Table.Th>
                      <Table.Th style={{ width: 80 }}>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {form.values.identifiers.map((identifier, index) => (
                      <Table.Tr key={index}>
                        <Table.Td>
                          <Select
                            data={[
                              { value: 'UPC_A', label: 'UPC-A' },
                              { value: 'UPC_E', label: 'UPC-E' },
                              { value: 'EAN_13', label: 'EAN-13' },
                              { value: 'EAN_8', label: 'EAN-8' },
                              { value: 'ISBN_10', label: 'ISBN-10' },
                              { value: 'ISBN_13', label: 'ISBN-13' },
                              { value: 'ASIN', label: 'ASIN' },
                              { value: 'TCIN', label: 'TCIN' },
                              { value: 'DPCI', label: 'DPCI' },
                              { value: 'OTHER', label: 'Other' },
                            ]}
                            {...form.getInputProps(`identifiers.${index}.type`)}
                          />
                        </Table.Td>
                        <Table.Td>
                          <TextInput
                            placeholder="Enter identifier value"
                            {...form.getInputProps(`identifiers.${index}.value`)}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Checkbox
                            checked={form.values.identifiers[index].isPrimary}
                            onChange={(e) => {
                              // If setting as primary, unset others
                              if (e.currentTarget.checked) {
                                form.values.identifiers.forEach((_, i) => {
                                  if (i !== index) {
                                    form.setFieldValue(`identifiers.${i}.isPrimary`, false);
                                  }
                                });
                              }
                              form.setFieldValue(
                                `identifiers.${index}.isPrimary`,
                                e.currentTarget.checked,
                              );
                            }}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon variant="subtle" style={{ cursor: 'grab' }}>
                              <IconGripVertical size={16} />
                            </ActionIcon>
                            <ActionIcon
                              color="red"
                              onClick={() => removeIdentifier(index)}
                              variant="subtle"
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="attributes" pt="xs">
            <Stack>
              <Card withBorder p="lg">
                <Stack>
                  <Title order={5}>AI Metadata</Title>
                  <Switch
                    label="AI Generated"
                    description="Mark this product as AI generated"
                    {...form.getInputProps('aiGenerated', { type: 'checkbox' })}
                  />

                  {form.values.aiGenerated && (
                    <Group grow>
                      <NumberInput
                        label="AI Confidence"
                        placeholder="0.0 - 1.0"
                        decimalScale={2}
                        min={0}
                        max={1}
                        step={0.1}
                        {...form.getInputProps('aiConfidence')}
                      />
                      <MultiSelect
                        label="AI Sources"
                        placeholder="Select AI sources"
                        data={[
                          { value: 'openai-gpt4', label: 'OpenAI GPT-4' },
                          { value: 'openai-gpt3.5', label: 'OpenAI GPT-3.5' },
                          { value: 'claude-3', label: 'Anthropic Claude 3' },
                          { value: 'gemini', label: 'Google Gemini' },
                          { value: 'web-scraping', label: 'Web Scraping' },
                          { value: 'product-api', label: 'Product API' },
                        ]}
                        searchable
                        {...form.getInputProps('aiSources')}
                      />
                    </Group>
                  )}
                </Stack>
              </Card>

              <Card withBorder p="lg">
                <Stack>
                  <Title order={5}>Content & Metadata</Title>
                  <JsonInput
                    label="Product Copy"
                    placeholder="Product content in JSON format"
                    description="Include description, metaTitle, metaDescription, specifications"
                    formatOnBlur
                    autosize
                    minRows={6}
                    maxRows={12}
                    validationError="Invalid JSON"
                    {...form.getInputProps('copy')}
                  />

                  <JsonInput
                    label="Custom Attributes"
                    placeholder="Enter custom attributes as JSON"
                    description="Additional product attributes and metadata"
                    formatOnBlur
                    autosize
                    minRows={4}
                    maxRows={8}
                    validationError="Invalid JSON"
                    {...form.getInputProps('attributes')}
                  />

                  {form.isFieldVisible('physicalProperties') && (
                    <JsonInput
                      label="Physical Properties"
                      placeholder="Weight, dimensions, and other physical attributes"
                      description="Physical characteristics for shipping and inventory"
                      formatOnBlur
                      autosize
                      minRows={3}
                      maxRows={6}
                      validationError="Invalid JSON"
                      {...form.getInputProps('physicalProperties')}
                    />
                  )}
                </Stack>
              </Card>

              {form.isFieldVisible('variants') && (
                <Card withBorder p="lg">
                  <Stack>
                    <Group justify="space-between">
                      <Title order={5}>Product Variants</Title>
                      <Button
                        variant="light"
                        size="sm"
                        leftSection={<IconPlus size={16} />}
                        onClick={addVariant}
                        disabled={isEditing}
                      >
                        Add Variant
                      </Button>
                    </Group>

                    {isEditing && (
                      <Text size="sm" c="dimmed">
                        Variants can only be managed after product creation
                      </Text>
                    )}

                    {!isEditing && form.values.variants.length > 0 && (
                      <Stack gap="sm">
                        {form.values.variants.map((variant, index) => (
                          <Card key={index} withBorder p="md" bg="gray.0">
                            <Group align="flex-start">
                              <ActionIcon variant="subtle" style={{ cursor: 'grab' }}>
                                <IconGripVertical size={16} />
                              </ActionIcon>

                              <Stack flex={1} gap="xs">
                                <Group grow>
                                  <TextInput
                                    label="Variant Name"
                                    placeholder="Color, size, etc."
                                    {...form.getInputProps(`variants.${index}.name`)}
                                  />
                                  <TextInput
                                    label="Variant SKU"
                                    placeholder="Unique SKU for variant"
                                    {...form.getInputProps(`variants.${index}.sku`)}
                                  />
                                </Group>
                                <Group grow>
                                  <NumberInput
                                    label="Price"
                                    placeholder="0.00"
                                    decimalScale={2}
                                    allowNegative={false}
                                    {...form.getInputProps(`variants.${index}.price`)}
                                  />
                                  <NumberInput
                                    label="Display Order"
                                    placeholder="0"
                                    min={0}
                                    {...form.getInputProps(`variants.${index}.displayOrder`)}
                                  />
                                  <Switch
                                    label="Default"
                                    {...form.getInputProps(`variants.${index}.isDefault`, {
                                      type: 'checkbox',
                                    })}
                                  />
                                </Group>
                              </Stack>

                              <ActionIcon
                                color="red"
                                variant="light"
                                onClick={() => removeVariant(index)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Group>
                          </Card>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Card>
              )}
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
            <Button variant="light" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={form.isSubmitting} leftSection={<IconCheck size={16} />}>
              {isEditing ? 'Update Product' : 'Create Product'}
            </Button>
          </Group>
        </Group>
      </form>
    </Modal>
  );
}
