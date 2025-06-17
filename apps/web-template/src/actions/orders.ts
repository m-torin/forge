'use server';

import {
  findManyOrdersAction,
  findUniqueOrderAction,
  createOrderAction,
  updateOrderAction,
} from '@repo/database/prisma';

// Wrapper functions that return expected format with data property
export async function getOrders(args?: any) {
  'use server';
  const orders = await findManyOrdersAction({
    ...args,
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
    orders: orders as any, // Type assertion for expanded orders
    success: true,
  };
}

export async function getOrder(id: string) {
  'use server';
  const order = await findUniqueOrderAction({ where: { id } });
  return { data: order };
}

export async function getOrderByNumber(orderNumber: string) {
  'use server';
  const result = await findUniqueOrderAction({
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
  // Return the order directly for backward compatibility with type assertion
  return result as any;
}

export { createOrderAction as createOrder, updateOrderAction as updateOrder };
