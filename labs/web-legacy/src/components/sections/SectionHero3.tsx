'use client';

import { Button, Skeleton, Text, Center, Stack } from '@mantine/core';
import { IconSearch, IconAlertTriangle, IconPhoto } from '@tabler/icons-react';
import Image from 'next/image';
import { type FC, useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

export interface SectionHero3Props {
  className?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonHref?: string;
  heroImage?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for SectionHero3
function SectionHero3Skeleton({
  className,
  backgroundColor,
  testId,
}: {
  className?: string;
  backgroundColor?: string;
  testId?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${backgroundColor || 'bg-gray-100'} ${className}`}
      data-testid={testId}
    >
      <div className="relative inset-x-0 px-8 pt-8 lg:absolute lg:top-1/5 lg:pt-0 z-10">
        <div className="flex max-w-lg flex-col items-start gap-y-5 xl:max-w-2xl xl:gap-y-8">
          <Skeleton height={24} width="60%" />
          <Skeleton height={60} width="90%" />
          <Skeleton height={48} width={200} radius="md" />
        </div>
      </div>
      <div className="relative lg:aspect-[16/8] 2xl:aspect-[16/7]">
        <div className="bottom-0 end-0 top-0 ml-auto mt-5 w-full max-w-md sm:max-w-xl lg:absolute lg:mt-0 lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl">
          <Skeleton height={400} width="100%" />
        </div>
      </div>
    </div>
  );
}

// Error state for SectionHero3
function SectionHero3Error({
  error,
  className,
  backgroundColor,
  testId,
}: {
  error: string;
  className?: string;
  backgroundColor?: string;
  testId?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${backgroundColor || 'bg-red-50'} ${className}`}
      data-testid={testId}
    >
      <Center py="xl" px="lg" mih={300}>
        <Stack align="center" gap="md" maw={400}>
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
  );
}

// Zero state for SectionHero3
function SectionHero3Empty({
  className,
  backgroundColor,
  testId,
}: {
  className?: string;
  backgroundColor?: string;
  testId?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${backgroundColor || 'bg-gray-50'} ${className}`}
      data-testid={testId}
    >
      <Center py="xl" px="lg" mih={300}>
        <Stack align="center" gap="md" maw={400}>
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
  );
}

const SectionHero3: FC<SectionHero3Props> = ({
  className = '',
  title = 'Sports equipment collection.',
  subtitle = 'In this season, find the best 🔥',
  buttonText = 'Start your search',
  buttonHref = '/search',
  heroImage = '/hero-right-4.png',
  backgroundImage = '/background-line.svg',
  backgroundColor = 'bg-orange-50',
  'data-testid': testId = 'section-hero-3',
  loading = false,
  error,
}) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return (
      <SectionHero3Skeleton
        className={className}
        backgroundColor={backgroundColor}
        testId={testId}
      />
    );
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return (
      <SectionHero3Error
        error={currentError}
        className={className}
        backgroundColor={backgroundColor}
        testId={testId}
      />
    );
  }

  // Show zero state when no title or critical content
  if (!title && !subtitle) {
    return (
      <SectionHero3Empty className={className} backgroundColor={backgroundColor} testId={testId} />
    );
  }
  return (
    <ErrorBoundary
      fallback={
        <SectionHero3Error
          error="Hero section failed to render"
          className={className}
          backgroundColor={backgroundColor}
          testId={testId}
        />
      }
    >
      <div
        className={`relative overflow-hidden rounded-2xl ${backgroundColor} ${className}`}
        data-testid={testId}
      >
        <ErrorBoundary
          fallback={
            <div className="px-8 pt-8">
              <Skeleton height={200} />
            </div>
          }
        >
          <div className="relative inset-x-0 px-8 pt-8 lg:absolute lg:top-1/5 lg:pt-0 z-10">
            <div className="flex max-w-lg flex-col items-start gap-y-5 xl:max-w-2xl xl:gap-y-8">
              <span className="font-semibold text-neutral-600 sm:text-lg md:text-xl">
                {subtitle}
              </span>
              <h2 className="text-3xl font-bold leading-[1.15] text-neutral-950 sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl">
                {title}
              </h2>
              <div className="sm:pt-5">
                <ErrorBoundary fallback={<Skeleton height={48} width={200} radius="md" />}>
                  <Button
                    component="a"
                    href={buttonHref}
                    size="lg"
                    leftSection={<IconSearch size={24} />}
                  >
                    {buttonText}
                  </Button>
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </ErrorBoundary>

        <ErrorBoundary
          fallback={
            <div className="relative lg:aspect-[16/8] 2xl:aspect-[16/7]">
              <Skeleton height={400} />
            </div>
          }
        >
          <div className="relative lg:aspect-[16/8] 2xl:aspect-[16/7]">
            <div>
              <div className="bottom-0 end-0 top-0 ml-auto mt-5 w-full max-w-md sm:max-w-xl lg:absolute lg:mt-0 lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl">
                <Image
                  width={800}
                  height={600}
                  priority
                  className="object-bottom-right inset-0 w-full object-contain sm:h-full lg:absolute"
                  alt="hero"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  src={heroImage}
                />
              </div>
            </div>
          </div>
        </ErrorBoundary>

        {/* Background decoration */}
        {backgroundImage && (
          <ErrorBoundary fallback={null}>
            <div className="absolute inset-10 -z-10">
              <Image
                className="object-contain opacity-10"
                alt="background decoration"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                src={backgroundImage}
              />
            </div>
          </ErrorBoundary>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SectionHero3;
