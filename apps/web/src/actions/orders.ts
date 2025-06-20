'use server';

import { logger } from '@/lib/logger';
import {
  findManyOrdersAction,
  findUniqueOrderAction,
  createOrderAction,
  updateOrderAction,
} from '@repo/database/prisma/server/next';

import { requireAuthContext, userOwnsResource } from './utils/auth-wrapper';

/**
 * Get orders for the current authenticated user
 */
export async function getOrders(args?: any) {
  'use server';

  const authContext = await requireAuthContext();

  // Only return orders for the current user
  const orders = await findManyOrdersAction({
    ...args,
    where: {
      ...args?.where,
      userId: authContext.user.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      shippingAddress: true,
      billingAddress: true,
      transactions: true,
    },
  });

  return {
    orders: orders as any,
    success: true,
  };
}

/**
 * Get a specific order by ID
 * Ensures the order belongs to the current user
 */
export async function getOrder(id: string) {
  'use server';

  const _authContext = await requireAuthContext();

  const order = await findUniqueOrderAction({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      shippingAddress: true,
      billingAddress: true,
      transactions: true,
    },
  });

  // Verify the order belongs to the current user
  if (order && order.userId && !(await userOwnsResource(order.userId))) {
    return {
      data: null,
      error: 'Order not found',
      success: false,
    };
  }

  return {
    data: order,
    success: true,
  };
}

/**
 * Get an order by order number
 * Ensures the order belongs to the current user
 */
export async function getOrderByNumber(orderNumber: string) {
  'use server';

  const _authContext = await requireAuthContext();

  const order = await findUniqueOrderAction({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      shippingAddress: true,
      billingAddress: true,
    },
  });

  // Verify the order belongs to the current user
  if (order && order.userId && !(await userOwnsResource(order.userId))) {
    return {
      data: null,
      error: 'Order not found',
      success: false,
    };
  }

  return {
    data: order,
    success: true,
  };
}

/**
 * Create a new order for the current user
 */
export async function createOrder(data: any) {
  'use server';

  const authContext = await requireAuthContext();

  // Ensure the order is created for the current user
  const orderData = {
    ...data,
    userId: authContext.user.id,
  };

  try {
    const order = await createOrderAction({
      data: orderData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
      },
    });

    return {
      data: order,
      success: true,
    };
  } catch (_error) {
    logger.error('Failed to create order', _error);
    return {
      data: null,
      error: _error instanceof Error ? _error.message : 'Failed to create order',
      success: false,
    };
  }
}

/**
 * Update an order
 * Ensures the order belongs to the current user
 */
export async function updateOrder(id: string, data: any) {
  'use server';

  const _authContext = await requireAuthContext();

  // First check if the order belongs to the current user
  const existingOrder = await findUniqueOrderAction({
    where: { id },
    select: { userId: true },
  });

  if (!existingOrder || !existingOrder.userId || !(await userOwnsResource(existingOrder.userId))) {
    return {
      data: null,
      error: 'Order not found',
      success: false,
    };
  }

  try {
    const order = await updateOrderAction({
      where: { id },
      data,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
      },
    });

    return {
      data: order,
      success: true,
    };
  } catch (_error) {
    logger.error('Failed to update order', _error);
    return {
      data: null,
      error: _error instanceof Error ? (_error as Error).message : 'Failed to update order',
      success: false,
    };
  }
}

/**
 * Get order statistics for the current user
 */
export async function getOrderStats() {
  'use server';

  const authContext = await requireAuthContext();

  const orders = await findManyOrdersAction({
    where: {
      userId: authContext.user.id,
    },
    select: {
      status: true,
      subtotal: true,
      taxAmount: true,
      shippingAmount: true,
      createdAt: true,
    },
  });

  const stats = {
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, order) => {
      const subtotal = Number(order.subtotal) || 0;
      const tax = Number(order.taxAmount) || 0;
      const shipping = Number(order.shippingAmount) || 0;
      return sum + subtotal + tax + shipping;
    }, 0),
    ordersByStatus: orders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  };

  return {
    data: stats,
    success: true,
  };
}
