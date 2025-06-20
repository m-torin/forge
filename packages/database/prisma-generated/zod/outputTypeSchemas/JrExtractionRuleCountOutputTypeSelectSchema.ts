import { z } from 'zod';
import type { Prisma } from '../../client';

export const JrExtractionRuleCountOutputTypeSelectSchema: z.ZodType<Prisma.JrExtractionRuleCountOutputTypeSelect> = z.object({
  findReplaceRules: z.boolean().optional(),
}).strict();

export default JrExtractionRuleCountOutputTypeSelectSchema;
