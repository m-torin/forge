'use client';

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Checkbox,
  Group,
  Image,
  Loader,
  Menu,
  Modal,
  Pagination,
  rem,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconDots,
  IconDownload,
  IconEdit,
  IconEye,
  IconFile,
  IconFileText,
  IconPhoto,
  IconShare,
  IconStar,
  IconTrash,
  IconVideo,
} from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';

import { deleteAsset, getAssetsByProduct, updateAssetMetadata } from '../actions';

import { ProductAssetEditor } from './ProductAssetEditor';

import type { AssetType, ProductAsset } from '@repo/database/prisma';

interface ProductAssetWithProduct extends ProductAsset {
  product: {
    id: string;
    name: string;
    sku: string;
  };
}

interface ProductAssetGridProps {
  assetType?: AssetType | null;
  onSelectionChange?: (selectedAssets: string[]) => void;
  searchQuery?: string;
  selectedProducts?: string[];
  viewMode?: 'grid' | 'list';
}

interface AssetCardProps {
  asset: ProductAssetWithProduct;
  onDelete: (id: string) => void;
  onEdit: (asset: ProductAssetWithProduct) => void;
  onPreview: (asset: ProductAssetWithProduct) => void;
  onSelect: (selected: boolean) => void;
  selected: boolean;
}

function AssetCard({ asset, onDelete, onEdit, onPreview, onSelect, selected }: AssetCardProps) {
  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case 'IMAGE':
        return <IconPhoto size={16} />;
      case 'VIDEO':
        return <IconVideo size={16} />;
      case 'DOCUMENT':
      case 'MANUAL':
      case 'SPECIFICATION':
      case 'CERTIFICATE':
        return <IconFileText size={16} />;
      default:
        return <IconFile size={16} />;
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card pos="relative" withBorder p="sm">
      <Stack gap="xs">
        {/* Selection checkbox */}
        <Checkbox
          onChange={(e) => onSelect(e.currentTarget.checked)}
          style={{ left: 8, position: 'absolute', top: 8, zIndex: 10 }}
          checked={selected}
        />

        {/* Asset preview */}
        <Box pos="relative">
          {asset.type === 'IMAGE' ? (
            <Image
              onClick={() => onPreview(asset)}
              style={{ cursor: 'pointer' }}
              alt={asset.alt || asset.filename}
              fit="cover"
              height={120}
              radius="sm"
              src={asset.url}
            />
          ) : (
            <Center
              onClick={() => onPreview(asset)}
              style={{ borderRadius: rem(4), cursor: 'pointer' }}
              bg="gray.1"
              h={120}
            >
              {getAssetIcon(asset.type)}
            </Center>
          )}

          {/* Asset type badge */}
          <Badge style={{ position: 'absolute', right: 4, top: 4 }} size="xs" variant="filled">
            {asset.type}
          </Badge>
        </Box>

        {/* Asset info */}
        <Stack gap={2}>
          <Text fw={500} lineClamp={1} size="sm">
            {asset.filename}
          </Text>
          <Text c="dimmed" lineClamp={1} size="xs">
            {asset.product.name}
          </Text>
          <Group justify="space-between">
            <Text c="dimmed" size="xs">
              {formatFileSize(asset.size)}
            </Text>
            <Group gap={4}>
              <ActionIcon onClick={() => onPreview(asset)} size="sm" variant="subtle">
                <IconEye size={14} />
              </ActionIcon>
              <ActionIcon onClick={() => onEdit(asset)} size="sm" variant="subtle">
                <IconEdit size={14} />
              </ActionIcon>
              <Menu withinPortal>
                <Menu.Target>
                  <ActionIcon size="sm" variant="subtle">
                    <IconDots size={14} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item leftSection={<IconDownload size={14} />}>Download</Menu.Item>
                  <Menu.Item leftSection={<IconShare size={14} />}>Share</Menu.Item>
                  <Menu.Item leftSection={<IconStar size={14} />}>Mark as Featured</Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => onDelete(asset.id)}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Stack>
      </Stack>
    </Card>
  );
}

