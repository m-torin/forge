'use client';

import { logger } from '@/lib/logger';
import {
  Anchor,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Image,
  Text,
  Title,
} from '@mantine/core';
import { IconArrowLeft, IconHeart, IconShare } from '@tabler/icons-react';
import Link from 'next/link';

import { type TaxonomyItem, TaxonomyType } from '@/types';

interface TaxonomyTermPageUIProps {
  dict: any;
  locale: string;
  taxonomyItem: TaxonomyItem;
  taxonomyType: TaxonomyType;
  type: string;
  slug: string;
}

export function TaxonomyTermPageUI({
  dict,
  locale,
  taxonomyItem,
  taxonomyType,
  type,
  slug,
}: TaxonomyTermPageUIProps) {
  const breadcrumbItems = [
    { href: `/${locale}`, title: dict.navigation?.home || 'Home' },
    { href: `/${locale}/${type}`, title: dict.taxonomy?.[taxonomyType]?.title || type },
    { href: `/${locale}/${type}/${slug}`, title: taxonomyItem.name },
  ].map((item, index, array) => (
    <Anchor
      key={item.href}
      c={index === array.length - 1 ? 'dimmed' : undefined}
      component={Link}
      href={item.href}
      size="md"
    >
      {item.title}
    </Anchor>
  ));

  return (
    <Container py="xl" size="lg">
      {/* Breadcrumbs */}
      <Breadcrumbs mb="lg">{breadcrumbItems}</Breadcrumbs>

      {/* Back Button */}
      <Button
        component={Link}
        href={`/${locale}/${type}`}
        leftSection={<IconArrowLeft size={16} />}
        mb="xl"
        size="md"
        variant="subtle"
      >
        {dict.taxonomy?.backTo || 'Back to'} {dict.taxonomy?.[taxonomyType]?.title || type}
      </Button>

      {/* Main Content */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <div style={{ marginBottom: '2rem' }}>
            <Group align="flex-start" justify="space-between" mb="md">
              <div>
                <Title mb="xs" order={1} size="h1">
                  {taxonomyItem.name}
                </Title>
                <Group gap="sm" mb="md">
                  <Badge c="blue" size="lg" variant="light">
                    {taxonomyType.charAt(0).toUpperCase() + taxonomyType.slice(1)}
                  </Badge>
                  {taxonomyItem.count !== undefined && (
                    <Badge c="gray" variant="outline">
                      {taxonomyItem.count} {dict.taxonomy?.items || 'items'}
                    </Badge>
                  )}
                </Group>
              </div>

              <ActionButtons dict={dict} />
            </Group>

            {taxonomyItem.description && (
              <Text c="dimmed" mb="xl" size="lg">
                {taxonomyItem.description}
              </Text>
            )}
          </div>

          {/* Featured Image Placeholder */}
          <Card mb="xl" padding="lg" radius="sm" shadow="sm" withBorder={true}>
            <Image
              alt={taxonomyItem.name}
              fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zNzAgMTcwSDQzMFYyMzBIMzcwVjE3MFoiIGZpbGw9IiNDQ0NDQ0MiLz4KPHA+PC9wPgo8L3N2Zz4K"
              height={400}
              src={null}
            />
          </Card>

          {/* Related Items Section */}
          <RelatedItemsSection
            dict={dict}
            locale={locale}
            taxonomyType={taxonomyType}
            type={type}
          />
        </Grid.Col>

        {/* Sidebar */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <DetailsCard
            dict={dict}
            locale={locale}
            taxonomyItem={taxonomyItem}
            taxonomyType={taxonomyType}
            type={type}
          />
        </Grid.Col>
      </Grid>
    </Container>
  );
}

// Action buttons component
interface ActionButtonsProps {
  dict: any;
}

function ActionButtons({ dict }: ActionButtonsProps) {
  const handleSave = () => {
    // Add save functionality here
    logger.info('Save clicked');
  };

  const handleShare = () => {
    // Add share functionality here
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Group gap="sm">
      <Button leftSection={<IconHeart size={16} />} onClick={handleSave} size="md" variant="light">
        {dict.taxonomy?.save || 'Save'}
      </Button>
      <Button leftSection={<IconShare size={16} />} onClick={handleShare} size="md" variant="light">
        {dict.taxonomy?.share || 'Share'}
      </Button>
    </Group>
  );
}

// Related items section component
interface RelatedItemsSectionProps {
  dict: any;
  locale: string;
  taxonomyType: TaxonomyType;
  type: string;
}

function RelatedItemsSection({ dict, locale, taxonomyType, type }: RelatedItemsSectionProps) {
  return (
    <Card padding="lg" radius="sm" shadow="sm" withBorder={true}>
      <Title mb="md" order={3} size="h3">
        {dict.taxonomy?.relatedItems || 'Related Items'}
      </Title>
      <Text c="dimmed">
        {dict.taxonomy?.exploreMore || 'Explore more items in this'} {taxonomyType}.
      </Text>
      <Button component={Link} href={`/${locale}/${type}`} mt="md" variant="light">
        {dict.taxonomy?.viewAll || 'View All'} {dict.taxonomy?.[taxonomyType]?.title || type}
      </Button>
    </Card>
  );
}

// Details card component
interface DetailsCardProps {
  dict: any;
  locale: string;
  taxonomyItem: TaxonomyItem;
  taxonomyType: TaxonomyType;
  type: string;
}

function DetailsCard({ dict, locale, taxonomyItem, taxonomyType, type }: DetailsCardProps) {
  const handleBrowseItems = () => {
    // Navigate to items or trigger search
    window.location.href = `/${locale}/${type}`;
  };

  return (
    <Card padding="lg" radius="sm" shadow="sm" withBorder={true}>
      <Title mb="md" order={4} size="h4">
        {dict.taxonomy?.details || 'Details'}
      </Title>

      <div style={{ marginBottom: '1rem' }}>
        <Text fw={500} mb="xs" size="md">
          {dict.taxonomy?.type || 'Type'}
        </Text>
        <Text c="dimmed" size="md">
          {taxonomyType.charAt(0).toUpperCase() + taxonomyType.slice(1)}
        </Text>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <Text fw={500} mb="xs" size="md">
          {dict.taxonomy?.totalItems || 'Total Items'}
        </Text>
        <Text c="dimmed" size="md">
          {taxonomyItem.count || 0} {dict.taxonomy?.items || 'items'}
        </Text>
      </div>

      {taxonomyItem.parent && (
        <div style={{ marginBottom: '1rem' }}>
          <Text fw={500} mb="xs" size="md">
            {dict.taxonomy?.parent || 'Parent'}
          </Text>
          <Anchor component={Link} href={`/${locale}/${type}/${taxonomyItem.parent}`} size="md">
            {taxonomyItem.parent}
          </Anchor>
        </div>
      )}

      <Button fullWidth mt="md" onClick={handleBrowseItems}>
        {dict.taxonomy?.browseItems || 'Browse Items'}
      </Button>
    </Card>
  );
}
