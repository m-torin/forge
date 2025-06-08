"use client";

import {
  ActionIcon,
  Badge,
  Button,
  Card,
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
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconAlertTriangle,
  IconBox,
  IconEdit,
  IconPlus,
  IconTrash,
  IconTrend,
} from "@tabler/icons-react";
import { useState } from "react";

// Demo inventory data structure (UI only)
interface InventoryLocation {
  id: string;
  name: string;
  type: "warehouse" | "store" | "distribution_center";
  address: string;
  isActive: boolean;
  stock: {
    available: number;
    reserved: number;
    damaged: number;
    inTransit?: number;
  };
  settings: {
    reorderPoint: number;
    maxStock: number;
    minDisplay?: number;
  };
  lastCount: Date;
  dailyAverage?: number;
}

interface StockMovement {
  id: string;
  type: "in" | "out" | "transfer" | "adjustment" | "damage";
  quantity: number;
  reason: string;
  locationId: string;
  date: Date;
  reference?: string;
  user: string;
}

interface InventoryManagementModalProps {
  opened: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onUpdate?: () => void;
}

export function InventoryManagementModal({
  opened,
  onClose,
  productId,
  productName,
  onUpdate,
}: InventoryManagementModalProps) {
  // Demo data
  const [locations] = useState<InventoryLocation[]>([
    {
      id: "wh-main",
      name: "Warehouse A - Main",
      type: "warehouse",
      address: "123 Industrial Blvd, City, State",
      isActive: true,
      stock: { available: 145, reserved: 12, damaged: 3 },
      settings: { reorderPoint: 25, maxStock: 200 },
      lastCount: new Date("2025-01-15"),
    },
    {
      id: "wh-west",
      name: "Warehouse B - West Coast",
      type: "warehouse", 
      address: "456 Logistics Ave, West City, State",
      isActive: true,
      stock: { available: 8, reserved: 5, damaged: 0, inTransit: 50 },
      settings: { reorderPoint: 15, maxStock: 100 },
      lastCount: new Date("2025-01-10"),
    },
    {
      id: "store-nyc",
      name: "Store - NYC Flagship",
      type: "store",
      address: "789 Fifth Ave, New York, NY",
      isActive: true,
      stock: { available: 25, reserved: 0, damaged: 0 },
      settings: { reorderPoint: 10, maxStock: 50, minDisplay: 5 },
      lastCount: new Date("2025-01-16"),
      dailyAverage: 3.2,
    },
  ]);

  const [movements] = useState<StockMovement[]>([
    {
      id: "mov-1",
      type: "in",
      quantity: 100,
      reason: "Purchase Order #PO-2025-001",
      locationId: "wh-main",
      date: new Date("2025-01-15"),
      reference: "PO-2025-001",
      user: "John Smith",
    },
    {
      id: "mov-2", 
      type: "out",
      quantity: -25,
      reason: "Sales Order #SO-2025-123",
      locationId: "wh-main",
      date: new Date("2025-01-16"),
      reference: "SO-2025-123",
      user: "System",
    },
    {
      id: "mov-3",
      type: "transfer",
      quantity: -50,
      reason: "Transfer to West Coast",
      locationId: "wh-main",
      date: new Date("2025-01-14"),
      reference: "TXF-001",
      user: "Jane Doe",
    },
    {
      id: "mov-4",
      type: "damage",
      quantity: -3,
      reason: "Damaged during handling",
      locationId: "wh-main", 
      date: new Date("2025-01-12"),
      user: "Mike Johnson",
    },
  ]);

  const [activeTab, setActiveTab] = useState<"overview" | "movements" | "alerts" | "adjust">("overview");
  const [adjustmentForm, setAdjustmentForm] = useState({
    locationId: "",
    type: "adjustment" as const,
    quantity: 0,
    reason: "",
  });

  const getTotalStock = () => {
    return locations.reduce((total, location) => total + location.stock.available, 0);
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case "warehouse": return "blue";
      case "store": return "green";
      case "distribution_center": return "purple";
      default: return "gray";
    }
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case "in": return "green";
      case "out": return "red"; 
      case "transfer": return "blue";
      case "adjustment": return "yellow";
      case "damage": return "red";
      default: return "gray";
    }
  };

  const getStockStatus = (location: InventoryLocation) => {
    if (location.stock.available <= 0) return { color: "red", label: "Out of Stock" };
    if (location.stock.available <= location.settings.reorderPoint) return { color: "orange", label: "Low Stock" };
    if (location.stock.available >= location.settings.maxStock * 0.9) return { color: "yellow", label: "High Stock" };
    return { color: "green", label: "In Stock" };
  };

  const handleStockAdjustment = () => {
    if (!adjustmentForm.locationId || !adjustmentForm.reason) {
      notifications.show({
        color: "red",
        message: "Please fill in all required fields",
        title: "Error",
      });
      return;
    }

    notifications.show({
      color: "green",
      message: `Stock adjustment recorded for ${adjustmentForm.quantity} units`,
      title: "Success",
    });

    setAdjustmentForm({
      locationId: "",
      type: "adjustment",
      quantity: 0,
      reason: "",
    });
    onUpdate?.();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={`Inventory Management - ${productName}`}
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack>
        {/* Tab Navigation */}
        <Group>
          <Button
            variant={activeTab === "overview" ? "filled" : "light"}
            onClick={() => setActiveTab("overview")}
            leftSection={<IconBox size={16} />}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === "movements" ? "filled" : "light"}
            onClick={() => setActiveTab("movements")}
            leftSection={<IconTrend size={16} />}
          >
            Movements
          </Button>
          <Button
            variant={activeTab === "alerts" ? "filled" : "light"}
            onClick={() => setActiveTab("alerts")}
            leftSection={<IconAlertTriangle size={16} />}
          >
            Alerts
          </Button>
          <Button
            variant={activeTab === "adjust" ? "filled" : "light"}
            onClick={() => setActiveTab("adjust")}
            leftSection={<IconEdit size={16} />}
          >
            Adjust Stock
          </Button>
        </Group>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <Stack>
            {/* Total Summary */}
            <Card withBorder style={{ backgroundColor: "var(--mantine-color-blue-0)" }}>
              <Group justify="space-between">
                <div>
                  <Text fw={600} size="lg">Total Available Inventory</Text>
                  <Text c="dimmed" size="sm">Across all locations</Text>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Text fw={700} size="xl" c="blue">{getTotalStock()} units</Text>
                  <Text c="dimmed" size="xs">Worth ~${(getTotalStock() * 299.99).toLocaleString()}</Text>
                </div>
              </Group>
            </Card>

            {/* Location Details */}
            <Stack>
              {locations.map((location) => {
                const status = getStockStatus(location);
                return (
                  <Card key={location.id} withBorder>
                    <Stack gap="sm">
                      <Group justify="space-between">
                        <div>
                          <Group gap="sm">
                            <Text fw={600}>{location.name}</Text>
                            <Badge
                              color={getLocationTypeColor(location.type)}
                              variant="light"
                              size="sm"
                            >
                              {location.type.replace("_", " ").toUpperCase()}
                            </Badge>
                            <Badge color={status.color} variant="light" size="sm">
                              {status.label}
                            </Badge>
                          </Group>
                          <Text c="dimmed" size="xs">{location.address}</Text>
                        </div>
                        <ActionIcon variant="subtle">
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Group>

                      <SimpleGrid cols={4} spacing="md">
                        <div>
                          <Text c="dimmed" size="xs">Available</Text>
                          <Text fw={600} size="lg" c="green">{location.stock.available}</Text>
                        </div>
                        <div>
                          <Text c="dimmed" size="xs">Reserved</Text>
                          <Text fw={600} size="lg" c="blue">{location.stock.reserved}</Text>
                        </div>
                        <div>
                          <Text c="dimmed" size="xs">Damaged</Text>
                          <Text fw={600} size="lg" c="red">{location.stock.damaged}</Text>
                        </div>
                        {location.stock.inTransit && (
                          <div>
                            <Text c="dimmed" size="xs">In Transit</Text>
                            <Text fw={600} size="lg" c="blue">{location.stock.inTransit}</Text>
                          </div>
                        )}
                      </SimpleGrid>

                      <Group gap="lg" mt="xs">
                        <Text size="sm">
                          <Text c="dimmed" span>Reorder Point:</Text>{" "}
                          <Text fw={500} span>{location.settings.reorderPoint}</Text>
                        </Text>
                        <Text size="sm">
                          <Text c="dimmed" span>Max Stock:</Text>{" "}
                          <Text fw={500} span>{location.settings.maxStock}</Text>
                        </Text>
                        <Text size="sm">
                          <Text c="dimmed" span>Last Count:</Text>{" "}
                          <Text fw={500} span>{formatDate(location.lastCount)}</Text>
                        </Text>
                        {location.dailyAverage && (
                          <Text size="sm">
                            <Text c="dimmed" span>Daily Avg:</Text>{" "}
                            <Text fw={500} span>{location.dailyAverage} units</Text>
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
        {activeTab === "movements" && (
          <Stack>
            <Group justify="space-between">
              <Text fw={600} size="lg">Stock Movements</Text>
              <Button leftSection={<IconPlus size={16} />} size="sm">
                Record Movement
              </Button>
            </Group>

            <Table striped highlightOnHover>
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
                  const location = locations.find(l => l.id === movement.locationId);
                  return (
                    <Table.Tr key={movement.id}>
                      <Table.Td>{formatDate(movement.date)}</Table.Td>
                      <Table.Td>
                        <Badge
                          color={getMovementTypeColor(movement.type)}
                          variant="light"
                          size="sm"
                        >
                          {movement.type.toUpperCase()}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text
                          c={movement.quantity > 0 ? "green" : "red"}
                          fw={500}
                        >
                          {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                        </Text>
                      </Table.Td>
                      <Table.Td>{location?.name || "Unknown"}</Table.Td>
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
        {activeTab === "alerts" && (
          <Stack>
            <Text fw={600} size="lg">Stock Alerts</Text>

            {locations
              .filter(location => {
                const status = getStockStatus(location);
                return status.color === "red" || status.color === "orange";
              })
              .map(location => {
                const status = getStockStatus(location);
                return (
                  <Card
                    key={location.id}
                    withBorder
                    style={{
                      backgroundColor: status.color === "red" 
                        ? "var(--mantine-color-red-0)"
                        : "var(--mantine-color-yellow-0)"
                    }}
                  >
                    <Group gap="sm">
                      <Badge
                        color={status.color}
                        variant="filled"
                      >
                        {status.color === "red" ? "CRITICAL" : "WARNING"}
                      </Badge>
                      <Text fw={500} size="sm">{location.name} - {status.label}</Text>
                    </Group>
                    <Text c="dimmed" mt="xs" size="xs">
                      {status.color === "red" 
                        ? `No stock available. Immediate restocking required.`
                        : `Current stock (${location.stock.available} units) is below reorder point (${location.settings.reorderPoint} units).`
                      }
                    </Text>
                    <Group mt="md" gap="xs">
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

            {locations.every(location => {
              const status = getStockStatus(location);
              return status.color !== "red" && status.color !== "orange";
            }) && (
              <Card withBorder style={{ backgroundColor: "var(--mantine-color-green-0)" }}>
                <Group gap="sm">
                  <Badge color="green" variant="filled">ALL GOOD</Badge>
                  <Text fw={500} size="sm">No stock alerts</Text>
                </Group>
                <Text c="dimmed" mt="xs" size="xs">
                  All locations have adequate stock levels.
                </Text>
              </Card>
            )}
          </Stack>
        )}

        {/* Adjust Stock Tab */}
        {activeTab === "adjust" && (
          <Stack>
            <Text fw={600} size="lg">Stock Adjustment</Text>

            <Card withBorder>
              <Stack>
                <Select
                  label="Location"
                  placeholder="Select location"
                  value={adjustmentForm.locationId}
                  onChange={(value) => setAdjustmentForm(prev => ({ ...prev, locationId: value || "" }))}
                  data={locations.map(location => ({
                    value: location.id,
                    label: location.name,
                  }))}
                  required
                />

                <Select
                  label="Adjustment Type"
                  value={adjustmentForm.type}
                  onChange={(value) => setAdjustmentForm(prev => ({ 
                    ...prev, 
                    type: value as "adjustment" 
                  }))}
                  data={[
                    { value: "adjustment", label: "Stock Count Adjustment" },
                    { value: "damage", label: "Mark as Damaged" },
                    { value: "in", label: "Stock In" },
                    { value: "out", label: "Stock Out" },
                  ]}
                />

                <NumberInput
                  label="Quantity"
                  placeholder="Enter quantity (use negative for reductions)"
                  value={adjustmentForm.quantity}
                  onChange={(value) => setAdjustmentForm(prev => ({ 
                    ...prev, 
                    quantity: typeof value === 'number' ? value : 0 
                  }))}
                  required
                />

                <Textarea
                  label="Reason"
                  placeholder="Explain the reason for this adjustment"
                  value={adjustmentForm.reason}
                  onChange={(e) => setAdjustmentForm(prev => ({ 
                    ...prev, 
                    reason: e.currentTarget.value 
                  }))}
                  required
                />

                <Group justify="flex-end" mt="md">
                  <Button
                    onClick={() => setAdjustmentForm({
                      locationId: "",
                      type: "adjustment",
                      quantity: 0,
                      reason: "",
                    })}
                    variant="outline"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleStockAdjustment}
                    leftSection={<IconEdit size={16} />}
                  >
                    Record Adjustment
                  </Button>
                </Group>
              </Stack>
            </Card>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}