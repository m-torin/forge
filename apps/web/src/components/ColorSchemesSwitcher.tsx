'use client';

import {
  ActionIcon,
  Group,
  useComputedColorScheme,
  useMantineColorScheme,
  Skeleton,
} from '@mantine/core';
import { IconMoon, IconSun, IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { logger } from '@/lib/logger';

interface ColorSchemesSwitcherProps {
  loading?: boolean;
  error?: string;
}

// Loading skeleton for ColorSchemesSwitcher
function ColorSchemesSwitcherSkeleton() {
  return (
    <Group justify="center">
      <Skeleton height={40} width={40} radius="sm" />
    </Group>
  );
}

// Error state for ColorSchemesSwitcher
function ColorSchemesSwitcherError({ error: _error }: { error: string }) {
  return (
    <Group justify="center">
      <ActionIcon
        aria-label="Theme switcher error"
        radius="sm"
        size="xl"
        variant="light"
        color="red"
        disabled
      >
        <IconAlertTriangle size={22} />
      </ActionIcon>
    </Group>
  );
}

export function ColorSchemesSwitcher({ loading = false, error }: ColorSchemesSwitcherProps = {}) {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <ColorSchemesSwitcherSkeleton />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <ColorSchemesSwitcherError error={currentError} />;
  }

  const handleToggle = () => {
    try {
      setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light');
    } catch (_error) {
      logger.error('Color scheme toggle error', _error);
      setInternalError('Failed to toggle theme');
    }
  };

  return (
    <ErrorBoundary fallback={<ColorSchemesSwitcherError error="Theme switcher failed to render" />}>
      <Group justify="center">
        <ActionIcon
          aria-label="Toggle color scheme"
          radius="sm"
          size="xl"
          variant="default"
          onClick={handleToggle}
        >
          {computedColorScheme === 'dark' ? (
            <IconSun size={22} stroke={1.5} />
          ) : (
            <IconMoon size={22} stroke={1.5} />
          )}
        </ActionIcon>
      </Group>
    </ErrorBoundary>
  );
}
