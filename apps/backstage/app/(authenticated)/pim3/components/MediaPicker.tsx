'use client';

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Group,
  Image,
  Input,
  LoadingOverlay,
  Modal,
  MultiSelect,
  Pagination,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconEye,
  IconFileText,
  IconMovie,
  IconMusic,
  IconPhoto,
  IconSearch,
} from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';

import {
  getMedia,
  type MediaFilter,
  type MediaSort,
  type MediaWithRelations,
} from '../media/actions';
import { formatDate, formatFileSize } from '../utils/pim-helpers';

import type { MediaType } from '@repo/database/prisma';

interface MediaPickerProps {
  allowedTypes?: MediaType[];
  multiple?: boolean;
  onClose: () => void;
  onSelect: (media: MediaWithRelations[]) => void;
  opened: boolean;
  selectedIds?: string[];
  title?: string;
}

const MEDIA_TYPES: { label: string; value: MediaType; icon: React.ReactNode; color: string }[] = [
  { color: 'blue', icon: <IconPhoto size={16} />, label: 'Image', value: 'IMAGE' },
  { color: 'red', icon: <IconMovie size={16} />, label: 'Video', value: 'VIDEO' },
  { color: 'green', icon: <IconFileText size={16} />, label: 'Document', value: 'DOCUMENT' },
  { color: 'yellow', icon: <IconMusic size={16} />, label: 'Audio', value: 'AUDIO' },
];

