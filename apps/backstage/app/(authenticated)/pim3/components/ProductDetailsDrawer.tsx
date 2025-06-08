"use client";

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Code,
  CopyButton,
  Divider,
  Drawer,
  Group,
  Image,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconBarcode,
  IconBox,
  IconBuilding,
  IconCheck,
  IconCopy,
  IconCurrency,
  IconEdit,
  IconExternalLink,
  IconGift,
  IconHistory,
  IconPalette,
  IconPhoto,
  IconShoppingCart,
} from "@tabler/icons-react";
import { useState } from "react";

import { InventoryManagementModal } from "./InventoryManagementModal";
import { PDPManagementModal } from "./PDPManagementModal";
import { PriceHistoryModal } from "./PriceHistoryModal";
import { ProductBundlingModal } from "./ProductBundlingModal";
import { ProductLifecycleModal } from "./ProductLifecycleModal";
import { ProductVariantsModal } from "./ProductVariantsModal";
import { SupplierProcurementModal } from "./SupplierProcurementModal";

import type { Product } from "@repo/database/prisma";

interface ProductWithRelations extends Product {
  _count: {
    scanHistory: number;
    soldBy: number;
  };
  barcodes: {
    id: string;
    barcode: string;
    type: string;
    isPrimary: boolean;
    createdAt: Date;
  }[];
  digitalAssets: {
    id: string;
    url: string;
    type: string;
    filename: string;
    alt?: string | null;
    description?: string | null;
    sortOrder: number;
  }[];
  scanHistory: {
    id: string;
    barcode: string;
    success: boolean;
    scannedAt: Date;
    platform?: string | null;
    user?: { name: string; email: string } | null;
  }[];
  soldBy: {
    id: string;
    createdAt: Date;
    brand: {
      id: string;
      name: string;
      slug: string;
      type: string;
      baseUrl: string | null;
      status: string;
    };
  }[];
}

interface ProductDetailsDrawerProps {
  onClose: () => void;
  onUpdate?: () => void;
  opened: boolean;
  product: ProductWithRelations | null;
}

