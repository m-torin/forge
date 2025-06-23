import { z } from 'zod';
import type { Prisma } from '../../client';
import { JrExtractionRuleWhereInputSchema } from '../inputTypeSchemas/JrExtractionRuleWhereInputSchema';
import { JrExtractionRuleOrderByWithAggregationInputSchema } from '../inputTypeSchemas/JrExtractionRuleOrderByWithAggregationInputSchema';
import { JrExtractionRuleScalarFieldEnumSchema } from '../inputTypeSchemas/JrExtractionRuleScalarFieldEnumSchema';
import { JrExtractionRuleScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/JrExtractionRuleScalarWhereWithAggregatesInputSchema';

export const JrExtractionRuleGroupByArgsSchema: z.ZodType<Prisma.JrExtractionRuleGroupByArgs> = z
  .object({
    where: JrExtractionRuleWhereInputSchema.optional(),
    orderBy: z
      .union([
        JrExtractionRuleOrderByWithAggregationInputSchema.array(),
        JrExtractionRuleOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: JrExtractionRuleScalarFieldEnumSchema.array(),
    having: JrExtractionRuleScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default JrExtractionRuleGroupByArgsSchema;
