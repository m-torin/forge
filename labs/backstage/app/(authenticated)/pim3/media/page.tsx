'use client';

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Group,
  Image,
  LoadingOverlay,
  Menu,
  Modal,
  MultiSelect,
  Pagination,
  Progress,
  rem,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE, PDF_MIME_TYPE } from '@mantine/dropzone';
import { useForm } from '@mantine/form';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconClearAll,
  IconCloudUpload,
  IconDotsVertical,
  IconEdit,
  IconExternalLink,
  IconEye,
  IconFile,
  IconFileText,
  IconFolder,
  IconMovie,
  IconMusic,
  IconPhoto,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';

import { formatDate, formatFileSize } from '@/utils/pim3/pim-helpers';
import { SignedImage } from '@/components/pim3/SignedImage';

import {
  bulkDeleteMedia,
  deleteMedia,
  getMedia,
  getMediaStats,
  type MediaEntityType,
  type MediaFilter,
  type MediaSort,
  type MediaWithRelations,
  updateMedia,
  uploadMediaWithStorage,
} from '@/actions/pim3/media/actions';
import { MediaType } from '@repo/database/prisma';

interface MediaFormData {
  altText: string;
  articleId?: string;
  brandId?: string;
  categoryId?: string;
  collectionId?: string;
  description: string;
  productId?: string;
  reviewId?: string;
  taxonomyId?: string;
  type: MediaType;
  url: string;
}

interface MediaStats {
  byEntityType: Record<MediaEntityType, number>;
  byType: Record<MediaType, number>;
  recentUploads: number;
  total: number;
}

const MEDIA_TYPES: { label: string; value: MediaType; icon: React.ReactNode; color: string }[] = [
  { color: 'blue', icon: <IconPhoto size={16} />, label: 'Image', value: MediaType.IMAGE },
  { color: 'red', icon: <IconMovie size={16} />, label: 'Video', value: MediaType.VIDEO },
  {
    color: 'green',
    icon: <IconFileText size={16} />,
    label: 'Document',
    value: MediaType.DOCUMENT,
  },
  { color: 'yellow', icon: <IconMusic size={16} />, label: 'Audio', value: MediaType.AUDIO },
];

const ENTITY_TYPES: { label: string; value: MediaEntityType; color: string }[] = [
  { color: 'blue', label: 'Product', value: 'PRODUCT' },
  { color: 'purple', label: 'Brand', value: 'BRAND' },
  { color: 'green', label: 'Category', value: 'CATEGORY' },
  { color: 'orange', label: 'Collection', value: 'COLLECTION' },
  { color: 'cyan', label: 'Article', value: 'ARTICLE' },
  { color: 'pink', label: 'Taxonomy', value: 'TAXONOMY' },
  { color: 'yellow', label: 'Review', value: 'REVIEW' },
  { color: 'gray', label: 'User Upload', value: 'USER' },
  { color: 'dark', label: 'Unassigned', value: 'UNASSIGNED' },
];

const ACCEPTED_FILE_TYPES = {
  ...IMAGE_MIME_TYPE,
  ...PDF_MIME_TYPE,
  'video/*': [],
  'application/msword': [],
  'application/vnd.ms-excel': [],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
  'audio/*': [],
  'text/csv': [],
  'text/plain': [],
};

