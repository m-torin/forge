'use client';

import clsx from 'clsx';
import { type FC, useState } from 'react';
import { Skeleton, Alert, Text } from '@mantine/core';
import { IconAlertTriangle, IconGift } from '@tabler/icons-react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import ButtonPrimary from './shared/Button/ButtonPrimary';
import Logo from './shared/Logo/Logo';

export interface SectionPromo2Props {
  className?: string;
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for SectionPromo2
function SectionPromo2Skeleton({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div className={clsx(className, 'xl:pt-10 2xl:pt-24')} data-testid={testId}>
      <div className="relative flex flex-col rounded-2xl bg-yellow-50 p-4 pb-0 sm:rounded-[40px] sm:p-5 sm:pb-0 lg:flex-row lg:justify-end lg:p-14 xl:px-20 xl:py-24 2xl:py-32 dark:bg-neutral-800">
        <div className="relative max-w-lg lg:w-[45%]">
          <Skeleton height={32} width={112} mb="lg" />
          <Skeleton height={48} width="90%" mb="md" />
          <Skeleton height={24} width="80%" mb="lg" />
          <Skeleton height={40} width={140} />
        </div>
        <div className="relative mt-10 block max-w-xl lg:absolute lg:bottom-0 lg:left-0 lg:mt-0 lg:max-w-[calc(55%-40px)]">
          <Skeleton height={160} radius="lg" />
        </div>
      </div>
    </div>
  );
}

// Error state for SectionPromo2
function SectionPromo2Error({
  error,
  className,
  testId,
}: {
  error: string;
  className?: string;
  testId?: string;
}) {
  return (
    <div className={clsx(className, 'xl:pt-10 2xl:pt-24')} data-testid={testId}>
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="sm">Promo section failed to load</Text>
      </Alert>
    </div>
  );
}

// Zero state for SectionPromo2
function SectionPromo2Empty({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div className={clsx(className, 'xl:pt-10 2xl:pt-24')} data-testid={testId}>
      <div className="relative flex flex-col rounded-2xl bg-yellow-50 p-4 pb-0 sm:rounded-[40px] sm:p-5 sm:pb-0 lg:flex-row lg:justify-end lg:p-14 xl:px-20 xl:py-24 2xl:py-32 dark:bg-neutral-800">
        <div className="flex flex-col items-center justify-center py-12 text-center w-full">
          <IconGift size={48} stroke={1} color="var(--mantine-color-gray-5)" />
          <Text size="lg" fw={600} c="dimmed" mt="md">
            No special offer available
          </Text>
          <Text size="sm" c="dimmed" mt="xs">
            Check back later for exciting deals
          </Text>
        </div>
      </div>
    </div>
  );
}

const SectionPromo2: FC<SectionPromo2Props> = ({
  className,
  'data-testid': testId = 'section-promo-2',
  loading = false,
  error,
}) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <SectionPromo2Skeleton className={className} testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <SectionPromo2Error error={currentError} className={className} testId={testId} />;
  }
  return (
    <ErrorBoundary
      fallback={
        <SectionPromo2Error
          error="Promo section failed to render"
          className={className}
          testId={testId}
        />
      }
    >
      <div className={clsx(className, 'xl:pt-10 2xl:pt-24')} data-testid={testId}>
        <div className="relative flex flex-col rounded-2xl bg-yellow-50 p-4 pb-0 sm:rounded-[40px] sm:p-5 sm:pb-0 lg:flex-row lg:justify-end lg:p-14 xl:px-20 xl:py-24 2xl:py-32 dark:bg-neutral-800">
          <ErrorBoundary fallback={<Skeleton height={200} radius="lg" />}>
            <div className="relative max-w-lg lg:w-[45%]">
              <ErrorBoundary fallback={<Skeleton height={32} width={112} />}>
                <Logo className="w-28" />
              </ErrorBoundary>
              <h2 className="mt-6 text-3xl leading-[1.13] font-semibold tracking-tight sm:mt-10 sm:text-4xl xl:text-5xl 2xl:text-6xl">
                Special offer <br />
                in kids products
              </h2>
              <span className="mt-6 block text-neutral-500 dark:text-neutral-400">
                Fashion is a form of self-expression and autonomy at a particular period and place.
              </span>
              <div className="mt-6 flex space-x-2 sm:mt-12 sm:space-x-5">
                <ErrorBoundary fallback={<Skeleton height={40} width={140} />}>
                  <ButtonPrimary
                    className="dark:bg-neutral-200 dark:text-neutral-900"
                    href="/search"
                  >
                    Discover more
                  </ButtonPrimary>
                </ErrorBoundary>
              </div>
            </div>
          </ErrorBoundary>

          <ErrorBoundary fallback={<Skeleton height={160} radius="lg" />}>
            <div className="relative mt-10 block max-w-xl lg:absolute lg:bottom-0 lg:left-0 lg:mt-0 lg:max-w-[calc(55%-40px)]">
              <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Promo Image Placeholder</span>
              </div>
            </div>
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SectionPromo2;
