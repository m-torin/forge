'use client';

import { Switch, useMantineColorScheme } from '@mantine/core';
import clsx from 'clsx';
import React from 'react';

export interface SwitchDarkMode2Props extends Record<string, any> {
  className?: string;
  'data-testid'?: string;
}
const SwitchDarkMode2: React.FC<SwitchDarkMode2Props> = ({
  className,
  'data-testid': testId = 'switch-dark-mode-2',
}) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <div className={clsx('inline-flex', className)}>
      <Switch
        aria-label="Enable dark mode"
        checked={isDarkMode}
        classNames={{
          root: 'w-[42px]',
          thumb: 'h-[14px] w-[14px]',
          track: 'cursor-pointer h-[22px] w-[42px] border-4 border-transparent',
        }}
        color={isDarkMode ? 'teal.9' : 'teal.6'}
        data-testid={testId}
        size="sm"
        onChange={() => toggleColorScheme()}
      />
    </div>
  );
};

export default SwitchDarkMode2;
