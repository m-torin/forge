import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrChartMethodSchema } from './JrChartMethodSchema';
import { NestedEnumJrChartMethodWithAggregatesFilterSchema } from './NestedEnumJrChartMethodWithAggregatesFilterSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumJrChartMethodFilterSchema } from './NestedEnumJrChartMethodFilterSchema';

export const EnumJrChartMethodWithAggregatesFilterSchema: z.ZodType<Prisma.EnumJrChartMethodWithAggregatesFilter> =
  z
    .object({
      equals: z.lazy(() => JrChartMethodSchema).optional(),
      in: z
        .lazy(() => JrChartMethodSchema)
        .array()
        .optional(),
      notIn: z
        .lazy(() => JrChartMethodSchema)
        .array()
        .optional(),
      not: z
        .union([
          z.lazy(() => JrChartMethodSchema),
          z.lazy(() => NestedEnumJrChartMethodWithAggregatesFilterSchema),
        ])
        .optional(),
      _count: z.lazy(() => NestedIntFilterSchema).optional(),
      _min: z.lazy(() => NestedEnumJrChartMethodFilterSchema).optional(),
      _max: z.lazy(() => NestedEnumJrChartMethodFilterSchema).optional(),
    })
    .strict();

export default EnumJrChartMethodWithAggregatesFilterSchema;
