'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@repo/auth/server/next';
import { type Prisma } from '@repo/database/prisma';
import {
  findManyCartsOrm,
  countCartsOrm,
  createCartOrm,
  updateCartOrm,
  deleteCartOrm,
  findUniqueCartOrm,
  updateManyCartsOrm,
  findManyCartItemsOrm,
  createCartItemOrm,
  updateCartItemOrm,
  deleteCartItemOrm,
  findUniqueCartItemOrm,
  deleteManyCartItemsOrm,
  countCartItemsOrm,
  aggregateCartItemsOrm,
  findFirstCartOrm,
  findFirstCartItemOrm,
} from '@repo/database/prisma';

import type { CartStatus } from '@repo/database/prisma';

/**
 * Cart management actions for PIM3
 *
 * These actions provide cart and cart item management functionality:
 * - Cart CRUD operations
 * - Cart item management
 * - Bulk operations
 * - Analytics and reporting
 */

// Get carts with pagination and filtering
export async function getCarts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: CartStatus;
  userId?: string;
  includeAbandoned?: boolean;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const { status, includeAbandoned = false, limit = 50, page = 1, userId, search } = params || {};

    const skip = (page - 1) * limit;

    const where: Prisma.CartWhereInput = {
      ...(includeAbandoned ? {} : { deletedAt: null }),
      ...(search && {
        OR: [
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { sessionId: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
      ...(userId && { userId }),
    };

    const [carts, total] = await Promise.all([
      findManyCartsOrm({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  slug: true,
                },
              },
              variant: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
              registry: {
                select: {
                  id: true,
                },
              },
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: [{ updatedAt: 'desc' }],
        skip,
        take: limit,
        where,
      }),
      countCartsOrm({ where }),
    ]);

    return {
      data: carts,
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load carts', success: false as const };
  }
}

// Get a single cart by ID
export async function getCart(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const cart = await findUniqueCartOrm({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                slug: true,
                price: true,
                currency: true,
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                sku: true,
                variantPrice: true,
              },
            },
            registry: {
              select: {
                id: true,
              },
            },
          },
          orderBy: [{ createdAt: 'asc' }],
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      where: { id },
    });

    if (!cart) {
      return { error: 'Cart not found', success: false as const };
    }

    return { data: cart, success: true as const };
  } catch (error) {
    return { error: 'Failed to load cart', success: false as const };
  }
}

// Create a new cart
export async function createCart(data: {
  userId?: string;
  sessionId?: string;
  status?: CartStatus;
  currency?: string;
  notes?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    // Validate that either userId or sessionId is provided
    if (!data.userId && !data.sessionId) {
      return { error: 'Either userId or sessionId must be provided', success: false as const };
    }

    // Check if user already has an active cart
    if (data.userId) {
      const existingCart = await findFirstCartOrm({
        where: {
          userId: data.userId,
          status: 'ACTIVE',
        },
      });

      if (existingCart) {
        return { error: 'User already has an active cart', success: false as const };
      }
    }

    const cart = await createCartOrm({
      data: {
        userId: data.userId,
        sessionId: data.sessionId,
        status: data.status || 'ACTIVE',
        currency: data.currency || 'USD',
        notes: data.notes,
        metadata: data.metadata,
        expiresAt: data.expiresAt,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    revalidatePath('/pim3/carts');
    return { data: cart, success: true as const };
  } catch (error) {
    return { error: 'Failed to create cart', success: false as const };
  }
}

// Update a cart
export async function updateCart(
  id: string,
  data: {
    status?: CartStatus;
    currency?: string;
    notes?: string;
    metadata?: Record<string, any>;
    expiresAt?: Date;
    abandonedAt?: Date;
    recoveredAt?: Date;
  },
) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const cart = await updateCartOrm({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      where: { id },
    });

    revalidatePath('/pim3/carts');
    return { data: cart, success: true as const };
  } catch (error) {
    return { error: 'Failed to update cart', success: false as const };
  }
}

// Delete a cart (soft delete)
export async function deleteCart(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const cart = await updateCartOrm({
      data: {
        deletedAt: new Date(),
        status: 'ABANDONED',
      },
      where: { id },
    });

    revalidatePath('/pim3/carts');
    return { data: cart, success: true as const };
  } catch (error) {
    return { error: 'Failed to delete cart', success: false as const };
  }
}

