'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Center,
  Container,
  Group,
  Image,
  LoadingOverlay,
  Menu,
  Modal,
  Pagination,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDots,
  IconDownload,
  IconEdit,
  IconEye,
  IconFile,
  IconFilter,
  IconPhoto,
  IconSearch,
  IconTrash,
  IconUpload,
  IconVideo,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { useAnalytics, useObservability, useUIAnalytics } from '@repo/observability';

interface MediaItem {
  alt?: string;
  description?: string;
  dimensions?: { width: number; height: number };
  id: string;
  size: number;
  tags: string[];
  thumbnail: string;
  title: string;
  type: 'image' | 'video' | 'document';
  uploadedAt: string;
  uploadedBy: string;
  url: string;
}

// Mock data for demonstration
const mockMediaItems: MediaItem[] = [
  {
    id: '1',
    type: 'image',
    url: '/images/hero-banner.jpg',
    alt: 'Beautiful landscape banner image',
    description: 'Main banner for homepage',
    dimensions: { width: 1920, height: 1080 },
    size: 1024000,
    tags: ['banner', 'homepage', 'hero'],
    thumbnail: '/images/hero-banner.jpg',
    title: 'Hero Banner Image',
    uploadedAt: '2024-01-15T10:30:00Z',
    uploadedBy: 'John Doe',
  },
  {
    id: '2',
    type: 'video',
    url: '/videos/product-showcase.mp4',
    description: 'Promotional video for new product line',
    size: 25600000,
    tags: ['product', 'video', 'promotion'],
    thumbnail: '/images/video-thumb.jpg',
    title: 'Product Showcase Video',
    uploadedAt: '2024-01-14T15:45:00Z',
    uploadedBy: 'Jane Smith',
  },
  {
    id: '3',
    type: 'document',
    url: '/documents/user-manual.pdf',
    description: 'Complete user guide documentation',
    size: 2048000,
    tags: ['documentation', 'manual', 'pdf'],
    thumbnail: '/images/pdf-thumb.jpg',
    title: 'User Manual PDF',
    uploadedAt: '2024-01-13T09:15:00Z',
    uploadedBy: 'Mike Johnson',
  },
  // Add more mock items for pagination demonstration
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `${i + 4}`,
    type: 'image' as const,
    url: `/images/sample-${i + 1}.jpg`,
    alt: `Sample image ${i + 1}`,
    description: `Description for sample image ${i + 1}`,
    dimensions: { width: 1200, height: 800 },
    size: Math.floor(Math.random() * 5000000) + 100000,
    tags: ['sample', 'test', 'demo'].slice(0, Math.floor(Math.random() * 3) + 1),
    thumbnail: `/images/sample-${i + 1}.jpg`,
    title: `Sample Image ${i + 1}`,
    uploadedAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    uploadedBy: ['John Doe', 'Jane Smith', 'Mike Johnson'][Math.floor(Math.random() * 3)],
  })),
];

