'use client';

import { useCallback, useEffect, useState } from 'react';

export interface TreeItem {
  id: string;
  children?: TreeItem[];
  [key: string]: any;
}

export interface UseTreeNavigationOptions {
  defaultExpanded?: boolean;
  autoExpandOnSearch?: boolean;
  autoExpandParents?: boolean;
  persistExpansion?: boolean;
  storageKey?: string;
}

export interface TreeNavigationState {
  expandedItems: Set<string>;
  selectedItem: string | null;
  focusedItem: string | null;
}

export function useTreeNavigation<T extends TreeItem>({
  defaultExpanded = false,
  autoExpandOnSearch = true,
  autoExpandParents = true,
  persistExpansion = false,
  storageKey = 'tree-expansion',
}: UseTreeNavigationOptions = {}) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    if (persistExpansion && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        return saved ? new Set(JSON.parse(saved)) : new Set();
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [focusedItem, setFocusedItem] = useState<string | null>(null);

  // Persist expansion state
  useEffect(() => {
    if (persistExpansion && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify([...expandedItems]));
      } catch {
        // Handle storage errors silently
      }
    }
  }, [expandedItems, persistExpansion, storageKey]);

  // Get all item IDs in tree - memoized for performance
  const getAllItemIds = useCallback((items: T[]): string[] => {
    const traverse = (nodeList: T[]): string[] => {
      return nodeList.flatMap((item) => [
        item.id,
        ...(item.children ? traverse(item.children as T[]) : []),
      ]);
    };
    return traverse(items);
  }, []);

  // Get parent path for an item
  const getParentPath = useCallback((items: T[], targetId: string): string[] => {
    const path: string[] = [];

    const findPath = (nodeList: T[], currentPath: string[]): boolean => {
      for (const item of nodeList) {
        const newPath = [...currentPath, item.id];

        if (item.id === targetId) {
          path.push(...currentPath);
          return true;
        }

        if (item.children && findPath(item.children as T[], newPath)) {
          return true;
        }
      }
      return false;
    };

    findPath(items, []);
    return path;
  }, []);

  // Toggle expansion for a single item
  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  // Expand a specific item
  const expandItem = useCallback((itemId: string) => {
    setExpandedItems((prev) => new Set([...prev, itemId]));
  }, []);

  // Collapse a specific item
  const collapseItem = useCallback((itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  }, []);

  // Expand all items
  const expandAll = useCallback(
    (items: T[]) => {
      const allIds = getAllItemIds(items);
      setExpandedItems(new Set(allIds));
    },
    [getAllItemIds],
  );

  // Collapse all items
  const collapseAll = useCallback(() => {
    setExpandedItems(new Set());
  }, []);

  // Expand parents of a specific item
  const _expandParents = useCallback(
    (items: T[], itemId: string) => {
      if (!autoExpandParents) return;

      const parentPath = getParentPath(items, itemId);
      setExpandedItems((prev) => new Set([...prev, ...parentPath]));
    },
    [autoExpandParents, getParentPath],
  );

  // Auto-expand items based on search results
  const autoExpandForSearch = useCallback(
    (items: T[], searchResults: Set<string>) => {
      if (!autoExpandOnSearch) return;

      const itemsToExpand = new Set<string>();

      searchResults.forEach((resultId) => {
        const parentPath = getParentPath(items, resultId);
        parentPath.forEach((parentId) => itemsToExpand.add(parentId));
      });

      setExpandedItems((prev) => new Set([...prev, ...itemsToExpand]));
    },
    [autoExpandOnSearch, getParentPath],
  );

  // Filter tree items based on search and maintain hierarchy
  const filterTree = useCallback(
    (
      items: T[],
      searchQuery: string,
      searchFields: string[] = ['name'],
    ): { filteredItems: T[]; matchingIds: Set<string> } => {
      if (!searchQuery) {
        return { filteredItems: items, matchingIds: new Set() };
      }

      const matchingIds = new Set<string>();
      const lowerQuery = searchQuery.toLowerCase();

      const filterRecursive = (nodeList: T[]): T[] => {
        return nodeList.reduce((acc: T[], item) => {
          const matches = searchFields.some((field) => {
            const value = (item as any)[field];
            return value && value.toString().toLowerCase().includes(lowerQuery);
          });

          const filteredChildren = item.children ? filterRecursive(item.children as T[]) : [];

          if (matches || filteredChildren.length > 0) {
            if (matches) {
              matchingIds.add(item.id);
            }

            acc.push({
              ...item,
              children: filteredChildren,
            });
          }

          return acc;
        }, []);
      };

      const filteredItems = filterRecursive(items);

      // Auto-expand for search results
      if (matchingIds.size > 0) {
        autoExpandForSearch(items, matchingIds);
      }

      return { filteredItems, matchingIds };
    },
    [autoExpandForSearch],
  );

  // Initialize expansion state for new data
  const _initializeExpansion = useCallback(
    (items: T[]) => {
      if (defaultExpanded) {
        expandAll(items);
      }
    },
    [defaultExpanded, expandAll],
  );

  // Keyboard navigation
  const handleKeyNavigation = useCallback(
    (event: KeyboardEvent, items: T[], currentFocus?: string) => {
      const allIds = getAllItemIds(items);
      const currentIndex = currentFocus ? allIds.indexOf(currentFocus) : -1;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          const nextIndex = (currentIndex + 1) % allIds.length;
          setFocusedItem(allIds[nextIndex]);
          break;

        case 'ArrowUp':
          event.preventDefault();
          const prevIndex = currentIndex <= 0 ? allIds.length - 1 : currentIndex - 1;
          setFocusedItem(allIds[prevIndex]);
          break;

        case 'ArrowRight':
          if (currentFocus && !expandedItems.has(currentFocus)) {
            event.preventDefault();
            expandItem(currentFocus);
          }
          break;

        case 'ArrowLeft':
          if (currentFocus && expandedItems.has(currentFocus)) {
            event.preventDefault();
            collapseItem(currentFocus);
          }
          break;

        case 'Enter':
        case ' ':
          if (currentFocus) {
            event.preventDefault();
            setSelectedItem(currentFocus);
          }
          break;
      }
    },
    [getAllItemIds, expandedItems, expandItem, collapseItem],
  );

  // Check if item is expanded
  const isExpanded = useCallback(
    (itemId: string): boolean => {
      return expandedItems.has(itemId);
    },
    [expandedItems],
  );

  // Check if item has children
  const hasChildren = useCallback((item: T): boolean => {
    return Boolean(item.children && item.children.length > 0);
  }, []);

  const state: TreeNavigationState = {
    expandedItems,
    selectedItem,
    focusedItem,
  };

  return {
    ...state,
    toggleExpanded,
    expandAll,
    collapseAll,
    setSelectedItem,
    setFocusedItem,
    isExpanded,
    hasChildren,
    filterTree,
    handleKeyNavigation,
    getAllItemIds,
  };
}
