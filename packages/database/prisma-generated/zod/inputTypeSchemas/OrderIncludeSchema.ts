import { z } from 'zod';
import type { Prisma } from '../../client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { AddressArgsSchema } from "../outputTypeSchemas/AddressArgsSchema"
import { OrderItemFindManyArgsSchema } from "../outputTypeSchemas/OrderItemFindManyArgsSchema"
import { TransactionFindManyArgsSchema } from "../outputTypeSchemas/TransactionFindManyArgsSchema"
import { OrderCountOutputTypeArgsSchema } from "../outputTypeSchemas/OrderCountOutputTypeArgsSchema"

export const OrderIncludeSchema: z.ZodType<Prisma.OrderInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  shippingAddress: z.union([z.boolean(),z.lazy(() => AddressArgsSchema)]).optional(),
  billingAddress: z.union([z.boolean(),z.lazy(() => AddressArgsSchema)]).optional(),
  items: z.union([z.boolean(),z.lazy(() => OrderItemFindManyArgsSchema)]).optional(),
  transactions: z.union([z.boolean(),z.lazy(() => TransactionFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => OrderCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default OrderIncludeSchema;
