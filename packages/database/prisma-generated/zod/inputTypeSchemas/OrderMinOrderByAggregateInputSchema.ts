import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const OrderMinOrderByAggregateInputSchema: z.ZodType<Prisma.OrderMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderNumber: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  guestEmail: z.lazy(() => SortOrderSchema).optional(),
  guestName: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  shippingAddressId: z.lazy(() => SortOrderSchema).optional(),
  billingAddressId: z.lazy(() => SortOrderSchema).optional(),
  currency: z.lazy(() => SortOrderSchema).optional(),
  subtotal: z.lazy(() => SortOrderSchema).optional(),
  taxAmount: z.lazy(() => SortOrderSchema).optional(),
  shippingAmount: z.lazy(() => SortOrderSchema).optional(),
  discountAmount: z.lazy(() => SortOrderSchema).optional(),
  total: z.lazy(() => SortOrderSchema).optional(),
  shippingMethod: z.lazy(() => SortOrderSchema).optional(),
  trackingNumber: z.lazy(() => SortOrderSchema).optional(),
  shippedAt: z.lazy(() => SortOrderSchema).optional(),
  deliveredAt: z.lazy(() => SortOrderSchema).optional(),
  paymentStatus: z.lazy(() => SortOrderSchema).optional(),
  paymentMethod: z.lazy(() => SortOrderSchema).optional(),
  customerNotes: z.lazy(() => SortOrderSchema).optional(),
  internalNotes: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default OrderMinOrderByAggregateInputSchema;
