/**
 * Pure Tailwind Card Components
 *
 * Replaces Mantine Card with Tailwind-only implementation
 */

import { clsx } from 'clsx';
import { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  withBorder?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      withBorder = false,
      shadow = 'sm',
      radius = 'md',
      padding = 'md',
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const baseClasses = 'bg-white overflow-hidden';

    const borderClasses = withBorder ? 'border border-gray-200' : '';

    const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
    };

    const radiusClasses = {
      none: '',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
    };

    const paddingClasses = {
      none: '',
      xs: 'p-2',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    };

    const classes = clsx(
      baseClasses,
      borderClasses,
      shadowClasses[shadow],
      radiusClasses[radius],
      paddingClasses[padding],
      className,
    );

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

// Card Header Component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    const classes = clsx('px-6 py-4 border-b border-gray-200', className);

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  },
);

CardHeader.displayName = 'CardHeader';

// Card Content Component
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    const classes = clsx('px-6 py-4', className);

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  },
);

CardContent.displayName = 'CardContent';

// Card Footer Component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    const classes = clsx('px-6 py-4 border-t border-gray-200 bg-gray-50', className);

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  },
);

CardFooter.displayName = 'CardFooter';
