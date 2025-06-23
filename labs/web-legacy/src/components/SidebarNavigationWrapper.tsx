'use client';

import { logger } from '@/lib/logger';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Skeleton, Alert, Text, Stack, Center } from '@mantine/core';
import { IconAlertTriangle, IconMenu2 } from '@tabler/icons-react';

import { SidebarNavigation } from '@/components/ui';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import type { TNavigationItem } from '@/types';

interface SidebarNavigationWrapperProps {
  data: TNavigationItem[] | null;
  onClose: () => void;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for SidebarNavigation
function SidebarNavigationSkeleton() {
  return (
    <Stack gap="md" p="md">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} height={40} radius="sm" />
      ))}
    </Stack>
  );
}

// Error state for SidebarNavigation
function SidebarNavigationError({
  error: _error,
  onRetry: _onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) {
  return (
    <Center p="xl">
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="sm">Navigation failed to load</Text>
      </Alert>
    </Center>
  );
}

// Empty state for SidebarNavigation
function SidebarNavigationEmpty() {
  return (
    <Center p="xl">
      <Stack align="center" gap="sm">
        <IconMenu2 size={48} className="text-gray-400" />
        <Text size="sm" c="dimmed">
          No navigation items available
        </Text>
      </Stack>
    </Center>
  );
}

/**
 * Wrapper component that handles the state management and lifecycle
 * of the SidebarNavigation component, including closing on navigation
 */
export function SidebarNavigationWrapper({
  data,
  onClose,
  loading = false,
  error,
}: SidebarNavigationWrapperProps) {
  const pathname = usePathname();
  const [internalError, _setInternalError] = useState<string | null>(null);

  // Close the drawer when the pathname changes (navigation occurred)
  useEffect(() => {
    if (data && data.length > 0) {
      try {
        onClose();
      } catch (_error) {
        logger.error('Sidebar navigation close error', _error);
        _setInternalError('Failed to close navigation');
      }
    }
  }, [pathname, onClose, data]);

  // Show loading state
  if (loading) {
    return <SidebarNavigationSkeleton />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <SidebarNavigationError error={currentError} onRetry={() => _setInternalError(null)} />;
  }

  // Show zero state when no navigation data
  if (!data || data.length === 0) {
    return <SidebarNavigationEmpty />;
  }

  return (
    <ErrorBoundary
      fallback={<SidebarNavigationError error="Sidebar navigation failed to render" />}
    >
      <SidebarNavigation data={data} />
    </ErrorBoundary>
  );
}
