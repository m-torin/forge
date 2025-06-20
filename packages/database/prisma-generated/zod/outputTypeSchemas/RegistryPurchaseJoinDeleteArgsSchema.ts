import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryPurchaseJoinIncludeSchema } from '../inputTypeSchemas/RegistryPurchaseJoinIncludeSchema'
import { RegistryPurchaseJoinWhereUniqueInputSchema } from '../inputTypeSchemas/RegistryPurchaseJoinWhereUniqueInputSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { RegistryItemArgsSchema } from "../outputTypeSchemas/RegistryItemArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const RegistryPurchaseJoinSelectSchema: z.ZodType<Prisma.RegistryPurchaseJoinSelect> = z.object({
  id: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  purchaseDate: z.boolean().optional(),
  quantity: z.boolean().optional(),
  status: z.boolean().optional(),
  transactionId: z.boolean().optional(),
  orderNumber: z.boolean().optional(),
  price: z.boolean().optional(),
  currency: z.boolean().optional(),
  trackingNumber: z.boolean().optional(),
  trackingUrl: z.boolean().optional(),
  estimatedDelivery: z.boolean().optional(),
  actualDelivery: z.boolean().optional(),
  isGift: z.boolean().optional(),
  giftMessage: z.boolean().optional(),
  giftWrapped: z.boolean().optional(),
  thankYouSent: z.boolean().optional(),
  thankYouSentAt: z.boolean().optional(),
  thankYouMessage: z.boolean().optional(),
  notes: z.boolean().optional(),
  purchaserId: z.boolean().optional(),
  registryItemId: z.boolean().optional(),
  notifiedOwner: z.boolean().optional(),
  notifiedDate: z.boolean().optional(),
  purchaser: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  registryItem: z.union([z.boolean(),z.lazy(() => RegistryItemArgsSchema)]).optional(),
}).strict()

export const RegistryPurchaseJoinDeleteArgsSchema: z.ZodType<Prisma.RegistryPurchaseJoinDeleteArgs> = z.object({
  select: RegistryPurchaseJoinSelectSchema.optional(),
  include: z.lazy(() => RegistryPurchaseJoinIncludeSchema).optional(),
  where: RegistryPurchaseJoinWhereUniqueInputSchema,
}).strict() ;

export default RegistryPurchaseJoinDeleteArgsSchema;
