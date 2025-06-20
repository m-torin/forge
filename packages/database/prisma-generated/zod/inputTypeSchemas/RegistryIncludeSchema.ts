import { z } from 'zod';
import type { Prisma } from '../../client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { RegistryItemFindManyArgsSchema } from "../outputTypeSchemas/RegistryItemFindManyArgsSchema"
import { RegistryUserJoinFindManyArgsSchema } from "../outputTypeSchemas/RegistryUserJoinFindManyArgsSchema"
import { CartItemFindManyArgsSchema } from "../outputTypeSchemas/CartItemFindManyArgsSchema"
import { OrderItemFindManyArgsSchema } from "../outputTypeSchemas/OrderItemFindManyArgsSchema"
import { RegistryCountOutputTypeArgsSchema } from "../outputTypeSchemas/RegistryCountOutputTypeArgsSchema"

export const RegistryIncludeSchema: z.ZodType<Prisma.RegistryInclude> = z.object({
  deletedBy: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  createdByUser: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  items: z.union([z.boolean(),z.lazy(() => RegistryItemFindManyArgsSchema)]).optional(),
  users: z.union([z.boolean(),z.lazy(() => RegistryUserJoinFindManyArgsSchema)]).optional(),
  cartItems: z.union([z.boolean(),z.lazy(() => CartItemFindManyArgsSchema)]).optional(),
  orderItems: z.union([z.boolean(),z.lazy(() => OrderItemFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => RegistryCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default RegistryIncludeSchema;
