import { z } from 'zod';
import type { Prisma } from '../../client';
import { CartItemIncludeSchema } from '../inputTypeSchemas/CartItemIncludeSchema'
import { CartItemWhereUniqueInputSchema } from '../inputTypeSchemas/CartItemWhereUniqueInputSchema'
import { CartArgsSchema } from "../outputTypeSchemas/CartArgsSchema"
import { ProductArgsSchema } from "../outputTypeSchemas/ProductArgsSchema"
import { RegistryArgsSchema } from "../outputTypeSchemas/RegistryArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const CartItemSelectSchema: z.ZodType<Prisma.CartItemSelect> = z.object({
  id: z.boolean().optional(),
  cartId: z.boolean().optional(),
  productId: z.boolean().optional(),
  variantId: z.boolean().optional(),
  quantity: z.boolean().optional(),
  price: z.boolean().optional(),
  isGift: z.boolean().optional(),
  giftMessage: z.boolean().optional(),
  registryId: z.boolean().optional(),
  savedForLater: z.boolean().optional(),
  metadata: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  cart: z.union([z.boolean(),z.lazy(() => CartArgsSchema)]).optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  variant: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  registry: z.union([z.boolean(),z.lazy(() => RegistryArgsSchema)]).optional(),
}).strict()

export const CartItemDeleteArgsSchema: z.ZodType<Prisma.CartItemDeleteArgs> = z.object({
  select: CartItemSelectSchema.optional(),
  include: z.lazy(() => CartItemIncludeSchema).optional(),
  where: CartItemWhereUniqueInputSchema,
}).strict() ;

export default CartItemDeleteArgsSchema;
