'use server';

import {
  // Cart CRUD functions
  createCartOrm,
  findFirstCartOrm,
  findUniqueCartOrm,
  findManyCartsOrm,
  updateCartOrm,
  updateManyCartsOrm,
  upsertCartOrm,
  deleteCartOrm,
  deleteManyCartsOrm,
  aggregateCartsOrm,
  countCartsOrm,
  groupByCartsOrm,
} from '../orm/cartOrm';
import {
  // CartItem CRUD functions for business logic
  createCartItemOrm,
  findFirstCartItemOrm,
  findManyCartItemsOrm,
  updateCartItemOrm,
  deleteCartItemOrm,
  deleteManyCartItemsOrm,
} from '../orm/cartItemOrm';
import type { Prisma } from '../../../prisma-generated/client';
import { prisma } from '../../clients/standard';

//==============================================================================
// CART SERVER ACTIONS
//==============================================================================

export async function createCartAction(args: Prisma.CartCreateArgs) {
  'use server';
  return createCartOrm(args);
}

export async function findFirstCartAction(args?: Prisma.CartFindFirstArgs) {
  'use server';
  return findFirstCartOrm(args);
}

export async function findUniqueCartAction(args: Prisma.CartFindUniqueArgs) {
  'use server';
  return findUniqueCartOrm(args);
}

export async function findManyCartsAction(args?: Prisma.CartFindManyArgs) {
  'use server';
  return findManyCartsOrm(args);
}

export async function updateCartAction(args: Prisma.CartUpdateArgs) {
  'use server';
  return updateCartOrm(args);
}

export async function updateManyCartsAction(args: Prisma.CartUpdateManyArgs) {
  'use server';
  return updateManyCartsOrm(args);
}

export async function upsertCartAction(args: Prisma.CartUpsertArgs) {
  'use server';
  return upsertCartOrm(args);
}

export async function deleteCartAction(args: Prisma.CartDeleteArgs) {
  'use server';
  return deleteCartOrm(args);
}

export async function deleteManyCartsAction(args?: Prisma.CartDeleteManyArgs) {
  'use server';
  return deleteManyCartsOrm(args);
}

export async function aggregateCartsAction(args?: Prisma.CartAggregateArgs) {
  'use server';
  return aggregateCartsOrm(args);
}

export async function countCartsAction(args?: Prisma.CartCountArgs) {
  'use server';
  return countCartsOrm(args);
}

export async function groupByCartsAction(args: Prisma.CartGroupByArgs) {
  'use server';
  return groupByCartsOrm(args);
}

//==============================================================================
// BUSINESS LOGIC CART ACTIONS
//==============================================================================

