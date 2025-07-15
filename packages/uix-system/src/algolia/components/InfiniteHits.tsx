'use client';

import { ComponentType } from 'react';
import { InfiniteHits as InstantSearchInfiniteHits, useInfiniteHits } from 'react-instantsearch';

import { SearchHit } from '../types';

interface InfiniteHitsProps extends Record<string, any> {
  className?: string;
  hitComponent?: ComponentType<{ hit: SearchHit }>;
  showPrevious?: boolean;
  translations?: {
    showPreviousButtonText?: string;
    showMoreButtonText?: string;
  };
  cache?: any;
}

const DefaultHitComponent: ComponentType<{ hit: SearchHit }> = ({ hit }) => (
  <article className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-lg dark:border-gray-700">
    {hit.image && (
      <img alt={hit.title} className="h-48 w-full rounded-md object-cover" src={hit.image} />
    )}
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{hit.title}</h3>
    {hit.description && (
      <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{hit.description}</p>
    )}
    {hit.price && (
      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">${hit.price.toFixed(2)}</p>
    )}
  </article>
);

export default function InfiniteHits({
  className = '',
  hitComponent: HitComponent = DefaultHitComponent,
  showPrevious = false,
  translations = {},
  cache,
  ...props
}: InfiniteHitsProps) {
  const { showPreviousButtonText = 'Show previous', showMoreButtonText = 'Show more' } =
    translations;

  return (
    <InstantSearchInfiniteHits
      cache={cache}
      className={className}
      classNames={{
        root: 'ais-InfiniteHits',
        list: 'ais-InfiniteHits-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
        item: 'ais-InfiniteHits-item',
        loadPrevious:
          'ais-InfiniteHits-loadPrevious w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed',
        disabledLoadPrevious: 'ais-InfiniteHits-loadPrevious--disabled',
        loadMore:
          'ais-InfiniteHits-loadMore w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed',
        disabledLoadMore: 'ais-InfiniteHits-loadMore--disabled',
      }}
      hitComponent={HitComponent}
      showPrevious={showPrevious}
      translations={{
        showPreviousButtonText,
        showMoreButtonText,
      }}
      {...props}
    />
  );
}

// Export hook for custom implementations
export { useInfiniteHits };
