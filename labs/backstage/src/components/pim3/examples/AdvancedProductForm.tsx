'use client';

import {
  Button,
  Group,
  Stack,
  TextInput,
  Select,
  NumberInput,
  Textarea,
  Card,
  Text,
  Badge,
  ActionIcon,
  Alert,
  Divider,
  MultiSelect,
  DateInput,
  Switch,
} from '@mantine/core';
import { IconPlus, IconTrash, IconGripVertical, IconCheck, IconRestore } from '@tabler/icons-react';
import { useState } from 'react';
import { z } from 'zod';

import { usePimForm } from '@/hooks/pim3/usePimForm';
import { useProductValidation } from '@/hooks/pim3/useAsyncValidation';
import { ProductType, ProductStatus } from '@repo/database/prisma';

// Enhanced product schema with complex validation
const productFormSchema = z
  .object({
    name: z.string().min(1, 'Product name is required'),
    sku: z.string().min(1, 'SKU is required'),
    type: z.nativeEnum(ProductType),
    price: z.number().min(0, 'Price must be positive'),
    comparePrice: z.number().min(0).optional(),
    categoryIds: z.array(z.string()).min(1, 'At least one category required'),

    // Dynamic variants array
    variants: z
      .array(
        z.object({
          name: z.string().min(1, 'Variant name required'),
          sku: z.string().min(1, 'Variant SKU required'),
          price: z.number().min(0, 'Price must be positive'),
          stock: z.number().min(0, 'Stock must be positive'),
        }),
      )
      .default([]),

    // Conditional fields
    bundleItems: z
      .array(
        z.object({
          productId: z.string(),
          quantity: z.number().min(1),
        }),
      )
      .default([]),

    // Metadata
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    tags: z.array(z.string()).default([]),

    // Dates
    publishedAt: z.date().nullable().optional(),
    expiresAt: z.date().nullable().optional(),

    // Status
    status: z.nativeEnum(ProductStatus),
    featured: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // Cross-field validation: compare price must be higher than price
      if (data.comparePrice && data.comparePrice <= data.price) {
        return false;
      }
      return true;
    },
    {
      message: 'Compare price must be higher than regular price',
      path: ['comparePrice'],
    },
  )
  .refine(
    (data) => {
      // Cross-field validation: bundle products can't have variants
      if (data.type === ProductType.BUNDLE && data.variants.length > 0) {
        return false;
      }
      return true;
    },
    {
      message: 'Bundle products cannot have variants',
      path: ['variants'],
    },
  );

type ProductFormData = z.infer<typeof productFormSchema>;