function MediaPickerCard({
  media,
  onPreview,
  onSelect,
  selected,
}: {
  media: MediaWithRelations;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onPreview: () => void;
}) {
  const typeInfo = MEDIA_TYPES.find((t) => t.value === media.type);

  return (
    <Card
      onClick={() => onSelect(!selected)}
      withBorder
      style={{
        backgroundColor: selected ? 'var(--mantine-color-blue-0)' : undefined,
        border: selected ? '2px solid var(--mantine-color-blue-5)' : undefined,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      p="xs"
    >
      <Stack gap="xs">
        {/* Header with checkbox and preview */}
        <Group justify="space-between">
          <Checkbox
            onChange={(e) => {
              e.stopPropagation();
              onSelect(e.currentTarget.checked);
            }}
            onClick={(e) => e.stopPropagation()}
            checked={selected}
            size="sm"
          />
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
        </Group>

        {/* Media preview */}
        <Box
          style={{
            alignItems: 'center',
            backgroundColor: 'var(--mantine-color-gray-1)',
            borderRadius: 'var(--mantine-radius-sm)',
            display: 'flex',
            height: 80,
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {media.type === 'IMAGE' ? (
            <Image
              alt={media.altText || 'Media'}
              fallbackSrc="/placeholder.png"
              fit="cover"
              h="100%"
              src={media.url}
              w="100%"
            />
          ) : (
            <ThemeIcon color={typeInfo?.color} size="lg" variant="light">
              {typeInfo?.icon}
            </ThemeIcon>
          )}
        </Box>

        {/* Media info */}
        <Stack gap={2}>
          <Text fw={500} lineClamp={1} size="xs">
            {media.altText || 'Untitled'}
          </Text>

          <Group gap="xs" justify="space-between">
            <Badge color={typeInfo?.color} size="xs" variant="light">
              {typeInfo?.label}
            </Badge>
            <Text c="dimmed" size="xs">
              {media.size ? formatFileSize(media.size) : '—'}
            </Text>
          </Group>
        </Stack>
      </Stack>
    </Card>
  );
}

export function MediaPicker({
  allowedTypes,
  multiple = false,
  onClose,
  onSelect,
  opened,
  selectedIds = [],
  title = 'Select Media',
}: MediaPickerProps) {
  const [media, setMedia] = useState<MediaWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(selectedIds));
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [previewMedia, setPreviewMedia] = useState<MediaWithRelations | null>(null);

  // Filter state
  const [filter, setFilter] = useState<MediaFilter>({
    type: allowedTypes,
  });
  const [sort, setSort] = useState<MediaSort>({ direction: 'desc', field: 'createdAt' });
  const [debouncedSearch] = useDebouncedValue(filter.search || '', 300);

  // Preview modal
  const [previewOpened, { close: closePreview, open: openPreview }] = useDisclosure(false);

  const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      const debouncedFilter = { ...filter, search: debouncedSearch };
      const result = await getMedia(debouncedFilter, sort, page, 12);
      setMedia(result.media);
      setTotal(result.total);
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

  useEffect(() => {
    if (opened) {
      loadMedia();
    }
  }, [opened, loadMedia]);

  const handleSelect = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);

    if (checked) {
      if (!multiple) {
        newSelected.clear();
      }
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }

    setSelectedItems(newSelected);
  };

  const handleConfirm = () => {
    const selectedMedia = media.filter((m) => selectedItems.has(m.id));
    onSelect(selectedMedia);
    onClose();
  };

  const handlePreview = (mediaItem: MediaWithRelations) => {
    setPreviewMedia(mediaItem);
    openPreview();
  };

  const filteredMediaTypes = allowedTypes
    ? MEDIA_TYPES.filter((t) => allowedTypes.includes(t.value))
    : MEDIA_TYPES;

  return (
    <>
      <Modal closeOnClickOutside={false} onClose={onClose} opened={opened} size="xl" title={title}>
        <Stack gap="md">
          {/* Filters */}
          <Card withBorder p="sm">
            <Stack gap="sm">
              <SimpleGrid cols={{ base: 1, lg: 3, sm: 2 }} spacing="sm">
                <TextInput
                  leftSection={<IconSearch size={16} />}
                  onChange={(e) => {
                    setFilter((prev) => ({ ...prev, search: e.currentTarget.value }));
                    setPage(1);
                  }}
                  placeholder="Search media..."
                  size="sm"
                  value={filter.search || ''}
                />

                {!allowedTypes && (
                  <MultiSelect
                    onChange={(value) => {
                      setFilter((prev) => ({ ...prev, type: value as MediaType[] }));
                      setPage(1);
                    }}
                    placeholder="Filter by type"
                    data={MEDIA_TYPES.map((t) => ({ label: t.label, value: t.value }))}
                    size="sm"
                    value={filter.type || []}
                  />
                )}

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
                  ]}
                  size="sm"
                  value={`${sort.field}-${sort.direction}`}
                />
              </SimpleGrid>

              <Group justify="space-between">
                <SegmentedControl
                  onChange={(value) => setViewMode(value as 'grid' | 'list')}
                  data={[
                    { label: 'Grid', value: 'grid' },
                    { label: 'List', value: 'list' },
                  ]}
                  size="xs"
                  value={viewMode}
                />

                <Text c="dimmed" size="sm">
                  {selectedItems.size} selected
                  {!multiple && selectedItems.size > 0 && ' (single selection)'}
                </Text>
              </Group>
            </Stack>
          </Card>

          {/* Media Grid */}
          <Box style={{ minHeight: 300, position: 'relative' }}>
            <LoadingOverlay visible={loading} />

            {media.length === 0 && !loading ? (
              <Stack align="center" py="xl">
                <ThemeIcon color="gray" size="xl" variant="light">
                  <IconPhoto size={30} />
                </ThemeIcon>
                <Text fw={500} ta="center">
                  No media files found
                </Text>
                <Text c="dimmed" size="sm" ta="center">
                  Try adjusting your filters or upload some files
                </Text>
              </Stack>
            ) : (
              <SimpleGrid cols={{ base: 2, md: 4, sm: 3 }} spacing="sm">
                {media.map((item) => (
                  <MediaPickerCard
                    key={item.id}
                    onPreview={() => handlePreview(item)}
                    onSelect={(checked) => handleSelect(item.id, checked)}
                    media={item}
                    selected={selectedItems.has(item.id)}
                  />
                ))}
              </SimpleGrid>
            )}
          </Box>

          {/* Pagination */}
          {total > 12 && (
            <Group justify="center">
              <Pagination onChange={setPage} total={Math.ceil(total / 12)} size="sm" value={page} />
            </Group>
          )}

          {/* Actions */}
          <Group justify="space-between">
            <Text c="dimmed" size="sm">
              {(page - 1) * 12 + 1}-{Math.min(page * 12, total)} of {total} items
            </Text>

            <Group>
              <Button onClick={onClose} variant="subtle">
                Cancel
              </Button>
              <Button
                leftSection={<IconCheck size={16} />}
                onClick={handleConfirm}
                disabled={selectedItems.size === 0}
              >
                Select {selectedItems.size > 0 && `(${selectedItems.size})`}
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>

      {/* Preview Modal */}
      <Modal
        onClose={closePreview}
        opened={previewOpened}
        size="lg"
        title={previewMedia?.altText || 'Media Preview'}
      >
        {previewMedia && (
          <Stack gap="md">
            {/* Media preview */}
            <Box
              style={{
                alignItems: 'center',
                backgroundColor: 'var(--mantine-color-gray-1)',
                borderRadius: 'var(--mantine-radius-sm)',
                display: 'flex',
                justifyContent: 'center',
                maxHeight: 300,
                overflow: 'hidden',
              }}
            >
              {previewMedia.type === 'IMAGE' ? (
                <Image
                  alt={previewMedia.altText || 'Media'}
                  fit="contain"
                  mah={300}
                  src={previewMedia.url}
                />
              ) : previewMedia.type === 'VIDEO' ? (
                <video
                  controls
                  style={{ maxWidth: '100%', maxHeight: 300 }}
                  src={previewMedia.url}
                />
              ) : previewMedia.type === 'AUDIO' ? (
                <audio controls style={{ width: '100%' }} src={previewMedia.url} />
              ) : (
                <Stack align="center" py="xl">
                  <ThemeIcon color="blue" size="xl" variant="light">
                    <IconFileText size={40} />
                  </ThemeIcon>
                  <Text>Document preview not available</Text>
                </Stack>
              )}
            </Box>

            {/* Media details */}
            <Card withBorder>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text fw={500}>{previewMedia.altText || 'Untitled'}</Text>
                  <Badge color={MEDIA_TYPES.find((t) => t.value === previewMedia.type)?.color}>
                    {MEDIA_TYPES.find((t) => t.value === previewMedia.type)?.label}
                  </Badge>
                </Group>

                <SimpleGrid cols={2} spacing="xs">
                  {previewMedia.size && (
                    <div>
                      <Text c="dimmed" size="xs">
                        Size
                      </Text>
                      <Text size="sm">{formatFileSize(previewMedia.size)}</Text>
                    </div>
                  )}

                  {previewMedia.width && previewMedia.height && (
                    <div>
                      <Text c="dimmed" size="xs">
                        Dimensions
                      </Text>
                      <Text size="sm">
                        {previewMedia.width} × {previewMedia.height}
                      </Text>
                    </div>
                  )}

                  <div>
                    <Text c="dimmed" size="xs">
                      Created
                    </Text>
                    <Text size="sm">{formatDate(previewMedia.createdAt)}</Text>
                  </div>

                  {previewMedia.entityLabel && (
                    <div>
                      <Text c="dimmed" size="xs">
                        Associated with
                      </Text>
                      <Text size="sm">{previewMedia.entityLabel}</Text>
                    </div>
                  )}
                </SimpleGrid>
              </Stack>
            </Card>
          </Stack>
        )}
      </Modal>
    </>
  );
}

