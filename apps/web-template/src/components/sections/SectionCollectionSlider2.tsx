'use client';

import { Carousel } from '@mantine/carousel';
import { Skeleton, Alert, Text, Center, Stack } from '@mantine/core';
import {
  IconArrowUpRight,
  IconChevronLeft,
  IconChevronRight,
  IconAlertTriangle,
  IconPackage,
} from '@tabler/icons-react';
import clsx from 'clsx';
import Link from 'next/link';
import { type FC, useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

import type { TCollection as Collection } from '@/types';
import CollectionCard2 from '@/components/ui/CollectionCard2';

export interface SectionCollectionSlider2Props {
  className?: string;
  collections: Collection[];
  heading?: string;
  headingDim?: string;
  subHeading?: string;
  showMoreHref?: string;
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for SectionCollectionSlider2
function SectionCollectionSlider2Skeleton({
  className,
  heading,
  headingDim,
  subHeading,
  testId,
}: {
  className?: string;
  heading?: string;
  headingDim?: string;
  subHeading?: string;
  testId?: string;
}) {
  return (
    <div className={clsx(className)} data-testid={testId}>
      <div className="container mx-auto mb-12 px-4 lg:mb-14">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <Skeleton height={36} width="60%" mb="sm" />
            {headingDim && <Skeleton height={20} width="40%" mb="md" />}
            {subHeading && <Skeleton height={16} width="50%" />}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4">
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0" style={{ width: '250px' }}>
              <Skeleton height={250} radius="md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Error state for SectionCollectionSlider2
function SectionCollectionSlider2Error({
  error,
  className,
  heading,
  headingDim,
  subHeading,
  testId,
}: {
  error: string;
  className?: string;
  heading?: string;
  headingDim?: string;
  subHeading?: string;
  testId?: string;
}) {
  return (
    <div className={clsx(className)} data-testid={testId}>
      <div className="container mx-auto mb-12 px-4 lg:mb-14">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
              {heading}
            </h2>
            {headingDim && (
              <span className="mt-2 block text-neutral-600 dark:text-neutral-400">
                {headingDim}
              </span>
            )}
            {subHeading && (
              <p className="mt-4 text-neutral-500 dark:text-neutral-400">{subHeading}</p>
            )}
          </div>
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

// Zero state for SectionCollectionSlider2
function SectionCollectionSlider2Empty({
  className,
  heading,
  headingDim,
  subHeading,
  testId,
}: {
  className?: string;
  heading?: string;
  headingDim?: string;
  subHeading?: string;
  testId?: string;
}) {
  return (
    <div className={clsx(className)} data-testid={testId}>
      <div className="container mx-auto mb-12 px-4 lg:mb-14">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
              {heading}
            </h2>
            {headingDim && (
              <span className="mt-2 block text-neutral-600 dark:text-neutral-400">
                {headingDim}
              </span>
            )}
            {subHeading && (
              <p className="mt-4 text-neutral-500 dark:text-neutral-400">{subHeading}</p>
            )}
          </div>
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

const SectionCollectionSlider2: FC<SectionCollectionSlider2Props> = ({
  className,
  collections,
  heading = 'Shop by department',
  headingDim = 'Explore the absolute',
  subHeading,
  showMoreHref = '/collections',
  'data-testid': testId = 'section-collection-slider-2',
  loading = false,
  error,
}) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return (
      <SectionCollectionSlider2Skeleton
        className={className}
        heading={heading}
        headingDim={headingDim}
        subHeading={subHeading}
        testId={testId}
      />
    );
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return (
      <SectionCollectionSlider2Error
        error={currentError}
        className={className}
        heading={heading}
        headingDim={headingDim}
        subHeading={subHeading}
        testId={testId}
      />
    );
  }

  // Show zero state when no collections
  if (!collections || collections.length === 0) {
    return (
      <SectionCollectionSlider2Empty
        className={className}
        heading={heading}
        headingDim={headingDim}
        subHeading={subHeading}
        testId={testId}
      />
    );
  }
  return (
    <ErrorBoundary
      fallback={
        <SectionCollectionSlider2Error
          error="Collection slider failed to render"
          className={className}
          heading={heading}
          headingDim={headingDim}
          subHeading={subHeading}
          testId={testId}
        />
      }
    >
      <div className={clsx(className)} data-testid={testId}>
        {/* Heading */}
        <ErrorBoundary fallback={<Skeleton height={100} mx="auto" width="60%" />}>
          <div className="container mx-auto mb-12 px-4 lg:mb-14">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-center sm:text-left">
                <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
                  {heading}
                </h2>
                {headingDim && (
                  <span className="mt-2 block text-neutral-600 dark:text-neutral-400">
                    {headingDim}
                  </span>
                )}
                {subHeading && (
                  <p className="mt-4 text-neutral-500 dark:text-neutral-400">{subHeading}</p>
                )}
              </div>
            </div>
          </div>
        </ErrorBoundary>

        {/* Carousel */}
        <div className="container mx-auto px-4">
          <ErrorBoundary
            fallback={
              <SectionCollectionSlider2Skeleton
                className={className}
                heading={heading}
                headingDim={headingDim}
                subHeading={subHeading}
                testId={testId}
              />
            }
          >
            <Carousel
              slideSize={{ base: '86%', md: '50%', lg: '33.333%', xl: '25%' }}
              slideGap="md"
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
                    <CollectionCard2 collection={collection} />
                  </Carousel.Slide>
                </ErrorBoundary>
              ))}

              {/* Show More Slide */}
              <ErrorBoundary fallback={<Skeleton height={250} radius="md" />}>
                <Carousel.Slide>
                  <Link
                    href={showMoreHref}
                    className="group relative aspect-square w-full flex-1 overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800"
                  >
                    <div className="absolute inset-x-10 inset-y-6 flex flex-col justify-center items-center">
                      <div className="relative flex text-neutral-900 dark:text-neutral-100">
                        <span className="text-lg font-semibold">More collections</span>
                        <IconArrowUpRight
                          className="absolute left-full ml-2 size-5 group-hover:scale-110 transition-transform"
                          size={20}
                        />
                      </div>
                      <span className="mt-1 text-sm text-neutral-800 dark:text-neutral-300">
                        Show me more
                      </span>
                    </div>
                  </Link>
                </Carousel.Slide>
              </ErrorBoundary>
            </Carousel>
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SectionCollectionSlider2;
