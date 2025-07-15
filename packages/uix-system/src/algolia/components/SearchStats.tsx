'use client';

import { Stats } from 'react-instantsearch';

import { SearchStatsProps } from '../types';

export default function SearchStats({
  className = '',
  showQuery = true,
  showTime = true,
  ...props
}: SearchStatsProps) {
  const translations = {
    rootElementText: (options: any) => {
      const { nbHits, processingTimeMS, query } = options;
      const parts = [];

      if (nbHits > 0) {
        parts.push(`${nbHits.toLocaleString()} result${nbHits !== 1 ? 's' : ''}`);

        if (showQuery && query) {
          parts.push(`for "${query}"`);
        }

        if (showTime) {
          parts.push(`(${processingTimeMS}ms)`);
        }
      } else {
        parts.push('No results');

        if (showQuery && query) {
          parts.push(`for "${query}"`);
        }
      }

      return parts.join(' ');
    },
  };

  return (
    <Stats
      className={`text-sm text-gray-600 dark:text-gray-400 ${className}`}
      translations={translations}
      {...props}
    />
  );
}
