'use client';
import { Switch } from '@mantine/core';
import { type FC, useEffect, useState } from 'react';

import Label from './Label/Label';

export interface MySwitchProps {
  className?: string;
  'data-testid'?: string;
  desc?: string;
  enabled?: boolean;
  label?: string;
  onChange?: (enabled: boolean) => void;
}

const MySwitch: FC<MySwitchProps> = ({
  'data-testid': testId = 'switch-toggle',
  className = '',
  desc = 'You’ll receive bids on this item',
  enabled = false,
  label = 'Put on sale',
  onChange,
}) => {
  const [enabledState, setEnabledState] = useState(false);

  useEffect(() => {
    setEnabledState(enabled);
  }, [enabled]);

  return (
    <div
      data-testid={testId}
      className={`MySwitch flex items-center justify-between space-x-2 ${className}`}
    >
      <div>
        <Label data-testid="switch-label">{label}</Label>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{desc}</p>
      </div>
      <Switch
        color="teal"
        onChange={(event) => {
          const checked = event.currentTarget.checked;
          setEnabledState(checked);
          onChange && onChange(checked);
        }}
        classNames={{
          root: 'w-[68px]',
          thumb: 'h-7 w-7',
          track: 'cursor-pointer h-8 w-[68px]',
        }}
        styles={{
          track: {
            backgroundColor: enabledState ? undefined : 'var(--mantine-color-gray-4)',
          },
        }}
        aria-label={label}
        checked={enabledState}
        size="lg"
      />
    </div>
  );
};

export default MySwitch;
