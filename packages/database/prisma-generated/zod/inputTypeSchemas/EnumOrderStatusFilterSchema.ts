import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderStatusSchema } from './OrderStatusSchema';
import { NestedEnumOrderStatusFilterSchema } from './NestedEnumOrderStatusFilterSchema';

export const EnumOrderStatusFilterSchema: z.ZodType<Prisma.EnumOrderStatusFilter> = z
  .object({
    equals: z.lazy(() => OrderStatusSchema).optional(),
    in: z
      .lazy(() => OrderStatusSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => OrderStatusSchema)
      .array()
      .optional(),
    not: z
      .union([z.lazy(() => OrderStatusSchema), z.lazy(() => NestedEnumOrderStatusFilterSchema)])
      .optional(),
  })
  .strict();

export default EnumOrderStatusFilterSchema;
