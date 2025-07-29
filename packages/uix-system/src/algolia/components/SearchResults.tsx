'use client';

import { ComponentType } from 'react';
import { Hits, useInstantSearch } from 'react-instantsearch';

import { SearchHit, SearchResultsProps } from '../types';

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
    {hit.category && (
      <span className="text-xs text-gray-500 dark:text-gray-500">{hit.category}</span>
    )}
  </article>
);

const DefaultEmptyComponent: ComponentType = () => (
  <div className="py-12 text-center">
    <p className="text-gray-500 dark:text-gray-400">No results found</p>
  </div>
);

const DefaultLoadingComponent: ComponentType = () => (
  <div className="flex items-center justify-center py-12">
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
  </div>
);

export default function SearchResults({
  className = '',
  hitComponent: HitComponent = DefaultHitComponent,
  emptyComponent: EmptyComponent = DefaultEmptyComponent,
  loadingComponent: LoadingComponent = DefaultLoadingComponent,
  ...props
}: SearchResultsProps) {
  const { results, status } = useInstantSearch();

  if (status === 'loading' || status === 'stalled') {
    return <LoadingComponent />;
  }

  if (!results?.nbHits) {
    return <EmptyComponent />;
  }

  return (
    <div className={className} {...props}>
      <Hits
        classNames={{
          root: 'ais-Hits',
          list: 'ais-Hits-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
          item: 'ais-Hits-item',
        }}
        hitComponent={HitComponent}
      />
    </div>
  );
}
