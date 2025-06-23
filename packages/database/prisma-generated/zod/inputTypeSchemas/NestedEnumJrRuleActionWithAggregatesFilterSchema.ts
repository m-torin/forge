import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrRuleActionSchema } from './JrRuleActionSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumJrRuleActionFilterSchema } from './NestedEnumJrRuleActionFilterSchema';

export const NestedEnumJrRuleActionWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumJrRuleActionWithAggregatesFilter> =
  z
    .object({
      equals: z.lazy(() => JrRuleActionSchema).optional(),
      in: z
        .lazy(() => JrRuleActionSchema)
        .array()
        .optional(),
      notIn: z
        .lazy(() => JrRuleActionSchema)
        .array()
        .optional(),
      not: z
        .union([
          z.lazy(() => JrRuleActionSchema),
          z.lazy(() => NestedEnumJrRuleActionWithAggregatesFilterSchema),
        ])
        .optional(),
      _count: z.lazy(() => NestedIntFilterSchema).optional(),
      _min: z.lazy(() => NestedEnumJrRuleActionFilterSchema).optional(),
      _max: z.lazy(() => NestedEnumJrRuleActionFilterSchema).optional(),
    })
    .strict();

export default NestedEnumJrRuleActionWithAggregatesFilterSchema;
