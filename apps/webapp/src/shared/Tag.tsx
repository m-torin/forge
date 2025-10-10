import { FC } from 'react';
import { Link } from './link';

interface TagProps {
  className?: string;
  hideCount?: boolean;
  children?: React.ReactNode;
  count?: number;
}

const Tag: FC<TagProps> = ({ className = '', hideCount = false, children, count = 22 }) => {
  return (
    <Link
      className={`inline-block rounded-lg border border-neutral-100 bg-white px-3 py-2 text-sm text-neutral-600 hover:border-neutral-200 md:px-4 md:py-2.5 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-600 ${className}`}
      data-nc-id="Tag"
      href="/blog"
    >
      {children}
      {!hideCount && <span className="text-xs font-normal"> ({count} )</span>}
    </Link>
  );
};

export default Tag;
