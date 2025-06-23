import type { Prisma } from '../../client';

import { z } from 'zod';
import { LodgingTypeSchema } from './LodgingTypeSchema';
import { NestedEnumLodgingTypeNullableWithAggregatesFilterSchema } from './NestedEnumLodgingTypeNullableWithAggregatesFilterSchema';
import { NestedIntNullableFilterSchema } from './NestedIntNullableFilterSchema';
import { NestedEnumLodgingTypeNullableFilterSchema } from './NestedEnumLodgingTypeNullableFilterSchema';

export const EnumLodgingTypeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.EnumLodgingTypeNullableWithAggregatesFilter> =
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
          z.lazy(() => NestedEnumLodgingTypeNullableWithAggregatesFilterSchema),
        ])
        .optional()
        .nullable(),
      _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
      _min: z.lazy(() => NestedEnumLodgingTypeNullableFilterSchema).optional(),
      _max: z.lazy(() => NestedEnumLodgingTypeNullableFilterSchema).optional(),
    })
    .strict();

export default EnumLodgingTypeNullableWithAggregatesFilterSchema;
