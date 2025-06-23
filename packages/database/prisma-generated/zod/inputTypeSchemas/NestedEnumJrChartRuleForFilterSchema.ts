import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrChartRuleForSchema } from './JrChartRuleForSchema';

export const NestedEnumJrChartRuleForFilterSchema: z.ZodType<Prisma.NestedEnumJrChartRuleForFilter> =
  z
    .object({
      equals: z.lazy(() => JrChartRuleForSchema).optional(),
      in: z
        .lazy(() => JrChartRuleForSchema)
        .array()
        .optional(),
      notIn: z
        .lazy(() => JrChartRuleForSchema)
        .array()
        .optional(),
      not: z
        .union([
          z.lazy(() => JrChartRuleForSchema),
          z.lazy(() => NestedEnumJrChartRuleForFilterSchema),
        ])
        .optional(),
    })
    .strict();

export default NestedEnumJrChartRuleForFilterSchema;
