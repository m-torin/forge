'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  NumberInput,
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Textarea,
} from '@mantine/core';
import { useFormContext } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconBuilding,
  IconCurrency,
  IconEdit,
  IconEye,
  IconFileText,
  IconPlus,
  IconTruck,
} from '@tabler/icons-react';
import { useState } from 'react';

// Supplier and procurement data structures (UI only)
interface Supplier {
  businessInfo: {
    taxId?: string;
    website?: string;
    paymentTerms: string;
    currency: string;
    leadTime: number; // days
  };
  code: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    contactPerson: string;
  };
  createdAt: Date;
  id: string;
  name: string;
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
    priceBreaks: {
      quantity: number;
      price: number;
    }[];
  };
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  type: 'manufacturer' | 'distributor' | 'wholesaler' | 'dropshipper';
  updatedAt: Date;
}

interface PurchaseOrder {
  actualDelivery?: Date;
  createdBy: string;
  expectedDelivery?: Date;
  id: string;
  items: {
    productId: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }[];
  notes?: string;
  orderDate: Date;
  orderNumber: string;
  shippingInfo: {
    method: string;
    trackingNumber?: string;
    carrier?: string;
  };
  status: 'draft' | 'sent' | 'confirmed' | 'shipped' | 'received' | 'cancelled';
  supplierId: string;
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
}

interface SupplierProcurementProps {
  onUpdate?: () => void;
  productId: string;
  productName: string;
}

