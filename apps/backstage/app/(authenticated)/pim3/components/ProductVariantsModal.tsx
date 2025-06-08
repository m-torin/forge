"use client";

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Checkbox,
  Collapse,
  ColorSwatch,
  Group,
  Modal,
  NumberInput,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconChevronDown,
  IconChevronUp,
  IconColorPicker,
  IconEdit,
  IconEye,
  IconExternalLink,
  IconPhoto,
  IconPlus,
  IconShoppingCart,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";

// Product variant data structure supporting parent-child relationships (UI only)
interface VariantAttribute {
  id: string;
  name: string;
  type: "color" | "size" | "material" | "style" | "pattern" | "edition" | "version" | "other";
  value: string;
  displayValue?: string;
  colorCode?: string; // For color attributes
  sortOrder: number;
}

interface PdpJoinData {
  id: string;
  brandId: string;
  brandName: string;
  brandType: string;
  createdAt: Date;
  // Affiliate data specific to this variant-brand combination
  affiliateData?: {
    productUrl?: string;
    affiliateUrl?: string;
    price?: number;
    availability?: string;
    isPrimary?: boolean;
  };
}

interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  type: "PHYSICAL" | "DIGITAL" | "VARIANT";
  
  // Parent-child relationship
  parentId?: string;
  parentProduct?: {
    id: string;
    name: string;
    sku: string;
  };
  childVariants?: ProductVariant[];
  isParent: boolean;
  
  attributes: VariantAttribute[];
  pricing: {
    basePrice?: number;
    salePrice?: number;
    cost?: number;
    margin?: number;
  };
  inventory: {
    available: number;
    reserved: number;
    committed: number;
  };
  status: "active" | "inactive" | "discontinued";
  isDefault: boolean;
  images: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: "in" | "cm";
  };
  
  // Each variant can have its own PDP joins
  pdpJoins: PdpJoinData[];
  
  createdAt: Date;
  updatedAt: Date;
}

interface AttributeTemplate {
  name: string;
  type: "color" | "size" | "material" | "style" | "pattern" | "other";
  values: Array<{
    value: string;
    displayValue?: string;
    colorCode?: string;
  }>;
}

interface ProductVariantsModalProps {
  opened: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onUpdate?: () => void;
}

