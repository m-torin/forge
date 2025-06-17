'use client';

import {
  Button,
  Card,
  Divider,
  FileInput,
  Group,
  LoadingOverlay,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconArticle,
  IconBox,
  IconBrandTailwind,
  IconCategory,
  IconCheck,
  IconFolder,
  IconPhoto,
  IconStar,
  IconTag,
  IconUpload,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import {
  createMediaAction,
  updateMediaAction,
  getProductsAction,
  getCollectionsAction,
  getBrandsAction,
  getTaxonomiesAction,
  getCategoriesAction,
  getArticlesAction,
  getReviewsAction,
} from '@repo/database/prisma';

import { MediaType } from '@repo/database/prisma';

interface MediaFormEnhancedProps {
  onClose: () => void;
  onSuccess: () => void;
  opened: boolean;
  mediaId?: string | null;
  initialEntityType?: string;
  initialEntityId?: string;
}

export function MediaFormEnhanced({
  onClose,
  onSuccess,
  opened,
  mediaId,
  initialEntityType,
  initialEntityId,
}: MediaFormEnhancedProps) {
  const [loading, setLoading] = useState(false);

  // Entity options
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [taxonomies, setTaxonomies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  const isEditing = !!mediaId;

  const form = useForm({
    initialValues: {
      // Basic information
      url: '',
      altText: '',
      type: 'IMAGE' as MediaType,

      // Technical details
      width: undefined as number | undefined,
      height: undefined as number | undefined,
      size: undefined as number | undefined,
      mimeType: '',

      // Entity association
      entityType: initialEntityType || '',
      entityId: initialEntityId || '',

      // Description
      description: '',
    },

    validate: {
      url: (value) => {
        if (!value) return 'URL is required';
        try {
          new URL(value);
          return null;
        } catch {
          return 'Invalid URL';
        }
      },
      entityType: (value, values) => {
        if (values.entityId && !value) {
          return 'Entity type is required when entity is selected';
        }
        return null;
      },
      entityId: (value, values) => {
        if (values.entityType && !value) {
          return 'Entity is required when entity type is selected';
        }
        return null;
      },
    },
  });

  // Load entity options
  useEffect(() => {
    if (opened) {
      loadEntityOptions();
    }
  }, [opened]);

  const loadEntityOptions = async () => {
    try {
      const [
        productsRes,
        collectionsRes,
        brandsRes,
        taxonomiesRes,
        categoriesRes,
        articlesRes,
        reviewsRes,
      ] = await Promise.all([
        getProductsAction({ limit: 100, page: 1 }),
        getCollectionsAction({ limit: 100 }),
        getBrandsAction({ limit: 100 }),
        getTaxonomiesAction({ limit: 100 }),
        getCategoriesAction({ includeDeleted: false }),
        getArticlesAction({ limit: 100 }),
        getReviewsAction({ limit: 100 }),
      ]);

      setProducts(productsRes.data || []);
      setCollections(collectionsRes.data || []);
      setBrands(brandsRes.data || []);
      setTaxonomies(taxonomiesRes.data || []);
      setCategories(categoriesRes.data || []);
      setArticles(articlesRes.data || []);
      setReviews(reviewsRes.data || []);
    } catch (error) {
      console.error('Failed to load entity options:', error);
    }
  };

  const getEntityOptions = () => {
    switch (form.values.entityType) {
      case 'product':
        return products.map((p: any) => ({
          value: p.id,
          label: `${p.name} (${p.sku})`,
        }));
      case 'collection':
        return collections.map((c) => ({
          value: c.id,
          label: `${c.name} (${c.type})`,
        }));
      case 'brand':
        return brands.map((b) => ({
          value: b.id,
          label: `${b.name} (${b.type})`,
        }));
      case 'taxonomy':
        return taxonomies.map((t) => ({
          value: t.id,
          label: `${t.name} (${t.type})`,
        }));
      case 'category':
        return categories.map((c) => ({
          value: c.id,
          label: c.name,
        }));
      case 'article':
        return articles.map((a) => ({
          value: a.id,
          label: a.title,
        }));
      case 'review':
        return reviews.map((r) => ({
          value: r.id,
          label: r.title || `Review by ${r.user?.name || 'Unknown'}`,
        }));
      default:
        return [];
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    try {
      // Build data object with proper entity association
      const data: any = {
        url: values.url,
        altText: values.altText,
        type: values.type,
        width: values.width,
        height: values.height,
        size: values.size,
        mimeType: values.mimeType,
      };

      // Set the correct entity field based on entity type
      if (values.entityType && values.entityId) {
        switch (values.entityType) {
          case 'product':
            data.productId = values.entityId;
            break;
          case 'collection':
            data.collectionId = values.entityId;
            break;
          case 'brand':
            data.brandId = values.entityId;
            break;
          case 'taxonomy':
            data.taxonomyId = values.entityId;
            break;
          case 'category':
            data.categoryId = values.entityId;
            break;
          case 'article':
            data.articleId = values.entityId;
            break;
          case 'review':
            data.reviewId = values.entityId;
            break;
        }
      }

      let result;
      if (isEditing && mediaId) {
        result = await updateMediaAction(mediaId, data);
      } else {
        result = await createMediaAction(data);
      }

      if (result) {
        notifications.show({
          title: 'Success',
          message: `Media ${isEditing ? 'updated' : 'created'} successfully`,
          color: 'green',
          icon: <IconCheck />,
        });
        onSuccess();
        form.reset();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || `Failed to ${isEditing ? 'update' : 'create'} media`,
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File | null) => {
    if (file) {
      // In a real implementation, you would upload the file and get the URL
      // For now, we'll just show a notification
      notifications.show({
        title: 'File selected',
        message: 'In production, this would upload the file and generate a URL',
        color: 'blue',
      });

      // Set some mock data
      form.setFieldValue('mimeType', file.type);
      form.setFieldValue('size', file.size);
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <IconBox size={16} />;
      case 'collection':
        return <IconFolder size={16} />;
      case 'brand':
        return <IconBrandTailwind size={16} />;
      case 'taxonomy':
        return <IconTag size={16} />;
      case 'category':
        return <IconCategory size={16} />;
      case 'article':
        return <IconArticle size={16} />;
      case 'review':
        return <IconStar size={16} />;
      default:
        return <IconUser size={16} />;
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      title={
        <Group>
          <IconPhoto size={24} />
          <Title order={3}>{isEditing ? 'Edit Media' : 'Upload Media'}</Title>
        </Group>
      }
    >
      <LoadingOverlay visible={loading} />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Card>
            <Stack>
              <Title order={5}>Media File</Title>

              <FileInput
                label="Select file"
                placeholder="Click to select a file"
                accept="image/*,video/*,application/pdf"
                leftSection={<IconUpload size={16} />}
                onChange={handleFileSelect}
                disabled={isEditing}
              />

              <TextInput
                label="Media URL"
                placeholder="https://example.com/image.jpg"
                required
                description="Direct URL to the media file"
                {...form.getInputProps('url')}
              />

              <Select
                label="Media Type"
                required
                data={[
                  { value: 'IMAGE', label: 'Image' },
                  { value: 'VIDEO', label: 'Video' },
                  { value: 'DOCUMENT', label: 'Document' },
                  { value: 'AUDIO', label: 'Audio' },
                  { value: 'OTHER', label: 'Other' },
                ]}
                {...form.getInputProps('type')}
              />
            </Stack>
          </Card>

          <Card>
            <Stack>
              <Title order={5}>Media Details</Title>

              <TextInput
                label="Alt Text"
                placeholder="Descriptive text for accessibility"
                description="Important for SEO and accessibility"
                {...form.getInputProps('altText')}
              />

              <Textarea
                label="Description"
                placeholder="Additional description or notes"
                minRows={2}
                {...form.getInputProps('description')}
              />

              <Group grow>
                <NumberInput
                  label="Width (px)"
                  placeholder="1920"
                  min={0}
                  {...form.getInputProps('width')}
                />
                <NumberInput
                  label="Height (px)"
                  placeholder="1080"
                  min={0}
                  {...form.getInputProps('height')}
                />
              </Group>

              <Group grow>
                <NumberInput
                  label="File Size (bytes)"
                  placeholder="1048576"
                  min={0}
                  {...form.getInputProps('size')}
                />
                <TextInput
                  label="MIME Type"
                  placeholder="image/jpeg"
                  {...form.getInputProps('mimeType')}
                />
              </Group>
            </Stack>
          </Card>

          <Card>
            <Stack>
              <Title order={5}>Entity Association</Title>
              <Text size="sm" c="dimmed">
                Associate this media with a specific entity
              </Text>

              <Select
                label="Entity Type"
                placeholder="Select entity type"
                clearable
                data={[
                  { value: 'product', label: 'Product' },
                  { value: 'collection', label: 'Collection' },
                  { value: 'brand', label: 'Brand' },
                  { value: 'taxonomy', label: 'Taxonomy' },
                  { value: 'category', label: 'Category' },
                  { value: 'article', label: 'Article' },
                  { value: 'review', label: 'Review' },
                ]}
                leftSection={getEntityIcon(form.values.entityType)}
                {...form.getInputProps('entityType')}
                onChange={(value) => {
                  form.setFieldValue('entityType', value || '');
                  form.setFieldValue('entityId', '');
                }}
              />

              {form.values.entityType && (
                <Select
                  label={`Select ${form.values.entityType}`}
                  placeholder={`Choose a ${form.values.entityType}`}
                  data={getEntityOptions()}
                  searchable
                  clearable
                  {...form.getInputProps('entityId')}
                />
              )}
            </Stack>
          </Card>
        </Stack>

        <Divider my="md" />

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {isEditing ? 'Update Media' : 'Upload Media'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
