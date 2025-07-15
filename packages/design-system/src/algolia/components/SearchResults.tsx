'use client';

import { useHits } from 'react-instantsearch';

import { SearchHit, SearchResultsProps } from '../types';

const DefaultHitComponent = ({ hit }: { hit: SearchHit }) => (
  <div className="border-b border-gray-200 p-4 last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
    <div className="flex items-start space-x-3">
      {hit.image && (
        <img alt={hit.title} className="h-12 w-12 rounded-lg object-cover" src={hit.image} />
      )}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-gray-900 dark:text-white">{hit.title}</h3>
        {hit.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
            {hit.description}
          </p>
        )}
        {hit.category && (
          <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {hit.category}
          </span>
        )}
      </div>
      {hit.price && (
        <div className="text-sm font-medium text-gray-900 dark:text-white">${hit.price}</div>
      )}
    </div>
  </div>
);

const DefaultEmptyComponent = () => (
  <div className="p-8 text-center">
    <div className="text-gray-500 dark:text-gray-400">
      <div className="mb-2 text-lg font-medium">No results found</div>
      <div className="text-sm">Try adjusting your search to find what you&apos;re looking for.</div>
    </div>
  </div>
);

const DefaultLoadingComponent = () => (
  <div className="p-8 text-center">
    <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600" />
    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">Searching...</div>
  </div>
);

export default function SearchResults({
  className = '',
  emptyComponent: EmptyComponent = DefaultEmptyComponent,
  hitComponent: HitComponent = DefaultHitComponent,
  loadingComponent: _LoadingComponent = DefaultLoadingComponent,
}: SearchResultsProps) {
  const { hits, sendEvent } = useHits<SearchHit>();

  if (!hits.length) {
    return (
      <div
        className={`rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 ${className}`}
      >
        <EmptyComponent />
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      <div className="max-h-96 overflow-y-auto">
        {hits.map(hit => (
          <div
            key={hit.objectID}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => {
              sendEvent('click', hit, 'Hit Clicked');
              if (hit.url) {
                window.location.href = hit.url;
              }
            }}
            onKeyDown={(e: any) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                sendEvent('click', hit, 'Hit Clicked');
                if (hit.url) {
                  window.location.href = hit.url;
                }
              }
            }}
          >
            <HitComponent hit={hit} />
          </div>
        ))}
      </div>
    </div>
  );
}
