'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Drawer,
  Group,
  Image,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { useForm } from '@mantine/form';
import { useDisclosure, useListState } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconDownload,
  IconEdit,
  IconEye,
  IconGripVertical,
  IconPhoto,
  IconTrash,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';

import { formatDate, formatFileSize, showSuccessNotification } from '../utils/pim-helpers';
import type { MediaType } from '@repo/database/prisma';

// Media management data structures
interface MediaAsset {
  alt?: string;
  associatedPdps: string[]; // PDP IDs
  associatedProducts: string[]; // Product IDs
  createdAt: Date;
  description?: string;
  filename: string;
  id: string;
  mimeType: string;
  size: number;
  sortOrder: number;
  type: MediaType;
  updatedAt: Date;
  url: string;
}

interface MediaUploadForm {
  alt: string;
  associateWithPdps: string[];
  associateWithProduct: boolean;
  description: string;
  files: File[];
  type: MediaType;
}

interface MediaManagementProps {
  onClose: () => void;
  onUpdate?: () => void;
  opened: boolean;
  productId: string;
  productName: string;
}

export function MediaManagement({
  onClose,
  onUpdate,
  opened,
  productId,
  productName,
}: MediaManagementProps) {
  // Use Mantine hooks for state management
  const [assets, assetsHandlers] = useListState<MediaAsset>([
    {
      id: 'asset-1',
      filename: 'product-hero.jpg',
      type: 'IMAGE',
      url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
      alt: 'Gaming laptop hero image',
      associatedPdps: ['pdp-1', 'pdp-2'],
      associatedProducts: [productId],
      createdAt: new Date('2025-01-10'),
      description: 'Main product hero image for marketing',
      mimeType: 'image/jpeg',
      size: 245760,
      sortOrder: 1,
      updatedAt: new Date('2025-01-15'),
    },
    {
      id: 'asset-2',
      filename: 'product-angle-1.jpg',
      type: 'IMAGE',
      url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
      alt: 'Gaming laptop side angle',
      associatedPdps: ['pdp-1'],
      associatedProducts: [productId],
      createdAt: new Date('2025-01-10'),
      description: 'Side angle view showing ports and design',
      mimeType: 'image/jpeg',
      size: 189432,
      sortOrder: 2,
      updatedAt: new Date('2025-01-10'),
    },
    {
      id: 'asset-3',
      filename: 'product-specs.pdf',
      type: 'DOCUMENT',
      url: '/files/product-specs.pdf',
      associatedPdps: [],
      associatedProducts: [productId],
      createdAt: new Date('2025-01-08'),
      description: 'Technical specifications document',
      mimeType: 'application/pdf',
      size: 512000,
      sortOrder: 10,
      updatedAt: new Date('2025-01-08'),
    },
    {
      id: 'asset-4',
      filename: 'user-manual.pdf',
      type: 'DOCUMENT',
      url: '/files/user-manual.pdf',
      associatedPdps: ['pdp-1', 'pdp-2', 'pdp-3'],
      associatedProducts: [productId],
      createdAt: new Date('2025-01-05'),
      description: 'User manual and setup guide',
      mimeType: 'application/pdf',
      size: 1024000,
      sortOrder: 11,
      updatedAt: new Date('2025-01-12'),
    },
  ]);

  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'organize'>('upload');
  const [editingAsset, editingAssetHandlers] = useDisclosure(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Form for media uploads
  const uploadForm = useForm<MediaUploadForm>({
    validate: {
      type: (value) => (!value ? 'Please select asset type' : null),
      files: (value) => (!value || value.length === 0 ? 'Please select at least one file' : null),
    },
    initialValues: {
      type: 'IMAGE',
      alt: '',
      associateWithPdps: [],
      associateWithProduct: true,
      description: '',
      files: [],
    },
  });

  // Form for editing assets
  const editForm = useForm({
    validate: {
      filename: (value) => (!value ? 'Filename is required' : null),
    },
    initialValues: {
      filename: '',
      type: 'IMAGE' as MediaType,
      alt: '',
      description: '',
    },
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return 'blue';
      case 'VIDEO':
        return 'grape';
      case 'DOCUMENT':
        return 'gray';
      case 'MANUAL':
        return 'green';
      case 'SPECIFICATION':
        return 'orange';
      case 'CERTIFICATE':
        return 'teal';
      case 'OTHER':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const handleFileUpload = (files: File[]) => {
    uploadForm.setFieldValue('files', files);
  };

  const handleUploadSubmit = () => {
    const validation = uploadForm.validate();
    if (validation.hasErrors) return;

    const values = uploadForm.values;

    // Simulate file upload and create new assets
    const newAssets = values.files.map((file, index) => ({
      id: `asset-${Date.now()}-${index}`,
      filename: file.name,
      type: values.type,
      url: URL.createObjectURL(file), // In real app, this would be the uploaded URL
      alt: values.alt || `${productName} ${values.type.toLowerCase()}`,
      associatedPdps: values.associateWithPdps,
      associatedProducts: values.associateWithProduct ? [productId] : [],
      createdAt: new Date(),
      description: values.description,
      mimeType: file.type,
      size: file.size,
      sortOrder: assets.length + index + 1,
      updatedAt: new Date(),
    }));

    // Use Mantine list handlers to append new assets
    assetsHandlers.append(...newAssets);

    // Reset form
    uploadForm.reset();

    showSuccessNotification(`${newAssets.length} file(s) uploaded successfully`, 'Upload Complete');

    setActiveTab('manage');
  };

  const handleDeleteAsset = (assetId: string) => {
    const assetIndex = assets.findIndex((asset) => asset.id === assetId);
    if (assetIndex !== -1) {
      assetsHandlers.remove(assetIndex);
      showSuccessNotification('Asset deleted successfully', 'Deleted');
    }
  };

  const handleEditAsset = (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);
    if (asset) {
      editForm.setValues({
        filename: asset.filename,
        type: asset.type,
        alt: asset.alt || '',
        description: asset.description || '',
      });
      setSelectedAssetId(assetId);
      editingAssetHandlers.open();
    }
  };

  const handleSaveEdit = () => {
    const validation = editForm.validate();
    if (validation.hasErrors || !selectedAssetId) return;

    const assetIndex = assets.findIndex((asset) => asset.id === selectedAssetId);
    if (assetIndex !== -1) {
      assetsHandlers.setItem(assetIndex, {
        ...assets[assetIndex],
        ...editForm.values,
        updatedAt: new Date(),
      });

      notifications.show({
        color: 'green',
        message: 'Asset updated successfully',
        title: 'Updated',
      });

      editingAssetHandlers.close();
      setSelectedAssetId(null);
      editForm.reset();
    }
  };

  const handleReorderAssets = (result: any) => {
    if (!result.destination) return;

    const productAssets = assets.filter((asset) => asset.associatedProducts.includes(productId));
    const sortedProductAssets = productAssets.sort((a, b) => a.sortOrder - b.sortOrder);

    // Use Mantine's reorder functionality for the product assets subset
    const reorderedProductAssets = [...sortedProductAssets];
    const [reorderedItem] = reorderedProductAssets.splice(result.source.index, 1);
    reorderedProductAssets.splice(result.destination.index, 0, reorderedItem);

    // Update sort orders for the reordered product assets
    reorderedProductAssets.forEach((asset, index) => {
      asset.sortOrder = index + 1;
    });

    // Update the main assets array with new sort orders
    const updatedAssets = assets.map((asset) => {
      const reorderedAsset = reorderedProductAssets.find((pa) => pa.id === asset.id);
      return reorderedAsset || asset;
    });

    // Replace the entire assets array with updated version
    assetsHandlers.setState(updatedAssets);

    notifications.show({
      color: 'blue',
      message: 'Asset order updated',
      title: 'Reordered',
    });
  };

  const productAssets = assets.filter((asset) => asset.associatedProducts.includes(productId));
  const pdpAssets = assets.filter((asset) => asset.associatedPdps.length > 0);
  const unassociatedAssets = assets.filter(
    (asset) => !asset.associatedProducts.includes(productId) && asset.associatedPdps.length === 0,
  );

  return (
    <Drawer
      onClose={onClose}
      opened={opened}
      position="right"
      size="xl"
      title={`Media Management - ${productName}`}
    >
      <Stack h="100%">
        {/* Tab Navigation */}
        <Group>
          <Button
            leftSection={<IconUpload size={16} />}
            onClick={() => setActiveTab('upload')}
            size="sm"
            variant={activeTab === 'upload' ? 'filled' : 'light'}
          >
            Upload
          </Button>
          <Button
            leftSection={<IconPhoto size={16} />}
            onClick={() => setActiveTab('manage')}
            size="sm"
            variant={activeTab === 'manage' ? 'filled' : 'light'}
          >
            Manage ({assets.length})
          </Button>
          <Button
            leftSection={<IconEdit size={16} />}
            onClick={() => setActiveTab('organize')}
            size="sm"
            variant={activeTab === 'organize' ? 'filled' : 'light'}
          >
            Organize
          </Button>
        </Group>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <Stack flex={1}>
            <Text fw={600} size="lg">
              Upload New Media
            </Text>

            {/* Dropzone */}
            <Dropzone
              onDrop={handleFileUpload}
              onReject={(files) => {
                notifications.show({
                  color: 'red',
                  message: `${files.length} file(s) rejected`,
                  title: 'Upload Error',
                });
              }}
              accept={[...IMAGE_MIME_TYPE, 'application/pdf', 'video/*']}
              maxSize={10 * 1024 ** 2} // 10MB
              multiple
            >
              <Group style={{ pointerEvents: 'none' }} gap="xl" justify="center" mih={220}>
                <Dropzone.Accept>
                  <IconUpload color="var(--mantine-color-blue-6)" stroke={1.5} size={52} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX color="var(--mantine-color-red-6)" stroke={1.5} size={52} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto color="var(--mantine-color-dimmed)" stroke={1.5} size={52} />
                </Dropzone.Idle>

                <div>
                  <Text inline size="xl">
                    Drag files here or click to select
                  </Text>
                  <Text c="dimmed" inline mt={7} size="sm">
                    Images, videos, and documents up to 10MB each
                  </Text>
                </div>
              </Group>
            </Dropzone>

            {/* Upload Form */}
            {uploadForm.values.files.length > 0 && (
              <Card withBorder>
                <Stack>
                  <Text fw={500}>Upload Details</Text>

                  <SimpleGrid cols={2} spacing="md">
                    <Select
                      label="Asset Type"
                      {...uploadForm.getInputProps('type')}
                      data={[
                        { label: 'Image', value: 'IMAGE' },
                        { label: 'Video', value: 'VIDEO' },
                        { label: 'Document', value: 'DOCUMENT' },
                        { label: 'Manual', value: 'MANUAL' },
                        { label: 'Specification', value: 'SPECIFICATION' },
                        { label: 'Certificate', value: 'CERTIFICATE' },
                        { label: 'Other', value: 'OTHER' },
                      ]}
                      required
                    />

                    <TextInput
                      placeholder="Describe the image for accessibility"
                      label="Alt Text"
                      {...uploadForm.getInputProps('alt')}
                    />
                  </SimpleGrid>

                  <Textarea
                    placeholder="Brief description of the asset"
                    rows={3}
                    label="Description"
                    {...uploadForm.getInputProps('description')}
                  />

                  <Text fw={500} size="sm">
                    Selected Files ({uploadForm.values.files.length})
                  </Text>
                  <Stack gap="xs">
                    {uploadForm.values.files.map((file, index) => (
                      <Group key={index} justify="space-between">
                        <div>
                          <Text size="sm">{file.name}</Text>
                          <Text c="dimmed" size="xs">
                            {formatFileSize(file.size)}
                          </Text>
                        </div>
                        <Badge color="blue" size="sm" variant="light">
                          {file.type}
                        </Badge>
                      </Group>
                    ))}
                  </Stack>

                  <Button fullWidth onClick={handleUploadSubmit}>
                    Upload {uploadForm.values.files.length} File(s)
                  </Button>
                </Stack>
              </Card>
            )}
          </Stack>
        )}

        {/* Manage Tab */}
        {activeTab === 'manage' && (
          <Stack flex={1}>
            <Group justify="space-between">
              <Text fw={600} size="lg">
                Media Assets
              </Text>
              <Text c="dimmed" size="sm">
                {assets.length} total assets
              </Text>
            </Group>

            {/* Product Assets */}
            <div>
              <Text fw={500} mb="sm">
                Product Assets ({productAssets.length})
              </Text>
              {productAssets.length > 0 ? (
                <SimpleGrid cols={2} spacing="md">
                  {productAssets.map((asset) => (
                    <Card key={asset.id} withBorder>
                      <Stack gap="sm">
                        {asset.type === 'IMAGE' && (
                          <Image
                            alt={asset.alt}
                            fit="cover"
                            height={120}
                            radius="sm"
                            src={asset.url}
                          />
                        )}

                        <div>
                          <Group justify="space-between" mb="xs">
                            <Text fw={500} size="sm" truncate>
                              {asset.filename}
                            </Text>
                            <Badge color={getTypeColor(asset.type)} size="xs" variant="light">
                              {asset.type}
                            </Badge>
                          </Group>

                          <Text c="dimmed" mb="xs" size="xs">
                            {formatFileSize(asset.size)} • {formatDate(asset.createdAt)}
                          </Text>

                          {asset.description && (
                            <Text lineClamp={2} size="xs">
                              {asset.description}
                            </Text>
                          )}
                        </div>

                        <Group justify="space-between">
                          <Group gap="xs">
                            <Tooltip label="View">
                              <ActionIcon size="sm" variant="subtle">
                                <IconEye size={14} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Edit">
                              <ActionIcon
                                onClick={() => handleEditAsset(asset.id)}
                                size="sm"
                                variant="subtle"
                              >
                                <IconEdit size={14} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Download">
                              <ActionIcon size="sm" variant="subtle">
                                <IconDownload size={14} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                          <Tooltip label="Delete">
                            <ActionIcon
                              color="red"
                              onClick={() => handleDeleteAsset(asset.id)}
                              size="sm"
                              variant="subtle"
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Stack>
                    </Card>
                  ))}
                </SimpleGrid>
              ) : (
                <Text c="dimmed" py="md" ta="center">
                  No assets associated with this product
                </Text>
              )}
            </div>

            {/* PDP Assets */}
            {pdpAssets.length > 0 && (
              <div>
                <Text fw={500} mb="sm">
                  PDP Assets ({pdpAssets.length})
                </Text>
                <SimpleGrid cols={3} spacing="sm">
                  {pdpAssets.map((asset) => (
                    <Card key={asset.id} withBorder>
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text fw={500} size="xs" truncate>
                            {asset.filename}
                          </Text>
                          <Badge color={getTypeColor(asset.type)} size="xs" variant="light">
                            {asset.type}
                          </Badge>
                        </Group>
                        <Text c="dimmed" size="xs">
                          {asset.associatedPdps.length} PDP(s)
                        </Text>
                      </Stack>
                    </Card>
                  ))}
                </SimpleGrid>
              </div>
            )}

            {/* Unassociated Assets */}
            {unassociatedAssets.length > 0 && (
              <div>
                <Text c="orange" fw={500} mb="sm">
                  Unassociated Assets ({unassociatedAssets.length})
                </Text>
                <Text c="dimmed" mb="sm" size="sm">
                  These assets are not associated with any products or PDPs
                </Text>
                <SimpleGrid cols={3} spacing="sm">
                  {unassociatedAssets.map((asset) => (
                    <Card key={asset.id} withBorder>
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text fw={500} size="xs" truncate>
                            {asset.filename}
                          </Text>
                          <Badge color="gray" size="xs" variant="light">
                            {asset.type}
                          </Badge>
                        </Group>
                        <Button size="xs" variant="light">
                          Associate
                        </Button>
                      </Stack>
                    </Card>
                  ))}
                </SimpleGrid>
              </div>
            )}
          </Stack>
        )}

        {/* Organize Tab */}
        {activeTab === 'organize' && (
          <Stack flex={1}>
            <Text fw={600} size="lg">
              Organize & Sort Assets
            </Text>
            <Text c="dimmed" size="sm">
              Drag and drop to reorder product assets. The first image will be used as the primary
              product image.
            </Text>

            <div>
              <Text fw={500} mb="sm">
                Product Asset Order
              </Text>

              <DragDropContext onDragEnd={handleReorderAssets}>
                <Droppable direction="vertical" droppableId="assets">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      <Stack gap="sm">
                        {productAssets
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((asset, index) => (
                            <Draggable key={asset.id} draggableId={asset.id} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  withBorder
                                  style={{
                                    ...provided.draggableProps.style,
                                    opacity: snapshot.isDragging ? 0.5 : 1,
                                    transform: snapshot.isDragging
                                      ? `${provided.draggableProps.style?.transform} rotate(5deg)`
                                      : provided.draggableProps.style?.transform,
                                  }}
                                >
                                  <Group justify="space-between">
                                    <Group gap="sm">
                                      <div {...provided.dragHandleProps}>
                                        <IconGripVertical
                                          color="var(--mantine-color-gray-5)"
                                          style={{ cursor: 'grab' }}
                                          size={16}
                                        />
                                      </div>
                                      <Badge color="blue" size="sm" variant="filled">
                                        {index + 1}
                                      </Badge>
                                      {index === 0 && (
                                        <Badge color="green" size="sm" variant="light">
                                          Primary
                                        </Badge>
                                      )}
                                      {asset.type === 'IMAGE' && (
                                        <Image
                                          width={40}
                                          alt={asset.alt}
                                          fit="cover"
                                          height={40}
                                          radius="sm"
                                          src={asset.url}
                                        />
                                      )}
                                      <div>
                                        <Text fw={500} size="sm">
                                          {asset.filename}
                                        </Text>
                                        <Text c="dimmed" size="xs">
                                          {asset.type}
                                        </Text>
                                      </div>
                                    </Group>
                                    <Text c="dimmed" size="sm">
                                      {snapshot.isDragging ? 'Drop to reorder' : 'Drag to reorder'}
                                    </Text>
                                  </Group>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </Stack>
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </Stack>
        )}
      </Stack>

      {/* Edit Asset Modal */}
      <Drawer
        onClose={() => {
          editingAssetHandlers.close();
          setSelectedAssetId(null);
          editForm.reset();
        }}
        opened={editingAsset}
        position="right"
        size="md"
        title="Edit Asset"
      >
        <Stack>
          <TextInput label="Filename" {...editForm.getInputProps('filename')} required />

          <Select
            label="Asset Type"
            {...editForm.getInputProps('type')}
            data={[
              { label: 'Image', value: 'IMAGE' },
              { label: 'Video', value: 'VIDEO' },
              { label: 'Document', value: 'DOCUMENT' },
              { label: 'Manual', value: 'MANUAL' },
              { label: 'Specification', value: 'SPECIFICATION' },
              { label: 'Certificate', value: 'CERTIFICATE' },
              { label: 'Other', value: 'OTHER' },
            ]}
            required
          />

          <TextInput
            placeholder="Describe the image for accessibility"
            label="Alt Text"
            {...editForm.getInputProps('alt')}
          />

          <Textarea
            placeholder="Brief description of the asset"
            rows={4}
            label="Description"
            {...editForm.getInputProps('description')}
          />

          <Group justify="flex-end" mt="md">
            <Button
              onClick={() => {
                editingAssetHandlers.close();
                setSelectedAssetId(null);
                editForm.reset();
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </Group>
        </Stack>
      </Drawer>
    </Drawer>
  );
}
