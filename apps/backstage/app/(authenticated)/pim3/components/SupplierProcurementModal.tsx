"use client";

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  NumberInput,
  Progress,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBuilding,
  IconCalendar,
  IconCurrency,
  IconEdit,
  IconEye,
  IconFileText,
  IconPlus,
  IconTruck,
  IconUser,
} from "@tabler/icons-react";
import { useState } from "react";

// Supplier and procurement data structures (UI only)
interface Supplier {
  id: string;
  name: string;
  code: string;
  type: "manufacturer" | "distributor" | "wholesaler" | "dropshipper";
  status: "active" | "inactive" | "pending" | "suspended";
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    contactPerson: string;
  };
  businessInfo: {
    taxId?: string;
    website?: string;
    paymentTerms: string;
    currency: string;
    leadTime: number; // days
  };
  performance: {
    rating: number; // 1-5
    onTimeDelivery: number; // percentage
    qualityScore: number; // percentage
    totalOrders: number;
    totalValue: number;
  };
  pricing: {
    cost: number;
    currency: string;
    minimumOrder: number;
    priceBreaks: Array<{
      quantity: number;
      price: number;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  status: "draft" | "sent" | "confirmed" | "shipped" | "received" | "cancelled";
  orderDate: Date;
  expectedDelivery?: Date;
  actualDelivery?: Date;
  items: Array<{
    productId: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
  shippingInfo: {
    method: string;
    trackingNumber?: string;
    carrier?: string;
  };
  notes?: string;
  createdBy: string;
}

interface SupplierProcurementModalProps {
  opened: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onUpdate?: () => void;
}

export function SupplierProcurementModal({
  opened,
  onClose,
  productId,
  productName,
  onUpdate,
}: SupplierProcurementModalProps) {
  // Demo data
  const [suppliers] = useState<Supplier[]>([
    {
      id: "sup-1",
      name: "Global Electronics Corp",
      code: "GEC001",
      type: "manufacturer",
      status: "active",
      contactInfo: {
        email: "orders@globalelectronics.com",
        phone: "+1-555-0123",
        address: "123 Industrial Way, Manufacturing City, CA 90210",
        contactPerson: "John Manufacturing",
      },
      businessInfo: {
        taxId: "12-3456789",
        website: "https://globalelectronics.com",
        paymentTerms: "Net 30",
        currency: "USD",
        leadTime: 14,
      },
      performance: {
        rating: 4.8,
        onTimeDelivery: 95,
        qualityScore: 98,
        totalOrders: 156,
        totalValue: 2450000,
      },
      pricing: {
        cost: 120.00,
        currency: "USD",
        minimumOrder: 100,
        priceBreaks: [
          { quantity: 100, price: 120.00 },
          { quantity: 500, price: 115.00 },
          { quantity: 1000, price: 110.00 },
          { quantity: 5000, price: 105.00 },
        ],
      },
      createdAt: new Date("2023-01-15"),
      updatedAt: new Date("2025-01-10"),
    },
    {
      id: "sup-2",
      name: "TechSource Distribution",
      code: "TSD002",
      type: "distributor",
      status: "active",
      contactInfo: {
        email: "procurement@techsource.com",
        phone: "+1-555-0456",
        address: "456 Distribution Dr, Logistics Hub, TX 75001",
        contactPerson: "Sarah Logistics",
      },
      businessInfo: {
        taxId: "98-7654321",
        website: "https://techsource.com",
        paymentTerms: "Net 15",
        currency: "USD",
        leadTime: 7,
      },
      performance: {
        rating: 4.2,
        onTimeDelivery: 88,
        qualityScore: 92,
        totalOrders: 89,
        totalValue: 890000,
      },
      pricing: {
        cost: 135.00,
        currency: "USD",
        minimumOrder: 50,
        priceBreaks: [
          { quantity: 50, price: 135.00 },
          { quantity: 200, price: 130.00 },
          { quantity: 500, price: 125.00 },
        ],
      },
      createdAt: new Date("2023-06-20"),
      updatedAt: new Date("2025-01-08"),
    },
    {
      id: "sup-3",
      name: "QuickDrop Fulfillment",
      code: "QDF003",
      type: "dropshipper",
      status: "active",
      contactInfo: {
        email: "partners@quickdrop.com",
        phone: "+1-555-0789",
        address: "789 Fulfillment Ave, Drop City, FL 33101",
        contactPerson: "Mike Fulfillment",
      },
      businessInfo: {
        taxId: "55-9988776",
        website: "https://quickdrop.com",
        paymentTerms: "Immediate",
        currency: "USD",
        leadTime: 3,
      },
      performance: {
        rating: 3.8,
        onTimeDelivery: 78,
        qualityScore: 85,
        totalOrders: 234,
        totalValue: 456000,
      },
      pricing: {
        cost: 150.00,
        currency: "USD",
        minimumOrder: 1,
        priceBreaks: [
          { quantity: 1, price: 150.00 },
          { quantity: 10, price: 145.00 },
          { quantity: 50, price: 140.00 },
        ],
      },
      createdAt: new Date("2024-03-10"),
      updatedAt: new Date("2025-01-05"),
    },
  ]);

  const [purchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: "po-1",
      orderNumber: "PO-2025-001",
      supplierId: "sup-1",
      status: "received",
      orderDate: new Date("2025-01-01"),
      expectedDelivery: new Date("2025-01-15"),
      actualDelivery: new Date("2025-01-14"),
      items: [
        {
          productId: productId,
          quantity: 500,
          unitCost: 115.00,
          totalCost: 57500.00,
        },
      ],
      totals: {
        subtotal: 57500.00,
        tax: 4600.00,
        shipping: 500.00,
        total: 62600.00,
      },
      shippingInfo: {
        method: "Standard Freight",
        trackingNumber: "1Z999AA123456789",
        carrier: "UPS Freight",
      },
      notes: "Bulk order for Q1 inventory",
      createdBy: "jane.smith",
    },
    {
      id: "po-2",
      orderNumber: "PO-2025-012",
      supplierId: "sup-2",
      status: "shipped",
      orderDate: new Date("2025-01-10"),
      expectedDelivery: new Date("2025-01-17"),
      items: [
        {
          productId: productId,
          quantity: 100,
          unitCost: 135.00,
          totalCost: 13500.00,
        },
      ],
      totals: {
        subtotal: 13500.00,
        tax: 1080.00,
        shipping: 150.00,
        total: 14730.00,
      },
      shippingInfo: {
        method: "Express",
        trackingNumber: "1234567890",
        carrier: "FedEx",
      },
      createdBy: "mike.jones",
    },
    {
      id: "po-3",
      orderNumber: "PO-2025-018",
      supplierId: "sup-1",
      status: "confirmed",
      orderDate: new Date("2025-01-15"),
      expectedDelivery: new Date("2025-01-29"),
      items: [
        {
          productId: productId,
          quantity: 1000,
          unitCost: 110.00,
          totalCost: 110000.00,
        },
      ],
      totals: {
        subtotal: 110000.00,
        tax: 8800.00,
        shipping: 800.00,
        total: 119600.00,
      },
      shippingInfo: {
        method: "Standard Freight",
        carrier: "UPS Freight",
      },
      notes: "Q2 stock replenishment",
      createdBy: "jane.smith",
    },
  ]);

  const [activeTab, setActiveTab] = useState<"suppliers" | "orders" | "analytics" | "create">("suppliers");

  const getSupplierTypeColor = (type: string) => {
    switch (type) {
      case "manufacturer": return "blue";
      case "distributor": return "green";
      case "wholesaler": return "purple";
      case "dropshipper": return "orange";
      default: return "gray";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "green";
      case "inactive": return "gray";
      case "pending": return "yellow";
      case "suspended": return "red";
      case "confirmed": return "blue";
      case "shipped": return "blue";
      case "received": return "green";
      case "cancelled": return "red";
      case "draft": return "gray";
      case "sent": return "yellow";
      default: return "gray";
    }
  };

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const getBestPriceSupplier = () => {
    return suppliers.reduce((best, supplier) => {
      return supplier.pricing.cost < best.pricing.cost ? supplier : best;
    }, suppliers[0]);
  };

  const getTotalProcurementValue = () => {
    return purchaseOrders.reduce((total, po) => total + po.totals.total, 0);
  };

  const getAverageLeadTime = () => {
    return Math.round(suppliers.reduce((total, supplier) => total + supplier.businessInfo.leadTime, 0) / suppliers.length);
  };

  const handleCreatePurchaseOrder = () => {
    notifications.show({
      color: "green",
      message: "Purchase order created successfully",
      title: "Success",
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={`Supplier & Procurement - ${productName}`}
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack>
        {/* Tab Navigation */}
        <Group>
          <Button
            variant={activeTab === "suppliers" ? "filled" : "light"}
            onClick={() => setActiveTab("suppliers")}
            leftSection={<IconBuilding size={16} />}
          >
            Suppliers ({suppliers.length})
          </Button>
          <Button
            variant={activeTab === "orders" ? "filled" : "light"}
            onClick={() => setActiveTab("orders")}
            leftSection={<IconFileText size={16} />}
          >
            Purchase Orders ({purchaseOrders.length})
          </Button>
          <Button
            variant={activeTab === "analytics" ? "filled" : "light"}
            onClick={() => setActiveTab("analytics")}
            leftSection={<IconCurrency size={16} />}
          >
            Analytics
          </Button>
          <Button
            variant={activeTab === "create" ? "filled" : "light"}
            onClick={() => setActiveTab("create")}
            leftSection={<IconPlus size={16} />}
          >
            Create Order
          </Button>
        </Group>

        {/* Suppliers Tab */}
        {activeTab === "suppliers" && (
          <Stack>
            <Group justify="space-between">
              <Text fw={600} size="lg">Suppliers</Text>
              <Button leftSection={<IconPlus size={16} />} size="sm">
                Add Supplier
              </Button>
            </Group>

            <Stack>
              {suppliers.map((supplier) => (
                <Card key={supplier.id} withBorder>
                  <Group justify="space-between" mb="sm">
                    <div>
                      <Group gap="sm">
                        <Text fw={600}>{supplier.name}</Text>
                        <Badge color={getSupplierTypeColor(supplier.type)} variant="light" size="sm">
                          {supplier.type.toUpperCase()}
                        </Badge>
                        <Badge color={getStatusColor(supplier.status)} variant="light" size="sm">
                          {supplier.status.toUpperCase()}
                        </Badge>
                      </Group>
                      <Text c="dimmed" size="sm">Code: {supplier.code}</Text>
                    </div>
                    <Group gap="xs">
                      <ActionIcon variant="subtle">
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle">
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <SimpleGrid cols={4} spacing="md">
                    <div>
                      <Text c="dimmed" size="xs">Cost per Unit</Text>
                      <Text fw={600}>{formatCurrency(supplier.pricing.cost)}</Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">Lead Time</Text>
                      <Text fw={600}>{supplier.businessInfo.leadTime} days</Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">Rating</Text>
                      <Group gap="xs">
                        <Text fw={600}>{supplier.performance.rating}/5</Text>
                        <Progress value={supplier.performance.rating * 20} size="sm" style={{ flex: 1 }} />
                      </Group>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">On-Time Delivery</Text>
                      <Text fw={600}>{supplier.performance.onTimeDelivery}%</Text>
                    </div>
                  </SimpleGrid>

                  <Group gap="md" mt="md">
                    <Text size="sm">
                      <Text c="dimmed" span>Contact:</Text> {supplier.contactInfo.contactPerson}
                    </Text>
                    <Text size="sm">
                      <Text c="dimmed" span>Email:</Text> {supplier.contactInfo.email}
                    </Text>
                    <Text size="sm">
                      <Text c="dimmed" span>MOQ:</Text> {supplier.pricing.minimumOrder} units
                    </Text>
                    <Text size="sm">
                      <Text c="dimmed" span>Terms:</Text> {supplier.businessInfo.paymentTerms}
                    </Text>
                  </Group>

                  {/* Price Breaks */}
                  <Card withBorder mt="md">
                    <Text fw={500} mb="sm" size="sm">Volume Pricing</Text>
                    <Group gap="md">
                      {supplier.pricing.priceBreaks.map((priceBreak, index) => (
                        <Badge key={index} variant="outline" size="sm">
                          {priceBreak.quantity}+ units: {formatCurrency(priceBreak.price)}
                        </Badge>
                      ))}
                    </Group>
                  </Card>
                </Card>
              ))}
            </Stack>
          </Stack>
        )}

        {/* Purchase Orders Tab */}
        {activeTab === "orders" && (
          <Stack>
            <Group justify="space-between">
              <Text fw={600} size="lg">Purchase Orders</Text>
              <Button leftSection={<IconPlus size={16} />} size="sm">
                Create Order
              </Button>
            </Group>

            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Order #</Table.Th>
                  <Table.Th>Supplier</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Quantity</Table.Th>
                  <Table.Th>Total</Table.Th>
                  <Table.Th>Delivery</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {purchaseOrders.map((order) => {
                  const supplier = suppliers.find(s => s.id === order.supplierId);
                  return (
                    <Table.Tr key={order.id}>
                      <Table.Td>
                        <Text fw={500}>{order.orderNumber}</Text>
                      </Table.Td>
                      <Table.Td>{supplier?.name || "Unknown"}</Table.Td>
                      <Table.Td>
                        <Badge color={getStatusColor(order.status)} variant="light" size="sm">
                          {order.status.toUpperCase()}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{formatDate(order.orderDate)}</Table.Td>
                      <Table.Td>{order.items[0]?.quantity || 0} units</Table.Td>
                      <Table.Td>{formatCurrency(order.totals.total)}</Table.Td>
                      <Table.Td>
                        {order.actualDelivery ? (
                          <Text c="green" size="sm">{formatDate(order.actualDelivery)}</Text>
                        ) : order.expectedDelivery ? (
                          <Text c="blue" size="sm">{formatDate(order.expectedDelivery)}</Text>
                        ) : (
                          <Text c="gray" size="sm">TBD</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon variant="subtle" size="sm">
                            <IconEye size={14} />
                          </ActionIcon>
                          <ActionIcon variant="subtle" size="sm">
                            <IconTruck size={14} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Stack>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <Stack>
            <Text fw={600} size="lg">Procurement Analytics</Text>

            <SimpleGrid cols={3} spacing="md">
              <Card withBorder>
                <Text c="dimmed" size="sm">Total Procurement Value</Text>
                <Text fw={700} size="xl">{formatCurrency(getTotalProcurementValue())}</Text>
                <Text c="dimmed" size="xs">Year to date</Text>
              </Card>
              <Card withBorder>
                <Text c="dimmed" size="sm">Best Price Supplier</Text>
                <Text fw={700} size="xl">{getBestPriceSupplier().name}</Text>
                <Text c="dimmed" size="xs">{formatCurrency(getBestPriceSupplier().pricing.cost)} per unit</Text>
              </Card>
              <Card withBorder>
                <Text c="dimmed" size="sm">Average Lead Time</Text>
                <Text fw={700} size="xl">{getAverageLeadTime()} days</Text>
                <Text c="dimmed" size="xs">Across all suppliers</Text>
              </Card>
            </SimpleGrid>

            {/* Supplier Performance Comparison */}
            <Card withBorder>
              <Text fw={500} mb="md">Supplier Performance Comparison</Text>
              <Stack gap="md">
                {suppliers.map((supplier) => (
                  <div key={supplier.id}>
                    <Group justify="space-between" mb="xs">
                      <Text fw={500} size="sm">{supplier.name}</Text>
                      <Text size="sm">{formatCurrency(supplier.pricing.cost)}</Text>
                    </Group>
                    <SimpleGrid cols={3} spacing="md">
                      <div>
                        <Text c="dimmed" size="xs">Quality Score</Text>
                        <Progress value={supplier.performance.qualityScore} color="green" size="sm" />
                        <Text size="xs">{supplier.performance.qualityScore}%</Text>
                      </div>
                      <div>
                        <Text c="dimmed" size="xs">On-Time Delivery</Text>
                        <Progress value={supplier.performance.onTimeDelivery} color="blue" size="sm" />
                        <Text size="xs">{supplier.performance.onTimeDelivery}%</Text>
                      </div>
                      <div>
                        <Text c="dimmed" size="xs">Total Value</Text>
                        <Text size="sm" fw={500}>{formatCurrency(supplier.performance.totalValue)}</Text>
                      </div>
                    </SimpleGrid>
                  </div>
                ))}
              </Stack>
            </Card>

            {/* Cost Analysis */}
            <Card withBorder>
              <Text fw={500} mb="md">Cost Analysis</Text>
              <SimpleGrid cols={2} spacing="md">
                <div>
                  <Text fw={500} mb="sm" size="sm">Cost per Unit Comparison</Text>
                  <Stack gap="xs">
                    {suppliers.sort((a, b) => a.pricing.cost - b.pricing.cost).map((supplier) => (
                      <Group key={supplier.id} justify="space-between">
                        <Text size="sm">{supplier.name}</Text>
                        <Text fw={500} size="sm">{formatCurrency(supplier.pricing.cost)}</Text>
                      </Group>
                    ))}
                  </Stack>
                </div>
                <div>
                  <Text fw={500} mb="sm" size="sm">Lead Time Comparison</Text>
                  <Stack gap="xs">
                    {suppliers.sort((a, b) => a.businessInfo.leadTime - b.businessInfo.leadTime).map((supplier) => (
                      <Group key={supplier.id} justify="space-between">
                        <Text size="sm">{supplier.name}</Text>
                        <Text fw={500} size="sm">{supplier.businessInfo.leadTime} days</Text>
                      </Group>
                    ))}
                  </Stack>
                </div>
              </SimpleGrid>
            </Card>
          </Stack>
        )}

        {/* Create Order Tab */}
        {activeTab === "create" && (
          <Stack>
            <Text fw={600} size="lg">Create Purchase Order</Text>

            <Card withBorder>
              <Stack>
                <Select
                  label="Supplier"
                  placeholder="Select supplier"
                  data={suppliers.map(supplier => ({
                    value: supplier.id,
                    label: `${supplier.name} - ${formatCurrency(supplier.pricing.cost)}/unit`,
                  }))}
                  required
                />

                <NumberInput
                  label="Quantity"
                  placeholder="Enter quantity"
                  min={1}
                  required
                />

                <Select
                  label="Shipping Method"
                  placeholder="Select shipping method"
                  data={[
                    { value: "standard", label: "Standard Freight" },
                    { value: "express", label: "Express Delivery" },
                    { value: "overnight", label: "Overnight" },
                  ]}
                />

                <Textarea
                  label="Notes"
                  placeholder="Additional notes or requirements"
                  rows={3}
                />

                <Group justify="flex-end" mt="md">
                  <Button variant="outline">
                    Save as Draft
                  </Button>
                  <Button onClick={handleCreatePurchaseOrder}>
                    Create Purchase Order
                  </Button>
                </Group>
              </Stack>
            </Card>

            {/* Quick Reorder */}
            <Card withBorder>
              <Text fw={500} mb="md">Quick Reorder</Text>
              <Text c="dimmed" mb="md" size="sm">
                Reorder based on previous purchase orders
              </Text>
              <Stack gap="xs">
                {purchaseOrders.slice(0, 2).map((order) => {
                  const supplier = suppliers.find(s => s.id === order.supplierId);
                  return (
                    <Group key={order.id} justify="space-between">
                      <div>
                        <Text fw={500} size="sm">{order.orderNumber}</Text>
                        <Text c="dimmed" size="xs">
                          {supplier?.name} - {order.items[0]?.quantity} units
                        </Text>
                      </div>
                      <Button size="xs" variant="outline">
                        Reorder
                      </Button>
                    </Group>
                  );
                })}
              </Stack>
            </Card>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}