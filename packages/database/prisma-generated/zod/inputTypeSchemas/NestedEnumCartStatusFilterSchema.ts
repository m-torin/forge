import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartStatusSchema } from './CartStatusSchema';

export const NestedEnumCartStatusFilterSchema: z.ZodType<Prisma.NestedEnumCartStatusFilter> = z
  .object({
    equals: z.lazy(() => CartStatusSchema).optional(),
    in: z
      .lazy(() => CartStatusSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => CartStatusSchema)
      .array()
      .optional(),
    not: z
      .union([z.lazy(() => CartStatusSchema), z.lazy(() => NestedEnumCartStatusFilterSchema)])
      .optional(),
  })
  .strict();

export default NestedEnumCartStatusFilterSchema;
