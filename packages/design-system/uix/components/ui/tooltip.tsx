'use client';

import { Tooltip as MantineTooltip, type TooltipProps as MantineTooltipProps } from '@mantine/core';
import * as React from 'react';

// Wrapper component that provides shadcn/ui-like API
export const Tooltip = ({
  children,
  label,
  ...props
}: { children: React.ReactNode; label?: string } & MantineTooltipProps) => {
  if (label) {
    return (
      <MantineTooltip label={label} {...props}>
        {children}
      </MantineTooltip>
    );
  }
  // If no label, just render children (for compound component usage)
  return <>{children}</>;
};

// Export the original Mantine TooltipProps
export type TooltipProps = MantineTooltipProps;

// For compatibility with shadcn/ui compound components
export const TooltipTrigger = ({ children }: { children: React.ReactNode }) => children;
export const TooltipContent = ({ children }: { children: React.ReactNode }) => children;
export const TooltipProvider = ({ children }: { children: React.ReactNode }) => children;
