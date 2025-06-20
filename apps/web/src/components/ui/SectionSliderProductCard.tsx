'use client';

import { Carousel } from '@mantine/carousel';
import { Skeleton, Alert, Text, Center, Stack } from '@mantine/core';
import { IconAlertTriangle, IconShoppingBag } from '@tabler/icons-react';
import { type FC, useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

import Heading from './shared/Heading/Heading';
import ProductCard, { type TProductItem } from './shared/ProductCard';

export interface SectionSliderProductCardProps {
  className?: string;
  data: TProductItem[];
  heading?: string;
  headingClassName?: string;
  headingFontClassName?: string;
  subHeading?: string;
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for SectionSliderProductCard
function SectionSliderProductCardSkeleton({
  className,
  heading: _heading,
  subHeading,
  testId,
}: {
  className?: string;
  heading?: string;
  subHeading?: string;
  testId?: string;
}) {
  return (
    <div className={`nc-SectionSliderProductCard ${className}`} data-testid={testId}>
      <div className="mb-12 text-center">
        <Skeleton height={36} width="60%" mx="auto" mb="sm" />
        {subHeading && <Skeleton height={20} width="40%" mx="auto" />}
      </div>
      <div className="-mx-5 sm:-mx-8">
        <div className="flex gap-4 overflow-hidden px-5 sm:px-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0" style={{ width: '250px' }}>
              <Skeleton height={300} radius="md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Error state for SectionSliderProductCard
function SectionSliderProductCardError({
  error: _error,
  className,
  heading,
  subHeading,
  testId,
}: {
  error: string;
  className?: string;
  heading?: string;
  subHeading?: string;
  testId?: string;
}) {
  return (
    <div className={`nc-SectionSliderProductCard ${className}`} data-testid={testId}>
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
          {heading ?? 'New Arrivals'}
        </h2>
        {subHeading && (
          <span className="mt-2 block text-neutral-600 dark:text-neutral-400">{subHeading}</span>
        )}
      </div>
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="sm">Product slider failed to load</Text>
      </Alert>
    </div>
  );
}

// Zero state for SectionSliderProductCard
function SectionSliderProductCardEmpty({
  className,
  heading,
  subHeading,
  testId,
}: {
  className?: string;
  heading?: string;
  subHeading?: string;
  testId?: string;
}) {
  return (
    <div className={`nc-SectionSliderProductCard ${className}`} data-testid={testId}>
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
          {heading ?? 'New Arrivals'}
        </h2>
        {subHeading && (
          <span className="mt-2 block text-neutral-600 dark:text-neutral-400">{subHeading}</span>
        )}
      </div>
      <Center py="xl">
        <Stack align="center" gap="md" maw={400}>
          <IconShoppingBag size={48} stroke={1} color="var(--mantine-color-gray-5)" />
          <Text size="lg" fw={600} c="dimmed">
            No products available
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Products will appear here when they become available
          </Text>
        </Stack>
      </Center>
    </div>
  );
}

const SectionSliderProductCard: FC<SectionSliderProductCardProps> = ({
  className = '',
  data,
  heading,
  headingClassName,
  headingFontClassName,
  subHeading = 'REY backpacks & bags',
  'data-testid': testId = 'section-slider-product-card',
  loading = false,
  error: _error,
}) => {
  const [internalError, _setInternalError] = useState<string | null>(null);
  const [embla, setEmbla] = useState<any>(null);

  // Show loading state
  if (loading) {
    return (
      <SectionSliderProductCardSkeleton
        className={className}
        heading={heading}
        subHeading={subHeading}
        testId={testId}
      />
    );
  }

  // Show error state
  const currentError = _error || internalError;
  if (currentError) {
    return (
      <SectionSliderProductCardError
        error={currentError}
        className={className}
        heading={heading}
        subHeading={subHeading}
        testId={testId}
      />
    );
  }

  // Show zero state when no data
  if (!data || data.length === 0) {
    return (
      <SectionSliderProductCardEmpty
        className={className}
        heading={heading}
        subHeading={subHeading}
        testId={testId}
      />
    );
  }
  const nextBtnDisabled = !embla?.canScrollNext();
  const prevBtnDisabled = !embla?.canScrollPrev();

  const onNextButtonClick = () => embla?.scrollNext();
  const onPrevButtonClick = () => embla?.scrollPrev();

  // Data prop is guaranteed to exist and have content
  // This component should not be rendered without data

  return (
    <ErrorBoundary
      fallback={
        <SectionSliderProductCardError
          error="Product slider failed to render"
          className={className}
          heading={heading}
          subHeading={subHeading}
          testId={testId}
        />
      }
    >
      <div className={`nc-SectionSliderProductCard ${className}`} data-testid={testId}>
        <ErrorBoundary fallback={<Skeleton height={80} mx="auto" width="60%" />}>
          <Heading
            className={headingClassName}
            fontClass={headingFontClassName}
            hasNextPrev
            headingDim={subHeading}
            nextBtnDisabled={nextBtnDisabled}
            prevBtnDisabled={prevBtnDisabled}
            onClickNext={onNextButtonClick}
            onClickPrev={onPrevButtonClick}
          >
            {heading ?? 'New Arrivals'}
          </Heading>
        </ErrorBoundary>

        <ErrorBoundary
          fallback={
            <SectionSliderProductCardSkeleton
              className={className}
              heading={heading}
              subHeading={subHeading}
              testId={testId}
            />
          }
        >
          <Carousel
            classNames={{
              root: '-mx-5 sm:-mx-8',
              slide: 'px-5 sm:px-8',
            }}
            getEmblaApi={setEmbla}
            slideGap={{ base: 'xs', sm: 'md' }}
            slideSize={{ base: '86%', lg: '33.333333%', md: '50%', xl: '25%' }}
            withControls={false}
          >
            {data.map((product) => (
              <ErrorBoundary key={product.id} fallback={<Skeleton height={300} radius="md" />}>
                <Carousel.Slide>
                  <ProductCard data={product} />
                </Carousel.Slide>
              </ErrorBoundary>
            ))}
          </Carousel>
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default SectionSliderProductCard;
