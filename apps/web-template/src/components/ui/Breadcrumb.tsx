import clsx from 'clsx';
import Link from 'next/link';

const demoBreadcrumbs = [{ href: '/', id: 1, name: 'Home' }];

interface BreadcrumbProps {
  breadcrumbs?: { href: string; id: number; name: string }[];
  className?: string;
  currentPage?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for Breadcrumb (Tailwind-only)
function BreadcrumbSkeleton({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={clsx(
        'text-xs font-medium text-neutral-800 sm:text-sm dark:text-neutral-400',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <span className="text-neutral-400">/</span>
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <span className="text-neutral-400">/</span>
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    </nav>
  );
}

// Error state for Breadcrumb (Tailwind-only)
function BreadcrumbError({ error, className }: { error: string; className?: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={clsx(
        'text-xs font-medium text-neutral-800 sm:text-sm dark:text-neutral-400',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <span className="text-xs text-red-500">Breadcrumb error</span>
      </div>
    </nav>
  );
}

// Zero state for Breadcrumb (Tailwind-only)
function BreadcrumbEmpty({ className, currentPage }: { className?: string; currentPage?: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={clsx(
        'text-xs font-medium text-neutral-800 sm:text-sm dark:text-neutral-400',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        <span aria-current="page">{currentPage || 'Current page'}</span>
      </div>
    </nav>
  );
}

const Breadcrumb = ({
  breadcrumbs = demoBreadcrumbs,
  className,
  currentPage = 'current page',
  loading = false,
  error,
}: BreadcrumbProps) => {
  // Show loading state
  if (loading) {
    return <BreadcrumbSkeleton className={className} />;
  }

  // Show error state
  if (error) {
    return <BreadcrumbError error={error} className={className} />;
  }

  // Show zero state when no breadcrumbs
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return <BreadcrumbEmpty className={className} currentPage={currentPage} />;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={clsx(
        'text-xs font-medium text-neutral-800 sm:text-sm dark:text-neutral-400',
        className,
      )}
    >
      <ol className="flex flex-wrap items-center gap-2" role="list">
        {breadcrumbs.map((breadcrumb) => (
          <li key={breadcrumb.id}>
            <div className="flex items-center gap-x-2">
              <Link href={breadcrumb.href}>{breadcrumb.name}</Link>
              <svg
                aria-hidden="true"
                className="h-5 w-auto text-neutral-400 dark:text-neutral-500"
                viewBox="0 0 6 20"
              >
                <path d="M4.878 4.34H3.551L.27 16.532h1.327l3.281-12.19z" fill="currentColor" />
              </svg>
            </div>
          </li>
        ))}
        <li>
          <span aria-current="page">{currentPage}</span>
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumb;
