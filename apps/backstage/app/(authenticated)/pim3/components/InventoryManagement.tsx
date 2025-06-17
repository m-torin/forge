'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconBox,
  IconEdit,
  IconPlus,
  IconTrendingUp,
} from '@tabler/icons-react';
import { useState } from 'react';

import { formatDateTime, getLocationStockStatus } from '../utils/pim-helpers';

// Demo inventory data structure (UI only)
interface InventoryLocation {
  address: string;
  dailyAverage?: number;
  id: string;
  isActive: boolean;
  lastCount: Date;
  name: string;
  settings: {
    reorderPoint: number;
    maxStock: number;
    minDisplay?: number;
  };
  stock: {
    available: number;
    reserved: number;
    damaged: number;
    inTransit?: number;
  };
  type: 'warehouse' | 'store' | 'distribution_center';
}

interface StockMovement {
  date: Date;
  id: string;
  locationId: string;
  quantity: number;
  reason: string;
  reference?: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment' | 'damage';
  user: string;
}

interface InventoryManagementProps {
  onUpdate?: () => void;
  productId: string;
  productName: string;
}

export function InventoryManagement({
  onUpdate,
  productId,
  productName,
}: InventoryManagementProps) {
  // Create local form for inventory management
  const form = useForm({
    initialValues: {
      inventory: {
        locations: [] as InventoryLocation[],
        movements: [] as StockMovement[],
        adjustmentForm: {
          locationId: '',
          adjustmentType: 'addition' as const,
          quantity: 0,
          reason: '',
          notes: '',
          type: 'adjustment' as const,
        },
      },
    },
  });

  // Get data from form context
  const locations = form.values.inventory?.locations || [];
  const movements = form.values.inventory?.movements || [];

  const [activeTab, setActiveTab] = useState<'overview' | 'movements' | 'alerts' | 'adjust'>(
    'overview',
  );

  const getTotalStock = () => {
    return locations.reduce((total: any, location) => total + location.stock.available, 0);
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'warehouse':
        return 'blue';
      case 'store':
        return 'green';
      case 'distribution_center':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'in':
        return 'green';
      case 'out':
        return 'red';
      case 'transfer':
        return 'blue';
      case 'adjustment':
        return 'yellow';
      case 'damage':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStockStatusForLocation = (location: InventoryLocation) => {
    return getLocationStockStatus(
      location.stock.available,
      location.settings.reorderPoint,
      location.settings.maxStock,
    );
  };

  const handleStockAdjustment = () => {
    const adjustmentData = form.values.inventory?.adjustmentForm;
    if (!adjustmentData?.locationId || !adjustmentData?.reason) {
      notifications.show({
        color: 'red',
        message: 'Please fill in all required fields',
        title: 'Error',
      });
      return;
    }

    // Add the adjustment to movements
    const newMovement = {
      id: `mov-${Date.now()}`,
      type: adjustmentData.type,
      date: new Date(),
      locationId: adjustmentData.locationId,
      quantity: adjustmentData.quantity,
      reason: adjustmentData.reason,
      user: 'Current User',
    };

    form.setFieldValue('inventory.movements', [...movements, newMovement]);

    // Update the location stock
    const locationIndex = locations.findIndex((loc) => loc.id === adjustmentData.locationId);
    if (locationIndex !== -1) {
      const currentStock = locations[locationIndex].stock.available;
      form.setFieldValue(
        `inventory.locations.${locationIndex}.stock.available`,
        currentStock + adjustmentData.quantity,
      );
    }

    notifications.show({
      color: 'green',
      message: `Stock adjustment recorded for ${adjustmentData.quantity} units`,
      title: 'Success',
    });

    // Reset adjustment form
    form.setFieldValue('inventory.adjustmentForm', {
      locationId: '',
      adjustmentType: 'addition' as const,
      quantity: 0,
      reason: '',
      notes: '',
      type: 'adjustment' as const,
    });

    onUpdate?.();
  };

  return (
    <Stack>
      {/* Tab Navigation */}
      <Group>
        <Button
          leftSection={<IconBox size={16} />}
          onClick={() => setActiveTab('overview')}
          variant={activeTab === 'overview' ? 'filled' : 'light'}
        >
          Overview
        </Button>
        <Button
          leftSection={<IconTrendingUp size={16} />}
          onClick={() => setActiveTab('movements')}
          variant={activeTab === 'movements' ? 'filled' : 'light'}
        >
          Movements
        </Button>
        <Button
          leftSection={<IconAlertTriangle size={16} />}
          onClick={() => setActiveTab('alerts')}
          variant={activeTab === 'alerts' ? 'filled' : 'light'}
        >
          Alerts
        </Button>
        <Button
          leftSection={<IconEdit size={16} />}
          onClick={() => setActiveTab('adjust')}
          variant={activeTab === 'adjust' ? 'filled' : 'light'}
        >
          Adjust Stock
        </Button>
      </Group>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <Stack>
          {/* Total Summary */}
          <Card withBorder style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
            <Group justify="space-between">
              <div>
                <Text fw={600} size="lg">
                  Total Available Inventory
                </Text>
                <Text c="dimmed" size="sm">
                  Across all locations
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text c="blue" fw={700} size="xl">
                  {getTotalStock()} units
                </Text>
                <Text c="dimmed" size="xs">
                  Worth ~${(getTotalStock() * 299.99).toLocaleString()}
                </Text>
              </div>
            </Group>
          </Card>

          {/* Location Details */}
          <Stack>
            {locations.map((location) => {
              const status = getLocationStockStatus(
                location.stock.available,
                location.settings.reorderPoint,
                location.settings.maxStock,
              );
              return (
                <Card key={location.id} withBorder>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <div>
                        <Group gap="sm">
                          <Text fw={600}>{location.name}</Text>
                          <Badge
                            color={getLocationTypeColor(location.type)}
                            size="sm"
                            variant="light"
                          >
                            {location.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge color={status.color} size="sm" variant="light">
                            {status.label}
                          </Badge>
                        </Group>
                        <Text c="dimmed" size="xs">
                          {location.address}
                        </Text>
                      </div>
                      <ActionIcon variant="subtle">
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Group>

                    <SimpleGrid cols={4} spacing="md">
                      <div>
                        <Text c="dimmed" size="xs">
                          Available
                        </Text>
                        <Text c="green" fw={600} size="lg">
                          {location.stock.available}
                        </Text>
                      </div>
                      <div>
                        <Text c="dimmed" size="xs">
                          Reserved
                        </Text>
                        <Text c="blue" fw={600} size="lg">
                          {location.stock.reserved}
                        </Text>
                      </div>
                      <div>
                        <Text c="dimmed" size="xs">
                          Damaged
                        </Text>
                        <Text c="red" fw={600} size="lg">
                          {location.stock.damaged}
                        </Text>
                      </div>
                      {location.stock.inTransit && (
                        <div>
                          <Text c="dimmed" size="xs">
                            In Transit
                          </Text>
                          <Text c="blue" fw={600} size="lg">
                            {location.stock.inTransit}
                          </Text>
                        </div>
                      )}
                    </SimpleGrid>

                    <Group gap="lg" mt="xs">
                      <Text size="sm">
                        <Text c="dimmed" span>
                          Reorder Point:
                        </Text>{' '}
                        <Text fw={500} span>
                          {location.settings.reorderPoint}
                        </Text>
                      </Text>
                      <Text size="sm">
                        <Text c="dimmed" span>
                          Max Stock:
                        </Text>{' '}
                        <Text fw={500} span>
                          {location.settings.maxStock}
                        </Text>
                      </Text>
                      <Text size="sm">
                        <Text c="dimmed" span>
                          Last Count:
                        </Text>{' '}
                        <Text fw={500} span>
                          {formatDateTime(location.lastCount)}
                        </Text>
                      </Text>
                      {location.dailyAverage && (
                        <Text size="sm">
                          <Text c="dimmed" span>
                            Daily Avg:
                          </Text>{' '}
                          <Text fw={500} span>
                            {location.dailyAverage} units
                          </Text>
                        </Text>
                      )}
                    </Group>
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        </Stack>
      )}

      {/* Movements Tab */}
      {activeTab === 'movements' && (
        <Stack>
          <Group justify="space-between">
            <Text fw={600} size="lg">
              Stock Movements
            </Text>
            <Button leftSection={<IconPlus size={16} />} size="sm">
              Record Movement
            </Button>
          </Group>

          <Table highlightOnHover striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Quantity</Table.Th>
                <Table.Th>Location</Table.Th>
                <Table.Th>Reason</Table.Th>
                <Table.Th>User</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {movements.map((movement) => {
                const location = locations.find((l) => l.id === movement.locationId);
                return (
                  <Table.Tr key={movement.id}>
                    <Table.Td>{formatDateTime(movement.date)}</Table.Td>
                    <Table.Td>
                      <Badge color={getMovementTypeColor(movement.type)} size="sm" variant="light">
                        {movement.type.toUpperCase()}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text c={movement.quantity > 0 ? 'green' : 'red'} fw={500}>
                        {movement.quantity > 0 ? '+' : ''}
                        {movement.quantity}
                      </Text>
                    </Table.Td>
                    <Table.Td>{location?.name || 'Unknown'}</Table.Td>
                    <Table.Td>{movement.reason}</Table.Td>
                    <Table.Td>{movement.user}</Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Stack>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <Stack>
          <Text fw={600} size="lg">
            Stock Alerts
          </Text>

          {locations
            .filter((location) => {
              const status = getLocationStockStatus(
                location.stock.available,
                location.settings.reorderPoint,
                location.settings.maxStock,
              );
              return status.color === 'red' || status.color === 'orange';
            })
            .map((location) => {
              const status = getLocationStockStatus(
                location.stock.available,
                location.settings.reorderPoint,
                location.settings.maxStock,
              );
              return (
                <Card
                  key={location.id}
                  withBorder
                  style={{
                    backgroundColor:
                      status.color === 'red'
                        ? 'var(--mantine-color-red-0)'
                        : 'var(--mantine-color-yellow-0)',
                  }}
                >
                  <Group gap="sm">
                    <Badge color={status.color} variant="filled">
                      {status.color === 'red' ? 'CRITICAL' : 'WARNING'}
                    </Badge>
                    <Text fw={500} size="sm">
                      {location.name} - {status.label}
                    </Text>
                  </Group>
                  <Text c="dimmed" mt="xs" size="xs">
                    {status.color === 'red'
                      ? `No stock available. Immediate restocking required.`
                      : `Current stock (${location.stock.available} units) is below reorder point (${location.settings.reorderPoint} units).`}
                  </Text>
                  <Group gap="xs" mt="md">
                    <Button size="xs" variant="outline">
                      Create Purchase Order
                    </Button>
                    <Button size="xs" variant="light">
                      Transfer Stock
                    </Button>
                  </Group>
                </Card>
              );
            })}

          {locations.every((location) => {
            const status = getStockStatusForLocation(location);
            return status.color !== 'red' && status.color !== 'orange';
          }) && (
            <Card withBorder style={{ backgroundColor: 'var(--mantine-color-green-0)' }}>
              <Group gap="sm">
                <Badge color="green" variant="filled">
                  ALL GOOD
                </Badge>
                <Text fw={500} size="sm">
                  No stock alerts
                </Text>
              </Group>
              <Text c="dimmed" mt="xs" size="xs">
                All locations have adequate stock levels.
              </Text>
            </Card>
          )}
        </Stack>
      )}

      {/* Adjust Stock Tab */}
      {activeTab === 'adjust' && (
        <Stack>
          <Text fw={600} size="lg">
            Stock Adjustment
          </Text>

          <Card withBorder>
            <Stack>
              <Select
                placeholder="Select location"
                label="Location"
                {...form.getInputProps('inventory.adjustmentForm.locationId')}
                data={locations.map((location) => ({
                  label: location.name,
                  value: location.id,
                }))}
                required
              />

              <Select
                label="Adjustment Type"
                {...form.getInputProps('inventory.adjustmentForm.type')}
                data={[
                  { label: 'Stock Count Adjustment', value: 'adjustment' },
                  { label: 'Mark as Damaged', value: 'damage' },
                  { label: 'Stock In', value: 'in' },
                  { label: 'Stock Out', value: 'out' },
                ]}
              />

              <NumberInput
                placeholder="Enter quantity (use negative for reductions)"
                label="Quantity"
                {...form.getInputProps('inventory.adjustmentForm.quantity')}
                required
              />

              <Textarea
                placeholder="Explain the reason for this adjustment"
                label="Reason"
                {...form.getInputProps('inventory.adjustmentForm.reason')}
                required
              />

              <Group justify="flex-end" mt="md">
                <Button
                  onClick={() =>
                    form.setFieldValue('inventory.adjustmentForm', {
                      locationId: '',
                      adjustmentType: 'addition' as const,
                      quantity: 0,
                      reason: '',
                      notes: '',
                      type: 'adjustment' as const,
                    })
                  }
                  variant="outline"
                >
                  Clear
                </Button>
                <Button leftSection={<IconEdit size={16} />} onClick={handleStockAdjustment}>
                  Record Adjustment
                </Button>
              </Group>
            </Stack>
          </Card>
        </Stack>
      )}
    </Stack>
  );
}
