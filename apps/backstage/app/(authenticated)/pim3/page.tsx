'use client';

import { Button, Card, Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import {
  IconArticle,
  IconAsset,
  IconBarcode,
  IconBuildingStore,
  IconCategory,
  IconFolder,
  IconHistory,
  IconLink,
  IconList,
  IconMessage,
  IconPackage,
  IconPhoto,
  IconPhotoPlus,
  IconTags,
} from '@tabler/icons-react';
import Link from 'next/link';

const modules = [
  {
    color: 'blue',
    description: 'Manage product catalog, SKUs, pricing, and metadata',
    href: '/pim3/products',
    icon: IconPackage,
    title: 'Products',
  },
  {
    color: 'teal',
    description: 'Organize product categories and hierarchical taxonomy',
    href: '/pim3/categories',
    icon: IconCategory,
    title: 'Categories',
  },
  {
    color: 'green',
    description: 'Upload and organize product images and media files',
    href: '/pim3/media',
    icon: IconPhoto,
    title: 'Media Library',
  },
  {
    color: 'cyan',
    description: 'Manage product-specific digital assets and documents',
    href: '/pim3/product-assets',
    icon: IconPhotoPlus,
    title: 'Product Assets',
  },
  {
    color: 'grape',
    description: 'Central digital asset management system',
    href: '/pim3/assets',
    icon: IconAsset,
    title: 'Assets',
  },
  {
    color: 'orange',
    description: 'Manage barcodes, UPC codes, and product identifiers',
    href: '/pim3/barcodes',
    icon: IconBarcode,
    title: 'Barcodes',
  },
  {
    color: 'violet',
    description: 'View product scan history and analytics',
    href: '/pim3/scan-history',
    icon: IconHistory,
    title: 'Scan History',
  },
  {
    color: 'indigo',
    description: 'Manage brand information and hierarchies',
    href: '/pim3/brands',
    icon: IconBuildingStore,
    title: 'Brands',
  },
  {
    color: 'pink',
    description: 'Create and manage product collections and sets',
    href: '/pim3/collections',
    icon: IconFolder,
    title: 'Collections',
  },
  {
    color: 'red',
    description: 'Organize products with tags and attributes',
    href: '/pim3/taxonomies',
    icon: IconTags,
    title: 'Taxonomies',
  },
  {
    color: 'yellow',
    description: 'Customer reviews and ratings management',
    href: '/pim3/reviews',
    icon: IconMessage,
    title: 'Reviews',
  },
  {
    color: 'dark',
    description: 'Blog posts, guides, and documentation',
    href: '/pim3/articles',
    icon: IconArticle,
    title: 'Articles',
  },
  {
    color: 'gray',
    description: 'Customer registries, wishlists, and gift lists',
    href: '/pim3/registries',
    icon: IconList,
    title: 'Registries',
  },
  {
    color: 'blue.5',
    description: 'Manage product relationships and associations',
    href: '/pim3/relationships',
    icon: IconLink,
    title: 'Relationships',
  },
];

export default function PIM3Page() {
  return (
    <Stack>
      <Group justify="space-between">
        <div>
          <Title order={1}>PIM3 - Product Information Management</Title>
          <Text c="dimmed" mt="xs">
            Comprehensive product catalog management with assets, barcodes, and analytics
          </Text>
        </div>
      </Group>

      <SimpleGrid cols={{ base: 1, lg: 3, md: 2 }} spacing="lg">
        {modules.map((module) => (
          <Card key={module.title} withBorder h="100%">
            <Stack>
              <Group>
                <ThemeIcon color={module.color} size="xl" variant="light">
                  <module.icon size="1.5rem" />
                </ThemeIcon>
                <div>
                  <Text fw={600} size="lg">
                    {module.title}
                  </Text>
                </div>
              </Group>

              <Text c="dimmed" size="sm">
                {module.description}
              </Text>

              <Button
                href={module.href as any}
                color={module.color}
                component={Link}
                mt="auto"
                variant="light"
              >
                Open {module.title}
              </Button>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
