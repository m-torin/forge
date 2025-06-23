import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationTypeSchema } from './LocationTypeSchema';

export const NestedEnumLocationTypeFilterSchema: z.ZodType<Prisma.NestedEnumLocationTypeFilter> = z
  .object({
    equals: z.lazy(() => LocationTypeSchema).optional(),
    in: z
      .lazy(() => LocationTypeSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => LocationTypeSchema)
      .array()
      .optional(),
    not: z
      .union([z.lazy(() => LocationTypeSchema), z.lazy(() => NestedEnumLocationTypeFilterSchema)])
      .optional(),
  })
  .strict();

export default NestedEnumLocationTypeFilterSchema;
