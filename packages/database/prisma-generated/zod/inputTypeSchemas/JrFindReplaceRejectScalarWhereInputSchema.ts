import type { Prisma } from '../../client';

import { z } from 'zod';
import { IntFilterSchema } from './IntFilterSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { EnumJrRuleActionFilterSchema } from './EnumJrRuleActionFilterSchema';
import { JrRuleActionSchema } from './JrRuleActionSchema';
import { BoolFilterSchema } from './BoolFilterSchema';

export const JrFindReplaceRejectScalarWhereInputSchema: z.ZodType<Prisma.JrFindReplaceRejectScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema),z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema),z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  lookFor: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  replaceWith: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  ruleAction: z.union([ z.lazy(() => EnumJrRuleActionFilterSchema),z.lazy(() => JrRuleActionSchema) ]).optional(),
  isRegex: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  regexFlags: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  priority: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
}).strict();

export default JrFindReplaceRejectScalarWhereInputSchema;
