'use client';

import { SidebarFilters } from '@/components/ui';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Skeleton, Stack } from '@mantine/core';

interface ClientSidebarFiltersProps {
  className?: string;
  loading?: boolean;
  error?: string;
}

export function ClientSidebarFilters({
  className,
  loading = false,
  error,
}: ClientSidebarFiltersProps) {
  if (loading) {
    return (
      <div className={className}>
        <Stack gap="md">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton height={20} width="60%" mb="sm" />
              <Stack gap="xs">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} height={16} width="80%" />
                ))}
              </Stack>
            </div>
          ))}
        </Stack>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className={className}>
          <Skeleton height={200} width="100%" />
        </div>
      }
    >
      <SidebarFilters className={className} loading={loading} error={error} />
    </ErrorBoundary>
  );
}
