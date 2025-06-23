'use server';

import {
  addGuestFavoriteAction,
  removeGuestFavoriteAction,
  getGuestFavoritesAction,
  toggleGuestFavoriteAction,
} from '@repo/database/prisma/server/next';

import { getAuthContext } from './utils/auth-wrapper';

/**
 * Add a product to favorites
 * Works for both authenticated users and guests (with userId)
 */
export async function addToFavorites(userId: string, productId: string) {
  'use server';

  // If userId is 'guest', check for actual auth context
  if (userId === 'guest') {
    const authContext = await getAuthContext();
    if (authContext?.user.id) {
      userId = authContext.user.id;
    } else {
      // For true guest users, we can't save to database
      // The client should handle this with localStorage
      throw new Error('Guest favorites should be handled client-side');
    }
  }

  return addGuestFavoriteAction(userId, productId);
}

/**
 * Alias for addToFavorites
 */
export async function addFavorite(userId: string, productId: string) {
  'use server';
  return addToFavorites(userId, productId);
}

/**
 * Remove a product from favorites
 */
export async function removeFromFavorites(userId: string, productId: string) {
  'use server';

  // If userId is 'guest', check for actual auth context
  if (userId === 'guest') {
    const authContext = await getAuthContext();
    if (authContext?.user.id) {
      userId = authContext.user.id;
    } else {
      throw new Error('Guest favorites should be handled client-side');
    }
  }

  return removeGuestFavoriteAction(userId, productId);
}

/**
 * Alias for removeFromFavorites
 */
export async function removeFavorite(userId: string, productId: string) {
  'use server';
  return removeFromFavorites(userId, productId);
}

/**
 * Get all favorites for a user
 */
export async function getFavorites(userId: string) {
  'use server';

  // If userId is 'guest', check for actual auth context
  if (userId === 'guest') {
    const authContext = await getAuthContext();
    if (authContext?.user.id) {
      userId = authContext.user.id;
    } else {
      // Return empty array for guests
      return [];
    }
  }

  return getGuestFavoritesAction(userId);
}

/**
 * Toggle a product in favorites
 */
export async function toggleFavorite(userId: string, productId: string) {
  'use server';

  // If userId is 'guest', check for actual auth context
  if (userId === 'guest') {
    const authContext = await getAuthContext();
    if (authContext?.user.id) {
      userId = authContext.user.id;
    } else {
      throw new Error('Guest favorites should be handled client-side');
    }
  }

  const result = await toggleGuestFavoriteAction(userId, productId);
  return result.favorite;
}

/**
 * Get favorites for the current authenticated user
 * This is a convenience function that doesn't require passing userId
 */
export async function getCurrentUserFavorites() {
  'use server';

  const authContext = await getAuthContext();
  if (!authContext?.user.id) {
    return [];
  }

  return getGuestFavoritesAction(authContext.user.id);
}

/**
 * Check if a product is favorited by the current user
 */
export async function isProductFavorited(productId: string) {
  'use server';

  const authContext = await getAuthContext();
  if (!authContext?.user.id) {
    return false;
  }

  const favorites = await getGuestFavoritesAction(authContext.user.id);
  return favorites.some((fav: any) => fav.id === productId);
}
