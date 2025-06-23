'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@repo/auth/server/next';
import {
  db,
  type OrderStatus,
  type PaymentStatus,
  type OrderItemStatus,
  type Prisma,
} from '@repo/database/prisma';

/**
 * Order management actions for PIM3
 *
 * These actions provide order and order item management functionality:
 * - Order CRUD operations
 * - Order item management
 * - Order fulfillment workflow
 * - Payment tracking
 * - Analytics and reporting
 */

// Get orders with pagination and filtering
export async function getOrders(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const {
      status,
      paymentStatus,
      limit = 50,
      page = 1,
      userId,
      search,
      startDate,
      endDate,
    } = params || {};

    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { guestEmail: { contains: search, mode: 'insensitive' } },
          { guestName: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
      ...(userId && { userId }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
    };

    const [orders, total] = await Promise.all([
      db.order.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          shippingAddress: true,
          billingAddress: true,
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
                  name: true,
                },
              },
            },
          },
          transactions: {
            select: {
              id: true,
              amount: true,
              status: true,
              type: true,
              method: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              items: true,
              transactions: true,
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
        where,
      }),
      db.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load orders', success: false as const };
  }
}

// Get a single order by ID
export async function getOrder(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const order = await db.order.findUnique({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
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
                name: true,
                type: true,
              },
            },
          },
          orderBy: [{ createdAt: 'asc' }],
        },
        transactions: {
          orderBy: [{ createdAt: 'desc' }],
        },
        _count: {
          select: {
            items: true,
            transactions: true,
          },
        },
      },
      where: { id },
    });

    if (!order) {
      return { error: 'Order not found', success: false as const };
    }

    return { data: order, success: true as const };
  } catch (error) {
    return { error: 'Failed to load order', success: false as const };
  }
}

// Create a new order
export async function createOrder(data: {
  userId?: string;
  guestEmail?: string;
  guestName?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  currency?: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount?: number;
  total: number;
  shippingMethod?: string;
  paymentMethod?: string;
  customerNotes?: string;
  internalNotes?: string;
  metadata?: Record<string, any>;
  items: Array<{
    productId: string;
    variantId?: string;
    productName: string;
    variantName?: string;
    sku?: string;
    quantity: number;
    price: number;
    total: number;
    isGift?: boolean;
    giftMessage?: string;
    registryId?: string;
    metadata?: Record<string, any>;
  }>;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    // Validate that either userId or guest info is provided
    if (!data.userId && (!data.guestEmail || !data.guestName)) {
      return {
        error: 'Either userId or guest information must be provided',
        success: false as const,
      };
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const order = await db.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: data.userId,
          guestEmail: data.guestEmail,
          guestName: data.guestName,
          status: data.status || 'PENDING',
          paymentStatus: data.paymentStatus || 'PENDING',
          currency: data.currency || 'USD',
          subtotal: data.subtotal,
          taxAmount: data.taxAmount,
          shippingAmount: data.shippingAmount,
          discountAmount: data.discountAmount || 0,
          total: data.total,
          shippingMethod: data.shippingMethod,
          paymentMethod: data.paymentMethod,
          customerNotes: data.customerNotes,
          internalNotes: data.internalNotes,
          metadata: data.metadata,
        },
      });

      // Create order items
      if (data.items.length > 0) {
        await tx.orderItem.createMany({
          data: data.items.map((item) => ({
            orderId: newOrder.id,
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantName: item.variantName,
            sku: item.sku,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
            isGift: item.isGift || false,
            giftMessage: item.giftMessage,
            registryId: item.registryId,
            metadata: item.metadata,
          })),
        });
      }

      // Return the order with full relationships
      return tx.order.findUnique({
        where: { id: newOrder.id },
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
              transactions: true,
            },
          },
        },
      });
    });

    revalidatePath('/pim3/orders');
    return { data: order, success: true as const };
  } catch (error) {
    return { error: 'Failed to create order', success: false as const };
  }
}

