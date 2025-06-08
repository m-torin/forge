"use client";

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Code,
  CopyButton,
  Divider,
  Group,
  Image,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Textarea,
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
  IconRocket,
  IconSave,
  IconShoppingCart,
} from "@tabler/icons-react";
import { useState } from "react";

import { InventoryManagementModal } from "../../components/InventoryManagementModal";
import { PDPManagementModal } from "../../components/PDPManagementModal";
import { PriceHistoryModal } from "../../components/PriceHistoryModal";
import { ProductBundlingModal } from "../../components/ProductBundlingModal";
import { ProductLifecycleModal } from "../../components/ProductLifecycleModal";
import { ProductVariantsModal } from "../../components/ProductVariantsModal";
import { SupplierProcurementModal } from "../../components/SupplierProcurementModal";

// Mock product data - in real app this would come from API
const mockProduct = {
  id: "prod-123",
  name: "Gaming Laptop Pro",
  sku: "LAPTOP-PRO-001",
  description: "High-performance gaming laptop with RTX 4070 and Intel i7 processor",
  category: "Electronics",
  status: "ACTIVE",
  brand: "TechCorp",
  price: 1899.99,
  currency: "USD",
  type: "PHYSICAL",
  createdAt: new Date("2024-06-01"),
  updatedAt: new Date("2025-01-16"),
  aiGenerated: true,
  aiConfidence: 0.92,
  attributes: {
    processor: "Intel i7-13700H",
    graphics: "RTX 4070 8GB",
    memory: "32GB DDR5",
    storage: "1TB NVMe SSD",
    display: "15.6\" 165Hz QHD",
    weight: "2.3kg"
  },
  _count: {
    scanHistory: 45,
    soldBy: 3,
  },
  barcodes: [
    {
      id: "bc-1",
      barcode: "1234567890123",
      type: "EAN_13",
      isPrimary: true,
      createdAt: new Date("2024-06-01"),
    },
    {
      id: "bc-2", 
      barcode: "123456789012",
      type: "UPC_A",
      isPrimary: false,
      createdAt: new Date("2024-06-15"),
    },
  ],
  digitalAssets: [
    {
      id: "asset-1",
      url: "/api/placeholder/400/300",
      type: "IMAGE",
      filename: "gaming-laptop-front.jpg",
      alt: "Gaming laptop front view",
      description: "Main product image showing the laptop from the front",
      sortOrder: 0,
    },
    {
      id: "asset-2",
      url: "/api/placeholder/400/300",
      type: "IMAGE", 
      filename: "gaming-laptop-side.jpg",
      alt: "Gaming laptop side view",
      description: "Side profile showing ports and connectivity",
      sortOrder: 1,
    },
  ],
  scanHistory: [
    {
      id: "scan-1",
      barcode: "1234567890123",
      success: true,
      scannedAt: new Date("2025-01-15"),
      platform: "mobile",
      user: {
        name: "John Doe",
        email: "john@example.com",
      },
    },
    {
      id: "scan-2",
      barcode: "1234567890123", 
      success: true,
      scannedAt: new Date("2025-01-14"),
      platform: "web",
      user: {
        name: "Jane Smith",
        email: "jane@example.com",
      },
    },
  ],
  soldBy: [
    {
      id: "pdp-1",
      createdAt: new Date("2024-07-01"),
      brand: {
        id: "brand-1",
        name: "Amazon",
        slug: "amazon",
        type: "MARKETPLACE",
        baseUrl: "https://amazon.com",
        status: "PUBLISHED",
      },
    },
    {
      id: "pdp-2",
      createdAt: new Date("2024-07-15"),
      brand: {
        id: "brand-2", 
        name: "Best Buy",
        slug: "best-buy",
        type: "RETAILER",
        baseUrl: "https://bestbuy.com",
        status: "PUBLISHED",
      },
    },
    {
      id: "pdp-3",
      createdAt: new Date("2024-08-01"),
      brand: {
        id: "brand-3",
        name: "Newegg",
        slug: "newegg", 
        type: "MARKETPLACE",
        baseUrl: "https://newegg.com",
        status: "PUBLISHED",
      },
    },
  ],
};

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [product] = useState(mockProduct);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(product);
  
  // Modal states for advanced features
  const [pdpModalOpened, setPdpModalOpened] = useState(false);
  const [inventoryModalOpened, setInventoryModalOpened] = useState(false);
  const [variantsModalOpened, setVariantsModalOpened] = useState(false);
  const [supplierModalOpened, setSupplierModalOpened] = useState(false);
  const [priceHistoryModalOpened, setPriceHistoryModalOpened] = useState(false);
  const [bundlingModalOpened, setBundlingModalOpened] = useState(false);
  const [lifecycleModalOpened, setLifecycleModalOpened] = useState(false);

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

  const handleSave = () => {
    // In real app, this would call an API to save the changes
    console.log("Saving product:", editedProduct);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProduct(product);
    setIsEditing(false);
  };

  return (
    <ScrollArea h="100vh">
      <Stack p="md">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Group gap="sm">
              <Text size="xl" fw={700}>
                {isEditing ? (
                  <TextInput
                    value={editedProduct.name}
                    onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
                    size="lg"
                    variant="unstyled"
                    styles={{ input: { fontSize: "1.25rem", fontWeight: 700 } }}
                  />
                ) : (
                  product.name
                )}
              </Text>
              <Badge color={getStatusColor(product.status)} variant="light">
                {product.status}
              </Badge>
              {product.aiGenerated && (
                <Badge color="violet" variant="light">
                  AI Generated ({(product.aiConfidence * 100).toFixed(1)}%)
                </Badge>
              )}
            </Group>
            <Text c="dimmed" size="sm">
              Product ID: {params.id} • SKU: {product.sku}
            </Text>
          </div>
          
          <Group gap="sm">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button leftSection={<IconSave size={16} />} onClick={handleSave}>
                  Save Changes
                </Button>
              </>
            ) : (
              <Button leftSection={<IconEdit size={16} />} onClick={() => setIsEditing(true)}>
                Edit Product
              </Button>
            )}
          </Group>
        </Group>

        {/* Basic Information */}
        <Card withBorder>
          <Stack>
            <Group justify="space-between">
              <Text fw={600} size="lg">
                Basic Information
              </Text>
            </Group>

            <SimpleGrid cols={2} spacing="md">
              <div>
                <Text c="dimmed" size="sm">SKU</Text>
                {isEditing ? (
                  <TextInput
                    value={editedProduct.sku}
                    onChange={(e) => setEditedProduct({ ...editedProduct, sku: e.target.value })}
                  />
                ) : (
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
                            {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  </Group>
                )}
              </div>

              <div>
                <Text c="dimmed" size="sm">Category</Text>
                {isEditing ? (
                  <TextInput
                    value={editedProduct.category}
                    onChange={(e) => setEditedProduct({ ...editedProduct, category: e.target.value })}
                  />
                ) : (
                  <Text fw={500}>{product.category}</Text>
                )}
              </div>

              <div>
                <Text c="dimmed" size="sm">Brand</Text>
                {isEditing ? (
                  <TextInput
                    value={editedProduct.brand || ""}
                    onChange={(e) => setEditedProduct({ ...editedProduct, brand: e.target.value })}
                  />
                ) : (
                  <Text fw={500}>{product.brand || "N/A"}</Text>
                )}
              </div>

              <div>
                <Text c="dimmed" size="sm">Price</Text>
                {isEditing ? (
                  <TextInput
                    value={editedProduct.price?.toString() || ""}
                    onChange={(e) => setEditedProduct({ ...editedProduct, price: parseFloat(e.target.value) || 0 })}
                    type="number"
                    step="0.01"
                    leftSection="$"
                  />
                ) : (
                  <Text fw={500}>
                    {formatCurrency(product.price, product.currency)}
                  </Text>
                )}
              </div>

              <div>
                <Text c="dimmed" size="sm">Created</Text>
                <Text fw={500}>{formatDate(product.createdAt)}</Text>
              </div>

              <div>
                <Text c="dimmed" size="sm">Updated</Text>
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
                  {isEditing ? (
                    <Textarea
                      value={editedProduct.description || ""}
                      onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <Text>{product.description}</Text>
                  )}
                </div>
              </>
            )}

            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <>
                <Divider />
                <div>
                  <Text c="dimmed" mb="xs" size="sm">
                    Attributes
                  </Text>
                  {isEditing ? (
                    <Textarea
                      value={JSON.stringify(editedProduct.attributes, null, 2)}
                      onChange={(e) => {
                        try {
                          setEditedProduct({ ...editedProduct, attributes: JSON.parse(e.target.value) });
                        } catch {
                          // Invalid JSON, ignore
                        }
                      }}
                      rows={6}
                      fontFamily="monospace"
                    />
                  ) : (
                    <Code block>
                      {JSON.stringify(product.attributes, null, 2)}
                    </Code>
                  )}
                </div>
              </>
            )}
          </Stack>
        </Card>

        {/* Advanced Features Tabs */}
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
            <Tabs.Tab leftSection={<IconRocket size={16} />} value="lifecycle">
              Lifecycle & Advanced
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
                        
                        <Group gap="sm" mt="xs">
                          <Text c="green" fw={500} size="sm">$299.99</Text>
                          <Badge color="green" size="xs" variant="dot">In Stock</Badge>
                          <Text c="dimmed" size="xs">5.2% commission</Text>
                          <Text c="dimmed" size="xs">Amazon Associates</Text>
                        </Group>
                        
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
                                {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
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
            
            <Text c="dimmed" ta="center" py="xl">
              Click "Manage Inventory" to view detailed inventory information
            </Text>
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
            
            <Text c="dimmed" ta="center" py="xl">
              Click "Manage Variants" to view product variants and relationships
            </Text>
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
            
            <Text c="dimmed" ta="center" py="xl">
              Click "Manage Suppliers" to view supplier information and procurement
            </Text>
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
            
            <Text c="dimmed" ta="center" py="xl">
              Click "Manage Pricing" to view price history and promotional pricing
            </Text>
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
            
            <Text c="dimmed" ta="center" py="xl">
              Click "Manage Bundling" to view bundles and recommendations
            </Text>
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="lifecycle">
            <Group justify="space-between" mb="md">
              <Text fw={500}>Product Lifecycle & Advanced Features</Text>
              <Button
                leftSection={<IconEdit size={16} />}
                onClick={() => setLifecycleModalOpened(true)}
                size="sm"
                variant="outline"
              >
                Manage Lifecycle
              </Button>
            </Group>
            
            <Text c="dimmed" ta="center" py="xl">
              Click "Manage Lifecycle" to view lifecycle stages, quality, compliance, and analytics
            </Text>
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
      
      {/* Modals for advanced features */}
      <PDPManagementModal
        onClose={() => setPdpModalOpened(false)}
        onUpdate={() => {}}
        opened={pdpModalOpened}
        productId={product.id}
        productName={product.name}
      />
      
      <InventoryManagementModal
        opened={inventoryModalOpened}
        onClose={() => setInventoryModalOpened(false)}
        onUpdate={() => {}}
        productId={product.id}
        productName={product.name}
      />
      
      <ProductVariantsModal
        opened={variantsModalOpened}
        onClose={() => setVariantsModalOpened(false)}
        onUpdate={() => {}}
        productId={product.id}
        productName={product.name}
      />
      
      <SupplierProcurementModal
        opened={supplierModalOpened}
        onClose={() => setSupplierModalOpened(false)}
        onUpdate={() => {}}
        productId={product.id}
        productName={product.name}
      />
      
      <PriceHistoryModal
        opened={priceHistoryModalOpened}
        onClose={() => setPriceHistoryModalOpened(false)}
        onUpdate={() => {}}
        productId={product.id}
        productName={product.name}
        currentPrice={product.price || 0}
      />
      
      <ProductBundlingModal
        opened={bundlingModalOpened}
        onClose={() => setBundlingModalOpened(false)}
        onUpdate={() => {}}
        productId={product.id}
        productName={product.name}
      />
      
      <ProductLifecycleModal
        opened={lifecycleModalOpened}
        onClose={() => setLifecycleModalOpened(false)}
        onUpdate={() => {}}
        productId={product.id}
        productName={product.name}
      />
    </ScrollArea>
  );
}