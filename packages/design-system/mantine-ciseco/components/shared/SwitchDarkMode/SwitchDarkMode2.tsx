'use client';

import { Switch } from '@mantine/core';
import clsx from 'clsx';
import React from 'react';

import { useThemeMode } from '../../../hooks/useThemeMode';

export interface SwitchDarkMode2Props {
  className?: string;
}
const SwitchDarkMode2: React.FC<SwitchDarkMode2Props> = ({ className }) => {
  const { _toogleDarkMode, isDarkMode } = useThemeMode();

  return (
    <div className={clsx('inline-flex', className)}>
      <Switch
        color={isDarkMode ? 'teal.9' : 'teal.6'}
        onChange={(event) => _toogleDarkMode()}
        classNames={{
          root: 'w-[42px]',
          thumb: 'h-[14px] w-[14px]',
          track: 'cursor-pointer h-[22px] w-[42px] border-4 border-transparent',
        }}
        aria-label="Enable dark mode"
        checked={isDarkMode}
        size="sm"
      />
    </div>
  );
};

export default SwitchDarkMode2;
