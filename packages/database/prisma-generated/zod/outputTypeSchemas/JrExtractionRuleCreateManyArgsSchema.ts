import { z } from 'zod';
import type { Prisma } from '../../client';
import { JrExtractionRuleCreateManyInputSchema } from '../inputTypeSchemas/JrExtractionRuleCreateManyInputSchema'

export const JrExtractionRuleCreateManyArgsSchema: z.ZodType<Prisma.JrExtractionRuleCreateManyArgs> = z.object({
  data: z.union([ JrExtractionRuleCreateManyInputSchema,JrExtractionRuleCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default JrExtractionRuleCreateManyArgsSchema;
