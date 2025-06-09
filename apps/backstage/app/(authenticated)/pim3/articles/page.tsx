'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Drawer,
  Group,
  HoverCard,
  JsonInput,
  LoadingOverlay,
  Menu,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconArticle,
  IconCheck,
  IconCode,
  IconCopy,
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import {
  createArticle,
  deleteArticle,
  duplicateArticle,
  getArticles,
  updateArticle,
} from './actions';

import type { ContentStatus } from '@repo/database/prisma';

interface Article {
  content: any;
  createdAt: Date;
  id: string;
  media?: { url: string; altText?: string | null }[];
  slug: string;
  status: ContentStatus;
  title: string;
  updatedAt: Date;
  user?: { name: string; email: string } | null;
}

interface ArticleFormData {
  content: string;
  slug: string;
  status: ContentStatus;
  title: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [drawerOpened, { close: closeDrawer, open: openDrawer }] = useDisclosure(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [debouncedSearch] = useDebouncedValue(search, 200);

  const form = useForm<ArticleFormData>({
    validate: {
      slug: (value) => {
        if (!value) return 'Slug is required';
        if (!/^[a-z0-9-]+$/.test(value))
          return 'Slug must contain only lowercase letters, numbers, and hyphens';
        return null;
      },
      title: (value) => (!value ? 'Title is required' : null),
    },
    initialValues: {
      content: '{}',
      slug: '',
      status: 'DRAFT' as ContentStatus,
      title: '',
    },
  });

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const articlesData = await getArticles();
      setArticles(articlesData);
    } catch (err) {
      notifications.show({ color: 'red', message: 'Failed to load articles' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (article: Article) => {
    setSelectedArticle(article);
    setIsCreating(false);
    form.setValues({
      content: JSON.stringify(article.content, null, 2),
      slug: article.slug,
      status: article.status,
      title: article.title,
    });
    openDrawer();
  };

  const handleCreate = () => {
    setSelectedArticle(null);
    setIsCreating(true);
    form.reset();
    openDrawer();
  };

  const handleSubmit = async (values: ArticleFormData) => {
    setIsSaving(true);
    try {
      let parsedContent = {};
      try {
        parsedContent = JSON.parse(values.content || '{}');
      } catch {
        parsedContent = {};
      }

      const data = {
        content: parsedContent,
        slug: values.slug,
        status: values.status,
        title: values.title,
      };

      if (isCreating) {
        await createArticle(data);
      } else if (selectedArticle) {
        await updateArticle(selectedArticle.id, data);
      }

      notifications.show({
        color: 'green',
        icon: <IconCheck size={16} />,
        message: isCreating ? 'Article created successfully' : 'Article updated successfully',
      });

      await loadArticles();
      closeDrawer();
      form.reset();
    } catch (error) {
      notifications.show({
        color: 'red',
        icon: <IconX size={16} />,
        message: error instanceof Error ? error.message : 'Failed to save article',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const getStatusColor = (status: ContentStatus) => {
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

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      article.slug.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  return (
    <>
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Title order={2}>Articles & Content</Title>
            <Text c="dimmed">Manage blog posts, guides, and documentation</Text>
          </div>
          <Button leftSection={<IconPlus size={18} />} onClick={handleCreate}>
            Add Article
          </Button>
        </Group>

        <Card withBorder>
          <TextInput
            leftSection={<IconSearch size={16} />}
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder="Search articles..."
            value={search}
          />
        </Card>

        <Card withBorder p={0}>
          <LoadingOverlay visible={loading} />
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Article</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Author</Table.Th>
                <Table.Th>Updated</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredArticles.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Stack align="center" py="xl">
                      <ThemeIcon color="gray" size="xl" variant="light">
                        <IconArticle size={30} />
                      </ThemeIcon>
                      <Text fw={500} ta="center">
                        No articles found
                      </Text>
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filteredArticles.map((article) => (
                  <Table.Tr key={article.id}>
                    <Table.Td>
                      <div>
                        <Text fw={500}>{article.title}</Text>
                        <Text c="dimmed" size="xs">
                          /{article.slug}
                        </Text>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getStatusColor(article.status)} variant="light">
                        {article.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{article.user?.name || 'System'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text c="dimmed" size="sm">
                        {new Date(article.updatedAt).toLocaleDateString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <ActionIcon onClick={() => handleEdit(article)} variant="subtle">
                          <IconEdit size={16} />
                        </ActionIcon>
                        <Menu position="bottom-end">
                          <Menu.Target>
                            <ActionIcon variant="subtle">
                              <IconDotsVertical size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconCopy size={16} />}
                              onClick={async () => {
                                try {
                                  await duplicateArticle(article.id);
                                  notifications.show({
                                    color: 'green',
                                    message: 'Article duplicated successfully',
                                  });
                                  await loadArticles();
                                } catch {
                                  notifications.show({
                                    color: 'red',
                                    message: 'Failed to duplicate article',
                                  });
                                }
                              }}
                            >
                              Duplicate
                            </Menu.Item>
                            <Menu.Item
                              color="red"
                              leftSection={<IconTrash size={16} />}
                              onClick={async () => {
                                try {
                                  await deleteArticle(article.id);
                                  notifications.show({
                                    color: 'red',
                                    message: 'Article deleted successfully',
                                  });
                                  await loadArticles();
                                } catch {
                                  notifications.show({
                                    color: 'red',
                                    message: 'Failed to delete article',
                                  });
                                }
                              }}
                            >
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Card>
      </Stack>

      <Drawer
        onClose={closeDrawer}
        opened={drawerOpened}
        position="right"
        size="xl"
        title={isCreating ? 'Create Article' : 'Edit Article'}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <LoadingOverlay visible={isSaving} />

          <Tabs defaultValue="basic">
            <Tabs.List>
              <Tabs.Tab value="basic">Basic Info</Tabs.Tab>
              <Tabs.Tab leftSection={<IconCode size={16} />} value="content">
                Content
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel pt="md" value="basic">
              <Stack gap="md">
                <TextInput
                  {...form.getInputProps('title')}
                  placeholder="Article title"
                  rightSection={
                    <HoverCard width={200} shadow="md">
                      <HoverCard.Target>
                        <ActionIcon
                          onClick={() => {
                            const slug = generateSlug(form.values.title);
                            form.setFieldValue('slug', slug);
                          }}
                          variant="subtle"
                        >
                          <IconRefresh size={16} />
                        </ActionIcon>
                      </HoverCard.Target>
                      <HoverCard.Dropdown>
                        <Text size="sm">Generate slug from title</Text>
                      </HoverCard.Dropdown>
                    </HoverCard>
                  }
                  label="Title"
                  withAsterisk
                />

                <TextInput
                  {...form.getInputProps('slug')}
                  placeholder="article-slug"
                  label="URL Slug"
                  withAsterisk
                />

                <Select
                  {...form.getInputProps('status')}
                  data={[
                    { label: 'Draft', value: 'DRAFT' },
                    { label: 'Published', value: 'PUBLISHED' },
                    { label: 'Archived', value: 'ARCHIVED' },
                  ]}
                  label="Status"
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel pt="md" value="content">
              <JsonInput
                {...form.getInputProps('content')}
                autosize
                formatOnBlur
                maxRows={20}
                minRows={10}
                placeholder='{ "blocks": [] }'
                styles={{
                  input: {
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace',
                    fontSize: '13px',
                  },
                }}
                label="Content (JSON)"
              />
            </Tabs.Panel>
          </Tabs>

          <Group justify="space-between" mt="md">
            <Button onClick={closeDrawer} disabled={isSaving} variant="subtle">
              Cancel
            </Button>
            <Button loading={isSaving} type="submit">
              {isCreating ? 'Create Article' : 'Save Changes'}
            </Button>
          </Group>
        </form>
      </Drawer>
    </>
  );
}
