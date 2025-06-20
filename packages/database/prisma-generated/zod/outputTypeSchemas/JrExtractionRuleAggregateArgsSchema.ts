import { z } from 'zod';
import type { Prisma } from '../../client';
import { JrExtractionRuleWhereInputSchema } from '../inputTypeSchemas/JrExtractionRuleWhereInputSchema'
import { JrExtractionRuleOrderByWithRelationInputSchema } from '../inputTypeSchemas/JrExtractionRuleOrderByWithRelationInputSchema'
import { JrExtractionRuleWhereUniqueInputSchema } from '../inputTypeSchemas/JrExtractionRuleWhereUniqueInputSchema'

export const JrExtractionRuleAggregateArgsSchema: z.ZodType<Prisma.JrExtractionRuleAggregateArgs> = z.object({
  where: JrExtractionRuleWhereInputSchema.optional(),
  orderBy: z.union([ JrExtractionRuleOrderByWithRelationInputSchema.array(),JrExtractionRuleOrderByWithRelationInputSchema ]).optional(),
  cursor: JrExtractionRuleWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default JrExtractionRuleAggregateArgsSchema;
