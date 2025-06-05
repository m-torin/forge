"use client";

import { FavoriteButton } from "@/components/FavoriteButton";
import { useGuestFavorites } from "@/hooks/useGuestFavorites";
import { analytics } from "@/lib/analytics-setup";
import { useEffect, useState } from "react";

import {
  ProductCard,
  type TProductItem,
} from "@repo/design-system/mantine-ciseco";

interface FavoritesClientProps {
  allProducts: TProductItem[];
}

export function FavoritesClient({ allProducts }: FavoritesClientProps) {
  const { favorites } = useGuestFavorites();
  const [favoriteProducts, setFavoriteProducts] = useState<TProductItem[]>([]);

  useEffect(() => {
    // Filter products that are in favorites
    const favoriteIds = Array.from(favorites);
    const filtered = allProducts.filter(
      (product) => product.id && favoriteIds.includes(product.id),
    );
    setFavoriteProducts(filtered);
  }, [favorites, allProducts]);

  // Track page view with analytics
  useEffect(() => {
    analytics
      .page("account", "wishlists", {
        favoriteCount: favorites.size,
      })
      .catch(() => {});
  }, [favorites.size]);

  if (favoriteProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          stroke="currentColor"
          viewBox="0 0 24 24"
          className="mx-auto h-24 w-24 text-neutral-400"
          fill="none"
        >
          <path
            strokeWidth={1}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">
          No favorites yet
        </h3>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Start adding products to your wishlist by clicking the heart icon
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
      {favoriteProducts.map((product) => (
        <div key={product.id} className="relative">
          <ProductCard data={product} isLiked={true} />
          {/* Override the built-in like button with our functional one */}
          <FavoriteButton
            productId={product.id || ""}
            productName={product.title}
            className="absolute end-3 top-3 z-20"
            price={product.price}
          />
        </div>
      ))}
    </div>
  );
}
