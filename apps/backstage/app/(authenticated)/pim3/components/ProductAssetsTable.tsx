"use client";

import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Checkbox,
  Group,
  Image,
  Loader,
  Menu,
  Modal,
  NumberInput,
  Pagination,
  rem,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  IconChevronDown,
  IconChevronUp,
  IconDots,
  IconEye,
  IconFile,
  IconFileText,
  IconPhoto,
  IconPlus,
  IconSearch,
  IconSelector,
  IconTrash,
  IconVideo,
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

import { createAsset, deleteAsset, getAssets } from "../actions";

import type { AssetType, ProductAsset } from "@repo/database/prisma";

interface ProductAssetWithProduct extends ProductAsset {
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

interface AssetFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  opened: boolean;
}

function AssetFormModal({ onClose, onSuccess, opened }: AssetFormModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    validate: {
      filename: (value) => (!value ? "Filename is required" : null),
      url: (value) => (!value ? "URL is required" : null),
      productId: (value) => (!value ? "Product is required" : null),
    },
    initialValues: {
      filename: "",
      type: "IMAGE" as AssetType,
      url: "",
      alt: "",
      description: "",
      mimeType: "",
      productId: "",
      size: "",
      sortOrder: "0",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value.toString());
        }
      });

      const result = await createAsset(formData);

      if (result.success) {
        notifications.show({
          color: "green",
          message: "Asset created successfully",
          title: "Success",
        });
        onSuccess();
        form.reset();
      } else {
        notifications.show({
          color: "red",
          message: result.error || "Failed to create asset",
          title: "Error",
        });
      }
    } catch (error) {
      notifications.show({
        color: "red",
        message: "Failed to create asset",
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      opened={opened}
      size="lg"
      title="Add Digital Asset"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            placeholder="Enter product ID"
            label="Product ID"
            required
            {...form.getInputProps("productId")}
          />

          <Select
            data={[
              { label: "Image", value: "IMAGE" },
              { label: "Video", value: "VIDEO" },
              { label: "Document", value: "DOCUMENT" },
              { label: "Manual", value: "MANUAL" },
              { label: "Specification", value: "SPECIFICATION" },
              { label: "Certificate", value: "CERTIFICATE" },
              { label: "Other", value: "OTHER" },
            ]}
            label="Asset Type"
            required
            {...form.getInputProps("type")}
          />

          <TextInput
            placeholder="https://example.com/asset.jpg"
            label="URL"
            required
            {...form.getInputProps("url")}
          />

          <Group grow>
            <TextInput
              placeholder="asset.jpg"
              label="Filename"
              required
              {...form.getInputProps("filename")}
            />
            <TextInput
              placeholder="image/jpeg"
              label="MIME Type"
              {...form.getInputProps("mimeType")}
            />
          </Group>

          <Group grow>
            <NumberInput
              placeholder="1024"
              label="File Size (bytes)"
              {...form.getInputProps("size")}
            />
            <NumberInput
              placeholder="0"
              label="Sort Order"
              {...form.getInputProps("sortOrder")}
            />
          </Group>

          <TextInput
            placeholder="Alternative text for images"
            label="Alt Text"
            {...form.getInputProps("alt")}
          />

          <Textarea
            minRows={3}
            placeholder="Asset description"
            label="Description"
            {...form.getInputProps("description")}
          />

          <Group justify="flex-end" mt="md">
            <Button onClick={onClose} variant="light">
              Cancel
            </Button>
            <Button loading={loading} type="submit">
              Create Asset
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export function ProductAssetsTable() {
  const [assets, setAssets] = useState<ProductAssetWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AssetType | "">("");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [assetModalOpened, setAssetModalOpened] = useState(false);
  const [previewModalOpened, setPreviewModalOpened] = useState(false);
  const [previewAsset, setPreviewAsset] =
    useState<ProductAssetWithProduct | null>(null);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAssets({
        type: (typeFilter as AssetType) || undefined,
        limit: 10,
        page,
        search,
      });

      if (result.success && result.data) {
        setAssets(result.data);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
        }
      } else {
        notifications.show({
          color: "red",
          message: result.error || "Failed to load assets",
          title: "Error",
        });
      }
    } catch (error) {
      notifications.show({
        color: "red",
        message: "Failed to load assets",
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, page]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

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
          Are you sure you want to delete this asset? This action is
          irreversible.
        </Text>
      ),
      confirmProps: { color: "red" },
      labels: { cancel: "Cancel", confirm: "Delete" },
      onCancel: () => {},
      onConfirm: async () => {
        const result = await deleteAsset(id);
        if (result.success) {
          notifications.show({
            color: "green",
            message: "Asset deleted successfully",
            title: "Success",
          });
          loadAssets();
        } else {
          notifications.show({
            color: "red",
            message: result.error || "Failed to delete asset",
            title: "Error",
          });
        }
      },
      title: "Delete Asset",
    });
  };

  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case "IMAGE":
        return <IconPhoto size={16} />;
      case "VIDEO":
        return <IconVideo size={16} />;
      case "DOCUMENT":
      case "MANUAL":
      case "SPECIFICATION":
      case "CERTIFICATE":
        return <IconFileText size={16} />;
      default:
        return <IconFile size={16} />;
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "N/A";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const sortedData = sortBy
    ? [...assets].sort((a, b) => {
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
    : assets;

  const rows = sortedData.map((asset) => {
    const selected = selectedRows.includes(asset.id);
    return (
      <Table.Tr key={asset.id} bg={selected ? "blue.0" : undefined}>
        <Table.Td>
          <Checkbox
            onChange={(event) => {
              if (event.currentTarget.checked) {
                setSelectedRows([...selectedRows, asset.id]);
              } else {
                setSelectedRows(selectedRows.filter((id) => id !== asset.id));
              }
            }}
            checked={selected}
          />
        </Table.Td>
        <Table.Td>
          <Group gap="sm">
            {asset.type === "IMAGE" && (
              <Image
                alt={asset.alt || asset.filename}
                fit="cover"
                h={40}
                radius="sm"
                src={asset.url}
                w={40}
              />
            )}
            <div>
              <Text fw={500} fz="sm">
                {asset.filename}
              </Text>
              <Text c="dimmed" fz="xs">
                {asset.product.name}
              </Text>
            </div>
          </Group>
        </Table.Td>
        <Table.Td>
          <Badge leftSection={getAssetIcon(asset.type)} variant="light">
            {asset.type}
          </Badge>
        </Table.Td>
        <Table.Td>{formatFileSize(asset.size)}</Table.Td>
        <Table.Td>{asset.sortOrder}</Table.Td>
        <Table.Td>
          <Text c="dimmed" fz="xs" maw={200} truncate>
            {asset.description || "-"}
          </Text>
        </Table.Td>
        <Table.Td>
          <Group gap={0} justify="flex-end">
            <ActionIcon
              color="gray"
              onClick={() => {
                setPreviewAsset(asset);
                setPreviewModalOpened(true);
              }}
              variant="subtle"
            >
              <IconEye style={{ width: rem(16), height: rem(16) }} />
            </ActionIcon>
            <Menu position="bottom-end" shadow="sm" withinPortal>
              <Menu.Target>
                <ActionIcon color="gray" variant="subtle">
                  <IconDots style={{ width: rem(16), height: rem(16) }} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  color="red"
                  leftSection={
                    <IconTrash style={{ width: rem(14), height: rem(14) }} />
                  }
                  onClick={() => handleDelete(asset.id)}
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
            placeholder="Search assets..."
            style={{ width: rem(250) }}
            value={search}
          />
          <Select
            onChange={(value) => setTypeFilter(value as AssetType | "")}
            placeholder="Filter by type"
            style={{ width: rem(150) }}
            clearable
            data={[
              { label: "All types", value: "" },
              { label: "Image", value: "IMAGE" },
              { label: "Video", value: "VIDEO" },
              { label: "Document", value: "DOCUMENT" },
              { label: "Manual", value: "MANUAL" },
              { label: "Specification", value: "SPECIFICATION" },
              { label: "Certificate", value: "CERTIFICATE" },
              { label: "Other", value: "OTHER" },
            ]}
            value={typeFilter}
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
            onClick={() => setAssetModalOpened(true)}
          >
            Add Asset
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
                      setSelectedRows(assets.map((a) => a.id));
                    } else {
                      setSelectedRows([]);
                    }
                  }}
                  checked={
                    selectedRows.length === assets.length && assets.length > 0
                  }
                  indeterminate={
                    selectedRows.length > 0 &&
                    selectedRows.length < assets.length
                  }
                />
              </Table.Th>
              <Th
                onSort={() => setSorting("filename")}
                sorted={sortBy === "filename"}
                reversed={reverseSortDirection}
              >
                Asset
              </Th>
              <Th
                onSort={() => setSorting("type")}
                sorted={sortBy === "type"}
                reversed={reverseSortDirection}
              >
                Type
              </Th>
              <Th
                onSort={() => setSorting("size")}
                sorted={sortBy === "size"}
                reversed={reverseSortDirection}
              >
                Size
              </Th>
              <Th
                onSort={() => setSorting("sortOrder")}
                sorted={sortBy === "sortOrder"}
                reversed={reverseSortDirection}
              >
                Order
              </Th>
              <Table.Th>Description</Table.Th>
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
                    No assets found
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

      <AssetFormModal
        onClose={() => setAssetModalOpened(false)}
        onSuccess={() => {
          loadAssets();
          setAssetModalOpened(false);
        }}
        opened={assetModalOpened}
      />

      {/* Asset Preview Modal */}
      <Modal
        onClose={() => {
          setPreviewModalOpened(false);
          setPreviewAsset(null);
        }}
        opened={previewModalOpened}
        size="lg"
        title={previewAsset?.filename}
      >
        {previewAsset && (
          <Stack>
            {previewAsset.type === "IMAGE" && (
              <Image
                alt={previewAsset.alt || previewAsset.filename}
                fit="contain"
                mah={400}
                src={previewAsset.url}
              />
            )}
            <Group>
              <Badge leftSection={getAssetIcon(previewAsset.type)}>
                {previewAsset.type}
              </Badge>
              <Text c="dimmed" size="sm">
                {formatFileSize(previewAsset.size)}
              </Text>
            </Group>
            {previewAsset.description && (
              <Text size="sm">{previewAsset.description}</Text>
            )}
            <Button
              href={previewAsset.url}
              component="a"
              target="_blank"
              variant="light"
            >
              Open Original
            </Button>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