export function ProductVariantsModal({
  opened,
  onClose,
  productId,
  productName,
  onUpdate,
}: ProductVariantsModalProps) {
  // Demo data showing parent-child relationships
  const [variants, setVariants] = useState<ProductVariant[]>([
    // Parent Product - Acts as the main product
    {
      id: "parent-1",
      sku: "TSHIRT-BASIC",
      name: "Basic T-Shirt (Parent)",
      type: "PHYSICAL",
      isParent: true,
      attributes: [],
      pricing: { basePrice: 29.99, cost: 12.00, margin: 60 },
      inventory: { available: 0, reserved: 0, committed: 0 }, // Parent doesn't hold inventory
      status: "active",
      isDefault: false,
      images: ["/api/placeholder/300/300"],
      pdpJoins: [], // Parent might not have PDP joins, variants do
      createdAt: new Date("2024-11-01"),
      updatedAt: new Date("2025-01-15"),
      childVariants: [], // Will be populated
    },
    
    // Child Variants - Actual sellable products
    {
      id: "var-1",
      sku: "TSHIRT-BASIC-S-BLK",
      name: "Basic T-Shirt - Small, Black",
      type: "VARIANT",
      parentId: "parent-1",
      parentProduct: {
        id: "parent-1",
        name: "Basic T-Shirt",
        sku: "TSHIRT-BASIC"
      },
      isParent: false,
      attributes: [
        { id: "attr-1", name: "Size", type: "size", value: "S", displayValue: "Small", sortOrder: 1 },
        { id: "attr-2", name: "Color", type: "color", value: "black", displayValue: "Black", colorCode: "#000000", sortOrder: 2 },
      ],
      pricing: { basePrice: 29.99, salePrice: 24.99, cost: 12.00, margin: 52 },
      inventory: { available: 45, reserved: 5, committed: 2 },
      status: "active",
      isDefault: true,
      images: ["/api/placeholder/300/300"],
      weight: 0.3,
      dimensions: { length: 24, width: 18, height: 1, unit: "in" },
      pdpJoins: [
        {
          id: "pdp-1",
          brandId: "brand-amazon",
          brandName: "Amazon",
          brandType: "MARKETPLACE",
          createdAt: new Date("2024-12-01"),
          affiliateData: {
            productUrl: "https://amazon.com/tshirt-small-black",
            affiliateUrl: "https://amazon.com/affiliate/tshirt-small-black",
            price: 34.99,
            availability: "In Stock",
            isPrimary: true,
          }
        },
        {
          id: "pdp-2",
          brandId: "brand-walmart",
          brandName: "Walmart",
          brandType: "RETAILER",
          createdAt: new Date("2024-12-05"),
          affiliateData: {
            productUrl: "https://walmart.com/tshirt-small-black",
            affiliateUrl: "https://walmart.com/affiliate/tshirt-small-black",
            price: 32.99,
            availability: "In Stock",
            isPrimary: false,
          }
        }
      ],
      createdAt: new Date("2024-12-01"),
      updatedAt: new Date("2025-01-15"),
    },
    
    {
      id: "var-2", 
      sku: "TSHIRT-BASIC-M-BLK",
      name: "Basic T-Shirt - Medium, Black",
      type: "VARIANT",
      parentId: "parent-1",
      parentProduct: {
        id: "parent-1",
        name: "Basic T-Shirt",
        sku: "TSHIRT-BASIC"
      },
      isParent: false,
      attributes: [
        { id: "attr-3", name: "Size", type: "size", value: "M", displayValue: "Medium", sortOrder: 1 },
        { id: "attr-4", name: "Color", type: "color", value: "black", displayValue: "Black", colorCode: "#000000", sortOrder: 2 },
      ],
      pricing: { basePrice: 29.99, cost: 12.00, margin: 60 },
      inventory: { available: 32, reserved: 8, committed: 1 },
      status: "active",
      isDefault: false,
      images: ["/api/placeholder/300/300"],
      weight: 0.4,
      dimensions: { length: 26, width: 20, height: 1, unit: "in" },
      pdpJoins: [
        {
          id: "pdp-3",
          brandId: "brand-amazon",
          brandName: "Amazon",
          brandType: "MARKETPLACE",
          createdAt: new Date("2024-12-01"),
          affiliateData: {
            productUrl: "https://amazon.com/tshirt-medium-black",
            affiliateUrl: "https://amazon.com/affiliate/tshirt-medium-black",
            price: 34.99,
            availability: "In Stock",
            isPrimary: true,
          }
        }
      ],
      createdAt: new Date("2024-12-01"),
      updatedAt: new Date("2025-01-10"),
    },
    
    {
      id: "var-3",
      sku: "TSHIRT-BASIC-L-RED",
      name: "Basic T-Shirt - Large, Red",
      type: "VARIANT",
      parentId: "parent-1",
      parentProduct: {
        id: "parent-1",
        name: "Basic T-Shirt",
        sku: "TSHIRT-BASIC"
      },
      isParent: false,
      attributes: [
        { id: "attr-5", name: "Size", type: "size", value: "L", displayValue: "Large", sortOrder: 1 },
        { id: "attr-6", name: "Color", type: "color", value: "red", displayValue: "Red", colorCode: "#FF0000", sortOrder: 2 },
      ],
      pricing: { basePrice: 31.99, cost: 12.50, margin: 61 },
      inventory: { available: 18, reserved: 2, committed: 0 },
      status: "active",
      isDefault: false,
      images: ["/api/placeholder/300/300"],
      weight: 0.5,
      dimensions: { length: 28, width: 22, height: 1, unit: "in" },
      pdpJoins: [
        {
          id: "pdp-4",
          brandId: "brand-target",
          brandName: "Target",
          brandType: "RETAILER",
          createdAt: new Date("2024-12-10"),
          affiliateData: {
            productUrl: "https://target.com/tshirt-large-red",
            affiliateUrl: "https://target.com/affiliate/tshirt-large-red",
            price: 36.99,
            availability: "Limited Stock",
            isPrimary: true,
          }
        }
      ],
      createdAt: new Date("2024-12-15"),
      updatedAt: new Date("2025-01-05"),
    },

    // Book Example - Different editions
    {
      id: "book-parent",
      sku: "BOOK-LEARNING-JS",
      name: "Learning JavaScript (Parent)",
      type: "DIGITAL",
      isParent: true,
      attributes: [],
      pricing: { basePrice: 49.99, cost: 15.00, margin: 70 },
      inventory: { available: 0, reserved: 0, committed: 0 },
      status: "active",
      isDefault: false,
      images: ["/api/placeholder/300/400"],
      pdpJoins: [],
      createdAt: new Date("2024-10-01"),
      updatedAt: new Date("2025-01-10"),
    },
    
    {
      id: "book-1",
      sku: "BOOK-LEARNING-JS-1ST",
      name: "Learning JavaScript - 1st Edition",
      type: "VARIANT",
      parentId: "book-parent",
      parentProduct: {
        id: "book-parent",
        name: "Learning JavaScript",
        sku: "BOOK-LEARNING-JS"
      },
      isParent: false,
      attributes: [
        { id: "attr-7", name: "Edition", type: "edition", value: "1st", displayValue: "1st Edition", sortOrder: 1 },
        { id: "attr-8", name: "Format", type: "other", value: "paperback", displayValue: "Paperback", sortOrder: 2 },
      ],
      pricing: { basePrice: 39.99, cost: 12.00, margin: 70 },
      inventory: { available: 12, reserved: 1, committed: 0 },
      status: "active",
      isDefault: false,
      images: ["/api/placeholder/300/400"],
      pdpJoins: [
        {
          id: "pdp-5",
          brandId: "brand-amazon",
          brandName: "Amazon Books",
          brandType: "MARKETPLACE",
          createdAt: new Date("2024-10-01"),
          affiliateData: {
            productUrl: "https://amazon.com/learning-js-1st-edition",
            affiliateUrl: "https://amazon.com/affiliate/learning-js-1st",
            price: 44.99,
            availability: "In Stock",
            isPrimary: true,
          }
        }
      ],
      createdAt: new Date("2024-10-01"),
      updatedAt: new Date("2025-01-05"),
    },
    
    {
      id: "book-2",
      sku: "BOOK-LEARNING-JS-2ND",
      name: "Learning JavaScript - 2nd Edition",
      type: "VARIANT",
      parentId: "book-parent",
      parentProduct: {
        id: "book-parent",
        name: "Learning JavaScript",
        sku: "BOOK-LEARNING-JS"
      },
      isParent: false,
      attributes: [
        { id: "attr-9", name: "Edition", type: "edition", value: "2nd", displayValue: "2nd Edition", sortOrder: 1 },
        { id: "attr-10", name: "Format", type: "other", value: "hardcover", displayValue: "Hardcover", sortOrder: 2 },
      ],
      pricing: { basePrice: 59.99, cost: 20.00, margin: 67 },
      inventory: { available: 25, reserved: 3, committed: 1 },
      status: "active",
      isDefault: true,
      images: ["/api/placeholder/300/400"],
      pdpJoins: [
        {
          id: "pdp-6",
          brandId: "brand-amazon",
          brandName: "Amazon Books",
          brandType: "MARKETPLACE",
          createdAt: new Date("2024-11-01"),
          affiliateData: {
            productUrl: "https://amazon.com/learning-js-2nd-edition",
            affiliateUrl: "https://amazon.com/affiliate/learning-js-2nd",
            price: 64.99,
            availability: "In Stock",
            isPrimary: true,
          }
        },
        {
          id: "pdp-7",
          brandId: "brand-barnes-noble",
          brandName: "Barnes & Noble",
          brandType: "RETAILER",
          createdAt: new Date("2024-11-05"),
          affiliateData: {
            productUrl: "https://barnesandnoble.com/learning-js-2nd",
            affiliateUrl: "https://barnesandnoble.com/affiliate/learning-js-2nd",
            price: 62.99,
            availability: "In Stock",
            isPrimary: false,
          }
        }
      ],
      createdAt: new Date("2024-11-01"),
      updatedAt: new Date("2025-01-08"),
    },
  ]);

  const [attributeTemplates] = useState<AttributeTemplate[]>([
    {
      name: "Size",
      type: "size",
      values: [
        { value: "XS", displayValue: "Extra Small" },
        { value: "S", displayValue: "Small" },
        { value: "M", displayValue: "Medium" },
        { value: "L", displayValue: "Large" },
        { value: "XL", displayValue: "Extra Large" },
        { value: "XXL", displayValue: "2X Large" },
      ],
    },
    {
      name: "Color",
      type: "color", 
      values: [
        { value: "black", displayValue: "Black", colorCode: "#000000" },
        { value: "white", displayValue: "White", colorCode: "#FFFFFF" },
        { value: "red", displayValue: "Red", colorCode: "#FF0000" },
        { value: "blue", displayValue: "Blue", colorCode: "#0000FF" },
        { value: "green", displayValue: "Green", colorCode: "#008000" },
        { value: "navy", displayValue: "Navy Blue", colorCode: "#000080" },
      ],
    },
    {
      name: "Edition",
      type: "edition",
      values: [
        { value: "1st", displayValue: "1st Edition" },
        { value: "2nd", displayValue: "2nd Edition" },
        { value: "3rd", displayValue: "3rd Edition" },
        { value: "revised", displayValue: "Revised Edition" },
        { value: "special", displayValue: "Special Edition" },
        { value: "limited", displayValue: "Limited Edition" },
      ],
    },
    {
      name: "Material",
      type: "material",
      values: [
        { value: "cotton", displayValue: "Cotton" },
        { value: "polyester", displayValue: "Polyester" },
        { value: "wool", displayValue: "Wool" },
        { value: "silk", displayValue: "Silk" },
        { value: "leather", displayValue: "Leather" },
      ],
    },
    {
      name: "Format",
      type: "other",
      values: [
        { value: "paperback", displayValue: "Paperback" },
        { value: "hardcover", displayValue: "Hardcover" },
        { value: "ebook", displayValue: "E-book" },
        { value: "audiobook", displayValue: "Audiobook" },
      ],
    },
  ]);

  const [activeTab, setActiveTab] = useState<"overview" | "create" | "bulk">("overview");
  const [expandedVariants, setExpandedVariants] = useState<Set<string>>(new Set());
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

  const toggleVariantExpansion = (variantId: string) => {
    setExpandedVariants(prev => {
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
      case "active": return "green";
      case "inactive": return "yellow";
      case "discontinued": return "red";
      default: return "gray";
    }
  };

  const getAttributeTypeColor = (type: string) => {
    switch (type) {
      case "color": return "red";
      case "size": return "blue"; 
      case "material": return "green";
      case "style": return "purple";
      case "pattern": return "orange";
      default: return "gray";
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return "Not set";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const calculateTotalInventory = () => {
    return variants.reduce((total, variant) => total + variant.inventory.available, 0);
  };

  const getVariantCombinations = () => {
    const attributeGroups = attributeTemplates.reduce((groups, template) => {
      groups[template.name] = template.values;
      return groups;
    }, {} as Record<string, any[]>);
    
    // This would generate all possible combinations
    // For demo, we'll show potential combinations count
    const combinations = Object.values(attributeGroups)
      .reduce((total, values) => total * values.length, 1);
    
    return combinations;
  };

  const handleBulkStatusUpdate = (status: "active" | "inactive" | "discontinued") => {
    if (selectedVariants.length === 0) return;

    notifications.show({
      color: "green",
      message: `Updated ${selectedVariants.length} variants to ${status}`,
      title: "Success",
    });
    setSelectedVariants([]);
  };

  const handleDeleteVariants = () => {
    if (selectedVariants.length === 0) return;

    notifications.show({
      color: "green", 
      message: `Deleted ${selectedVariants.length} variants`,
      title: "Success",
    });
    setSelectedVariants([]);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={`Product Variants - ${productName}`}
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack>
        {/* Tab Navigation */}
        <Group>
          <Button
            variant={activeTab === "overview" ? "filled" : "light"}
            onClick={() => setActiveTab("overview")}
            leftSection={<IconEye size={16} />}
          >
            Overview ({variants.length})
          </Button>
          <Button
            variant={activeTab === "create" ? "filled" : "light"}
            onClick={() => setActiveTab("create")}
            leftSection={<IconPlus size={16} />}
          >
            Create Variants
          </Button>
          <Button
            variant={activeTab === "bulk" ? "filled" : "light"}
            onClick={() => setActiveTab("bulk")}
            leftSection={<IconEdit size={16} />}
          >
            Bulk Actions
          </Button>
        </Group>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <Stack>
            {/* Summary Cards */}
            <SimpleGrid cols={4} spacing="md">
              <Card withBorder>
                <Text c="dimmed" size="sm">Total Products</Text>
                <Text fw={700} size="xl">{variants.length}</Text>
                <Text c="dimmed" size="xs">
                  {variants.filter(v => v.isParent).length} parents, {variants.filter(v => !v.isParent).length} variants
                </Text>
              </Card>
              <Card withBorder>
                <Text c="dimmed" size="sm">Total Inventory</Text>
                <Text fw={700} size="xl">{calculateTotalInventory()}</Text>
                <Text c="dimmed" size="xs">Sellable variants only</Text>
              </Card>
              <Card withBorder>
                <Text c="dimmed" size="sm">Price Range</Text>
                <Text fw={700} size="xl">
                  {formatPrice(Math.min(...variants.filter(v => !v.isParent).map(v => v.pricing.basePrice || 0)))} - {formatPrice(Math.max(...variants.filter(v => !v.isParent).map(v => v.pricing.basePrice || 0)))}
                </Text>
                <Text c="dimmed" size="xs">Variant pricing</Text>
              </Card>
              <Card withBorder>
                <Text c="dimmed" size="sm">Total PDP Joins</Text>
                <Text fw={700} size="xl">{variants.reduce((total, v) => total + v.pdpJoins.length, 0)}</Text>
                <Text c="dimmed" size="xs">Across all variants</Text>
              </Card>
            </SimpleGrid>

            {/* Variant List */}
            <Stack>
              {variants.map((variant) => {
                const isExpanded = expandedVariants.has(variant.id);
                return (
                  <Card key={variant.id} withBorder>
                    <Stack gap="sm">
                      <Group justify="space-between">
                        <div>
                          <Group gap="sm">
                            <Checkbox
                              checked={selectedVariants.includes(variant.id)}
                              onChange={(e) => {
                                if (e.currentTarget.checked) {
                                  setSelectedVariants([...selectedVariants, variant.id]);
                                } else {
                                  setSelectedVariants(selectedVariants.filter(id => id !== variant.id));
                                }
                              }}
                            />
                            <Text fw={600}>{variant.name}</Text>
                            
                            {/* Product Type & Hierarchy Badges */}
                            {variant.isParent ? (
                              <Badge color="purple" variant="filled" size="sm">
                                PARENT
                              </Badge>
                            ) : (
                              <Badge color="cyan" variant="light" size="sm">
                                VARIANT
                              </Badge>
                            )}
                            
                            <Badge color={getStatusColor(variant.status)} variant="light" size="sm">
                              {variant.status.toUpperCase()}
                            </Badge>
                            
                            {variant.isDefault && (
                              <Badge color="blue" variant="filled" size="sm">
                                DEFAULT
                              </Badge>
                            )}
                            {variant.pricing.salePrice && (
                              <Badge color="red" variant="light" size="sm">
                                ON SALE
                              </Badge>
                            )}
                            
                            {/* PDP Joins Count */}
                            {variant.pdpJoins.length > 0 && (
                              <Badge color="green" variant="outline" size="sm">
                                {variant.pdpJoins.length} PDP{variant.pdpJoins.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </Group>
                          
                          <Group gap="sm" mt="xs">
                            <Text c="dimmed" size="sm">SKU: {variant.sku}</Text>
                            <Text c="dimmed" size="sm">Type: {variant.type}</Text>
                            {variant.parentProduct && (
                              <Text c="dimmed" size="sm">
                                Parent: {variant.parentProduct.name} ({variant.parentProduct.sku})
                              </Text>
                            )}
                          </Group>
                        </div>
                        
                        <Group gap="xs">
                          <Text fw={500} size="sm">
                            {formatPrice(variant.pricing.salePrice || variant.pricing.basePrice)}
                          </Text>
                          <Text c="dimmed" size="sm">
                            Stock: {variant.inventory.available}
                          </Text>
                          <ActionIcon
                            variant="subtle"
                            onClick={() => toggleVariantExpansion(variant.id)}
                          >
                            {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                          </ActionIcon>
                        </Group>
                      </Group>

                      {/* Attribute Pills */}
                      <Group gap="xs">
                        {variant.attributes.map((attr) => (
                          <Group key={attr.id} gap={4}>
                            <Badge
                              color={getAttributeTypeColor(attr.type)}
                              variant="outline"
                              size="sm"
                              leftSection={
                                attr.type === "color" && attr.colorCode ? (
                                  <ColorSwatch color={attr.colorCode} size={12} />
                                ) : undefined
                              }
                            >
                              {attr.name}: {attr.displayValue || attr.value}
                            </Badge>
                          </Group>
                        ))}
                      </Group>

                      {/* Expanded Details */}
                      <Collapse in={isExpanded}>
                        <Stack gap="md" mt="md">
                          <SimpleGrid cols={2} spacing="md">
                            {/* Pricing Details */}
                            <Card withBorder>
                              <Text fw={500} mb="sm" size="sm">Pricing</Text>
                              <Stack gap="xs">
                                <Group justify="space-between">
                                  <Text size="sm">Base Price:</Text>
                                  <Text fw={500} size="sm">{formatPrice(variant.pricing.basePrice)}</Text>
                                </Group>
                                {variant.pricing.salePrice && (
                                  <Group justify="space-between">
                                    <Text size="sm">Sale Price:</Text>
                                    <Text fw={500} size="sm" c="red">{formatPrice(variant.pricing.salePrice)}</Text>
                                  </Group>
                                )}
                                <Group justify="space-between">
                                  <Text size="sm">Cost:</Text>
                                  <Text fw={500} size="sm">{formatPrice(variant.pricing.cost)}</Text>
                                </Group>
                                <Group justify="space-between">
                                  <Text size="sm">Margin:</Text>
                                  <Text fw={500} size="sm">{variant.pricing.margin}%</Text>
                                </Group>
                              </Stack>
                            </Card>

                            {/* Inventory Details */}
                            <Card withBorder>
                              <Text fw={500} mb="sm" size="sm">Inventory</Text>
                              <Stack gap="xs">
                                <Group justify="space-between">
                                  <Text size="sm">Available:</Text>
                                  <Text fw={500} size="sm" c="green">{variant.inventory.available}</Text>
                                </Group>
                                <Group justify="space-between">
                                  <Text size="sm">Reserved:</Text>
                                  <Text fw={500} size="sm" c="blue">{variant.inventory.reserved}</Text>
                                </Group>
                                <Group justify="space-between">
                                  <Text size="sm">Committed:</Text>
                                  <Text fw={500} size="sm" c="orange">{variant.inventory.committed}</Text>
                                </Group>
                              </Stack>
                            </Card>
                          </SimpleGrid>

                          {/* Physical Details */}
                          {(variant.weight || variant.dimensions) && (
                            <Card withBorder>
                              <Text fw={500} mb="sm" size="sm">Physical Details</Text>
                              <Group gap="md">
                                {variant.weight && (
                                  <Text size="sm">
                                    <Text c="dimmed" span>Weight:</Text> {variant.weight} lbs
                                  </Text>
                                )}
                                {variant.dimensions && (
                                  <Text size="sm">
                                    <Text c="dimmed" span>Dimensions:</Text>{" "}
                                    {variant.dimensions.length} × {variant.dimensions.width} × {variant.dimensions.height} {variant.dimensions.unit}
                                  </Text>
                                )}
                              </Group>
                            </Card>
                          )}

                          {/* PDP Joins Section */}
                          {variant.pdpJoins.length > 0 && (
                            <Card withBorder>
                              <Text fw={500} mb="sm" size="sm">PDP Joins ({variant.pdpJoins.length})</Text>
                              <Stack gap="sm">
                                {variant.pdpJoins.map((pdp) => (
                                  <Card key={pdp.id} withBorder>
                                    <Group justify="space-between">
                                      <div>
                                        <Group gap="sm">
                                          <Text fw={500} size="sm">{pdp.brandName}</Text>
                                          <Badge color="blue" variant="light" size="xs">
                                            {pdp.brandType}
                                          </Badge>
                                          {pdp.affiliateData?.isPrimary && (
                                            <Badge color="green" variant="filled" size="xs">
                                              PRIMARY
                                            </Badge>
                                          )}
                                        </Group>
                                        {pdp.affiliateData && (
                                          <Group gap="md" mt="xs">
                                            {pdp.affiliateData.price && (
                                              <Text size="xs">
                                                <Text c="dimmed" span>Price:</Text> {formatPrice(pdp.affiliateData.price)}
                                              </Text>
                                            )}
                                            {pdp.affiliateData.availability && (
                                              <Text size="xs">
                                                <Text c="dimmed" span>Stock:</Text> {pdp.affiliateData.availability}
                                              </Text>
                                            )}
                                          </Group>
                                        )}
                                      </div>
                                      <Group gap="xs">
                                        {pdp.affiliateData?.productUrl && (
                                          <ActionIcon
                                            href={pdp.affiliateData.productUrl}
                                            component="a"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            size="xs"
                                            variant="subtle"
                                            title="View Product"
                                          >
                                            <IconExternalLink size={12} />
                                          </ActionIcon>
                                        )}
                                        <ActionIcon size="xs" variant="subtle" title="Edit PDP">
                                          <IconEdit size={12} />
                                        </ActionIcon>
                                      </Group>
                                    </Group>
                                  </Card>
                                ))}
                              </Stack>
                            </Card>
                          )}

                          {/* Actions */}
                          <Group gap="xs">
                            <Button size="xs" variant="light" leftSection={<IconEdit size={14} />}>
                              Edit Variant
                            </Button>
                            <Button size="xs" variant="light" leftSection={<IconPhoto size={14} />}>
                              Manage Images
                            </Button>
                            <Button size="xs" variant="light" leftSection={<IconColorPicker size={14} />}>
                              Edit Attributes
                            </Button>
                            {!variant.isParent && (
                              <Button size="xs" variant="light" leftSection={<IconShoppingCart size={14} />}>
                                Manage PDPs
                              </Button>
                            )}
                            <Button size="xs" variant="outline" color="red" leftSection={<IconTrash size={14} />}>
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
        {activeTab === "create" && (
          <Stack>
            <Text fw={600} size="lg">Create Product Variants</Text>
            
            <Card withBorder>
              <Stack>
                <Text fw={500} mb="md">Attribute Templates</Text>
                
                {attributeTemplates.map((template) => (
                  <Card key={template.name} withBorder>
                    <Stack gap="sm">
                      <Group justify="space-between">
                        <Text fw={500}>{template.name}</Text>
                        <Badge color={getAttributeTypeColor(template.type)} variant="light">
                          {template.type}
                        </Badge>
                      </Group>
                      
                      <Group gap="xs">
                        {template.values.map((value, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            leftSection={
                              template.type === "color" && value.colorCode ? (
                                <ColorSwatch color={value.colorCode} size={12} />
                              ) : undefined
                            }
                          >
                            {value.displayValue || value.value}
                          </Badge>
                        ))}
                      </Group>
                    </Stack>
                  </Card>
                ))}
                
                <Card withBorder style={{ backgroundColor: "var(--mantine-color-blue-0)" }}>
                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>Potential Combinations</Text>
                      <Text c="dimmed" size="sm">Based on selected attributes</Text>
                    </div>
                    <Text fw={700} size="xl">{getVariantCombinations()}</Text>
                  </Group>
                </Card>
                
                <Group justify="center">
                  <Button leftSection={<IconPlus size={16} />} size="lg">
                    Generate All Combinations
                  </Button>
                  <Button variant="outline" leftSection={<IconEdit size={16} />}>
                    Create Custom Variant
                  </Button>
                </Group>
              </Stack>
            </Card>
          </Stack>
        )}

        {/* Bulk Actions Tab */}
        {activeTab === "bulk" && (
          <Stack>
            <Text fw={600} size="lg">Bulk Actions</Text>
            
            {selectedVariants.length > 0 ? (
              <Card withBorder style={{ backgroundColor: "var(--mantine-color-blue-0)" }}>
                <Group justify="space-between">
                  <Text fw={500}>{selectedVariants.length} variants selected</Text>
                  <Group gap="xs">
                    <Button size="sm" onClick={() => handleBulkStatusUpdate("active")}>
                      Set Active
                    </Button>
                    <Button size="sm" onClick={() => handleBulkStatusUpdate("inactive")}>
                      Set Inactive  
                    </Button>
                    <Button size="sm" color="red" onClick={handleDeleteVariants}>
                      Delete Selected
                    </Button>
                  </Group>
                </Group>
              </Card>
            ) : (
              <Card withBorder>
                <Text ta="center" c="dimmed">
                  Select variants from the Overview tab to perform bulk actions
                </Text>
              </Card>
            )}

            {/* Bulk Edit Options */}
            <SimpleGrid cols={2} spacing="md">
              <Card withBorder>
                <Stack>
                  <Text fw={500}>Bulk Price Update</Text>
                  <NumberInput label="New Base Price" placeholder="299.99" />
                  <Select
                    label="Update Type"
                    data={[
                      { value: "replace", label: "Replace Price" },
                      { value: "increase", label: "Increase by Amount" },
                      { value: "decrease", label: "Decrease by Amount" },
                      { value: "percentage", label: "Percentage Change" },
                    ]}
                  />
                  <Button size="sm">Update Prices</Button>
                </Stack>
              </Card>

              <Card withBorder>
                <Stack>
                  <Text fw={500}>Bulk Inventory Update</Text>
                  <NumberInput label="Stock Adjustment" placeholder="0" />
                  <Select
                    label="Adjustment Type"
                    data={[
                      { value: "set", label: "Set Stock Level" },
                      { value: "add", label: "Add to Stock" },
                      { value: "subtract", label: "Subtract from Stock" },
                    ]}
                  />
                  <Button size="sm">Update Inventory</Button>
                </Stack>
              </Card>
            </SimpleGrid>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}