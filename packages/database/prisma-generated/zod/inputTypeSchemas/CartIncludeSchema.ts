import { z } from 'zod';
import type { Prisma } from '../../client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { CartItemFindManyArgsSchema } from "../outputTypeSchemas/CartItemFindManyArgsSchema"
import { CartCountOutputTypeArgsSchema } from "../outputTypeSchemas/CartCountOutputTypeArgsSchema"

export const CartIncludeSchema: z.ZodType<Prisma.CartInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  items: z.union([z.boolean(),z.lazy(() => CartItemFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CartCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default CartIncludeSchema;
