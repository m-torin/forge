'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  FileButton,
  Group,
  Image,
  JsonInput,
  LoadingOverlay,
  Modal,
  MultiSelect,
  NumberInput,
  Progress,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconArticle,
  IconBox,
  IconBrandTailwind,
  IconCategory,
  IconCheck,
  IconDeviceFloppy,
  IconFile,
  IconFolder,
  IconInfoCircle,
  IconLink,
  IconPhoto,
  IconStar,
  IconTag,
  IconUpload,
  IconUser,
  IconVideo,
} from '@tabler/icons-react';
import { z } from 'zod';

import { usePimForm } from '@/hooks/pim3/usePimForm';
import { useMediaValidation } from '@/hooks/pim3/useAsyncValidation';
import { useFormDataLoading } from '@/hooks/pim3/useFormLoading';
import {
  createMediaWithAssociationAction,
  updateMediaWithAssociationAction,
  getMediaWithAssociationAction,
  findManyProductsAction,
  getCollectionsAction,
  getBrandsAction,
  getTaxonomiesAction,
  getCategoriesAction,
  findManyArticlesAction,
  getReviewsAction,
  getPdpJoinsAction,
  MediaType,
} from '@repo/database/prisma';

// Enhanced media schema with comprehensive validation
const mediaFormSchema = z
  .object({
    // Core media fields
    url: z.string().min(1, 'URL is required').url('Must be a valid URL'),
    altText: z.string().optional(),
    type: z
      .enum(['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO', 'MANUAL', 'SPECIFICATION', 'CERTIFICATE'])
      .default('IMAGE'),

    // Technical metadata
    width: z.number().min(1).optional(),
    height: z.number().min(1).optional(),
    size: z.number().min(0).optional(), // File size in bytes
    mimeType: z.string().optional(),
    sortOrder: z.number().min(0).default(0),

    // Content
    copy: z
      .string()
      .refine((val) => {
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      }, 'Must be valid JSON')
      .default('{}'),

    // Polymorphic entity association
    entityType: z
      .enum([
        'product',
        'collection',
        'brand',
        'taxonomy',
        'category',
        'article',
        'review',
        'pdpJoin',
        '',
      ])
      .default(''),
    entityId: z.string().optional(),

    // Additional metadata
    caption: z.string().optional(),
    credit: z.string().optional(),
    tags: z.array(z.string()).default([]),
  })
  .refine(
    (data) => {
      // Validate entity association consistency
      if (data.entityType && !data.entityId) {
        return false;
      }
      if (!data.entityType && data.entityId) {
        return false;
      }
      return true;
    },
    {
      message: 'Entity type and ID must be provided together',
      path: ['entityId'],
    },
  );

type MediaFormValues = z.infer<typeof mediaFormSchema>;

// Entity type configurations
const ENTITY_TYPES = [
  { value: 'product', label: 'Product', icon: IconBox, color: 'blue' },
  { value: 'collection', label: 'Collection', icon: IconFolder, color: 'green' },
  { value: 'brand', label: 'Brand', icon: IconBrandTailwind, color: 'orange' },
  { value: 'taxonomy', label: 'Taxonomy', icon: IconTag, color: 'purple' },
  { value: 'category', label: 'Category', icon: IconCategory, color: 'pink' },
  { value: 'article', label: 'Article', icon: IconArticle, color: 'cyan' },
  { value: 'review', label: 'Review', icon: IconStar, color: 'yellow' },
  { value: 'pdpJoin', label: 'PDP Join', icon: IconLink, color: 'gray' },
];

// Media type configurations
const MEDIA_TYPES = [
  { value: 'IMAGE', label: 'Image', icon: IconPhoto, accept: 'image/*' },
  { value: 'VIDEO', label: 'Video', icon: IconVideo, accept: 'video/*' },
  { value: 'DOCUMENT', label: 'Document', icon: IconFile, accept: '.pdf,.doc,.docx' },
  { value: 'AUDIO', label: 'Audio', icon: IconFile, accept: 'audio/*' },
  { value: 'MANUAL', label: 'Manual', icon: IconFile, accept: '.pdf' },
  { value: 'SPECIFICATION', label: 'Specification', icon: IconFile, accept: '.pdf,.doc,.docx' },
  { value: 'CERTIFICATE', label: 'Certificate', icon: IconFile, accept: '.pdf' },
];

interface MediaFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  opened: boolean;
  mediaId?: string | null;
  initialEntityType?: string;
  initialEntityId?: string;
}