// Update an order
export async function updateOrder(
  id: string,
  data: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    trackingNumber?: string;
    shippedAt?: Date;
    deliveredAt?: Date;
    customerNotes?: string;
    internalNotes?: string;
    metadata?: Record<string, any>;
  },
) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const order = await db.order.update({
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
        transactions: true,
        _count: {
          select: {
            items: true,
            transactions: true,
          },
        },
      },
      where: { id },
    });

    revalidatePath('/pim3/orders');
    return { data: order, success: true as const };
  } catch (error) {
    return { error: 'Failed to update order', success: false as const };
  }
}

// Update order item status
export async function updateOrderItem(
  id: string,
  data: {
    status?: OrderItemStatus;
    fulfilledAt?: Date;
    quantity?: number;
    metadata?: Record<string, any>;
  },
) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const orderItem = await db.orderItem.update({
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
        order: {
          select: {
            id: true,
            orderNumber: true,
          },
        },
      },
      where: { id },
    });

    revalidatePath('/pim3/orders');
    return { data: orderItem, success: true as const };
  } catch (error) {
    return { error: 'Failed to update order item', success: false as const };
  }
}

// Cancel an order (soft delete)
export async function cancelOrder(id: string, reason?: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const order = await db.order.update({
      data: {
        status: 'CANCELLED',
        internalNotes: reason ? `Cancelled: ${reason}` : 'Order cancelled',
        deletedAt: new Date(),
      },
      where: { id },
    });

    revalidatePath('/pim3/orders');
    return { data: order, success: true as const };
  } catch (error) {
    return { error: 'Failed to cancel order', success: false as const };
  }
}

// Bulk update order status
export async function bulkUpdateOrderStatus(ids: string[], status: OrderStatus) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    await db.order.updateMany({
      data: { status, updatedAt: new Date() },
      where: { id: { in: ids } },
    });

    revalidatePath('/pim3/orders');
    return { success: true as const };
  } catch (error) {
    return { error: 'Failed to update order status', success: false as const };
  }
}

// Bulk update payment status
export async function bulkUpdatePaymentStatus(ids: string[], paymentStatus: PaymentStatus) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    await db.order.updateMany({
      data: { paymentStatus, updatedAt: new Date() },
      where: { id: { in: ids } },
    });

    revalidatePath('/pim3/orders');
    return { success: true as const };
  } catch (error) {
    return { error: 'Failed to update payment status', success: false as const };
  }
}

// Get order analytics
export async function getOrderAnalytics(params?: {
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

    const where: Prisma.OrderWhereInput = {
      deletedAt: null,
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
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      averageOrderValue,
      paidOrders,
      pendingPayments,
    ] = await Promise.all([
      db.order.count({ where }),
      db.order.count({ where: { ...where, status: 'PENDING' } }),
      db.order.count({ where: { ...where, status: 'PROCESSING' } }),
      db.order.count({ where: { ...where, status: 'SHIPPED' } }),
      db.order.count({ where: { ...where, status: 'DELIVERED' } }),
      db.order.count({ where: { ...where, status: 'CANCELLED' } }),
      db.order.aggregate({
        _sum: { total: true },
        where: { ...where, status: { not: 'CANCELLED' } },
      }),
      db.order.aggregate({
        _avg: { total: true },
        where: { ...where, status: { not: 'CANCELLED' } },
      }),
      db.order.count({ where: { ...where, paymentStatus: 'PAID' } }),
      db.order.count({ where: { ...where, paymentStatus: 'PENDING' } }),
    ]);

    const fulfillmentRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;
    const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;
    const paymentSuccessRate = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0;

    return {
      data: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: Number(totalRevenue._sum.total || 0),
        averageOrderValue: Number(averageOrderValue._avg.total?.toFixed(2) || 0),
        fulfillmentRate: Number(fulfillmentRate.toFixed(2)),
        cancellationRate: Number(cancellationRate.toFixed(2)),
        paymentSuccessRate: Number(paymentSuccessRate.toFixed(2)),
        paidOrders,
        pendingPayments,
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load order analytics', success: false as const };
  }
}
