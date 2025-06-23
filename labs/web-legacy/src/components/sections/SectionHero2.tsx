'use client';

import { Button, Skeleton, Text, Center, Stack } from '@mantine/core';
import { IconSearch, IconAlertTriangle, IconPhoto } from '@tabler/icons-react';
import clsx from 'clsx';
import Image from 'next/image';
import { type FC, useEffect, useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

// Demo data - replace with your own images
const heroData = [
  {
    id: 1,
    btnHref: '/collections',
    btnText: 'Shop Now',
    heading: 'Exclusive collection<br />for everyone',
    imageUrl: '/hero-right-1.png',
    subHeading: 'In this season, find the best 🔥',
  },
  {
    id: 2,
    btnHref: '/collections',
    btnText: 'Shop Now',
    heading: 'New arrivals<br />just landed',
    imageUrl: '/hero-right-2.png',
    subHeading: 'Fresh styles, trending now ✨',
  },
  {
    id: 3,
    btnHref: '/collections',
    btnText: 'Shop Now',
    heading: 'Limited edition<br />drops',
    imageUrl: '/hero-right-3.png',
    subHeading: "Get them before they're gone ⚡",
  },
];

export interface SectionHero2Props {
  className?: string;
  data?: typeof heroData;
  autoSlide?: boolean;
  slideInterval?: number;
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for SectionHero2
function SectionHero2Skeleton({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div className={`relative ${className}`} data-testid={testId}>
      <div className="relative flex flex-col gap-10 overflow-hidden py-14 sm:min-h-[calc(100vh-5rem)] lg:flex-row lg:items-center">
        <div className="absolute inset-0 -z-10 bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="container mx-auto px-4 flex flex-col lg:flex-row lg:items-center gap-10">
          <div className="flex-1 relative flex flex-col items-start">
            <Skeleton height={24} width="60%" mb="lg" />
            <Skeleton height={60} width="80%" mb="md" />
            <Skeleton height={20} width="70%" mb="xl" />
            <Skeleton height={48} width={160} radius="md" />
          </div>
          <div className="flex-1 relative">
            <Skeleton height={400} width="100%" radius="md" />
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 justify-center space-x-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={4} width={80} radius="md" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Error state for SectionHero2
function SectionHero2Error({
  error,
  className,
  testId,
}: {
  error: string;
  className?: string;
  testId?: string;
}) {
  return (
    <div className={`relative ${className}`} data-testid={testId}>
      <div className="relative flex flex-col gap-10 overflow-hidden py-14 sm:min-h-[calc(100vh-5rem)] lg:flex-row lg:items-center">
        <div className="absolute inset-0 -z-10 bg-red-50 dark:bg-red-900/20" />
        <div className="container mx-auto px-4">
          <Center py="xl">
            <Stack align="center" gap="md" maw={500}>
              <IconAlertTriangle size={48} color="var(--mantine-color-red-6)" />
              <Text size="xl" fw={600} c="red">
                Hero section failed to load
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                The hero section could not be displayed. Please try refreshing the page.
              </Text>
            </Stack>
          </Center>
        </div>
      </div>
    </div>
  );
}

// Zero state for SectionHero2
function SectionHero2Empty({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div className={`relative ${className}`} data-testid={testId}>
      <div className="relative flex flex-col gap-10 overflow-hidden py-14 sm:min-h-[calc(100vh-5rem)] lg:flex-row lg:items-center">
        <div className="absolute inset-0 -z-10 bg-gray-50 dark:bg-gray-800" />
        <div className="container mx-auto px-4">
          <Center py="xl">
            <Stack align="center" gap="md" maw={500}>
              <IconPhoto size={48} stroke={1} color="var(--mantine-color-gray-5)" />
              <Text size="xl" fw={600} c="dimmed">
                No hero content available
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                Hero content will appear here when it becomes available.
              </Text>
            </Stack>
          </Center>
        </div>
      </div>
    </div>
  );
}

const SectionHero2: FC<SectionHero2Props> = ({
  className = '',
  data = heroData,
  autoSlide = true,
  slideInterval = 5000,
  'data-testid': testId = 'section-hero-2',
  loading = false,
  error,
}) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <SectionHero2Skeleton className={className} testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <SectionHero2Error error={currentError} className={className} testId={testId} />;
  }

  // Show zero state when no data
  if (!data || data.length === 0) {
    return <SectionHero2Empty className={className} testId={testId} />;
  }
  const [indexActive, setIndexActive] = useState(0);

  useEffect(() => {
    if (!autoSlide) return;

    const interval = setInterval(() => {
      setIndexActive((prev) => (prev + 1) % data.length);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, slideInterval, data.length]);

  const renderItem = (index: number) => {
    const isActive = indexActive === index;
    const item = data[index];

    return (
      <div
        key={index}
        className={clsx(
          'relative flex flex-col gap-10 overflow-hidden py-14 sm:min-h-[calc(100vh-5rem)] lg:flex-row lg:items-center transition-opacity duration-500',
          isActive ? 'opacity-100' : 'opacity-0 absolute inset-0',
        )}
      >
        {/* Background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-green-50 to-blue-50 dark:from-neutral-900 dark:to-neutral-800" />

        {/* Content */}
        <div className="container mx-auto px-4 flex flex-col lg:flex-row lg:items-center gap-10">
          <ErrorBoundary
            fallback={
              <div className="flex-1">
                <Skeleton height={200} />
              </div>
            }
          >
            <div className="flex-1 relative flex flex-col items-start">
              <span className="block text-base font-medium text-neutral-700 md:text-xl dark:text-neutral-300">
                {item.subHeading}
              </span>
              <h2
                dangerouslySetInnerHTML={{ __html: item.heading }}
                className="mt-5 text-4xl font-semibold text-neutral-900 sm:mt-6 md:text-5xl xl:text-6xl xl:leading-[1.2] 2xl:text-7xl dark:text-neutral-100"
              />

              <ErrorBoundary fallback={<Skeleton height={48} width={160} radius="md" />}>
                <Button
                  component="a"
                  href={item.btnHref}
                  size="xl"
                  className="mt-10 sm:mt-20"
                  leftSection={<IconSearch size={20} />}
                >
                  {item.btnText}
                </Button>
              </ErrorBoundary>
            </div>
          </ErrorBoundary>

          <ErrorBoundary
            fallback={
              <div className="flex-1">
                <Skeleton height={400} />
              </div>
            }
          >
            <div className="flex-1 relative">
              <Image
                width={790}
                height={790}
                priority={isActive}
                className="select-none object-contain w-full h-auto"
                alt={item.heading}
                sizes="(max-width: 768px) 100vw, 50vw"
                src={item.imageUrl}
              />
            </div>
          </ErrorBoundary>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary
      fallback={
        <SectionHero2Error
          error="Hero section failed to render"
          className={className}
          testId={testId}
        />
      }
    >
      <div className={`relative ${className}`} data-testid={testId}>
        <div className="relative">
          <ErrorBoundary fallback={<SectionHero2Skeleton className={className} testId={testId} />}>
            {data.map((_, index) => renderItem(index))}
          </ErrorBoundary>

          {/* Dots Navigation */}
          <ErrorBoundary
            fallback={
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 justify-center space-x-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-1 w-20 rounded-md bg-gray-300 animate-pulse" />
                ))}
              </div>
            }
          >
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 justify-center space-x-2">
              {data.map((_, index) => {
                const isActive = indexActive === index;
                return (
                  <button
                    key={index}
                    onClick={() => setIndexActive(index)}
                    className="relative px-1 py-1.5 group"
                    aria-label={`Go to slide ${index + 1}`}
                  >
                    <div className="relative h-1 w-20 rounded-md bg-white/50 shadow-sm">
                      {isActive && (
                        <div className="absolute inset-0 rounded-md bg-neutral-900 dark:bg-white transition-all duration-300" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SectionHero2;
