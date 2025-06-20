import { z } from 'zod';
import type { Prisma } from '../../client';
import { CartIncludeSchema } from '../inputTypeSchemas/CartIncludeSchema'
import { CartCreateInputSchema } from '../inputTypeSchemas/CartCreateInputSchema'
import { CartUncheckedCreateInputSchema } from '../inputTypeSchemas/CartUncheckedCreateInputSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { CartItemFindManyArgsSchema } from "../outputTypeSchemas/CartItemFindManyArgsSchema"
import { CartCountOutputTypeArgsSchema } from "../outputTypeSchemas/CartCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const CartSelectSchema: z.ZodType<Prisma.CartSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  sessionId: z.boolean().optional(),
  status: z.boolean().optional(),
  expiresAt: z.boolean().optional(),
  currency: z.boolean().optional(),
  notes: z.boolean().optional(),
  metadata: z.boolean().optional(),
  abandonedAt: z.boolean().optional(),
  recoveredAt: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deletedAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  items: z.union([z.boolean(),z.lazy(() => CartItemFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CartCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const CartCreateArgsSchema: z.ZodType<Prisma.CartCreateArgs> = z.object({
  select: CartSelectSchema.optional(),
  include: z.lazy(() => CartIncludeSchema).optional(),
  data: z.union([ CartCreateInputSchema,CartUncheckedCreateInputSchema ]),
}).strict() ;

export default CartCreateArgsSchema;
