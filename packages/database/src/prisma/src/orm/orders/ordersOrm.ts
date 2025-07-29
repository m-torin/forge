'use server';

import type { OrderStatus, Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// ORDER CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createOrderOrm(
  args: Prisma.OrderCreateArgs,
): Promise<Prisma.OrderGetPayload<typeof args>> {
  try {
    return await prisma.order.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstOrderOrm(args?: Prisma.OrderFindFirstArgs) {
  return prisma.order.findFirst(args);
}

export async function findUniqueOrderOrm(args: Prisma.OrderFindUniqueArgs) {
  return prisma.order.findUnique(args);
}

export async function findManyOrdersOrm(args?: Prisma.OrderFindManyArgs) {
  return prisma.order.findMany(args);
}

// UPDATE
export async function updateOrderOrm(args: Prisma.OrderUpdateArgs) {
  return prisma.order.update(args);
}

export async function updateManyOrdersOrm(args: Prisma.OrderUpdateManyArgs) {
  return prisma.order.updateMany(args);
}

// UPSERT
export async function upsertOrderOrm(args: Prisma.OrderUpsertArgs) {
  return prisma.order.upsert(args);
}

// DELETE
export async function deleteOrderOrm(args: Prisma.OrderDeleteArgs) {
  return prisma.order.delete(args);
}

export async function deleteManyOrdersOrm(args?: Prisma.OrderDeleteManyArgs) {
  return prisma.order.deleteMany(args);
}

// AGGREGATE
export async function aggregateOrdersOrm(args?: Prisma.OrderAggregateArgs) {
  return prisma.order.aggregate(args ?? {});
}

export async function countOrdersOrm(args?: Prisma.OrderCountArgs) {
  return prisma.order.count(args);
}

export async function groupByOrdersOrm(args: Prisma.OrderGroupByArgs) {
  return await prisma.order.groupBy(args);
}

//==============================================================================
// ENHANCED ORDER OPERATIONS
//==============================================================================

/**
 * Find order with all details (items, user, addresses)
 */
export async function findOrderWithDetailsOrm(where: Prisma.OrderWhereUniqueInput) {
  return await prisma.order.findUnique({
    where,
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      billingAddress: true,
      shippingAddress: true,
      transactions: true,
    },
  });
}

/**
 * Find user's orders with pagination
 */
export async function findUserOrdersOrm(
  userId: string,
  pagination?: { skip?: number; take?: number },
) {
  return await prisma.order.findMany({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
    skip: pagination?.skip,
    take: pagination?.take,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Find orders by status
 */
export async function findOrdersByStatusOrm(
  status: OrderStatus,
  pagination?: { skip?: number; take?: number },
) {
  return await prisma.order.findMany({
    where: {
      status,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
    skip: pagination?.skip,
    take: pagination?.take,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Update order status
 */
export async function updateOrderStatusOrm(orderId: string, status: OrderStatus) {
  try {
    return await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Order not found: ${orderId}`);
    }
    handlePrismaError(error);
  }
}

//==============================================================================
// TYPE DEFINITIONS FOR ORDER PAYLOADS
//==============================================================================

/**
 * Order with complete details
 */
export type OrderWithDetailsOrm = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: {
            category: true;
            identifiers: true;
          };
        };
      };
    };
    user: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    billingAddress: true;
    shippingAddress: true;
    transactions: true;
  };
}>;

/**
 * User order summary
 */
export type UserOrderSummary = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: {
          select: {
            id: true;
            name: true;
            media: {
              orderBy: {
                sortOrder: 'asc';
              };
              select: {
                url: true;
                altText: true;
              };
              take: 1;
            };
          };
        };
      };
    };
  };
}>;
