/**
 * Harmony Card Component
 *
 * Unified card component that uses Mantine Card with our design system
 */

import { Card as MantineCard, CardProps as MantineCardProps } from '@mantine/core';
import { clsx } from 'clsx';
import { forwardRef } from 'react';

export interface HarmonyCardProps extends MantineCardProps {
  harmony?: boolean; // Enable harmony styling
  interactive?: boolean; // Enable interactive hover effects
}

export const HarmonyCard = forwardRef<HTMLDivElement, HarmonyCardProps>(
  ({ harmony = true, interactive = false, className, children, ...props }, ref) => {
    return (
      <MantineCard
        ref={ref}
        className={clsx(harmony && 'harmony-card', interactive && 'harmony-interactive', className)}
        withBorder
        shadow="sm"
        radius="lg"
        {...props}
      >
        {children}
      </MantineCard>
    );
  },
);

HarmonyCard.displayName = 'HarmonyCard';
