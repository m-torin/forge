'use server';

import {
  addToCartAction,
  removeFromCartAction,
  updateCartItemQuantityAction,
  clearCartAction,
  findUniqueCartAction,
  findManyCartItemsAction,
} from '@repo/database/prisma';

export {
  addToCartAction as addToCart,
  removeFromCartAction as removeFromCart,
  updateCartItemQuantityAction as updateCartQuantity,
  clearCartAction as clearCart,
};

// Wrapper for getCart that can handle no arguments (get current user cart)
export async function getCart(cartId?: string) {
  'use server';

  if (cartId) {
    return findUniqueCartAction({
      where: { id: cartId },
      include: { items: true },
    }) as any;
  }

  // If no cartId, try to get current user's cart
  // This would typically require getting the user session
  const { auth } = await import('@repo/auth/server/next');
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  // Find or create cart for current user
  return findUniqueCartAction({
    where: { userId: session.user.id },
    include: { items: true },
  }) as any;
}

export async function getCartItems(cartId?: string) {
  'use server';

  if (cartId) {
    return findManyCartItemsAction({ where: { cartId } });
  }

  const cart = await getCart();
  if (!cart) return [];

  return findManyCartItemsAction({ where: { cartId: cart.id } });
}
