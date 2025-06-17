'use client';

import { Skeleton, Center, Stack, Text, Alert } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import {
  IconArrowUpRight,
  IconChevronLeft,
  IconChevronRight,
  IconAlertTriangle,
  IconPackage,
} from '@tabler/icons-react';
import Link from 'next/link';
import { type FC, useState } from 'react';

import type { TProductItem as Product } from '@/types';
import ProductCardLarge from '@/components/ui/ProductCardLarge';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export interface SectionSliderLargeProductProps {
  className?: string;
  heading?: string;
  headingDim?: string;
  products: Product[];
  showMoreHref?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for SectionSliderLargeProduct
function SectionSliderSkeleton({
  className,
  heading,
  headingDim,
}: {
  className?: string;
  heading?: string;
  headingDim?: string;
}) {
  return (
    <div className={`nc-SectionSliderLargeProduct ${className}`}>
      <div className="container mx-auto mb-12 px-4 lg:mb-14">
        <div className="text-center sm:text-left">
          <Skeleton height={36} width="60%" mb="sm" />
          {headingDim && <Skeleton height={20} width="40%" />}
        </div>
      </div>
      <div className="container mx-auto px-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton height={250} radius="md" />
              <Skeleton height={20} width="80%" />
              <Skeleton height={16} width="60%" />
              <Skeleton height={24} width="40%" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Error state for SectionSliderLargeProduct
function SectionSliderError({
  error,
  className,
  heading,
  showMoreHref,
}: {
  error: string;
  className?: string;
  heading?: string;
  showMoreHref?: string;
}) {
  return (
    <div className={`nc-SectionSliderLargeProduct ${className}`}>
      <div className="container mx-auto mb-12 px-4 lg:mb-14">
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
            {heading}
          </h2>
        </div>
      </div>
      <div className="container mx-auto px-4">
        <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
          <Text size="sm">Failed to load product slider</Text>
          {showMoreHref && (
            <Link href={showMoreHref} className="text-blue-600 hover:underline text-sm">
              View all products instead
            </Link>
          )}
        </Alert>
      </div>
    </div>
  );
}

// Zero state for SectionSliderLargeProduct
function SectionSliderEmpty({
  className,
  heading,
  headingDim,
  showMoreHref,
}: {
  className?: string;
  heading?: string;
  headingDim?: string;
  showMoreHref?: string;
}) {
  return (
    <div className={`nc-SectionSliderLargeProduct ${className}`}>
      <div className="container mx-auto mb-12 px-4 lg:mb-14">
        <div className="text-center sm:text-left">
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
              No products available
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              We don't have any featured products to show right now. Check back later!
            </Text>
            {showMoreHref && (
              <Link
                href={showMoreHref}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse All Products
              </Link>
            )}
          </Stack>
        </Center>
      </div>
    </div>
  );
}

const SectionSliderLargeProduct: FC<SectionSliderLargeProductProps> = ({
  className = '',
  heading = 'Chosen by experts',
  headingDim = 'Featured of the week',
  products,
  showMoreHref = '/products',
  loading = false,
  error,
}) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return (
      <SectionSliderSkeleton className={className} heading={heading} headingDim={headingDim} />
    );
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return (
      <SectionSliderError
        error={currentError}
        className={className}
        heading={heading}
        showMoreHref={showMoreHref}
      />
    );
  }

  // Show zero state when no products
  if (!products || products.length === 0) {
    return (
      <SectionSliderEmpty
        className={className}
        heading={heading}
        headingDim={headingDim}
        showMoreHref={showMoreHref}
      />
    );
  }
  return (
    <ErrorBoundary
      fallback={
        <SectionSliderError
          error="Product slider failed to render"
          className={className}
          heading={heading}
          showMoreHref={showMoreHref}
        />
      }
    >
      <div className={`nc-SectionSliderLargeProduct ${className}`}>
        {/* Heading */}
        <ErrorBoundary fallback={<Skeleton height={36} width="60%" />}>
          <div className="container mx-auto mb-12 px-4 lg:mb-14">
            <div className="text-center sm:text-left">
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
              <SectionSliderSkeleton
                className={className}
                heading={heading}
                headingDim={headingDim}
              />
            }
          >
            <Carousel
              slideSize={{ base: '100%', sm: '66.666%', lg: '50%', xl: '40%', '2xl': '33.333%' }}
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
              {products.map((product) => (
                <Carousel.Slide key={product.id}>
                  <ErrorBoundary fallback={<Skeleton height={250} radius="md" />}>
                    <ProductCardLarge product={product} />
                  </ErrorBoundary>
                </Carousel.Slide>
              ))}

              {/* Show More Slide */}
              <Carousel.Slide>
                <ErrorBoundary fallback={<Skeleton height={410} radius="md" />}>
                  <Link href={showMoreHref} className="group relative block">
                    <div className="relative h-[410px] overflow-hidden rounded-2xl">
                      <div className="h-[410px] bg-black/5 dark:bg-neutral-800" />
                      <div className="absolute inset-x-10 inset-y-6 flex flex-col items-center justify-center">
                        <div className="relative flex items-center justify-center text-neutral-900 dark:text-neutral-100">
                          <span className="text-xl font-semibold">More items</span>
                          <IconArrowUpRight
                            className="absolute left-full ml-2 group-hover:scale-110 transition-transform"
                            size={24}
                          />
                        </div>
                        <span className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                          Show me more
                        </span>
                      </div>
                    </div>
                  </Link>
                </ErrorBoundary>
              </Carousel.Slide>
            </Carousel>
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SectionSliderLargeProduct;