export interface CartWithItems {
  id: string;
  userId: string | null;
  sessionId: string | null;
  status: string;
  currency: string;
  notes: string | null;
  metadata: any;
  items: CartItemWithProduct[];
  subtotal: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItemWithProduct {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  price: number;
  isGift: boolean;
  giftMessage: string | null;
  registryId: string | null;
  savedForLater: boolean;
  product: {
    id: string;
    name: string;
    sku: string;
    image: string | null;
    slug: string;
  };
  variant?: {
    id: string;
    name: string;
    sku: string;
    attributes: any;
  };
}

export async function getOrCreateCartAction(
  userId?: string,
  sessionId?: string,
): Promise<CartWithItems> {
  'use server';

  // Try to find existing cart
  let cart;
  if (userId) {
    cart = await findFirstCartOrm({
      where: {
        userId,
        status: 'ACTIVE',
        deletedAt: null,
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
  } else if (sessionId) {
    cart = await findFirstCartOrm({
      where: {
        sessionId,
        status: 'ACTIVE',
        deletedAt: null,
      },
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

  // Create new cart if none found
  if (!cart) {
    cart = await createCartOrm({
      data: {
        userId: userId || undefined,
        sessionId: sessionId || undefined,
        status: 'ACTIVE',
        currency: 'USD',
      },
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

  return transformCartToWithItems(cart);
}

export async function addToCartAction(
  cartId: string,
  productId: string,
  quantity: number = 1,
  options?: {
    variantId?: string;
    isGift?: boolean;
    giftMessage?: string;
    registryId?: string;
  },
): Promise<CartWithItems> {
  'use server';

  // Check if item already exists in cart
  const existingItem = await findFirstCartItemOrm({
    where: {
      cartId,
      productId,
      variantId: options?.variantId,
      savedForLater: false,
    },
  });

  if (existingItem) {
    // Update quantity
    await updateCartItemOrm({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    // Create new item
    await createCartItemOrm({
      data: {
        cartId,
        productId,
        quantity,
        variantId: options?.variantId,
        isGift: options?.isGift || false,
        giftMessage: options?.giftMessage,
        registryId: options?.registryId,
        savedForLater: false,
      } as any,
    });
  }

  const updatedCart = await findUniqueCartOrm({
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

  return transformCartToWithItems(updatedCart!);
}

export async function updateCartItemQuantityAction(
  cartId: string,
  itemId: string,
  quantity: number,
): Promise<CartWithItems> {
  'use server';

  await updateCartItemOrm({
    where: { id: itemId },
    data: { quantity },
  });

  const updatedCart = await findUniqueCartOrm({
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

  return transformCartToWithItems(updatedCart!);
}

export async function removeFromCartAction(cartId: string, itemId: string): Promise<CartWithItems> {
  'use server';

  await deleteCartItemOrm({
    where: { id: itemId },
  });

  const updatedCart = await findUniqueCartOrm({
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

  return transformCartToWithItems(updatedCart!);
}

export async function clearCartAction(cartId: string): Promise<CartWithItems> {
  'use server';

  await deleteManyCartItemsOrm({
    where: { cartId },
  });

  const updatedCart = await findUniqueCartOrm({
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

  return transformCartToWithItems(updatedCart!);
}

export async function saveForLaterAction(
  cartId: string,
  itemId: string,
): Promise<{ cart: CartWithItems; savedItems: CartItemWithProduct[] }> {
  'use server';

  // Update the cart item to mark it as saved for later
  await updateCartItemOrm({
    where: { id: itemId },
    data: { savedForLater: true },
  });

  const [updatedCart, savedItemsData] = await Promise.all([
    findUniqueCartOrm({
      where: { id: cartId },
      include: {
        items: {
          where: { savedForLater: false },
          include: {
            product: true,
            variant: true,
          },
        },
      },
    }),
    findManyCartItemsOrm({
      where: {
        cartId,
        savedForLater: true,
      },
      include: {
        product: true,
        variant: true,
      },
    }),
  ]);

  return {
    cart: transformCartToWithItems(updatedCart!),
    savedItems: savedItemsData.map(transformCartItemToWithProduct),
  };
}

export async function moveToCartAction(
  cartId: string,
  itemId: string,
): Promise<{ cart: CartWithItems; savedItems: CartItemWithProduct[] }> {
  'use server';

  // Update the cart item to mark it as not saved for later (move to active cart)
  await updateCartItemOrm({
    where: { id: itemId },
    data: { savedForLater: false },
  });

  const [updatedCart, savedItemsData] = await Promise.all([
    findUniqueCartOrm({
      where: { id: cartId },
      include: {
        items: {
          where: { savedForLater: false },
          include: {
            product: true,
            variant: true,
          },
        },
      },
    }),
    findManyCartItemsOrm({
      where: {
        cartId,
        savedForLater: true,
      },
      include: {
        product: true,
        variant: true,
      },
    }),
  ]);

  return {
    cart: transformCartToWithItems(updatedCart!),
    savedItems: savedItemsData.map(transformCartItemToWithProduct),
  };
}

export async function getSavedItemsAction(cartId: string): Promise<CartItemWithProduct[]> {
  'use server';

  const savedItems = await findManyCartItemsOrm({
    where: {
      cartId,
      savedForLater: true,
    },
    include: {
      product: true,
      variant: true,
    },
  });
  return savedItems.map(transformCartItemToWithProduct);
}

/**
 * Find abandoned carts
 */
export async function findAbandonedCartsAction(abandonedBefore: Date) {
  'use server';
  return findManyCartsOrm({
    where: {
      status: 'ACTIVE',
      updatedAt: {
        lt: abandonedBefore,
      },
      deletedAt: null,
      items: {
        some: {}, // Has at least one item
      },
    },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      user: true,
    },
  });
}

/**
 * Mark cart as abandoned
 */
export async function markCartAsAbandonedAction(id: string) {
  'use server';
  return updateCartOrm({
    where: { id },
    data: { status: 'ABANDONED' },
  });
}

/**
 * Convert cart to order (when checkout is completed)
 */
export async function convertCartToOrderAction(id: string) {
  'use server';
  return updateCartOrm({
    where: { id },
    data: { status: 'COMPLETED' as any },
  });
}

/**
 * Merge guest cart with user cart (when user logs in)
 */
export async function mergeGuestCartWithUserCartAction(guestCartId: string, userCartId: string) {
  'use server';

  // Transaction to merge carts
  return prisma.$transaction(async (tx) => {
    // Get guest cart items
    const guestItems = await tx.cartItem.findMany({
      where: { cartId: guestCartId },
    });

    // Get user cart items for comparison
    const userItems = await tx.cartItem.findMany({
      where: { cartId: userCartId },
    });

    // Process each guest item
    for (const guestItem of guestItems) {
      const existingUserItem = userItems.find(
        (item) =>
          item.productId === guestItem.productId &&
          item.variantId === guestItem.variantId &&
          item.savedForLater === guestItem.savedForLater,
      );

      if (existingUserItem) {
        // Update quantity if item exists
        await tx.cartItem.update({
          where: { id: existingUserItem.id },
          data: {
            quantity: existingUserItem.quantity + guestItem.quantity,
            // Update gift and registry info if the guest item has them
            ...(guestItem.isGift && {
              isGift: guestItem.isGift,
              giftMessage: guestItem.giftMessage,
            }),
            ...(guestItem.registryId && {
              registryId: guestItem.registryId,
            }),
          },
        });
      } else {
        // Create new item in user cart
        await tx.cartItem.create({
          data: {
            ...guestItem,
            id: undefined, // Let the database generate a new ID
            cartId: userCartId,
          } as any,
        });
      }
    }

    // Mark guest cart as merged
    await tx.cart.update({
      where: { id: guestCartId },
      data: {
        status: 'MERGED',
        metadata: {
          mergedTo: userCartId,
          mergedAt: new Date().toISOString(),
        },
      },
    });

    // Return updated user cart
    return tx.cart.findUnique({
      where: { id: userCartId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
  });
}

// Helper to transform cart item to expected format
function transformCartItemToWithProduct(item: any): CartItemWithProduct {
  return {
    id: item.id,
    cartId: item.cartId,
    productId: item.productId,
    variantId: item.variantId,
    quantity: item.quantity,
    price: item.price || 0,
    isGift: item.isGift || false,
    giftMessage: item.giftMessage,
    registryId: item.registryId,
    savedForLater: item.savedForLater || false,
    product: {
      id: item.product.id,
      name: item.product.name,
      sku: item.product.sku || '',
      image: item.product.image,
      slug: item.product.slug || '',
    },
    variant: item.variant
      ? {
          id: item.variant.id,
          name: item.variant.name,
          sku: item.variant.sku,
          attributes: item.variant.attributes,
        }
      : undefined,
  };
}

// Helper to transform cart to expected format
function transformCartToWithItems(cart: any): CartWithItems {
  return {
    id: cart.id,
    userId: cart.userId,
    sessionId: cart.sessionId,
    status: cart.status,
    currency: cart.currency || 'USD',
    notes: cart.notes,
    metadata: cart.metadata,
    items:
      cart.items?.map((item: any) => ({
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price || 0,
        isGift: item.isGift || false,
        giftMessage: item.giftMessage,
        registryId: item.registryId,
        savedForLater: item.savedForLater || false,
        product: {
          id: item.product.id,
          name: item.product.name,
          sku: item.product.sku || '',
          image: item.product.image,
          slug: item.product.slug || '',
        },
        variant: item.variant
          ? {
              id: item.variant.id,
              name: item.variant.name,
              sku: item.variant.sku,
              attributes: item.variant.attributes,
            }
          : undefined,
      })) || [],
    subtotal: cart.subtotal || 0,
    itemCount: cart.itemCount || 0,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
}
