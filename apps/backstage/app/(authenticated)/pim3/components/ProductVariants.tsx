'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Checkbox,
  Collapse,
  ColorSwatch,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useFormContext } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconChevronDown,
  IconChevronUp,
  IconColorPicker,
  IconEdit,
  IconEye,
  IconPhoto,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';

interface ProductVariantsProps {
  onUpdate?: () => void;
  productId: string;
  productName: string;
}

export function ProductVariants({ onUpdate, productId, productName }: ProductVariantsProps) {
  // Get form context
  const form = useFormContext();

  // Get variants from form context
  const variants = form.values.variants || [];

  // Keep local state for UI-only features
  const [expandedVariants, setExpandedVariants] = useState<Set<string>>(new Set());
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'bulk'>('overview');

  const toggleVariantExpansion = (variantId: string) => {
    setExpandedVariants((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(variantId)) {
        newSet.delete(variantId);
      } else {
        newSet.add(variantId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'yellow';
      case 'discontinued':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getAttributeTypeColor = (type: string) => {
    switch (type) {
      case 'color':
        return 'red';
      case 'size':
        return 'blue';
      case 'material':
        return 'green';
      case 'style':
        return 'purple';
      case 'pattern':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      currency: 'USD',
      style: 'currency',
    }).format(price);
  };

  const calculateTotalInventory = () => {
    return variants.reduce((total, variant) => total + (variant.inventory?.available || 0), 0);
  };

  const handleBulkStatusUpdate = (status: 'active' | 'inactive' | 'discontinued') => {
    if (selectedVariants.length === 0) return;

    selectedVariants.forEach((variantId) => {
      const index = variants.findIndex((v) => v.id === variantId);
      if (index !== -1) {
        form.setFieldValue(`variants.${index}.status`, status);
      }
    });

    notifications.show({
      color: 'green',
      message: `Updated ${selectedVariants.length} variants to ${status}`,
      title: 'Success',
    });
    setSelectedVariants([]);
  };

  const handleDeleteVariants = () => {
    if (selectedVariants.length === 0) return;

    const remainingVariants = variants.filter((v) => !selectedVariants.includes(v.id));
    form.setFieldValue('variants', remainingVariants);

    notifications.show({
      color: 'green',
      message: `Deleted ${selectedVariants.length} variants`,
      title: 'Success',
    });
    setSelectedVariants([]);
  };

  const handleCreateVariant = () => {
    const newVariant = {
      id: `var-${Date.now()}`,
      name: '',
      type: 'VARIANT',
      attributes: [],
      createdAt: new Date(),
      images: [],
      inventory: { available: 0, committed: 0, reserved: 0 },
      isDefault: false,
      isParent: false,
      parentId: productId,
      pdpJoins: [],
      pricing: { basePrice: 0, cost: 0, margin: 0 },
      sku: '',
      status: 'active',
      updatedAt: new Date(),
    };

    form.setFieldValue('variants', [...variants, newVariant]);

    notifications.show({
      color: 'green',
      message: 'New variant created',
      title: 'Success',
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <Stack>
      {/* Tab Navigation */}
      <Group>
        <Button
          leftSection={<IconEye size={16} />}
          onClick={() => setActiveTab('overview')}
          variant={activeTab === 'overview' ? 'filled' : 'light'}
        >
          Overview ({variants.length})
        </Button>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setActiveTab('create')}
          variant={activeTab === 'create' ? 'filled' : 'light'}
        >
          Create Variants
        </Button>
        <Button
          leftSection={<IconEdit size={16} />}
          onClick={() => setActiveTab('bulk')}
          variant={activeTab === 'bulk' ? 'filled' : 'light'}
        >
          Bulk Actions
        </Button>
      </Group>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <Stack>
          {/* Summary Cards */}
          <SimpleGrid cols={4} spacing="md">
            <Card withBorder>
              <Text c="dimmed" size="sm">
                Total Products
              </Text>
              <Text fw={700} size="xl">
                {variants.length}
              </Text>
              <Text c="dimmed" size="xs">
                {variants.filter((v) => v.isParent).length} parents,{' '}
                {variants.filter((v) => !v.isParent).length} variants
              </Text>
            </Card>
            <Card withBorder>
              <Text c="dimmed" size="sm">
                Total Inventory
              </Text>
              <Text fw={700} size="xl">
                {calculateTotalInventory()}
              </Text>
              <Text c="dimmed" size="xs">
                Sellable variants only
              </Text>
            </Card>
            <Card withBorder>
              <Text c="dimmed" size="sm">
                Price Range
              </Text>
              <Text fw={700} size="xl">
                {formatPrice(
                  Math.min(
                    ...variants.filter((v) => !v.isParent).map((v) => v.pricing?.basePrice || 0),
                  ),
                )}{' '}
                -{' '}
                {formatPrice(
                  Math.max(
                    ...variants.filter((v) => !v.isParent).map((v) => v.pricing?.basePrice || 0),
                  ),
                )}
              </Text>
              <Text c="dimmed" size="xs">
                Variant pricing
              </Text>
            </Card>
            <Card withBorder>
              <Text c="dimmed" size="sm">
                Total PDP Joins
              </Text>
              <Text fw={700} size="xl">
                {variants.reduce((total, v) => total + (v.pdpJoins?.length || 0), 0)}
              </Text>
              <Text c="dimmed" size="xs">
                Across all variants
              </Text>
            </Card>
          </SimpleGrid>

          {/* Variant List */}
          <Stack>
            {variants.map((variant, variantIndex) => {
              const isExpanded = expandedVariants.has(variant.id);
              return (
                <Card key={variant.id} withBorder>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <div>
                        <Group gap="sm">
                          <Checkbox
                            onChange={(e) => {
                              if (e.currentTarget.checked) {
                                setSelectedVariants([...selectedVariants, variant.id]);
                              } else {
                                setSelectedVariants(
                                  selectedVariants.filter((id) => id !== variant.id),
                                );
                              }
                            }}
                            checked={selectedVariants.includes(variant.id)}
                          />
                          <Text fw={600}>{variant.name || 'Unnamed Variant'}</Text>

                          {variant.isParent ? (
                            <Badge color="purple" size="sm" variant="filled">
                              PARENT
                            </Badge>
                          ) : (
                            <Badge color="cyan" size="sm" variant="light">
                              VARIANT
                            </Badge>
                          )}

                          <Badge color={getStatusColor(variant.status)} size="sm" variant="light">
                            {variant.status?.toUpperCase()}
                          </Badge>

                          {variant.isDefault && (
                            <Badge color="blue" size="sm" variant="filled">
                              DEFAULT
                            </Badge>
                          )}
                        </Group>

                        <Group gap="sm" mt="xs">
                          <Text c="dimmed" size="sm">
                            SKU: {variant.sku || 'Not set'}
                          </Text>
                          <Text c="dimmed" size="sm">
                            Type: {variant.type}
                          </Text>
                        </Group>
                      </div>

                      <Group gap="xs">
                        <Text fw={500} size="sm">
                          {formatPrice(variant.pricing?.salePrice || variant.pricing?.basePrice)}
                        </Text>
                        <Text c="dimmed" size="sm">
                          Stock: {variant.inventory?.available || 0}
                        </Text>
                        <ActionIcon
                          onClick={() => toggleVariantExpansion(variant.id)}
                          variant="subtle"
                        >
                          {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                        </ActionIcon>
                      </Group>
                    </Group>

                    {/* Attribute Pills */}
                    {variant.attributes && variant.attributes.length > 0 && (
                      <Group gap="xs">
                        {variant.attributes.map((attr) => (
                          <Group key={attr.id} gap={4}>
                            <Badge
                              color={getAttributeTypeColor(attr.type)}
                              leftSection={
                                attr.type === 'color' && attr.colorCode ? (
                                  <ColorSwatch color={attr.colorCode} size={12} />
                                ) : undefined
                              }
                              size="sm"
                              variant="outline"
                            >
                              {attr.name}: {attr.displayValue || attr.value}
                            </Badge>
                          </Group>
                        ))}
                      </Group>
                    )}

                    {/* Expanded Details */}
                    <Collapse in={isExpanded}>
                      <Stack gap="md" mt="md">
                        <SimpleGrid cols={2} spacing="md">
                          {/* Edit SKU and Name */}
                          <TextInput
                            label="SKU"
                            {...form.getInputProps(`variants.${variantIndex}.sku`)}
                          />
                          <TextInput
                            label="Name"
                            {...form.getInputProps(`variants.${variantIndex}.name`)}
                          />

                          {/* Pricing */}
                          <NumberInput
                            prefix="$"
                            decimalScale={2}
                            label="Base Price"
                            {...form.getInputProps(`variants.${variantIndex}.pricing.basePrice`)}
                          />
                          <NumberInput
                            prefix="$"
                            decimalScale={2}
                            label="Sale Price"
                            {...form.getInputProps(`variants.${variantIndex}.pricing.salePrice`)}
                          />

                          {/* Inventory */}
                          <NumberInput
                            label="Available Stock"
                            {...form.getInputProps(`variants.${variantIndex}.inventory.available`)}
                          />
                          <NumberInput
                            label="Reserved Stock"
                            {...form.getInputProps(`variants.${variantIndex}.inventory.reserved`)}
                          />

                          {/* Status */}
                          <Select
                            label="Status"
                            {...form.getInputProps(`variants.${variantIndex}.status`)}
                            data={[
                              { label: 'Active', value: 'active' },
                              { label: 'Inactive', value: 'inactive' },
                              { label: 'Discontinued', value: 'discontinued' },
                            ]}
                          />
                        </SimpleGrid>

                        {/* Actions */}
                        <Group gap="xs">
                          <Button leftSection={<IconPhoto size={14} />} size="xs" variant="light">
                            Manage Images
                          </Button>
                          <Button
                            leftSection={<IconColorPicker size={14} />}
                            size="xs"
                            variant="light"
                          >
                            Edit Attributes
                          </Button>
                          <Button
                            color="red"
                            leftSection={<IconTrash size={14} />}
                            onClick={() => {
                              const newVariants = variants.filter((_, i) => i !== variantIndex);
                              form.setFieldValue('variants', newVariants);
                            }}
                            size="xs"
                            variant="outline"
                          >
                            Delete
                          </Button>
                        </Group>
                      </Stack>
                    </Collapse>
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        </Stack>
      )}

      {/* Create Variants Tab */}
      {activeTab === 'create' && (
        <Stack>
          <Text fw={600} size="lg">
            Create Product Variants
          </Text>

          <Card withBorder>
            <Stack>
              <Text fw={500} mb="md">
                Quick Create
              </Text>

              <Group justify="center">
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={handleCreateVariant}
                  size="lg"
                >
                  Create New Variant
                </Button>
                <Button leftSection={<IconEdit size={16} />} variant="outline">
                  Bulk Import Variants
                </Button>
              </Group>
            </Stack>
          </Card>
        </Stack>
      )}

      {/* Bulk Actions Tab */}
      {activeTab === 'bulk' && (
        <Stack>
          <Text fw={600} size="lg">
            Bulk Actions
          </Text>

          {selectedVariants.length > 0 ? (
            <Card withBorder style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
              <Group justify="space-between">
                <Text fw={500}>{selectedVariants.length} variants selected</Text>
                <Group gap="xs">
                  <Button onClick={() => handleBulkStatusUpdate('active')} size="sm">
                    Set Active
                  </Button>
                  <Button onClick={() => handleBulkStatusUpdate('inactive')} size="sm">
                    Set Inactive
                  </Button>
                  <Button color="red" onClick={handleDeleteVariants} size="sm">
                    Delete Selected
                  </Button>
                </Group>
              </Group>
            </Card>
          ) : (
            <Card withBorder>
              <Text c="dimmed" ta="center">
                Select variants from the Overview tab to perform bulk actions
              </Text>
            </Card>
          )}
        </Stack>
      )}
    </Stack>
  );
}
