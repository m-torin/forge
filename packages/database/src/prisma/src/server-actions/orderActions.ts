'use server';

import {
  aggregateOrdersOrm,
  countOrdersOrm,
  // Order CRUD functions
  createOrderOrm,
  deleteManyOrdersOrm,
  deleteOrderOrm,
  findFirstOrderOrm,
  findManyOrdersOrm,
  findUniqueOrderOrm,
  groupByOrdersOrm,
  updateManyOrdersOrm,
  updateOrderOrm,
  upsertOrderOrm,
} from '../orm/orders/ordersOrm';

import type { Prisma } from '../../../../prisma-generated/client';
import { OrderItemStatus, OrderStatus, PaymentStatus } from '../../../../prisma-generated/client';

//==============================================================================
// ORDER SERVER ACTIONS
//==============================================================================

export async function createOrderAction(args: Prisma.OrderCreateArgs) {
  'use server';
  return createOrderOrm(args);
}

export async function findFirstOrderAction(args?: Prisma.OrderFindFirstArgs) {
  'use server';
  return findFirstOrderOrm(args);
}

export async function findUniqueOrderAction(args: Prisma.OrderFindUniqueArgs) {
  'use server';
  return findUniqueOrderOrm(args);
}

export async function findManyOrdersAction(args?: Prisma.OrderFindManyArgs) {
  'use server';
  return findManyOrdersOrm(args);
}

export async function updateOrderAction(args: Prisma.OrderUpdateArgs) {
  'use server';
  return updateOrderOrm(args);
}

export async function updateManyOrdersAction(args: Prisma.OrderUpdateManyArgs) {
  'use server';
  return updateManyOrdersOrm(args);
}

export async function upsertOrderAction(args: Prisma.OrderUpsertArgs) {
  'use server';
  return upsertOrderOrm(args);
}

export async function deleteOrderAction(args: Prisma.OrderDeleteArgs) {
  'use server';
  return deleteOrderOrm(args);
}

export async function deleteManyOrdersAction(args?: Prisma.OrderDeleteManyArgs) {
  'use server';
  return deleteManyOrdersOrm(args);
}

export async function aggregateOrdersAction(args?: Prisma.OrderAggregateArgs) {
  'use server';
  return aggregateOrdersOrm(args);
}

export async function countOrdersAction(args?: Prisma.OrderCountArgs) {
  'use server';
  return countOrdersOrm(args);
}

export async function groupByOrdersAction(args: Prisma.OrderGroupByArgs) {
  'use server';
  return groupByOrdersOrm(args);
}

//==============================================================================
// BUSINESS LOGIC ORDER ACTIONS
//==============================================================================

// Import types that are already imported at the top

