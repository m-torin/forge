'use client';

import { useGuestActions } from '@/contexts/GuestActionsContext';

export function useGuestFavorites() {
  const { lists } = useGuestActions();
  
  return {
    favorites: new Set(lists.items('favorites')),
    favoriteCount: lists.count('favorites'),
    isFavorite: (id: string) => lists.has('favorites', id),
    toggleFavorite: (id: string) => lists.toggle('favorites', id),
    addFavorite: (id: string) => lists.add('favorites', id),
    removeFavorite: (id: string) => lists.remove('favorites', id),
  };
}

export function useProductFavorite(productId: string) {
  const { lists } = useGuestActions();
  
  return {
    isFavorite: lists.has('favorites', productId),
    toggleFavorite: () => lists.toggle('favorites', productId),
  };
}