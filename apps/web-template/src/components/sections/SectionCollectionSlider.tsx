'use client';

import { Carousel } from '@mantine/carousel';
import {
  IconChevronLeft,
  IconChevronRight,
  IconAlertTriangle,
  IconPackage,
} from '@tabler/icons-react';
import { Skeleton, Alert, Text, Center, Stack } from '@mantine/core';
import { type FC, useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

import type { TCollection as Collection } from '@/types';
import CollectionCard3 from '@/components/ui/Header/CollectionCard3';

interface SectionCollectionSliderProps {
  className?: string;
  collections: Collection[];
  heading?: string;
  headingDim?: string;
  slideSize?: string;
  slideGap?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for SectionCollectionSlider
function SectionCollectionSliderSkeleton({
  className,
  heading,
  headingDim,
}: {
  className?: string;
  heading?: string;
  headingDim?: string;
}) {
  return (
    <div className={className}>
      <div className="container mx-auto mb-12 px-4 lg:mb-14">
        <div className="text-center">
          <Skeleton height={36} width="60%" mx="auto" mb="sm" />
          {headingDim && <Skeleton height={20} width="40%" mx="auto" />}
        </div>
      </div>
      <div className="container mx-auto px-4">
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0" style={{ width: '350px' }}>
              <Skeleton height={250} radius="md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Error state for SectionCollectionSlider
function SectionCollectionSliderError({
  error,
  className,
  heading,
}: {
  error: string;
  className?: string;
  heading?: string;
}) {
  return (
    <div className={className}>
      <div className="container mx-auto mb-12 px-4 lg:mb-14">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
            {heading}
          </h2>
        </div>
      </div>
      <div className="container mx-auto px-4">
        <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
          <Text size="sm">Collection slider failed to load</Text>
        </Alert>
      </div>
    </div>
  );
}

// Zero state for SectionCollectionSlider
function SectionCollectionSliderEmpty({
  className,
  heading,
  headingDim,
}: {
  className?: string;
  heading?: string;
  headingDim?: string;
}) {
  return (
    <div className={className}>
      <div className="container mx-auto mb-12 px-4 lg:mb-14">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
            {heading}
          </h2>
          {headingDim && (
            <span className="mt-2 block text-neutral-600 dark:text-neutral-400">{headingDim}</span>
          )}
        </div>
      </div>
      <div className="container mx-auto px-4">
        <Center py="xl">
          <Stack align="center" gap="md" maw={400}>
            <IconPackage size={48} stroke={1} color="var(--mantine-color-gray-5)" />
            <Text size="lg" fw={600} c="dimmed">
              No collections available
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Collections will appear here when they become available
            </Text>
          </Stack>
        </Center>
      </div>
    </div>
  );
}

const SectionCollectionSlider: FC<SectionCollectionSliderProps> = ({
  className = '',
  collections,
  heading = 'Discover more',
  headingDim = 'Good things are waiting for you',
  slideSize = '350px',
  slideGap = 'md',
  loading = false,
  error,
}) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return (
      <SectionCollectionSliderSkeleton
        className={className}
        heading={heading}
        headingDim={headingDim}
      />
    );
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return (
      <SectionCollectionSliderError error={currentError} className={className} heading={heading} />
    );
  }

  // Show zero state when no collections
  if (!collections || collections.length === 0) {
    return (
      <SectionCollectionSliderEmpty
        className={className}
        heading={heading}
        headingDim={headingDim}
      />
    );
  }
  return (
    <ErrorBoundary
      fallback={
        <SectionCollectionSliderError
          error="Collection slider failed to render"
          className={className}
          heading={heading}
        />
      }
    >
      <div className={className}>
        {/* Heading */}
        <ErrorBoundary fallback={<Skeleton height={60} mx="auto" width="60%" />}>
          <div className="container mx-auto mb-12 px-4 lg:mb-14">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
                {heading}
              </h2>
              {headingDim && (
                <span className="mt-2 block text-neutral-600 dark:text-neutral-400">
                  {headingDim}
                </span>
              )}
            </div>
          </div>
        </ErrorBoundary>

        {/* Carousel */}
        <div className="container mx-auto px-4">
          <ErrorBoundary
            fallback={
              <SectionCollectionSliderSkeleton
                className={className}
                heading={heading}
                headingDim={headingDim}
              />
            }
          >
            <Carousel
              slideSize={slideSize}
              slideGap={slideGap}
              nextControlIcon={<IconChevronRight size={20} />}
              previousControlIcon={<IconChevronLeft size={20} />}
              classNames={{
                control:
                  'bg-white shadow-lg border-0 text-neutral-900 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700',
                controls: 'opacity-0 group-hover:opacity-100 transition-opacity',
                root: 'group',
              }}
            >
              {collections.map((collection) => (
                <ErrorBoundary key={collection.id} fallback={<Skeleton height={250} radius="md" />}>
                  <Carousel.Slide>
                    <CollectionCard3 collection={collection} />
                  </Carousel.Slide>
                </ErrorBoundary>
              ))}
            </Carousel>
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SectionCollectionSlider;
