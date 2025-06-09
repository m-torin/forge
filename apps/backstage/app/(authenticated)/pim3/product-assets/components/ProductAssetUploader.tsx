'use client';

import {
  Button,
  Group,
  Modal,
  NumberInput,
  Progress,
  rem,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconCloudUpload,
  IconFile,
  IconPhoto,
  IconUpload,
  IconVideo,
  IconX,
} from '@tabler/icons-react';
import { useCallback, useState } from 'react';

import { linkAssetToProduct } from '../actions';

import type { AssetType } from '@repo/database/prisma';

interface UploadFile {
  error?: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

const ASSET_TYPE_OPTIONS = [
  { label: 'Image', value: 'IMAGE' },
  { label: 'Video', value: 'VIDEO' },
  { label: 'Document', value: 'DOCUMENT' },
  { label: 'Manual', value: 'MANUAL' },
  { label: 'Specification', value: 'SPECIFICATION' },
  { label: 'Certificate', value: 'CERTIFICATE' },
  { label: 'Other', value: 'OTHER' },
];

export function ProductAssetUploader() {
  const [opened, { close, open }] = useDisclosure();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const form = useForm({
    validate: {
      productId: (value) => (!value ? 'Product ID is required' : null),
    },
    initialValues: {
      type: 'IMAGE' as AssetType,
      alt: '',
      description: '',
      productId: '',
      sortOrder: 0,
    },
  });

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => {
      const uploadFile: UploadFile = {
        file,
        progress: 0,
        status: 'pending',
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setFiles((current) =>
            current.map((f) => (f.file === file ? { ...f, preview: reader.result as string } : f)),
          );
        };
        reader.readAsDataURL(file);
      }

      return uploadFile;
    });

    setFiles((current) => [...current, ...newFiles]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  const uploadFile = async (
    uploadFile: UploadFile,
    metadata: typeof form.values,
  ): Promise<boolean> => {
    try {
      // Update status to uploading
      setFiles((current) =>
        current.map((f) =>
          f.file === uploadFile.file ? { ...f, progress: 0, status: 'uploading' as const } : f,
        ),
      );

      // Simulate file upload progress
      // In a real implementation, you would:
      // 1. Upload to your storage service (AWS S3, Cloudinary, etc.)
      // 2. Track real upload progress
      // 3. Get the final URL

      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setFiles((current) =>
          current.map((f) => (f.file === uploadFile.file ? { ...f, progress } : f)),
        );
      }

      // Mock URL - in real implementation, this would come from your storage service
      const mockUrl = `https://example.com/assets/${uploadFile.file.name}`;

      // Create FormData for the server action
      const formData = new FormData();
      formData.append('productId', metadata.productId);
      formData.append('type', metadata.type);
      formData.append('url', mockUrl);
      formData.append('filename', uploadFile.file.name);
      formData.append('mimeType', uploadFile.file.type);
      formData.append('size', uploadFile.file.size.toString());
      if (metadata.alt) formData.append('alt', metadata.alt);
      if (metadata.description) formData.append('description', metadata.description);
      formData.append('sortOrder', metadata.sortOrder.toString());

      const result = await linkAssetToProduct(formData);

      if (result.success) {
        setFiles((current) =>
          current.map((f) =>
            f.file === uploadFile.file ? { ...f, progress: 100, status: 'completed' as const } : f,
          ),
        );
        return true;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setFiles((current) =>
        current.map((f) =>
          f.file === uploadFile.file ? { ...f, error: errorMessage, status: 'error' as const } : f,
        ),
      );
      return false;
    }
  };

  const handleUpload = async (values: typeof form.values) => {
    if (files.length === 0) {
      notifications.show({
        color: 'red',
        message: 'Please select files to upload',
        title: 'No Files Selected',
      });
      return;
    }

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
      if (file.status === 'pending') {
        const success = await uploadFile(file, values);
        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
      }
    }

    setUploading(false);

    if (successCount > 0) {
      notifications.show({
        color: 'green',
        message: `Successfully uploaded ${successCount} assets`,
        title: 'Upload Complete',
      });
    }

    if (errorCount > 0) {
      notifications.show({
        color: 'red',
        message: `Failed to upload ${errorCount} assets`,
        title: 'Upload Errors',
      });
    }

    if (successCount === files.length) {
      // All files uploaded successfully, close modal
      handleClose();
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFiles([]);
      form.reset();
      close();
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <IconPhoto size={20} />;
    }
    if (file.type.startsWith('video/')) {
      return <IconVideo size={20} />;
    }
    return <IconFile size={20} />;
  };

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return 'gray';
      case 'uploading':
        return 'blue';
      case 'completed':
        return 'green';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <>
      <Button leftSection={<IconUpload size={16} />} onClick={open}>
        Upload Assets
      </Button>

      <Modal
        closeOnClickOutside={!uploading}
        closeOnEscape={!uploading}
        onClose={handleClose}
        opened={opened}
        size="lg"
        title="Upload Product Assets"
      >
        <form onSubmit={form.onSubmit(handleUpload)}>
          <Stack gap="md">
            {/* Upload Metadata */}
            <TextInput
              placeholder="Enter product ID"
              label="Product ID"
              required
              {...form.getInputProps('productId')}
              disabled={uploading}
            />

            <Select
              data={ASSET_TYPE_OPTIONS}
              label="Asset Type"
              {...form.getInputProps('type')}
              disabled={uploading}
            />

            <Group grow>
              <TextInput
                placeholder="Descriptive text"
                label="Alt Text (for images)"
                {...form.getInputProps('alt')}
                disabled={uploading}
              />
              <NumberInput
                placeholder="0"
                label="Sort Order"
                min={0}
                {...form.getInputProps('sortOrder')}
                disabled={uploading}
              />
            </Group>

            <Textarea
              minRows={2}
              placeholder="Optional description"
              label="Description"
              {...form.getInputProps('description')}
              disabled={uploading}
            />

            {/* File Drop Zone */}
            <Dropzone
              onDrop={handleDrop}
              accept={[
                MIME_TYPES.png,
                MIME_TYPES.jpeg,
                MIME_TYPES.webp,
                MIME_TYPES.mp4,
                MIME_TYPES.pdf,
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              ]}
              disabled={uploading}
              maxSize={50 * 1024 * 1024} // 50MB
            >
              <Group style={{ pointerEvents: 'none' }} gap="xl" justify="center" mih={120}>
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
                    style={{ width: rem(52), color: 'var(--mantine-color-red-6)', height: rem(52) }}
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
                    Attach images, videos, documents, or manuals (max 50MB each)
                  </Text>
                </div>
              </Group>
            </Dropzone>

            {/* File List */}
            {files.length > 0 && (
              <Stack gap="xs">
                <Text fw={500} size="sm">
                  Files to Upload ({files.length})
                </Text>
                {files.map((uploadFile, index) => (
                  <Group key={index} gap="sm" justify="space-between">
                    <Group style={{ flex: 1 }} gap="sm">
                      {getFileIcon(uploadFile.file)}
                      <div style={{ flex: 1 }}>
                        <Text size="sm" truncate>
                          {uploadFile.file.name}
                        </Text>
                        <Text c="dimmed" size="xs">
                          {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                        {uploadFile.status === 'uploading' && (
                          <Progress
                            color={getStatusColor(uploadFile.status)}
                            mt={4}
                            size="xs"
                            value={uploadFile.progress}
                          />
                        )}
                        {uploadFile.status === 'error' && uploadFile.error && (
                          <Text c="red" mt={2} size="xs">
                            {uploadFile.error}
                          </Text>
                        )}
                      </div>
                    </Group>
                    {!uploading && uploadFile.status === 'pending' && (
                      <Button
                        color="red"
                        onClick={() => removeFile(index)}
                        size="xs"
                        variant="subtle"
                      >
                        Remove
                      </Button>
                    )}
                    {uploadFile.status === 'completed' && (
                      <Text c="green" fw={500} size="xs">
                        ✓ Uploaded
                      </Text>
                    )}
                    {uploadFile.status === 'error' && (
                      <Text c="red" fw={500} size="xs">
                        ✗ Failed
                      </Text>
                    )}
                  </Group>
                ))}
              </Stack>
            )}

            {/* Actions */}
            <Group justify="flex-end" mt="md">
              <Button onClick={handleClose} disabled={uploading} variant="light">
                {uploading ? 'Uploading...' : 'Cancel'}
              </Button>
              <Button
                leftSection={<IconUpload size={16} />}
                loading={uploading}
                disabled={files.length === 0 || files.every((f) => f.status === 'completed')}
                type="submit"
              >
                Upload {files.filter((f) => f.status === 'pending').length} Files
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
