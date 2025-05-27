// Export Mantine Card and create simple component mappings
import {
  Group,
  Card as MantineCard,
  type CardProps as MantineCardProps,
  Text,
} from '@mantine/core';
import * as React from 'react';

export { MantineCard as Card };
export type CardProps = MantineCardProps;

// Simple wrapper components for compatibility
export const CardHeader = ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => (
  <div {...props}>{children}</div>
);

export const CardTitle = ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => (
  <Text component="div" fw={600} size="lg" {...props}>
    {children}
  </Text>
);

export const CardDescription = ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => (
  <Text component="div" c="dimmed" size="sm" {...props}>
    {children}
  </Text>
);

export const CardContent = ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => (
  <div {...props}>{children}</div>
);

export const CardFooter = ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => (
  <Group {...props}>{children}</Group>
);

export const CardAction = ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => (
  <div {...props}>{children}</div>
);
