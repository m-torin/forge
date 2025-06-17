'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Skeleton, Alert, Text, Stack, Center } from '@mantine/core';
import { IconAlertTriangle, IconMenu2 } from '@tabler/icons-react';

import { SidebarNavigation } from '@/components/ui';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import { TNavigationItem } from '@/types';

interface SidebarNavigationWrapperProps {
  data: TNavigationItem[];
  onClose: () => void;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for SidebarNavigationWrapper
function SidebarNavigationSkeleton() {
  return (
    <Stack gap="md" p="md">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} height={32} width="100%" radius="sm" />
      ))}
    </Stack>
  );
}

// Error state for SidebarNavigationWrapper
function SidebarNavigationError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <Center p="xl">
      <Alert
        icon={<IconAlertTriangle size={20} />}
        title="Navigation Error"
        color="red"
        variant="light"
        maw={300}
      >
        <Stack gap="sm">
          <Text size="sm">{error}</Text>
          {onRetry && (
            <button onClick={onRetry} className="text-sm underline">
              Try Again
            </button>
          )}
        </Stack>
      </Alert>
    </Center>
  );
}

// Zero state for SidebarNavigationWrapper
function SidebarNavigationEmpty() {
  return (
    <Center p="xl">
      <Stack align="center" gap="md">
        <IconMenu2 size={48} color="gray" />
        <Text c="dimmed" ta="center">
          No navigation items
        </Text>
      </Stack>
    </Center>
  );
}

export function SidebarNavigationWrapper({
  data,
  onClose,
  loading = false,
  error,
}: SidebarNavigationWrapperProps) {
  const pathname = usePathname();
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <SidebarNavigationSkeleton />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <SidebarNavigationError error={currentError} onRetry={() => setInternalError(null)} />;
  }

  // Show zero state when no navigation data
  if (!data || data.length === 0) {
    return <SidebarNavigationEmpty />;
  }

  // Close the drawer when the pathname changes (navigation occurred)
  useEffect(() => {
    try {
      onClose();
    } catch (error) {
      console.error('Sidebar navigation close error:', error);
      setInternalError('Failed to close navigation');
    }
  }, [pathname, onClose]);

  return (
    <ErrorBoundary
      fallback={<SidebarNavigationError error="Sidebar navigation failed to render" />}
    >
      <SidebarNavigation data={data} />
    </ErrorBoundary>
  );
}
