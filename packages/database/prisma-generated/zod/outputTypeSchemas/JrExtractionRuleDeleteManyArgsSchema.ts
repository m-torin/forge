import { z } from 'zod';
import type { Prisma } from '../../client';
import { JrExtractionRuleWhereInputSchema } from '../inputTypeSchemas/JrExtractionRuleWhereInputSchema'

export const JrExtractionRuleDeleteManyArgsSchema: z.ZodType<Prisma.JrExtractionRuleDeleteManyArgs> = z.object({
  where: JrExtractionRuleWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default JrExtractionRuleDeleteManyArgsSchema;
