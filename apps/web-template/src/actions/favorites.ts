'use server';

// Favorites actions for web-template
export {
  addGuestFavoriteAction as addToFavorites,
  addGuestFavoriteAction as addFavorite,
  removeGuestFavoriteAction as removeFromFavorites,
  removeGuestFavoriteAction as removeFavorite,
  getGuestFavoritesAction as getFavorites,
  toggleGuestFavoriteAction as toggleFavorite,
} from '@repo/database/prisma';
