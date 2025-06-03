import { ArrowLeft02Icon, ArrowRight02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import clsx from 'clsx';

import Button from '../Button/Button';

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
        {...(href === null ? { disabled: true } : { href })}
        className="rounded-lg"
        aria-label="Previous page"
      >
        <HugeiconsIcon
          strokeWidth={1.5}
          color="currentColor"
          icon={ArrowLeft02Icon}
          className="me-2"
          size={16}
        />

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
        {...(href === null ? { disabled: true } : { href })}
        className="rounded-lg"
        aria-label="Next page"
      >
        {children}
        <HugeiconsIcon
          strokeWidth={1.5}
          color="currentColor"
          icon={ArrowRight02Icon}
          className="ms-2"
          size={16}
        />
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
      href={href}
      className={clsx(
        className,
        'min-w-[2.25rem] rounded-lg before:absolute before:-inset-px before:rounded-lg',
        current && 'before:bg-neutral-950/5 dark:before:bg-white/10',
      )}
      aria-current={current ? 'page' : undefined}
      aria-label={`Page ${children}`}
    >
      <span className="-mx-0.5">{children}</span>
    </Button>
  );
}

export function PaginationGap({
  children = <>&hellip;</>,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      aria-hidden="true"
      {...props}
      className={clsx(
        className,
        'w-[2.25rem] text-center text-sm/6 font-semibold text-neutral-950 select-none dark:text-white',
      )}
    >
      {children}
    </span>
  );
}
