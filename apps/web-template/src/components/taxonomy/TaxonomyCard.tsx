'use client';

import { Badge, Card, Text, Title } from '@mantine/core';
import Link from 'next/link';

import { TaxonomyItem } from '@/types';

interface TaxonomyCardProps {
  item: TaxonomyItem;
  itemsLabel?: string;
  locale: string;
  taxonomyType: string;
  type: string;
}

export function TaxonomyCard({
  item,
  itemsLabel = 'items',
  locale,
  taxonomyType,
  type,
}: TaxonomyCardProps) {
  return (
    <Card
      component={Link}
      href={`/${locale}/${type}/${item.slug}`}
      padding="lg"
      radius="sm"
      shadow="sm"
      style={{
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'transform 0.2s ease',
      }}
      withBorder={true}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <Title mb="xs" order={3} size="h4">
          {item.name}
        </Title>
        {item.description && (
          <Text
            c="dimmed"
            size="md"
            style={{
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
            }}
          >
            {item.description}
          </Text>
        )}
      </div>

      <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
        <Badge c="blue" variant="light">
          {taxonomyType.charAt(0).toUpperCase() + taxonomyType.slice(1)}
        </Badge>
        {item.count !== undefined && (
          <Text c="dimmed" size="md">
            {item.count} {itemsLabel}
          </Text>
        )}
      </div>
    </Card>
  );
}
