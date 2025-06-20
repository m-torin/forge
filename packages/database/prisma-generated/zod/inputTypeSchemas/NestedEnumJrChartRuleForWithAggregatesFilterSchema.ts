import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrChartRuleForSchema } from './JrChartRuleForSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumJrChartRuleForFilterSchema } from './NestedEnumJrChartRuleForFilterSchema';

export const NestedEnumJrChartRuleForWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumJrChartRuleForWithAggregatesFilter> = z.object({
  equals: z.lazy(() => JrChartRuleForSchema).optional(),
  in: z.lazy(() => JrChartRuleForSchema).array().optional(),
  notIn: z.lazy(() => JrChartRuleForSchema).array().optional(),
  not: z.union([ z.lazy(() => JrChartRuleForSchema),z.lazy(() => NestedEnumJrChartRuleForWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumJrChartRuleForFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumJrChartRuleForFilterSchema).optional()
}).strict();

export default NestedEnumJrChartRuleForWithAggregatesFilterSchema;
