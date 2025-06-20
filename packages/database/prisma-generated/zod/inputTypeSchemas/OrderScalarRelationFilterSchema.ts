import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderWhereInputSchema } from './OrderWhereInputSchema';

export const OrderScalarRelationFilterSchema: z.ZodType<Prisma.OrderScalarRelationFilter> = z.object({
  is: z.lazy(() => OrderWhereInputSchema).optional(),
  isNot: z.lazy(() => OrderWhereInputSchema).optional()
}).strict();

export default OrderScalarRelationFilterSchema;