export function MediaForm({
  onClose,
  onSuccess,
  opened,
  mediaId,
  initialEntityType,
  initialEntityId,
}: MediaFormProps) {
  const [activeTab, setActiveTab] = useState<string | null>('upload');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const isEditing = !!mediaId;
  const asyncValidation = useMediaValidation(mediaId);

  const { options, loading: optionsLoading } = useFormDataLoading({
    products: () => findManyProductsAction({ take: 200 }),
    collections: () => getCollectionsAction({ limit: 200 }),
    brands: () => getBrandsAction({ limit: 200 }),
    taxonomies: () => getTaxonomiesAction({ limit: 200 }),
    categories: () => getCategoriesAction({ includeDeleted: false }),
    articles: () => findManyArticlesAction({ take: 200 }),
    reviews: () => getReviewsAction({ limit: 200 }),
    pdpJoins: () => getPdpJoinsAction({ limit: 200 }),
  });

  // Auto-save function for drafts
  const autoSaveMedia = async (values: MediaFormValues) => {
    if (!isEditing) return;

    const transformedValues = (await form.options.transformOnSubmit?.(values)) || values;
    await updateMediaWithAssociationAction({
      where: { id: mediaId! },
      data: transformedValues,
    });
  };

  const form = usePimForm({
    schema: mediaFormSchema,
    initialValues: {
      url: '',
      altText: '',
      type: MediaType.IMAGE,
      width: undefined,
      height: undefined,
      size: undefined,
      mimeType: '',
      sortOrder: 0,
      copy: '{}',
      entityType: (initialEntityType as any) || '',
      entityId: initialEntityId || '',
      caption: '',
      credit: '',
      tags: [],
    },
    asyncValidation: {
      url: asyncValidation.url,
    },
    autoSave: {
      enabled: isEditing,
      delay: 3000,
      onSave: autoSaveMedia,
    },
    crossFieldValidation: [
      {
        fields: ['type', 'mimeType'],
        validator: ({ type, mimeType }) => {
          if (!mimeType) return null;

          const typeMap: Record<string, string[]> = {
            IMAGE: ['image/'],
            VIDEO: ['video/'],
            AUDIO: ['audio/'],
            DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats'],
          };

          const validPrefixes = typeMap[type] || [];
          const isValid = validPrefixes.some((prefix) => mimeType.startsWith(prefix));

          if (!isValid && validPrefixes.length > 0) {
            return `MIME type doesn't match media type ${type}`;
          }
          return null;
        },
        errorField: 'mimeType',
      },
    ],
    watchers: {
      url: (url) => {
        // Update preview URL when URL changes
        if (url && (form.values.type === 'IMAGE' || form.values.type === 'VIDEO')) {
          setPreviewUrl(url);
        } else {
          setPreviewUrl('');
        }
      },
      entityType: (entityType) => {
        // Clear entity ID when type changes
        if (entityType !== form.values.entityType) {
          form.setFieldValue('entityId', '');
        }
      },
    },
    persistence: {
      key: `media-form-${mediaId || 'new'}`,
      enabled: true,
      ttl: 2 * 60 * 60 * 1000, // 2 hours
    },
    transformOnSubmit: async (values) => {
      const data: any = {
        url: values.url,
        altText: values.altText,
        type: values.type,
        width: values.width,
        height: values.height,
        size: values.size,
        mimeType: values.mimeType,
        sortOrder: values.sortOrder,
        copy: JSON.parse(values.copy),
      };

      // Handle polymorphic association
      if (values.entityType && values.entityId) {
        const entityFieldMap: Record<string, string> = {
          product: 'productId',
          collection: 'collectionId',
          brand: 'brandId',
          taxonomy: 'taxonomyId',
          category: 'categoryId',
          article: 'articleId',
          review: 'reviewId',
          pdpJoin: 'pdpJoinId',
        };

        const fieldName = entityFieldMap[values.entityType];
        if (fieldName) {
          data[fieldName] = values.entityId;
        }
      }

      return data;
    },
    dirtyTracking: true,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  // Load media data when editing
  useEffect(() => {
    if (opened && isEditing && mediaId) {
      loadMediaData(mediaId);
    }
  }, [opened, isEditing, mediaId]);

  const loadMediaData = async (id: string) => {
    try {
      const media = await getMediaWithAssociationAction({ mediaId: id });

      if (media) {
        // Determine entity type and ID from polymorphic associations
        let entityType = '';
        let entityId = '';

        if (media.productId) {
          entityType = 'product';
          entityId = media.productId;
        } else if (media.collectionId) {
          entityType = 'collection';
          entityId = media.collectionId;
        } else if (media.brandId) {
          entityType = 'brand';
          entityId = media.brandId;
        } else if (media.taxonomyId) {
          entityType = 'taxonomy';
          entityId = media.taxonomyId;
        } else if (media.categoryId) {
          entityType = 'category';
          entityId = media.categoryId;
        } else if (media.articleId) {
          entityType = 'article';
          entityId = media.articleId;
        } else if (media.reviewId) {
          entityType = 'review';
          entityId = media.reviewId;
        } else if (media.pdpJoinId) {
          entityType = 'pdpJoin';
          entityId = media.pdpJoinId;
        }

        form.setValues({
          url: media.url,
          altText: media.altText || '',
          type: media.type,
          width: media.width || undefined,
          height: media.height || undefined,
          size: media.size || undefined,
          mimeType: media.mimeType || '',
          sortOrder: media.sortOrder || 0,
          copy: JSON.stringify(media.copy || {}, null, 2),
          entityType: entityType as any,
          entityId: entityId,
          caption: media.copy?.caption || '',
          credit: media.copy?.credit || '',
          tags: media.copy?.tags || [],
        });
      }
    } catch (error) {
      console.error('Failed to load media:', error);
    }
  };

  const getEntityOptions = () => {
    const entityOptionsMap: Record<string, any[]> = {
      product:
        options.products?.map((p: any) => ({
          value: p.id,
          label: `${p.name} (${p.sku})`,
          group: p.status,
        })) || [],
      collection:
        options.collections?.map((c: any) => ({
          value: c.id,
          label: `${c.name} (${c.type})`,
          group: c.type,
        })) || [],
      brand:
        options.brands?.map((b: any) => ({
          value: b.id,
          label: `${b.name} (${b.type})`,
          group: b.type,
        })) || [],
      taxonomy:
        options.taxonomies?.map((t: any) => ({
          value: t.id,
          label: `${t.name} (${t.type})`,
          group: t.type,
        })) || [],
      category:
        options.categories?.map((c: any) => ({
          value: c.id,
          label: c.name,
          group: c.status,
        })) || [],
      article:
        options.articles?.map((a: any) => ({
          value: a.id,
          label: a.title,
        })) || [],
      review:
        options.reviews?.map((r: any) => ({
          value: r.id,
          label: r.title || `Review by ${r.user?.name || 'Unknown'}`,
        })) || [],
      pdpJoin:
        options.pdpJoins?.map((p: any) => ({
          value: p.id,
          label: `${p.product?.name || 'Unknown'} @ ${p.brand?.name || 'Unknown'}`,
        })) || [],
    };

    return entityOptionsMap[form.values.entityType] || [];
  };

  const handleSubmit = form.handleSubmit(async (values: MediaFormValues) => {
    const action = isEditing ? updateMediaWithAssociationAction : createMediaWithAssociationAction;
    const payload = isEditing ? { where: { id: mediaId! }, data: values } : { data: values };

    return action(payload);
  });

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;

    // Simulate file upload with progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Extract file metadata
    form.setFieldValue('mimeType', file.type);
    form.setFieldValue('size', file.size);

    // For images, create a preview URL
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        form.setFieldValue('url', dataUrl); // In production, this would be the uploaded URL
        setPreviewUrl(dataUrl);
      };
      reader.readAsDataURL(file);
    }

    // Extract dimensions for images
    if (file.type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => {
        form.setFieldValue('width', img.width);
        form.setFieldValue('height', img.height);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const getEntityIcon = (type: string) => {
    const config = ENTITY_TYPES.find((t) => t.value === type);
    return config ? <config.icon size={16} /> : <IconUser size={16} />;
  };

  const getEntityColor = (type: string) => {
    const config = ENTITY_TYPES.find((t) => t.value === type);
    return config?.color || 'gray';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <Group>
          <IconPhoto size={24} />
          <Title order={3}>{isEditing ? 'Edit Media' : 'Upload Media'}</Title>
          {form.isDirty && (
            <Badge color="yellow" size="sm">
              Unsaved Changes
            </Badge>
          )}
          {form.isAutoSaving && (
            <Badge color="blue" size="sm">
              Auto-saving...
            </Badge>
          )}
        </Group>
      }
    >
      <LoadingOverlay visible={form.isSubmitting || optionsLoading} />

      {/* Auto-save status */}
      {isEditing && (
        <Alert icon={<IconDeviceFloppy size={16} />} color="blue" variant="light" mb="md">
          <Group justify="space-between">
            <Text size="sm">Auto-save enabled</Text>
            {form.isDirty ? (
              <Badge color="yellow" size="sm">
                Changes pending
              </Badge>
            ) : (
              <Badge color="green" size="sm">
                Saved
              </Badge>
            )}
          </Group>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="upload" leftSection={<IconUpload size={16} />}>
              Upload & URL
            </Tabs.Tab>
            <Tabs.Tab value="metadata" leftSection={<IconInfoCircle size={16} />}>
              Metadata
            </Tabs.Tab>
            <Tabs.Tab value="association" leftSection={<IconLink size={16} />}>
              Entity Association
            </Tabs.Tab>
            <Tabs.Tab value="preview" leftSection={<IconPhoto size={16} />}>
              Preview
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="upload" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Media Source</Title>

                  {/* File upload with preview */}
                  <FileButton
                    onChange={handleFileSelect}
                    accept={MEDIA_TYPES.find((t) => t.value === form.values.type)?.accept}
                  >
                    {(props) => (
                      <Button
                        {...props}
                        variant="light"
                        leftSection={<IconUpload size={16} />}
                        disabled={isEditing}
                      >
                        Select file to upload
                      </Button>
                    )}
                  </FileButton>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <Progress
                      value={uploadProgress}
                      label={`${uploadProgress}%`}
                      color="blue"
                      animate
                    />
                  )}

                  <TextInput
                    label="Media URL"
                    placeholder="https://example.com/media/image.jpg"
                    required
                    description="Direct URL to the media file"
                    leftSection={<IconLink size={16} />}
                    {...form.getInputProps('url')}
                  />

                  <Select
                    label="Media Type"
                    required
                    description="Select the type of media"
                    data={MEDIA_TYPES.map((type) => ({
                      value: type.value,
                      label: type.label,
                    }))}
                    leftSection={
                      MEDIA_TYPES.find((t) => t.value === form.values.type)?.icon &&
                      React.createElement(
                        MEDIA_TYPES.find((t) => t.value === form.values.type)!.icon,
                        { size: 16 },
                      )
                    }
                    {...form.getInputProps('type')}
                  />
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Technical Details</Title>

                  <Group grow>
                    <NumberInput
                      label="Width (px)"
                      placeholder="1920"
                      description="Image/video width"
                      min={1}
                      {...form.getInputProps('width')}
                    />
                    <NumberInput
                      label="Height (px)"
                      placeholder="1080"
                      description="Image/video height"
                      min={1}
                      {...form.getInputProps('height')}
                    />
                  </Group>

                  <Group grow>
                    <NumberInput
                      label="File Size"
                      placeholder="0"
                      description={formatFileSize(form.values.size)}
                      min={0}
                      {...form.getInputProps('size')}
                    />
                    <TextInput
                      label="MIME Type"
                      placeholder="image/jpeg"
                      description="File content type"
                      {...form.getInputProps('mimeType')}
                    />
                  </Group>

                  <NumberInput
                    label="Sort Order"
                    placeholder="0"
                    description="Order for display in galleries"
                    min={0}
                    {...form.getInputProps('sortOrder')}
                  />
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="metadata" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Media Information</Title>

                  <TextInput
                    label="Alt Text"
                    placeholder="Descriptive text for accessibility"
                    description="Important for SEO and screen readers"
                    {...form.getInputProps('altText')}
                  />

                  <TextInput
                    label="Caption"
                    placeholder="Caption for the media"
                    description="Displayed below the media"
                    {...form.getInputProps('caption')}
                  />

                  <TextInput
                    label="Credit"
                    placeholder="Photo by John Doe"
                    description="Attribution or copyright information"
                    {...form.getInputProps('credit')}
                  />

                  <MultiSelect
                    label="Tags"
                    placeholder="Add tags"
                    description="Categorize media with tags"
                    data={form.values.tags}
                    searchable
                    creatable
                    clearable
                    {...form.getInputProps('tags')}
                  />
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Additional Content</Title>

                  <JsonInput
                    label="Media Metadata (JSON)"
                    placeholder='{\n  "source": "unsplash",\n  "license": "CC0"\n}'
                    description="Store additional metadata as JSON"
                    formatOnBlur
                    autosize
                    minRows={4}
                    maxRows={10}
                    validationError="Invalid JSON format"
                    {...form.getInputProps('copy')}
                  />
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="association" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Polymorphic Entity Association</Title>
                  <Text size="sm" c="dimmed">
                    Link this media to any entity in the system. The media will be automatically
                    associated when saved.
                  </Text>

                  <Select
                    label="Entity Type"
                    placeholder="Select entity type to associate"
                    description="Choose what type of entity to link to"
                    clearable
                    data={ENTITY_TYPES.map((type) => ({
                      value: type.value,
                      label: type.label,
                    }))}
                    leftSection={getEntityIcon(form.values.entityType)}
                    {...form.getInputProps('entityType')}
                  />

                  {form.values.entityType && (
                    <>
                      <Select
                        label={`Select ${ENTITY_TYPES.find((t) => t.value === form.values.entityType)?.label}`}
                        placeholder={`Choose a specific ${form.values.entityType}`}
                        description="Search and select the entity to associate"
                        data={getEntityOptions()}
                        searchable
                        clearable
                        maxDropdownHeight={300}
                        {...form.getInputProps('entityId')}
                      />

                      {form.values.entityId && (
                        <Alert
                          icon={getEntityIcon(form.values.entityType)}
                          color={getEntityColor(form.values.entityType)}
                          variant="light"
                        >
                          <Text size="sm">
                            Media will be associated with {form.values.entityType} ID:{' '}
                            {form.values.entityId}
                          </Text>
                        </Alert>
                      )}
                    </>
                  )}
                </Stack>
              </Card>

              {!form.values.entityType && (
                <Alert icon={<IconInfoCircle size={16} />} color="gray">
                  <Text size="sm">
                    Media can be associated with Products, Collections, Brands, Taxonomies,
                    Categories, Articles, Reviews, or PDP Joins. You can also upload media without
                    association and link it later.
                  </Text>
                </Alert>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="preview" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Media Preview</Title>

                  {previewUrl && form.values.type === 'IMAGE' ? (
                    <>
                      <Image
                        src={previewUrl}
                        alt={form.values.altText || 'Media preview'}
                        fit="contain"
                        mah={400}
                        radius="md"
                        withPlaceholder
                        placeholder={
                          <Text size="sm" c="dimmed">
                            Loading preview...
                          </Text>
                        }
                      />

                      {form.values.width && form.values.height && (
                        <Group>
                          <Badge variant="light">
                            {form.values.width} × {form.values.height}px
                          </Badge>
                          {form.values.size && (
                            <Badge variant="light">{formatFileSize(form.values.size)}</Badge>
                          )}
                          {form.values.mimeType && (
                            <Badge variant="light">{form.values.mimeType}</Badge>
                          )}
                        </Group>
                      )}
                    </>
                  ) : form.values.type === 'VIDEO' && previewUrl ? (
                    <video
                      src={previewUrl}
                      controls
                      style={{ maxHeight: 400, width: '100%', borderRadius: 8 }}
                    />
                  ) : (
                    <Alert icon={<IconInfoCircle size={16} />} color="gray">
                      <Text size="sm">
                        {form.values.url
                          ? `Preview not available for ${form.values.type} type`
                          : 'Enter a URL or upload a file to see preview'}
                      </Text>
                    </Alert>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Divider my="md" />

        <Group justify="space-between">
          <Group>
            <Text size="sm" c="dimmed">
              {isEditing ? 'Updating media' : 'Uploading new media'}
            </Text>
            {form.isDirty && (
              <Badge color="yellow" size="sm">
                Unsaved changes
              </Badge>
            )}
          </Group>

          <Group>
            <Button
              variant="light"
              onClick={() => {
                if (form.isDirty && !form.warnUnsavedChanges()) {
                  return;
                }
                onClose();
              }}
            >
              Cancel
            </Button>

            <Button type="submit" loading={form.isSubmitting} leftSection={<IconCheck size={16} />}>
              {isEditing ? 'Update Media' : 'Upload Media'}
            </Button>
          </Group>
        </Group>

        {/* Show validation errors */}
        {Object.keys(form.errors).length > 0 && (
          <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light" mt="md">
            <Text size="sm" fw={500}>
              Please fix the following errors:
            </Text>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1rem' }}>
              {Object.entries(form.errors).map(([field, error]) => (
                <li key={field}>
                  <Text size="sm">
                    {field}: {error}
                  </Text>
                </li>
              ))}
            </ul>
          </Alert>
        )}
      </form>
    </Modal>
  );
}
