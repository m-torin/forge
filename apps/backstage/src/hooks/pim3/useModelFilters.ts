'use client';

import { useDebouncedValue } from '@mantine/hooks';
import { useCallback, useState } from 'react';

export interface FilterValue {
  field: string;
  operator:
    | 'equals'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'in'
    | 'between'
    | 'gt'
    | 'lt'
    | 'gte'
    | 'lte';
  value: any;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: FilterValue[];
  searchQuery?: string;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface UseModelFiltersOptions {
  searchFields?: string[];
  defaultFilters?: FilterValue[];
  defaultSort?: SortConfig | null;
  presets?: FilterPreset[];
  debounceMs?: number;
  persistToUrl?: boolean;
}

export interface ModelFiltersState {
  searchQuery: string;
  debouncedSearchQuery: string;
  filters: FilterValue[];
  sort: SortConfig | null;
  activePreset: string | null;
  isFiltering: boolean;
}

export function useModelFilters<T>({
  searchFields = ['name'],
  defaultFilters = [],
  defaultSort = null,
  presets = [],
  debounceMs = 300,
  persistToUrl: _persistToUrl = false,
}: UseModelFiltersOptions = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterValue[]>(defaultFilters);
  const [sort, setSort] = useState<SortConfig | null>(defaultSort);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, debounceMs);

  const isFiltering = debouncedSearchQuery.length > 0 || filters.length > 0;

  // Apply search query to data
  const applySearch = useCallback(
    (data: T[], query: string): T[] => {
      if (!query) return data;

      const lowerQuery = query.toLowerCase();
      return data.filter((item) =>
        searchFields.some((field) => {
          const value = (item as any)[field];
          return value && value.toString().toLowerCase().includes(lowerQuery);
        }),
      );
    },
    [searchFields],
  );

  // Apply filters to data with modern object property access
  const applyFilters = useCallback((data: T[], filterList: FilterValue[]): T[] => {
    if (filterList.length === 0) return data;

    return data.filter((item) =>
      filterList.every((filter) => {
        const value = (item as Record<string, any>)[filter.field];

        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return value?.toString().toLowerCase().includes(filter.value.toLowerCase()) ?? false;
          case 'startsWith':
            return value?.toString().toLowerCase().startsWith(filter.value.toLowerCase()) ?? false;
          case 'endsWith':
            return value?.toString().toLowerCase().endsWith(filter.value.toLowerCase()) ?? false;
          case 'in':
            return Array.isArray(filter.value) ? filter.value.includes(value) : false;
          case 'between':
            return Array.isArray(filter.value) && filter.value.length === 2
              ? value >= filter.value[0] && value <= filter.value[1]
              : false;
          case 'gt':
            return value > filter.value;
          case 'lt':
            return value < filter.value;
          case 'gte':
            return value >= filter.value;
          case 'lte':
            return value <= filter.value;
          default:
            return true;
        }
      }),
    );
  }, []);

  // Apply sort to data
  const applySort = useCallback((data: T[], sortConfig: SortConfig | null): T[] => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortConfig.field];
      const bValue = (b as any)[sortConfig.field];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, []);

  // Main filter function
  const filterData = useCallback(
    (data: T[]): T[] => {
      let result = data;

      // Apply search
      result = applySearch(result, debouncedSearchQuery);

      // Apply filters
      result = applyFilters(result, filters);

      // Apply sort
      result = applySort(result, sort);

      return result;
    },
    [debouncedSearchQuery, filters, sort, applySearch, applyFilters, applySort],
  );

  // Filter management
  const addFilter = useCallback((filter: FilterValue) => {
    setFilters((prev) => {
      // Replace existing filter for the same field
      const filtered = prev.filter((f) => f.field !== filter.field);
      return [...filtered, filter];
    });
    setActivePreset(null);
  }, []);

  const removeFilter = useCallback((field: string) => {
    setFilters((prev) => prev.filter((f) => f.field !== field));
    setActivePreset(null);
  }, []);

  const updateFilter = useCallback((field: string, updates: Partial<FilterValue>) => {
    setFilters((prev) => prev.map((f) => (f.field === field ? { ...f, ...updates } : f)));
    setActivePreset(null);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
    setSearchQuery('');
    setActivePreset(null);
  }, []);

  // Preset management
  const applyPreset = useCallback(
    (presetId: string) => {
      const preset = presets.find((p) => p.id === presetId);
      if (preset) {
        setFilters(preset.filters);
        setSearchQuery(preset.searchQuery || '');
        setActivePreset(presetId);
      }
    },
    [presets],
  );

  // Sort management
  const updateSort = useCallback((field: string, direction?: 'asc' | 'desc') => {
    setSort((prev) => {
      if (prev?.field === field) {
        // Toggle direction or remove sort
        if (direction) {
          return { field, direction };
        } else {
          return prev.direction === 'asc' ? { field, direction: 'desc' } : null;
        }
      } else {
        return { field, direction: direction || 'asc' };
      }
    });
  }, []);

  const clearSort = useCallback(() => {
    setSort(null);
  }, []);

  // Search management
  const updateSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setActivePreset(null);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setActivePreset(null);
  }, []);

  // Reset all
  const reset = useCallback(() => {
    setSearchQuery('');
    setFilters(defaultFilters);
    setSort(defaultSort);
    setActivePreset(null);
  }, [defaultFilters, defaultSort]);

  const state: ModelFiltersState = {
    searchQuery,
    debouncedSearchQuery,
    filters,
    sort,
    activePreset,
    isFiltering,
  };

  return {
    // State
    ...state,

    // Main function
    filterData,

    // Search
    updateSearch,
    clearSearch,

    // Filters
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,

    // Sort
    updateSort,
    clearSort,

    // Presets
    applyPreset,
    presets,

    // Utilities
    reset,
    hasActiveFilters: isFiltering,
    getFilterValue: (field: string) => filters.find((f) => f.field === field)?.value,

    // State management
    getState: () => ({ searchQuery: debouncedSearchQuery, filters, sort }),
  };
}
