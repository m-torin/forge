'use client';

import { CurrentRefinements as InstantSearchCurrentRefinements } from 'react-instantsearch';

interface CurrentRefinementsProps extends Record<string, any> {
  className?: string;
  includedAttributes?: string[];
  excludedAttributes?: string[];
  transformItems?: (items: any[]) => any[];
}

export default function CurrentRefinements({
  className = '',
  includedAttributes,
  excludedAttributes,
  transformItems,
  ...props
}: CurrentRefinementsProps) {
  return (
    <InstantSearchCurrentRefinements
      className={`ais-CurrentRefinements ${className}`}
      classNames={{
        root: 'flex flex-wrap gap-2',
        list: 'flex flex-wrap gap-2',
        item: 'ais-CurrentRefinements-item',
        label:
          'ais-CurrentRefinements-label inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm dark:bg-blue-900 dark:text-blue-200',
        category: 'ais-CurrentRefinements-category font-semibold',
        categoryLabel: 'ais-CurrentRefinements-categoryLabel',
        delete:
          'ais-CurrentRefinements-delete ml-1 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer',
      }}
      excludedAttributes={excludedAttributes}
      includedAttributes={includedAttributes}
      transformItems={transformItems}
      {...props}
    />
  );
}
