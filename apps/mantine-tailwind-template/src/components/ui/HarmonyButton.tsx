/**
 * Harmony Button Component
 *
 * Unified button component that combines Mantine functionality with our design system
 * Uses Mantine Button with custom styling for consistency
 */

import { Button as MantineButton, ButtonProps as MantineButtonProps } from '@mantine/core';
import { clsx } from 'clsx';
import { forwardRef } from 'react';

export interface HarmonyButtonProps extends Omit<MantineButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  harmony?: boolean; // Enable harmony styling
}

export const HarmonyButton = forwardRef<HTMLButtonElement, HarmonyButtonProps>(
  ({ variant = 'primary', harmony = true, className, children, ...props }, ref) => {
    // Map our variants to Mantine variants + custom styling
    const getVariantProps = () => {
      switch (variant) {
        case 'primary':
          return {
            variant: 'filled' as const,
            color: 'primary',
            className: harmony ? 'harmony-button-primary' : undefined,
          };
        case 'secondary':
          return {
            variant: 'filled' as const,
            color: 'gray',
            className: harmony ? 'harmony-button-secondary' : undefined,
          };
        case 'outline':
          return {
            variant: 'outline' as const,
            color: 'primary',
            className: harmony ? 'harmony-button-outline' : undefined,
          };
        case 'ghost':
          return {
            variant: 'subtle' as const,
            color: 'gray',
            className: harmony ? 'harmony-button-ghost' : undefined,
          };
        case 'danger':
          return {
            variant: 'filled' as const,
            color: 'error',
            className: harmony ? 'harmony-button-danger' : undefined,
          };
        default:
          return {
            variant: 'filled' as const,
            color: 'primary',
          };
      }
    };

    const variantProps = getVariantProps();

    return (
      <MantineButton
        ref={ref}
        {...variantProps}
        className={clsx(
          harmony && 'harmony-transition harmony-interactive',
          variantProps.className,
          className,
        )}
        {...props}
      >
        {children}
      </MantineButton>
    );
  },
);

HarmonyButton.displayName = 'HarmonyButton';
