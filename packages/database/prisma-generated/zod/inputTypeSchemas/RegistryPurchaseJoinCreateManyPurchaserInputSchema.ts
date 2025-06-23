import type { Prisma } from '../../client';

import { z } from 'zod';
import { PurchaseStatusSchema } from './PurchaseStatusSchema';

export const RegistryPurchaseJoinCreateManyPurchaserInputSchema: z.ZodType<Prisma.RegistryPurchaseJoinCreateManyPurchaserInput> =
  z
    .object({
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
      registryItemId: z.string(),
      notifiedOwner: z.boolean().optional(),
      notifiedDate: z.coerce.date().optional().nullable(),
    })
    .strict();

export default RegistryPurchaseJoinCreateManyPurchaserInputSchema;
