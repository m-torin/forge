import { Button } from '@mantine/core';
import Link from 'next/link';
import { forwardRef } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  size?: 'sm' | 'md' | 'lg';
}

export const ButtonPrimary = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ children, className = '', href, ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-full border border-transparent bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:bg-opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200';

    if (href) {
      return (
        <Button
          component={Link}
          href={href}
          className={`${baseClasses} ${className}`}
          ref={ref as any}
          {...props}
        >
          {children}
        </Button>
      );
    }

    return (
      <Button className={`${baseClasses} ${className}`} ref={ref as any} {...props}>
        {children}
      </Button>
    );
  },
);

ButtonPrimary.displayName = 'ButtonPrimary';

export const ButtonSecondary = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ children, className = '', href, ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:bg-opacity-70 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700';

    if (href) {
      return (
        <Button
          component={Link}
          href={href}
          className={`${baseClasses} ${className}`}
          variant="outline"
          ref={ref as any}
          {...props}
        >
          {children}
        </Button>
      );
    }

    return (
      <Button
        className={`${baseClasses} ${className}`}
        variant="outline"
        ref={ref as any}
        {...props}
      >
        {children}
      </Button>
    );
  },
);

ButtonSecondary.displayName = 'ButtonSecondary';
