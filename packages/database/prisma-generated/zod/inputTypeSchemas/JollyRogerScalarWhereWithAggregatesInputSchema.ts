import type { Prisma } from '../../client';

import { z } from 'zod';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';
import { BoolWithAggregatesFilterSchema } from './BoolWithAggregatesFilterSchema';
import { EnumJrChartMethodWithAggregatesFilterSchema } from './EnumJrChartMethodWithAggregatesFilterSchema';
import { JrChartMethodSchema } from './JrChartMethodSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { JsonNullableWithAggregatesFilterSchema } from './JsonNullableWithAggregatesFilterSchema';

export const JollyRogerScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.JollyRogerScalarWhereWithAggregatesInput> =
  z
    .object({
      AND: z
        .union([
          z.lazy(() => JollyRogerScalarWhereWithAggregatesInputSchema),
          z.lazy(() => JollyRogerScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => JollyRogerScalarWhereWithAggregatesInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => JollyRogerScalarWhereWithAggregatesInputSchema),
          z.lazy(() => JollyRogerScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      id: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
      canChart: z.union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()]).optional(),
      chartingMethod: z
        .union([
          z.lazy(() => EnumJrChartMethodWithAggregatesFilterSchema),
          z.lazy(() => JrChartMethodSchema),
        ])
        .optional(),
      brandId: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      sitemaps: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      gridUrls: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      pdpUrlPatterns: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
    })
    .strict();

export default JollyRogerScalarWhereWithAggregatesInputSchema;
