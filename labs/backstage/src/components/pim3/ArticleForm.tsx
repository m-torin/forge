'use client';

import {
  Modal,
  Stack,
  Group,
  Button,
  TextInput,
  Select,
  Text,
  LoadingOverlay,
  Tabs,
  JsonInput,
  ActionIcon,
  HoverCard,
  Alert,
} from '@mantine/core';
import {
  IconArticle,
  IconCode,
  IconRefresh,
  IconCheck,
  IconX,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useForm, zodResolver } from '@mantine/form';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';

import { createArticle, updateArticle } from '@/actions/pim3/actions';
import { ContentStatus } from '@repo/database/prisma';

const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  content: z.string().default('{}'),
  status: z.nativeEnum(ContentStatus, {
    required_error: 'Status is required',
  }),
});

interface ArticleFormProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  articleId?: string | null;
  mode?: 'create' | 'edit' | 'view';
  initialData?: any;
}

export function ArticleForm({
  opened,
  onClose,
  onSuccess,
  articleId,
  mode = 'create',
  initialData,
}: ArticleFormProps) {
  const [loading, setLoading] = useState(false);
  const [articleData, setArticleData] = useState<any>(initialData || null);

  const form = useForm({
    validate: zodResolver(articleSchema),
    initialValues: {
      title: '',
      slug: '',
      content: '{}',
      status: ContentStatus.DRAFT,
    },
  });

  // Load article data when editing
  useEffect(() => {
    if (opened && initialData) {
      setArticleData(initialData);
      form.setValues({
        title: initialData.title || '',
        slug: initialData.slug || '',
        content:
          typeof initialData.content === 'object'
            ? JSON.stringify(initialData.content, null, 2)
            : initialData.content || '{}',
        status: initialData.status || 'DRAFT',
      });
    } else if (opened && !initialData && !articleId) {
      form.reset();
      form.setValues({
        title: '',
        slug: '',
        content: '{}',
        status: 'DRAFT',
      });
    }
  }, [opened, initialData, articleId]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      // Parse JSON content
      let parsedContent = {};
      try {
        parsedContent = JSON.parse(values.content || '{}');
      } catch {
        notifications.show({
          title: 'Invalid JSON',
          message: 'Content must be valid JSON',
          color: 'red',
        });
        return;
      }

      const data = {
        title: values.title,
        slug: values.slug,
        content: parsedContent,
        status: values.status,
      };

      let result;
      if (articleId && mode === 'edit') {
        result = await updateArticle(articleId, data);
      } else {
        result = await createArticle(data);
      }

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: articleId ? 'Article updated successfully' : 'Article created successfully',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
        onSuccess?.();
        onClose();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to save article',
          color: 'red',
          icon: <IconX size={16} />,
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save article',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    if (mode === 'view') return 'View Article';
    if (articleId) return 'Edit Article';
    return 'Create Article';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'green';
      case 'DRAFT':
        return 'gray';
      case 'ARCHIVED':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={getModalTitle()} size="xl">
      <LoadingOverlay visible={loading} />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Tabs defaultValue="basic">
          <Tabs.List>
            <Tabs.Tab value="basic" leftSection={<IconArticle size={16} />}>
              Basic Info
            </Tabs.Tab>
            <Tabs.Tab value="content" leftSection={<IconCode size={16} />}>
              Content
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pt="md">
            <Stack>
              <TextInput
                label="Title"
                placeholder="Article title"
                required
                withAsterisk
                rightSection={
                  <HoverCard width={200} shadow="md">
                    <HoverCard.Target>
                      <ActionIcon
                        variant="subtle"
                        onClick={() => {
                          const slug = generateSlug(form.values.title);
                          form.setFieldValue('slug', slug);
                        }}
                      >
                        <IconRefresh size={16} />
                      </ActionIcon>
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                      <Text size="sm">Generate slug from title</Text>
                    </HoverCard.Dropdown>
                  </HoverCard>
                }
                {...form.getInputProps('title')}
                disabled={mode === 'view'}
              />

              <TextInput
                label="URL Slug"
                placeholder="article-slug"
                required
                withAsterisk
                {...form.getInputProps('slug')}
                disabled={mode === 'view'}
              />

              <Select
                label="Status"
                placeholder="Select status"
                required
                data={[
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'PUBLISHED', label: 'Published' },
                  { value: 'ARCHIVED', label: 'Archived' },
                ]}
                {...form.getInputProps('status')}
                disabled={mode === 'view'}
              />

              {mode === 'view' && articleData && (
                <Alert color="blue" icon={<IconArticle size={16} />}>
                  <Stack gap="xs">
                    <Text size="sm">
                      <strong>Created:</strong> {new Date(articleData.createdAt).toLocaleString()}
                    </Text>
                    <Text size="sm">
                      <strong>Updated:</strong> {new Date(articleData.updatedAt).toLocaleString()}
                    </Text>
                    {articleData.user && (
                      <Text size="sm">
                        <strong>Author:</strong> {articleData.user.name} ({articleData.user.email})
                      </Text>
                    )}
                    {articleData.media && articleData.media.length > 0 && (
                      <Text size="sm">
                        <strong>Media Files:</strong> {articleData.media.length} attached
                      </Text>
                    )}
                  </Stack>
                </Alert>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="content" pt="md">
            <Stack>
              <Text size="sm" c="dimmed">
                Article content in JSON format. This can store any structured content data.
              </Text>

              <JsonInput
                label="Content (JSON)"
                placeholder='{ "blocks": [] }'
                autosize
                minRows={10}
                maxRows={20}
                formatOnBlur
                validationError="Invalid JSON format"
                styles={{
                  input: {
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace',
                    fontSize: '13px',
                  },
                }}
                {...form.getInputProps('content')}
                disabled={mode === 'view'}
              />

              {mode === 'view' && (
                <Alert icon={<IconAlertCircle size={16} />} color="blue">
                  <Text size="sm">
                    This content is displayed in read-only mode. Switch to edit mode to make
                    changes.
                  </Text>
                </Alert>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Group justify="space-between" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            {mode === 'view' ? 'Close' : 'Cancel'}
          </Button>

          {mode !== 'view' && (
            <Button
              type="submit"
              loading={loading}
              leftSection={articleId ? <IconCheck size={16} /> : <IconArticle size={16} />}
            >
              {articleId ? 'Update Article' : 'Create Article'}
            </Button>
          )}
        </Group>
      </form>
    </Modal>
  );
}
