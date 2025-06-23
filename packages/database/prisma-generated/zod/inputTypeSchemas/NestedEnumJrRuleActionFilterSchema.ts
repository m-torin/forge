import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrRuleActionSchema } from './JrRuleActionSchema';

export const NestedEnumJrRuleActionFilterSchema: z.ZodType<Prisma.NestedEnumJrRuleActionFilter> = z
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
      .union([z.lazy(() => JrRuleActionSchema), z.lazy(() => NestedEnumJrRuleActionFilterSchema)])
      .optional(),
  })
  .strict();

export default NestedEnumJrRuleActionFilterSchema;
