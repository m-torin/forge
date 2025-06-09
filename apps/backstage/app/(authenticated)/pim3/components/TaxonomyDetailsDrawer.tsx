'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Divider,
  Drawer,
  Grid,
  Group,
  Image,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconEdit,
  IconExternalLink,
  IconHash,
  IconPackage,
  IconPhoto,
  IconTag,
  IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';

import { deleteTaxonomy } from '../taxonomies/actions';
import {
  formatDateTime,
  getStatusColor,
  getTaxonomyTypeColor,
  showDeleteConfirmModal,
  showErrorNotification,
  showSuccessNotification,
} from '../utils/pim-helpers';

import { TaxonomyFormModal } from './TaxonomyForm';

import type { Media, Taxonomy } from '@repo/database/prisma';

interface TaxonomyWithRelations extends Taxonomy {
  _count: {
    products: number;
    collections: number;
  };
  media?: Media[];
}

interface TaxonomyDetailsDrawerProps {
  onClose: () => void;
  onUpdate: () => void;
  opened: boolean;
  taxonomy: TaxonomyWithRelations | null;
}

/**
 * Drawer component to display detailed taxonomy information
 */
export function TaxonomyDetailsDrawer({
  onClose,
  onUpdate,
  opened,
  taxonomy,
}: TaxonomyDetailsDrawerProps) {
  const [editModalOpened, setEditModalOpened] = useState(false);

  if (!taxonomy) return null;

  const handleDelete = () => {
    showDeleteConfirmModal('taxonomy', async () => {
      const result = await deleteTaxonomy(taxonomy.id);
      if (result.success) {
        showSuccessNotification('Taxonomy deleted successfully');
        onClose();
        onUpdate();
      } else {
        showErrorNotification(result.error || 'Failed to delete taxonomy');
      }
    });
  };

  const copy = (taxonomy.copy as any) || {};
  const totalItems = taxonomy._count.products + taxonomy._count.collections;

  return (
    <>
      <Drawer
        onClose={onClose}
        opened={opened}
        position="right"
        scrollAreaComponent={ScrollArea.Autosize}
        size="lg"
        title={
          <Group>
            <Title order={4}>{taxonomy.name}</Title>
            <Badge color={getStatusColor(taxonomy.status)} variant="light">
              {taxonomy.status}
            </Badge>
          </Group>
        }
      >
        <Stack gap="md">
          <Group justify="space-between">
            <Group>
              <Button
                leftSection={<IconEdit size={16} />}
                onClick={() => setEditModalOpened(true)}
                variant="light"
              >
                Edit
              </Button>
              <Button
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={handleDelete}
                variant="light"
              >
                Delete
              </Button>
            </Group>
          </Group>

          <Card withBorder>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text fw={500}>Basic Information</Text>
                <Badge color={getTaxonomyTypeColor(taxonomy.type)} variant="light">
                  {taxonomy.type}
                </Badge>
              </Group>
              <Divider />
              <SimpleGrid cols={2}>
                <div>
                  <Text c="dimmed" size="sm">
                    Slug
                  </Text>
                  <Group gap="xs">
                    <Text fw={500}>/{taxonomy.slug}</Text>
                    <Tooltip label="View on website">
                      <ActionIcon size="sm" variant="subtle">
                        <IconExternalLink size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </div>
                <div>
                  <Text c="dimmed" size="sm">
                    Type
                  </Text>
                  <Text fw={500}>{taxonomy.type}</Text>
                </div>
                <div>
                  <Text c="dimmed" size="sm">
                    Created
                  </Text>
                  <Text fw={500}>{formatDateTime(taxonomy.createdAt)}</Text>
                </div>
                <div>
                  <Text c="dimmed" size="sm">
                    Updated
                  </Text>
                  <Text fw={500}>{formatDateTime(taxonomy.updatedAt)}</Text>
                </div>
              </SimpleGrid>
            </Stack>
          </Card>

          {copy.description && (
            <Card withBorder>
              <Stack gap="sm">
                <Text fw={500}>Description</Text>
                <Divider />
                <Text size="sm">{copy.description}</Text>
              </Stack>
            </Card>
          )}

          <Card withBorder>
            <Stack gap="sm">
              <Text fw={500}>Content Statistics</Text>
              <Divider />
              <SimpleGrid cols={3}>
                <div>
                  <Group align="center" gap="xs">
                    <IconPackage stroke={1.5} size={20} />
                    <div>
                      <Text c="dimmed" size="xs">
                        Products
                      </Text>
                      <Text fw={500}>{taxonomy._count.products}</Text>
                    </div>
                  </Group>
                </div>
                <div>
                  <Group align="center" gap="xs">
                    <IconTag stroke={1.5} size={20} />
                    <div>
                      <Text c="dimmed" size="xs">
                        Collections
                      </Text>
                      <Text fw={500}>{taxonomy._count.collections}</Text>
                    </div>
                  </Group>
                </div>
                <div>
                  <Group align="center" gap="xs">
                    <IconHash stroke={1.5} size={20} />
                    <div>
                      <Text c="dimmed" size="xs">
                        Total Items
                      </Text>
                      <Text fw={500}>{totalItems}</Text>
                    </div>
                  </Group>
                </div>
              </SimpleGrid>
            </Stack>
          </Card>

          {(copy.metaTitle || copy.metaDescription || copy.metaKeywords) && (
            <Card withBorder>
              <Stack gap="sm">
                <Text fw={500}>SEO Information</Text>
                <Divider />
                {copy.metaTitle && (
                  <div>
                    <Text c="dimmed" size="sm">
                      Meta Title
                    </Text>
                    <Text size="sm">{copy.metaTitle}</Text>
                  </div>
                )}
                {copy.metaDescription && (
                  <div>
                    <Text c="dimmed" size="sm">
                      Meta Description
                    </Text>
                    <Text size="sm">{copy.metaDescription}</Text>
                  </div>
                )}
                {copy.metaKeywords && (
                  <div>
                    <Text c="dimmed" size="sm">
                      Meta Keywords
                    </Text>
                    <Text size="sm">{copy.metaKeywords}</Text>
                  </div>
                )}
              </Stack>
            </Card>
          )}

          {taxonomy.media && taxonomy.media.length > 0 && (
            <Card withBorder>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text fw={500}>Media</Text>
                  <Badge leftSection={<IconPhoto size={14} />} variant="outline">
                    {taxonomy.media.length} files
                  </Badge>
                </Group>
                <Divider />
                <Grid>
                  {taxonomy.media.map((media) => (
                    <Grid.Col key={media.id} span={4}>
                      <Card withBorder p="xs">
                        {media.type === 'IMAGE' ? (
                          <Image
                            alt={media.altText || ''}
                            fit="cover"
                            height={100}
                            radius="sm"
                            src={media.url}
                          />
                        ) : (
                          <Stack align="center" h={100} justify="center">
                            <IconPhoto color="gray" size={32} />
                            <Text c="dimmed" size="xs">
                              {media.type}
                            </Text>
                          </Stack>
                        )}
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              </Stack>
            </Card>
          )}

          {taxonomy.deletedAt && (
            <Card withBorder bg="red.0">
              <Stack gap="sm">
                <Text c="red" fw={500}>
                  Deleted Information
                </Text>
                <Divider color="red.3" />
                <SimpleGrid cols={2}>
                  <div>
                    <Text c="dimmed" size="sm">
                      Deleted At
                    </Text>
                    <Text fw={500}>{formatDateTime(taxonomy.deletedAt)}</Text>
                  </div>
                  <div>
                    <Text c="dimmed" size="sm">
                      Deleted By
                    </Text>
                    <Text fw={500}>{taxonomy.deletedById || 'Unknown'}</Text>
                  </div>
                </SimpleGrid>
              </Stack>
            </Card>
          )}
        </Stack>
      </Drawer>

      <TaxonomyFormModal
        onClose={() => setEditModalOpened(false)}
        onSuccess={() => {
          setEditModalOpened(false);
          onUpdate();
        }}
        opened={editModalOpened}
        taxonomy={taxonomy}
      />
    </>
  );
}
