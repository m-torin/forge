import clsx from 'clsx';
import { Link } from './link';

const demoBreadcrumbs = [{ id: 1, name: 'Home', href: '/' }];

interface BreadcrumbProps {
  className?: string;
  breadcrumbs?: { id: number; name: string; href: string }[];
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
        'text-xs font-medium text-neutral-900 sm:text-sm/6 dark:text-neutral-300',
        className,
      )}
    >
      <ol role="list" className="flex flex-wrap items-center gap-3.5">
        {breadcrumbs.map(breadcrumb => (
          <li key={breadcrumb.id}>
            <div className="flex items-center gap-3.5">
              <Link href={breadcrumb.href}>{breadcrumb.name}</Link>
              <svg
                viewBox="0 0 6 20"
                aria-hidden="true"
                className="h-5 w-auto text-neutral-400 dark:text-neutral-500"
              >
                <path d="M4.878 4.34H3.551L.27 16.532h1.327l3.281-12.19z" fill="currentColor" />
              </svg>
            </div>
          </li>
        ))}
        <li>
          <span aria-current="page" className="text-neutral-500 dark:text-neutral-400">
            {currentPage}
          </span>
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumb;
