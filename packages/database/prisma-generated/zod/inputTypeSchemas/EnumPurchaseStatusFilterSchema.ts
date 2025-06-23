import type { Prisma } from '../../client';

import { z } from 'zod';
import { PurchaseStatusSchema } from './PurchaseStatusSchema';
import { NestedEnumPurchaseStatusFilterSchema } from './NestedEnumPurchaseStatusFilterSchema';

export const EnumPurchaseStatusFilterSchema: z.ZodType<Prisma.EnumPurchaseStatusFilter> = z
  .object({
    equals: z.lazy(() => PurchaseStatusSchema).optional(),
    in: z
      .lazy(() => PurchaseStatusSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => PurchaseStatusSchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => PurchaseStatusSchema),
        z.lazy(() => NestedEnumPurchaseStatusFilterSchema),
      ])
      .optional(),
  })
  .strict();

export default EnumPurchaseStatusFilterSchema;