function MediaUploadDropzone({
  isUploading,
  onUpload,
}: {
  onUpload: (files: File[]) => void;
  isUploading: boolean;
}) {
  return (
    <Dropzone
      loading={isUploading}
      onDrop={onUpload}
      onReject={(files) => {
        notifications.show({
          color: 'red',
          message: `Some files were rejected: ${files.map((f) => f.file.name).join(', ')}`,
          title: 'Upload failed',
        });
      }}
      accept={ACCEPTED_FILE_TYPES}
      maxSize={50 * 1024 * 1024} // 50MB
    >
      <Group style={{ pointerEvents: 'none' }} gap="xl" justify="center" mih={220}>
        <Dropzone.Accept>
          <IconUpload
            stroke={1.5}
            style={{
              width: rem(52),
              color: 'var(--mantine-color-blue-6)',
              height: rem(52),
            }}
          />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX
            stroke={1.5}
            style={{
              width: rem(52),
              color: 'var(--mantine-color-red-6)',
              height: rem(52),
            }}
          />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconCloudUpload
            stroke={1.5}
            style={{
              width: rem(52),
              color: 'var(--mantine-color-dimmed)',
              height: rem(52),
            }}
          />
        </Dropzone.Idle>

        <div>
          <Text inline size="xl">
            Drag files here or click to select
          </Text>
          <Text c="dimmed" inline mt={7} size="sm">
            Upload images, videos, documents, and audio files (max 50MB each)
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}

function MediaCard({
  media,
  onDelete,
  onEdit,
  onPreview,
  onSelect,
  selected,
}: {
  media: MediaWithRelations;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
}) {
  const typeInfo = MEDIA_TYPES.find((t) => t.value === media.type);
  const entityInfo = ENTITY_TYPES.find((e) => e.value === media.entityType);

  return (
    <Card
      onClick={() => onSelect(!selected)}
      withBorder
      style={{
        border: selected ? '2px solid var(--mantine-color-blue-5)' : undefined,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      p="sm"
    >
      <Stack gap="xs">
        {/* Header with checkbox and actions */}
        <Group justify="space-between">
          <Checkbox
            onChange={(e) => {
              e.stopPropagation();
              onSelect(e.currentTarget.checked);
            }}
            onClick={(e) => e.stopPropagation()}
            checked={selected}
          />
          <Group gap="xs">
            <ActionIcon
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
              size="sm"
              variant="subtle"
            >
              <IconEye size={14} />
            </ActionIcon>
            <Menu position="bottom-end">
              <Menu.Target>
                <ActionIcon onClick={(e) => e.stopPropagation()} size="sm" variant="subtle">
                  <IconDotsVertical size={14} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconEdit size={16} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  Edit
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconEye size={16} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview();
                  }}
                >
                  Preview
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        {/* Media preview */}
        <Box
          style={{
            alignItems: 'center',
            backgroundColor: 'var(--mantine-color-gray-1)',
            borderRadius: 'var(--mantine-radius-sm)',
            display: 'flex',
            height: 120,
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {media.type === MediaType.IMAGE ? (
            <SignedImage
              storageKey={(media as any).storageKey}
              fallbackUrl={media.url}
              context="product"
              alt={media.altText || 'Media'}
              fit="cover"
              h="100%"
              w="100%"
            />
          ) : (
            <ThemeIcon color={typeInfo?.color} size="xl" variant="light">
              {typeInfo?.icon}
            </ThemeIcon>
          )}
        </Box>

        {/* Media info */}
        <Stack gap={4}>
          <Text fw={500} lineClamp={1} size="sm">
            {media.altText || 'Untitled'}
          </Text>

          <Group gap="xs" wrap="wrap">
            <Badge color={typeInfo?.color} size="xs" variant="light">
              {typeInfo?.label}
            </Badge>
            {media.entityType !== 'UNASSIGNED' && (
              <Badge color={entityInfo?.color} size="xs" variant="outline">
                {entityInfo?.label}
              </Badge>
            )}
            {media.folder && media.folder !== 'General' && (
              <Badge color="gray" size="xs" variant="dot">
                {media.folder}
              </Badge>
            )}
          </Group>

          {media.entityLabel && (
            <Text c="dimmed" lineClamp={1} size="xs">
              {media.entityLabel}
            </Text>
          )}

          <Group justify="space-between">
            <Text c="dimmed" size="xs">
              {media.size ? formatFileSize(media.size) : '—'}
            </Text>
            <Text c="dimmed" size="xs">
              {formatDate(media.createdAt)}
            </Text>
          </Group>
        </Stack>
      </Stack>
    </Card>
  );
}

function MediaStatsCard({ stats }: { stats: MediaStats }) {
  const totalFiles = stats.total;
  const imagePercentage =
    totalFiles > 0 ? ((stats.byType[MediaType.IMAGE] || 0) / totalFiles) * 100 : 0;
  const videoPercentage =
    totalFiles > 0 ? ((stats.byType[MediaType.VIDEO] || 0) / totalFiles) * 100 : 0;
  const documentPercentage =
    totalFiles > 0 ? ((stats.byType[MediaType.DOCUMENT] || 0) / totalFiles) * 100 : 0;
  const audioPercentage =
    totalFiles > 0 ? ((stats.byType[MediaType.AUDIO] || 0) / totalFiles) * 100 : 0;

  return (
    <Card withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={4}>Media Library Stats</Title>
          <Text c="dimmed" size="sm">
            {stats.recentUploads} uploaded this week
          </Text>
        </Group>

        <SimpleGrid cols={2} spacing="md">
          <div>
            <Text fw={500} mb="xs" size="sm">
              Total Files
            </Text>
            <Text c="blue" fw={700} size="xl">
              {totalFiles.toLocaleString()}
            </Text>
          </div>

          <div>
            <Text fw={500} mb="xs" size="sm">
              File Types
            </Text>
            <Stack gap={4}>
              {MEDIA_TYPES.map((type) => {
                const count = stats.byType[type.value] || 0;
                const percentage = totalFiles > 0 ? (count / totalFiles) * 100 : 0;
                return (
                  <Group key={type.value} gap="xs" justify="space-between">
                    <Group gap={4}>
                      {type.icon}
                      <Text size="xs">{type.label}</Text>
                    </Group>
                    <Text c="dimmed" size="xs">
                      {count} ({percentage.toFixed(1)}%)
                    </Text>
                  </Group>
                );
              })}
            </Stack>
          </div>
        </SimpleGrid>

        <div>
          <Text fw={500} mb="xs" size="sm">
            By Entity Type
          </Text>
          <Stack gap={4}>
            {ENTITY_TYPES.map((entity) => {
              const count = stats.byEntityType[entity.value] || 0;
              if (count === 0) return null;
              return (
                <Group key={entity.value} justify="space-between">
                  <Badge color={entity.color} size="xs" variant="light">
                    {entity.label}
                  </Badge>
                  <Text size="xs">{count}</Text>
                </Group>
              );
            })}
          </Stack>
        </div>
      </Stack>
    </Card>
  );
}

export default function MediaPage(): React.ReactElement | null {
  const [media, setMedia] = useState<MediaWithRelations[]>([]);
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);

  // Filter state
  const [filter, setFilter] = useState<MediaFilter>({});
  const [sort, setSort] = useState<MediaSort>({ direction: 'desc', field: 'createdAt' });
  const [debouncedSearch] = useDebouncedValue(filter.search || '', 300);

  // Modal states
  const [uploadOpened, { close: closeUpload, open: openUpload }] = useDisclosure(false);
  const [editOpened, { close: closeEdit, open: openEdit }] = useDisclosure(false);
  const [previewOpened, { close: closePreview, open: openPreview }] = useDisclosure(false);
  const [bulkOpened, { close: closeBulk, open: openBulk }] = useDisclosure(false);

  // Form states
  const [selectedMedia, setSelectedMedia] = useState<MediaWithRelations | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const form = useForm<MediaFormData>({
    validate: {
      url: (value) => (!value ? 'URL is required' : null),
    },
    initialValues: {
      type: MediaType.IMAGE,
      url: '',
      altText: '',
      description: '',
    },
  });

  const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      const debouncedFilter = { ...filter, search: debouncedSearch };
      const result = await getMedia(debouncedFilter, sort, page, 24);
      setMedia(result.media);
      setTotal(result.total);
      setHasMore(result.hasMore);
      setFolders(result.folders);
    } catch (err) {
      notifications.show({
        color: 'red',
        message: 'Failed to load media',
        title: 'Error',
      });
    } finally {
      setLoading(false);
    }
  }, [filter, debouncedSearch, sort, page]);

  const loadStats = useCallback(async () => {
    try {
      const statsData = await getMediaStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    const errors: string[] = [];

    try {
      for (const file of files) {
        try {
          const mediaType = file.type.startsWith('image/')
            ? MediaType.IMAGE
            : file.type.startsWith('video/')
              ? MediaType.VIDEO
              : file.type.startsWith('audio/')
                ? MediaType.AUDIO
                : MediaType.DOCUMENT;

          // Upload file to storage and create media record
          const uploadResult = await uploadMediaWithStorage({
            file,
            type: mediaType,
            altText: file.name,
            entityType: filter.entityType?.[0],
            entityId: (filter as any).entityId,
          });

          if (!uploadResult.success) {
            throw new Error(uploadResult.error);
          }

          setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
        } catch (err) {
          errors.push(file.name);
          console.error(`Failed to upload ${file.name}:`, err);
        }
      }

      if (errors.length === 0) {
        notifications.show({
          color: 'green',
          message: `Uploaded ${files.length} file(s) successfully`,
          title: 'Success',
        });
      } else {
        notifications.show({
          color: 'yellow',
          message: `Uploaded ${files.length - errors.length}/${files.length} files. Failed: ${errors.join(', ')}`,
          title: 'Partial success',
        });
      }

      await loadMedia();
      await loadStats();
      closeUpload();
    } catch (err) {
      notifications.show({
        color: 'red',
        message: 'Failed to upload files',
        title: 'Upload failed',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleEdit = (mediaItem: MediaWithRelations) => {
    setSelectedMedia(mediaItem);
    form.setValues({
      type: mediaItem.type,
      url: mediaItem.url,
      altText: mediaItem.altText || '',
      articleId: mediaItem.article?.id,
      brandId: mediaItem.brand?.id,
      categoryId: mediaItem.category?.id,
      collectionId: mediaItem.collection?.id,
      description: '',
      productId: mediaItem.product?.id,
      reviewId: mediaItem.review?.id,
      taxonomyId: mediaItem.taxonomy?.id,
    });
    openEdit();
  };

  const handleSubmit = async (values: MediaFormData) => {
    if (!selectedMedia) return;

    setIsSaving(true);
    try {
      await updateMedia(selectedMedia.id, {
        type: values.type,
        url: values.url,
        altText: values.altText,
        articleId: values.articleId || undefined,
        brandId: values.brandId || undefined,
        categoryId: values.categoryId || undefined,
        collectionId: values.collectionId || undefined,
        productId: values.productId || undefined,
        reviewId: values.reviewId || undefined,
        taxonomyId: values.taxonomyId || undefined,
      });

      notifications.show({
        color: 'green',
        message: 'Media updated successfully',
        title: 'Success',
      });

      await loadMedia();
      closeEdit();
    } catch (err) {
      notifications.show({
        color: 'red',
        message: 'Failed to update media',
        title: 'Error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMedia(id);
      notifications.show({
        color: 'green',
        message: 'Media deleted successfully',
        title: 'Success',
      });
      await loadMedia();
      await loadStats();
    } catch (err) {
      notifications.show({
        color: 'red',
        message: 'Failed to delete media',
        title: 'Error',
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteMedia(Array.from(selectedItems));
      notifications.show({
        color: 'green',
        message: `Deleted ${selectedItems.size} media files`,
        title: 'Success',
      });
      setSelectedItems(new Set());
      await loadMedia();
      await loadStats();
    } catch (err) {
      notifications.show({
        color: 'red',
        message: 'Failed to delete media files',
        title: 'Error',
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.size === media.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(media.map((m) => m.id)));
    }
  };

  const handlePreview = (mediaItem: MediaWithRelations) => {
    setSelectedMedia(mediaItem);
    openPreview();
  };

  return (
    <Stack gap="md">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Title order={2}>Media Library</Title>
          <Text c="dimmed">Manage your media files and associations</Text>
        </div>
        <Group>
          <Button leftSection={<IconUpload size={18} />} onClick={openUpload}>
            Upload Media
          </Button>
          {selectedItems.size > 0 && (
            <Button color="red" leftSection={<IconTrash size={18} />} onClick={handleBulkDelete}>
              Delete ({selectedItems.size})
            </Button>
          )}
        </Group>
      </Group>

      {/* Stats */}
      {stats && <MediaStatsCard stats={stats} />}

      {/* Filters */}
      <Card withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={4}>Filters</Title>
            <Group>
              <Button
                leftSection={<IconClearAll size={16} />}
                onClick={() => {
                  setFilter({});
                  setPage(1);
                }}
                size="sm"
                variant="subtle"
              >
                Clear
              </Button>
              <Button
                leftSection={<IconRefresh size={16} />}
                loading={loading}
                onClick={loadMedia}
                size="sm"
                variant="subtle"
              >
                Refresh
              </Button>
            </Group>
          </Group>

          <SimpleGrid cols={{ base: 1, lg: 5, sm: 2 }} spacing="md">
            <TextInput
              leftSection={<IconSearch size={16} />}
              onChange={(e) => {
                setFilter((prev) => ({ ...prev, search: e.currentTarget.value }));
                setPage(1);
              }}
              placeholder="Search media..."
              value={filter.search || ''}
            />

            <MultiSelect
              onChange={(value) => {
                setFilter((prev) => ({ ...prev, type: value as MediaType[] }));
                setPage(1);
              }}
              placeholder="Filter by type"
              data={MEDIA_TYPES.map((t) => ({ label: t.label, value: t.value }))}
              value={filter.type || []}
            />

            <MultiSelect
              onChange={(value) => {
                setFilter((prev) => ({ ...prev, entityType: value as MediaEntityType[] }));
                setPage(1);
              }}
              placeholder="Filter by entity"
              data={ENTITY_TYPES.map((e) => ({ label: e.label, value: e.value }))}
              value={filter.entityType || []}
            />

            <Select
              leftSection={<IconFolder size={16} />}
              onChange={(value) => {
                setFilter((prev) => ({ ...prev, folder: value || undefined }));
                setPage(1);
              }}
              placeholder="Filter by folder"
              clearable
              data={folders.map((f) => ({ label: f, value: f }))}
              value={filter.folder || ''}
            />

            <Select
              onChange={(value) => {
                if (value) {
                  const [field, direction] = value.split('-') as [
                    MediaSort['field'],
                    MediaSort['direction'],
                  ];
                  setSort({ direction, field });
                  setPage(1);
                }
              }}
              placeholder="Sort by"
              data={[
                { label: 'Newest first', value: 'createdAt-desc' },
                { label: 'Oldest first', value: 'createdAt-asc' },
                { label: 'Name A-Z', value: 'altText-asc' },
                { label: 'Name Z-A', value: 'altText-desc' },
                { label: 'Largest first', value: 'size-desc' },
                { label: 'Smallest first', value: 'size-asc' },
              ]}
              value={`${sort.field}-${sort.direction}`}
            />
          </SimpleGrid>
        </Stack>
      </Card>

      {/* View controls */}
      <Group justify="space-between">
        <Group>
          <SegmentedControl
            onChange={(value) => setViewMode(value as 'grid' | 'list')}
            data={[
              { label: 'Grid', value: 'grid' },
              { label: 'List', value: 'list' },
            ]}
            size="sm"
            value={viewMode}
          />

          {media.length > 0 && (
            <Text c="dimmed" size="sm">
              {(page - 1) * 24 + 1}-{Math.min(page * 24, total)} of {total} items
              {selectedItems.size > 0 && ` • ${selectedItems.size} selected`}
            </Text>
          )}
        </Group>

        {media.length > 0 && (
          <Group>
            <Checkbox
              onChange={handleSelectAll}
              checked={selectedItems.size === media.length && media.length > 0}
              indeterminate={selectedItems.size > 0 && selectedItems.size < media.length}
              label="Select all"
            />
          </Group>
        )}
      </Group>

      {/* Media Grid/List */}
      <Card withBorder p={0}>
        <LoadingOverlay visible={loading} />

        {media.length === 0 && !loading ? (
          <Stack align="center" py="xl">
            <ThemeIcon color="gray" size="xl" variant="light">
              <IconPhoto size={30} />
            </ThemeIcon>
            <Text fw={500} ta="center">
              No media files found
            </Text>
            <Text c="dimmed" ta="center">
              Upload some files to get started
            </Text>
            <Button leftSection={<IconUpload size={18} />} onClick={openUpload}>
              Upload Media
            </Button>
          </Stack>
        ) : viewMode === 'grid' ? (
          <SimpleGrid cols={{ base: 2, lg: 6, md: 4, sm: 3 }} p="md" spacing="md">
            {media.map((item) => (
              <MediaCard
                key={item.id}
                onDelete={() => handleDelete(item.id)}
                onEdit={() => handleEdit(item)}
                onPreview={() => handlePreview(item)}
                onSelect={(checked) => {
                  const newSelected = new Set(selectedItems);
                  if (checked) {
                    newSelected.add(item.id);
                  } else {
                    newSelected.delete(item.id);
                  }
                  setSelectedItems(newSelected);
                }}
                media={item}
                selected={selectedItems.has(item.id)}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={40}>
                  <Checkbox
                    onChange={handleSelectAll}
                    checked={selectedItems.size === media.length && media.length > 0}
                    indeterminate={selectedItems.size > 0 && selectedItems.size < media.length}
                  />
                </Table.Th>
                <Table.Th>Media</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Entity</Table.Th>
                <Table.Th>Size</Table.Th>
                <Table.Th>Created</Table.Th>
                <Table.Th w={100}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {media.map((item) => {
                const typeInfo = MEDIA_TYPES.find((t) => t.value === item.type);
                const entityInfo = ENTITY_TYPES.find((e) => e.value === item.entityType);

                return (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      <Checkbox
                        onChange={(e) => {
                          const newSelected = new Set(selectedItems);
                          if (e.currentTarget.checked) {
                            newSelected.add(item.id);
                          } else {
                            newSelected.delete(item.id);
                          }
                          setSelectedItems(newSelected);
                        }}
                        checked={selectedItems.has(item.id)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Group gap="sm">
                        <Box
                          style={{
                            width: 40,
                            alignItems: 'center',
                            backgroundColor: 'var(--mantine-color-gray-1)',
                            borderRadius: 'var(--mantine-radius-sm)',
                            display: 'flex',
                            height: 40,
                            justifyContent: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          {item.type === MediaType.IMAGE ? (
                            <SignedImage
                              storageKey={(item as any).storageKey}
                              fallbackUrl={item.url}
                              context="product"
                              alt={item.altText || 'Media'}
                              fit="cover"
                              h="100%"
                              w="100%"
                            />
                          ) : (
                            <ThemeIcon color={typeInfo?.color} size="sm" variant="light">
                              {typeInfo?.icon}
                            </ThemeIcon>
                          )}
                        </Box>
                        <div>
                          <Text fw={500} lineClamp={1}>
                            {item.altText || 'Untitled'}
                          </Text>
                          <Text c="dimmed" lineClamp={1} size="xs">
                            {item.url}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={typeInfo?.color} variant="light">
                        {typeInfo?.label}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {item.entityType !== 'UNASSIGNED' ? (
                        <div>
                          <Badge color={entityInfo?.color} size="sm" variant="outline">
                            {entityInfo?.label}
                          </Badge>
                          {item.entityLabel && (
                            <Text c="dimmed" mt={2} size="xs">
                              {item.entityLabel}
                            </Text>
                          )}
                        </div>
                      ) : (
                        <Text c="dimmed" size="sm">
                          —
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{item.size ? formatFileSize(item.size) : '—'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{formatDate(item.createdAt)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon onClick={() => handlePreview(item)} size="sm" variant="subtle">
                          <IconEye size={14} />
                        </ActionIcon>
                        <ActionIcon onClick={() => handleEdit(item)} size="sm" variant="subtle">
                          <IconEdit size={14} />
                        </ActionIcon>
                        <ActionIcon
                          color="red"
                          onClick={() => handleDelete(item.id)}
                          size="sm"
                          variant="subtle"
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      {/* Pagination */}
      {total > 24 && (
        <Group justify="center">
          <Pagination onChange={setPage} total={Math.ceil(total / 24)} size="sm" value={page} />
        </Group>
      )}

      {/* Upload Modal */}
      <Modal onClose={closeUpload} opened={uploadOpened} size="lg" title="Upload Media Files">
        <MediaUploadDropzone isUploading={isUploading} onUpload={handleUpload} />

        {Object.keys(uploadProgress).length > 0 && (
          <Stack gap="xs" mt="md">
            {Object.entries(uploadProgress).map(([filename, progress]) => (
              <div key={filename}>
                <Group justify="space-between" mb={4}>
                  <Text size="sm">{filename}</Text>
                  <Text size="sm">{progress}%</Text>
                </Group>
                <Progress size="sm" value={progress} />
              </div>
            ))}
          </Stack>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal onClose={closeEdit} opened={editOpened} size="lg" title="Edit Media">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <LoadingOverlay visible={isSaving} />

          <Stack gap="md">
            <TextInput
              placeholder="Descriptive text for accessibility"
              label="Alt Text"
              {...form.getInputProps('altText')}
            />

            <Select
              data={MEDIA_TYPES.map((t) => ({ label: t.label, value: t.value }))}
              label="Type"
              {...form.getInputProps('type')}
            />

            <TextInput
              placeholder="https://example.com/media.jpg"
              label="URL"
              {...form.getInputProps('url')}
              required
            />

            <Textarea
              placeholder="Additional description"
              label="Description"
              {...form.getInputProps('description')}
            />

            <Divider />

            <Title order={5}>Entity Association</Title>
            <Text c="dimmed" size="sm">
              Link this media to a specific entity (optional)
            </Text>

            {/* Entity association fields would go here */}
            {/* Implementation depends on having entity selection components */}

            <Group justify="flex-end" mt="md">
              <Button onClick={closeEdit} disabled={isSaving} variant="subtle">
                Cancel
              </Button>
              <Button loading={isSaving} type="submit">
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        onClose={closePreview}
        opened={previewOpened}
        size="xl"
        title={selectedMedia?.altText || 'Media Preview'}
      >
        {selectedMedia && (
          <Stack gap="md">
            {/* Media preview */}
            <Box
              style={{
                alignItems: 'center',
                backgroundColor: 'var(--mantine-color-gray-1)',
                borderRadius: 'var(--mantine-radius-sm)',
                display: 'flex',
                justifyContent: 'center',
                maxHeight: 400,
                overflow: 'hidden',
              }}
            >
              {selectedMedia.type === MediaType.IMAGE ? (
                <Image
                  alt={selectedMedia.altText || 'Media'}
                  fit="contain"
                  mah={400}
                  src={selectedMedia.url}
                />
              ) : selectedMedia.type === MediaType.VIDEO ? (
                <video
                  controls
                  style={{ maxWidth: '100%', maxHeight: 400 }}
                  src={selectedMedia.url}
                />
              ) : selectedMedia.type === MediaType.AUDIO ? (
                <audio controls style={{ width: '100%' }} src={selectedMedia.url} />
              ) : (
                <Stack align="center" py="xl">
                  <ThemeIcon color="blue" size="xl" variant="light">
                    <IconFile size={40} />
                  </ThemeIcon>
                  <Text>Document preview not available</Text>
                  <Button
                    href={selectedMedia.url}
                    component="a"
                    leftSection={<IconExternalLink size={16} />}
                    target="_blank"
                  >
                    Open in new tab
                  </Button>
                </Stack>
              )}
            </Box>

            {/* Media details */}
            <Card withBorder>
              <Stack gap="sm">
                <Title order={5}>Details</Title>

                <SimpleGrid cols={2}>
                  <div>
                    <Text fw={500} size="sm">
                      Type
                    </Text>
                    <Badge variant="light">
                      {MEDIA_TYPES.find((t) => t.value === selectedMedia.type)?.label}
                    </Badge>
                  </div>

                  {selectedMedia.size && (
                    <div>
                      <Text fw={500} size="sm">
                        Size
                      </Text>
                      <Text size="sm">{formatFileSize(selectedMedia.size)}</Text>
                    </div>
                  )}

                  {selectedMedia.width && selectedMedia.height && (
                    <div>
                      <Text fw={500} size="sm">
                        Dimensions
                      </Text>
                      <Text size="sm">
                        {selectedMedia.width} × {selectedMedia.height}
                      </Text>
                    </div>
                  )}

                  <div>
                    <Text fw={500} size="sm">
                      Created
                    </Text>
                    <Text size="sm">{formatDate(selectedMedia.createdAt)}</Text>
                  </div>
                </SimpleGrid>

                {selectedMedia.entityType !== 'UNASSIGNED' && (
                  <div>
                    <Text fw={500} size="sm">
                      Associated with
                    </Text>
                    <Group>
                      <Badge variant="outline">
                        {ENTITY_TYPES.find((e) => e.value === selectedMedia.entityType)?.label}
                      </Badge>
                      <Text size="sm">{selectedMedia.entityLabel}</Text>
                    </Group>
                  </div>
                )}
              </Stack>
            </Card>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
