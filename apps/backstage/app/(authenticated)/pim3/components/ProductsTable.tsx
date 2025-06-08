"use client";

import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Checkbox,
  Group,
  Loader,
  Menu,
  Pagination,
  rem,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  IconArchive,
  IconChevronDown,
  IconChevronUp,
  IconDots,
  IconEdit,
  IconEye,
  IconPlus,
  IconSearch,
  IconSelector,
  IconTrash,
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

import {
  bulkDeleteProducts,
  bulkUpdateProductStatus,
  deleteProduct,
  getProducts,
} from "../actions";

import { ProductDetailsModal } from "./ProductDetailsModal";
import { ProductFormModal } from "./ProductFormModal";

import type { Product, ProductStatus } from "@repo/database/prisma";

interface ProductWithRelations extends Product {
  _count: {
    scanHistory: number;
    soldBy: number;
  };
  barcodes: { id: string; barcode: string; type: string; isPrimary: boolean }[];
  digitalAssets: { id: string; url: string; type: string }[];
  soldBy: {
    id: string;
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

export function ProductsTable() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "">("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [productModalOpened, setProductModalOpened] = useState(false);
  const [detailsModalOpened, setDetailsModalOpened] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<ProductWithRelations | null>(null);
  const [viewingProduct, setViewingProduct] =
    useState<ProductWithRelations | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getProducts({
        category: categoryFilter || undefined,
        limit: 10,
        page,
        search,
        status: (statusFilter as ProductStatus) || undefined,
      });

      if (result.success && result.data) {
        setProducts(result.data);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
        }
      } else {
        notifications.show({
          color: "red",
          message: result.error || "Failed to load products",
          title: "Error",
        });
      }
    } catch (error) {
      notifications.show({
        color: "red",
        message: "Failed to load products",
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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
          Are you sure you want to delete this product? This action is
          irreversible and will also delete all related barcodes and assets.
        </Text>
      ),
      confirmProps: { color: "red" },
      labels: { cancel: "Cancel", confirm: "Delete" },
      onCancel: () => {},
      onConfirm: async () => {
        const result = await deleteProduct(id);
        if (result.success) {
          notifications.show({
            color: "green",
            message: "Product deleted successfully",
            title: "Success",
          });
          loadProducts();
        } else {
          notifications.show({
            color: "red",
            message: result.error || "Failed to delete product",
            title: "Error",
          });
        }
      },
      title: "Delete Product",
    });
  };

  const handleBulkStatusUpdate = async (status: ProductStatus) => {
    if (selectedRows.length === 0) return;

    const result = await bulkUpdateProductStatus(selectedRows, status);
    if (result.success) {
      notifications.show({
        color: "green",
        message: `Updated ${selectedRows.length} products`,
        title: "Success",
      });
      setSelectedRows([]);
      loadProducts();
    } else {
      notifications.show({
        color: "red",
        message: result.error || "Failed to update products",
        title: "Error",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;

    modals.openConfirmModal({
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete {selectedRows.length} products? This
          action is irreversible.
        </Text>
      ),
      confirmProps: { color: "red" },
      labels: { cancel: "Cancel", confirm: "Delete" },
      onCancel: () => {},
      onConfirm: async () => {
        const result = await bulkDeleteProducts(selectedRows);
        if (result.success) {
          notifications.show({
            color: "green",
            message: `Deleted ${selectedRows.length} products`,
            title: "Success",
          });
          setSelectedRows([]);
          loadProducts();
        } else {
          notifications.show({
            color: "red",
            message: result.error || "Failed to delete products",
            title: "Error",
          });
        }
      },
      title: "Delete Products",
    });
  };

  const sortedData = sortBy
    ? [...products].sort((a, b) => {
        if (!sortBy) return 0;
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return reverseSortDirection
            ? bValue.localeCompare(aValue)
            : aValue.localeCompare(bValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return reverseSortDirection ? bValue - aValue : aValue - bValue;
        }

        return 0;
      })
    : products;

  const rows = sortedData.map((product) => {
    const selected = selectedRows.includes(product.id);
    return (
      <Table.Tr key={product.id} bg={selected ? "blue.0" : undefined}>
        <Table.Td>
          <Checkbox
            onChange={(event) => {
              if (event.currentTarget.checked) {
                setSelectedRows([...selectedRows, product.id]);
              } else {
                setSelectedRows(selectedRows.filter((id) => id !== product.id));
              }
            }}
            checked={selected}
          />
        </Table.Td>
        <Table.Td>
          <Group gap="sm">
            <div>
              <Text fw={500} fz="sm">
                {product.name}
              </Text>
              <Text c="dimmed" fz="xs">
                SKU: {product.sku}
              </Text>
            </div>
          </Group>
        </Table.Td>
        <Table.Td>{product.category}</Table.Td>
        <Table.Td>
          <Badge
            color={
              product.status === "ACTIVE"
                ? "green"
                : product.status === "DRAFT"
                  ? "blue"
                  : product.status === "ARCHIVED"
                    ? "gray"
                    : "red"
            }
            variant="light"
          >
            {product.status}
          </Badge>
        </Table.Td>
        <Table.Td>{product.brand || "-"}</Table.Td>
        <Table.Td>
          {product.price
            ? `${product.currency} ${product.price.toFixed(2)}`
            : "-"}
        </Table.Td>
        <Table.Td>{product.barcodes.length}</Table.Td>
        <Table.Td>{product.digitalAssets.length}</Table.Td>
        <Table.Td>
          <Group gap="xs">
            <Text fw={500}>{product._count.soldBy}</Text>
            {product.soldBy.length > 0 && (
              <Tooltip
                label={
                  <Stack gap="xs">
                    {product.soldBy.map((pdp) => (
                      <Group key={pdp.id} gap="xs" justify="space-between">
                        <Text size="sm">{pdp.brand.name}</Text>
                        <Group gap="xs">
                          <Text c="green" size="xs">$299.99</Text>
                          <Badge color="green" size="xs" variant="dot">
                            In Stock
                          </Badge>
                        </Group>
                      </Group>
                    ))}
                  </Stack>
                }
                multiline
              >
                <Badge style={{ cursor: "pointer" }} size="xs" variant="outline">
                  {product.soldBy.length > 2
                    ? `${product.soldBy.slice(0, 2).map((pdp) => pdp.brand.name).join(", ")} +${product.soldBy.length - 2}`
                    : product.soldBy.map((pdp) => pdp.brand.name).join(", ")}
                </Badge>
              </Tooltip>
            )}
          </Group>
          
          {/* Primary seller indicator */}
          {product.soldBy.length > 0 && (
            <Text c="dimmed" mt={2} size="xs">
              Primary: Amazon
            </Text>
          )}
        </Table.Td>
        <Table.Td>
          {product.soldBy.length > 0 ? (
            <Stack gap={2}>
              <Text c="green" fw={500} size="sm">
                $289.99
              </Text>
              <Text c="dimmed" size="xs">
                Walmart
              </Text>
            </Stack>
          ) : (
            <Text c="dimmed" size="sm">No prices</Text>
          )}
        </Table.Td>
        <Table.Td>{product._count.scanHistory}</Table.Td>
        <Table.Td>
          {product.aiGenerated && (
            <Badge color="violet" size="xs" variant="light">
              AI
            </Badge>
          )}
        </Table.Td>
        <Table.Td>
          <Group gap={0} justify="flex-end">
            <ActionIcon
              color="gray"
              onClick={() => {
                setViewingProduct(product);
                setDetailsModalOpened(true);
              }}
              variant="subtle"
            >
              <IconEye style={{ width: rem(16), height: rem(16) }} />
            </ActionIcon>
            <ActionIcon
              color="gray"
              onClick={() => {
                setEditingProduct(product);
                setProductModalOpened(true);
              }}
              variant="subtle"
            >
              <IconEdit style={{ width: rem(16), height: rem(16) }} />
            </ActionIcon>
            <Menu position="bottom-end" shadow="sm" withinPortal>
              <Menu.Target>
                <ActionIcon color="gray" variant="subtle">
                  <IconDots style={{ width: rem(16), height: rem(16) }} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={
                    <IconArchive style={{ width: rem(14), height: rem(14) }} />
                  }
                  onClick={() => handleBulkStatusUpdate("ARCHIVED")}
                >
                  Archive
                </Menu.Item>
                <Menu.Item
                  color="red"
                  leftSection={
                    <IconTrash style={{ width: rem(14), height: rem(14) }} />
                  }
                  onClick={() => handleDelete(product.id)}
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
            placeholder="Search products..."
            style={{ width: rem(250) }}
            value={search}
          />
          <Select
            onChange={(value) => setStatusFilter(value as ProductStatus | "")}
            placeholder="Filter by status"
            style={{ width: rem(150) }}
            clearable
            data={[
              { label: "All statuses", value: "" },
              { label: "Draft", value: "DRAFT" },
              { label: "Active", value: "ACTIVE" },
              { label: "Archived", value: "ARCHIVED" },
              { label: "Discontinued", value: "DISCONTINUED" },
            ]}
            value={statusFilter}
          />
          <TextInput
            onChange={(e) => setCategoryFilter(e.currentTarget.value)}
            placeholder="Filter by category"
            style={{ width: rem(150) }}
            value={categoryFilter}
          />
        </Group>
        <Group>
          {selectedRows.length > 0 && (
            <Group>
              <Text c="dimmed" size="sm">
                {selectedRows.length} selected
              </Text>
              <Menu position="bottom-end" shadow="sm" withinPortal>
                <Menu.Target>
                  <Button size="sm" variant="light">
                    Bulk Actions
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Update Status</Menu.Label>
                  <Menu.Item onClick={() => handleBulkStatusUpdate("ACTIVE")}>
                    Set Active
                  </Menu.Item>
                  <Menu.Item onClick={() => handleBulkStatusUpdate("ARCHIVED")}>
                    Archive
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => handleBulkStatusUpdate("DISCONTINUED")}
                  >
                    Discontinue
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={
                      <IconTrash style={{ width: rem(14), height: rem(14) }} />
                    }
                    onClick={handleBulkDelete}
                  >
                    Delete Selected
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          )}
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              setEditingProduct(null);
              setProductModalOpened(true);
            }}
          >
            Add Product
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
                      setSelectedRows(products.map((p) => p.id));
                    } else {
                      setSelectedRows([]);
                    }
                  }}
                  checked={
                    selectedRows.length === products.length &&
                    products.length > 0
                  }
                  indeterminate={
                    selectedRows.length > 0 &&
                    selectedRows.length < products.length
                  }
                />
              </Table.Th>
              <Th
                onSort={() => setSorting("name")}
                sorted={sortBy === "name"}
                reversed={reverseSortDirection}
              >
                Product
              </Th>
              <Th
                onSort={() => setSorting("category")}
                sorted={sortBy === "category"}
                reversed={reverseSortDirection}
              >
                Category
              </Th>
              <Th
                onSort={() => setSorting("status")}
                sorted={sortBy === "status"}
                reversed={reverseSortDirection}
              >
                Status
              </Th>
              <Th
                onSort={() => setSorting("brand")}
                sorted={sortBy === "brand"}
                reversed={reverseSortDirection}
              >
                Brand
              </Th>
              <Th
                onSort={() => setSorting("price")}
                sorted={sortBy === "price"}
                reversed={reverseSortDirection}
              >
                Price
              </Th>
              <Table.Th>Barcodes</Table.Th>
              <Table.Th>Assets</Table.Th>
              <Table.Th>Sellers</Table.Th>
              <Table.Th>Best Price</Table.Th>
              <Table.Th>Scans</Table.Th>
              <Table.Th>AI</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={13}>
                  <Center py="xl">
                    <Loader />
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={13}>
                  <Text c="dimmed" fw={500} py="xl" ta="center">
                    No products found
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

      <ProductFormModal
        onClose={() => {
          setProductModalOpened(false);
          setEditingProduct(null);
        }}
        onSuccess={() => {
          loadProducts();
          setProductModalOpened(false);
          setEditingProduct(null);
        }}
        opened={productModalOpened}
        product={editingProduct}
      />

      <ProductDetailsModal
        onClose={() => {
          setDetailsModalOpened(false);
          setViewingProduct(null);
        }}
        onUpdate={loadProducts}
        opened={detailsModalOpened}
        product={viewingProduct}
      />
    </Stack>
  );
}
