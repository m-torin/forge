'use client';

import { useGuestFavorites } from '@/react/GuestActionsContext';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import Link from 'next/link';

interface FavoritesCountProps {
  locale: string;
}

export function FavoritesCount({ locale }: FavoritesCountProps) {
  const { favoriteCount } = useGuestFavorites();

  return (
    <Link
      href={`/${locale}/account-wishlists`}
      className="relative p-2 hover: bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
      aria-label={`Favorites (${favoriteCount})`}
    >
      {favoriteCount > 0 ? (
        <IconHeartFilled className="w-6 h-6 text-red-500" />
      ) : (
        <IconHeart className="w-6 h-6" />
      )}
      {favoriteCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary-500 text-white text-xs font-medium">
          {favoriteCount > 9 ? '9+' : favoriteCount}
        </span>
      )}
    </Link>
  );
}
