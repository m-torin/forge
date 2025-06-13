'use client';
import { Switch } from '@mantine/core';
import { type FC, useEffect, useState } from 'react';

import Label from './Label';

export interface MySwitchProps {
  className?: string;
  'data-testid'?: string;
  desc?: string;
  enabled?: boolean;
  label?: string;
  onChange?: (enabled: boolean) => void;
}

const MySwitch: FC<MySwitchProps> = ({
  className = '',
  'data-testid': testId = 'switch-toggle',
  desc = "You'll receive bids on this item",
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
      className={`MySwitch flex items-center justify-between space-x-2 ${className}`}
      data-testid={testId}
    >
      <div>
        <Label data-testid="switch-label">{label}</Label>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{desc}</p>
      </div>
      <Switch
        aria-label={label}
        checked={enabledState}
        classNames={{
          root: 'w-[68px]',
          thumb: 'h-7 w-7',
          track: 'cursor-pointer h-8 w-[68px]',
        }}
        color="teal"
        size="lg"
        styles={{
          track: {
            backgroundColor: enabledState ? undefined : 'var(--mantine-color-gray-4)',
          },
        }}
        onChange={(event: any) => {
          const checked = event.currentTarget.checked;
          setEnabledState(checked);
          onChange && onChange(checked);
        }}
      />
    </div>
  );
};

export default MySwitch;