interface AdvancedProductFormProps {
  productId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AdvancedProductForm({ productId, onSuccess, onCancel }: AdvancedProductFormProps) {
  const isEditing = !!productId;
  const asyncValidation = useProductValidation(productId);

  // Mock data for demo
  const [categories] = useState([
    { value: 'cat1', label: 'Electronics' },
    { value: 'cat2', label: 'Clothing' },
    { value: 'cat3', label: 'Books' },
  ]);

  const [availableProducts] = useState([
    { value: 'prod1', label: 'Product 1' },
    { value: 'prod2', label: 'Product 2' },
    { value: 'prod3', label: 'Product 3' },
  ]);

  // Advanced form with all new features
  const form = usePimForm({
    schema: productFormSchema,
    initialValues: {
      name: '',
      sku: '',
      type: ProductType.SIMPLE,
      price: 0,
      comparePrice: undefined,
      categoryIds: [],
      variants: [],
      bundleItems: [],
      seoTitle: '',
      seoDescription: '',
      tags: [],
      publishedAt: null,
      expiresAt: null,
      status: ProductStatus.DRAFT,
      featured: false,
    },

    // Async validation
    asyncValidation: {
      sku: asyncValidation.sku,
    },

    // Cross-field validation
    crossFieldValidation: [
      {
        fields: ['price', 'comparePrice'],
        validator: ({ price, comparePrice }) => {
          if (comparePrice && comparePrice <= price) {
            return 'Compare price must be higher than regular price';
          }
          return null;
        },
        errorField: 'comparePrice',
      },
      {
        fields: ['publishedAt', 'expiresAt'],
        validator: ({ publishedAt, expiresAt }) => {
          if (publishedAt && expiresAt && expiresAt <= publishedAt) {
            return 'Expiration date must be after publish date';
          }
          return null;
        },
        errorField: 'expiresAt',
      },
    ],

    // Field watchers
    watchers: {
      type: (type, allValues) => {
        console.log(`Product type changed to: ${type}`);
        // Auto-clear incompatible fields
        if (type === ProductType.SIMPLE && allValues.variants.length > 0) {
          form.setFieldValue('variants', []);
        }
        if (type !== ProductType.BUNDLE && allValues.bundleItems.length > 0) {
          form.setFieldValue('bundleItems', []);
        }
      },
      name: (name) => {
        // Auto-generate SEO title from name
        if (name && !form.values.seoTitle) {
          form.setFieldValue('seoTitle', `${name} - Best Quality Product`);
        }
      },
    },

    // Conditional fields
    conditionalFields: {
      variants: {
        condition: (values) => values.type === ProductType.VARIABLE,
      },
      bundleItems: {
        condition: (values) => values.type === ProductType.BUNDLE,
      },
      comparePrice: {
        condition: (values) => values.status === ProductStatus.ACTIVE,
      },
    },

    // Form persistence
    persistence: {
      key: `product-form-${productId || 'new'}`,
      enabled: true,
      ttl: 2 * 60 * 60 * 1000, // 2 hours
    },

    // Auto-save for drafts
    autoSave: {
      enabled: isEditing,
      delay: 5000, // 5 seconds
      onSave: async (values) => {
        console.log('Auto-saving product:', values);
        // In real app: await updateProductAction(productId, values);
      },
    },

    dirtyTracking: true,
    onSuccess,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    console.log('Submitting product:', values);
    // In real app: await createProductAction(values);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="lg">
        {/* Persistence indicator */}
        {form.hasPersistedData() && (
          <Alert color="blue" icon={<IconRestore size={16} />}>
            <Group justify="space-between">
              <Text size="sm">Draft data found from previous session</Text>
              <Button size="xs" variant="light" onClick={form.clearPersistedData}>
                Clear Draft
              </Button>
            </Group>
          </Alert>
        )}

        {/* Dirty state indicator */}
        {form.isDirty && <Alert color="orange">You have unsaved changes</Alert>}

        {/* Basic Information */}
        <Card withBorder p="lg">
          <Stack gap="md">
            <Text fw={600} size="lg">
              Basic Information
            </Text>

            <Group grow>
              <TextInput
                label="Product Name"
                placeholder="Enter product name"
                required
                {...form.getInputProps('name')}
              />
              <TextInput
                label="SKU"
                placeholder="Enter unique SKU"
                required
                {...form.getInputProps('sku')}
                onBlur={(e) => form.validateFieldAsync('sku', e.target.value)}
              />
            </Group>

            <Group grow>
              <Select
                label="Product Type"
                required
                data={[
                  { value: 'SIMPLE', label: 'Simple Product' },
                  { value: 'VARIABLE', label: 'Variable Product' },
                  { value: 'BUNDLE', label: 'Bundle Product' },
                ]}
                {...form.getInputProps('type')}
              />
              <Select
                label="Status"
                required
                data={[
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Inactive' },
                ]}
                {...form.getInputProps('status')}
              />
            </Group>

            <MultiSelect
              label="Categories"
              placeholder="Select categories"
              required
              data={categories}
              {...form.getInputProps('categoryIds')}
            />
          </Stack>
        </Card>

        {/* Pricing */}
        <Card withBorder p="lg">
          <Stack gap="md">
            <Text fw={600} size="lg">
              Pricing
            </Text>

            <Group grow>
              <NumberInput
                label="Price"
                placeholder="0.00"
                required
                min={0}
                decimalScale={2}
                {...form.getInputProps('price')}
              />
              {form.isFieldVisible('comparePrice') && (
                <NumberInput
                  label="Compare Price"
                  placeholder="0.00"
                  min={0}
                  decimalScale={2}
                  description="Must be higher than regular price"
                  {...form.getInputProps('comparePrice')}
                />
              )}
            </Group>
          </Stack>
        </Card>

        {/* Dynamic Variants Array */}
        {form.isFieldVisible('variants') && (
          <Card withBorder p="lg">
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={600} size="lg">
                  Product Variants
                </Text>
                <Button
                  leftSection={<IconPlus size={16} />}
                  variant="light"
                  onClick={() =>
                    form.addArrayItem('variants', {
                      name: '',
                      sku: '',
                      price: 0,
                      stock: 0,
                    })
                  }
                >
                  Add Variant
                </Button>
              </Group>

              {form.values.variants.map((variant, index) => (
                <Card key={index} withBorder p="md" bg="gray.0">
                  <Group align="flex-start">
                    <ActionIcon variant="subtle" style={{ cursor: 'grab' }}>
                      <IconGripVertical size={16} />
                    </ActionIcon>

                    <Stack flex={1} gap="xs">
                      <Group grow>
                        <TextInput
                          placeholder="Variant name"
                          {...form.getInputProps(`variants.${index}.name`)}
                        />
                        <TextInput
                          placeholder="Variant SKU"
                          {...form.getInputProps(`variants.${index}.sku`)}
                        />
                      </Group>
                      <Group grow>
                        <NumberInput
                          placeholder="Price"
                          min={0}
                          decimalScale={2}
                          {...form.getInputProps(`variants.${index}.price`)}
                        />
                        <NumberInput
                          placeholder="Stock"
                          min={0}
                          {...form.getInputProps(`variants.${index}.stock`)}
                        />
                      </Group>
                    </Stack>

                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => form.removeArrayItem('variants', index)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Card>
        )}

        {/* Bundle Items */}
        {form.isFieldVisible('bundleItems') && (
          <Card withBorder p="lg">
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={600} size="lg">
                  Bundle Items
                </Text>
                <Button
                  leftSection={<IconPlus size={16} />}
                  variant="light"
                  onClick={() =>
                    form.addArrayItem('bundleItems', {
                      productId: '',
                      quantity: 1,
                    })
                  }
                >
                  Add Item
                </Button>
              </Group>

              {form.values.bundleItems.map((item, index) => (
                <Group key={index} align="flex-end">
                  <Select
                    placeholder="Select product"
                    flex={1}
                    data={availableProducts}
                    {...form.getInputProps(`bundleItems.${index}.productId`)}
                  />
                  <NumberInput
                    placeholder="Qty"
                    min={1}
                    w={80}
                    {...form.getInputProps(`bundleItems.${index}.quantity`)}
                  />
                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => form.removeArrayItem('bundleItems', index)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
          </Card>
        )}

        {/* SEO & Metadata */}
        <Card withBorder p="lg">
          <Stack gap="md">
            <Text fw={600} size="lg">
              SEO & Metadata
            </Text>

            <TextInput
              label="SEO Title"
              placeholder="SEO optimized title"
              {...form.getInputProps('seoTitle')}
            />

            <Textarea
              label="SEO Description"
              placeholder="SEO meta description"
              rows={3}
              {...form.getInputProps('seoDescription')}
            />

            <MultiSelect
              label="Tags"
              placeholder="Add tags"
              data={[]}
              searchable
              creatable
              getCreateLabel={(query) => `+ Create "${query}"`}
              {...form.getInputProps('tags')}
            />

            <Group grow>
              <DateInput
                label="Publish Date"
                placeholder="Select publish date"
                {...form.getInputProps('publishedAt')}
              />
              <DateInput
                label="Expiration Date"
                placeholder="Select expiration date"
                {...form.getInputProps('expiresAt')}
              />
            </Group>

            <Switch
              label="Featured Product"
              description="Show this product in featured sections"
              {...form.getInputProps('featured', { type: 'checkbox' })}
            />
          </Stack>
        </Card>

        <Divider />

        {/* Form Actions */}
        <Group justify="space-between">
          <Group>
            <Badge color={form.isDirty ? 'orange' : 'green'}>
              {form.isDirty ? 'Unsaved Changes' : 'All Changes Saved'}
            </Badge>
            {form.isAutoSaving && <Badge color="blue">Auto-saving...</Badge>}
            {form.hasPersistedData() && <Badge color="cyan">Draft Available</Badge>}
          </Group>

          <Group>
            <Button variant="light" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={form.isSubmitting} leftSection={<IconCheck size={16} />}>
              {isEditing ? 'Update' : 'Create'} Product
            </Button>
          </Group>
        </Group>
      </Stack>
    </form>
  );
}