// Add item to cart
export async function addCartItem(data: {
  cartId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  isGift?: boolean;
  giftMessage?: string;
  registryId?: string;
  metadata?: Record<string, any>;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    // Check if item already exists in cart
    const existingItem = await findFirstCartItemOrm({
      where: {
        cartId: data.cartId,
        productId: data.productId,
        variantId: data.variantId,
      },
    });

    let cartItem;
    if (existingItem) {
      // Update quantity if item exists
      cartItem = await updateCartItemOrm({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + data.quantity,
          price: data.price, // Update price in case it changed
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
          registry: {
            select: {
              id: true,
            },
          },
        },
      });
    } else {
      // Create new cart item
      cartItem = await createCartItemOrm({
        data: {
          cartId: data.cartId,
          productId: data.productId,
          variantId: data.variantId,
          quantity: data.quantity,
          price: data.price,
          isGift: data.isGift || false,
          giftMessage: data.giftMessage,
          registryId: data.registryId,
          metadata: data.metadata,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
          registry: {
            select: {
              id: true,
            },
          },
        },
      });
    }

    // Update cart timestamp
    await updateCartOrm({
      where: { id: data.cartId },
      data: { updatedAt: new Date() },
    });

    revalidatePath('/pim3/carts');
    return { data: cartItem, success: true as const };
  } catch (error) {
    return { error: 'Failed to add cart item', success: false as const };
  }
}

// Update cart item
export async function updateCartItem(
  id: string,
  data: {
    quantity?: number;
    price?: number;
    isGift?: boolean;
    giftMessage?: string;
    savedForLater?: boolean;
    metadata?: Record<string, any>;
  },
) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const cartItem = await updateCartItemOrm({
      data,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        registry: {
          select: {
            id: true,
          },
        },
      },
      where: { id },
    });

    // Update cart timestamp
    await updateCartOrm({
      where: { id: cartItem.cartId },
      data: { updatedAt: new Date() },
    });

    revalidatePath('/pim3/carts');
    return { data: cartItem, success: true as const };
  } catch (error) {
    return { error: 'Failed to update cart item', success: false as const };
  }
}

// Remove cart item
export async function removeCartItem(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const cartItem = await findUniqueCartItemOrm({
      where: { id },
      select: { cartId: true },
    });

    if (!cartItem) {
      return { error: 'Cart item not found', success: false as const };
    }

    await deleteCartItemOrm({
      where: { id },
    });

    // Update cart timestamp
    await updateCartOrm({
      where: { id: cartItem.cartId },
      data: { updatedAt: new Date() },
    });

    revalidatePath('/pim3/carts');
    return { success: true as const };
  } catch (error) {
    return { error: 'Failed to remove cart item', success: false as const };
  }
}

// Clear cart (remove all items)
export async function clearCart(cartId: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    await deleteManyCartItemsOrm({
      where: { cartId },
    });

    // Update cart timestamp
    await updateCartOrm({
      where: { id: cartId },
      data: { updatedAt: new Date() },
    });

    revalidatePath('/pim3/carts');
    return { success: true as const };
  } catch (error) {
    return { error: 'Failed to clear cart', success: false as const };
  }
}

// Bulk update cart status
export async function bulkUpdateCartStatus(ids: string[], status: CartStatus) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    await updateManyCartsOrm({
      data: { status, updatedAt: new Date() },
      where: { id: { in: ids } },
    });

    revalidatePath('/pim3/carts');
    return { success: true as const };
  } catch (error) {
    return { error: 'Failed to update cart status', success: false as const };
  }
}

// Get cart analytics
export async function getCartAnalytics(params?: {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const { startDate, endDate, userId } = params || {};

    const where: Prisma.CartWhereInput = {
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      ...(userId && { userId }),
    };

    const [
      totalCarts,
      activeCarts,
      abandonedCarts,
      convertedCarts,
      averageItemCount,
      totalItemValue,
    ] = await Promise.all([
      countCartsOrm({ where }),
      countCartsOrm({ where: { ...where, status: 'ACTIVE' } }),
      countCartsOrm({ where: { ...where, status: 'ABANDONED' } }),
      countCartsOrm({ where: { ...where, status: 'CONVERTED' } }),
      aggregateCartItemsOrm({
        _avg: { quantity: true },
        where: { cart: where },
      }),
      aggregateCartItemsOrm({
        _sum: { price: true },
        where: { cart: where },
      }),
    ]);

    const conversionRate = totalCarts > 0 ? (convertedCarts / totalCarts) * 100 : 0;
    const abandonmentRate = totalCarts > 0 ? (abandonedCarts / totalCarts) * 100 : 0;

    return {
      data: {
        totalCarts,
        activeCarts,
        abandonedCarts,
        convertedCarts,
        conversionRate: Number(conversionRate.toFixed(2)),
        abandonmentRate: Number(abandonmentRate.toFixed(2)),
        averageItemCount: Number(averageItemCount._avg.quantity?.toFixed(2) || 0),
        totalItemValue: Number(totalItemValue._sum.price || 0),
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load cart analytics', success: false as const };
  }
}
