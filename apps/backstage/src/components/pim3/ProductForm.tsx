'use client';

import {
  ActionIcon,
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
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconBarcode,
  IconBox,
  IconCategory,
  IconCheck,
  IconFileText,
  IconHash,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import {
  createProductWithRelationshipsAction,
  updateProductWithRelationshipsAction,
  getProductRelationshipsAction,
  getCollectionsAction,
  getTaxonomiesAction,
  getBrandsAction,
  getCategoriesAction,
  getProductAction,
  Product,
  ProductStatus,
  ProductType,
  BarcodeType,
  ContentStatus,
} from '@repo/database/prisma';
import { productFormSchema, type ProductFormValues } from '@/schemas/pim3/product';

interface ProductFormProps {
  onClose: () => void;
  onSuccess: () => void;
  opened: boolean;
  productId?: string | null;
}

interface BarcodeInput {
  barcode: string;
  type: BarcodeType;
  isPrimary: boolean;
}

interface AssetInput {
  type: string;
  url: string;
  filename: string;
  alt?: string;
  description?: string;
}

export function ProductForm({
  onClose,
  onSuccess,
  opened,
  productId,
}: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('basic');

  // Options for selects
  const [collections, setCollections] = useState<any[]>([]);
  const [taxonomies, setTaxonomies] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [parentProducts, setParentProducts] = useState<any[]>([]);

  const isEditing = !!productId;

  const form = useForm({
    initialValues: {
      // Basic information
      name: '',
      sku: '',
      description: '',
      category: '',
      status: 'DRAFT' as ProductStatus,
      brand: '',
      price: 0,
      currency: 'USD',
      type: 'PHYSICAL' as ProductType,
      parentId: '',

      // Relationships
      collectionIds: [] as string[],
      taxonomyIds: [] as string[],
      brandIds: [] as string[],

      // Nested data
      barcodes: [] as BarcodeInput[],
      assets: [] as AssetInput[],

      // AI metadata
      aiGenerated: false,
      aiConfidence: 0,
      aiSources: [] as string[],

      // JSON attributes
      attributes: '{}',
    },

    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      sku: (value) => (!value ? 'SKU is required' : null),
      category: (value) => (!value ? 'Category is required' : null),
      attributes: (value) => {
        try {
          JSON.parse(value);
          return null;
        } catch {
          return 'Attributes must be valid JSON';
        }
      },
      barcodes: {
        barcode: (value) => (!value ? 'Barcode is required' : null),
        type: (value) => (!value ? 'Type is required' : null),
      },
    },
  });

  // Load options and product data
  useEffect(() => {
    if (opened) {
      loadOptions();
      if (isEditing && productId) {
        loadProduct(productId);
      }
    }
  }, [opened, productId]);

  const loadOptions = async () => {
    try {
      const [collectionsRes, taxonomiesRes, brandsRes, categoriesRes] = await Promise.all([
        getCollectionsAction({}),
        getTaxonomiesAction({}),
        getBrandsAction({}),
        getCategoriesAction({ includeDeleted: false }),
      ]);

      setCollections(collectionsRes.data || []);
      setTaxonomies(taxonomiesRes.data || []);
      setBrands(brandsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Failed to load options:', error);
    }
  };

  const loadProduct = async (id: string) => {
    setLoading(true);
    try {
      const productData = await getProductAction({ where: { id } });
      if (productData) {
        setProduct(productData);

        // Load relationships
        const relationships = await getProductRelationshipsAction(id);
        if (relationships.success && relationships.data) {
          // Set form values
          form.setValues({
            name: productData.name,
            sku: productData.sku,
            description: (productData.copy as any)?.description || '',
            category: productData.category,
            status: productData.status,
            brand: productData.brand || '',
            price: productData.price || 0,
            currency: productData.currency || 'USD',
            type: productData.type,
            parentId: productData.parentId || '',

            // Relationships
            collectionIds: relationships.data.collections.map((c: any) => c.id),
            taxonomyIds: relationships.data.taxonomies.map((t: any) => t.id),
            brandIds: relationships.data.brands.map((b: any) => b.id),

            // Barcodes - would need to load these separately
            barcodes: [],

            // Assets - would need to load these separately
            assets: [],

            // AI metadata
            aiGenerated: productData.aiGenerated,
            aiConfidence: productData.aiConfidence || 0,
            aiSources: productData.aiSources || [],

            // Attributes
            attributes: JSON.stringify(productData.attributes || {}, null, 2),
          });
        }
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load product data',
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
        sku: values.sku,
        description: values.description,
        category: values.category,
        status: values.status,
        brand: values.brand,
        price: values.price,
        currency: values.currency,
        type: values.type,
        parentId: values.parentId || undefined,

        // Relationships
        collectionIds: values.collectionIds,
        taxonomyIds: values.taxonomyIds,
        brandIds: values.brandIds,

        // Nested creates (only for new products)
        barcodes: !isEditing ? values.barcodes : undefined,
        assets: !isEditing ? values.assets : undefined,

        // AI metadata
        aiGenerated: values.aiGenerated,
        aiConfidence: values.aiConfidence,
        aiSources: values.aiSources,

        // Parse attributes
        attributes: JSON.parse(values.attributes),
      };

      let result;
      if (isEditing && productId) {
        result = await updateProductWithRelationshipsAction(productId, data);
      } else {
        result = await createProductWithRelationshipsAction(data);
      }

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: `Product ${isEditing ? 'updated' : 'created'} successfully`,
          color: 'green',
          icon: <IconCheck />,
        });
        onSuccess();
        form.reset();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || `Failed to ${isEditing ? 'update' : 'create'} product`,
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  };

  const addBarcode = () => {
    form.insertListItem('barcodes', {
      barcode: '',
      type: 'UPC_A' as BarcodeType,
      isPrimary: form.values.barcodes.length === 0,
    });
  };

  const removeBarcode = (index: number) => {
    form.removeListItem('barcodes', index);
  };

  const addAsset = () => {
    form.insertListItem('assets', {
      type: 'IMAGE',
      url: '',
      filename: '',
      alt: '',
      description: '',
    });
  };

  const removeAsset = (index: number) => {
    form.removeListItem('assets', index);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <Group>
          <IconBox size={24} />
          <Title order={3}>{isEditing ? 'Edit Product' : 'Create Product'}</Title>
        </Group>
      }
    >
      <LoadingOverlay visible={loading} />

      <form onSubmit={form.onSubmit(handleSubmit)}>
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
                />
                <TextInput
                  label="SKU"
                  placeholder="Enter SKU"
                  required
                  {...form.getInputProps('sku')}
                />
              </Group>

              <Textarea
                label="Description"
                placeholder="Enter product description"
                minRows={3}
                {...form.getInputProps('description')}
              />

              <Group grow>
                <Select
                  label="Category"
                  placeholder="Select category"
                  required
                  data={categories.map((c) => ({ value: c.id, label: c.name }))}
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

              <Select
                label="Parent Product"
                placeholder="Select parent product (optional)"
                description="Set if this is a variant of another product"
                data={parentProducts.map((p: any) => ({
                  value: p.id,
                  label: `${p.name} (${p.sku})`,
                }))}
                searchable
                clearable
                {...form.getInputProps('parentId')}
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="relationships" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Collections</Title>
                  <MultiSelect
                    placeholder="Select collections"
                    data={collections.map((c) => ({
                      value: c.id,
                      label: `${c.name} (${c.type})`,
                    }))}
                    searchable
                    clearable
                    {...form.getInputProps('collectionIds')}
                  />
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Taxonomies</Title>
                  <MultiSelect
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
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Brands/Sellers</Title>
                  <Text size="sm" c="dimmed">
                    Select brands that sell this product
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
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="barcodes" pt="xs">
            <Stack>
              <Group justify="space-between">
                <Title order={5}>Barcodes</Title>
                <Button
                  variant="light"
                  size="sm"
                  leftSection={<IconPlus size={16} />}
                  onClick={addBarcode}
                  disabled={isEditing}
                >
                  Add Barcode
                </Button>
              </Group>

              {isEditing && (
                <Text size="sm" c="dimmed">
                  Barcodes can only be managed after product creation
                </Text>
              )}

              {!isEditing && form.values.barcodes.length > 0 && (
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Barcode</Table.Th>
                      <Table.Th>Type</Table.Th>
                      <Table.Th>Primary</Table.Th>
                      <Table.Th style={{ width: 50 }}>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {form.values.barcodes.map((barcode, index) => (
                      <Table.Tr key={index}>
                        <Table.Td>
                          <TextInput
                            placeholder="Enter barcode"
                            {...form.getInputProps(`barcodes.${index}.barcode`)}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Select
                            data={[
                              { value: 'UPC_A', label: 'UPC-A' },
                              { value: 'UPC_E', label: 'UPC-E' },
                              { value: 'EAN_13', label: 'EAN-13' },
                              { value: 'EAN_8', label: 'EAN-8' },
                              { value: 'CODE_128', label: 'Code 128' },
                              { value: 'CODE_39', label: 'Code 39' },
                              { value: 'QR_CODE', label: 'QR Code' },
                              { value: 'OTHER', label: 'Other' },
                            ]}
                            {...form.getInputProps(`barcodes.${index}.type`)}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Checkbox
                            checked={form.values.barcodes[index].isPrimary}
                            onChange={(e) => {
                              // If setting as primary, unset others
                              if (e.currentTarget.checked) {
                                form.values.barcodes.forEach((_, i) => {
                                  if (i !== index) {
                                    form.setFieldValue(`barcodes.${i}.isPrimary`, false);
                                  }
                                });
                              }
                              form.setFieldValue(
                                `barcodes.${index}.isPrimary`,
                                e.currentTarget.checked,
                              );
                            }}
                          />
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon
                            color="red"
                            onClick={() => removeBarcode(index)}
                            variant="subtle"
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
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

              <JsonInput
                label="Custom Attributes"
                placeholder="Enter custom attributes as JSON"
                formatOnBlur
                autosize
                minRows={4}
                maxRows={10}
                validationError="Invalid JSON"
                {...form.getInputProps('attributes')}
              />
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Divider my="md" />

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {isEditing ? 'Update Product' : 'Create Product'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
