'use client';

import { type FC, useState } from 'react';
import { Skeleton, Alert, Text } from '@mantine/core';
import { IconAlertTriangle, IconGift } from '@tabler/icons-react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import ButtonPrimary from './shared/Button/ButtonPrimary';
import ButtonSecondary from './shared/Button/ButtonSecondary';
import Logo from './shared/Logo/Logo';

export interface SectionPromo1Props {
  className?: string;
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for SectionPromo1
function SectionPromo1Skeleton({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div
      className={`relative flex flex-col items-center lg:flex-row ${className}`}
      data-testid={testId}
    >
      <div className="relative mb-16 shrink-0 lg:mr-10 lg:mb-0 lg:w-2/5">
        <Skeleton height={32} width={112} mb="lg" />
        <Skeleton height={48} width="90%" mb="md" />
        <Skeleton height={24} width="80%" mb="lg" />
        <div className="flex space-x-4">
          <Skeleton height={40} width={120} />
          <Skeleton height={40} width={140} />
        </div>
      </div>
      <div className="relative max-w-xl flex-1 lg:max-w-none">
        <Skeleton height={256} radius="lg" />
      </div>
    </div>
  );
}

// Error state for SectionPromo1
function SectionPromo1Error({
  error: _error,
  className,
  testId,
}: {
  error: string;
  className?: string;
  testId?: string;
}) {
  return (
    <div
      className={`relative flex flex-col items-center lg:flex-row ${className}`}
      data-testid={testId}
    >
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="sm">Promo section failed to load</Text>
      </Alert>
    </div>
  );
}

// Zero state for SectionPromo1
function _SectionPromo1Empty({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div
      className={`relative flex flex-col items-center lg:flex-row ${className}`}
      data-testid={testId}
    >
      <div className="relative mb-16 shrink-0 lg:mr-10 lg:mb-0 lg:w-2/5">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <IconGift size={48} stroke={1} color="var(--mantine-color-gray-5)" />
          <Text size="lg" fw={600} c="dimmed" mt="md">
            No promotion available
          </Text>
          <Text size="sm" c="dimmed" mt="xs">
            Check back later for exciting offers
          </Text>
        </div>
      </div>
    </div>
  );
}

const SectionPromo1: FC<SectionPromo1Props> = ({
  className = '',
  'data-testid': testId = 'section-promo-1',
  loading = false,
  error: _error,
}) => {
  const [internalError, _setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <SectionPromo1Skeleton className={className} testId={testId} />;
  }

  // Show error state
  const currentError = _error || internalError;
  if (currentError) {
    return <SectionPromo1Error error={currentError} className={className} testId={testId} />;
  }
  return (
    <ErrorBoundary
      fallback={
        <SectionPromo1Error
          error="Promo section failed to render"
          className={className}
          testId={testId}
        />
      }
    >
      <div
        className={`relative flex flex-col items-center lg:flex-row ${className}`}
        data-testid={testId}
      >
        <ErrorBoundary fallback={<Skeleton height={200} radius="lg" />}>
          <div className="relative mb-16 shrink-0 lg:mr-10 lg:mb-0 lg:w-2/5">
            <ErrorBoundary fallback={<Skeleton height={32} width={112} />}>
              <Logo className="w-28" />
            </ErrorBoundary>
            <h2 className="mt-6 text-3xl leading-[1.2] font-semibold tracking-tight sm:mt-10 sm:text-4xl xl:text-5xl 2xl:text-6xl">
              Earn free money <br /> with Ciseco.
            </h2>
            <span className="mt-6 block text-neutral-500 dark:text-neutral-400">
              With Ciseco you will get freeship & savings combo.
            </span>
            <div className="mt-6 flex space-x-2 sm:mt-12 sm:space-x-5">
              <ErrorBoundary fallback={<Skeleton height={40} width={120} />}>
                <ButtonPrimary className="" href="/collection">
                  Savings combo
                </ButtonPrimary>
              </ErrorBoundary>
              <ErrorBoundary fallback={<Skeleton height={40} width={140} />}>
                <ButtonSecondary
                  className="border border-neutral-100 dark:border-neutral-700"
                  href="/search"
                >
                  Discover more
                </ButtonSecondary>
              </ErrorBoundary>
            </div>
          </div>
        </ErrorBoundary>
        <ErrorBoundary fallback={<Skeleton height={256} radius="lg" />}>
          <div className="relative max-w-xl flex-1 lg:max-w-none">
            <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Promo Image Placeholder</span>
            </div>
          </div>
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default SectionPromo1;
