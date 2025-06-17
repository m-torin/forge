'use client';

import { Button, Group, Skeleton, Alert, Text } from '@mantine/core';
import { IconArrowRight, IconSearch, IconAlertTriangle } from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface ZeroStateActionsProps {
  homeLabel?: string;
  locale: string;
  searchLabel?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for ZeroStateActions
function ZeroStateActionsSkeleton() {
  return (
    <Group gap="md">
      <Skeleton height={36} width={100} radius="sm" />
      <Skeleton height={36} width={100} radius="sm" />
    </Group>
  );
}

// Error state for ZeroStateActions
function ZeroStateActionsError({ error }: { error: string }) {
  return (
    <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light" maw={300}>
      <Text size="xs">Actions unavailable</Text>
    </Alert>
  );
}

export function ZeroStateActions({
  homeLabel = 'Go Home',
  locale,
  searchLabel = 'Search',
  loading = false,
  error,
}: ZeroStateActionsProps) {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <ZeroStateActionsSkeleton />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <ZeroStateActionsError error={currentError} />;
  }

  const handleNavigation = (url: string) => {
    try {
      // Navigation handled by Link component
    } catch (error) {
      console.error('Zero state navigation error:', error);
      setInternalError('Navigation failed');
    }
  };

  return (
    <ErrorBoundary fallback={<ZeroStateActionsError error="Actions failed to render" />}>
      <Group gap="md">
        <ErrorBoundary fallback={<Skeleton height={36} width={100} radius="sm" />}>
          <Button
            component={Link}
            href={`/${locale}`}
            leftSection={<IconArrowRight size={16} />}
            variant="light"
            onClick={() => handleNavigation(`/${locale}`)}
          >
            {homeLabel}
          </Button>
        </ErrorBoundary>
        <ErrorBoundary fallback={<Skeleton height={36} width={100} radius="sm" />}>
          <Button
            component={Link}
            href={`/${locale}/search`}
            leftSection={<IconSearch size={16} />}
            variant="light"
            onClick={() => handleNavigation(`/${locale}/search`)}
          >
            {searchLabel}
          </Button>
        </ErrorBoundary>
      </Group>
    </ErrorBoundary>
  );
}
