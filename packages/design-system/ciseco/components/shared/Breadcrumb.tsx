import clsx from 'clsx';
import Link from 'next/link';

const demoBreadcrumbs = [{ id: 1, name: 'Home', href: '/' }];

interface BreadcrumbProps {
  breadcrumbs?: { id: number; name: string; href: string }[];
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
      className={clsx(
        'text-xs font-medium text-neutral-800 sm:text-sm dark:text-neutral-400',
        className,
      )}
      aria-label="Breadcrumb"
    >
      <ol role="list" className="flex flex-wrap items-center gap-2">
        {breadcrumbs.map((breadcrumb) => (
          <li key={breadcrumb.id}>
            <div className="flex items-center gap-x-2">
              <Link href={`${breadcrumb.href}` as any}>{breadcrumb.name}</Link>
              <svg
                aria-hidden="true"
                viewBox="0 0 6 20"
                className="h-5 w-auto text-neutral-400 dark:text-neutral-500"
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
