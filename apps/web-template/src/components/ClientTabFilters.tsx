'use client';

import { TabFilters, TabFiltersPopover } from '@/components/ui';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Skeleton } from '@mantine/core';

interface ClientTabFiltersProps {
  className?: string;
  loading?: boolean;
  error?: string;
}

export function ClientTabFilters({ className, loading = false, error }: ClientTabFiltersProps) {
  if (loading) {
    return <Skeleton height={40} width="100%" className={className} />;
  }

  return (
    <ErrorBoundary fallback={<Skeleton height={40} width="100%" className={className} />}>
      <TabFilters className={className} loading={loading} error={error} />
    </ErrorBoundary>
  );
}

export function ClientTabFiltersPopover({
  className,
  loading = false,
  error,
}: ClientTabFiltersProps) {
  if (loading) {
    return <Skeleton height={40} width={120} className={className} />;
  }

  return (
    <ErrorBoundary fallback={<Skeleton height={40} width={120} className={className} />}>
      <TabFiltersPopover className={className} loading={loading} error={error} />
    </ErrorBoundary>
  );
}
