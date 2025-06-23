import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandTypeSchema } from './BrandTypeSchema';

export const NestedEnumBrandTypeFilterSchema: z.ZodType<Prisma.NestedEnumBrandTypeFilter> = z
  .object({
    equals: z.lazy(() => BrandTypeSchema).optional(),
    in: z
      .lazy(() => BrandTypeSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => BrandTypeSchema)
      .array()
      .optional(),
    not: z
      .union([z.lazy(() => BrandTypeSchema), z.lazy(() => NestedEnumBrandTypeFilterSchema)])
      .optional(),
  })
  .strict();

export default NestedEnumBrandTypeFilterSchema;
