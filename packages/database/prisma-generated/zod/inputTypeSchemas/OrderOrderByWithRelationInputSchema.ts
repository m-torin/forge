import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { AddressOrderByWithRelationInputSchema } from './AddressOrderByWithRelationInputSchema';
import { OrderItemOrderByRelationAggregateInputSchema } from './OrderItemOrderByRelationAggregateInputSchema';
import { TransactionOrderByRelationAggregateInputSchema } from './TransactionOrderByRelationAggregateInputSchema';

export const OrderOrderByWithRelationInputSchema: z.ZodType<Prisma.OrderOrderByWithRelationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      orderNumber: z.lazy(() => SortOrderSchema).optional(),
      userId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      guestEmail: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      guestName: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      status: z.lazy(() => SortOrderSchema).optional(),
      shippingAddressId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      billingAddressId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      currency: z.lazy(() => SortOrderSchema).optional(),
      subtotal: z.lazy(() => SortOrderSchema).optional(),
      taxAmount: z.lazy(() => SortOrderSchema).optional(),
      shippingAmount: z.lazy(() => SortOrderSchema).optional(),
      discountAmount: z.lazy(() => SortOrderSchema).optional(),
      total: z.lazy(() => SortOrderSchema).optional(),
      shippingMethod: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      trackingNumber: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      shippedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      deliveredAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      paymentStatus: z.lazy(() => SortOrderSchema).optional(),
      paymentMethod: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      customerNotes: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      internalNotes: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      metadata: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      deletedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
      shippingAddress: z.lazy(() => AddressOrderByWithRelationInputSchema).optional(),
      billingAddress: z.lazy(() => AddressOrderByWithRelationInputSchema).optional(),
      items: z.lazy(() => OrderItemOrderByRelationAggregateInputSchema).optional(),
      transactions: z.lazy(() => TransactionOrderByRelationAggregateInputSchema).optional(),
    })
    .strict();

export default OrderOrderByWithRelationInputSchema;
