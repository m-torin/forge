import { Button } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import clsx from 'clsx';
import Link from 'next/link';
import type React from 'react';

export function Pagination({
  'aria-label': ariaLabel = 'Page navigation',
  className,
  ...props
}: React.ComponentPropsWithoutRef<'nav'>) {
  return <nav aria-label={ariaLabel} {...props} className={clsx(className, 'flex gap-x-5')} />;
}

export function PaginationPrevious({
  children = 'Previous',
  className,
  href = null,
}: React.PropsWithChildren<{ href?: string | null; className?: string }>) {
  return (
    <span className={clsx(className, 'grow basis-0')}>
      <Button
        component={href ? Link : 'button'}
        href={href || undefined}
        disabled={href === null}
        leftSection={<IconChevronLeft size={16} />}
        variant="light"
        aria-label="Previous page"
      >
        {children}
      </Button>
    </span>
  );
}

export function PaginationNext({
  children = 'Next',
  className,
  href = null,
}: React.PropsWithChildren<{ href?: string | null; className?: string }>) {
  return (
    <span className={clsx(className, 'flex grow basis-0 justify-end')}>
      <Button
        component={href ? Link : 'button'}
        href={href || undefined}
        disabled={href === null}
        rightSection={<IconChevronRight size={16} />}
        variant="light"
        aria-label="Next page"
      >
        {children}
      </Button>
    </span>
  );
}

export function PaginationList({ className, ...props }: React.ComponentPropsWithoutRef<'span'>) {
  return <span {...props} className={clsx(className, 'hidden items-baseline gap-x-2 sm:flex')} />;
}

export function PaginationPage({
  children,
  className,
  current = false,
  href,
}: React.PropsWithChildren<{ href: string; className?: string; current?: boolean }>) {
  return (
    <Button
      component={Link}
      href={href}
      variant={current ? 'filled' : 'light'}
      size="sm"
      className={clsx(className, 'min-w-[2.25rem]')}
      aria-current={current ? 'page' : undefined}
      aria-label={`Page ${children}`}
    >
      <span className="-mx-0.5">{children}</span>
    </Button>
  );
}