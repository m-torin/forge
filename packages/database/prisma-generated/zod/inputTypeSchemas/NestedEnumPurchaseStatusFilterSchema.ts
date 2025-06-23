import type { Prisma } from '../../client';

import { z } from 'zod';
import { PurchaseStatusSchema } from './PurchaseStatusSchema';

export const NestedEnumPurchaseStatusFilterSchema: z.ZodType<Prisma.NestedEnumPurchaseStatusFilter> =
  z
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

export default NestedEnumPurchaseStatusFilterSchema;