export interface OrderWithDetails {
  id: string;
  orderNumber: string;
  userId: string | null;
  guestEmail: string | null;
  guestName: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  currency: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;
  shippingMethod: string | null;
  trackingNumber: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  paymentMethod: string | null;
  customerNotes: string | null;
  shippingAddress: OrderAddressData | null;
  billingAddress: OrderAddressData | null;
  items: OrderItemData[];
  transactions: TransactionData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderAddressData {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  phone: string | null;
  street1: string;
  street2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItemData {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  price: number;
  status: OrderItemStatus;
  product: {
    id: string;
    name: string;
  };
}

export interface TransactionData {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  reference: string | null;
  createdAt: Date;
}

export async function createOrderFromCartAction(
  _cartId: string,
  _orderData: {
    userId?: string;
    guestEmail?: string;
    guestName?: string;
    shippingAddressId?: string;
    billingAddressId?: string;
    shippingAddress?: any;
    billingAddress?: any;
    shippingMethod: string;
    paymentMethod: string;
    customerNotes?: string;
  },
): Promise<OrderWithDetails> {
  'use server';

  // Implementation would create order from cart
  throw new Error('createOrderFromCartAction implementation needed');
}

export async function getOrderByIdAction(orderId: string): Promise<OrderWithDetails> {
  'use server';

  const order = await findUniqueOrderOrm({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      transactions: true,
      shippingAddress: true,
      billingAddress: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  return transformOrderToWithDetails(order);
}

export async function getOrderByNumberAction(orderNumber: string): Promise<OrderWithDetails> {
  'use server';

  const order = await findFirstOrderOrm({
    where: { orderNumber, deletedAt: null },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      transactions: true,
      shippingAddress: true,
      billingAddress: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  return transformOrderToWithDetails(order);
}

export async function getUserOrdersAction(
  userId: string,
  options?: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
  },
): Promise<{ orders: OrderWithDetails[]; total: number }> {
  'use server';

  const limit = options?.limit || 10;
  const skip = options?.page ? (options.page - 1) * limit : 0;

  const where = { userId, deletedAt: null, ...(options?.status && { status: options.status }) };

  const [orders, total] = await Promise.all([
    findManyOrdersOrm({
      where: { userId, deletedAt: null, ...(options?.status && { status: options.status }) },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        transactions: true,
        shippingAddress: true,
        billingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    countOrdersOrm({ where }),
  ]);

  return {
    orders: orders.map(transformOrderToWithDetails),
    total,
  };
}

export async function getGuestOrdersAction(email: string): Promise<OrderWithDetails[]> {
  'use server';

  const orders = await findManyOrdersOrm({
    where: { guestEmail: email, deletedAt: null },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      transactions: true,
      shippingAddress: true,
      billingAddress: true,
    },
  });

  return orders.map(transformOrderToWithDetails);
}

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  options?: {
    trackingNumber?: string;
    internalNotes?: string;
  },
): Promise<OrderWithDetails> {
  'use server';

  const order = await updateOrderOrm({
    where: { id: orderId },
    data: {
      status,
      ...(status === OrderStatus.SHIPPED && { shippedAt: new Date() }),
      ...(status === OrderStatus.DELIVERED && { deliveredAt: new Date() }),
    },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      transactions: true,
      shippingAddress: true,
      billingAddress: true,
    },
  });

  if (options?.trackingNumber) {
    await updateOrderOrm({
      where: { id: orderId },
      data: { trackingNumber: options.trackingNumber },
    });
  }

  return transformOrderToWithDetails(order);
}

export async function cancelOrderAction(
  orderId: string,
  reason: string,
): Promise<OrderWithDetails> {
  'use server';

  const order = await updateOrderOrm({
    where: { id: orderId },
    data: {
      status: OrderStatus.CANCELLED,
      metadata: { cancellationReason: reason },
    },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      transactions: true,
      shippingAddress: true,
      billingAddress: true,
    },
  });

  return transformOrderToWithDetails(order);
}

export async function getOrderSummaryAction(_orderId: string): Promise<any> {
  'use server';

  // Implementation would get order summary with payment details
  throw new Error('getOrderSummaryAction implementation needed');
}

// Helper to transform order to expected format
function transformOrderToWithDetails(order: any): OrderWithDetails {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    guestEmail: order.guestEmail,
    guestName: order.guestName,
    status: order.status,
    paymentStatus: order.paymentStatus,
    currency: order.currency,
    subtotal: order.subtotal,
    taxAmount: order.taxAmount,
    shippingAmount: order.shippingAmount,
    discountAmount: order.discountAmount,
    total: order.total,
    shippingMethod: order.shippingMethod,
    trackingNumber: order.trackingNumber,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    paymentMethod: order.paymentMethod,
    customerNotes: order.customerNotes,
    shippingAddress: order.shippingAddress,
    billingAddress: order.billingAddress,
    items:
      order.items?.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        status: item.status,
        product: {
          id: item.product.id,
          name: item.product.name,
        },
      })) || [],
    transactions:
      order.transactions?.map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        status: tx.status,
        amount: tx.amount,
        currency: tx.currency,
        reference: tx.reference,
        createdAt: tx.createdAt,
      })) || [],
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
