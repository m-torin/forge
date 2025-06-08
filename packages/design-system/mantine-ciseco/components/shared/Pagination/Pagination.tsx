import { ArrowLeft02Icon, ArrowRight02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import clsx from 'clsx';

import Button from '../Button/Button';

import type React from 'react';

export function Pagination({
  'aria-label': ariaLabel = 'Page navigation',
  'data-testid': testId = 'pagination',
  className,
  ...props
}: React.ComponentPropsWithoutRef<'nav'> & { 'data-testid'?: string }) {
  return <nav aria-label={ariaLabel} data-testid={testId} {...props} className={clsx(className, 'flex gap-x-5')} />;
}

export function PaginationPrevious({
  children = 'Previous',
  className,
  href = null,
  'data-testid': testId = 'pagination-previous',
}: React.PropsWithChildren<{ href?: string | null; className?: string; 'data-testid'?: string }>) {
  return (
    <span className={clsx(className, 'grow basis-0')}>
      <Button
        {...(href === null ? { disabled: true } : { href })}
        className="rounded-lg"
        aria-label="Previous page"
        data-testid={testId}
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
  'data-testid': testId = 'pagination-next',
}: React.PropsWithChildren<{ href?: string | null; className?: string; 'data-testid'?: string }>) {
  return (
    <span className={clsx(className, 'flex grow basis-0 justify-end')}>
      <Button
        {...(href === null ? { disabled: true } : { href })}
        className="rounded-lg"
        aria-label="Next page"
        data-testid={testId}
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

export function PaginationList({ 
  className, 
  'data-testid': testId = 'pagination-list',
  ...props 
}: React.ComponentPropsWithoutRef<'span'> & { 'data-testid'?: string }) {
  return <span data-testid={testId} {...props} className={clsx(className, 'hidden items-baseline gap-x-2 sm:flex')} />;
}

export function PaginationPage({
  children,
  className,
  current = false,
  href,
  'data-testid': testId = 'pagination-page',
}: React.PropsWithChildren<{ href: string; className?: string; current?: boolean; 'data-testid'?: string }>) {
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
      data-testid={current ? 'pagination-page-current' : testId}
    >
      <span className="-mx-0.5">{children}</span>
    </Button>
  );
}

export function PaginationGap({
  children = <>&hellip;</>,
  className,
  'data-testid': testId = 'pagination-gap',
  ...props
}: React.ComponentPropsWithoutRef<'span'> & { 'data-testid'?: string }) {
  return (
    <span
      aria-hidden="true"
      data-testid={testId}
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

// Complete pagination component that accepts totalPages, currentPage, and baseUrl
export interface CompletePaginationProps {
  baseUrl: string;
  className?: string;
  currentPage: number;
  totalPages: number;
  'data-testid'?: string;
}

export function CompletePagination({
  baseUrl,
  className,
  currentPage,
  totalPages,
  'data-testid': testId = 'complete-pagination',
}: CompletePaginationProps) {
  // Don't render pagination if there's only one page or less
  if (totalPages <= 1) return null;

  // Helper function to generate page URL
  const getPageUrl = (page: number) => {
    if (page === 1) {
      return baseUrl;
    }
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}page=${page}`;
  };

  // Calculate which pages to show
  const getVisiblePages = () => {
    const pages: (number | 'gap')[] = [];
    const delta = 2; // Number of pages to show around current page

    if (totalPages <= 7) {
      // Show all pages if there are 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Add gap if needed
      if (currentPage - delta > 2) {
        pages.push('gap');
      }

      // Add pages around current page
      const start = Math.max(2, currentPage - delta);
      const end = Math.min(totalPages - 1, currentPage + delta);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add gap if needed
      if (currentPage + delta < totalPages - 1) {
        pages.push('gap');
      }

      // Always show last page (if different from first)
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <Pagination className={clsx('mx-auto', className)} data-testid={testId}>
      <PaginationPrevious href={prevPage ? getPageUrl(prevPage) : null} />
      <PaginationList>
        {visiblePages.map((page, index) => {
          if (page === 'gap') {
            return <PaginationGap key={`gap-${index}`} />;
          }
          return (
            <PaginationPage key={page} href={getPageUrl(page)} current={page === currentPage}>
              {page}
            </PaginationPage>
          );
        })}
      </PaginationList>
      <PaginationNext href={nextPage ? getPageUrl(nextPage) : null} />
    </Pagination>
  );
}