// Quick media picker button component
interface MediaPickerButtonProps {
  allowedTypes?: MediaType[];
  children?: React.ReactNode;
  multiple?: boolean;
  onSelect: (media: MediaWithRelations[]) => void;
  placeholder?: string;
  value?: MediaWithRelations[];
  variant?: 'button' | 'input';
}

export function MediaPickerButton({
  allowedTypes,
  children,
  multiple = false,
  onSelect,
  placeholder = 'Select media...',
  value = [],
  variant = 'button',
}: MediaPickerButtonProps) {
  const [opened, { close, open }] = useDisclosure(false);

  const handleSelect = (selectedMedia: MediaWithRelations[]) => {
    onSelect(selectedMedia);
  };

  if (variant === 'input') {
    return (
      <>
        <Input
          component="button"
          onClick={open}
          placeholder={value.length > 0 ? undefined : placeholder}
          styles={{
            input: {
              cursor: 'pointer',
              minHeight: value.length > 0 ? 'auto' : undefined,
            },
          }}
          multiline
        >
          {value.length > 0 ? (
            <Stack gap="xs" py="xs">
              {value.map((media) => (
                <Group key={media.id} gap="xs">
                  <Box
                    style={{
                      width: 30,
                      alignItems: 'center',
                      backgroundColor: 'var(--mantine-color-gray-1)',
                      borderRadius: 'var(--mantine-radius-sm)',
                      display: 'flex',
                      height: 30,
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {media.type === 'IMAGE' ? (
                      <Image
                        alt={media.altText || 'Media'}
                        fit="cover"
                        h="100%"
                        src={media.url}
                        w="100%"
                      />
                    ) : (
                      <ThemeIcon size="xs" variant="light">
                        {MEDIA_TYPES.find((t) => t.value === media.type)?.icon}
                      </ThemeIcon>
                    )}
                  </Box>
                  <Text size="sm">{media.altText || 'Untitled'}</Text>
                </Group>
              ))}
            </Stack>
          ) : null}
        </Input>

        <MediaPicker
          allowedTypes={allowedTypes}
          onClose={close}
          onSelect={handleSelect}
          opened={opened}
          multiple={multiple}
          selectedIds={value.map((m) => m.id)}
        />
      </>
    );
  }

  return (
    <>
      <Button leftSection={<IconPhoto size={18} />} onClick={open} variant="outline">
        {children || 'Select Media'}
      </Button>

      <MediaPicker
        allowedTypes={allowedTypes}
        onClose={close}
        onSelect={handleSelect}
        opened={opened}
        multiple={multiple}
        selectedIds={value.map((m) => m.id)}
      />
    </>
  );
}
