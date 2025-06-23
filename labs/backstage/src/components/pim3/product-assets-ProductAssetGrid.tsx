'use client';

import { Box, Button, Card, Group, Image, SimpleGrid, Stack, Text, Badge } from '@mantine/core';
import { IconPhoto } from '@tabler/icons-react';

interface MediaItem {
  id: string;
  url: string;
  altText?: string;
  type: string;
  size?: number;
  mimeType?: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
}

interface ProductAssetGridProps {
  assets: MediaItem[];
  loading?: boolean;
  onView?: (asset: MediaItem) => void;
  onEdit?: (asset: MediaItem) => void;
  onDelete?: (asset: MediaItem) => void;
  onSelect?: (asset: MediaItem) => void;
  selectedIds?: string[];
}

export function ProductAssetGrid({
  assets,
  loading,
  onView,
  onEdit,
  onDelete,
  onSelect,
  selectedIds = [],
}: ProductAssetGridProps) {
  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!assets || assets.length === 0) {
    return (
      <Card withBorder p="xl">
        <Stack align="center" gap="md">
          <IconPhoto size={48} color="gray" />
          <Text c="dimmed">No assets found</Text>
        </Stack>
      </Card>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
      {assets.map((asset) => (
        <Card key={asset.id} withBorder p="xs">
          <Card.Section>
            <Box
              style={{
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--mantine-color-gray-1)',
              }}
            >
              {asset.type === 'IMAGE' ? (
                <Image src={asset.url} alt={asset.altText || 'Asset'} fit="contain" height={200} />
              ) : (
                <IconPhoto size={48} color="gray" />
              )}
            </Box>
          </Card.Section>

          <Stack gap="xs" mt="md">
            <Group justify="space-between">
              <Text size="sm" fw={500} truncate>
                {asset.url.split('/').pop() || 'Asset'}
              </Text>
              <Badge size="xs" variant="light">
                {asset.type}
              </Badge>
            </Group>

            {asset.product && (
              <Text size="xs" c="dimmed">
                {asset.product.name} ({asset.product.sku})
              </Text>
            )}

            <Group gap="xs">
              {onView && (
                <Button size="xs" variant="light" onClick={() => onView(asset)}>
                  View
                </Button>
              )}
              {onEdit && (
                <Button size="xs" variant="light" onClick={() => onEdit(asset)}>
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button size="xs" color="red" variant="light" onClick={() => onDelete(asset)}>
                  Delete
                </Button>
              )}
            </Group>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
}
