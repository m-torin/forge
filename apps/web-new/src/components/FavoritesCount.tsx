'use client';

import { useFavorites } from '@/hooks/useFavorites';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface FavoritesCountProps {
  locale: string;
}

export function FavoritesCount({ locale }: FavoritesCountProps) {
  const { favoriteCount } = useFavorites();

  return (
    <Link
      href={`/${locale}/account-wishlists`}
      className="relative p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
      aria-label={`Favorites (${favoriteCount})`}
    >
      {favoriteCount > 0 ? (
        <HeartSolidIcon className="w-6 h-6 text-red-500" />
      ) : (
        <HeartIcon className="w-6 h-6" />
      )}
      {favoriteCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary-500 text-white text-xs font-medium">
          {favoriteCount > 9 ? '9+' : favoriteCount}
        </span>
      )}
    </Link>
  );
}