'use server';

import { logger } from '@/lib/logger';
import {
  addToCartAction as dbAddToCart,
  removeFromCartAction as dbRemoveFromCart,
  updateCartItemQuantityAction as dbUpdateCartQuantity,
  clearCartAction as dbClearCart,
  findUniqueCartAction,
  findManyCartItemsAction,
  getOrCreateCartAction,
  saveForLaterAction as dbSaveForLater,
  moveToCartAction as dbMoveToCart,
} from '@repo/database/prisma/server/next';

import { getAuthContext } from './utils/auth-wrapper';

/**
 * Get or create a cart for the current user/session
 */
async function getCurrentCart() {
  'use server';

  const authContext = await getAuthContext();

  // For authenticated users, use userId
  if (authContext?.user.id) {
    return getOrCreateCartAction(authContext.user.id, undefined);
  }

  // Return empty cart for guests - client will use localStorage
  return {
    id: 'guest-cart',
    userId: null,
    sessionId: null,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Add an item to the cart
 */
export async function addToCart(
  productId: string,
  quantity: number = 1,
  options?: {
    variantId?: string;
    isGift?: boolean;
    giftMessage?: string;
    registryId?: string;
  },
) {
  'use server';

  const cart = await getCurrentCart();
  return dbAddToCart(cart.id, productId, quantity, options);
}

/**
 * Remove an item from the cart
 */
export async function removeFromCart(itemId: string) {
  'use server';

  const cart = await getCurrentCart();
  return dbRemoveFromCart(cart.id, itemId);
}

/**
 * Update cart item quantity
 */
export async function updateCartQuantity(itemId: string, quantity: number) {
  'use server';

  const cart = await getCurrentCart();
  return dbUpdateCartQuantity(cart.id, itemId, quantity);
}

/**
 * Clear all items from the cart
 */
export async function clearCart() {
  'use server';

  const cart = await getCurrentCart();
  return dbClearCart(cart.id);
}

/**
 * Get the current user's cart
 */
export async function getCart(cartId?: string) {
  'use server';

  // If a specific cart ID is provided, get that cart
  if (cartId) {
    return findUniqueCartAction({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
  }

  // Otherwise, get the current user's cart
  try {
    const cart = await getCurrentCart();
    // Get the cart with items included
    if (cart?.id) {
      return findUniqueCartAction({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      });
    }
    return cart;
  } catch (_error) {
    logger.error('Failed to get cart', _error);
    return null;
  }
}

/**
 * Get cart items
 */
export async function getCartItems(cartId?: string) {
  'use server';

  if (cartId) {
    return findManyCartItemsAction({
      where: { cartId },
      include: {
        product: true,
        variant: true,
      },
    });
  }

  const cart = await getCart();
  if (!cart) return [];

  return (cart as any).items || [];
}

/**
 * Save an item for later
 */
export async function saveForLater(itemId: string) {
  'use server';

  const cart = await getCurrentCart();
  return dbSaveForLater(cart.id, itemId);
}

/**
 * Move a saved item back to cart
 */
export async function moveToCart(itemId: string) {
  'use server';

  const cart = await getCurrentCart();
  return dbMoveToCart(cart.id, itemId);
}

/**
 * Get saved for later items
 */
export async function getSavedForLaterItems() {
  'use server';

  const authContext = await getAuthContext();
  if (!authContext?.user.id) {
    return [];
  }

  return findManyCartItemsAction({
    where: {
      cart: {
        userId: authContext.user.id,
        status: 'ACTIVE',
      },
      savedForLater: true,
    },
    include: {
      product: true,
      variant: true,
    },
  });
}
