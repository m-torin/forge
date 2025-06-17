'use client';
import { Switch, Skeleton, Alert, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { type FC, useEffect, useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

import Label from './Label';

export interface MySwitchProps {
  className?: string;
  'data-testid'?: string;
  desc?: string;
  enabled?: boolean;
  label?: string;
  onChange?: (enabled: boolean) => void;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for MySwitch
function MySwitchSkeleton({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div
      className={`MySwitch flex items-center justify-between space-x-2 ${className}`}
      data-testid={testId}
    >
      <div>
        <Skeleton height={20} width={100} mb="xs" />
        <Skeleton height={16} width={150} />
      </div>
      <Skeleton height={32} width={68} radius="xl" />
    </div>
  );
}

// Error state for MySwitch
function MySwitchError({
  error: _error,
  className,
  testId,
}: {
  error: string;
  className?: string;
  testId?: string;
}) {
  return (
    <div
      className={`MySwitch flex items-center justify-between space-x-2 ${className}`}
      data-testid={testId}
    >
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="sm">Switch failed to load</Text>
      </Alert>
    </div>
  );
}

const MySwitch: FC<MySwitchProps> = ({
  className = '',
  'data-testid': testId = 'switch-toggle',
  desc = "You'll receive bids on this item",
  enabled = false,
  label = 'Put on sale',
  onChange,
  loading = false,
  error,
}) => {
  const [enabledState, setEnabledState] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  useEffect(() => {
    setEnabledState(enabled);
  }, [enabled]);

  // Show loading state
  if (loading) {
    return <MySwitchSkeleton className={className} testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <MySwitchError error={currentError} className={className} testId={testId} />;
  }

  return (
    <ErrorBoundary
      fallback={
        <MySwitchError error="Switch failed to render" className={className} testId={testId} />
      }
    >
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
            try {
              const checked = event.currentTarget.checked;
              setEnabledState(checked);
              onChange && onChange(checked);
            } catch (_err) {
              setInternalError('Failed to toggle switch');
            }
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

export default MySwitch;