export function SupplierProcurement({
  onUpdate,
  productId,
  productName,
}: SupplierProcurementProps) {
  // Get form context
  const form = useFormContext();

  // Get data from form context
  const suppliers = form.values.suppliers || [];
  const purchaseOrders = form.values.purchaseOrders || [];

  const [activeTab, setActiveTab] = useState<'suppliers' | 'orders' | 'analytics' | 'create'>(
    'suppliers',
  );

  const getSupplierTypeColor = (type: string) => {
    switch (type) {
      case 'manufacturer':
        return 'blue';
      case 'distributor':
        return 'green';
      case 'wholesaler':
        return 'purple';
      case 'dropshipper':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'gray';
      case 'pending':
        return 'yellow';
      case 'suspended':
        return 'red';
      case 'confirmed':
        return 'blue';
      case 'shipped':
        return 'blue';
      case 'received':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'draft':
        return 'gray';
      case 'sent':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      currency,
      style: 'currency',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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
    return Math.round(
      suppliers.reduce((total, supplier) => total + supplier.businessInfo.leadTime, 0) /
        suppliers.length,
    );
  };

  const handleCreatePurchaseOrder = () => {
    const newOrderForm = form.values.purchaseOrderForm;
    if (!newOrderForm?.supplierId || !newOrderForm?.quantity) {
      notifications.show({
        color: 'red',
        message: 'Please fill in all required fields',
        title: 'Error',
      });
      return;
    }

    const newOrder = {
      id: `po-${Date.now()}`,
      createdBy: 'current.user',
      expectedDelivery: null,
      items: [
        {
          productId: productId,
          quantity: newOrderForm.quantity,
          totalCost:
            newOrderForm.quantity *
            (suppliers.find((s) => s.id === newOrderForm.supplierId)?.pricing.cost || 0),
          unitCost: suppliers.find((s) => s.id === newOrderForm.supplierId)?.pricing.cost || 0,
        },
      ],
      notes: newOrderForm.notes || '',
      orderDate: new Date(),
      orderNumber: `PO-2025-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      shippingInfo: {
        carrier: '',
        method: newOrderForm.shippingMethod || '',
      },
      status: 'draft',
      supplierId: newOrderForm.supplierId,
      totals: {
        shipping: 0,
        subtotal:
          newOrderForm.quantity *
          (suppliers.find((s) => s.id === newOrderForm.supplierId)?.pricing.cost || 0),
        tax: 0,
        total:
          newOrderForm.quantity *
          (suppliers.find((s) => s.id === newOrderForm.supplierId)?.pricing.cost || 0),
      },
    };

    form.setFieldValue('purchaseOrders', [...purchaseOrders, newOrder]);

    // Reset form
    form.setFieldValue('purchaseOrderForm', {
      notes: '',
      quantity: 0,
      shippingMethod: '',
      supplierId: '',
    });

    notifications.show({
      color: 'green',
      message: 'Purchase order created successfully',
      title: 'Success',
    });
    setActiveTab('orders');
  };

  return (
    <Stack>
      {/* Tab Navigation */}
      <Group>
        <Button
          leftSection={<IconBuilding size={16} />}
          onClick={() => setActiveTab('suppliers')}
          variant={activeTab === 'suppliers' ? 'filled' : 'light'}
        >
          Suppliers ({suppliers.length})
        </Button>
        <Button
          leftSection={<IconFileText size={16} />}
          onClick={() => setActiveTab('orders')}
          variant={activeTab === 'orders' ? 'filled' : 'light'}
        >
          Purchase Orders ({purchaseOrders.length})
        </Button>
        <Button
          leftSection={<IconCurrency size={16} />}
          onClick={() => setActiveTab('analytics')}
          variant={activeTab === 'analytics' ? 'filled' : 'light'}
        >
          Analytics
        </Button>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setActiveTab('create')}
          variant={activeTab === 'create' ? 'filled' : 'light'}
        >
          Create Order
        </Button>
      </Group>

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <Stack>
          <Group justify="space-between">
            <Text fw={600} size="lg">
              Suppliers
            </Text>
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
                      <Badge color={getSupplierTypeColor(supplier.type)} size="sm" variant="light">
                        {supplier.type.toUpperCase()}
                      </Badge>
                      <Badge color={getStatusColor(supplier.status)} size="sm" variant="light">
                        {supplier.status.toUpperCase()}
                      </Badge>
                    </Group>
                    <Text c="dimmed" size="sm">
                      Code: {supplier.code}
                    </Text>
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
                    <Text c="dimmed" size="xs">
                      Cost per Unit
                    </Text>
                    <Text fw={600}>{formatCurrency(supplier.pricing.cost)}</Text>
                  </div>
                  <div>
                    <Text c="dimmed" size="xs">
                      Lead Time
                    </Text>
                    <Text fw={600}>{supplier.businessInfo.leadTime} days</Text>
                  </div>
                  <div>
                    <Text c="dimmed" size="xs">
                      Rating
                    </Text>
                    <Group gap="xs">
                      <Text fw={600}>{supplier.performance.rating}/5</Text>
                      <Progress
                        style={{ flex: 1 }}
                        size="sm"
                        value={supplier.performance.rating * 20}
                      />
                    </Group>
                  </div>
                  <div>
                    <Text c="dimmed" size="xs">
                      On-Time Delivery
                    </Text>
                    <Text fw={600}>{supplier.performance.onTimeDelivery}%</Text>
                  </div>
                </SimpleGrid>

                <Group gap="md" mt="md">
                  <Text size="sm">
                    <Text c="dimmed" span>
                      Contact:
                    </Text>{' '}
                    {supplier.contactInfo.contactPerson}
                  </Text>
                  <Text size="sm">
                    <Text c="dimmed" span>
                      Email:
                    </Text>{' '}
                    {supplier.contactInfo.email}
                  </Text>
                  <Text size="sm">
                    <Text c="dimmed" span>
                      MOQ:
                    </Text>{' '}
                    {supplier.pricing.minimumOrder} units
                  </Text>
                  <Text size="sm">
                    <Text c="dimmed" span>
                      Terms:
                    </Text>{' '}
                    {supplier.businessInfo.paymentTerms}
                  </Text>
                </Group>

                {/* Price Breaks */}
                <Card withBorder mt="md">
                  <Text fw={500} mb="sm" size="sm">
                    Volume Pricing
                  </Text>
                  <Group gap="md">
                    {supplier.pricing.priceBreaks.map((priceBreak, index) => (
                      <Badge key={index} size="sm" variant="outline">
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
      {activeTab === 'orders' && (
        <Stack>
          <Group justify="space-between">
            <Text fw={600} size="lg">
              Purchase Orders
            </Text>
            <Button leftSection={<IconPlus size={16} />} size="sm">
              Create Order
            </Button>
          </Group>

          <Table highlightOnHover striped>
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
                const supplier = suppliers.find((s) => s.id === order.supplierId);
                return (
                  <Table.Tr key={order.id}>
                    <Table.Td>
                      <Text fw={500}>{order.orderNumber}</Text>
                    </Table.Td>
                    <Table.Td>{supplier?.name || 'Unknown'}</Table.Td>
                    <Table.Td>
                      <Badge color={getStatusColor(order.status)} size="sm" variant="light">
                        {order.status.toUpperCase()}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{formatDate(order.orderDate)}</Table.Td>
                    <Table.Td>{order.items[0]?.quantity || 0} units</Table.Td>
                    <Table.Td>{formatCurrency(order.totals.total)}</Table.Td>
                    <Table.Td>
                      {order.actualDelivery ? (
                        <Text c="green" size="sm">
                          {formatDate(order.actualDelivery)}
                        </Text>
                      ) : order.expectedDelivery ? (
                        <Text c="blue" size="sm">
                          {formatDate(order.expectedDelivery)}
                        </Text>
                      ) : (
                        <Text c="gray" size="sm">
                          TBD
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon size="sm" variant="subtle">
                          <IconEye size={14} />
                        </ActionIcon>
                        <ActionIcon size="sm" variant="subtle">
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
      {activeTab === 'analytics' && (
        <Stack>
          <Text fw={600} size="lg">
            Procurement Analytics
          </Text>

          <SimpleGrid cols={3} spacing="md">
            <Card withBorder>
              <Text c="dimmed" size="sm">
                Total Procurement Value
              </Text>
              <Text fw={700} size="xl">
                {formatCurrency(getTotalProcurementValue())}
              </Text>
              <Text c="dimmed" size="xs">
                Year to date
              </Text>
            </Card>
            <Card withBorder>
              <Text c="dimmed" size="sm">
                Best Price Supplier
              </Text>
              <Text fw={700} size="xl">
                {getBestPriceSupplier().name}
              </Text>
              <Text c="dimmed" size="xs">
                {formatCurrency(getBestPriceSupplier().pricing.cost)} per unit
              </Text>
            </Card>
            <Card withBorder>
              <Text c="dimmed" size="sm">
                Average Lead Time
              </Text>
              <Text fw={700} size="xl">
                {getAverageLeadTime()} days
              </Text>
              <Text c="dimmed" size="xs">
                Across all suppliers
              </Text>
            </Card>
          </SimpleGrid>

          {/* Supplier Performance Comparison */}
          <Card withBorder>
            <Text fw={500} mb="md">
              Supplier Performance Comparison
            </Text>
            <Stack gap="md">
              {suppliers.map((supplier) => (
                <div key={supplier.id}>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="sm">
                      {supplier.name}
                    </Text>
                    <Text size="sm">{formatCurrency(supplier.pricing.cost)}</Text>
                  </Group>
                  <SimpleGrid cols={3} spacing="md">
                    <div>
                      <Text c="dimmed" size="xs">
                        Quality Score
                      </Text>
                      <Progress color="green" size="sm" value={supplier.performance.qualityScore} />
                      <Text size="xs">{supplier.performance.qualityScore}%</Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">
                        On-Time Delivery
                      </Text>
                      <Progress
                        color="blue"
                        size="sm"
                        value={supplier.performance.onTimeDelivery}
                      />
                      <Text size="xs">{supplier.performance.onTimeDelivery}%</Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">
                        Total Value
                      </Text>
                      <Text fw={500} size="sm">
                        {formatCurrency(supplier.performance.totalValue)}
                      </Text>
                    </div>
                  </SimpleGrid>
                </div>
              ))}
            </Stack>
          </Card>

          {/* Cost Analysis */}
          <Card withBorder>
            <Text fw={500} mb="md">
              Cost Analysis
            </Text>
            <SimpleGrid cols={2} spacing="md">
              <div>
                <Text fw={500} mb="sm" size="sm">
                  Cost per Unit Comparison
                </Text>
                <Stack gap="xs">
                  {suppliers
                    .sort((a, b) => a.pricing.cost - b.pricing.cost)
                    .map((supplier) => (
                      <Group key={supplier.id} justify="space-between">
                        <Text size="sm">{supplier.name}</Text>
                        <Text fw={500} size="sm">
                          {formatCurrency(supplier.pricing.cost)}
                        </Text>
                      </Group>
                    ))}
                </Stack>
              </div>
              <div>
                <Text fw={500} mb="sm" size="sm">
                  Lead Time Comparison
                </Text>
                <Stack gap="xs">
                  {suppliers
                    .sort((a, b) => a.businessInfo.leadTime - b.businessInfo.leadTime)
                    .map((supplier) => (
                      <Group key={supplier.id} justify="space-between">
                        <Text size="sm">{supplier.name}</Text>
                        <Text fw={500} size="sm">
                          {supplier.businessInfo.leadTime} days
                        </Text>
                      </Group>
                    ))}
                </Stack>
              </div>
            </SimpleGrid>
          </Card>
        </Stack>
      )}

      {/* Create Order Tab */}
      {activeTab === 'create' && (
        <Stack>
          <Text fw={600} size="lg">
            Create Purchase Order
          </Text>

          <Card withBorder>
            <Stack>
              <Select
                placeholder="Select supplier"
                label="Supplier"
                {...form.getInputProps('purchaseOrderForm.supplierId')}
                data={suppliers.map((supplier) => ({
                  label: `${supplier.name} - ${formatCurrency(supplier.pricing.cost)}/unit`,
                  value: supplier.id,
                }))}
                required
              />

              <NumberInput
                placeholder="Enter quantity"
                label="Quantity"
                {...form.getInputProps('purchaseOrderForm.quantity')}
                min={1}
                required
              />

              <Select
                placeholder="Select shipping method"
                label="Shipping Method"
                {...form.getInputProps('purchaseOrderForm.shippingMethod')}
                data={[
                  { label: 'Standard Freight', value: 'standard' },
                  { label: 'Express Delivery', value: 'express' },
                  { label: 'Overnight', value: 'overnight' },
                ]}
              />

              <Textarea
                placeholder="Additional notes or requirements"
                label="Notes"
                {...form.getInputProps('purchaseOrderForm.notes')}
                rows={3}
              />

              <Group justify="flex-end" mt="md">
                <Button
                  onClick={() => {
                    const newOrder = {
                      ...form.values.purchaseOrderForm,
                      status: 'draft',
                    };
                    // Save as draft logic
                    notifications.show({
                      color: 'blue',
                      message: 'Order saved as draft',
                    });
                  }}
                  variant="outline"
                >
                  Save as Draft
                </Button>
                <Button onClick={handleCreatePurchaseOrder}>Create Purchase Order</Button>
              </Group>
            </Stack>
          </Card>

          {/* Quick Reorder */}
          <Card withBorder>
            <Text fw={500} mb="md">
              Quick Reorder
            </Text>
            <Text c="dimmed" mb="md" size="sm">
              Reorder based on previous purchase orders
            </Text>
            <Stack gap="xs">
              {purchaseOrders.slice(0, 2).map((order) => {
                const supplier = suppliers.find((s) => s.id === order.supplierId);
                return (
                  <Group key={order.id} justify="space-between">
                    <div>
                      <Text fw={500} size="sm">
                        {order.orderNumber}
                      </Text>
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
  );
}
