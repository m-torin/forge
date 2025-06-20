import clsx from 'clsx';
import Link from 'next/link';

const demoBreadcrumbs = [{ href: '/', id: 1, name: 'Home' }];

interface BreadcrumbProps extends Record<string, any> {
  breadcrumbs?: { href: string; id: number; name: string }[];
  className?: string;
  currentPage?: string;
}

const Breadcrumb = ({
  breadcrumbs = demoBreadcrumbs,
  className,
  currentPage = 'current page',
}: BreadcrumbProps) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={clsx(
        'text-xs font-medium text-neutral-800 sm:text-sm dark:text-neutral-400',
        className,
      )}
    >
      <ol className="flex flex-wrap items-center gap-2" role="list">
        {breadcrumbs.map((breadcrumb: any) => (
          <li key={breadcrumb.id}>
            <div className="flex items-center gap-x-2">
              <Link href={`${breadcrumb.href}` as any}>{breadcrumb.name}</Link>
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