export function ProductDetailsDrawer({
  onClose,
  onUpdate,
  opened,
  product,
}: ProductDetailsDrawerProps) {
  const [pdpModalOpened, setPdpModalOpened] = useState(false);
  const [inventoryModalOpened, setInventoryModalOpened] = useState(false);
  const [variantsModalOpened, setVariantsModalOpened] = useState(false);
  const [supplierModalOpened, setSupplierModalOpened] = useState(false);
  const [priceHistoryModalOpened, setPriceHistoryModalOpened] = useState(false);
  const [bundlingModalOpened, setBundlingModalOpened] = useState(false);

  if (!product) return null;

  const formatCurrency = (price?: number | null, currency?: string | null) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-US", {
      currency: currency || "USD",
      style: "currency",
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "DRAFT":
        return "blue";
      case "ARCHIVED":
        return "gray";
      case "DISCONTINUED":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Drawer
      onClose={onClose}
      opened={opened}
      position="right"
      size="xl"
      title={`Edit Product: ${product.name}`}
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack>
        {/* Basic Information */}
        <Card withBorder>
          <Stack>
            <Group justify="space-between">
              <Text fw={600} size="lg">
                Basic Information
              </Text>
              <Badge color={getStatusColor(product.status)} variant="light">
                {product.status}
              </Badge>
            </Group>

            <SimpleGrid cols={2} spacing="md">
              <div>
                <Text c="dimmed" size="sm">
                  SKU
                </Text>
                <Group gap="xs">
                  <Text fw={500}>{product.sku}</Text>
                  <CopyButton value={product.sku}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? "Copied" : "Copy SKU"}>
                        <ActionIcon
                          color={copied ? "teal" : "gray"}
                          onClick={copy}
                          size="xs"
                          variant="subtle"
                        >
                          {copied ? (
                            <IconCheck size={12} />
                          ) : (
                            <IconCopy size={12} />
                          )}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
              </div>

              <div>
                <Text c="dimmed" size="sm">
                  Category
                </Text>
                <Text fw={500}>{product.category}</Text>
              </div>

              <div>
                <Text c="dimmed" size="sm">
                  Brand
                </Text>
                <Text fw={500}>{product.brand || "N/A"}</Text>
              </div>

              <div>
                <Text c="dimmed" size="sm">
                  Price
                </Text>
                <Text fw={500}>
                  {formatCurrency(product.price, product.currency)}
                </Text>
              </div>

              <div>
                <Text c="dimmed" size="sm">
                  Created
                </Text>
                <Text fw={500}>{formatDate(product.createdAt)}</Text>
              </div>

              <div>
                <Text c="dimmed" size="sm">
                  Updated
                </Text>
                <Text fw={500}>{formatDate(product.updatedAt)}</Text>
              </div>
            </SimpleGrid>

            {product.description && (
              <>
                <Divider />
                <div>
                  <Text c="dimmed" mb="xs" size="sm">
                    Description
                  </Text>
                  <Text>{product.description}</Text>
                </div>
              </>
            )}

            {product.aiGenerated && (
              <>
                <Divider />
                <Group>
                  <Badge color="violet" variant="light">
                    AI Generated
                  </Badge>
                  {product.aiConfidence && (
                    <Text c="dimmed" size="sm">
                      Confidence: {(product.aiConfidence * 100).toFixed(1)}%
                    </Text>
                  )}
                </Group>
              </>
            )}

            {product.attributes &&
              Object.keys(product.attributes as any).length > 0 && (
                <>
                  <Divider />
                  <div>
                    <Text c="dimmed" mb="xs" size="sm">
                      Attributes
                    </Text>
                    <Code block>
                      {JSON.stringify(product.attributes, null, 2)}
                    </Code>
                  </div>
                </>
              )}
          </Stack>
        </Card>

        {/* Tabs for detailed information */}
        <Tabs defaultValue="pdps">
          <Tabs.List>
            <Tabs.Tab leftSection={<IconShoppingCart size={16} />} value="pdps">
              PDPs/Sellers ({product._count.soldBy})
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconBox size={16} />} value="inventory">
              Inventory
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconPalette size={16} />} value="variants">
              Variants
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconBuilding size={16} />} value="suppliers">
              Suppliers
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconCurrency size={16} />} value="pricing">
              Pricing & History
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconGift size={16} />} value="bundling">
              Bundles & Recommendations
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconPhoto size={16} />} value="assets">
              Assets ({product.digitalAssets.length})
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconBarcode size={16} />} value="barcodes">
              Barcodes ({product.barcodes.length})
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconHistory size={16} />} value="history">
              Scan History ({product._count.scanHistory})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel pt="md" value="pdps">
            <Group justify="space-between" mb="md">
              <Text fw={500}>Product Detail Pages (PDPs)</Text>
              <Button
                leftSection={<IconEdit size={16} />}
                onClick={() => setPdpModalOpened(true)}
                size="sm"
                variant="outline"
              >
                Manage Sellers
              </Button>
            </Group>
            
            {product.soldBy.length > 0 ? (
              <Stack>
                {product.soldBy.map((pdp) => (
                  <Card key={pdp.id} withBorder>
                    <Group justify="space-between">
                      <div>
                        <Group gap="sm">
                          <Text fw={600}>{pdp.brand.name}</Text>
                          <Badge size="sm" variant="light">
                            {pdp.brand.type}
                          </Badge>
                          <Badge 
                            color={pdp.brand.status === "PUBLISHED" ? "green" : "yellow"} 
                            size="sm" 
                            variant="outline"
                          >
                            {pdp.brand.status}
                          </Badge>
                          <Badge color="blue" size="sm" variant="filled">
                            PRIMARY
                          </Badge>
                        </Group>
                        
                        {/* Affiliate Marketplace Info */}
                        <Group gap="sm" mt="xs">
                          <Text c="green" fw={500} size="sm">
                            $299.99
                          </Text>
                          <Badge color="green" size="xs" variant="dot">
                            In Stock
                          </Badge>
                          <Text c="dimmed" size="xs">
                            5.2% commission
                          </Text>
                          <Text c="dimmed" size="xs">
                            Amazon Associates
                          </Text>
                        </Group>
                        
                        {/* Performance Metrics */}
                        <Group gap="md" mt="xs">
                          <Text c="dimmed" size="xs">
                            <Text fw={500} span>1,234</Text> clicks
                          </Text>
                          <Text c="dimmed" size="xs">
                            <Text fw={500} span>67</Text> conversions
                          </Text>
                          <Text c="dimmed" size="xs">
                            CVR: <Text fw={500} span>5.4%</Text>
                          </Text>
                          <Text c="dimmed" size="xs">
                            Revenue: <Text fw={500} span>$2,340</Text>
                          </Text>
                        </Group>
                        
                        <Text c="dimmed" size="sm">
                          Added {formatDate(pdp.createdAt)}
                        </Text>
                        
                        {/* URLs */}
                        <Group gap="xs" mt="xs">
                          {pdp.brand.baseUrl && (
                            <>
                              <Text c="dimmed" size="xs">Store:</Text>
                              <ActionIcon
                                href={pdp.brand.baseUrl}
                                component="a"
                                rel="noopener noreferrer"
                                size="xs"
                                target="_blank"
                                title="Visit store"
                                variant="subtle"
                              >
                                <IconExternalLink size={12} />
                              </ActionIcon>
                            </>
                          )}
                          <Text c="dimmed" size="xs">Affiliate:</Text>
                          <ActionIcon
                            href="https://affiliate.example.com/product"
                            component="a"
                            rel="noopener noreferrer"
                            size="xs"
                            target="_blank"
                            title="Affiliate link"
                            variant="subtle"
                          >
                            <IconExternalLink size={12} />
                          </ActionIcon>
                        </Group>
                      </div>
                      <Group gap="xs">
                        <Text c="dimmed" size="xs">
                          PDP ID: {pdp.id.slice(-8)}
                        </Text>
                        <CopyButton value={pdp.id}>
                          {({ copied, copy }) => (
                            <Tooltip label={copied ? "Copied" : "Copy PDP ID"}>
                              <ActionIcon
                                color={copied ? "teal" : "gray"}
                                onClick={copy}
                                size="xs"
                                variant="subtle"
                              >
                                {copied ? (
                                  <IconCheck size={12} />
                                ) : (
                                  <IconCopy size={12} />
                                )}
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </CopyButton>
                      </Group>
                    </Group>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Stack align="center" py="xl">
                <Text c="dimmed" ta="center">
                  No sellers/PDPs configured for this product
                </Text>
                <Button
                  leftSection={<IconEdit size={16} />}
                  onClick={() => setPdpModalOpened(true)}
                  variant="light"
                >
                  Add Sellers
                </Button>
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="inventory">
            <Group justify="space-between" mb="md">
              <Text fw={500}>Inventory Management</Text>
              <Button
                leftSection={<IconEdit size={16} />}
                onClick={() => setInventoryModalOpened(true)}
                size="sm"
                variant="outline"
              >
                Manage Inventory
              </Button>
            </Group>
            
            {/* Multi-location Inventory */}
            <Stack>
              <Card withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={600} size="sm">Warehouse A - Main</Text>
                    <Badge color="green" variant="light">Active</Badge>
                  </Group>
                  
                  <SimpleGrid cols={3} spacing="md">
                    <div>
                      <Text c="dimmed" size="xs">Available Stock</Text>
                      <Text fw={600} size="lg" c="green">145 units</Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">Reserved</Text>
                      <Text fw={600} size="lg" c="blue">12 units</Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">Damaged</Text>
                      <Text fw={600} size="lg" c="red">3 units</Text>
                    </div>
                  </SimpleGrid>
                  
                  <Divider />
                  
                  <Group gap="md">
                    <Text size="sm">
                      <Text c="dimmed" span>Reorder Point:</Text> <Text fw={500} span>25 units</Text>
                    </Text>
                    <Text size="sm">
                      <Text c="dimmed" span>Max Stock:</Text> <Text fw={500} span>200 units</Text>
                    </Text>
                    <Text size="sm">
                      <Text c="dimmed" span>Last Count:</Text> <Text fw={500} span>Jan 15, 2025</Text>
                    </Text>
                  </Group>
                </Stack>
              </Card>
              
              <Card withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={600} size="sm">Warehouse B - West Coast</Text>
                    <Badge color="yellow" variant="light">Low Stock</Badge>
                  </Group>
                  
                  <SimpleGrid cols={3} spacing="md">
                    <div>
                      <Text c="dimmed" size="xs">Available Stock</Text>
                      <Text fw={600} size="lg" c="orange">8 units</Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">Reserved</Text>
                      <Text fw={600} size="lg" c="blue">5 units</Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">In Transit</Text>
                      <Text fw={600} size="lg" c="blue">50 units</Text>
                    </div>
                  </SimpleGrid>
                  
                  <Divider />
                  
                  <Group gap="md">
                    <Text size="sm">
                      <Text c="dimmed" span>Reorder Point:</Text> <Text fw={500} span>15 units</Text>
                    </Text>
                    <Text size="sm">
                      <Text c="dimmed" span>Max Stock:</Text> <Text fw={500} span>100 units</Text>
                    </Text>
                    <Text size="sm">
                      <Text c="dimmed" span>ETA:</Text> <Text fw={500} span>Jan 20, 2025</Text>
                    </Text>
                  </Group>
                </Stack>
              </Card>
              
              <Card withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={600} size="sm">Store - NYC Flagship</Text>
                    <Badge color="green" variant="light">In Stock</Badge>
                  </Group>
                  
                  <SimpleGrid cols={3} spacing="md">
                    <div>
                      <Text c="dimmed" size="xs">Floor Stock</Text>
                      <Text fw={600} size="lg" c="green">25 units</Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">Backroom</Text>
                      <Text fw={600} size="lg" c="green">15 units</Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">Display Units</Text>
                      <Text fw={600} size="lg" c="gray">2 units</Text>
                    </div>
                  </SimpleGrid>
                  
                  <Divider />
                  
                  <Group gap="md">
                    <Text size="sm">
                      <Text c="dimmed" span>Min Display:</Text> <Text fw={500} span>5 units</Text>
                    </Text>
                    <Text size="sm">
                      <Text c="dimmed" span>Last Sale:</Text> <Text fw={500} span>2 hours ago</Text>
                    </Text>
                    <Text size="sm">
                      <Text c="dimmed" span>Daily Avg:</Text> <Text fw={500} span>3.2 units</Text>
                    </Text>
                  </Group>
                </Stack>
              </Card>
              
              {/* Stock Alerts */}
              <Card withBorder p="md" style={{ backgroundColor: "var(--mantine-color-yellow-0)" }}>
                <Group gap="sm">
                  <Badge color="yellow" variant="filled">Alert</Badge>
                  <Text fw={500} size="sm">Warehouse B is below reorder point</Text>
                </Group>
                <Text c="dimmed" mt="xs" size="xs">
                  Current stock (8 units) is below reorder point (15 units). Consider placing a new order.
                </Text>
              </Card>
              
              {/* Total Summary */}
              <Card withBorder style={{ backgroundColor: "var(--mantine-color-blue-0)" }}>
                <Group justify="space-between">
                  <div>
                    <Text fw={600} size="lg">Total Available Inventory</Text>
                    <Text c="dimmed" size="sm">Across all locations</Text>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Text fw={700} size="xl" c="blue">178 units</Text>
                    <Text c="dimmed" size="xs">Worth ~$53,400</Text>
                  </div>
                </Group>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="variants">
            <Group justify="space-between" mb="md">
              <Text fw={500}>Product Variants</Text>
              <Button
                leftSection={<IconEdit size={16} />}
                onClick={() => setVariantsModalOpened(true)}
                size="sm"
                variant="outline"
              >
                Manage Variants
              </Button>
            </Group>
            
            {/* Variants Overview */}
            <Stack>
              <SimpleGrid cols={3} spacing="md">
                <Card withBorder>
                  <Text c="dimmed" size="sm">Total Variants</Text>
                  <Text fw={700} size="xl">3</Text>
                  <Text c="dimmed" size="xs">2 active, 1 inactive</Text>
                </Card>
                <Card withBorder>
                  <Text c="dimmed" size="sm">Attribute Types</Text>
                  <Text fw={700} size="xl">2</Text>
                  <Text c="dimmed" size="xs">Size, Color</Text>
                </Card>
                <Card withBorder>
                  <Text c="dimmed" size="sm">Price Range</Text>
                  <Text fw={700} size="xl">$249 - $319</Text>
                  <Text c="dimmed" size="xs">Includes sale prices</Text>
                </Card>
              </SimpleGrid>

              {/* Sample Variants Preview */}
              <Stack>
                <Card withBorder>
                  <Group justify="space-between">
                    <div>
                      <Group gap="sm">
                        <Text fw={600}>Small, Black</Text>
                        <Badge color="green" variant="light" size="sm">ACTIVE</Badge>
                        <Badge color="blue" variant="filled" size="sm">DEFAULT</Badge>
                        <Badge color="red" variant="light" size="sm">ON SALE</Badge>
                      </Group>
                      <Text c="dimmed" size="sm">SKU: PROD-001-S-BLK</Text>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Text fw={500}>$249.99</Text>
                      <Text c="dimmed" size="sm">Stock: 45</Text>
                    </div>
                  </Group>
                  <Group gap="xs" mt="sm">
                    <Badge color="blue" variant="outline" size="sm">Size: Small</Badge>
                    <Badge color="red" variant="outline" size="sm">Color: Black</Badge>
                  </Group>
                </Card>

                <Card withBorder>
                  <Group justify="space-between">
                    <div>
                      <Group gap="sm">
                        <Text fw={600}>Medium, Black</Text>
                        <Badge color="green" variant="light" size="sm">ACTIVE</Badge>
                      </Group>
                      <Text c="dimmed" size="sm">SKU: PROD-001-M-BLK</Text>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Text fw={500}>$299.99</Text>
                      <Text c="dimmed" size="sm">Stock: 32</Text>
                    </div>
                  </Group>
                  <Group gap="xs" mt="sm">
                    <Badge color="blue" variant="outline" size="sm">Size: Medium</Badge>
                    <Badge color="red" variant="outline" size="sm">Color: Black</Badge>
                  </Group>
                </Card>

                <Card withBorder>
                  <Group justify="space-between">
                    <div>
                      <Group gap="sm">
                        <Text fw={600}>Large, Red</Text>
                        <Badge color="yellow" variant="light" size="sm">INACTIVE</Badge>
                      </Group>
                      <Text c="dimmed" size="sm">SKU: PROD-001-L-RED</Text>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Text fw={500}>$319.99</Text>
                      <Text c="dimmed" size="sm">Stock: 0</Text>
                    </div>
                  </Group>
                  <Group gap="xs" mt="sm">
                    <Badge color="blue" variant="outline" size="sm">Size: Large</Badge>
                    <Badge color="red" variant="outline" size="sm">Color: Red</Badge>
                  </Group>
                </Card>
              </Stack>

              {/* Quick Actions */}
              <Card withBorder style={{ backgroundColor: "var(--mantine-color-blue-0)" }}>
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Variant Management</Text>
                    <Text c="dimmed" size="sm">Manage product variations efficiently</Text>
                  </div>
                  <Group gap="xs">
                    <Button size="sm" variant="outline">
                      Create Variant
                    </Button>
                    <Button size="sm" variant="outline">
                      Bulk Edit
                    </Button>
                    <Button size="sm">
                      View All
                    </Button>
                  </Group>
                </Group>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="suppliers">
            <Group justify="space-between" mb="md">
              <Text fw={500}>Suppliers & Procurement</Text>
              <Button
                leftSection={<IconEdit size={16} />}
                onClick={() => setSupplierModalOpened(true)}
                size="sm"
                variant="outline"
              >
                Manage Suppliers
              </Button>
            </Group>
            
            {/* Suppliers Overview */}
            <Stack>
              <SimpleGrid cols={3} spacing="md">
                <Card withBorder>
                  <Text c="dimmed" size="sm">Active Suppliers</Text>
                  <Text fw={700} size="xl">3</Text>
                  <Text c="dimmed" size="xs">All verified</Text>
                </Card>
                <Card withBorder>
                  <Text c="dimmed" size="sm">Best Unit Cost</Text>
                  <Text fw={700} size="xl">$120.00</Text>
                  <Text c="dimmed" size="xs">Global Electronics Corp</Text>
                </Card>
                <Card withBorder>
                  <Text c="dimmed" size="sm">YTD Procurement</Text>
                  <Text fw={700} size="xl">$196.9K</Text>
                  <Text c="dimmed" size="xs">3 purchase orders</Text>
                </Card>
              </SimpleGrid>

              {/* Recent Suppliers */}
              <Stack>
                <Card withBorder>
                  <Group justify="space-between">
                    <div>
                      <Group gap="sm">
                        <Text fw={600}>Global Electronics Corp</Text>
                        <Badge color="blue" variant="light" size="sm">MANUFACTURER</Badge>
                        <Badge color="green" variant="light" size="sm">ACTIVE</Badge>
                      </Group>
                      <Text c="dimmed" size="sm">Code: GEC001</Text>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Text fw={500}>$120.00/unit</Text>
                      <Text c="dimmed" size="sm">14 day lead time</Text>
                    </div>
                  </Group>
                  <Group gap="md" mt="sm">
                    <Text size="sm">
                      <Text c="dimmed" span>Rating:</Text> <Text fw={500} span>4.8/5</Text>
                    </Text>
                    <Text size="sm">
                      <Text c="dimmed" span>On-Time:</Text> <Text fw={500} span>95%</Text>
                    </Text>
                    <Text size="sm">
                      <Text c="dimmed" span>MOQ:</Text> <Text fw={500} span>100 units</Text>
                    </Text>
                    <Text size="sm">
                      <Text c="dimmed" span>Terms:</Text> <Text fw={500} span>Net 30</Text>
                    </Text>
                  </Group>
                </Card>

                <Card withBorder>
                  <Group justify="space-between">
                    <div>
                      <Group gap="sm">
                        <Text fw={600}>TechSource Distribution</Text>
                        <Badge color="green" variant="light" size="sm">DISTRIBUTOR</Badge>
                        <Badge color="green" variant="light" size="sm">ACTIVE</Badge>
                      </Group>
                      <Text c="dimmed" size="sm">Code: TSD002</Text>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Text fw={500}>$135.00/unit</Text>
                      <Text c="dimmed" size="sm">7 day lead time</Text>
                    </div>
                  </Group>
                  <Group gap="md" mt="sm">
                    <Text size="sm">
                      <Text c="dimmed" span>Rating:</Text> <Text fw={500} span>4.2/5</Text>
                    </Text>
                    <Text size="sm">
                      <Text c="dimmed" span>On-Time:</Text> <Text fw={500} span>88%</Text>
                    </Text>
                    <Text size="sm">
                      <Text c="dimmed" span>MOQ:</Text> <Text fw={500} span>50 units</Text>
                    </Text>
                    <Text size="sm">
                      <Text c="dimmed" span>Terms:</Text> <Text fw={500} span>Net 15</Text>
                    </Text>
                  </Group>
                </Card>

                <Card withBorder>
                  <Group justify="space-between">
                    <div>
                      <Group gap="sm">
                        <Text fw={600}>QuickDrop Fulfillment</Text>
                        <Badge color="orange" variant="light" size="sm">DROPSHIPPER</Badge>
                        <Badge color="green" variant="light" size="sm">ACTIVE</Badge>
                      </Group>
                      <Text c="dimmed" size="sm">Code: QDF003</Text>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Text fw={500}>$150.00/unit</Text>
                      <Text c="dimmed" size="sm">3 day lead time</Text>
                    </div>
                  </Group>
                  <Group gap="md" mt="sm">
                    <Text size="sm">
                      <Text c="dimmed" span>Rating:</Text> <Text fw={500} span>3.8/5</Text>
                    </Text>
                    <Text size="sm">
                      <Text c="dimmed" span>On-Time:</Text> <Text fw={500} span>78%</Text>
                    </Text>
                    <Text size="sm">
                      <Text c="dimmed" span>MOQ:</Text> <Text fw={500} span>1 unit</Text>
                    </Text>
                    <Text size="sm">
                      <Text c="dimmed" span>Terms:</Text> <Text fw={500} span>Immediate</Text>
                    </Text>
                  </Group>
                </Card>
              </Stack>

              {/* Recent Purchase Orders */}
              <Card withBorder>
                <Text fw={500} mb="md">Recent Purchase Orders</Text>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <div>
                      <Text fw={500} size="sm">PO-2025-018</Text>
                      <Text c="dimmed" size="xs">Global Electronics Corp - 1,000 units</Text>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Badge color="blue" variant="light" size="sm">CONFIRMED</Badge>
                      <Text c="dimmed" size="xs">$119,600 - Due Jan 29</Text>
                    </div>
                  </Group>

                  <Group justify="space-between">
                    <div>
                      <Text fw={500} size="sm">PO-2025-012</Text>
                      <Text c="dimmed" size="xs">TechSource Distribution - 100 units</Text>
                    </div>
                    <div style={{ textAlign: "right" }">
                      <Badge color="blue" variant="light" size="sm">SHIPPED</Badge>
                      <Text c="dimmed" size="xs">$14,730 - Due Jan 17</Text>
                    </div>
                  </Group>

                  <Group justify="space-between">
                    <div>
                      <Text fw={500} size="sm">PO-2025-001</Text>
                      <Text c="dimmed" size="xs">Global Electronics Corp - 500 units</Text>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Badge color="green" variant="light" size="sm">RECEIVED</Badge>
                      <Text c="dimmed" size="xs">$62,600 - Delivered Jan 14</Text>
                    </div>
                  </Group>
                </Stack>
              </Card>

              {/* Quick Actions */}
              <Card withBorder style={{ backgroundColor: "var(--mantine-color-blue-0)" }}>
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Procurement Management</Text>
                    <Text c="dimmed" size="sm">Manage suppliers and purchase orders</Text>
                  </div>
                  <Group gap="xs">
                    <Button size="sm" variant="outline">
                      Add Supplier
                    </Button>
                    <Button size="sm" variant="outline">
                      Create PO
                    </Button>
                    <Button size="sm">
                      View Analytics
                    </Button>
                  </Group>
                </Group>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="pricing">
            <Group justify="space-between" mb="md">
              <Text fw={500}>Pricing & History</Text>
              <Button
                leftSection={<IconEdit size={16} />}
                onClick={() => setPriceHistoryModalOpened(true)}
                size="sm"
                variant="outline"
              >
                Manage Pricing
              </Button>
            </Group>
            
            {/* Pricing Overview */}
            <Stack>
              <SimpleGrid cols={3} spacing="md">
                <Card withBorder>
                  <Text c="dimmed" size="sm">Current Price</Text>
                  <Text fw={700} size="xl">{formatCurrency(product.price, product.currency)}</Text>
                  <Text c="dimmed" size="xs">Regular pricing</Text>
                </Card>
                <Card withBorder>
                  <Text c="dimmed" size="sm">Active Promotions</Text>
                  <Text fw={700} size="xl">1</Text>
                  <Text c="dimmed" size="xs">New Year Sale -20%</Text>
                </Card>
                <Card withBorder>
                  <Text c="dimmed" size="sm">Price Changes</Text>
                  <Text fw={700} size="xl">5</Text>
                  <Text c="dimmed" size="xs">Lifetime changes</Text>
                </Card>
              </SimpleGrid>

              {/* Recent Price History */}
              <Card withBorder>
                <Text fw={500} mb="md">Recent Price Changes</Text>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <div>
                      <Text fw={500} size="sm">Price Decrease</Text>
                      <Text c="dimmed" size="xs">Market positioning adjustment</Text>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Group gap="xs">
                        <Text fw={500} c="green" size="sm">-$30.00 (-9.4%)</Text>
                        <Badge color="green" variant="light" size="sm">ACTIVE</Badge>
                      </Group>
                      <Text c="dimmed" size="xs">Jan 15, 2025</Text>
                    </div>
                  </Group>

                  <Group justify="space-between">
                    <div>
                      <Text fw={500} size="sm">End Promotion</Text>
                      <Text c="dimmed" size="xs">Black Friday promotion ended</Text>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Group gap="xs">
                        <Text fw={500} c="red" size="sm">+$70.00 (+28.0%)</Text>
                        <Badge color="gray" variant="light" size="sm">ENDED</Badge>
                      </Group>
                      <Text c="dimmed" size="xs">Dec 2, 2024</Text>
                    </div>
                  </Group>

                  <Group justify="space-between">
                    <div>
                      <Text fw={500} size="sm">Black Friday Sale</Text>
                      <Text c="dimmed" size="xs">Flash sale promotion</Text>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Group gap="xs">
                        <Text fw={500} c="green" size="sm">-$70.00 (-21.9%)</Text>
                        <Badge color="gray" variant="light" size="sm">ENDED</Badge>
                      </Group>
                      <Text c="dimmed" size="xs">Nov 25, 2024</Text>
                    </div>
                  </Group>
                </Stack>
              </Card>

              {/* Active Promotions */}
              <Card withBorder style={{ backgroundColor: "var(--mantine-color-green-0)" }}>
                <Group justify="space-between">
                  <div>
                    <Group gap="sm">
                      <Text fw={600}>New Year Sale</Text>
                      <Badge color="green" variant="filled" size="sm">ACTIVE</Badge>
                      <Badge color="orange" variant="light" size="sm">20% OFF</Badge>
                    </Group>
                    <Text c="dimmed" size="sm">Jan 1 - Jan 31, 2025</Text>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Group gap="xs" justify="flex-end">
                      <Text c="dimmed" size="sm" style={{ textDecoration: "line-through" }}>
                        {formatCurrency(product.price, product.currency)}
                      </Text>
                      <Text fw={600} c="green" size="lg">
                        {formatCurrency((product.price || 0) * 0.8, product.currency)}
                      </Text>
                    </Group>
                    <Text c="dimmed" size="xs">Code: NEWYEAR20</Text>
                  </div>
                </Group>
                <Group gap="md" mt="md">
                  <Text size="sm">
                    <Text c="dimmed" span>Usage:</Text> <Text fw={500} span>234/1000</Text>
                  </Text>
                  <Text size="sm">
                    <Text c="dimmed" span>Revenue:</Text> <Text fw={500} span>$15,543</Text>
                  </Text>
                  <Text size="sm">
                    <Text c="dimmed" span>Conversions:</Text> <Text fw={500} span>67</Text>
                  </Text>
                </Group>
              </Card>

              {/* Competitor Pricing */}
              <Card withBorder>
                <Text fw={500} mb="md">Competitor Pricing</Text>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <div>
                      <Group gap="sm">
                        <Text fw={500} size="sm">Amazon</Text>
                        <Badge color="green" variant="light" size="xs">IN STOCK</Badge>
                      </Group>
                      <Text c="dimmed" size="xs">Last checked: 4 hours ago</Text>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Text fw={500}>$279.99</Text>
                      <Text c="dimmed" size="xs">+ $8.99 shipping</Text>
                    </div>
                  </Group>

                  <Group justify="space-between">
                    <div>
                      <Group gap="sm">
                        <Text fw={500} size="sm">Best Buy</Text>
                        <Badge color="green" variant="light" size="xs">IN STOCK</Badge>
                      </Group>
                      <Text c="dimmed" size="xs">Last checked: 2 hours ago</Text>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Text fw={500}>$299.99</Text>
                      <Text c="dimmed" size="xs">Free shipping</Text>
                    </div>
                  </Group>

                  <Group justify="space-between">
                    <div>
                      <Group gap="sm">
                        <Text fw={500} size="sm">Target</Text>
                        <Badge color="yellow" variant="light" size="xs">LIMITED</Badge>
                      </Group>
                      <Text c="dimmed" size="xs">Last checked: 6 hours ago</Text>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Text fw={500}>$319.99</Text>
                      <Text c="dimmed" size="xs">+ $5.99 shipping</Text>
                    </div>
                  </Group>
                </Stack>
              </Card>

              {/* Quick Actions */}
              <Card withBorder style={{ backgroundColor: "var(--mantine-color-blue-0)" }}>
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Pricing Management</Text>
                    <Text c="dimmed" size="sm">Manage prices, promotions, and competitor tracking</Text>
                  </div>
                  <Group gap="xs">
                    <Button size="sm" variant="outline">
                      Update Price
                    </Button>
                    <Button size="sm" variant="outline">
                      Create Promotion
                    </Button>
                    <Button size="sm">
                      View Full History
                    </Button>
                  </Group>
                </Group>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="bundling">
            <Group justify="space-between" mb="md">
              <Text fw={500}>Product Bundling & Recommendations</Text>
              <Button
                leftSection={<IconEdit size={16} />}
                onClick={() => setBundlingModalOpened(true)}
                size="sm"
                variant="outline"
              >
                Manage Bundling
              </Button>
            </Group>
            
            {/* Bundle Overview */}
            <SimpleGrid cols={3} spacing="md">
              <Card withBorder>
                <Text c="dimmed" size="sm">Active Bundles</Text>
                <Text fw={700} size="xl">3</Text>
                <Text c="dimmed" size="xs">2 fixed, 1 flexible</Text>
              </Card>
              <Card withBorder>
                <Text c="dimmed" size="sm">Bundle Revenue</Text>
                <Text fw={700} size="xl">$1.09M</Text>
                <Text c="dimmed" size="xs">YTD performance</Text>
              </Card>
              <Card withBorder>
                <Text c="dimmed" size="sm">Avg Bundle Size</Text>
                <Text fw={700} size="xl">3.2 items</Text>
                <Text c="dimmed" size="xs">Per bundle purchase</Text>
              </Card>
            </SimpleGrid>

            {/* Active Bundles */}
            <Stack>
              <Card withBorder>
                <Group justify="space-between">
                  <div>
                    <Group gap="sm">
                      <Text fw={600}>Complete Gaming Setup</Text>
                      <Badge color="blue" variant="light" size="sm">FIXED</Badge>
                      <Badge color="green" variant="light" size="sm">ACTIVE</Badge>
                    </Group>
                    <Text c="dimmed" size="sm">Gaming laptop + peripherals bundle</Text>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Text fw={600} size="lg">$1,899.99</Text>
                    <Text c="green" size="sm">Save $300 (13.6%)</Text>
                  </div>
                </Group>
                <Group gap="md" mt="sm">
                  <Text size="sm">
                    <Text c="dimmed" span>Products:</Text> <Text fw={500} span>4 items</Text>
                  </Text>
                  <Text size="sm">
                    <Text c="dimmed" span>Purchases:</Text> <Text fw={500} span>234</Text>
                  </Text>
                  <Text size="sm">
                    <Text c="dimmed" span>Conversion:</Text> <Text fw={500} span>4.3%</Text>
                  </Text>
                  <Text size="sm">
                    <Text c="dimmed" span>Revenue:</Text> <Text fw={500} span>$444,666</Text>
                  </Text>
                </Group>
              </Card>

              <Card withBorder>
                <Group justify="space-between">
                  <div>
                    <Group gap="sm">
                      <Text fw={600}>Productivity Essentials</Text>
                      <Badge color="green" variant="light" size="sm">FLEXIBLE</Badge>
                      <Badge color="green" variant="light" size="sm">ACTIVE</Badge>
                    </Group>
                    <Text c="dimmed" size="sm">Business laptop with optional accessories</Text>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Text fw={600} size="lg">From $1,599.99</Text>
                    <Text c="green" size="sm">Save up to $250</Text>
                  </div>
                </Group>
                <Group gap="md" mt="sm">
                  <Text size="sm">
                    <Text c="dimmed" span>Products:</Text> <Text fw={500} span>3 items</Text>
                  </Text>
                  <Text size="sm">
                    <Text c="dimmed" span>Purchases:</Text> <Text fw={500} span>156</Text>
                  </Text>
                  <Text size="sm">
                    <Text c="dimmed" span>Conversion:</Text> <Text fw={500} span>4.9%</Text>
                  </Text>
                  <Text size="sm">
                    <Text c="dimmed" span>Revenue:</Text> <Text fw={500} span>$249,599</Text>
                  </Text>
                </Group>
              </Card>
            </Stack>

            {/* Recommendations */}
            <Card withBorder>
              <Text fw={500} mb="md">Product Recommendations</Text>
              <Stack gap="sm">
                <Group justify="space-between">
                  <div>
                    <Group gap="sm">
                      <Text fw={500} size="sm">Frequently Bought Together</Text>
                      <Badge color="blue" variant="light" size="xs">3 products</Badge>
                    </Group>
                    <Text c="dimmed" size="xs">Gaming Mouse, Mechanical Keyboard, Cooling Pad</Text>
                  </div>
                  <Group gap="xs">
                    <Text size="sm">CTR: <Text fw={500} span>8.0%</Text></Text>
                    <Text size="sm">Conv: <Text fw={500} span>12.6%</Text></Text>
                    <Badge color="green" variant="light" size="xs">ACTIVE</Badge>
                  </Group>
                </Group>

                <Group justify="space-between">
                  <div>
                    <Group gap="sm">
                      <Text fw={500} size="sm">Upsell Recommendations</Text>
                      <Badge color="purple" variant="light" size="xs">2 products</Badge>
                    </Group>
                    <Text c="dimmed" size="xs">Gaming Laptop Pro, Gaming Laptop Ultra</Text>
                  </div>
                  <Group gap="xs">
                    <Text size="sm">CTR: <Text fw={500} span>5.0%</Text></Text>
                    <Text size="sm">Conv: <Text fw={500} span>7.6%</Text></Text>
                    <Badge color="green" variant="light" size="xs">ACTIVE</Badge>
                  </Group>
                </Group>

                <Group justify="space-between">
                  <div>
                    <Group gap="sm">
                      <Text fw={500} size="sm">Similar Products</Text>
                      <Badge color="green" variant="light" size="xs">2 products</Badge>
                    </Group>
                    <Text c="dimmed" size="xs">Competitor Gaming Laptop, Budget Gaming Laptop</Text>
                  </div>
                  <Group gap="xs">
                    <Text size="sm">CTR: <Text fw={500} span>5.0%</Text></Text>
                    <Text size="sm">Conv: <Text fw={500} span>6.4%</Text></Text>
                    <Badge color="green" variant="light" size="xs">ACTIVE</Badge>
                  </Group>
                </Group>
              </Stack>
            </Card>

            {/* Recommendation Engines */}
            <Card withBorder>
              <Text fw={500} mb="md">Active Recommendation Engines</Text>
              <SimpleGrid cols={3} spacing="md">
                <div>
                  <Text fw={500} size="sm">AI-Powered Engine</Text>
                  <Text c="dimmed" size="xs">Deep learning recommendations</Text>
                  <Group gap="xs" mt="xs">
                    <Text size="xs">Accuracy: <Text fw={500} span>92.1%</Text></Text>
                    <Badge color="green" variant="light" size="xs">ACTIVE</Badge>
                  </Group>
                </div>
                <div>
                  <Text fw={500} size="sm">Collaborative Filtering</Text>
                  <Text c="dimmed" size="xs">User-based recommendations</Text>
                  <Group gap="xs" mt="xs">
                    <Text size="xs">Accuracy: <Text fw={500} span>87.5%</Text></Text>
                    <Badge color="green" variant="light" size="xs">ACTIVE</Badge>
                  </Group>
                </div>
                <div>
                  <Text fw={500} size="sm">Rule-Based Engine</Text>
                  <Text c="dimmed" size="xs">Business rule driven</Text>
                  <Group gap="xs" mt="xs">
                    <Text size="xs">Accuracy: <Text fw={500} span>79.3%</Text></Text>
                    <Badge color="green" variant="light" size="xs">ACTIVE</Badge>
                  </Group>
                </div>
              </SimpleGrid>
            </Card>

            {/* Quick Actions */}
            <Card withBorder style={{ backgroundColor: "var(--mantine-color-blue-0)" }}>
              <Group justify="space-between">
                <div>
                  <Text fw={500}>Bundling & Recommendations Management</Text>
                  <Text c="dimmed" size="sm">Create bundles, manage recommendations, and optimize engines</Text>
                </div>
                <Group gap="xs">
                  <Button size="sm" variant="outline">
                    Create Bundle
                  </Button>
                  <Button size="sm" variant="outline">
                    Add Recommendation
                  </Button>
                  <Button size="sm">
                    View Analytics
                  </Button>
                </Group>
              </Group>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="assets">
            {product.digitalAssets.length > 0 ? (
              <SimpleGrid cols={2} spacing="md">
                {product.digitalAssets
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((asset) => (
                    <Card key={asset.id} withBorder>
                      <Stack>
                        {asset.type === "IMAGE" && (
                          <Image
                            alt={asset.alt || asset.filename}
                            fit="cover"
                            h={120}
                            radius="sm"
                            src={asset.url}
                          />
                        )}
                        <div>
                          <Text fw={500} size="sm">
                            {asset.filename}
                          </Text>
                          <Badge size="xs" variant="light">
                            {asset.type}
                          </Badge>
                          {asset.description && (
                            <Text c="dimmed" mt="xs" size="xs">
                              {asset.description}
                            </Text>
                          )}
                        </div>
                      </Stack>
                    </Card>
                  ))}
              </SimpleGrid>
            ) : (
              <Text c="dimmed" py="xl" ta="center">
                No assets found
              </Text>
            )}
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="barcodes">
            {product.barcodes.length > 0 ? (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Barcode</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Primary</Table.Th>
                    <Table.Th>Created</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {product.barcodes.map((barcode) => (
                    <Table.Tr key={barcode.id}>
                      <Table.Td>
                        <Group gap="xs">
                          <Text ff="monospace">{barcode.barcode}</Text>
                          <CopyButton value={barcode.barcode}>
                            {({ copied, copy }) => (
                              <Tooltip
                                label={copied ? "Copied" : "Copy barcode"}
                              >
                                <ActionIcon
                                  color={copied ? "teal" : "gray"}
                                  onClick={copy}
                                  size="xs"
                                  variant="subtle"
                                >
                                  {copied ? (
                                    <IconCheck size={12} />
                                  ) : (
                                    <IconCopy size={12} />
                                  )}
                                </ActionIcon>
                              </Tooltip>
                            )}
                          </CopyButton>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="sm" variant="light">
                          {barcode.type}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {barcode.isPrimary && (
                          <Badge color="blue" size="sm">
                            Primary
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td>{formatDate(barcode.createdAt)}</Table.Td>
                      <Table.Td>
                        <CopyButton value={barcode.barcode}>
                          {({ copied, copy }) => (
                            <ActionIcon
                              onClick={copy}
                              size="sm"
                              variant="light"
                            >
                              {copied ? (
                                <IconCheck size={16} />
                              ) : (
                                <IconCopy size={16} />
                              )}
                            </ActionIcon>
                          )}
                        </CopyButton>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            ) : (
              <Text c="dimmed" py="xl" ta="center">
                No barcodes found
              </Text>
            )}
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="history">
            {product.scanHistory && product.scanHistory.length > 0 ? (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Barcode</Table.Th>
                    <Table.Th>User</Table.Th>
                    <Table.Th>Platform</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Scanned At</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {product.scanHistory.slice(0, 10).map((scan) => (
                    <Table.Tr key={scan.id}>
                      <Table.Td>
                        <Text ff="monospace" size="sm">
                          {scan.barcode}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {scan.user ? (
                          <div>
                            <Text size="sm">{scan.user.name}</Text>
                            <Text c="dimmed" size="xs">
                              {scan.user.email}
                            </Text>
                          </div>
                        ) : (
                          <Text c="dimmed" size="sm">
                            Anonymous
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {scan.platform && (
                          <Badge size="sm" variant="light">
                            {scan.platform}
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={scan.success ? "green" : "red"}
                          size="sm"
                          variant="light"
                        >
                          {scan.success ? "Success" : "Failed"}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{formatDate(scan.scannedAt)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            ) : (
              <Text c="dimmed" py="xl" ta="center">
                No scan history found
              </Text>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
      
      <PDPManagementModal
        onClose={() => setPdpModalOpened(false)}
        onUpdate={onUpdate}
        opened={pdpModalOpened}
        productId={product.id}
        productName={product.name}
      />
      
      <InventoryManagementModal
        opened={inventoryModalOpened}
        onClose={() => setInventoryModalOpened(false)}
        onUpdate={onUpdate}
        productId={product.id}
        productName={product.name}
      />
      
      <ProductVariantsModal
        opened={variantsModalOpened}
        onClose={() => setVariantsModalOpened(false)}
        onUpdate={onUpdate}
        productId={product.id}
        productName={product.name}
      />
      
      <SupplierProcurementModal
        opened={supplierModalOpened}
        onClose={() => setSupplierModalOpened(false)}
        onUpdate={onUpdate}
        productId={product.id}
        productName={product.name}
      />
      
      <PriceHistoryModal
        opened={priceHistoryModalOpened}
        onClose={() => setPriceHistoryModalOpened(false)}
        onUpdate={onUpdate}
        productId={product.id}
        productName={product.name}
        currentPrice={product.price || 0}
      />
      
      <ProductBundlingModal
        opened={bundlingModalOpened}
        onClose={() => setBundlingModalOpened(false)}
        onUpdate={onUpdate}
        productId={product.id}
        productName={product.name}
      />
    </Drawer>
  );
}
