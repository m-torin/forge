import type { Prisma } from '../../client';

import { z } from 'zod';
import { LodgingTypeSchema } from './LodgingTypeSchema';

export const NestedEnumLodgingTypeNullableFilterSchema: z.ZodType<Prisma.NestedEnumLodgingTypeNullableFilter> =
  z
    .object({
      equals: z
        .lazy(() => LodgingTypeSchema)
        .optional()
        .nullable(),
      in: z
        .lazy(() => LodgingTypeSchema)
        .array()
        .optional()
        .nullable(),
      notIn: z
        .lazy(() => LodgingTypeSchema)
        .array()
        .optional()
        .nullable(),
      not: z
        .union([
          z.lazy(() => LodgingTypeSchema),
          z.lazy(() => NestedEnumLodgingTypeNullableFilterSchema),
        ])
        .optional()
        .nullable(),
    })
    .strict();

export default NestedEnumLodgingTypeNullableFilterSchema;