function AssetListRow({ asset, onDelete, onEdit, onPreview, onSelect, selected }: AssetCardProps) {
  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case 'IMAGE':
        return <IconPhoto size={16} />;
      case 'VIDEO':
        return <IconVideo size={16} />;
      case 'DOCUMENT':
      case 'MANUAL':
      case 'SPECIFICATION':
      case 'CERTIFICATE':
        return <IconFileText size={16} />;
      default:
        return <IconFile size={16} />;
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Table.Tr bg={selected ? 'blue.0' : undefined}>
      <Table.Td>
        <Checkbox onChange={(e) => onSelect(e.currentTarget.checked)} checked={selected} />
      </Table.Td>
      <Table.Td>
        <Group gap="sm">
          {asset.type === 'IMAGE' ? (
            <Image
              width={40}
              alt={asset.alt || asset.filename}
              fit="cover"
              height={40}
              radius="sm"
              src={asset.url}
            />
          ) : (
            <Center style={{ borderRadius: rem(4) }} bg="gray.1" h={40} w={40}>
              {getAssetIcon(asset.type)}
            </Center>
          )}
          <div>
            <Text fw={500} size="sm">
              {asset.filename}
            </Text>
            <Text c="dimmed" size="xs">
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
        <Text maw={200} size="sm" truncate>
          {asset.description || '-'}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap={4} justify="flex-end">
          <ActionIcon onClick={() => onPreview(asset)} size="sm" variant="subtle">
            <IconEye size={14} />
          </ActionIcon>
          <ActionIcon onClick={() => onEdit(asset)} size="sm" variant="subtle">
            <IconEdit size={14} />
          </ActionIcon>
          <Menu withinPortal>
            <Menu.Target>
              <ActionIcon size="sm" variant="subtle">
                <IconDots size={14} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconDownload size={14} />}>Download</Menu.Item>
              <Menu.Item leftSection={<IconShare size={14} />}>Share</Menu.Item>
              <Menu.Item leftSection={<IconStar size={14} />}>Mark as Featured</Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => onDelete(asset.id)}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

