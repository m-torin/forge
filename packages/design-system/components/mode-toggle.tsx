'use client';

import { ActionIcon, Menu, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { useTheme } from 'next-themes';

const themes = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
];

export const ModeToggle = () => {
  const { setTheme, theme: _theme } = useTheme();
  const { colorScheme } = useMantineColorScheme();

  return (
    <Menu>
      <Menu.Target>
        <ActionIcon aria-label="Toggle theme" size="lg" variant="subtle">
          {colorScheme === 'dark' ? <IconMoon size={20} /> : <IconSun size={20} />}
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {themes.map(({ label, value }) => (
          <Menu.Item key={value} onClick={() => setTheme(value)}>
            {label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};
