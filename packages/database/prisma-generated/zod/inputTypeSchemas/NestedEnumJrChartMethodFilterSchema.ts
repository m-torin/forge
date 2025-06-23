import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrChartMethodSchema } from './JrChartMethodSchema';

export const NestedEnumJrChartMethodFilterSchema: z.ZodType<Prisma.NestedEnumJrChartMethodFilter> =
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
          z.lazy(() => NestedEnumJrChartMethodFilterSchema),
        ])
        .optional(),
    })
    .strict();

export default NestedEnumJrChartMethodFilterSchema;
