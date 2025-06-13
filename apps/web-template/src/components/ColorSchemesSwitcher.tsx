'use client';

import { ActionIcon, Group, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';

export function ColorSchemesSwitcher() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

  return (
    <Group justify="center">
      <ActionIcon
        aria-label="Toggle color scheme"
        radius="sm"
        size="xl"
        variant="default"
        onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
      >
        {computedColorScheme === 'dark' ? (
          <IconSun size={22} stroke={1.5} />
        ) : (
          <IconMoon size={22} stroke={1.5} />
        )}
      </ActionIcon>
    </Group>
  );
}
