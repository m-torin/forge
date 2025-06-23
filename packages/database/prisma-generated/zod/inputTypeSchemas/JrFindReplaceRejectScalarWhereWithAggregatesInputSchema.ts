import type { Prisma } from '../../client';

import { z } from 'zod';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { EnumJrRuleActionWithAggregatesFilterSchema } from './EnumJrRuleActionWithAggregatesFilterSchema';
import { JrRuleActionSchema } from './JrRuleActionSchema';
import { BoolWithAggregatesFilterSchema } from './BoolWithAggregatesFilterSchema';

export const JrFindReplaceRejectScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectScalarWhereWithAggregatesInput> =
  z
    .object({
      AND: z
        .union([
          z.lazy(() => JrFindReplaceRejectScalarWhereWithAggregatesInputSchema),
          z.lazy(() => JrFindReplaceRejectScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => JrFindReplaceRejectScalarWhereWithAggregatesInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => JrFindReplaceRejectScalarWhereWithAggregatesInputSchema),
          z.lazy(() => JrFindReplaceRejectScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      id: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
      lookFor: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      replaceWith: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      ruleAction: z
        .union([
          z.lazy(() => EnumJrRuleActionWithAggregatesFilterSchema),
          z.lazy(() => JrRuleActionSchema),
        ])
        .optional(),
      isRegex: z.union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()]).optional(),
      regexFlags: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      priority: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
    })
    .strict();

export default JrFindReplaceRejectScalarWhereWithAggregatesInputSchema;
