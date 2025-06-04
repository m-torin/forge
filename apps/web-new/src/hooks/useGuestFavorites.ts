'use client';

import { useGuestActions } from '@/contexts/GuestActionsContext';

export function useGuestFavorites() {
  const { lists } = useGuestActions();
  
  return {
    favorites: new Set(lists.items('favorites')),
    favoriteCount: lists.count('favorites'),
    isFavorite: (id: string) => lists.has('favorites', id),
    toggleFavorite: (id: string, metadata?: any) => lists.toggle('favorites', id),
    addFavorite: (id: string, metadata?: any) => lists.add('favorites', id, metadata),
    removeFavorite: (id: string) => lists.remove('favorites', id),
  };
}

export function useProductFavorite(productId: string, metadata?: any) {
  const { lists } = useGuestActions();
  
  return {
    isFavorite: lists.has('favorites', productId),
    toggleFavorite: () => lists.toggle('favorites', productId),
    addToFavorites: () => lists.add('favorites', productId, metadata),
    removeFromFavorites: () => lists.remove('favorites', productId),
  };
}