import type { Prisma } from '../../client';

import { z } from 'zod';
import { PurchaseStatusSchema } from './PurchaseStatusSchema';
import { UserCreateNestedOneWithoutPurchasesInputSchema } from './UserCreateNestedOneWithoutPurchasesInputSchema';

export const RegistryPurchaseJoinCreateWithoutRegistryItemInputSchema: z.ZodType<Prisma.RegistryPurchaseJoinCreateWithoutRegistryItemInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  purchaseDate: z.coerce.date().optional(),
  quantity: z.number().int().optional(),
  status: z.lazy(() => PurchaseStatusSchema).optional(),
  transactionId: z.string().optional().nullable(),
  orderNumber: z.string().optional().nullable(),
  price: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
  trackingUrl: z.string().optional().nullable(),
  estimatedDelivery: z.coerce.date().optional().nullable(),
  actualDelivery: z.coerce.date().optional().nullable(),
  isGift: z.boolean().optional(),
  giftMessage: z.string().optional().nullable(),
  giftWrapped: z.boolean().optional(),
  thankYouSent: z.boolean().optional(),
  thankYouSentAt: z.coerce.date().optional().nullable(),
  thankYouMessage: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  notifiedOwner: z.boolean().optional(),
  notifiedDate: z.coerce.date().optional().nullable(),
  purchaser: z.lazy(() => UserCreateNestedOneWithoutPurchasesInputSchema)
}).strict();

export default RegistryPurchaseJoinCreateWithoutRegistryItemInputSchema;
