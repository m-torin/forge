import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const RegistryPurchaseJoinCountOrderByAggregateInputSchema: z.ZodType<Prisma.RegistryPurchaseJoinCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  purchaseDate: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  transactionId: z.lazy(() => SortOrderSchema).optional(),
  orderNumber: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  currency: z.lazy(() => SortOrderSchema).optional(),
  trackingNumber: z.lazy(() => SortOrderSchema).optional(),
  trackingUrl: z.lazy(() => SortOrderSchema).optional(),
  estimatedDelivery: z.lazy(() => SortOrderSchema).optional(),
  actualDelivery: z.lazy(() => SortOrderSchema).optional(),
  isGift: z.lazy(() => SortOrderSchema).optional(),
  giftMessage: z.lazy(() => SortOrderSchema).optional(),
  giftWrapped: z.lazy(() => SortOrderSchema).optional(),
  thankYouSent: z.lazy(() => SortOrderSchema).optional(),
  thankYouSentAt: z.lazy(() => SortOrderSchema).optional(),
  thankYouMessage: z.lazy(() => SortOrderSchema).optional(),
  notes: z.lazy(() => SortOrderSchema).optional(),
  purchaserId: z.lazy(() => SortOrderSchema).optional(),
  registryItemId: z.lazy(() => SortOrderSchema).optional(),
  notifiedOwner: z.lazy(() => SortOrderSchema).optional(),
  notifiedDate: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default RegistryPurchaseJoinCountOrderByAggregateInputSchema;
