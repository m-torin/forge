'use client';

import { Loader } from '@mantine/core';
import { useTransition } from 'react';

export interface LoadingIndicatorProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  'data-testid'?: string;
}

export function LoadingIndicator({
  size = 'xs',
  'data-testid': testId = 'navigation-loading',
}: LoadingIndicatorProps) {
  const [isPending] = useTransition();

  return isPending ? <Loader size={size} data-testid={testId} display="inline-block" /> : null;
}
