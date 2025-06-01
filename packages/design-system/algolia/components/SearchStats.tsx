'use client';

import { useStats } from 'react-instantsearch';
import { useInstantSearch } from '../hooks/useInstantSearch';
import type { SearchStatsProps } from '../types';

export default function SearchStats({
  className = '',
  showQuery = true,
  showTime = true,
}: SearchStatsProps) {
  const { nbHits, processingTimeMS } = useStats();
  const { query } = useInstantSearch();

  if (!query) {
    return null;
  }

  return (
    <div className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      <span>
        {nbHits.toLocaleString()} result{nbHits !== 1 ? 's' : ''}
        {showQuery && query && (
          <>
            {' '}for{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              "{String(query)}"
            </span>
          </>
        )}
        {showTime && (
          <>
            {' '}in {processingTimeMS}ms
          </>
        )}
      </span>
    </div>
  );
}