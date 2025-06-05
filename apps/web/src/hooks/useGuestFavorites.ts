"use client";

import { useGuestActions } from "@/contexts/GuestActionsContext";

export function useGuestFavorites() {
  const { lists } = useGuestActions();

  return {
    addFavorite: (id: string, metadata?: any) =>
      lists.add("favorites", id, metadata),
    favoriteCount: lists.count("favorites"),
    favorites: new Set(lists.items("favorites")),
    isFavorite: (id: string) => lists.has("favorites", id),
    removeFavorite: (id: string) => lists.remove("favorites", id),
    toggleFavorite: (id: string, metadata?: any) =>
      lists.toggle("favorites", id),
  };
}

export function useProductFavorite(productId: string, metadata?: any) {
  const { lists } = useGuestActions();

  return {
    addToFavorites: () => lists.add("favorites", productId, metadata),
    isFavorite: lists.has("favorites", productId),
    removeFromFavorites: () => lists.remove("favorites", productId),
    toggleFavorite: () => lists.toggle("favorites", productId),
  };
}
