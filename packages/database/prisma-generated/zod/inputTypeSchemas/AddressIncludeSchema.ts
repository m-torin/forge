import { z } from 'zod';
import type { Prisma } from '../../client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { OrderFindManyArgsSchema } from "../outputTypeSchemas/OrderFindManyArgsSchema"
import { AddressCountOutputTypeArgsSchema } from "../outputTypeSchemas/AddressCountOutputTypeArgsSchema"

export const AddressIncludeSchema: z.ZodType<Prisma.AddressInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  orderShippingAddresses: z.union([z.boolean(),z.lazy(() => OrderFindManyArgsSchema)]).optional(),
  orderBillingAddresses: z.union([z.boolean(),z.lazy(() => OrderFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => AddressCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default AddressIncludeSchema;
