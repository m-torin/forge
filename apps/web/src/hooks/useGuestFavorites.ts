"use client";

import { useGuestActions } from "@/contexts/GuestActionsContext";
import { useEffect, useState } from "react";

export function useGuestFavorites() {
  const { lists } = useGuestActions();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    // Get favorites from localStorage
    const stored = localStorage.getItem("guest-lists-favorites");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFavoriteIds(Object.keys(parsed));
      } catch (_e) {
        setFavoriteIds([]);
      }
    }
  }, []);

  return {
    addFavorite: (id: string, metadata?: any) =>
      lists.add("favorites", id, metadata),
    favoriteCount: favoriteIds.length,
    favorites: new Set(favoriteIds),
    isFavorite: (id: string) => lists.has("favorites", id),
    removeFavorite: (id: string) => lists.remove("favorites", id),
    toggleFavorite: (id: string, _metadata?: any) =>
      lists.toggle("favorites", id),
  };
}

export function useProductFavorite(productId: string, _metadata?: any) {
  const { lists } = useGuestActions();

  return {
    addToFavorites: () => lists.add("favorites", productId, metadata),
    isFavorite: lists.has("favorites", productId),
    removeFromFavorites: () => lists.remove("favorites", productId),
    toggleFavorite: () => lists.toggle("favorites", productId),
  };
}
