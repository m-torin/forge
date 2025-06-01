// Use Mantine Button as Toggle
import { Button, type ButtonProps } from '@mantine/core';
import * as React from 'react';

export const Toggle = React.forwardRef<HTMLButtonElement, ButtonProps & { pressed?: boolean }>(
  ({ pressed, variant = pressed ? 'filled' : 'subtle', ...props }, ref) => (
    <Button ref={ref} data-state={pressed ? 'on' : 'off'} variant={variant} {...props} />
  ),
);

Toggle.displayName = 'Toggle';

export type ToggleProps = ButtonProps & { pressed?: boolean };
