'use client';

import { ClearRefinements as InstantSearchClearRefinements } from 'react-instantsearch';

interface ClearRefinementsProps extends Record<string, any> {
  className?: string;
  includedAttributes?: string[];
  excludedAttributes?: string[];
  transformItems?: (items: any[]) => any[];
  translations?: {
    resetButtonText?: string;
  };
}

export default function ClearRefinements({
  className = '',
  includedAttributes,
  excludedAttributes,
  transformItems,
  translations = {},
  ...props
}: ClearRefinementsProps) {
  const { resetButtonText = 'Clear all' } = translations;

  return (
    <InstantSearchClearRefinements
      className={`ais-ClearRefinements ${className}`}
      classNames={{
        root: 'flex',
        button:
          'ais-ClearRefinements-button px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
        disabledButton: 'ais-ClearRefinements-button--disabled',
      }}
      excludedAttributes={excludedAttributes}
      includedAttributes={includedAttributes}
      transformItems={transformItems}
      translations={{
        resetButtonText,
      }}
      {...props}
    />
  );
}
