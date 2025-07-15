'use client';

import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { forwardRef } from 'react';

import { useSearchBox } from '../hooks/useSearchBox';
import { SearchBoxProps } from '../types';

const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(
  (
    {
      autoFocus: _autoFocus = false,
      className = '',
      maxLength,
      onReset,
      onSubmit,
      placeholder = 'Search...',
    },
    ref,
  ) => {
    const { onChange, onReset: handleReset, onSubmit: handleSubmit, query } = useSearchBox();

    const handleFormSubmit = (event: React.FormEvent) => {
      handleSubmit(event);
      onSubmit?.(query);
    };

    const handleResetClick = () => {
      handleReset();
      onReset?.();
    };

    return (
      <div className={`relative ${className}`}>
        <form className="relative" onSubmit={handleFormSubmit}>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>

          <input
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            maxLength={maxLength}
            placeholder={placeholder}
            ref={ref}
            type="search"
            value={query}
            onChange={onChange}
          />

          {query && (
            <button
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
              type="button"
              onClick={handleResetClick}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </form>
      </div>
    );
  },
);

SearchBox.displayName = 'SearchBox';

export default SearchBox;
