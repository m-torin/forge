import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrRuleActionSchema } from './JrRuleActionSchema';

export const JrFindReplaceRejectCreateManyInputSchema: z.ZodType<Prisma.JrFindReplaceRejectCreateManyInput> = z.object({
  id: z.number().int().optional(),
  lookFor: z.string(),
  replaceWith: z.string().optional().nullable(),
  ruleAction: z.lazy(() => JrRuleActionSchema).optional(),
  isRegex: z.boolean().optional(),
  regexFlags: z.string().optional().nullable(),
  priority: z.number().int().optional()
}).strict();

export default JrFindReplaceRejectCreateManyInputSchema;
