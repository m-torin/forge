'use client';

import { RefinementList as InstantSearchRefinementList } from 'react-instantsearch';

interface RefinementListProps extends Record<string, any> {
  attribute: string;
  className?: string;
  limit?: number;
  showMore?: boolean;
  showMoreLimit?: number;
  searchable?: boolean;
  searchablePlaceholder?: string;
  sortBy?: any;
  transformItems?: (items: any[]) => any[];
}

export default function RefinementList({
  attribute,
  className = '',
  limit = 10,
  showMore = false,
  showMoreLimit = 20,
  searchable = false,
  searchablePlaceholder = 'Search...',
  sortBy,
  transformItems,
  ...props
}: RefinementListProps) {
  return (
    <InstantSearchRefinementList
      attribute={attribute}
      className={`ais-RefinementList ${className}`}
      classNames={{
        root: 'space-y-2',
        list: 'space-y-1',
        item: 'flex items-center',
        selectedItem: 'font-semibold',
        label: 'flex items-center cursor-pointer hover:text-blue-600 dark:hover:text-blue-400',
        checkbox:
          'mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-400',
        count: 'ml-auto text-sm text-gray-500 dark:text-gray-400',
        showMore:
          'mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer',
        searchBox: 'mb-3',
        disabledShowMore: 'opacity-50 cursor-not-allowed',
        noResults: 'text-gray-500 dark:text-gray-400 text-sm',
      }}
      limit={limit}
      searchable={searchable}
      searchablePlaceholder={searchablePlaceholder}
      showMore={showMore}
      showMoreLimit={showMoreLimit}
      sortBy={sortBy}
      transformItems={transformItems}
      translations={{
        showMoreButtonText: ({ isShowingMore }: { isShowingMore: boolean }) =>
          isShowingMore ? 'Show less' : 'Show more',
        noResultsText: 'No results',
        submitButtonTitle: 'Submit search',
        resetButtonTitle: 'Clear search',
      }}
      {...props}
    />
  );
}
