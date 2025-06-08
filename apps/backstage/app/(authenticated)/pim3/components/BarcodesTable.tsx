"use client";

import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Checkbox,
  Code,
  CopyButton,
  Group,
  Loader,
  Menu,
  Modal,
  Pagination,
  rem,
  ScrollArea,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  IconDots,
  IconPlus,
  IconSearch,
  IconSelector,
  IconStar,
  IconStarFilled,
  IconTrash,
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

import { createBarcode, deleteBarcode, getBarcodes } from "../actions";

import type { BarcodeType, ProductBarcode } from "@repo/database/prisma";

interface ProductBarcodeWithProduct extends ProductBarcode {
  product: {
    id: string;
    name: string;
    sku: string;
  };
}

interface ThProps {
  children: React.ReactNode;
  onSort(): void;
  reversed: boolean;
  sorted: boolean;
}

function Th({ children, onSort, reversed, sorted }: ThProps) {
  const Icon = sorted
    ? reversed
      ? IconChevronUp
      : IconChevronDown
    : IconSelector;
  return (
    <Table.Th>
      <UnstyledButton onClick={onSort} style={{ width: "100%" }}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center>
            <Icon stroke={1.5} style={{ width: rem(16), height: rem(16) }} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

interface BarcodeFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  opened: boolean;
}

function BarcodeFormModal({
  onClose,
  onSuccess,
  opened,
}: BarcodeFormModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    validate: {
      barcode: (value) => (!value ? "Barcode is required" : null),
      productId: (value) => (!value ? "Product is required" : null),
    },
    initialValues: {
      type: "UPC_A" as BarcodeType,
      barcode: "",
      isPrimary: false,
      productId: "",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      const result = await createBarcode(formData);

      if (result.success) {
        notifications.show({
          color: "green",
          message: "Barcode created successfully",
          title: "Success",
        });
        onSuccess();
        form.reset();
      } else {
        notifications.show({
          color: "red",
          message: result.error || "Failed to create barcode",
          title: "Error",
        });
      }
    } catch (error) {
      notifications.show({
        color: "red",
        message: "Failed to create barcode",
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} opened={opened} size="md" title="Add Barcode">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            placeholder="Enter product ID"
            label="Product ID"
            required
            {...form.getInputProps("productId")}
          />

          <TextInput
            placeholder="Enter barcode value"
            label="Barcode"
            required
            {...form.getInputProps("barcode")}
          />

          <Select
            data={[
              { label: "UPC-A", value: "UPC_A" },
              { label: "UPC-E", value: "UPC_E" },
              { label: "EAN-13", value: "EAN_13" },
              { label: "EAN-8", value: "EAN_8" },
              { label: "Code 128", value: "CODE_128" },
              { label: "Code 39", value: "CODE_39" },
              { label: "QR Code", value: "QR_CODE" },
              { label: "PDF417", value: "PDF417" },
              { label: "Aztec", value: "AZTEC" },
              { label: "Data Matrix", value: "DATA_MATRIX" },
              { label: "ITF-14", value: "ITF14" },
              { label: "Codabar", value: "CODABAR" },
              { label: "Other", value: "OTHER" },
            ]}
            label="Barcode Type"
            required
            {...form.getInputProps("type")}
          />

          <Switch
            description="Primary barcodes are used as the default for product identification"
            label="Set as Primary Barcode"
            {...form.getInputProps("isPrimary", { type: "checkbox" })}
          />

          <Group justify="flex-end" mt="md">
            <Button onClick={onClose} variant="light">
              Cancel
            </Button>
            <Button loading={loading} type="submit">
              Create Barcode
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export function BarcodesTable() {
  const [barcodes, setBarcodes] = useState<ProductBarcodeWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<BarcodeType | "">("");
  const [primaryFilter, setPrimaryFilter] = useState<
    "all" | "primary" | "secondary"
  >("all");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [barcodeModalOpened, setBarcodeModalOpened] = useState(false);

  const loadBarcodes = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getBarcodes({
        type: (typeFilter as BarcodeType) || undefined,
        isPrimary:
          primaryFilter === "all" ? undefined : primaryFilter === "primary",
        limit: 10,
        page,
        search,
      });

      if (result.success && result.data) {
        setBarcodes(result.data);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
        }
      } else {
        notifications.show({
          color: "red",
          message: result.error || "Failed to load barcodes",
          title: "Error",
        });
      }
    } catch (error) {
      notifications.show({
        color: "red",
        message: "Failed to load barcodes",
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, primaryFilter, page]);

  useEffect(() => {
    loadBarcodes();
  }, [loadBarcodes]);

  const setSorting = (field: string) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
  };

  const handleDelete = async (id: string) => {
    modals.openConfirmModal({
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete this barcode? This action is
          irreversible.
        </Text>
      ),
      confirmProps: { color: "red" },
      labels: { cancel: "Cancel", confirm: "Delete" },
      onCancel: () => {},
      onConfirm: async () => {
        const result = await deleteBarcode(id);
        if (result.success) {
          notifications.show({
            color: "green",
            message: "Barcode deleted successfully",
            title: "Success",
          });
          loadBarcodes();
        } else {
          notifications.show({
            color: "red",
            message: result.error || "Failed to delete barcode",
            title: "Error",
          });
        }
      },
      title: "Delete Barcode",
    });
  };

  const getBarcodeTypeColor = (type: BarcodeType) => {
    switch (type) {
      case "UPC_A":
      case "UPC_E":
        return "blue";
      case "EAN_13":
      case "EAN_8":
        return "green";
      case "QR_CODE":
        return "violet";
      case "CODE_128":
      case "CODE_39":
        return "orange";
      default:
        return "gray";
    }
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

  const sortedData = sortBy
    ? [...barcodes].sort((a, b) => {
        if (!sortBy) return 0;
        const aValue = (a as any)[sortBy];
        const bValue = (b as any)[sortBy];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return reverseSortDirection
            ? bValue.localeCompare(aValue)
            : aValue.localeCompare(bValue);
        }

        if (typeof aValue === "boolean" && typeof bValue === "boolean") {
          return reverseSortDirection
            ? (bValue ? 1 : 0) - (aValue ? 1 : 0)
            : (aValue ? 1 : 0) - (bValue ? 1 : 0);
        }

        if (aValue instanceof Date && bValue instanceof Date) {
          return reverseSortDirection
            ? bValue.getTime() - aValue.getTime()
            : aValue.getTime() - bValue.getTime();
        }

        return 0;
      })
    : barcodes;

  const rows = sortedData.map((barcode) => {
    const selected = selectedRows.includes(barcode.id);
    return (
      <Table.Tr key={barcode.id} bg={selected ? "blue.0" : undefined}>
        <Table.Td>
          <Checkbox
            onChange={(event) => {
              if (event.currentTarget.checked) {
                setSelectedRows([...selectedRows, barcode.id]);
              } else {
                setSelectedRows(selectedRows.filter((id) => id !== barcode.id));
              }
            }}
            checked={selected}
          />
        </Table.Td>
        <Table.Td>
          <Group gap="xs">
            <Code ff="monospace" fz="sm">
              {barcode.barcode}
            </Code>
            <CopyButton value={barcode.barcode}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? "Copied" : "Copy barcode"}>
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
        </Table.Td>
        <Table.Td>
          <Badge color={getBarcodeTypeColor(barcode.type)} variant="light">
            {barcode.type.replace("_", "-")}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Group gap="sm">
            <div>
              <Text fw={500} fz="sm">
                {barcode.product.name}
              </Text>
              <Text c="dimmed" fz="xs">
                SKU: {barcode.product.sku}
              </Text>
            </div>
          </Group>
        </Table.Td>
        <Table.Td>
          {barcode.isPrimary ? (
            <Badge
              color="blue"
              leftSection={<IconStarFilled size={12} />}
              variant="filled"
            >
              Primary
            </Badge>
          ) : (
            <Text c="dimmed" size="sm">
              Secondary
            </Text>
          )}
        </Table.Td>
        <Table.Td>
          <Text c="dimmed" fz="sm">
            {formatDate(barcode.createdAt)}
          </Text>
        </Table.Td>
        <Table.Td>
          <Group gap={0} justify="flex-end">
            <CopyButton value={barcode.barcode}>
              {({ copied, copy }) => (
                <ActionIcon color="gray" onClick={copy} variant="subtle">
                  {copied ? (
                    <IconCheck style={{ width: rem(16), height: rem(16) }} />
                  ) : (
                    <IconCopy style={{ width: rem(16), height: rem(16) }} />
                  )}
                </ActionIcon>
              )}
            </CopyButton>
            <Menu position="bottom-end" shadow="sm" withinPortal>
              <Menu.Target>
                <ActionIcon color="gray" variant="subtle">
                  <IconDots style={{ width: rem(16), height: rem(16) }} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={
                    <IconStar style={{ width: rem(14), height: rem(14) }} />
                  }
                  onClick={() => {
                    // Implement set as primary
                  }}
                  disabled={barcode.isPrimary}
                >
                  Set as Primary
                </Menu.Item>
                <Menu.Item
                  color="red"
                  leftSection={
                    <IconTrash style={{ width: rem(14), height: rem(14) }} />
                  }
                  onClick={() => handleDelete(barcode.id)}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Stack>
      <Group justify="space-between">
        <Group>
          <TextInput
            leftSection={
              <IconSearch style={{ width: rem(16), height: rem(16) }} />
            }
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder="Search barcodes..."
            style={{ width: rem(250) }}
            value={search}
          />
          <Select
            onChange={(value) => setTypeFilter(value as BarcodeType | "")}
            placeholder="Filter by type"
            style={{ width: rem(150) }}
            clearable
            data={[
              { label: "All types", value: "" },
              { label: "UPC-A", value: "UPC_A" },
              { label: "UPC-E", value: "UPC_E" },
              { label: "EAN-13", value: "EAN_13" },
              { label: "EAN-8", value: "EAN_8" },
              { label: "Code 128", value: "CODE_128" },
              { label: "Code 39", value: "CODE_39" },
              { label: "QR Code", value: "QR_CODE" },
              { label: "Other", value: "OTHER" },
            ]}
            value={typeFilter}
          />
          <Select
            onChange={(value) =>
              setPrimaryFilter(value as "all" | "primary" | "secondary")
            }
            placeholder="Filter by primary"
            style={{ width: rem(150) }}
            data={[
              { label: "All barcodes", value: "all" },
              { label: "Primary only", value: "primary" },
              { label: "Secondary only", value: "secondary" },
            ]}
            value={primaryFilter}
          />
        </Group>
        <Group>
          {selectedRows.length > 0 && (
            <Group>
              <Text c="dimmed" size="sm">
                {selectedRows.length} selected
              </Text>
              <Button
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={() => {
                  // Implement bulk delete
                }}
                size="sm"
                variant="light"
              >
                Delete Selected
              </Button>
            </Group>
          )}
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setBarcodeModalOpened(true)}
          >
            Add Barcode
          </Button>
        </Group>
      </Group>

      <ScrollArea>
        <Table highlightOnHover striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: rem(40) }}>
                <Checkbox
                  onChange={(event) => {
                    if (event.currentTarget.checked) {
                      setSelectedRows(barcodes.map((b) => b.id));
                    } else {
                      setSelectedRows([]);
                    }
                  }}
                  checked={
                    selectedRows.length === barcodes.length &&
                    barcodes.length > 0
                  }
                  indeterminate={
                    selectedRows.length > 0 &&
                    selectedRows.length < barcodes.length
                  }
                />
              </Table.Th>
              <Th
                onSort={() => setSorting("barcode")}
                sorted={sortBy === "barcode"}
                reversed={reverseSortDirection}
              >
                Barcode
              </Th>
              <Th
                onSort={() => setSorting("type")}
                sorted={sortBy === "type"}
                reversed={reverseSortDirection}
              >
                Type
              </Th>
              <Table.Th>Product</Table.Th>
              <Th
                onSort={() => setSorting("isPrimary")}
                sorted={sortBy === "isPrimary"}
                reversed={reverseSortDirection}
              >
                Status
              </Th>
              <Th
                onSort={() => setSorting("createdAt")}
                sorted={sortBy === "createdAt"}
                reversed={reverseSortDirection}
              >
                Created
              </Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Center py="xl">
                    <Loader />
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text c="dimmed" fw={500} py="xl" ta="center">
                    No barcodes found
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Pagination
            boundaries={1}
            onChange={setPage}
            total={totalPages}
            siblings={1}
            value={page}
          />
        </Group>
      )}

      <BarcodeFormModal
        onClose={() => setBarcodeModalOpened(false)}
        onSuccess={() => {
          loadBarcodes();
          setBarcodeModalOpened(false);
        }}
        opened={barcodeModalOpened}
      />
    </Stack>
  );
}
