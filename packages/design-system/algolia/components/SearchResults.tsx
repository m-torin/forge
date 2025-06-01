'use client';

import { useHits } from 'react-instantsearch';
import type { SearchResultsProps, SearchHit } from '../types';

const DefaultHitComponent = ({ hit }: { hit: SearchHit }) => (
  <div className="p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
    <div className="flex items-start space-x-3">
      {hit.image && (
        <img
          src={hit.image}
          alt={hit.title}
          className="w-12 h-12 rounded-lg object-cover"
        />
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {hit.title}
        </h3>
        {hit.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {hit.description}
          </p>
        )}
        {hit.category && (
          <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-300">
            {hit.category}
          </span>
        )}
      </div>
      {hit.price && (
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          ${hit.price}
        </div>
      )}
    </div>
  </div>
);

const DefaultEmptyComponent = () => (
  <div className="p-8 text-center">
    <div className="text-gray-500 dark:text-gray-400">
      <div className="text-lg font-medium mb-2">No results found</div>
      <div className="text-sm">Try adjusting your search to find what you're looking for.</div>
    </div>
  </div>
);

const DefaultLoadingComponent = () => (
  <div className="p-8 text-center">
    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">Searching...</div>
  </div>
);

export default function SearchResults({
  className = '',
  hitComponent: HitComponent = DefaultHitComponent,
  emptyComponent: EmptyComponent = DefaultEmptyComponent,
  loadingComponent: LoadingComponent = DefaultLoadingComponent,
}: SearchResultsProps) {
  const { hits, sendEvent } = useHits<SearchHit>();

  if (!hits.length) {
    return (
      <div className={`bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 ${className}`}>
        <EmptyComponent />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 ${className}`}>
      <div className="max-h-96 overflow-y-auto">
        {hits.map((hit: any) => (
          <div
            key={hit.objectID}
            onClick={() => {
              sendEvent('click', hit, 'Hit Clicked');
              if (hit.url) {
                window.location.href = hit.url;
              }
            }}
            className="cursor-pointer"
          >
            <HitComponent hit={hit} />
          </div>
        ))}
      </div>
    </div>
  );
}