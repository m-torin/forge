import { z } from 'zod';
import type { Prisma } from '../../client';
import { OrderItemIncludeSchema } from '../inputTypeSchemas/OrderItemIncludeSchema'
import { OrderItemWhereInputSchema } from '../inputTypeSchemas/OrderItemWhereInputSchema'
import { OrderItemOrderByWithRelationInputSchema } from '../inputTypeSchemas/OrderItemOrderByWithRelationInputSchema'
import { OrderItemWhereUniqueInputSchema } from '../inputTypeSchemas/OrderItemWhereUniqueInputSchema'
import { OrderItemScalarFieldEnumSchema } from '../inputTypeSchemas/OrderItemScalarFieldEnumSchema'
import { OrderArgsSchema } from "../outputTypeSchemas/OrderArgsSchema"
import { ProductArgsSchema } from "../outputTypeSchemas/ProductArgsSchema"
import { RegistryArgsSchema } from "../outputTypeSchemas/RegistryArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const OrderItemSelectSchema: z.ZodType<Prisma.OrderItemSelect> = z.object({
  id: z.boolean().optional(),
  orderId: z.boolean().optional(),
  productId: z.boolean().optional(),
  variantId: z.boolean().optional(),
  productName: z.boolean().optional(),
  variantName: z.boolean().optional(),
  sku: z.boolean().optional(),
  quantity: z.boolean().optional(),
  price: z.boolean().optional(),
  total: z.boolean().optional(),
  isGift: z.boolean().optional(),
  giftMessage: z.boolean().optional(),
  registryId: z.boolean().optional(),
  status: z.boolean().optional(),
  fulfilledAt: z.boolean().optional(),
  metadata: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  order: z.union([z.boolean(),z.lazy(() => OrderArgsSchema)]).optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  variant: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  registry: z.union([z.boolean(),z.lazy(() => RegistryArgsSchema)]).optional(),
}).strict()

export const OrderItemFindFirstArgsSchema: z.ZodType<Prisma.OrderItemFindFirstArgs> = z.object({
  select: OrderItemSelectSchema.optional(),
  include: z.lazy(() => OrderItemIncludeSchema).optional(),
  where: OrderItemWhereInputSchema.optional(),
  orderBy: z.union([ OrderItemOrderByWithRelationInputSchema.array(),OrderItemOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderItemWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderItemScalarFieldEnumSchema,OrderItemScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default OrderItemFindFirstArgsSchema;
