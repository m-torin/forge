'use client';

import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'product-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
      } catch (error) {
        console.error('Failed to save favorites:', error);
      }
    }
  }, [favorites, isLoading]);

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  }, []);

  const addFavorite = useCallback((productId: string) => {
    setFavorites(prev => new Set(prev).add(productId));
  }, []);

  const removeFavorite = useCallback((productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      newFavorites.delete(productId);
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((productId: string) => {
    return favorites.has(productId);
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    setFavorites(new Set());
  }, []);

  return {
    favorites: Array.from(favorites),
    favoriteCount: favorites.size,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites,
    isLoading,
  };
}

// Hook for a single product
export function useProductFavorite(productId: string) {
  const { isFavorite, toggleFavorite } = useFavorites();
  
  return {
    isFavorite: isFavorite(productId),
    toggleFavorite: () => toggleFavorite(productId),
  };
}