export function ProductAssetGrid({
  assetType,
  onSelectionChange,
  searchQuery = '',
  selectedProducts = [],
  viewMode = 'grid',
}: ProductAssetGridProps) {
  const [assets, setAssets] = useState<ProductAssetWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingAsset, setEditingAsset] = useState<ProductAssetWithProduct | null>(null);
  const [previewAsset, setPreviewAsset] = useState<ProductAssetWithProduct | null>(null);
  const [editOpened, { close: closeEdit, open: openEdit }] = useDisclosure();
  const [previewOpened, { close: closePreview, open: openPreview }] = useDisclosure();

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAssetsByProduct({
        type: assetType || undefined,
        limit: 20,
        page,
        productIds: selectedProducts.length > 0 ? selectedProducts : undefined,
        search: searchQuery || undefined,
      });

      if (result.success && result.data) {
        setAssets(result.data);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
        }
      } else {
        notifications.show({
          color: 'red',
          message: result.error || 'Failed to load assets',
          title: 'Error',
        });
      }
    } catch (error) {
      notifications.show({
        color: 'red',
        message: 'Failed to load assets',
        title: 'Error',
      });
    } finally {
      setLoading(false);
    }
  }, [assetType, searchQuery, selectedProducts, page]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedAssets);
    }
  }, [selectedAssets, onSelectionChange]);

  const handleAssetSelect = (assetId: string, selected: boolean) => {
    if (selected) {
      setSelectedAssets((prev) => [...prev, assetId]);
    } else {
      setSelectedAssets((prev) => prev.filter((id) => id !== assetId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedAssets(assets.map((asset) => asset.id));
    } else {
      setSelectedAssets([]);
    }
  };

  const handleEdit = (asset: ProductAssetWithProduct) => {
    setEditingAsset(asset);
    openEdit();
  };

  const handlePreview = (asset: ProductAssetWithProduct) => {
    setPreviewAsset(asset);
    openPreview();
  };

  const handleDelete = (id: string) => {
    modals.openConfirmModal({
      children: (
        <Text size="sm">
          Are you sure you want to delete this asset? This action cannot be undone.
        </Text>
      ),
      confirmProps: { color: 'red' },
      labels: { cancel: 'Cancel', confirm: 'Delete' },
      onConfirm: async () => {
        const result = await deleteAsset(id);
        if (result.success) {
          notifications.show({
            color: 'green',
            message: 'Asset deleted successfully',
            title: 'Success',
          });
          loadAssets();
          setSelectedAssets((prev) => prev.filter((assetId) => assetId !== id));
        } else {
          notifications.show({
            color: 'red',
            message: result.error || 'Failed to delete asset',
            title: 'Error',
          });
        }
      },
      title: 'Delete Asset',
    });
  };

  const handleSaveAsset = async (updatedAsset: Partial<ProductAsset>) => {
    if (!editingAsset) return;

    const result = await updateAssetMetadata(editingAsset.id, updatedAsset);
    if (result.success) {
      notifications.show({
        color: 'green',
        message: 'Asset updated successfully',
        title: 'Success',
      });
      loadAssets();
      closeEdit();
    } else {
      notifications.show({
        color: 'red',
        message: result.error || 'Failed to update asset',
        title: 'Error',
      });
    }
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (viewMode === 'grid') {
    return (
      <Stack gap="md">
        {assets.length > 0 && (
          <Group justify="space-between">
            <Group>
              <Checkbox
                onChange={(e) => handleSelectAll(e.currentTarget.checked)}
                checked={selectedAssets.length === assets.length && assets.length > 0}
                indeterminate={selectedAssets.length > 0 && selectedAssets.length < assets.length}
                label={`${selectedAssets.length} of ${assets.length} selected`}
              />
            </Group>
            <Text c="dimmed" size="sm">
              {assets.length} assets
            </Text>
          </Group>
        )}

        <SimpleGrid cols={{ base: 1, lg: 4, md: 3, sm: 2, xl: 5 }} spacing="md">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onPreview={handlePreview}
              onSelect={(selected) => handleAssetSelect(asset.id, selected)}
              asset={asset}
              selected={selectedAssets.includes(asset.id)}
            />
          ))}
        </SimpleGrid>

        {assets.length === 0 && (
          <Center py="xl">
            <Stack align="center" gap="md">
              <IconPhoto color="gray" size={48} />
              <div style={{ textAlign: 'center' }}>
                <Text fw={500}>No assets found</Text>
                <Text c="dimmed" size="sm">
                  Try adjusting your filters or upload some assets
                </Text>
              </div>
            </Stack>
          </Center>
        )}

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

        {/* Edit Modal */}
        <Modal onClose={closeEdit} opened={editOpened} size="lg" title="Edit Asset">
          {editingAsset && (
            <ProductAssetEditor
              onCancel={closeEdit}
              onSave={handleSaveAsset}
              asset={editingAsset}
            />
          )}
        </Modal>

        {/* Preview Modal */}
        <Modal
          onClose={closePreview}
          opened={previewOpened}
          size="xl"
          title={previewAsset?.filename}
        >
          {previewAsset && (
            <Stack gap="md">
              {previewAsset.type === 'IMAGE' ? (
                <Image
                  alt={previewAsset.alt || previewAsset.filename}
                  fit="contain"
                  mah={500}
                  src={previewAsset.url}
                />
              ) : (
                <Center style={{ borderRadius: rem(8) }} bg="gray.1" h={200}>
                  <Stack align="center" gap="sm">
                    {previewAsset.type === 'VIDEO' && <IconVideo size={48} />}
                    {(previewAsset.type === 'DOCUMENT' ||
                      previewAsset.type === 'MANUAL' ||
                      previewAsset.type === 'SPECIFICATION' ||
                      previewAsset.type === 'CERTIFICATE') && <IconFileText size={48} />}
                    {previewAsset.type === 'OTHER' && <IconFile size={48} />}
                    <Text c="dimmed" size="sm">
                      Preview not available for this file type
                    </Text>
                  </Stack>
                </Center>
              )}

              <Card withBorder>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text fw={500}>Asset Details</Text>
                    <Badge>{previewAsset.type}</Badge>
                  </Group>
                  <Text size="sm">
                    <strong>Product:</strong> {previewAsset.product.name}
                  </Text>
                  {previewAsset.description && (
                    <Text size="sm">
                      <strong>Description:</strong> {previewAsset.description}
                    </Text>
                  )}
                  {previewAsset.alt && (
                    <Text size="sm">
                      <strong>Alt Text:</strong> {previewAsset.alt}
                    </Text>
                  )}
                </Stack>
              </Card>

              <Group justify="flex-end">
                <Button
                  href={previewAsset.url}
                  component="a"
                  leftSection={<IconDownload size={16} />}
                  target="_blank"
                  variant="light"
                >
                  Download
                </Button>
                <Button onClick={() => handleEdit(previewAsset)}>Edit Asset</Button>
              </Group>
            </Stack>
          )}
        </Modal>
      </Stack>
    );
  }

  // List view
  return (
    <Stack gap="md">
      <ScrollArea>
        <Table highlightOnHover striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: rem(40) }}>
                <Checkbox
                  onChange={(e) => handleSelectAll(e.currentTarget.checked)}
                  checked={selectedAssets.length === assets.length && assets.length > 0}
                  indeterminate={selectedAssets.length > 0 && selectedAssets.length < assets.length}
                />
              </Table.Th>
              <Table.Th>Asset</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Size</Table.Th>
              <Table.Th>Order</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {assets.map((asset) => (
              <AssetListRow
                key={asset.id}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onPreview={handlePreview}
                onSelect={(selected) => handleAssetSelect(asset.id, selected)}
                asset={asset}
                selected={selectedAssets.includes(asset.id)}
              />
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {assets.length === 0 && (
        <Center py="xl">
          <Stack align="center" gap="md">
            <IconPhoto color="gray" size={48} />
            <div style={{ textAlign: 'center' }}>
              <Text fw={500}>No assets found</Text>
              <Text c="dimmed" size="sm">
                Try adjusting your filters or upload some assets
              </Text>
            </div>
          </Stack>
        </Center>
      )}

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
    </Stack>
  );
}
