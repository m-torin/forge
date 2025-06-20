import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrRuleActionSchema } from './JrRuleActionSchema';
import { NestedEnumJrRuleActionFilterSchema } from './NestedEnumJrRuleActionFilterSchema';

export const EnumJrRuleActionFilterSchema: z.ZodType<Prisma.EnumJrRuleActionFilter> = z.object({
  equals: z.lazy(() => JrRuleActionSchema).optional(),
  in: z.lazy(() => JrRuleActionSchema).array().optional(),
  notIn: z.lazy(() => JrRuleActionSchema).array().optional(),
  not: z.union([ z.lazy(() => JrRuleActionSchema),z.lazy(() => NestedEnumJrRuleActionFilterSchema) ]).optional(),
}).strict();

export default EnumJrRuleActionFilterSchema;
