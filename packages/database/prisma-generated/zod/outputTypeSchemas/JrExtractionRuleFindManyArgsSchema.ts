import { z } from 'zod';
import type { Prisma } from '../../client';
import { JrExtractionRuleIncludeSchema } from '../inputTypeSchemas/JrExtractionRuleIncludeSchema';
import { JrExtractionRuleWhereInputSchema } from '../inputTypeSchemas/JrExtractionRuleWhereInputSchema';
import { JrExtractionRuleOrderByWithRelationInputSchema } from '../inputTypeSchemas/JrExtractionRuleOrderByWithRelationInputSchema';
import { JrExtractionRuleWhereUniqueInputSchema } from '../inputTypeSchemas/JrExtractionRuleWhereUniqueInputSchema';
import { JrExtractionRuleScalarFieldEnumSchema } from '../inputTypeSchemas/JrExtractionRuleScalarFieldEnumSchema';
import { JollyRogerArgsSchema } from '../outputTypeSchemas/JollyRogerArgsSchema';
import { JrFindReplaceRejectFindManyArgsSchema } from '../outputTypeSchemas/JrFindReplaceRejectFindManyArgsSchema';
import { JrExtractionRuleCountOutputTypeArgsSchema } from '../outputTypeSchemas/JrExtractionRuleCountOutputTypeArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const JrExtractionRuleSelectSchema: z.ZodType<Prisma.JrExtractionRuleSelect> = z
  .object({
    id: z.boolean().optional(),
    jollyRogerId: z.boolean().optional(),
    fieldName: z.boolean().optional(),
    isActive: z.boolean().optional(),
    selectors: z.boolean().optional(),
    mustContain: z.boolean().optional(),
    cannotContain: z.boolean().optional(),
    lastSuccessfulSelector: z.boolean().optional(),
    successRate: z.boolean().optional(),
    lastTestedAt: z.boolean().optional(),
    notes: z.boolean().optional(),
    jollyRoger: z.union([z.boolean(), z.lazy(() => JollyRogerArgsSchema)]).optional(),
    findReplaceRules: z
      .union([z.boolean(), z.lazy(() => JrFindReplaceRejectFindManyArgsSchema)])
      .optional(),
    _count: z
      .union([z.boolean(), z.lazy(() => JrExtractionRuleCountOutputTypeArgsSchema)])
      .optional(),
  })
  .strict();

export const JrExtractionRuleFindManyArgsSchema: z.ZodType<Prisma.JrExtractionRuleFindManyArgs> = z
  .object({
    select: JrExtractionRuleSelectSchema.optional(),
    include: z.lazy(() => JrExtractionRuleIncludeSchema).optional(),
    where: JrExtractionRuleWhereInputSchema.optional(),
    orderBy: z
      .union([
        JrExtractionRuleOrderByWithRelationInputSchema.array(),
        JrExtractionRuleOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: JrExtractionRuleWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([JrExtractionRuleScalarFieldEnumSchema, JrExtractionRuleScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export default JrExtractionRuleFindManyArgsSchema;
