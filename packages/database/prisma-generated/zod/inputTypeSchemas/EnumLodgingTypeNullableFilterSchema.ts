import type { Prisma } from '../../client';

import { z } from 'zod';
import { LodgingTypeSchema } from './LodgingTypeSchema';
import { NestedEnumLodgingTypeNullableFilterSchema } from './NestedEnumLodgingTypeNullableFilterSchema';

export const EnumLodgingTypeNullableFilterSchema: z.ZodType<Prisma.EnumLodgingTypeNullableFilter> =
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

export default EnumLodgingTypeNullableFilterSchema;
