import { z } from 'zod';
import type { Prisma } from '../../client';
import { JrExtractionRuleCreateManyInputSchema } from '../inputTypeSchemas/JrExtractionRuleCreateManyInputSchema'

export const JrExtractionRuleCreateManyAndReturnArgsSchema: z.ZodType<Prisma.JrExtractionRuleCreateManyAndReturnArgs> = z.object({
  data: z.union([ JrExtractionRuleCreateManyInputSchema,JrExtractionRuleCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default JrExtractionRuleCreateManyAndReturnArgsSchema;
