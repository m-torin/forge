import { z } from 'zod';
import { PurchaseStatusSchema } from '../inputTypeSchemas/PurchaseStatusSchema'

/////////////////////////////////////////
// REGISTRY PURCHASE JOIN SCHEMA
/////////////////////////////////////////

export const RegistryPurchaseJoinSchema = z.object({
  status: PurchaseStatusSchema,
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  purchaseDate: z.coerce.date(),
  quantity: z.number().int(),
  transactionId: z.string().nullable(),
  orderNumber: z.string().nullable(),
  price: z.number().nullable(),
  currency: z.string().nullable(),
  trackingNumber: z.string().nullable(),
  trackingUrl: z.string().nullable(),
  estimatedDelivery: z.coerce.date().nullable(),
  actualDelivery: z.coerce.date().nullable(),
  isGift: z.boolean(),
  giftMessage: z.string().nullable(),
  giftWrapped: z.boolean(),
  thankYouSent: z.boolean(),
  thankYouSentAt: z.coerce.date().nullable(),
  thankYouMessage: z.string().nullable(),
  notes: z.string().nullable(),
  purchaserId: z.string(),
  registryItemId: z.string(),
  notifiedOwner: z.boolean(),
  notifiedDate: z.coerce.date().nullable(),
})

export type RegistryPurchaseJoin = z.infer<typeof RegistryPurchaseJoinSchema>

export default RegistryPurchaseJoinSchema;
