import { z } from 'zod';
import type { Prisma } from '../../client';
import { OrderIncludeSchema } from '../inputTypeSchemas/OrderIncludeSchema';
import { OrderWhereUniqueInputSchema } from '../inputTypeSchemas/OrderWhereUniqueInputSchema';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { AddressArgsSchema } from '../outputTypeSchemas/AddressArgsSchema';
import { OrderItemFindManyArgsSchema } from '../outputTypeSchemas/OrderItemFindManyArgsSchema';
import { TransactionFindManyArgsSchema } from '../outputTypeSchemas/TransactionFindManyArgsSchema';
import { OrderCountOutputTypeArgsSchema } from '../outputTypeSchemas/OrderCountOutputTypeArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const OrderSelectSchema: z.ZodType<Prisma.OrderSelect> = z
  .object({
    id: z.boolean().optional(),
    orderNumber: z.boolean().optional(),
    userId: z.boolean().optional(),
    guestEmail: z.boolean().optional(),
    guestName: z.boolean().optional(),
    status: z.boolean().optional(),
    shippingAddressId: z.boolean().optional(),
    billingAddressId: z.boolean().optional(),
    currency: z.boolean().optional(),
    subtotal: z.boolean().optional(),
    taxAmount: z.boolean().optional(),
    shippingAmount: z.boolean().optional(),
    discountAmount: z.boolean().optional(),
    total: z.boolean().optional(),
    shippingMethod: z.boolean().optional(),
    trackingNumber: z.boolean().optional(),
    shippedAt: z.boolean().optional(),
    deliveredAt: z.boolean().optional(),
    paymentStatus: z.boolean().optional(),
    paymentMethod: z.boolean().optional(),
    customerNotes: z.boolean().optional(),
    internalNotes: z.boolean().optional(),
    metadata: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    deletedAt: z.boolean().optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    shippingAddress: z.union([z.boolean(), z.lazy(() => AddressArgsSchema)]).optional(),
    billingAddress: z.union([z.boolean(), z.lazy(() => AddressArgsSchema)]).optional(),
    items: z.union([z.boolean(), z.lazy(() => OrderItemFindManyArgsSchema)]).optional(),
    transactions: z.union([z.boolean(), z.lazy(() => TransactionFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => OrderCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export const OrderDeleteArgsSchema: z.ZodType<Prisma.OrderDeleteArgs> = z
  .object({
    select: OrderSelectSchema.optional(),
    include: z.lazy(() => OrderIncludeSchema).optional(),
    where: OrderWhereUniqueInputSchema,
  })
  .strict();

export default OrderDeleteArgsSchema;