export default function MediaLibraryPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [opened, { close, open }] = useDisclosure(false);
  const [editOpened, { close: closeEdit, open: openEdit }] = useDisclosure(false);

  const { trackPage } = useAnalytics();
  const { trackClick, trackView } = useUIAnalytics();
  const { trackEvent } = useObservability();

  const itemsPerPage = 12;

  useEffect(() => {
    trackPage('cms_media_library');
    trackView('media_grid');
    trackEvent({
      action: 'view',
      category: 'cms',
      label: 'media_library',
    });

    // Simulate loading
    setTimeout(() => {
      setMediaItems(mockMediaItems);
      setLoading(false);
    }, 1000);
  }, [trackPage, trackView, trackEvent]);

  // Filter and search logic
  const filteredItems = mediaItems.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' || item.type === filterType;

    return matchesSearch && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return IconPhoto;
      case 'video':
        return IconVideo;
      case 'document':
        return IconFile;
      default:
        return IconFile;
    }
  };

  const handleThumbnailClick = (item: MediaItem) => {
    setSelectedItem(item);
    trackClick('media_thumbnail', { mediaId: item.id, mediaType: item.type });
    open();
  };

  const handleEditClick = (item: MediaItem) => {
    setEditingItem({ ...item });
    trackClick('media_edit', { mediaId: item.id });
    openEdit();
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    setMediaItems((items) =>
      items.map((item) => (item.id === editingItem.id ? editingItem : item)),
    );

    trackEvent({
      action: 'edit',
      category: 'media',
      label: 'item_updated',
      metadata: { mediaId: editingItem.id },
    });

    closeEdit();
    setEditingItem(null);
  };

  const handleDelete = (itemId: string) => {
    setMediaItems((items) => items.filter((item) => item.id !== itemId));
    trackEvent({
      action: 'delete',
      category: 'media',
      label: 'item_deleted',
      metadata: { mediaId: itemId },
    });
  };

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={1}>Media Library</Title>
            <Text c="dimmed" mt="md">
              Manage images, videos, and documents
            </Text>
          </div>
          <Button color="blue" leftSection={<IconUpload size={16} />}>
            Upload Media
          </Button>
        </Group>

        {/* Filters and Search */}
        <Paper withBorder p="md">
          <Group justify="space-between">
            <Group gap="md">
              <TextInput
                leftSection={<IconSearch size={16} />}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                placeholder="Search media..."
                style={{ minWidth: 250 }}
                value={searchQuery}
              />
              <Select
                leftSection={<IconFilter size={16} />}
                onChange={(value) => setFilterType(value || 'all')}
                placeholder="Filter by type"
                data={[
                  { label: 'All Types', value: 'all' },
                  { label: 'Images', value: 'image' },
                  { label: 'Videos', value: 'video' },
                  { label: 'Documents', value: 'document' },
                ]}
                value={filterType}
              />
            </Group>
            <Text c="dimmed" size="sm">
              {filteredItems.length} items
            </Text>
          </Group>
        </Paper>

        {/* Media Grid */}
        <div style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />

          {!loading && paginatedItems.length === 0 ? (
            <Center py="xl">
              <Stack align="center" gap="md">
                <IconPhoto color="var(--mantine-color-gray-4)" size={64} />
                <Text c="dimmed" size="lg">
                  No media items found
                </Text>
                <Text c="dimmed" size="sm">
                  {searchQuery || filterType !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Upload your first media item to get started'}
                </Text>
              </Stack>
            </Center>
          ) : (
            <SimpleGrid cols={{ base: 2, lg: 6, md: 4, sm: 3 }} spacing="md">
              {paginatedItems.map((item) => {
                const FileIcon = getFileIcon(item.type);

                return (
                  <Card
                    key={item.id}
                    withBorder
                    style={{ cursor: 'pointer' }}
                    padding="xs"
                    radius="md"
                  >
                    <Card.Section onClick={() => handleThumbnailClick(item)}>
                      <div style={{ aspectRatio: '1/1', position: 'relative' }}>
                        {item.type === 'image' ? (
                          <Image
                            alt={item.alt || item.title}
                            fallbackSrc="/images/placeholder.svg"
                            fit="cover"
                            height={150}
                            src={item.thumbnail}
                          />
                        ) : (
                          <Center bg="gray.1" h={150}>
                            <FileIcon color="var(--mantine-color-gray-6)" size={40} />
                          </Center>
                        )}

                        <Badge
                          color={
                            item.type === 'image'
                              ? 'green'
                              : item.type === 'video'
                                ? 'blue'
                                : 'orange'
                          }
                          style={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                          }}
                          size="xs"
                          variant="filled"
                        >
                          {item.type}
                        </Badge>
                      </div>
                    </Card.Section>

                    <Stack gap={4} p="xs">
                      <Group align="flex-start" justify="space-between">
                        <Text style={{ flex: 1 }} fw={500} lineClamp={1} size="sm">
                          {item.title}
                        </Text>
                        <Menu withinPortal>
                          <Menu.Target>
                            <ActionIcon
                              onClick={(e) => e.stopPropagation()}
                              size="sm"
                              variant="subtle"
                            >
                              <IconDots size={14} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconEye size={14} />}
                              onClick={() => handleThumbnailClick(item)}
                            >
                              View
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconEdit size={14} />}
                              onClick={() => handleEditClick(item)}
                            >
                              Edit
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconDownload size={14} />}
                              onClick={() => window.open(item.url, '_blank')}
                            >
                              Download
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                              color="red"
                              leftSection={<IconTrash size={14} />}
                              onClick={() => handleDelete(item.id)}
                            >
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>

                      <Text c="dimmed" size="xs">
                        {formatFileSize(item.size)}
                      </Text>

                      {item.dimensions && (
                        <Text c="dimmed" size="xs">
                          {item.dimensions.width}×{item.dimensions.height}
                        </Text>
                      )}
                    </Stack>
                  </Card>
                );
              })}
            </SimpleGrid>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Center>
            <Pagination
              onChange={setCurrentPage}
              total={totalPages}
              size="sm"
              value={currentPage}
            />
          </Center>
        )}

        {/* View Modal */}
        <Modal onClose={close} opened={opened} centered size="lg" title={selectedItem?.title}>
          {selectedItem && (
            <Stack gap="md">
              {selectedItem.type === 'image' ? (
                <Image
                  alt={selectedItem.alt || selectedItem.title}
                  radius="md"
                  src={selectedItem.url}
                />
              ) : (
                <Center bg="gray.1" h={300}>
                  {getFileIcon(selectedItem.type)({
                    color: 'var(--mantine-color-gray-6)',
                    size: 80,
                  })}
                </Center>
              )}

              <Group justify="space-between">
                <div>
                  <Text fw={500}>{selectedItem.title}</Text>
                  {selectedItem.description && (
                    <Text c="dimmed" mt={4} size="sm">
                      {selectedItem.description}
                    </Text>
                  )}
                </div>
                <Group gap="xs">
                  <Button
                    leftSection={<IconEdit size={16} />}
                    onClick={() => {
                      close();
                      handleEditClick(selectedItem);
                    }}
                    variant="light"
                  >
                    Edit
                  </Button>
                  <Button
                    leftSection={<IconDownload size={16} />}
                    onClick={() => window.open(selectedItem.url, '_blank')}
                    variant="light"
                  >
                    Download
                  </Button>
                </Group>
              </Group>

              <Group gap="md">
                <Text c="dimmed" size="sm">
                  <strong>Size:</strong> {formatFileSize(selectedItem.size)}
                </Text>
                {selectedItem.dimensions && (
                  <Text c="dimmed" size="sm">
                    <strong>Dimensions:</strong> {selectedItem.dimensions.width}×
                    {selectedItem.dimensions.height}
                  </Text>
                )}
                <Text c="dimmed" size="sm">
                  <strong>Type:</strong> {selectedItem.type}
                </Text>
              </Group>

              {selectedItem.tags.length > 0 && (
                <Group gap="xs">
                  <Text fw={500} size="sm">
                    Tags:
                  </Text>
                  {selectedItem.tags.map((tag) => (
                    <Badge key={tag} size="sm" variant="light">
                      {tag}
                    </Badge>
                  ))}
                </Group>
              )}
            </Stack>
          )}
        </Modal>

        {/* Edit Modal */}
        <Modal onClose={closeEdit} opened={editOpened} centered size="md" title="Edit Media Item">
          {editingItem && (
            <Stack gap="md">
              <TextInput
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    title: e.currentTarget.value,
                  })
                }
                label="Title"
                value={editingItem.title}
              />

              <Textarea
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    description: e.currentTarget.value,
                  })
                }
                rows={3}
                label="Description"
                value={editingItem.description || ''}
              />

              {editingItem.type === 'image' && (
                <TextInput
                  description="Alternative text for accessibility"
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      alt: e.currentTarget.value,
                    })
                  }
                  label="Alt Text"
                  value={editingItem.alt || ''}
                />
              )}

              <TextInput
                description="Comma-separated tags"
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    tags: e.currentTarget.value
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
                label="Tags"
                value={editingItem.tags.join(', ')}
              />

              <Group justify="flex-end" mt="md">
                <Button onClick={closeEdit} variant="light">
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </Group>
            </Stack>
          )}
        </Modal>
      </Stack>
    </Container>
  );
}
