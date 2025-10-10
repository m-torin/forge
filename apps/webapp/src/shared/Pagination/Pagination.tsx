import clsx from 'clsx';
import type React from 'react';
import { Button } from '../Button/Button';

export function Pagination({
  'aria-label': ariaLabel = 'Page navigation',
  className,
  ...props
}: React.ComponentPropsWithoutRef<'nav'>) {
  return <nav aria-label={ariaLabel} {...props} className={clsx(className, 'flex gap-x-2')} />;
}

export function PaginationPrevious({
  href = null,
  className,
  children = 'Previous',
  onClick,
}: React.PropsWithChildren<{
  href?: string | null;
  className?: string;
  onClick?: () => void;
}>) {
  return (
    <span className={clsx(className, 'grow basis-0')}>
      <Button
        {...(href === null ? { disabled: true } : { href })}
        plain
        aria-label="Previous page"
        className="rounded-xl!"
        onClick={onClick}
      >
        <svg
          className="stroke-current"
          data-slot="icon"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.75 8H13.25M2.75 8L5.25 5.5M2.75 8L5.25 10.5"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {children}
      </Button>
    </span>
  );
}

export function PaginationNext({
  href = null,
  className,
  children = 'Next',
  onClick,
}: React.PropsWithChildren<{
  href?: string | null;
  className?: string;
  onClick?: () => void;
}>) {
  return (
    <span className={clsx(className, 'flex grow basis-0 justify-end')}>
      <Button
        {...(href === null ? { disabled: true } : { href })}
        plain
        aria-label="Next page"
        className="rounded-xl!"
        onClick={onClick}
      >
        {children}
        <svg
          className="stroke-current"
          data-slot="icon"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M13.25 8L2.75 8M13.25 8L10.75 10.5M13.25 8L10.75 5.5"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>
    </span>
  );
}

export function PaginationList({ className, ...props }: React.ComponentPropsWithoutRef<'span'>) {
  return <span {...props} className={clsx(className, 'hidden items-baseline gap-x-2 sm:flex')} />;
}

export function PaginationPage({
  href,
  className,
  current = false,
  children,
  onClick,
}: React.PropsWithChildren<{
  href: string;
  className?: string;
  current?: boolean;
  onClick?: () => void;
}>) {
  return (
    <Button
      href={href}
      plain
      aria-label={`Page ${children}`}
      aria-current={current ? 'page' : undefined}
      className={clsx(
        className,
        'rounded-xl! min-w-[2.25rem] before:absolute before:-inset-px before:rounded-xl',
        current && 'before:bg-zinc-950/5 dark:before:bg-white/10',
      )}
      onClick={onClick}
    >
      <span className="-mx-0.5">{children}</span>
    </Button>
  );
}

export function PaginationGap({
  className,
  children = <>&hellip;</>,
  ...props
}: React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      aria-hidden="true"
      {...props}
      className={clsx(
        className,
        'w-[2.25rem] select-none text-center text-sm/6 font-semibold text-zinc-950 dark:text-white',
      )}
    >
      {children}
    </span>
  );
}

// Default export wrapper for backward compatibility with tests
interface PaginationWrapperProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  className?: string;
  showFirstLast?: boolean;
  showInfo?: boolean;
}

const PaginationWrapper: React.FC<PaginationWrapperProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showFirstLast,
  showInfo,
}) => {
  const handlePageClick = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <PaginationPage
          key={i}
          href="#"
          current={i === currentPage}
          onClick={() => handlePageClick(i)}
        >
          {i}
        </PaginationPage>,
      );
    }

    return pages;
  };

  return (
    <Pagination className={className} aria-label="Page navigation">
      <PaginationPrevious
        href={currentPage > 1 ? '#' : null}
        onClick={() => currentPage > 1 && handlePageClick(currentPage - 1)}
      />
      <PaginationList>
        {showFirstLast && currentPage > 3 && (
          <>
            <PaginationPage href="#" onClick={() => handlePageClick(1)}>
              1
            </PaginationPage>
            <PaginationGap />
          </>
        )}
        {renderPageNumbers()}
        {showFirstLast && currentPage < totalPages - 2 && (
          <>
            <PaginationGap />
            <PaginationPage href="#" onClick={() => handlePageClick(totalPages)}>
              {totalPages}
            </PaginationPage>
          </>
        )}
      </PaginationList>
      <PaginationNext
        href={currentPage < totalPages ? '#' : null}
        onClick={() => currentPage < totalPages && handlePageClick(currentPage + 1)}
      />
      {showInfo && (
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
      )}
    </Pagination>
  );
};

export default PaginationWrapper;
