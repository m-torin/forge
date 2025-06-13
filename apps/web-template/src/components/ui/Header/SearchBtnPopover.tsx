'use client';

import { IconSearch } from '@tabler/icons-react';

interface SearchBtnPopoverProps {
  'data-testid'?: string;
  onSearch?: (query: string) => void;
}

export default function SearchBtnPopover({
  'data-testid': testId = 'search-button',
  onSearch,
}: SearchBtnPopoverProps) {
  return (
    <button
      className="-m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5 hover:bg-neutral-100 focus-visible:outline-0 dark:hover:bg-neutral-800"
      data-testid={testId}
      onClick={() => {
        // For now, just a simple implementation
        if (onSearch) {
          onSearch('');
        }
      }}
    >
      <span className="sr-only">Search</span>
      <IconSearch color="currentColor" size={24} stroke={1.5} />
    </button>
  );
}
