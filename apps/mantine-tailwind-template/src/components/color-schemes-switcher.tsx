'use client';

import { AnalyticsEvents, trackEvent } from '#/lib/analytics';
import { ActionIcon, Group, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { logInfo, logWarn } from '@repo/observability';
import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react';

export function ColorSchemesSwitcher() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  // Track theme changes with analytics
  const handleThemeChange = async (theme: 'light' | 'dark' | 'auto') => {
    try {
      // Track the theme change event
      await trackEvent(AnalyticsEvents.THEME_CHANGED, {
        new_theme: theme,
        previous_theme: computedColorScheme,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        triggered_by: 'color_scheme_switcher',
      });

      // Set the actual theme
      setColorScheme(theme);

      logInfo('[Color Scheme Switcher] Theme changed', {
        newTheme: theme,
        previousTheme: computedColorScheme,
      });
    } catch (error) {
      logWarn('Theme change tracking failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      // Still change the theme even if tracking fails
      setColorScheme(theme);
    }
  };

  return (
    <Group gap="xs">
      <ActionIcon
        onClick={() => handleThemeChange('light')}
        variant={computedColorScheme === 'light' ? 'filled' : 'default'}
        size="lg"
        aria-label="Switch to light theme"
      >
        <IconSun size={18} />
      </ActionIcon>

      <ActionIcon
        onClick={() => handleThemeChange('dark')}
        variant={computedColorScheme === 'dark' ? 'filled' : 'default'}
        size="lg"
        aria-label="Switch to dark theme"
      >
        <IconMoon size={18} />
      </ActionIcon>

      <ActionIcon
        onClick={() => handleThemeChange('auto')}
        variant="default"
        size="lg"
        aria-label="Use system theme"
      >
        <IconDeviceDesktop size={18} />
      </ActionIcon>
    </Group>
  );
}
