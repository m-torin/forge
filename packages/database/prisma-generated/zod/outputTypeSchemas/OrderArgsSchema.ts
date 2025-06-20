import { z } from 'zod';
import type { Prisma } from '../../client';
import { OrderSelectSchema } from '../inputTypeSchemas/OrderSelectSchema';
import { OrderIncludeSchema } from '../inputTypeSchemas/OrderIncludeSchema';

export const OrderArgsSchema: z.ZodType<Prisma.OrderDefaultArgs> = z.object({
  select: z.lazy(() => OrderSelectSchema).optional(),
  include: z.lazy(() => OrderIncludeSchema).optional(),
}).strict();

export default OrderArgsSchema;
