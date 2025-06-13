'use client';

import { Badge, Button, Card, Container, Grid, Group, Stack, Text, Title } from '@mantine/core';
import { IconArrowRight, IconSearch } from '@tabler/icons-react';
import Link from 'next/link';

import { TaxonomyCard, ZeroStateActions } from '@/components/taxonomy';
import { type TaxonomyItem, TaxonomyType } from '@/types';

interface TaxonomyPageUIProps {
  dict: any;
  locale: string;
  taxonomyItems: TaxonomyItem[];
  taxonomyType: TaxonomyType;
  type: string;
}

export function TaxonomyPageUI({
  dict,
  locale,
  taxonomyItems,
  taxonomyType,
  type,
}: TaxonomyPageUIProps) {
  const taxonomyConfig = dict.taxonomy?.[taxonomyType];

  return (
    <Container py="xl" size="lg">
      {/* Header Section */}
      <div style={{ marginBottom: '2rem' }}>
        <Title mb="sm" order={1} size="h1">
          {taxonomyConfig?.title || type.charAt(0).toUpperCase() + type.slice(1)}
        </Title>
        <Text c="dimmed" size="lg">
          {taxonomyConfig?.description || `Browse our ${type} catalog`}
        </Text>
      </div>

      {/* Content Section */}
      {taxonomyItems.length === 0 ? (
        <ZeroStateSection dict={dict} locale={locale} type={type} />
      ) : (
        <TaxonomyGrid
          dict={dict}
          locale={locale}
          taxonomyItems={taxonomyItems}
          taxonomyType={taxonomyType}
          type={type}
        />
      )}
    </Container>
  );
}

// Zero state component
interface ZeroStateSectionProps {
  dict: any;
  locale: string;
  type: string;
}

function ZeroStateSection({ dict, locale, type }: ZeroStateSectionProps) {
  return (
    <Card padding="xl" radius="sm" shadow="sm" withBorder={true}>
      <Stack ta="center" gap="lg">
        <div
          style={{
            alignItems: 'center',
            backgroundColor: 'var(--mantine-color-gray-1)',
            borderRadius: '50%',
            display: 'flex',
            height: '80px',
            justifyContent: 'center',
            width: '80px',
          }}
        >
          <IconSearch color="var(--mantine-color-gray-6)" size={32} />
        </div>

        <Stack ta="center" gap="xs">
          <Title c="dimmed" order={3} ta="center">
            {dict.taxonomy?.noItems || `No ${type} found`}
          </Title>
          <Text c="dimmed" maw={400} size="md" ta="center">
            {dict.taxonomy?.noItemsDescription ||
              `We couldn't find any ${type} at the moment. Try exploring other categories or check back later.`}
          </Text>
        </Stack>

        <ZeroStateActions
          homeLabel={dict.navigation?.home || 'Go Home'}
          locale={locale}
          searchLabel={dict.search?.title || 'Search'}
        />

        <div style={{ marginTop: '1rem' }}>
          <Text c="dimmed" fw={500} mb="sm" size="md" ta="center">
            {dict.taxonomy?.exploreOther || 'Explore other categories:'}
          </Text>
          <Group gap="xs" justify="center">
            {Object.values(TaxonomyType)
              .filter((t) => t !== type)
              .slice(0, 3)
              .map((taxonomyType) => (
                <Button
                  key={taxonomyType}
                  component={Link}
                  href={`/${locale}/${taxonomyType}`}
                  size="xs"
                  variant="subtle"
                >
                  {dict.taxonomy?.[taxonomyType]?.title ||
                    taxonomyType.charAt(0).toUpperCase() + taxonomyType.slice(1)}
                </Button>
              ))}
          </Group>
        </div>
      </Stack>
    </Card>
  );
}

// Taxonomy grid component
interface TaxonomyGridProps {
  dict: any;
  locale: string;
  taxonomyItems: TaxonomyItem[];
  taxonomyType: TaxonomyType;
  type: string;
}

function TaxonomyGrid({ dict, locale, taxonomyItems, taxonomyType, type }: TaxonomyGridProps) {
  return (
    <Grid>
      {taxonomyItems.map((item: any) => (
        <Grid.Col key={item.id} span={{ base: 12, md: 4, sm: 6 }}>
          <TaxonomyCard
            item={item}
            itemsLabel={dict.taxonomy?.items || 'items'}
            locale={locale}
            taxonomyType={taxonomyType}
            type={type}
          />
        </Grid.Col>
      ))}
    </Grid>
  );
}
