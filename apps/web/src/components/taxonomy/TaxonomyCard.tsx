'use client';

import { Badge, Card, Text, Title, Skeleton, Center, Stack } from '@mantine/core';
import Link from 'next/link';
import { IconAlertTriangle, IconCategory } from '@tabler/icons-react';
import { useState } from 'react';

import { TaxonomyItem } from '@/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface TaxonomyCardProps {
  item: TaxonomyItem;
  itemsLabel?: string;
  locale: string;
  taxonomyType: string;
  type: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for TaxonomyCard
function TaxonomyCardSkeleton() {
  return (
    <Card padding="lg" radius="sm" shadow="sm" withBorder>
      <div style={{ marginBottom: '1rem' }}>
        <Skeleton height={24} width="70%" mb="xs" />
        <Skeleton height={16} width="100%" />
        <Skeleton height={16} width="80%" />
      </div>
      <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton height={24} width={80} radius="sm" />
        <Skeleton height={16} width={60} />
      </div>
    </Card>
  );
}

// Error state for TaxonomyCard
function TaxonomyCardError({ error }: { error: string }) {
  return (
    <Card padding="lg" radius="sm" shadow="sm" withBorder style={{ borderColor: 'red' }}>
      <Center>
        <Stack align="center" gap="sm">
          <IconAlertTriangle size={32} color="red" />
          <Text size="sm" c="red" ta="center">
            Failed to load taxonomy card
          </Text>
        </Stack>
      </Center>
    </Card>
  );
}

// Zero state for TaxonomyCard
function TaxonomyCardEmpty({ taxonomyType }: { taxonomyType: string }) {
  return (
    <Card padding="lg" radius="sm" shadow="sm" withBorder>
      <Center>
        <Stack align="center" gap="sm">
          <IconCategory size={32} color="gray" />
          <Text c="dimmed" ta="center">
            No {taxonomyType} data
          </Text>
        </Stack>
      </Center>
    </Card>
  );
}

export function TaxonomyCard({
  item,
  itemsLabel = 'items',
  locale,
  taxonomyType,
  type,
  loading = false,
  error,
}: TaxonomyCardProps) {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <TaxonomyCardSkeleton />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <TaxonomyCardError error={currentError} />;
  }

  // Show zero state when no item data
  if (!item) {
    return <TaxonomyCardEmpty taxonomyType={taxonomyType} />;
  }

  const handleMouseInteraction = (transform: string) => {
    return (e: React.MouseEvent<HTMLDivElement>) => {
      try {
        e.currentTarget.style.transform = transform;
      } catch (_error) {
        console.error('Taxonomy card hover error:', _error);
        setInternalError('Card interaction failed');
      }
    };
  };

  return (
    <ErrorBoundary fallback={<TaxonomyCardError error="Taxonomy card failed to render" />}>
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
        onMouseEnter={handleMouseInteraction('translateY(-2px)') as any}
        onMouseLeave={handleMouseInteraction('translateY(0)') as any}
      >
        <div style={{ marginBottom: '1rem' }}>
          <ErrorBoundary fallback={<Skeleton height={24} width="70%" mb="xs" />}>
            <Title mb="xs" order={3} size="h4">
              {item.name}
            </Title>
          </ErrorBoundary>
          {item.description && (
            <ErrorBoundary fallback={<Skeleton height={16} width="100%" />}>
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
            </ErrorBoundary>
          )}
        </div>

        <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
          <ErrorBoundary fallback={<Skeleton height={24} width={80} radius="sm" />}>
            <Badge c="blue" variant="light">
              {taxonomyType.charAt(0).toUpperCase() + taxonomyType.slice(1)}
            </Badge>
          </ErrorBoundary>
          {item.count !== undefined && (
            <ErrorBoundary fallback={<Skeleton height={16} width={60} />}>
              <Text c="dimmed" size="md">
                {item.count} {itemsLabel}
              </Text>
            </ErrorBoundary>
          )}
        </div>
      </Card>
    </ErrorBoundary>
  );
}
