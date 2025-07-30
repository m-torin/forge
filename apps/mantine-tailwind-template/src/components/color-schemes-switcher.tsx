'use client';

import { ActionIcon, Group, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react';

export function ColorSchemesSwitcher() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  return (
    <Group gap="xs">
      <ActionIcon
        onClick={() => setColorScheme('light')}
        variant={computedColorScheme === 'light' ? 'filled' : 'default'}
        size="lg"
        aria-label="Switch to light theme"
      >
        <IconSun size={18} />
      </ActionIcon>

      <ActionIcon
        onClick={() => setColorScheme('dark')}
        variant={computedColorScheme === 'dark' ? 'filled' : 'default'}
        size="lg"
        aria-label="Switch to dark theme"
      >
        <IconMoon size={18} />
      </ActionIcon>

      <ActionIcon
        onClick={() => setColorScheme('auto')}
        variant="default"
        size="lg"
        aria-label="Use system theme"
      >
        <IconDeviceDesktop size={18} />
      </ActionIcon>
    </Group>
  );
}
