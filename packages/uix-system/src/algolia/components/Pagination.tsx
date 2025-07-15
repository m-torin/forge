'use client';

import { Pagination as InstantSearchPagination } from 'react-instantsearch';

interface PaginationProps extends Record<string, any> {
  className?: string;
  showFirst?: boolean;
  showLast?: boolean;
  showPrevious?: boolean;
  showNext?: boolean;
  padding?: number;
  totalPages?: number;
}

export default function Pagination({
  className = '',
  showFirst = true,
  showLast = true,
  showPrevious = true,
  showNext = true,
  padding = 3,
  totalPages,
  ...props
}: PaginationProps) {
  return (
    <InstantSearchPagination
      className={`ais-Pagination ${className}`}
      classNames={{
        root: 'flex items-center justify-center space-x-1',
        list: 'flex items-center space-x-1',
        item: 'ais-Pagination-item',
        disabledItem: 'ais-Pagination-item--disabled opacity-50 cursor-not-allowed',
        selectedItem: 'ais-Pagination-item--selected bg-blue-600 text-white',
        link: 'px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
        firstPageItem: 'ais-Pagination-item--firstPage',
        lastPageItem: 'ais-Pagination-item--lastPage',
        previousPageItem: 'ais-Pagination-item--previousPage',
        nextPageItem: 'ais-Pagination-item--nextPage',
      }}
      padding={padding}
      showFirst={showFirst}
      showLast={showLast}
      showNext={showNext}
      showPrevious={showPrevious}
      totalPages={totalPages}
      translations={{
        firstPageItemText: '‹‹',
        previousPageItemText: '‹',
        nextPageItemText: '›',
        lastPageItemText: '››',
        pageItemText: ({ page }: any) => String(page),
        firstPageItemAriaLabel: 'Go to first page',
        previousPageItemAriaLabel: 'Go to previous page',
        nextPageItemAriaLabel: 'Go to next page',
        lastPageItemAriaLabel: 'Go to last page',
        pageItemAriaLabel: ({ page }: any) => `Go to page ${page}`,
      }}
      {...props}
    />
  );
}
